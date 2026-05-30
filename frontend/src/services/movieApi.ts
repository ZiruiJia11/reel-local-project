import type { Movie } from "../types/Movie"

export async function getMovies(): Promise<Movie[]> {

  const response =
    await fetch(
      "http://localhost:3001/api/movies"
    )

  return response.json()
}