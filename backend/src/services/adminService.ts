import { prisma } from "../db/prisma"

type MovieUpdateInput = {
  title?: string
  image?: string
  genre?: string
  duration?: string
  description?: string
}

export async function updateMovie(
  movieId: string,
  input: MovieUpdateInput,
) {
  const data =
    Object.fromEntries(
      Object.entries(input).filter(
        ([, value]) =>
          typeof value === "string" &&
          value.trim().length > 0,
      ),
    )

  if (Object.keys(data).length === 0) {
    throw new Error("No movie updates provided")
  }

  return prisma.movie.update({
    where: {
      id: movieId,
    },
    data,
  })
}

export async function getAdminBookings() {
  return prisma.booking.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      movie: true,
      showtime: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function cancelAnyBooking(
  bookingId: string,
) {
  return prisma.booking.deleteMany({
    where: {
      id: bookingId,
    },
  })
}
