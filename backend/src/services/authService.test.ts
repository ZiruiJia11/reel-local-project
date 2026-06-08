import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    userFindUnique:
      vi.fn(),
    userCreate:
      vi.fn(),
    tenantFindFirst:
      vi.fn(),
    hash:
      vi.fn(),
    compare:
      vi.fn(),
    sign:
      vi.fn(),
  }))

vi.mock(
  "../db/prisma",
  () => ({
    prisma: {
      user: {
        findUnique:
          mocks.userFindUnique,
        create:
          mocks.userCreate,
      },
      tenant: {
        findFirst:
          mocks.tenantFindFirst,
      },
    },
  }),
)

vi.mock(
  "bcrypt",
  () => ({
    default: {
      hash:
        mocks.hash,
      compare:
        mocks.compare,
    },
  }),
)

vi.mock(
  "jsonwebtoken",
  () => ({
    default: {
      sign:
        mocks.sign,
    },
  }),
)

import {
  loginUser,
  registerUser,
} from "./authService"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("authService", () => {
  it("registers a new user", async () => {
    const tenant = {
      id: "tenant-1",
    }

    const user = {
      id: "user-1",
      name: "Demo User",
      email: "demo@example.com",
      role: "USER",
    }

    mocks.userFindUnique.mockResolvedValue(null)
    mocks.tenantFindFirst.mockResolvedValue(tenant)
    mocks.hash.mockResolvedValue("hashed-password")
    mocks.userCreate.mockResolvedValue(user)

    await expect(
      registerUser(
        "Demo User",
        "demo@example.com",
        "password123",
      ),
    ).resolves.toEqual(user)

    expect(
      mocks.userCreate,
    ).toHaveBeenCalledWith({
      data: {
        name: "Demo User",
        email: "demo@example.com",
        password: "hashed-password",
        tenantId: "tenant-1",
      },
    })
  })

  it("rejects duplicate registration emails", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "existing-user",
    })

    await expect(
      registerUser(
        "Demo User",
        "demo@example.com",
        "password123",
      ),
    ).rejects.toThrow(
      "User already exists",
    )
  })

  it("rejects registration when no tenant exists", async () => {
    mocks.userFindUnique.mockResolvedValue(null)
    mocks.tenantFindFirst.mockResolvedValue(null)

    await expect(
      registerUser(
        "Demo User",
        "demo@example.com",
        "password123",
      ),
    ).rejects.toThrow("Tenant not found")
  })

  it("logs in a valid user and returns a token", async () => {
    const user = {
      id: "user-1",
      email: "demo@example.com",
      password: "hashed-password",
    }

    mocks.userFindUnique.mockResolvedValue(user)
    mocks.compare.mockResolvedValue(true)
    mocks.sign.mockReturnValue("jwt-token")

    await expect(
      loginUser(
        "demo@example.com",
        "password123",
      ),
    ).resolves.toEqual({
      token: "jwt-token",
      user,
    })

    expect(
      mocks.sign,
    ).toHaveBeenCalledWith(
      {
        userId: "user-1",
        email: "demo@example.com",
      },
      "development-secret",
      {
        expiresIn: "7d",
      },
    )
  })

  it("rejects login when the user is missing", async () => {
    mocks.userFindUnique.mockResolvedValue(null)

    await expect(
      loginUser(
        "demo@example.com",
        "password123",
      ),
    ).rejects.toThrow(
      "Invalid credentials",
    )
  })

  it("rejects login when the password is invalid", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
      password: "hashed-password",
    })

    mocks.compare.mockResolvedValue(false)

    await expect(
      loginUser(
        "demo@example.com",
        "wrong-password",
      ),
    ).rejects.toThrow(
      "Invalid credentials",
    )
  })
})
