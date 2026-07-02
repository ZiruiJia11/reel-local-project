import { describe, expect, it } from "vitest"

import { isAuthError } from "./apiError"

describe("isAuthError", () => {
  it("detects missing authentication", () => {
    expect(
      isAuthError(
        new Error("Authentication required"),
      ),
    ).toBe(true)
  })

  it("detects invalid tokens", () => {
    expect(
      isAuthError(
        new Error("Invalid token"),
      ),
    ).toBe(true)
  })

  it("ignores non-auth errors", () => {
    expect(
      isAuthError(
        new Error("Failed to book seat"),
      ),
    ).toBe(false)
  })
})
