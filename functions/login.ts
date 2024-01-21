import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import GitHubProvider from "./auth/github";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const providerName = event.queryStringParameters?.provider?.toLowerCase();
  const providers = [GitHubProvider];
  for (const provider of providers) {
    if (!provider.enabled) {
      continue;
    }
    if (provider.name.toLowerCase() === providerName) {
      return await provider.handle(event, context, { statusCode: 500 });
    }
  }
  return {
    statusCode: 400,
    body: `No login provider available with name '${providerName ?? ""}'`,
  };
};
export default handler;
