import {
  getBookings,
  clearBookings,
  type Booking,
} from "../services/bookingService"

import { movies } from "../services/movieData"

function Schedule() {

  const bookings =
    getBookings()

  return (
    <div>

      <h1>
        My Schedule
      </h1>

      <button
        onClick={() => {
          clearBookings()
          window.location.reload()
        }}
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
          booking => {

            const movie =
              movies.find(
                m =>
                  m.id ===
                  booking.movieId
              )

            return (
              <div
                key={
                  booking.movieId
                }
              >

                <h2>
                  {
                    movie?.title
                  }
                </h2>

              </div>
            )

          }
        )
      }

    </div>
  )
}

export default Schedule