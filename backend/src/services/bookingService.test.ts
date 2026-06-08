import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    userFindUnique:
      vi.fn(),
    bookingCreate:
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
      user: {
        findUnique:
          mocks.userFindUnique,
      },
      booking: {
        create:
          mocks.bookingCreate,
        findMany:
          mocks.bookingFindMany,
        deleteMany:
          mocks.bookingDeleteMany,
      },
    },
  }),
)

import {
  clearBookings,
  createBooking,
  getBookings,
} from "./bookingService"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("bookingService", () => {
  it("creates a booking for the current user", async () => {
    const user = {
      id: "user-1",
      tenantId: "tenant-1",
    }

    const booking = {
      id: "booking-1",
      movieId: "movie-1",
    }

    mocks.userFindUnique.mockResolvedValue(user)
    mocks.bookingCreate.mockResolvedValue(booking)

    await expect(
      createBooking(
        "movie-1",
        "user-1",
      ),
    ).resolves.toEqual(booking)

    expect(
      mocks.userFindUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
    })

    expect(
      mocks.bookingCreate,
    ).toHaveBeenCalledWith({
      data: {
        tenantId: "tenant-1",
        userId: "user-1",
        movieId: "movie-1",
      },
      include: {
        movie: true,
      },
    })
  })

  it("throws when the user is missing", async () => {
    mocks.userFindUnique.mockResolvedValue(null)

    await expect(
      createBooking(
        "movie-1",
        "user-1",
      ),
    ).rejects.toThrow(
      "User not found",
    )
  })

  it("returns bookings with movie details", async () => {
    const bookings = [
      {
        id: "booking-1",
        movie: {
          title: "Citizen Kane",
        },
      },
    ]

    mocks.bookingFindMany.mockResolvedValue(bookings)

    await expect(
      getBookings("user-1"),
    ).resolves.toEqual(bookings)

    expect(
      mocks.bookingFindMany,
    ).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
      include: {
        movie: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  })

  it("clears bookings", async () => {
    const result = {
      count: 2,
    }

    mocks.bookingDeleteMany.mockResolvedValue(result)

    await expect(
      clearBookings("user-1"),
    ).resolves.toEqual(result)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
    })
  })
})
