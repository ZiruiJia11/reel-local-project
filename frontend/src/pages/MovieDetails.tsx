import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { getMovies } from "../services/movieApi"
import { addBooking } from "../services/bookingService"
import { getCurrentUser } from "../services/authService"

import type { Movie } from "../types/Movie"

import "./MovieDetails.css"

function MovieDetails() {
  const { id } = useParams()

  const user =
    getCurrentUser()

  const [movie, setMovie] =
    useState<Movie | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function loadMovie() {
      try {
        const movies =
          await getMovies()

        console.log("Route id:", id)
        console.log("Movies from API:", movies)
        console.log(
         "Movie ids:",
          movies.map(movie => movie.id)
        )

        const selectedMovie =
          movies.find(
            item =>
              item.id === id
          )

        console.log("Selected movie:", selectedMovie)

        setMovie(
          selectedMovie || null
        )
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [id])

  async function handleBooking() {
    if (!movie) {
      return
    }

    console.log("Booking movie id:", movie.id)

    await addBooking(movie.id)

    alert("Seat booked")
  }

  if (loading) {
    return (
      <h1>
        Loading movie...
      </h1>
    )
  }

  if (!movie) {
    return (
      <h1>
        Movie not found
      </h1>
    )
  }

  return (
    <div className="movie-details">
      <img
        src={movie.image}
        alt={movie.title}
      />

      <div className="movie-details-content">
        <h1>
          {movie.title}
        </h1>

        <p className="movie-meta">
          {movie.genre} · {movie.duration}
        </p>

        <p className="movie-description">
          {movie.description}
        </p>

        {
          user &&
          (
            <button
              onClick={handleBooking}
            >
              Book a Seat
            </button>
          )
        }

        {
          !user &&
          (
            <p>
              Please log in to book a seat.
            </p>
          )
        }
      </div>
    </div>
  )
}

export default MovieDetails