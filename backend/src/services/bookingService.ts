import "dotenv/config"

import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({
  adapter,
})

const DEMO_USER_EMAIL =
  "demo@reellocal.com"

const DEMO_TENANT_SLUG =
  "reel-local-demo"

export async function createBooking(movieId: string) {
  const tenant =
    await prisma.tenant.findUnique({
      where: {
        slug: DEMO_TENANT_SLUG,
      },
    })

  if (!tenant) {
    throw new Error("Demo tenant not found")
  }

  const user =
    await prisma.user.upsert({
      where: {
        email: DEMO_USER_EMAIL,
      },
      update: {},
      create: {
        name: "Demo User",
        email: DEMO_USER_EMAIL,
        tenantId: tenant.id,
      },
    })

  return prisma.booking.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      movieId,
    },
    include: {
      movie: true,
    },
  })
}

export async function getBookings() {
  return prisma.booking.findMany({
    include: {
      movie: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function clearBookings() {
  return prisma.booking.deleteMany()
}