import { useEffect, useState } from "react"
import {
  useNavigate,
  useParams,
} from "react-router-dom"

import { getMovies } from "../services/movieApi"
import { addBooking } from "../services/bookingService"
import {
  getCurrentUser,
  logout,
} from "../services/authService"
import { isAuthError } from "../services/apiError"

import type { Movie } from "../types/Movie"

import "./MovieDetails.css"

function MovieDetails() {
  const { id } = useParams()

  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  const [movie, setMovie] =
    useState<Movie | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [bookingMessage, setBookingMessage] =
    useState("")

  useEffect(() => {
    async function loadMovie() {
      try {
        const movies =
          await getMovies()

        const selectedMovie =
          movies.find(
            item =>
              item.id === id
          )

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

    try {
      await addBooking(movie.id)

      setBookingMessage(
        "Seat booked"
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to book seat"

      setBookingMessage(message)

      if (isAuthError(error)) {
        logout()
        navigate("/login")
      }
    }
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
          bookingMessage &&
          (
            <p>
              {bookingMessage}
            </p>
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
