/** Returns the value of a given cookie. Intended to be used on the client. */
export default function getCookie(name: string) {
  if (typeof document === "undefined" || !document?.cookie) {
    return null;
  }
  var prefix = name + "=";
  var cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    while (cookie.charAt(0) == " ") cookie = cookie.substring(1, cookie.length);
    if (cookie.indexOf(prefix) == 0)
      return cookie.substring(prefix.length, cookie.length);
  }
  return null;
}
