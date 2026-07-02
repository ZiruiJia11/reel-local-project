import {
  useEffect,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import { getMovies } from "../services/movieApi"
import { showToast } from "../services/toastService"

import type { Movie } from "../types/Movie"

import "./Movies.css"

function formatNextShowtime(movie: Movie) {
  const nextShowtime =
    movie.showtimes[0]

  if (!nextShowtime) {
    return "No scheduled screenings"
  }

  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(nextShowtime.startsAt),
  )
}

function getMovieStatus(movie: Movie) {
  const firstShowtime =
    movie.showtimes[0]

  if (!firstShowtime) {
    return "Coming soon"
  }

  const daysUntil =
    (
      new Date(firstShowtime.startsAt).getTime() -
      Date.now()
    ) /
    86400000

  return daysUntil <= 2
    ? "Now showing"
    : "Coming soon"
}

function Movies() {
  const navigate =
    useNavigate()

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
      } catch {
        showToast(
          "Failed to load movies",
          "error",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadMovies()
  }, [])

  if (loading) {
    return (
      <h1>
        Loading movies...
      </h1>
    )
  }

  return (
    <div className="movies-page">
      <header className="movies-header">
        <div>
          <h1>
            Movies
          </h1>

          <p>
            Browse what is playing now and what is coming up next.
          </p>
        </div>
      </header>

      <div className="movie-info-list">
        {
          movies.map(movie => (
            <article
              className="movie-info-row"
              key={movie.id}
            >
              <img
                src={movie.image}
                alt={movie.title}
              />

              <div className="movie-info-copy">
                <div className="movie-info-title">
                  <h2>
                    {movie.title}
                  </h2>

                  <span>
                    {getMovieStatus(movie)}
                  </span>
                </div>

                <p>
                  {movie.genre} · {movie.duration}
                </p>

                <p>
                  {movie.description}
                </p>
              </div>

              <div className="movie-info-action">
                <strong>
                  {formatNextShowtime(movie)}
                </strong>

                <button
                  onClick={() =>
                    navigate(
                      `/movies/${movie.id}`,
                    )
                  }
                >
                  Details
                </button>
              </div>
            </article>
          ))
        }
      </div>
    </div>
  )
}

export default Movies
