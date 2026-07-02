import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import BookingModal from "../components/BookingModal"
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

  const [movies, setMovies] =
    useState<Movie[]>([])
  const [selectedDate, setSelectedDate] =
    useState("")
  const [bookingMovie, setBookingMovie] =
    useState<Movie | null>(null)
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

  function handleOpenBooking(
    screening: Screening,
  ) {
    setBookingMovie(screening.movie)
    setBookingShowtimeId(
      screening.showtimeId,
    )
  }

  function handleBooked(
    showtimeId: string,
    bookedTickets: number,
  ) {
    setMovies(currentMovies =>
      currentMovies.map(movie => ({
        ...movie,
        showtimes:
          movie.showtimes.map(showtime =>
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
      })),
    )
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
                    handleOpenBooking(screening)
                  }}
                  disabled={
                    screening.remainingTickets <= 0
                  }
                >
                  Book
                </button>
              </article>
            ))
          }
        </div>
      </section>

      <BookingModal
        open={Boolean(bookingMovie)}
        movie={bookingMovie}
        initialShowtimeId={bookingShowtimeId}
        onClose={() => {
          setBookingMovie(null)
          setBookingShowtimeId("")
        }}
        onBooked={handleBooked}
      />
    </div>
  )
}

export default Home
