import { jwtVerify } from "jose";
import type { Provider } from "./auth.d.ts";
import { getProviderUrls } from "./index.ts";
import randomString from "@utils/random-string.ts";
import { getSignedJWT } from "@server/jwt.ts";
import { Forbidden, HTMLRedirect } from "@server/responses.ts";

const CLIENT_ID = process.env["GITHUB_CLIENT_ID"];
const CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"];
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn(
    "You do not have GitHub env variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set up. It will be disabled as an auth provider."
  );
}
const JWT_SIGNING_KEY = process.env["JWT_SIGNING_KEY"]
  ? new TextEncoder().encode(process.env["JWT_SIGNING_KEY"])
  : null;
if (!JWT_SIGNING_KEY) {
  console.warn(
    "You do not have a signing key set in env variable JWT_SIGNING_KEY. GitHub will be disabled as an auth provider."
  );
}

const GitHubProvider: Provider = {
  enabled: Boolean(CLIENT_ID && CLIENT_SECRET && JWT_SIGNING_KEY),
  name: "GitHub",
  icon: "mdi:github",
  async handle(context) {
    // generate the URI we'll redirect our users to for OAuth2 login
    const initiateUri = new URL("https://github.com/login/oauth/authorize");
    initiateUri.searchParams.set("client_id", CLIENT_ID!);
    initiateUri.searchParams.set(
      "redirect_uri",
      getProviderUrls("GitHub").return
    );
    initiateUri.searchParams.set("scope", "user:email");
    // generate a state so we can be (more) sure the token was issued to us
    const state = randomString(8);
    initiateUri.searchParams.set("state", state);
    const jwt = await getSignedJWT({ state }, "1h");
    // finally respond with the JWT in a cookie and an in-HTML redirect (because not all browsers support cookies on redirects)
    context.cookies.set("calendari:github", jwt, {
      secure: true,
      httpOnly: true,
      maxAge: 3600000, // 1h
      sameSite: "none",
    });
    return HTMLRedirect(initiateUri.toString());
  },
  async handleReturn(context) {
    // verify that our state is as we expect, and no CSRF fuckery is going on
    let state = "";
    const jwt = context.cookies.get("calendari:github")?.value;
    if (!jwt) {
      console.log("No state cookie present");
      return Forbidden(`No state cookie present`);
    }
    try {
      const { payload } = await jwtVerify(jwt, JWT_SIGNING_KEY!);
      state = `${payload["state"]}`;
    } catch (e) {
      console.warn("State cookie failed to verify", e);
      return Forbidden(`State cookie failed to verify: ${e}`);
    }
    if (!state || state !== context.url.searchParams.get("state")) {
      console.warn(
        `State failed to match (${state} !== ${context.url.searchParams.get(
          "state"
        )})`
      );
      return Forbidden(`State failed to match`);
    }

    // then exchange the token for a valid one from GitHub
    const code = context.url.searchParams.get("code");
    const ghResponse = await (
      await fetch(`https://github.com/login/oauth/access_token`, {
        method: "POST",
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    ).json();
    const ghAccessToken = ghResponse?.access_token;
    if (!ghAccessToken) {
      console.warn("Invalid response from GitHub:", ghResponse);
      return Forbidden(
        "Something went wrong while verifying login. Please try again"
      );
    }
    console.log("Fetching emails with code", ghAccessToken);
    const emails = (await (
      await fetch("https://api.github.com/user/emails", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ghAccessToken}`,
          Accept: "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
    ).json()) as { email: string; primary: boolean }[] | undefined | null;
    console.log("Got emails", emails);
    const email = emails?.find((e) => e.primary)?.email;
    return new Response(`Using email ${JSON.stringify(email)}`, {
      status: 200,
    });
  },
};
export default GitHubProvider;
