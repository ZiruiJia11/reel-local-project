import { API_URL } from "../config/api"
import { getToken } from "./authService"

function getAuthHeaders(): Record<string, string> {
  const token =
    getToken()

  return token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {}
}

export async function getBookings() {

  const response =
    await fetch(
      `${API_URL}/api/bookings`,
      {
        headers:
          getAuthHeaders(),
      },
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
          ...getAuthHeaders(),
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
      headers:
        getAuthHeaders(),
    }
  )

}
