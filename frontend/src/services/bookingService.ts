const API_URL =
  "http://localhost:3001"

export async function getBookings() {

  const response =
    await fetch(
      `${API_URL}/api/bookings`
    )

  return response.json()

}

export async function addBooking(
  movieId: string
) {

  const response =
    await fetch(
      `${API_URL}/api/bookings`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          movieId,
        }),
      }
    )

  return response.json()

}

export async function clearBookings() {

  await fetch(
    `${API_URL}/api/bookings`,
    {
      method: "DELETE",
    }
  )

}