import { useEffect, useMemo, useState } from "react"
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
import { showToast } from "../services/toastService"

import type { Movie } from "../types/Movie"

import "./MovieDetails.css"

function formatShowtime(value: string) {
  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value))
}

function MovieDetails() {
  const { id } = useParams()

  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  const isAdmin =
    user?.role === "ADMIN"

  const [movie, setMovie] =
    useState<Movie | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [selectedShowtimeId, setSelectedShowtimeId] =
    useState("")

  const [ticketCount, setTicketCount] =
    useState(1)

  const selectedShowtime =
    useMemo(
      () =>
        movie?.showtimes.find(
          showtime =>
            showtime.id === selectedShowtimeId,
        ),
      [movie, selectedShowtimeId],
    )

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

        setSelectedShowtimeId(
          selectedMovie?.showtimes[0]?.id ||
            "",
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
    if (
      !movie ||
      !selectedShowtime
    ) {
      showToast(
        "Please choose a time",
        "info",
      )
      return
    }

    try {
      await addBooking(
        movie.id,
        selectedShowtime.id,
        ticketCount,
      )

      showToast(
        `${ticketCount} ticket${ticketCount === 1 ? "" : "s"} booked`,
        "success",
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to book seat"

      showToast(message, "error")

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

        <div className="booking-panel">
          <h2>
            Select a screening
          </h2>

          <div className="showtime-list">
            {
              movie.showtimes.map(showtime => (
                <label
                  className="showtime-option"
                  key={showtime.id}
                >
                  <input
                    type="radio"
                    name="showtime"
                    checked={
                      selectedShowtimeId ===
                        showtime.id
                    }
                    onChange={() => {
                      setSelectedShowtimeId(
                        showtime.id,
                      )
                    }}
                  />

                  <span>
                    {formatShowtime(showtime.startsAt)}
                  </span>

                  <strong>
                    {showtime.remainingTickets} left
                  </strong>
                </label>
              ))
            }
          </div>

          <label className="ticket-control">
            Tickets
            <input
              type="number"
              min="1"
              max={
                selectedShowtime
                  ? Math.min(
                      selectedShowtime.remainingTickets,
                      10,
                    )
                  : 1
              }
              value={ticketCount}
              onChange={event =>
                setTicketCount(
                  Number(event.target.value),
                )
              }
            />
          </label>

          {
            user &&
            !isAdmin &&
            (
              <button
                onClick={handleBooking}
                disabled={
                  !selectedShowtime ||
                  selectedShowtime.remainingTickets <=
                    0
                }
              >
                Book Tickets
              </button>
            )
          }

          {
            !user &&
            (
              <p>
                Please log in to book tickets.
              </p>
            )
          }

          {
            isAdmin &&
            (
              <p>
                Admins manage movies and orders from the Admin page.
              </p>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default MovieDetails
