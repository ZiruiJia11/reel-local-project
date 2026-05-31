import "dotenv/config"

import { PrismaClient } from "../src/generated/prisma/client"

import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  const tenant =
    await prisma.tenant.upsert({
      where: {
        slug: "reel-local-demo",
      },
      update: {},
      create: {
        name: "Reel Local Demo Cinema",
        slug: "reel-local-demo",
      },
    })

  await prisma.movie.createMany({
    data: [
      {
        title: "Citizen Kane",
        image: "/movies/citizen_kane.jpg",
        genre: "Drama",
        duration: "119 min",
        description:
          "A classic drama exploring power, ambition, memory and legacy through the life of a newspaper magnate.",
        tenantId: tenant.id,
      },
      {
        title: "The Princess Bride",
        image: "/movies/princess_bride.jpg",
        genre: "Adventure / Comedy",
        duration: "98 min",
        description:
          "A charming fantasy adventure filled with romance, humour, sword fights and unforgettable characters.",
        tenantId: tenant.id,
      },
      {
        title: "Pulp Fiction",
        image: "/movies/pulpfiction.jpg",
        genre: "Crime / Drama",
        duration: "154 min",
        description:
          "An iconic crime film with intersecting stories, sharp dialogue and a bold non-linear structure.",
        tenantId: tenant.id,
      },
      {
        title: "The Shawshank Redemption",
        image: "/movies/shawshank.jpg",
        genre: "Drama",
        duration: "142 min",
        description:
          "A powerful story of hope, friendship and resilience inside a prison system.",
        tenantId: tenant.id,
      },
      {
        title: "The Third Man",
        image: "/movies/third_man.jpg",
        genre: "Film Noir",
        duration: "104 min",
        description:
          "A stylish post-war mystery set in Vienna, known for its atmosphere, suspense and visual style.",
        tenantId: tenant.id,
      },
    ],
    skipDuplicates: true,
  })
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