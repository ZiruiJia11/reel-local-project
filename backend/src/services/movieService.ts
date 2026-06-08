import { prisma } from "../db/prisma"

export async function getAllMovies() {
  const movies =
    await prisma.movie.findMany({
      include: {
        showtimes: {
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
          orderBy: {
            startsAt: "asc",
          },
        },
      },
    })

  return movies.map(movie => ({
    ...movie,
    showtimes:
      movie.showtimes.map(showtime => {
        const bookedTickets =
          showtime.bookings.reduce(
            (total, booking) =>
              total + booking.ticketCount,
            0,
          )

        return {
          id: showtime.id,
          startsAt: showtime.startsAt,
          capacity: showtime.capacity,
          remainingTickets:
            Math.max(
              showtime.capacity -
                bookedTickets,
              0,
            ),
        }
      }),
  }))
}
