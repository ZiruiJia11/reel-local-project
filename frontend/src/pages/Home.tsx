import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import { addBooking } from "../services/bookingService"
import { isAuthError } from "../services/apiError"
import {
  getCurrentUser,
  logout,
} from "../services/authService"
import { getMovies } from "../services/movieApi"
import { showToast } from "../services/toastService"
import type { Movie } from "../types/Movie"

import "./Home.css"

type Screening = {
  movie: Movie
  showtimeId: string
  startsAt: string
  remainingTickets: number
}

function formatDate(value: string) {
  const date =
    new Date(value)

  const today =
    new Date()

  if (
    date.toDateString() ===
    today.toDateString()
  ) {
    return "Today"
  }

  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  ).format(date)
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value))
}

function dateKey(value: string) {
  return new Date(value)
    .toISOString()
    .slice(0, 10)
}

function Home() {
  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  const [movies, setMovies] =
    useState<Movie[]>([])
  const [selectedDate, setSelectedDate] =
    useState("")
  const [bookingShowtimeId, setBookingShowtimeId] =
    useState("")

  useEffect(() => {
    async function loadMovies() {
      try {
        const data =
          await getMovies()

        setMovies(data)

        const firstShowtime =
          data.flatMap(
            movie =>
              movie.showtimes,
          )[0]

        if (firstShowtime) {
          setSelectedDate(
            dateKey(firstShowtime.startsAt),
          )
        }
      } catch {
        showToast(
          "Failed to load screenings",
          "error",
        )
      }
    }

    void loadMovies()
  }, [])

  const screeningsByDate =
    useMemo(() => {
      const groups =
        new Map<string, Screening[]>()

      movies.forEach(movie => {
        movie.showtimes.forEach(showtime => {
          const key =
            dateKey(showtime.startsAt)

          const current =
            groups.get(key) || []

          current.push({
            movie,
            showtimeId: showtime.id,
            startsAt: showtime.startsAt,
            remainingTickets:
              showtime.remainingTickets,
          })

          groups.set(key, current)
        })
      })

      return Array.from(
        groups.entries(),
      )
        .sort(([a], [b]) =>
          a.localeCompare(b),
        )
        .map(([key, screenings]) => ({
          key,
          label:
            formatDate(
              screenings[0].startsAt,
            ),
          screenings:
            screenings.sort(
              (a, b) =>
                new Date(a.startsAt).getTime() -
                new Date(b.startsAt).getTime(),
            ),
        }))
    }, [movies])

  const selectedScreenings =
    screeningsByDate.find(
      group =>
        group.key === selectedDate,
    )?.screenings || []

  async function handleQuickBook(
    screening: Screening,
  ) {
    if (!user) {
      showToast(
        "Please log in to book tickets",
        "info",
      )
      navigate("/login")
      return
    }

    if (user.role === "ADMIN") {
      showToast(
        "Admins manage screenings from the Admin page",
        "info",
      )
      navigate("/admin")
      return
    }

    try {
      setBookingShowtimeId(
        screening.showtimeId,
      )

      await addBooking(
        screening.movie.id,
        screening.showtimeId,
        1,
      )

      showToast(
        `Booked 1 ticket for ${screening.movie.title}`,
        "success",
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to book ticket"

      showToast(
        message,
        "error",
      )

      if (isAuthError(error)) {
        logout()
        navigate("/login")
      }
    } finally {
      setBookingShowtimeId("")
    }
  }

  return (
    <div className="home-page">
      <section className="home-intro">
        <div>
          <h1>
            Reel Local Cinema
          </h1>

          <p>
            Pick a day, choose a screening, and book a seat in one step.
          </p>
        </div>

        <button
          onClick={() => navigate("/movies")}
        >
          View movie info
        </button>
      </section>

      <section className="daily-screenings">
        <div className="date-tabs">
          {
            screeningsByDate.map(group => (
              <button
                className={
                  group.key === selectedDate
                    ? "active"
                    : ""
                }
                key={group.key}
                onClick={() =>
                  setSelectedDate(group.key)
                }
              >
                {group.label}
              </button>
            ))
          }
        </div>

        <div className="screening-list">
          {
            selectedScreenings.map(screening => (
              <article
                className="screening-row"
                key={screening.showtimeId}
              >
                <img
                  src={screening.movie.image}
                  alt={screening.movie.title}
                />

                <div>
                  <h2>
                    {screening.movie.title}
                  </h2>

                  <p>
                    {screening.movie.genre} · {screening.movie.duration}
                  </p>
                </div>

                <div className="screening-time">
                  <strong>
                    {formatTime(screening.startsAt)}
                  </strong>

                  <span>
                    {screening.remainingTickets} left
                  </span>
                </div>

                <button
                  onClick={() => {
                    void handleQuickBook(
                      screening,
                    )
                  }}
                  disabled={
                    bookingShowtimeId ===
                      screening.showtimeId ||
                    screening.remainingTickets <= 0
                  }
                >
                  {
                    bookingShowtimeId ===
                      screening.showtimeId
                      ? "Booking..."
                      : "Book 1 ticket"
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

export default Home
