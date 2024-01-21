import { SignJWT, jwtVerify } from "jose";
import type { Provider } from "./types";
import cookie from "cookie";
import randomString from "../../src/utils/random-string";

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
  uri: "/.netlify/functions/login?provider=github",
  async handle(event, context, response) {
    // generate the URI we'll redirect our users to for OAuth2 login
    const initiateUri = new URL("https://github.com/login/oauth/authorize");
    initiateUri.searchParams.set("client_id", CLIENT_ID!);
    initiateUri.searchParams.set(
      "redirect_uri",
      `${process.env["URL"]}/.netlify/functions/login-return?provider=github`
    );
    initiateUri.searchParams.set("scope", "user:email");
    const state = randomString(8);
    initiateUri.searchParams.set("state", state);
    // wrap it in a JWT token so we can verify it matches later
    const jwt = await new SignJWT({ "calendari:github:state": state })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SIGNING_KEY!);
    // finally respond with the JWT in a cookie and an in-HTML redirect (because not all browsers support cookies on redirects)
    const jwtCookie = cookie.serialize("calendari:github", jwt, {
      secure: true,
      httpOnly: true,
      maxAge: 3600000, // 1h
      sameSite: "none",
    });
    return {
      ...response,
      statusCode: 200,
      headers: {
        "Set-Cookie": jwtCookie,
        "Cache-Control": "no-cache",
        "Content-Type": "text/html",
      },
      body: `
        <html lang="en">
          <head>
            <meta charset="utf-8">
          </head>
          <body>
            <noscript>
              <meta http-equiv="refresh" content="0; url=${initiateUri.toString()}" />
            </noscript>
          </body>
          <script>
            setTimeout(function() {
              window.location.href = ${JSON.stringify(initiateUri.toString())}
            }, 0)
          </script>
        </html>
        `,
    };
  },
  async handleReturn(event, context, response) {
    // verify that there's no CSRF going on
    const jwt = cookie.parse(event.headers["cookie"] ?? "")["calendari:github"];
    let state = "";
    try {
      const { payload } = await jwtVerify(jwt, JWT_SIGNING_KEY!);
      console.log(payload);
      state = `${payload["calendari:github:state"]}`;
    } catch (e) {
      return {
        statusCode: 403,
        body: `State cookie failed to verify: ${e}`,
      };
    }
    if (!state || state !== event.queryStringParameters?.state) {
      console.log(state, event.queryStringParameters?.state);
      return {
        statusCode: 403,
        body: "State failed to match",
      };
    }

    // then exchange the token for a valid one from GitHub
    const code = event.queryStringParameters?.code;
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
      console.log("Invalid response from GitHub:", ghResponse);
      return {
        statusCode: 403,
        body: "Something went wrong while verifying login. Please try again",
      };
    }
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
    const email = emails?.find((e) => e.primary)?.email;
    return {
      statusCode: 200,
      body: `Using email ${JSON.stringify(email)}`,
    };
  },
};
export default GitHubProvider;
