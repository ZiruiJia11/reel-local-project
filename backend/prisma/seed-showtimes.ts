import "dotenv/config"

import bcrypt from "bcrypt"

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter =
  new PrismaPg({
    connectionString:
      process.env.DATABASE_URL,
  })

const prisma =
  new PrismaClient({
    adapter,
  })

const SHOWTIME_TEMPLATES = [
  {
    days: 1,
    hour: 18,
    minute: 30,
    capacity: 40,
  },
  {
    days: 2,
    hour: 20,
    minute: 0,
    capacity: 35,
  },
  {
    days: 4,
    hour: 16,
    minute: 15,
    capacity: 30,
  },
]

async function main() {
  const tenant =
    await prisma.tenant.findFirst()

  if (tenant) {
    const adminPassword =
      await bcrypt.hash(
        process.env.ADMIN_PASSWORD ||
          "Admin123!",
        10,
      )

    await prisma.user.upsert({
      where: {
        email:
          process.env.ADMIN_EMAIL ||
          "admin@reellocal.test",
      },
      update: {
        name: "Reel Local Admin",
        role: "ADMIN",
        tenantId: tenant.id,
      },
      create: {
        name: "Reel Local Admin",
        email:
          process.env.ADMIN_EMAIL ||
          "admin@reellocal.test",
        password:
          adminPassword,
        role: "ADMIN",
        tenantId: tenant.id,
      },
    })
  }

  const movies =
    await prisma.movie.findMany({
      include: {
        tenant: true,
      },
    })

  for (const movie of movies) {
    for (const template of SHOWTIME_TEMPLATES) {
      const startsAt =
        new Date()

      startsAt.setDate(
        startsAt.getDate() +
          template.days,
      )

      startsAt.setHours(
        template.hour,
        template.minute,
        0,
        0,
      )

      await prisma.showtime.upsert({
        where: {
          movieId_startsAt: {
            movieId:
              movie.id,
            startsAt,
          },
        },
        update: {
          capacity:
            template.capacity,
        },
        create: {
          movieId:
            movie.id,
          tenantId:
            movie.tenantId,
          startsAt,
          capacity:
            template.capacity,
        },
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
