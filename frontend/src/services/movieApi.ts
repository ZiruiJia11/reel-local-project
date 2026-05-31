import type { Movie } from "../types/Movie"

const API_URL =
  "https://reel-local-project.onrender.com"

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