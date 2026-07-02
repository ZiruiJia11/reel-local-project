import { afterEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import {
  cancelAdminBooking,
  createMovie,
  createShowtime,
  deleteMovie,
  deleteShowtime,
  getAdminBookings,
  updateMovie,
  updateShowtime,
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
  it("creates a movie", async () => {
    mockToken()

    const movie = {
      id: "movie-1",
      title: "New Movie",
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => movie,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      createMovie({
        title: "New Movie",
        image: "/movie.jpg",
        genre: "Drama",
        duration: "100 min",
        description: "New description",
      }),
    ).resolves.toEqual(movie)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/movies`,
      expect.objectContaining({
        method: "POST",
      }),
    )
  })

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

  it("deletes a movie", async () => {
    mockToken()

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
      })

    vi.stubGlobal("fetch", fetchMock)

    await deleteMovie("movie-1")

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/movies/movie-1`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer admin-token",
        },
      },
    )
  })

  it("creates a showtime", async () => {
    mockToken()

    const showtime = {
      id: "showtime-1",
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => showtime,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      createShowtime(
        "movie-1",
        {
          startsAt: "2026-07-03T18:30",
          capacity: 40,
        },
      ),
    ).resolves.toEqual(showtime)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/movies/movie-1/showtimes`,
      expect.objectContaining({
        method: "POST",
      }),
    )
  })

  it("updates a showtime", async () => {
    mockToken()

    const showtime = {
      id: "showtime-1",
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => showtime,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      updateShowtime(
        "showtime-1",
        {
          startsAt: "2026-07-04T20:00",
          capacity: 35,
        },
      ),
    ).resolves.toEqual(showtime)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/showtimes/showtime-1`,
      expect.objectContaining({
        method: "PATCH",
      }),
    )
  })

  it("deletes a showtime", async () => {
    mockToken()

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
      })

    vi.stubGlobal("fetch", fetchMock)

    await deleteShowtime("showtime-1")

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/admin/showtimes/showtime-1`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer admin-token",
        },
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
