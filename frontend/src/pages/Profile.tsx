import {
  useCallback,
  useEffect,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import {
  cancelBooking,
  clearBookings,
  getBookings,
} from "../services/bookingService"
import {
  getCurrentUser,
  logout,
} from "../services/authService"
import { isAuthError } from "../services/apiError"
import { showToast } from "../services/toastService"

import "./Profile.css"

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

function Profile() {
  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  const [bookings, setBookings] =
    useState<Booking[]>([])
  const [loading, setLoading] =
    useState(
      user?.role !== "ADMIN",
    )
  const [cancellingBookingId, setCancellingBookingId] =
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

        showToast(message, "error")

        if (isAuthError(error)) {
          logout()
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }, [navigate])

  useEffect(() => {
    if (user?.role === "ADMIN") {
      return
    }

    const timeoutId =
      window.setTimeout(() => {
        void loadBookings()
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadBookings, user?.role])

  async function handleClearSchedule() {
    try {
      await clearBookings()

      setBookings([])
      showToast(
        "Schedule cleared",
        "success",
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to clear bookings"

      showToast(message, "error")

      if (isAuthError(error)) {
        logout()
        navigate("/login")
      }
    }
  }

  async function handleCancelBooking(
    bookingId: string,
  ) {
    try {
      setCancellingBookingId(bookingId)

      await cancelBooking(bookingId)

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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to cancel booking"

      showToast(message, "error")

      if (isAuthError(error)) {
        logout()
        navigate("/login")
      }
    } finally {
      setCancellingBookingId("")
    }
  }

  if (!user) {
    return (
      <div className="profile-page">
        <h1>
          Profile
        </h1>

        <p>
          You are not logged in.
        </p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <section className="profile-header">
        <div>
          <h1>
            Profile
          </h1>

          <p>
            {user.name} · {user.email}
          </p>
        </div>

        {
          user.role !== "ADMIN" &&
          (
            <div className="profile-summary">
              <strong>
                {bookings.length}
              </strong>

              <span>
                bookings · {totalTickets} tickets
              </span>
            </div>
          )
        }
      </section>

      {
        user.role === "ADMIN"
          ? (
              <section className="profile-panel">
                <h2>
                  Admin account
                </h2>

                <p>
                  Use the Admin page to manage movies, showtimes and customer orders.
                </p>
              </section>
            )
          : (
              <section className="profile-panel">
                <div className="profile-section-heading">
                  <div>
                    <h2>
                      My Schedule
                    </h2>

                    <p>
                      Your active bookings are listed here.
                    </p>
                  </div>

                  <button
                    onClick={handleClearSchedule}
                    disabled={
                      bookings.length === 0 ||
                      loading
                    }
                  >
                    Clear all
                  </button>
                </div>

                {
                  loading
                    ? (
                        <p>
                          Loading schedule...
                        </p>
                      )
                    : bookings.length === 0
                      ? (
                          <div className="profile-empty">
                            <h3>
                              No bookings yet
                            </h3>

                            <p>
                              Pick a screening from the home page to build your schedule.
                            </p>
                          </div>
                        )
                      : (
                          <div className="profile-booking-list">
                            {
                              bookings.map(booking => (
                                <article
                                  className="profile-booking-row"
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

                                  <div className="profile-booking-meta">
                                    <span>
                                      {booking.ticketCount} ticket{booking.ticketCount === 1 ? "" : "s"}
                                    </span>

                                    <span>
                                      {booking.status}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      void handleCancelBooking(
                                        booking.id,
                                      )
                                    }}
                                    disabled={
                                      cancellingBookingId ===
                                        booking.id
                                    }
                                  >
                                    {
                                      cancellingBookingId ===
                                        booking.id
                                        ? "Cancelling..."
                                        : "Cancel"
                                    }
                                  </button>
                                </article>
                              ))
                            }
                          </div>
                        )
                }
              </section>
            )
      }
    </div>
  )
}

export default Profile
