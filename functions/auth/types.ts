import type {
  HandlerContext,
  HandlerEvent,
  HandlerResponse,
} from "@netlify/functions";
import type { Icon } from "astro-icon/components";

export type Provider = {
  enabled: boolean;
  icon: Icon;
  name: string;
  uri: string;
  handle: (
    event: HandlerEvent,
    context: HandlerContext,
    response: HandlerResponse
  ) => Promise<HandlerResponse>;
  handleReturn: (
    event: HandlerEvent,
    context: HandlerContext,
    response: HandlerResponse
  ) => Promise<HandlerResponse>;
};
