import { useEffect, useState } from "react"
import {
  useParams,
} from "react-router-dom"

import BookingModal from "../components/BookingModal"
import { getMovies } from "../services/movieApi"
import {
  getCurrentUser,
} from "../services/authService"

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

  const [bookingOpen, setBookingOpen] =
    useState(false)

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

  function handleBooked(
    showtimeId: string,
    bookedTickets: number,
  ) {
    setMovie(currentMovie =>
      currentMovie
        ? {
            ...currentMovie,
            showtimes:
              currentMovie.showtimes.map(showtime =>
                showtime.id === showtimeId
                  ? {
                      ...showtime,
                      remainingTickets:
                        Math.max(
                          showtime.remainingTickets -
                            bookedTickets,
                          0,
                        ),
                    }
                  : showtime,
              ),
          }
        : currentMovie,
    )
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

          {
            user &&
            !isAdmin &&
            (
              <button
                onClick={() =>
                  setBookingOpen(true)
                }
                disabled={
                  movie.showtimes.length === 0
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

      <BookingModal
        open={bookingOpen}
        movie={movie}
        initialShowtimeId={selectedShowtimeId}
        onClose={() =>
          setBookingOpen(false)
        }
        onBooked={handleBooked}
      />
    </div>
  )
}

export default MovieDetails
