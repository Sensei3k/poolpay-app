import { describe, expect, it } from "vitest";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";

function encodeJwt(payload: object): string {
  const head = Buffer.from('{"alg":"RS256","typ":"JWT"}').toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${head}.${body}.sig`;
}

describe("readJwtExpSecs", () => {
  it("extracts a numeric exp claim", () => {
    const jwt = encodeJwt({ sub: "user:abc", exp: 1700000900, iat: 1700000000 });
    expect(readJwtExpSecs(jwt)).toBe(1700000900);
  });

  it("returns null when exp is missing", () => {
    const jwt = encodeJwt({ sub: "user:abc" });
    expect(readJwtExpSecs(jwt)).toBeNull();
  });

  it("returns null when exp is not a number", () => {
    const jwt = encodeJwt({ sub: "user:abc", exp: "soon" });
    expect(readJwtExpSecs(jwt)).toBeNull();
  });

  it("returns null when the JWT is not three parts", () => {
    expect(readJwtExpSecs("not.a.jwt.at.all")).toBeNull();
    expect(readJwtExpSecs("onlyone")).toBeNull();
  });

  it("returns null when the payload is not valid JSON", () => {
    const jwt = `aGVhZA.$$.sig`;
    expect(readJwtExpSecs(jwt)).toBeNull();
  });
});
