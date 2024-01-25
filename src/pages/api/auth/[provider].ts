import { AUTH_PROVIDERS as providers } from "@server/auth";
import { NotFound } from "@server/responses";
import type { APIRoute } from "astro";

export const GET: APIRoute = (context) => {
  const providerName = context.params.provider;
  const provider = providers.find(
    (p) => p.enabled && p.name.toLowerCase() === `${providerName}`.toLowerCase()
  );
  if (!provider) {
    return NotFound(`No provider '${providerName}' found.`);
  }
  return provider.handle(context);
};
