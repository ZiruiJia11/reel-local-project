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
      },
    ]

    mocks.findMany.mockResolvedValue(movies)

    await expect(
      getAllMovies(),
    ).resolves.toEqual(movies)

    expect(
      mocks.findMany,
    ).toHaveBeenCalledWith()
  })
})
