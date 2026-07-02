import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getAllMovies } from "./services/movieService"

import {
  cancelBooking,
  createBooking,
  getBookings,
  clearBookings,
} from "./services/bookingService"

import {
  registerUser,
  loginUser,
} from "./services/authService"
import {
  authenticateUser,
} from "./middleware/authMiddleware"

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

app.get("/api/bookings", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const bookings =
      await getBookings(
        req.user.userId,
      )

    res.json(bookings)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
    })
  }
})

app.post("/api/bookings", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const {
      movieId,
      showtimeId,
      ticketCount,
    } =
      req.body

    const booking =
      await createBooking(
        movieId,
        req.user.userId,
        showtimeId,
        Number(ticketCount),
      )

    res.status(201).json(booking)
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create booking",
    })
  }
})

app.delete("/api/bookings", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    await clearBookings(
      req.user.userId,
    )

    res.json({
      message: "Bookings cleared",
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear bookings",
    })
  }
})

app.delete("/api/bookings/:bookingId", authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const bookingId =
      req.params.bookingId

    if (typeof bookingId !== "string") {
      return res.status(400).json({
        message: "Booking id is required",
      })
    }

    await cancelBooking(
      bookingId,
      req.user.userId,
    )

    res.json({
      message: "Booking cancelled",
    })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel booking",
    })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
