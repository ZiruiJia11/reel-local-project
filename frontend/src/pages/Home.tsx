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

type MovieDayGroup = {
  movie: Movie
  screenings: Screening[]
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

  const movieGroupsByDate =
    useMemo(() => {
      const dateGroups =
        new Map<string, Map<string, MovieDayGroup>>()

      movies.forEach(movie => {
        movie.showtimes.forEach(showtime => {
          const key =
            dateKey(showtime.startsAt)

          const movieGroups =
            dateGroups.get(key) ||
            new Map<string, MovieDayGroup>()

          const movieGroup =
            movieGroups.get(movie.id) || {
              movie,
              screenings: [],
            }

          movieGroup.screenings.push({
            movie,
            showtimeId: showtime.id,
            startsAt: showtime.startsAt,
            remainingTickets:
              showtime.remainingTickets,
          })

          movieGroups.set(
            movie.id,
            movieGroup,
          )

          dateGroups.set(
            key,
            movieGroups,
          )
        })
      })

      return Array.from(
        dateGroups.entries(),
      )
        .sort(([a], [b]) =>
          a.localeCompare(b),
        )
        .map(([key, movieGroups]) => {
          const groupedMovies =
            Array.from(
              movieGroups.values(),
            )
              .map(group => ({
                ...group,
                screenings:
                  group.screenings.sort(
                    (a, b) =>
                      new Date(a.startsAt).getTime() -
                      new Date(b.startsAt).getTime(),
                  ),
              }))
              .sort(
                (a, b) =>
                  new Date(a.screenings[0].startsAt).getTime() -
                  new Date(b.screenings[0].startsAt).getTime(),
              )

          return {
            key,
            label:
              formatDate(
                groupedMovies[0].screenings[0].startsAt,
              ),
            movieGroups:
              groupedMovies,
          }
        })
    }, [movies])

  const selectedMovieGroups =
    movieGroupsByDate.find(
      group =>
        group.key === selectedDate,
    )?.movieGroups || []

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
            Pick a day, choose a film, and select the time that works for you.
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
            movieGroupsByDate.map(group => (
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
            selectedMovieGroups.map(group => (
              <article
                className="screening-row"
                key={group.movie.id}
              >
                <img
                  src={group.movie.image}
                  alt={group.movie.title}
                />

                <div>
                  <h2>
                    {group.movie.title}
                  </h2>

                  <p>
                    {group.movie.genre} · {group.movie.duration}
                  </p>
                </div>

                <div className="screening-time-list">
                  {
                    group.screenings.map(screening => (
                      <button
                        className="screening-time-button"
                        key={screening.showtimeId}
                        onClick={() => {
                          handleOpenBooking(screening)
                        }}
                        disabled={
                          screening.remainingTickets <= 0
                        }
                      >
                        <strong>
                          {formatTime(screening.startsAt)}
                        </strong>

                        <span>
                          {screening.remainingTickets} left
                        </span>
                      </button>
                    ))
                  }
                </div>
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
