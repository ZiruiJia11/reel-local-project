import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import Schedule from "./pages/Schedule"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"


function App() {
  return (
    <BrowserRouter>

      <Layout>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/movies" element={<Movies />} />
          
          <Route path="/movies/:id" element={<MovieDetails />} />

          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
    
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        </Routes>

      </Layout>

    </BrowserRouter>
  )
}

export default App