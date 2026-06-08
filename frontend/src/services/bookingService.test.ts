import { afterEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import {
  addBooking,
  clearBookings,
  getBookings,
} from "./bookingService"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("bookingService", () => {
  it("fetches bookings from the backend API", async () => {
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
        json: async () => bookings,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(getBookings()).resolves.toEqual(bookings)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
    )
  })

  it("creates a booking for a movie", async () => {
    const booking = {
      id: "booking-1",
      movieId: "movie-1",
    }

    const fetchMock =
      vi.fn().mockResolvedValue({
        json: async () => booking,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(
      addBooking("movie-1"),
    ).resolves.toEqual(booking)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          movieId: "movie-1",
        }),
      },
    )
  })

  it("clears all bookings", async () => {
    const fetchMock =
      vi.fn().mockResolvedValue({})

    vi.stubGlobal("fetch", fetchMock)

    await clearBookings()

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/bookings`,
      {
        method: "DELETE",
      },
    )
  })
})
