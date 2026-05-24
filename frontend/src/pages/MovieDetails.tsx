import { useParams } from "react-router-dom"

function MovieDetails() {

  const { id } = useParams()

  return (
    <div>

      <h1>
        Movie Details
      </h1>

      <p>
        Selected movie:
      </p>

      <h2>
        {id}
      </h2>

    </div>
  )
}

export default MovieDetails