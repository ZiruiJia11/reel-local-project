import { API_URL } from "../config/api"
import { getErrorMessage } from "./apiError"
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

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to fetch bookings",
      )

    throw new Error(message)
  }

  return response.json()

}

export async function addBooking(
  movieId: string,
  showtimeId: string,
  ticketCount: number,
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
          showtimeId,
          ticketCount,
        }),
      }
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to create booking",
      )

    throw new Error(message)
  }

  return response.json()

}

export async function clearBookings() {

  const response =
    await fetch(
      `${API_URL}/api/bookings`,
      {
        method: "DELETE",
        headers:
          getAuthHeaders(),
      }
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to clear bookings",
      )

    throw new Error(message)
  }

}
