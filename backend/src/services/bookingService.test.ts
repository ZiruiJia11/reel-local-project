import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    userFindUnique:
      vi.fn(),
    showtimeFindFirst:
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
      showtime: {
        findFirst:
          mocks.showtimeFindFirst,
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
  cancelBooking,
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
      showtimeId: "showtime-1",
      ticketCount: 2,
    }

    mocks.userFindUnique.mockResolvedValue(user)
    mocks.showtimeFindFirst.mockResolvedValue({
      id: "showtime-1",
      capacity: 40,
      bookings: [
        {
          ticketCount: 5,
        },
      ],
    })
    mocks.bookingCreate.mockResolvedValue(booking)

    await expect(
      createBooking(
        "movie-1",
        "user-1",
        "showtime-1",
        2,
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
      mocks.showtimeFindFirst,
    ).toHaveBeenCalledWith({
      where: {
        id: "showtime-1",
        movieId: "movie-1",
        tenantId: "tenant-1",
      },
      include: {
        bookings: {
          where: {
            status: "CONFIRMED",
          },
          select: {
            ticketCount: true,
          },
        },
      },
    })

    expect(
      mocks.bookingCreate,
    ).toHaveBeenCalledWith({
      data: {
        tenantId: "tenant-1",
        userId: "user-1",
        movieId: "movie-1",
        showtimeId: "showtime-1",
        ticketCount: 2,
      },
      include: {
        movie: true,
        showtime: true,
      },
    })
  })

  it("throws when the ticket count is invalid", async () => {
    await expect(
      createBooking(
        "movie-1",
        "user-1",
        "showtime-1",
        0,
      ),
    ).rejects.toThrow(
      "Ticket count must be between 1 and 10",
    )
  })

  it("throws when the user is missing", async () => {
    mocks.userFindUnique.mockResolvedValue(null)

    await expect(
      createBooking(
        "movie-1",
        "user-1",
        "showtime-1",
        1,
      ),
    ).rejects.toThrow(
      "User not found",
    )
  })

  it("throws when the showtime is missing", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      tenantId: "tenant-1",
    })

    mocks.showtimeFindFirst.mockResolvedValue(null)

    await expect(
      createBooking(
        "movie-1",
        "user-1",
        "showtime-1",
        1,
      ),
    ).rejects.toThrow(
      "Showtime not found",
    )
  })

  it("throws when there are not enough tickets", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      tenantId: "tenant-1",
    })

    mocks.showtimeFindFirst.mockResolvedValue({
      id: "showtime-1",
      capacity: 5,
      bookings: [
        {
          ticketCount: 4,
        },
      ],
    })

    await expect(
      createBooking(
        "movie-1",
        "user-1",
        "showtime-1",
        2,
      ),
    ).rejects.toThrow(
      "Not enough tickets available",
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
        showtime: true,
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

  it("cancels one booking for the current user", async () => {
    const result = {
      count: 1,
    }

    mocks.bookingDeleteMany.mockResolvedValue(result)

    await expect(
      cancelBooking(
        "booking-1",
        "user-1",
      ),
    ).resolves.toEqual(result)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        id: "booking-1",
        userId: "user-1",
      },
    })
  })

  it("treats an already missing booking as cancelled", async () => {
    const result = {
      count: 0,
    }

    mocks.bookingDeleteMany.mockResolvedValue(result)

    await expect(
      cancelBooking(
        "booking-2",
        "user-1",
      ),
    ).resolves.toEqual(result)
  })
})
