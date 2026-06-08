import { describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    findMany:
      vi.fn(),
  }))

vi.mock(
  "../db/prisma",
  () => ({
    prisma: {
      movie: {
        findMany:
          mocks.findMany,
      },
    },
  }),
)

import { getAllMovies } from "./movieService"

describe("getAllMovies", () => {
  it("returns movies from Prisma", async () => {
    const movies = [
      {
        id: "movie-1",
        title: "Citizen Kane",
        showtimes: [
          {
            id: "showtime-1",
            startsAt:
              new Date("2026-06-10T18:30:00.000Z"),
            capacity: 40,
            bookings: [
              {
                ticketCount: 2,
              },
              {
                ticketCount: 3,
              },
            ],
          },
        ],
      },
    ]

    mocks.findMany.mockResolvedValue(movies)

    await expect(
      getAllMovies(),
    ).resolves.toEqual([
      {
        id: "movie-1",
        title: "Citizen Kane",
        showtimes: [
          {
            id: "showtime-1",
            startsAt:
              new Date("2026-06-10T18:30:00.000Z"),
            capacity: 40,
            remainingTickets: 35,
          },
        ],
      },
    ])

    expect(
      mocks.findMany,
    ).toHaveBeenCalledWith({
      include: {
        showtimes: {
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
          orderBy: {
            startsAt: "asc",
          },
        },
      },
    })
  })
})
