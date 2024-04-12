import type { APIContext } from "astro";
import type { Provider } from "./auth";
import GitHubProvider from "./github-provider";
import { getDataFromJWT, getSignedJWT } from "@server/jwt";
import { jwtVerify } from "jose";

// get the root URL for our app - supports GitHub Codespaces
const ROOT_URL = process.env["CODESPACE_NAME"]
  ? `https://${process.env["CODESPACE_NAME"]}-8888.${process.env["GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"]}`
  : process.env["URL"];
if (!ROOT_URL) {
  throw new Error(
    "The URL env variable isn't set. Authentication won't work as expected."
  );
}

export const ROUTE_PREFIX = "/api/auth";
export const getProviderUrls = (name: string, csrf = "") => {
  const csrfSearch = csrf ? `?csrf=${encodeURIComponent(csrf)}` : "";
  return {
    begin: `${ROOT_URL}/auth/${name.toLowerCase()}${csrfSearch}`,
    return: `${ROOT_URL}/auth/return/${name.toLowerCase()}${csrfSearch}`,
  };
};

const USER_COOKIE_NAME = "calendari:auth";
/** Gets the username that was previously set by `getLoggedInUser`.
 * Throws an error if the cookie fails to verify, or the user isn't logged in. */
export const getLoggedInUser = async (context: APIContext): Promise<string> => {
  const jwt = context.cookies.get(USER_COOKIE_NAME)?.value;
  if (!jwt) {
    throw new Error("Not currently logged in");
  }
  try {
    const payload = await getDataFromJWT<{ user: string }>(jwt);
    if (!("user" in payload) || !payload.user) {
      throw new Error("Username wasn't found in verified auth cookie");
    }
    return payload.user;
  } catch (e) {
    throw new Error("Auth cookie failed to verify");
  }
};

/** Stores the given username as the logged in user.
 * Does no validation - should only be called after the user has been appropriately validated. */
export const setLoggedInUser = async (
  context: APIContext,
  username: string
) => {
  const jwt = await getSignedJWT({ user: username }, "14d");
  context.cookies.set(USER_COOKIE_NAME, jwt, {
    secure: true,
    httpOnly: true,
    maxAge: 14 * 24 * 1000 * 60 * 60, // 14d
    path: "/",
    sameSite: "lax",
  });
};

export const AUTH_PROVIDERS: Provider[] = [GitHubProvider].filter(
  (v) => v.enabled
);
