import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import {
  getCurrentUser,
  getToken,
  login,
  logout,
  register,
} from "./authService"

const user = {
  id: "user-1",
  name: "Demo User",
  email: "demo@example.com",
  role: "USER",
}

beforeEach(() => {
  const storage = new Map<string, string>()

  vi.stubGlobal(
    "localStorage",
    {
      clear: () => storage.clear(),
      getItem: (key: string) =>
        storage.get(key) || null,
      removeItem: (key: string) =>
        storage.delete(key),
      setItem: (
        key: string,
        value: string,
      ) => storage.set(
        key,
        value,
      ),
    },
  )

  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("authService", () => {
  it("registers a user with the backend API", async () => {
    const responseBody = {
      message: "User registered successfully",
      user,
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => responseBody,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      register(
        "Demo User",
        "demo@example.com",
        "password123",
      ),
    ).resolves.toEqual(responseBody)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: "Demo User",
          email: "demo@example.com",
          password: "password123",
        }),
      },
    )
  })

  it("throws an error when registration fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    )

    await expect(
      register(
        "Demo User",
        "demo@example.com",
        "password123",
      ),
    ).rejects.toThrow("Registration failed")
  })

  it("logs in a user and saves auth data", async () => {
    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "test-token",
          user,
        }),
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      login(
        "demo@example.com",
        "password123",
      ),
    ).resolves.toEqual(user)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "demo@example.com",
          password: "password123",
        }),
      },
    )

    expect(getToken()).toBe("test-token")
    expect(getCurrentUser()).toEqual(user)
  })

  it("throws an error when login fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    )

    await expect(
      login(
        "demo@example.com",
        "wrong-password",
      ),
    ).rejects.toThrow("Invalid credentials")
  })

  it("logs out the current user", () => {
    localStorage.setItem(
      "reel-local-token",
      "test-token",
    )

    localStorage.setItem(
      "reel-local-user",
      JSON.stringify(user),
    )

    logout()

    expect(getToken()).toBeNull()
    expect(getCurrentUser()).toBeNull()
  })
})
