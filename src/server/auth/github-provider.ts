import { jwtVerify } from "jose";
import type { Provider } from "./auth.d.ts";
import { getProviderUrls, setLoggedInUser } from "./index.ts";
import randomString from "@utils/random-string.ts";
import { getSignedJWT } from "@server/jwt.ts";
import { BadRequest, Forbidden, HTMLRedirect } from "@server/responses.ts";
import type { APIContext } from "astro";

const CLIENT_ID = process.env["GITHUB_CLIENT_ID"];
const CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"];
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn(
    "[auth.github] You do not have GitHub env variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set up. It will be disabled as an auth provider."
  );
}
const JWT_SIGNING_KEY = process.env["JWT_SIGNING_KEY"]
  ? new TextEncoder().encode(process.env["JWT_SIGNING_KEY"])
  : null;
if (!JWT_SIGNING_KEY) {
  console.warn(
    "[auth.github] You do not have a signing key set in env variable JWT_SIGNING_KEY. GitHub will be disabled as an auth provider."
  );
}

const STATE_COOKIE_NAME = "calendari:github:state";

/** Gets the URI we want to redirect users to, to start the OAuth process */
const getGitHubOauthUri = () => {
  const initiateUri = new URL("https://github.com/login/oauth/authorize");
  initiateUri.searchParams.set("client_id", CLIENT_ID!);
  initiateUri.searchParams.set(
    "redirect_uri",
    getProviderUrls("GitHub").return
  );
  initiateUri.searchParams.set("scope", "user:email");
  return initiateUri;
};

/** Verifies that the state matches when the user returns from the OAuth process */
const verifyGitHubOauthState = async (context: APIContext) => {
  let state = "";
  const jwt = context.cookies.get(STATE_COOKIE_NAME)?.value;
  if (!jwt) {
    console.warn("[auth.github] No state cookie present");
    throw new Error("No state cookie present");
  }
  try {
    const { payload } = await jwtVerify(jwt, JWT_SIGNING_KEY!);
    state = `${payload["state"]}`;
  } catch (e) {
    console.warn("[auth.github] State cookie failed to verify", e);
    throw new Error("State cookie failed to verify");
  }
  if (!state || state !== context.url.searchParams.get("state")) {
    console.warn(
      `[auth.github] State failed to match (${state} !== ${context.url.searchParams.get(
        "state"
      )})`
    );
    throw new Error("State failed to match");
  }
  return [true, ""];
};

/** Completes the process after the user returns from the OAuth process, by exchanging the code for a token, and then using that token to get user information */
const getEmailsFromGitHub = async (context: APIContext) => {
  if (context.url.searchParams.get("error")) {
    console.warn(
      "[auth.github] An error occurred when returning from GitHub:",
      {
        error: context.url.searchParams.get("error"),
        description: context.url.searchParams.get("error_description"),
        uri: context.url.searchParams.get("error_uri"),
      }
    );
    throw new Error(
      `The response from GitHub indicates that an error occurred ("${context.url.searchParams.get(
        "error"
      )}"). Please try again.`
    );
  }
  const code = context.url.searchParams.get("code");
  if (!code) {
    console.warn("[auth.github] No code in search params");
    throw new Error(
      "The response from GitHub doesn't contain a code. Something went wrong in the authentication flow. Please try again."
    );
  }
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
    console.warn("[auth.github] Invalid response from GitHub:", ghResponse);
    throw new Error(
      "Couldn't authenticate the given code with GitHub. Please try again."
    );
  }
  console.log("[auth.github] Fetching emails with code", ghAccessToken);
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
  return emails;
};

/** The Provider exposes a uniform interface for authentication to happen through */
const GitHubProvider: Provider = {
  enabled: Boolean(CLIENT_ID && CLIENT_SECRET && JWT_SIGNING_KEY),
  name: "GitHub",
  icon: "mdi:github",
  /** Handles the login request, by redirecting the user to GitHub OAuth2 login */
  async handle(context) {
    // generate the URI we'll redirect our users to for OAuth2 login
    const initiateUri = getGitHubOauthUri();
    // generate a state so we can be (more) sure the token was issued to us
    const state = randomString(8);
    initiateUri.searchParams.set("state", state);
    const jwt = await getSignedJWT({ state }, "1h");
    // finally respond with the JWT in a cookie and redirect the user
    context.cookies.set(STATE_COOKIE_NAME, jwt, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60, // 1h
      path: "/",
      sameSite: "lax",
    });
    return context.redirect(initiateUri.toString());
  },
  async handleReturn(context) {
    // verify that our state is as we expect, and no CSRF fuckery is going on
    try {
      await verifyGitHubOauthState(context);
    } catch (e) {
      return BadRequest(e instanceof Error ? e.message : `${e}`);
    }

    // then exchange the token for a valid one from GitHub
    let emails: Awaited<ReturnType<typeof getEmailsFromGitHub>> = [];
    try {
      emails = await getEmailsFromGitHub(context);
    } catch (e) {
      return BadRequest(e instanceof Error ? e.message : `${e}`);
    }
    const email = emails?.find((e) => e.primary)?.email;
    if (!email) {
      return BadRequest("Couldn't get primary e-mail from the given user");
    }
    console.log("[auth.github] User", email, "logged in");
    await setLoggedInUser(context, email);
    return context.redirect("/app");
  },
};
export default GitHubProvider;
