import { beforeEach, describe, expect, it, vi } from "vitest"
import type {
  NextFunction,
  Request,
  Response,
} from "express"

const mocks =
  vi.hoisted(() => ({
    verify:
      vi.fn(),
  }))

vi.mock(
  "jsonwebtoken",
  () => ({
    default: {
      verify:
        mocks.verify,
    },
  }),
)

import {
  authenticateUser,
} from "./authMiddleware"

function createResponse() {
  const res = {
    status:
      vi.fn(),
    json:
      vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as Response
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("authenticateUser", () => {
  it("adds the authenticated user to the request", () => {
    const req = {
      headers: {
        authorization:
          "Bearer valid-token",
      },
    } as Request

    const res =
      createResponse()

    const next =
      vi.fn() as NextFunction

    mocks.verify.mockReturnValue({
      userId: "user-1",
      email: "demo@example.com",
    })

    authenticateUser(
      req,
      res,
      next,
    )

    expect(req.user).toEqual({
      userId: "user-1",
      email: "demo@example.com",
      role: "USER",
    })

    expect(next).toHaveBeenCalled()
  })

  it("uses the role from the token when present", () => {
    const req = {
      headers: {
        authorization:
          "Bearer admin-token",
      },
    } as Request

    const res =
      createResponse()

    const next =
      vi.fn() as NextFunction

    mocks.verify.mockReturnValue({
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    })

    authenticateUser(
      req,
      res,
      next,
    )

    expect(req.user).toEqual({
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    })
  })


  it("rejects requests without a bearer token", () => {
    const req = {
      headers: {},
    } as Request

    const res =
      createResponse()

    const next =
      vi.fn() as NextFunction

    authenticateUser(
      req,
      res,
      next,
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: "Authentication required",
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects invalid tokens", () => {
    const req = {
      headers: {
        authorization:
          "Bearer invalid-token",
      },
    } as Request

    const res =
      createResponse()

    const next =
      vi.fn() as NextFunction

    mocks.verify.mockImplementation(() => {
      throw new Error("bad token")
    })

    authenticateUser(
      req,
      res,
      next,
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token",
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects tokens without user data", () => {
    const req = {
      headers: {
        authorization:
          "Bearer incomplete-token",
      },
    } as Request

    const res =
      createResponse()

    const next =
      vi.fn() as NextFunction

    mocks.verify.mockReturnValue({
      userId: "user-1",
    })

    authenticateUser(
      req,
      res,
      next,
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token",
    })
    expect(next).not.toHaveBeenCalled()
  })
})
