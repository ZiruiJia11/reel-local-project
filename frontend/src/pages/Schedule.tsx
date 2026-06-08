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

type Booking = {
  id: string
  movie: {
    title: string
  }
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
    <div>
      <h1>
        My Schedule
      </h1>

      {
        errorMessage &&
        (
          <p>
            {errorMessage}
          </p>
        )
      }

      <button
        onClick={handleClearSchedule}
      >
        Clear Schedule
      </button>

      {
        bookings.length === 0 &&
        (
          <p>
            No bookings yet
          </p>
        )
      }

      {
        bookings.map(
          booking => (
            <div
              key={booking.id}
            >
              <h2>
                {booking.movie.title}
              </h2>
            </div>
          )
        )
      }
    </div>
  )
}

export default Schedule
