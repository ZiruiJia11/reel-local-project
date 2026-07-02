import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"

import { isAuthError } from "../services/apiError"
import { addBooking } from "../services/bookingService"
import {
  getCurrentUser,
  logout,
} from "../services/authService"
import { showToast } from "../services/toastService"
import type { Movie } from "../types/Movie"

import "./BookingModal.css"

type Props = {
  movie: Movie | null
  initialShowtimeId?: string
  open: boolean
  onClose: () => void
  onBooked?: (
    showtimeId: string,
    ticketCount: number,
  ) => void
}

function formatShowtime(value: string) {
  return new Intl.DateTimeFormat(
    "en-NZ",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value))
}

function BookingModal({
  movie,
  initialShowtimeId = "",
  open,
  onClose,
  onBooked,
}: Props) {
  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  const [selectedShowtimeId, setSelectedShowtimeId] =
    useState("")
  const [ticketCount, setTicketCount] =
    useState(1)
  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    if (!open || !movie) {
      return
    }

    const timeoutId =
      window.setTimeout(() => {
        setSelectedShowtimeId(
          initialShowtimeId ||
            movie.showtimes[0]?.id ||
            "",
        )
        setTicketCount(1)
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [initialShowtimeId, movie, open])

  const selectedShowtime =
    useMemo(
      () =>
        movie?.showtimes.find(
          showtime =>
            showtime.id === selectedShowtimeId,
        ),
      [movie, selectedShowtimeId],
    )

  const maxTickets =
    selectedShowtime
      ? Math.min(
          selectedShowtime.remainingTickets,
          10,
        )
      : 1

  async function handleSubmit() {
    if (!movie || !selectedShowtime) {
      showToast(
        "Please choose a time",
        "info",
      )
      return
    }

    if (!user) {
      showToast(
        "Please log in to book tickets",
        "info",
      )
      onClose()
      navigate("/login")
      return
    }

    if (user.role === "ADMIN") {
      showToast(
        "Admins manage screenings from the Admin page",
        "info",
      )
      onClose()
      navigate("/admin")
      return
    }

    try {
      setSubmitting(true)

      await addBooking(
        movie.id,
        selectedShowtime.id,
        ticketCount,
      )

      onBooked?.(
        selectedShowtime.id,
        ticketCount,
      )

      showToast(
        `${ticketCount} ticket${ticketCount === 1 ? "" : "s"} booked for ${movie.title}`,
        "success",
      )
      onClose()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to book tickets"

      showToast(message, "error")

      if (isAuthError(error)) {
        logout()
        onClose()
        navigate("/login")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !movie) {
    return null
  }

  return (
    <div
      className="booking-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={event =>
          event.stopPropagation()
        }
      >
        <div className="booking-modal-header">
          <div>
            <h2 id="booking-modal-title">
              Book tickets
            </h2>

            <p>
              {movie.title}
            </p>
          </div>

          <button
            className="booking-modal-close"
            onClick={onClose}
            aria-label="Close booking popup"
          >
            X
          </button>
        </div>

        <div className="booking-modal-showtimes">
          {
            movie.showtimes.map(showtime => (
              <label
                className="booking-modal-showtime"
                key={showtime.id}
              >
                <input
                  type="radio"
                  name="booking-showtime"
                  checked={
                    selectedShowtimeId ===
                      showtime.id
                  }
                  onChange={() =>
                    setSelectedShowtimeId(
                      showtime.id,
                    )
                  }
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

        <label className="booking-modal-ticket-control">
          Tickets
          <input
            type="number"
            min="1"
            max={maxTickets}
            value={ticketCount}
            onChange={event =>
              setTicketCount(
                Number(event.target.value),
              )
            }
          />
        </label>

        <button
          className="booking-modal-submit"
          onClick={() => {
            void handleSubmit()
          }}
          disabled={
            submitting ||
            !selectedShowtime ||
            selectedShowtime.remainingTickets <= 0
          }
        >
          {
            submitting
              ? "Booking..."
              : "Confirm booking"
          }
        </button>
      </div>
    </div>
  )
}

export default BookingModal
