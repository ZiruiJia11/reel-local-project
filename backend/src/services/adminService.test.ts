import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    movieUpdate:
      vi.fn(),
    bookingFindMany:
      vi.fn(),
    bookingDeleteMany:
      vi.fn(),
  }))

vi.mock(
  "../db/prisma",
  () => ({
    prisma: {
      movie: {
        update:
          mocks.movieUpdate,
      },
      booking: {
        findMany:
          mocks.bookingFindMany,
        deleteMany:
          mocks.bookingDeleteMany,
      },
    },
  }),
)

import {
  cancelAnyBooking,
  getAdminBookings,
  updateMovie,
} from "./adminService"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("adminService", () => {
  it("updates movie details", async () => {
    const movie = {
      id: "movie-1",
      title: "Updated Movie",
    }

    mocks.movieUpdate.mockResolvedValue(movie)

    await expect(
      updateMovie(
        "movie-1",
        {
          title: "Updated Movie",
          genre: "",
        },
      ),
    ).resolves.toEqual(movie)

    expect(
      mocks.movieUpdate,
    ).toHaveBeenCalledWith({
      where: {
        id: "movie-1",
      },
      data: {
        title: "Updated Movie",
      },
    })
  })

  it("rejects empty movie updates", async () => {
    await expect(
      updateMovie(
        "movie-1",
        {
          title: "   ",
        },
      ),
    ).rejects.toThrow(
      "No movie updates provided",
    )
  })

  it("returns admin bookings", async () => {
    const bookings = [
      {
        id: "booking-1",
      },
    ]

    mocks.bookingFindMany.mockResolvedValue(bookings)

    await expect(
      getAdminBookings(),
    ).resolves.toEqual(bookings)

    expect(
      mocks.bookingFindMany,
    ).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        movie: true,
        showtime: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  })

  it("cancels any booking by id", async () => {
    const result = {
      count: 1,
    }

    mocks.bookingDeleteMany.mockResolvedValue(result)

    await expect(
      cancelAnyBooking("booking-1"),
    ).resolves.toEqual(result)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        id: "booking-1",
      },
    })
  })
})
