import { useEffect, useState } from "react"

import {
  getBookings,
  clearBookings,
} from "../services/bookingService"

type Booking = {
  id: string
  movie: {
    title: string
  }
}

function Schedule() {
  const [bookings, setBookings] =
    useState<Booking[]>([])

  const [loading, setLoading] =
    useState(true)

  async function loadBookings() {
    try {
      const data =
        await getBookings()

      setBookings(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  async function handleClearSchedule() {
    await clearBookings()

    setBookings([])
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