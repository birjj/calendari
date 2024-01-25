import type { Provider } from "./auth";
import GitHubProvider from "./github-provider";

export const ROUTE_PREFIX = "/api/auth";
export const getProviderUrls = (name: string, csrf = "") => {
  const csrfSearch = csrf ? `?csrf=${encodeURIComponent(csrf)}` : "";
  return {
    begin: `${process.env["URL"]}/api/auth/${name.toLowerCase()}` + csrfSearch,
    return:
      `${process.env["URL"]}/api/auth/return/${name.toLowerCase()}` +
      csrfSearch,
  };
};

export const AUTH_PROVIDERS: Provider[] = [GitHubProvider].filter(
  (v) => v.enabled
);
