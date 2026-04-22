import { describe, expect, it } from "vitest";
import {
  AUTH_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  SERVICE_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
  parseRetryAfter,
  statusFromActionError,
} from "@/app/(app)/account/change-password/status-machine";

describe("parseRetryAfter", () => {
  it("reads a numeric Retry-After header", () => {
    const headers = new Headers({ "Retry-After": "23" });
    expect(parseRetryAfter(headers)).toBe(23);
  });

  it("returns null when the header is missing", () => {
    expect(parseRetryAfter(new Headers())).toBeNull();
  });

  it("returns null when the header is not a positive integer", () => {
    expect(parseRetryAfter(new Headers({ "Retry-After": "0" }))).toBeNull();
    expect(parseRetryAfter(new Headers({ "Retry-After": "-5" }))).toBeNull();
    expect(parseRetryAfter(new Headers({ "Retry-After": "soon" }))).toBeNull();
  });

  it("returns null when headers themselves are undefined", () => {
    expect(parseRetryAfter(undefined)).toBeNull();
  });
});

describe("statusFromActionError", () => {
  it("maps bad_current to an auth-error with the canonical copy", () => {
    const status = statusFromActionError("bad_current");
    expect(status).toEqual({ kind: "auth-error", message: AUTH_ERROR_MESSAGE });
  });

  it("maps rate_limited with a Retry-After to rate-limited with seconds", () => {
    const status = statusFromActionError("rate_limited", 42);
    expect(status).toEqual({ kind: "rate-limited", retryAfterSecs: 42 });
  });

  it("maps rate_limited without a Retry-After to rate-limited with null", () => {
    const status = statusFromActionError("rate_limited");
    expect(status).toEqual({ kind: "rate-limited", retryAfterSecs: null });
  });

  it("maps backend_unavailable to network-error", () => {
    const status = statusFromActionError("backend_unavailable");
    expect(status).toEqual({
      kind: "network-error",
      message: NETWORK_ERROR_MESSAGE,
    });
  });

  it("maps validation drift to network-error with validation copy", () => {
    const status = statusFromActionError("validation");
    expect(status).toEqual({
      kind: "network-error",
      message: VALIDATION_ERROR_MESSAGE,
    });
  });

  it("maps service errors to network-error with service copy", () => {
    const status = statusFromActionError("service");
    expect(status).toEqual({
      kind: "network-error",
      message: SERVICE_ERROR_MESSAGE,
    });
  });
});
