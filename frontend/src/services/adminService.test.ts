import { afterEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import {
  cancelAdminBooking,
  getAdminBookings,
  updateMovie,
} from "./adminService"

afterEach(() => {
  vi.restoreAllMocks()
})

function mockToken() {
  const storage =
    new Map<string, string>()

  storage.set(
    "reel-local-token",
    "admin-token",
  )

  vi.stubGlobal(
    "localStorage",
    {
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
}

describe("adminService", () => {
  it("updates a movie", async () => {
    mockToken()

    const movie = {
      id: "movie-1",
      title: "Updated Movie",
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => movie,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      updateMovie(
        "movie-1",
        {
          title: "Updated Movie",
          image: "/movie.jpg",
          genre: "Drama",
          duration: "100 min",
          description: "Updated description",
        },
      ),
    ).resolves.toEqual(movie)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/movies/movie-1`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer admin-token",
        },
        body: JSON.stringify({
          title: "Updated Movie",
          image: "/movie.jpg",
          genre: "Drama",
          duration: "100 min",
          description: "Updated description",
        }),
      },
    )
  })

  it("fetches admin bookings", async () => {
    mockToken()

    const bookings = [
      {
        id: "booking-1",
      },
    ]

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => bookings,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      getAdminBookings(),
    ).resolves.toEqual(bookings)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/bookings`,
      {
        headers: {
          Authorization:
            "Bearer admin-token",
        },
      },
    )
  })

  it("cancels an admin booking", async () => {
    mockToken()

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
      })

    vi.stubGlobal("fetch", fetchMock)

    await cancelAdminBooking(
      "booking-1",
    )

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/bookings/booking-1`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer admin-token",
        },
      },
    )
  })
})
