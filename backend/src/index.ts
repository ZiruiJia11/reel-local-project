import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getAllMovies } from "./services/movieService"

import {
  createBooking,
  getBookings,
  clearBookings,
} from "./services/bookingService"

import {
  registerUser,
  loginUser,
} from "./services/authService"

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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } =
      req.body

    const user =
      await registerUser(
        name,
        email,
        password,
      )

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } =
      req.body

    const result =
      await loginUser(
        email,
        password,
      )

    res.json({
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    })
  } catch (error) {
    res.status(401).json({
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    })
  }
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