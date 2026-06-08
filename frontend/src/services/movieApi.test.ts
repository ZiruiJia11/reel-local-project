import { afterEach, describe, expect, it, vi } from "vitest"

import { API_URL } from "../config/api"
import { getMovies } from "./movieApi"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getMovies", () => {
  it("fetches movies from the backend API", async () => {
    const movies = [
      {
        id: "movie-1",
        title: "Citizen Kane",
        image: "/movies/citizen_kane.jpg",
        genre: "Drama",
        duration: "119 min",
        description: "A classic drama.",
      },
    ]

    const fetchMock =
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => movies,
      })

    vi.stubGlobal("fetch", fetchMock)

    await expect(getMovies()).resolves.toEqual(movies)

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/movies`,
    )
  })

  it("throws an error when the movie request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    )

    await expect(getMovies()).rejects.toThrow(
      "Failed to fetch movies",
    )
  })
})
