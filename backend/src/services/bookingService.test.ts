import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    tenantFindUnique:
      vi.fn(),
    userUpsert:
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
      tenant: {
        findUnique:
          mocks.tenantFindUnique,
      },
      user: {
        upsert:
          mocks.userUpsert,
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
  it("creates a booking for the demo tenant and user", async () => {
    const tenant = {
      id: "tenant-1",
      slug: "reel-local-demo",
    }

    const user = {
      id: "user-1",
      email: "demo@reellocal.com",
    }

    const booking = {
      id: "booking-1",
      movieId: "movie-1",
    }

    mocks.tenantFindUnique.mockResolvedValue(tenant)
    mocks.userUpsert.mockResolvedValue(user)
    mocks.bookingCreate.mockResolvedValue(booking)

    await expect(
      createBooking("movie-1"),
    ).resolves.toEqual(booking)

    expect(
      mocks.tenantFindUnique,
    ).toHaveBeenCalledWith({
      where: {
        slug: "reel-local-demo",
      },
    })

    expect(
      mocks.userUpsert,
    ).toHaveBeenCalledWith({
      where: {
        email: "demo@reellocal.com",
      },
      update: {},
      create: {
        name: "Demo User",
        email: "demo@reellocal.com",
        tenantId: "tenant-1",
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

  it("throws when the demo tenant is missing", async () => {
    mocks.tenantFindUnique.mockResolvedValue(null)

    await expect(
      createBooking("movie-1"),
    ).rejects.toThrow(
      "Demo tenant not found",
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
      getBookings(),
    ).resolves.toEqual(bookings)

    expect(
      mocks.bookingFindMany,
    ).toHaveBeenCalledWith({
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
      clearBookings(),
    ).resolves.toEqual(result)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith()
  })
})
