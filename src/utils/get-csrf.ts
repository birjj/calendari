import { decodeJwt } from "jose";
import getCookie from "./get-cookie";

/** Intended for use on the client side. Gets the content of the CSRF cookie */
export default function getCsrf() {
  const cookie = getCookie("calendari:csrf");
  if (!cookie) {
    return null;
  }
  try {
    return decodeJwt(cookie).csrf as string;
  } catch (e) {
    return null;
  }
}
