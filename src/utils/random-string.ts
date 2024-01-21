/** Generates a random string (not cryptographically secure) */
export default function randomString(
  length: number,
  alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
) {
  let outp = "";
  for (let i = 0; i < length; ++i) {
    outp += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return outp;
}
