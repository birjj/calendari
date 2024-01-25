import type { APIRoute } from "astro";
import type { Icon } from "astro-icon/components";

export type Provider = {
  enabled: boolean;
  icon: Icon;
  name: string;
  handle: APIRoute;
  handleReturn: APIRoute;
};
