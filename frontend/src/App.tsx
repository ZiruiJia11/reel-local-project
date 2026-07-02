import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import Schedule from "./pages/Schedule"
import Profile from "./pages/Profile"
import Admin from "./pages/Admin"
import ProtectedRoute from "./components/ProtectedRoute"
import Register from "./pages/Register"


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

          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><Admin /></ProtectedRoute>} />

          <Route path="/register" element={<Register />} />

        </Routes>

      </Layout>

    </BrowserRouter>
  )
}

export default App
