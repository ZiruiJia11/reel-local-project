import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks =
  vi.hoisted(() => ({
    tenantFindFirst:
      vi.fn(),
    movieCreate:
      vi.fn(),
    movieUpdate:
      vi.fn(),
    movieDelete:
      vi.fn(),
    movieFindUnique:
      vi.fn(),
    bookingFindMany:
      vi.fn(),
    bookingDeleteMany:
      vi.fn(),
    showtimeCreate:
      vi.fn(),
    showtimeUpdate:
      vi.fn(),
    showtimeDelete:
      vi.fn(),
    showtimeDeleteMany:
      vi.fn(),
  }))

vi.mock(
  "../db/prisma",
  () => ({
    prisma: {
      tenant: {
        findFirst:
          mocks.tenantFindFirst,
      },
      movie: {
        create:
          mocks.movieCreate,
        update:
          mocks.movieUpdate,
        delete:
          mocks.movieDelete,
        findUnique:
          mocks.movieFindUnique,
      },
      booking: {
        findMany:
          mocks.bookingFindMany,
        deleteMany:
          mocks.bookingDeleteMany,
      },
      showtime: {
        create:
          mocks.showtimeCreate,
        update:
          mocks.showtimeUpdate,
        delete:
          mocks.showtimeDelete,
        deleteMany:
          mocks.showtimeDeleteMany,
      },
    },
  }),
)

import {
  cancelAnyBooking,
  createMovie,
  createShowtime,
  deleteMovie,
  deleteShowtime,
  getAdminBookings,
  updateMovie,
  updateShowtime,
} from "./adminService"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("adminService", () => {
  it("creates a movie for the first tenant", async () => {
    const tenant = {
      id: "tenant-1",
    }

    const movie = {
      id: "movie-1",
      title: "New Movie",
      showtimes: [],
    }

    mocks.tenantFindFirst.mockResolvedValue(tenant)
    mocks.movieCreate.mockResolvedValue(movie)

    await expect(
      createMovie({
        title: "New Movie",
        image: "/movies/new.jpg",
        genre: "Drama",
        duration: "100 min",
        description: "A new movie.",
      }),
    ).resolves.toEqual(movie)

    expect(
      mocks.movieCreate,
    ).toHaveBeenCalledWith({
      data: {
        title: "New Movie",
        image: "/movies/new.jpg",
        genre: "Drama",
        duration: "100 min",
        description: "A new movie.",
        tenantId: "tenant-1",
      },
      include: {
        showtimes: true,
      },
    })
  })

  it("rejects creating a movie with missing fields", async () => {
    await expect(
      createMovie({
        title: "Missing Image",
      }),
    ).rejects.toThrow(
      "All movie fields are required",
    )
  })

  it("rejects creating a movie when no tenant exists", async () => {
    mocks.tenantFindFirst.mockResolvedValue(null)

    await expect(
      createMovie({
        title: "New Movie",
        image: "/movies/new.jpg",
        genre: "Drama",
        duration: "100 min",
        description: "A new movie.",
      }),
    ).rejects.toThrow(
      "Tenant not found",
    )
  })


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

  it("deletes a movie and its related data", async () => {
    const movie = {
      id: "movie-1",
    }

    mocks.movieDelete.mockResolvedValue(movie)

    await expect(
      deleteMovie("movie-1"),
    ).resolves.toEqual(movie)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        movieId: "movie-1",
      },
    })

    expect(
      mocks.showtimeDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        movieId: "movie-1",
      },
    })
  })

  it("creates a showtime for a movie", async () => {
    const showtime = {
      id: "showtime-1",
    }

    mocks.movieFindUnique.mockResolvedValue({
      id: "movie-1",
      tenantId: "tenant-1",
    })
    mocks.showtimeCreate.mockResolvedValue(showtime)

    await expect(
      createShowtime(
        "movie-1",
        {
          startsAt: "2026-07-03T18:30",
          capacity: 40,
        },
      ),
    ).resolves.toEqual(showtime)

    expect(
      mocks.showtimeCreate,
    ).toHaveBeenCalledWith({
      data: {
        movieId: "movie-1",
        tenantId: "tenant-1",
        startsAt:
          new Date("2026-07-03T18:30"),
        capacity: 40,
      },
    })
  })

  it("rejects creating a showtime without a date", async () => {
    await expect(
      createShowtime(
        "movie-1",
        {
          capacity: 40,
        },
      ),
    ).rejects.toThrow(
      "Showtime date is required",
    )
  })

  it("rejects creating a showtime with invalid capacity", async () => {
    await expect(
      createShowtime(
        "movie-1",
        {
          startsAt: "2026-07-03T18:30",
          capacity: 0,
        },
      ),
    ).rejects.toThrow(
      "Capacity must be at least 1",
    )
  })

  it("rejects creating a showtime for a missing movie", async () => {
    mocks.movieFindUnique.mockResolvedValue(null)

    await expect(
      createShowtime(
        "movie-1",
        {
          startsAt: "2026-07-03T18:30",
          capacity: 40,
        },
      ),
    ).rejects.toThrow(
      "Movie not found",
    )
  })

  it("updates a showtime", async () => {
    const showtime = {
      id: "showtime-1",
    }

    mocks.showtimeUpdate.mockResolvedValue(showtime)

    await expect(
      updateShowtime(
        "showtime-1",
        {
          startsAt: "2026-07-04T20:00",
          capacity: 35,
        },
      ),
    ).resolves.toEqual(showtime)

    expect(
      mocks.showtimeUpdate,
    ).toHaveBeenCalledWith({
      where: {
        id: "showtime-1",
      },
      data: {
        startsAt:
          new Date("2026-07-04T20:00"),
        capacity: 35,
      },
    })
  })

  it("rejects invalid showtime capacity", async () => {
    await expect(
      updateShowtime(
        "showtime-1",
        {
          capacity: 0,
        },
      ),
    ).rejects.toThrow(
      "Capacity must be at least 1",
    )
  })

  it("rejects empty showtime updates", async () => {
    await expect(
      updateShowtime(
        "showtime-1",
        {},
      ),
    ).rejects.toThrow(
      "No showtime updates provided",
    )
  })

  it("deletes a showtime and its bookings", async () => {
    const showtime = {
      id: "showtime-1",
    }

    mocks.showtimeDelete.mockResolvedValue(showtime)

    await expect(
      deleteShowtime("showtime-1"),
    ).resolves.toEqual(showtime)

    expect(
      mocks.bookingDeleteMany,
    ).toHaveBeenCalledWith({
      where: {
        showtimeId: "showtime-1",
      },
    })
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
