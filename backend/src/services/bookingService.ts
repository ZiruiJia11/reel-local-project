import { prisma } from "../db/prisma"

export async function createBooking(
  movieId: string,
  userId: string,
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

  if (!user) {
    throw new Error("User not found")
  }

  return prisma.booking.create({
    data: {
      tenantId:
        user.tenantId,
      userId: user.id,
      movieId,
    },
    include: {
      movie: true,
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
