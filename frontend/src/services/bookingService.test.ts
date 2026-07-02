import { afterEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import {
  addBooking,
  cancelBooking,
  clearBookings,
  getBookings,
} from "./bookingService"

afterEach(() => {
  vi.restoreAllMocks()
})

function mockToken() {
  const storage = new Map<string, string>()

  storage.set(
    "reel-local-token",
    "test-token",
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

describe("bookingService", () => {
  it("fetches bookings from the backend API", async () => {
    mockToken()

    const bookings = [
      {
        id: "booking-1",
        movie: {
          title: "Citizen Kane",
        },
      },
    ]

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => bookings,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(getBookings()).resolves.toEqual(bookings)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
      {
        headers: {
          Authorization:
            "Bearer test-token",
        },
      },
    )
  })

  it("creates a booking for a movie", async () => {
    mockToken()

    const booking = {
      id: "booking-1",
      movieId: "movie-1",
      showtimeId: "showtime-1",
      ticketCount: 2,
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => booking,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      addBooking(
        "movie-1",
        "showtime-1",
        2,
      ),
    ).resolves.toEqual(booking)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer test-token",
        },

        body: JSON.stringify({
          movieId: "movie-1",
          showtimeId: "showtime-1",
          ticketCount: 2,
        }),
      },
    )
  })

  it("clears all bookings", async () => {
    mockToken()

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
      })

    vi.stubGlobal("fetch", fetchMock)

    await clearBookings()

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer test-token",
        },
      },
    )
  })

  it("cancels one booking", async () => {
    mockToken()

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
      })

    vi.stubGlobal("fetch", fetchMock)

    await cancelBooking("booking-1")

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings/booking-1`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer test-token",
        },
      },
    )
  })

  it("throws the backend error message when booking fails", async () => {
    mockToken()

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: "Authentication required",
        }),
      }),
    )

    await expect(
      addBooking(
        "movie-1",
        "showtime-1",
        2,
      ),
    ).rejects.toThrow(
      "Authentication required",
    )
  })
})
