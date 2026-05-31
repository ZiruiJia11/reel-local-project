import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getMovies } from "../services/movieApi"

import type { Movie } from "../types/Movie"

import "./Movies.css"

function Movies() {
  const navigate = useNavigate()

  const [movies, setMovies] =
    useState<Movie[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    async function loadMovies() {

      try {

        const data =
          await getMovies()

        setMovies(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

    loadMovies()

  }, [])

  if (loading) {

    return (
      <h1>
        Loading movies...
      </h1>
    )

  }

  return (
    <div className="movie-grid">

      {
        movies.map((movie) => (

          <div
            key={movie.id}
            className="movie-card"
            onClick={() =>
              navigate(
                `/movies/${movie.id}`
              )
            }
          >

            <img
              src={movie.image}
              alt={movie.title}
            />

            <h2>
              {movie.title}
            </h2>

          </div>

        ))
      }

    </div>
  )
}

export default Movies