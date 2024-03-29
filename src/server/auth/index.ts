import type { Provider } from "./auth";
import GitHubProvider from "./github-provider";

// get the root URL for our app - supports GitHub Codespaces
const ROOT_URL = process.env["CODESPACE_NAME"] ?
  `https://${process.env["CODESPACE_NAME"]}-8888.${process.env["GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"]}`
  : process.env["URL"];
if (!ROOT_URL) {
  throw new Error("The URL env variable isn't set. Authentication won't work as expected.");
}

export const ROUTE_PREFIX = "/api/auth";
export const getProviderUrls = (name: string, csrf = "") => {
  const csrfSearch = csrf ? `?csrf=${encodeURIComponent(csrf)}` : "";
  return {
    begin: `${ROOT_URL}/auth/${name.toLowerCase()}${csrfSearch}`,
    return:
      `${ROOT_URL}/auth/return/${name.toLowerCase()}${csrfSearch}`,
  };
};

export const AUTH_PROVIDERS: Provider[] = [GitHubProvider].filter(
  (v) => v.enabled
);
