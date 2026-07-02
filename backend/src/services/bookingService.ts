import { prisma } from "../db/prisma"

export async function createBooking(
  movieId: string,
  userId: string,
  showtimeId: string,
  ticketCount: number,
) {
  if (
    !Number.isInteger(ticketCount) ||
    ticketCount < 1 ||
    ticketCount > 10
  ) {
    throw new Error("Ticket count must be between 1 and 10")
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.role === "ADMIN") {
    throw new Error("Admins cannot book tickets")
  }

  const showtime =
    await prisma.showtime.findFirst({
      where: {
        id: showtimeId,
        movieId,
        tenantId:
          user.tenantId,
      },
      include: {
        bookings: {
          where: {
            status: "CONFIRMED",
          },
          select: {
            ticketCount: true,
          },
        },
      },
    })

  if (!showtime) {
    throw new Error("Showtime not found")
  }

  const bookedTickets =
    showtime.bookings.reduce(
      (total, booking) =>
        total + booking.ticketCount,
      0,
    )

  const remainingTickets =
    showtime.capacity -
    bookedTickets

  if (ticketCount > remainingTickets) {
    throw new Error("Not enough tickets available")
  }

  return prisma.booking.create({
    data: {
      tenantId:
        user.tenantId,
      userId: user.id,
      movieId,
      showtimeId,
      ticketCount,
    },
    include: {
      movie: true,
      showtime: true,
    },
  })
}

export async function getBookings(
  userId: string,
) {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      movie: true,
      showtime: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function clearBookings(
  userId: string,
) {
  return prisma.booking.deleteMany({
    where: {
      userId,
    },
  })
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
) {
  return prisma.booking.deleteMany({
    where: {
      id: bookingId,
      userId,
    },
  })
}
