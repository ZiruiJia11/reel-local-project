import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getAllMovies } from "./services/movieService"

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

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})