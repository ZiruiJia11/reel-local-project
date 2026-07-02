import "dotenv/config"

import bcrypt from "bcrypt"

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

  const movieSeeds = [
    {
      title: "Citizen Kane",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/c/c0/Citizen_Kane_poster%2C_1941_%28Style_B%2C_unrestored%29.jpg",
      genre: "Drama / Mystery",
      duration: "119 min",
      description:
        "Orson Welles' 1941 drama follows newspaper magnate Charles Foster Kane through the memories of the people who knew him, building a mystery around his final word.",
    },
    {
      title: "The Princess Bride",
      image:
        "https://upload.wikimedia.org/wikipedia/en/d/db/Princess_bride.jpg",
      genre: "Fantasy / Adventure / Comedy",
      duration: "98 min",
      description:
        "Rob Reiner's 1987 fairy-tale adventure follows Westley and Buttercup through sword fights, giants, pirates and a warmly comic storybook romance.",
    },
    {
      title: "Pulp Fiction",
      image:
        "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
      genre: "Crime / Drama",
      duration: "154 min",
      description:
        "Quentin Tarantino's 1994 crime film weaves together intersecting Los Angeles stories about hitmen, a boxer, gangsters and chance encounters.",
    },
    {
      title: "The Shawshank Redemption",
      image:
        "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
      genre: "Drama",
      duration: "142 min",
      description:
        "Frank Darabont's 1994 prison drama follows Andy Dufresne and Red through decades inside Shawshank, centering on friendship, patience and hope.",
    },
    {
      title: "The Third Man",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/7/77/The_Third_Man_%281949_American_theatrical_poster%29.jpg",
      genre: "Film Noir / Mystery",
      duration: "104 min",
      description:
        "Carol Reed's 1949 noir follows writer Holly Martins through post-war Vienna as he investigates the mysterious death of his friend Harry Lime.",
    },
    {
      title: "Rear Window",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/3/38/Rear_Window_film_poster.jpg",
      genre: "Mystery / Thriller",
      duration: "112 min",
      description:
        "Alfred Hitchcock's 1954 thriller follows a photographer confined to his apartment who begins to suspect a neighbour has committed murder.",
    },
    {
      title: "Before Sunrise",
      image:
        "https://upload.wikimedia.org/wikipedia/en/d/da/Before_Sunrise_poster.jpg",
      genre: "Romance / Drama",
      duration: "101 min",
      description:
        "Richard Linklater's 1995 romance follows Jesse and Celine, two strangers who meet on a train and spend one night walking and talking in Vienna.",
    },
    {
      title: "Moonlight",
      image:
        "https://upload.wikimedia.org/wikipedia/en/8/84/Moonlight_%282016_film%29.png",
      genre: "Coming-of-Age Drama",
      duration: "111 min",
      description:
        "Barry Jenkins' 2016 drama traces Chiron's life in three chapters as he grows up in Miami and searches for identity, intimacy and belonging.",
    },
    {
      title: "Spirited Away",
      image:
        "https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png",
      genre: "Animation / Fantasy",
      duration: "125 min",
      description:
        "Hayao Miyazaki's 2001 animated fantasy follows Chihiro into a spirit world, where she works in a bathhouse to rescue her transformed parents.",
    },
    {
      title: "Mad Max: Fury Road",
      image:
        "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg",
      genre: "Action / Post-Apocalyptic",
      duration: "120 min",
      description:
        "George Miller's 2015 action film follows Max and Imperator Furiosa across a wasteland in a high-speed escape from the warlord Immortan Joe.",
    },
  ]

  for (const movieSeed of movieSeeds) {
    const existingMovie =
      await prisma.movie.findFirst({
        where: {
          tenantId: tenant.id,
          title:
            movieSeed.title,
        },
      })

    if (existingMovie) {
      await prisma.movie.update({
        where: {
          id: existingMovie.id,
        },
        data: movieSeed,
      })
    } else {
      await prisma.movie.create({
        data: {
          ...movieSeed,
          tenantId: tenant.id,
        },
      })
    }
  }

  const adminPassword =
    await bcrypt.hash(
      "Admin123!",
      10,
    )

  await prisma.user.upsert({
    where: {
      email: "admin@reellocal.test",
    },
    update: {
      name: "Reel Local Admin",
      role: "ADMIN",
      tenantId: tenant.id,
    },
    create: {
      name: "Reel Local Admin",
      email: "admin@reellocal.test",
      password: adminPassword,
      role: "ADMIN",
      tenantId: tenant.id,
    },
  })

  const movies =
    await prisma.movie.findMany({
      where: {
        tenantId: tenant.id,
      },
    })

  const showtimeOffsets = [
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

  for (const movie of movies) {
    for (const offset of showtimeOffsets) {
      const startsAt =
        new Date()

      startsAt.setDate(
        startsAt.getDate() +
          offset.days,
      )

      startsAt.setHours(
        offset.hour,
        offset.minute,
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
            offset.capacity,
        },
        create: {
          movieId:
            movie.id,
          tenantId:
            tenant.id,
          startsAt,
          capacity:
            offset.capacity,
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
