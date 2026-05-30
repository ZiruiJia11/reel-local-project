import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { movies } from "./data/movies"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  })
})

app.get("/api/movies", (req, res) => {
  res.json(movies)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})