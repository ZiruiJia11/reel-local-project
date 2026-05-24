const movies = [
  {
    title: "Citizen Kane",
    image: "/movies/citizen_kane.jpg",
  },

  {
    title: "The Princess Bride",
    image: "/movies/princess_bride.jpg",
  },

  {
    title: "Pulp Fiction",
    image: "/movies/pulpfiction.jpg",
  },

  {
    title: "The Shawshank Redemption",
    image: "/movies/shawshank.jpg",
  },

  {
    title: "The Third Man",
    image: "/movies/third_man.jpg",
  },
]

function Movies() {
  return (
    <div className="movie-grid">

      {
        movies.map(movie => (

          <div
            className="movie-card"
            key={movie.title}
          >

            <img
              src={movie.image}
            />

            <h2>
              {movie.title}
            </h2>

          </div>

        ))
      }

    </div>
  )
}

export default Movies