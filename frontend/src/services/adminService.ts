import { API_URL } from "../config/api"
import { getErrorMessage } from "./apiError"
import { getToken } from "./authService"
import type { Movie } from "../types/Movie"

export type AdminBooking = {
  id: string
  ticketCount: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  movie: {
    title: string
  }
  showtime?: {
    startsAt: string
  } | null
}

export type MovieUpdate = {
  title: string
  image: string
  genre: string
  duration: string
  description: string
}

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

export async function updateMovie(
  movieId: string,
  updates: MovieUpdate,
): Promise<Movie> {
  const response =
    await fetch(
      `${API_URL}/api/admin/movies/${movieId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      },
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to update movie",
      )

    throw new Error(message)
  }

  return response.json()
}

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const response =
    await fetch(
      `${API_URL}/api/admin/bookings`,
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

export async function cancelAdminBooking(
  bookingId: string,
) {
  const response =
    await fetch(
      `${API_URL}/api/admin/bookings/${bookingId}`,
      {
        method: "DELETE",
        headers:
          getAuthHeaders(),
      },
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to cancel booking",
      )

    throw new Error(message)
  }
}
