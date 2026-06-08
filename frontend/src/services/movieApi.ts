import type { Movie } from "../types/Movie"
import { API_URL } from "../config/api"

export async function getMovies(): Promise<Movie[]> {
  const response =
    await fetch(
      `${API_URL}/api/movies`
    )

  if (!response.ok) {
    throw new Error(
      "Failed to fetch movies"
    )
  }

  return response.json()
}
