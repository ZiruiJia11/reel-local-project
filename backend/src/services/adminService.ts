import { prisma } from "../db/prisma"

type MovieUpdateInput = {
  title?: string
  image?: string
  genre?: string
  duration?: string
  description?: string
}

type ShowtimeInput = {
  startsAt?: string
  capacity?: number
}

function cleanMovieInput(input: MovieUpdateInput) {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) =>
        typeof value === "string" &&
        value.trim().length > 0,
    ),
  )
}

export async function createMovie(
  input: MovieUpdateInput,
) {
  const data =
    cleanMovieInput(input)

  const requiredFields = [
    "title",
    "image",
    "genre",
    "duration",
    "description",
  ]

  const missingField =
    requiredFields.find(
      field =>
        typeof data[field] !== "string",
    )

  if (missingField) {
    throw new Error("All movie fields are required")
  }

  const tenant =
    await prisma.tenant.findFirst()

  if (!tenant) {
    throw new Error("Tenant not found")
  }

  return prisma.movie.create({
    data: {
      title: data.title as string,
      image: data.image as string,
      genre: data.genre as string,
      duration: data.duration as string,
      description: data.description as string,
      tenantId: tenant.id,
    },
    include: {
      showtimes: true,
    },
  })
}

export async function updateMovie(
  movieId: string,
  input: MovieUpdateInput,
) {
  const data =
    cleanMovieInput(input)

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

export async function deleteMovie(
  movieId: string,
) {
  await prisma.booking.deleteMany({
    where: {
      movieId,
    },
  })

  await prisma.showtime.deleteMany({
    where: {
      movieId,
    },
  })

  return prisma.movie.delete({
    where: {
      id: movieId,
    },
  })
}

export async function createShowtime(
  movieId: string,
  input: ShowtimeInput,
) {
  const capacity =
    input.capacity

  if (!input.startsAt) {
    throw new Error("Showtime date is required")
  }

  if (
    !Number.isInteger(capacity) ||
    !capacity ||
    capacity < 1
  ) {
    throw new Error("Capacity must be at least 1")
  }

  const movie =
    await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
    })

  if (!movie) {
    throw new Error("Movie not found")
  }

  return prisma.showtime.create({
    data: {
      movieId,
      tenantId: movie.tenantId,
      startsAt: new Date(input.startsAt),
      capacity,
    },
  })
}

export async function updateShowtime(
  showtimeId: string,
  input: ShowtimeInput,
) {
  const data: {
    startsAt?: Date
    capacity?: number
  } = {}

  if (input.startsAt) {
    data.startsAt =
      new Date(input.startsAt)
  }

  if (input.capacity !== undefined) {
    if (
      !Number.isInteger(input.capacity) ||
      input.capacity < 1
    ) {
      throw new Error("Capacity must be at least 1")
    }

    data.capacity =
      input.capacity
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No showtime updates provided")
  }

  return prisma.showtime.update({
    where: {
      id: showtimeId,
    },
    data,
  })
}

export async function deleteShowtime(
  showtimeId: string,
) {
  await prisma.booking.deleteMany({
    where: {
      showtimeId,
    },
  })

  return prisma.showtime.delete({
    where: {
      id: showtimeId,
    },
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
