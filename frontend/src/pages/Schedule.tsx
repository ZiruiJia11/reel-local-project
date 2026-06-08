import {
  useCallback,
  useEffect,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import {
  getBookings,
  clearBookings,
} from "../services/bookingService"
import { logout } from "../services/authService"
import { isAuthError } from "../services/apiError"

import "./Schedule.css"

type Booking = {
  id: string
  ticketCount: number
  status: string
  movie: {
    title: string
    genre?: string
    image?: string
  }
  showtime?: {
    startsAt: string
  } | null
}

function formatShowtime(value?: string) {
  if (!value) {
    return "Time not selected"
  }

  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value))
}

function Schedule() {
  const navigate =
    useNavigate()

  const [bookings, setBookings] =
    useState<Booking[]>([])

  const [loading, setLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState("")

  const totalTickets =
    bookings.reduce(
      (total, booking) =>
        total + booking.ticketCount,
      0,
    )

  const loadBookings =
    useCallback(async () => {
      try {
        const data =
          await getBookings()

        setBookings(data)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch bookings"

        setErrorMessage(message)

        if (isAuthError(error)) {
          logout()
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }, [navigate])

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadBookings()
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadBookings])

  async function handleClearSchedule() {
    try {
      await clearBookings()

      setBookings([])
      setErrorMessage("")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to clear bookings"

      setErrorMessage(message)

      if (isAuthError(error)) {
        logout()
        navigate("/login")
      }
    }
  }

  if (loading) {
    return (
      <h1>
        Loading schedule...
      </h1>
    )
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1>
            My Schedule
          </h1>

          <p>
            {bookings.length} booking{bookings.length === 1 ? "" : "s"} · {totalTickets} ticket{totalTickets === 1 ? "" : "s"}
          </p>
        </div>

        <button
          onClick={handleClearSchedule}
          disabled={bookings.length === 0}
        >
          Clear Schedule
        </button>
      </div>

      {
        errorMessage &&
        (
          <p className="schedule-error">
            {errorMessage}
          </p>
        )
      }

      {
        bookings.length === 0 &&
        (
          <div className="empty-schedule">
            <h2>
              No bookings yet
            </h2>

            <p>
              Pick a movie and choose a screening time to build your schedule.
            </p>
          </div>
        )
      }

      <div className="booking-list">
        {
          bookings.map(
            booking => (
              <article
                className="booking-card"
                key={booking.id}
              >
                {
                  booking.movie.image &&
                  (
                    <img
                      src={booking.movie.image}
                      alt={booking.movie.title}
                    />
                  )
                }

                <div className="booking-card-body">
                  <div>
                    <h2>
                      {booking.movie.title}
                    </h2>

                    <p>
                      {formatShowtime(
                        booking.showtime?.startsAt,
                      )}
                    </p>
                  </div>

                  <div className="booking-meta-row">
                    <span>
                      {booking.ticketCount} ticket{booking.ticketCount === 1 ? "" : "s"}
                    </span>

                    <span>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </article>
            )
          )
        }
      </div>
    </div>
  )
}

export default Schedule
