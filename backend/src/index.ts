import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getAllMovies } from "./services/movieService"

import {
  createBooking,
  getBookings,
  clearBookings,
} from "./services/bookingService"


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  })
})

app.get("/api/movies", async (req, res) => {
  const movies =
    await getAllMovies()
  res.json(movies)
})

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings =
      await getBookings()

    res.json(bookings)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
    })
  }
})

app.post("/api/bookings", async (req, res) => {
  try {
    const { movieId } =
      req.body

    const booking =
      await createBooking(movieId)

    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking",
    })
  }
})

app.delete("/api/bookings", async (req, res) => {
  try {
    await clearBookings()

    res.json({
      message: "Bookings cleared",
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear bookings",
    })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})