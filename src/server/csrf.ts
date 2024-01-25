import type { AstroCookies } from "astro";
import { getDataFromJWT, getSignedJWT } from "./jwt";
import randomString from "@utils/random-string";

/** Gets the CSRF token stored in the browser cookies */
export const getCsrf = async (cookies: AstroCookies) => {
  if (cookies.has("calendari:csrf")) {
    try {
      const payload = await getDataFromJWT(
        cookies.get("calendari:csrf")!.value
      );
      return (payload.csrf as string) ?? null;
    } catch (e) {
      console.warn("JWT token failed to verify:", e);
      return null;
    }
  }
  return null;
};

/** Sets the CSRF token in the browser cookies, and returns its new value */
export const setCsrf = async (cookies: AstroCookies) => {
  const csrf = randomString(8);
  const jwt = await getSignedJWT({ csrf }, "1h");
  cookies.set("calendari:csrf", jwt, {
    sameSite: "strict",
    secure: true,
    httpOnly: false,
    maxAge: 3600000, // 1h
  });
  return csrf;
};
