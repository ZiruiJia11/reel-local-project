export type Booking = {
  movieId: string
}

const STORAGE_KEY =
  "reel-local-bookings"

export function getBookings(): Booking[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    )

  return data
    ? JSON.parse(data)
    : []

}

export function addBooking(
  movieId: string
) {

  const bookings =
    getBookings()

  bookings.push({
    movieId,
  })

  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      bookings
    )
  )

}

export function clearBookings() {

  localStorage.removeItem(
    STORAGE_KEY
  )

}