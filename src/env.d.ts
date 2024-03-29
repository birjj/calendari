/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Used to sign and encrypt JWT's */
  JWT_SIGNING_KEY?: string;
  /** Used by GitHub for OAuth2 social login */
  GITHUB_CLIENT_ID?: string;
  /** Used by GitHub for OAuth2 social login */
  GITHUB_CLIENT_SECRET?: string;
  /** If set to a comma-delimited list of emails, only allow those users to sign up */
  CALENDARI_AUTH_WHITELIST?: string;
}

interface Response {
  friendlyTitle?: string;
  friendlyDescription?: string;
}