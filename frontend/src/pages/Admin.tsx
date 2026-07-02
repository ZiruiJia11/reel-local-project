import {
  useEffect,
  useState,
} from "react"

import { getMovies } from "../services/movieApi"
import {
  cancelAdminBooking,
  getAdminBookings,
  updateMovie,
  type AdminBooking,
  type MovieUpdate,
} from "../services/adminService"
import type { Movie } from "../types/Movie"

import "./Admin.css"

function formatShowtime(value?: string) {
  if (!value) {
    return "No showtime"
  }

  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value))
}

function toMovieForm(movie: Movie): MovieUpdate {
  return {
    title: movie.title,
    image: movie.image,
    genre: movie.genre,
    duration: movie.duration,
    description: movie.description,
  }
}

function Admin() {
  const [movies, setMovies] =
    useState<Movie[]>([])
  const [selectedMovieId, setSelectedMovieId] =
    useState("")
  const [movieForm, setMovieForm] =
    useState<MovieUpdate | null>(null)
  const [bookings, setBookings] =
    useState<AdminBooking[]>([])
  const [message, setMessage] =
    useState("")
  const [errorMessage, setErrorMessage] =
    useState("")
  const [savingMovie, setSavingMovie] =
    useState(false)
  const [cancellingBookingId, setCancellingBookingId] =
    useState("")

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [
          movieData,
          bookingData,
        ] =
          await Promise.all([
            getMovies(),
            getAdminBookings(),
          ])

        setMovies(movieData)
        setBookings(bookingData)

        if (movieData[0]) {
          setSelectedMovieId(movieData[0].id)
          setMovieForm(
            toMovieForm(movieData[0]),
          )
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load admin data",
        )
      }
    }

    void loadAdminData()
  }, [])

  function handleMovieChange(movieId: string) {
    const movie =
      movies.find(
        item =>
          item.id === movieId,
      )

    setSelectedMovieId(movieId)
    setMovieForm(
      movie
        ? toMovieForm(movie)
        : null,
    )
    setMessage("")
    setErrorMessage("")
  }

  function updateFormField(
    field: keyof MovieUpdate,
    value: string,
  ) {
    setMovieForm(current =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    )
  }

  async function handleSaveMovie() {
    if (!movieForm) {
      return
    }

    try {
      setSavingMovie(true)

      const updatedMovie =
        await updateMovie(
          selectedMovieId,
          movieForm,
        )

      setMovies(currentMovies =>
        currentMovies.map(movie =>
          movie.id === updatedMovie.id
            ? {
                ...movie,
                ...updatedMovie,
              }
            : movie,
        ),
      )
      setMessage("Movie updated")
      setErrorMessage("")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update movie",
      )
    } finally {
      setSavingMovie(false)
    }
  }

  async function handleCancelBooking(
    bookingId: string,
  ) {
    try {
      setCancellingBookingId(bookingId)

      await cancelAdminBooking(bookingId)

      setBookings(currentBookings =>
        currentBookings.filter(
          booking =>
            booking.id !== bookingId,
        ),
      )
      setMessage("Booking cancelled")
      setErrorMessage("")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to cancel booking",
      )
    } finally {
      setCancellingBookingId("")
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>
            Admin
          </h1>

          <p>
            Update movies and manage customer bookings.
          </p>
        </div>
      </header>

      {
        message &&
        (
          <p className="admin-success">
            {message}
          </p>
        )
      }

      {
        errorMessage &&
        (
          <p className="admin-error">
            {errorMessage}
          </p>
        )
      }

      <section className="admin-section">
        <h2>
          Movie editor
        </h2>

        <label>
          Movie
          <select
            value={selectedMovieId}
            onChange={event =>
              handleMovieChange(
                event.target.value,
              )
            }
          >
            {
              movies.map(movie => (
                <option
                  key={movie.id}
                  value={movie.id}
                >
                  {movie.title}
                </option>
              ))
            }
          </select>
        </label>

        {
          movieForm &&
          (
            <div className="admin-movie-form">
              <label>
                Title
                <input
                  value={movieForm.title}
                  onChange={event =>
                    updateFormField(
                      "title",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Genre
                <input
                  value={movieForm.genre}
                  onChange={event =>
                    updateFormField(
                      "genre",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Duration
                <input
                  value={movieForm.duration}
                  onChange={event =>
                    updateFormField(
                      "duration",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Image path
                <input
                  value={movieForm.image}
                  onChange={event =>
                    updateFormField(
                      "image",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-description-field">
                Description
                <textarea
                  value={movieForm.description}
                  onChange={event =>
                    updateFormField(
                      "description",
                      event.target.value,
                    )
                  }
                />
              </label>

              <button
                onClick={() => {
                  void handleSaveMovie()
                }}
                disabled={savingMovie}
              >
                {
                  savingMovie
                    ? "Saving..."
                    : "Save movie"
                }
              </button>
            </div>
          )
        }
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <h2>
            Orders
          </h2>

          <span>
            {bookings.length} active
          </span>
        </div>

        <div className="admin-booking-list">
          {
            bookings.map(booking => (
              <article
                className="admin-booking-row"
                key={booking.id}
              >
                <div>
                  <h3>
                    {booking.movie.title}
                  </h3>

                  <p>
                    {formatShowtime(
                      booking.showtime?.startsAt,
                    )}
                  </p>
                </div>

                <div>
                  <strong>
                    {booking.user.name}
                  </strong>

                  <p>
                    {booking.user.email}
                  </p>
                </div>

                <div>
                  <strong>
                    {booking.ticketCount} ticket{booking.ticketCount === 1 ? "" : "s"}
                  </strong>

                  <p>
                    {booking.status}
                  </p>
                </div>

                <button
                  onClick={() => {
                    void handleCancelBooking(
                      booking.id,
                    )
                  }}
                  disabled={
                    cancellingBookingId === booking.id
                  }
                >
                  {
                    cancellingBookingId === booking.id
                      ? "Cancelling..."
                      : "Cancel"
                  }
                </button>
              </article>
            ))
          }
        </div>
      </section>
    </div>
  )
}

export default Admin
