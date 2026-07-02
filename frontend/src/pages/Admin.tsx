import {
  useEffect,
  useState,
} from "react"

import { getMovies } from "../services/movieApi"
import {
  cancelAdminBooking,
  createMovie,
  createShowtime,
  deleteMovie,
  deleteShowtime,
  getAdminBookings,
  updateMovie,
  updateShowtime,
  type AdminBooking,
  type MovieUpdate,
  type ShowtimeUpdate,
} from "../services/adminService"
import { showToast } from "../services/toastService"
import type {
  Movie,
  Showtime,
} from "../types/Movie"

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

function emptyMovieForm(): MovieUpdate {
  return {
    title: "",
    image: "/movies/",
    genre: "",
    duration: "",
    description: "",
  }
}

function toDatetimeInput(value: string) {
  const date =
    new Date(value)

  const localDate =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60000,
    )

  return localDate
    .toISOString()
    .slice(0, 16)
}

function toShowtimeForm(
  showtime: Showtime,
): ShowtimeUpdate {
  return {
    startsAt:
      toDatetimeInput(
        showtime.startsAt,
      ),
    capacity:
      showtime.capacity,
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
  const [savingMovie, setSavingMovie] =
    useState(false)
  const [cancellingBookingId, setCancellingBookingId] =
    useState("")
  const [deletingMovie, setDeletingMovie] =
    useState(false)
  const [showtimeForms, setShowtimeForms] =
    useState<Record<string, ShowtimeUpdate>>({})
  const [newShowtimeForm, setNewShowtimeForm] =
    useState<ShowtimeUpdate>({
      startsAt: "",
      capacity: 40,
    })

  const selectedMovie =
    movies.find(
      movie =>
        movie.id === selectedMovieId,
    )

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
          setShowtimeForms(
            Object.fromEntries(
              movieData[0].showtimes.map(
                showtime => [
                  showtime.id,
                  toShowtimeForm(showtime),
                ],
              ),
            ),
          )
        }
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to load admin data",
          "error",
        )
      }
    }

    void loadAdminData()
  }, [])

  function handleMovieChange(movieId: string) {
    if (movieId === "new") {
      setSelectedMovieId("new")
      setMovieForm(emptyMovieForm())
      setShowtimeForms({})
    return
    }

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
    setShowtimeForms(
      movie
        ? Object.fromEntries(
            movie.showtimes.map(
              showtime => [
                showtime.id,
                toShowtimeForm(showtime),
              ],
            ),
          )
        : {},
    )
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
        selectedMovieId === "new"
          ? await createMovie(movieForm)
          : await updateMovie(
              selectedMovieId,
              movieForm,
            )

      setMovies(currentMovies =>
        selectedMovieId === "new"
          ? [
              ...currentMovies,
              {
                ...updatedMovie,
                showtimes:
                  updatedMovie.showtimes || [],
              },
            ]
          : currentMovies.map(movie =>
              movie.id === updatedMovie.id
                ? {
                    ...movie,
                    ...updatedMovie,
                  }
                : movie,
            ),
      )
      setSelectedMovieId(updatedMovie.id)
      setMovieForm(
        toMovieForm(updatedMovie),
      )
      setShowtimeForms({})
      showToast(
        selectedMovieId === "new"
          ? "Movie added"
          : "Movie updated",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update movie",
        "error",
      )
    } finally {
      setSavingMovie(false)
    }
  }

  async function handleDeleteMovie() {
    if (
      selectedMovieId === "new" ||
      !selectedMovie
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `Delete ${selectedMovie.title}? This also removes its showtimes and bookings.`,
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingMovie(true)

      await deleteMovie(
        selectedMovie.id,
      )

      const remainingMovies =
        movies.filter(
          movie =>
            movie.id !== selectedMovie.id,
        )

      setMovies(remainingMovies)
      setBookings(currentBookings =>
        currentBookings.filter(
          booking =>
            booking.movie.title !==
              selectedMovie.title,
        ),
      )

      if (remainingMovies[0]) {
        handleMovieChange(
          remainingMovies[0].id,
        )
      } else {
        setSelectedMovieId("new")
        setMovieForm(emptyMovieForm())
        setShowtimeForms({})
      }

      showToast(
        "Movie deleted",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete movie",
        "error",
      )
    } finally {
      setDeletingMovie(false)
    }
  }

  function updateShowtimeField(
    showtimeId: string,
    field: keyof ShowtimeUpdate,
    value: string,
  ) {
    setShowtimeForms(current => ({
      ...current,
      [showtimeId]: {
        ...current[showtimeId],
        [field]:
          field === "capacity"
            ? Number(value)
            : value,
      },
    }))
  }

  async function handleSaveShowtime(
    showtimeId: string,
  ) {
    const showtimeForm =
      showtimeForms[showtimeId]

    if (!showtimeForm) {
      return
    }

    try {
      const updatedShowtime =
        await updateShowtime(
          showtimeId,
          showtimeForm,
        )

      setMovies(currentMovies =>
        currentMovies.map(movie =>
          movie.id === selectedMovieId
            ? {
                ...movie,
                showtimes:
                  movie.showtimes.map(showtime =>
                    showtime.id === showtimeId
                      ? {
                          ...showtime,
                          ...updatedShowtime,
                        }
                      : showtime,
                  ),
              }
            : movie,
        ),
      )
      showToast(
        "Showtime updated",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update showtime",
        "error",
      )
    }
  }

  async function handleAddShowtime() {
    if (
      selectedMovieId === "new" ||
      !newShowtimeForm.startsAt
    ) {
      return
    }

    try {
      const createdShowtime =
        await createShowtime(
          selectedMovieId,
          newShowtimeForm,
        )

      setMovies(currentMovies =>
        currentMovies.map(movie =>
          movie.id === selectedMovieId
            ? {
                ...movie,
                showtimes: [
                  ...movie.showtimes,
                  {
                    ...createdShowtime,
                    remainingTickets:
                      createdShowtime.capacity,
                  },
                ],
              }
            : movie,
        ),
      )
      setShowtimeForms(current => ({
        ...current,
        [createdShowtime.id]:
          toShowtimeForm({
            ...createdShowtime,
            remainingTickets:
              createdShowtime.capacity,
          }),
      }))
      setNewShowtimeForm({
        startsAt: "",
        capacity: 40,
      })
      showToast(
        "Showtime added",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to add showtime",
        "error",
      )
    }
  }

  async function handleDeleteShowtime(
    showtimeId: string,
  ) {
    try {
      await deleteShowtime(showtimeId)

      setMovies(currentMovies =>
        currentMovies.map(movie =>
          movie.id === selectedMovieId
            ? {
                ...movie,
                showtimes:
                  movie.showtimes.filter(
                    showtime =>
                      showtime.id !== showtimeId,
                  ),
              }
            : movie,
        ),
      )
      setShowtimeForms(current => {
        const next = {
          ...current,
        }

        delete next[showtimeId]

        return next
      })
      showToast(
        "Showtime deleted",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete showtime",
        "error",
      )
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
      showToast(
        "Booking cancelled",
        "success",
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to cancel booking",
        "error",
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
              <option value="new">
                Add new movie
              </option>
            }

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
                    : selectedMovieId === "new"
                      ? "Add movie"
                      : "Save movie"
                }
              </button>

              {
                selectedMovieId !== "new" &&
                (
                  <button
                    className="admin-danger-button"
                    onClick={() => {
                      void handleDeleteMovie()
                    }}
                    disabled={deletingMovie}
                  >
                    {
                      deletingMovie
                        ? "Deleting..."
                        : "Delete movie"
                    }
                  </button>
                )
              }
            </div>
          )
        }
      </section>

      {
        selectedMovieId !== "new" &&
        selectedMovie &&
        (
          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>
                Showtimes
              </h2>

              <span>
                {selectedMovie.showtimes.length} listed
              </span>
            </div>

            <div className="admin-showtime-list">
              {
                selectedMovie.showtimes.map(showtime => (
                  <div
                    className="admin-showtime-row"
                    key={showtime.id}
                  >
                    <label>
                      Starts at
                      <input
                        type="datetime-local"
                        value={
                          showtimeForms[showtime.id]?.startsAt ||
                          ""
                        }
                        onChange={event =>
                          updateShowtimeField(
                            showtime.id,
                            "startsAt",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Capacity
                      <input
                        type="number"
                        min="1"
                        value={
                          showtimeForms[showtime.id]?.capacity ||
                          1
                        }
                        onChange={event =>
                          updateShowtimeField(
                            showtime.id,
                            "capacity",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <button
                      onClick={() => {
                        void handleSaveShowtime(
                          showtime.id,
                        )
                      }}
                    >
                      Save
                    </button>

                    <button
                      className="admin-danger-button"
                      onClick={() => {
                        void handleDeleteShowtime(
                          showtime.id,
                        )
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              }

              <div className="admin-showtime-row">
                <label>
                  New starts at
                  <input
                    type="datetime-local"
                    value={newShowtimeForm.startsAt}
                    onChange={event =>
                      setNewShowtimeForm(current => ({
                        ...current,
                        startsAt:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Capacity
                  <input
                    type="number"
                    min="1"
                    value={newShowtimeForm.capacity}
                    onChange={event =>
                      setNewShowtimeForm(current => ({
                        ...current,
                        capacity:
                          Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <button
                  onClick={() => {
                    void handleAddShowtime()
                  }}
                  disabled={!newShowtimeForm.startsAt}
                >
                  Add time
                </button>
              </div>
            </div>
          </section>
        )
      }

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
