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

export type ShowtimeUpdate = {
  startsAt: string
  capacity: number
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

export async function createMovie(
  movie: MovieUpdate,
): Promise<Movie> {
  const response =
    await fetch(
      `${API_URL}/api/admin/movies`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(movie),
      },
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to create movie",
      )

    throw new Error(message)
  }

  return response.json()
}

export async function deleteMovie(
  movieId: string,
) {
  const response =
    await fetch(
      `${API_URL}/api/admin/movies/${movieId}`,
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
        "Failed to delete movie",
      )

    throw new Error(message)
  }
}

export async function createShowtime(
  movieId: string,
  showtime: ShowtimeUpdate,
) {
  const response =
    await fetch(
      `${API_URL}/api/admin/movies/${movieId}/showtimes`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(showtime),
      },
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to create showtime",
      )

    throw new Error(message)
  }

  return response.json()
}

export async function updateShowtime(
  showtimeId: string,
  showtime: ShowtimeUpdate,
) {
  const response =
    await fetch(
      `${API_URL}/api/admin/showtimes/${showtimeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(showtime),
      },
    )

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        "Failed to update showtime",
      )

    throw new Error(message)
  }

  return response.json()
}

export async function deleteShowtime(
  showtimeId: string,
) {
  const response =
    await fetch(
      `${API_URL}/api/admin/showtimes/${showtimeId}`,
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
        "Failed to delete showtime",
      )

    throw new Error(message)
  }
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
