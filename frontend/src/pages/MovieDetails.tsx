import { useParams } from "react-router-dom"
import { movies } from "../services/movieData"
import { addBooking } from "../services/bookingService"
import { getCurrentUser } from "../services/authService"
import "./MovieDetails.css"

function MovieDetails() {

  const { id } = useParams()

  const user =
  getCurrentUser()

  const movie =
    movies.find(
      m => m.id === id
    )

  if (!movie) {
    return (
      <h1>
        Movie not found
      </h1>
    )
  }

  return (
    <div>

      <img
        src={movie.image}
        width="300"
      />

      <h1>
        {movie.title}
      </h1>

      <p>
        {movie.genre}
      </p>

      <p>
        {movie.duration}
      </p>

      <p>
        {movie.description}
      </p>

      {
        user &&
        (
          <button
           onClick={() => {
              addBooking(movie.id)
              alert("Seat booked")
            }}
          >
            Book a Seat
          </button>
        )
      }

      {
        !user &&
        (
          <p>
            Please log in to book a seat.
          </p>
        )
      }

    </div>
  )
}

export default MovieDetails