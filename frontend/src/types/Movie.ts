export type Showtime = {
  id: string
  startsAt: string
  capacity: number
  remainingTickets: number
}

export type Movie = {
  id: string
  title: string
  image: string
  genre: string
  duration: string
  description: string
  showtimes: Showtime[]
}
