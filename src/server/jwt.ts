import { SignJWT, type JWTPayload, jwtVerify } from "jose";

const JWT_SIGNING_KEY = import.meta.env["JWT_SIGNING_KEY"]
  ? new TextEncoder().encode(import.meta.env["JWT_SIGNING_KEY"])
  : null;
if (!JWT_SIGNING_KEY) {
  console.warn(
    "The JWT_SIGNING_KEY env variable isn't set. JWT will not work as intended."
  );
}

/** Returns the string representation of a signed (but not encrypted) JWT of the given data */
export const getSignedJWT = async (
  data: JWTPayload,
  expirationTime: string | number | Date = "1h"
) => {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .sign(JWT_SIGNING_KEY!);
};

/** Verifies and parses the given signed JWT token. Will throw an error if the JWT fails to verify */
export const getDataFromJWT = async (jwt: string) => {
  const { payload } = await jwtVerify(jwt, JWT_SIGNING_KEY!);
  return payload;
};
