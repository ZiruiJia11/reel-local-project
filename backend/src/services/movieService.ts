import { prisma } from "../db/prisma"

export async function getAllMovies() {
  return prisma.movie.findMany()
}
