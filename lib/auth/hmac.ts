import { createHmac } from "node:crypto";

const MIN_SECRET_BYTES = 32;

export type SignedHeaders = {
  signature: string;
  timestamp: string;
};

export function signBackendRequest(
  body: string,
  secret: string,
  now: () => number = Date.now,
): SignedHeaders {
  if (Buffer.byteLength(secret, "utf8") < MIN_SECRET_BYTES) {
    throw new Error(
      `NEXTAUTH_BACKEND_SECRET must be at least ${MIN_SECRET_BYTES} bytes`,
    );
  }

  const timestamp = Math.floor(now() / 1000).toString();
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");

  return { signature: `sha256=${digest}`, timestamp };
}
