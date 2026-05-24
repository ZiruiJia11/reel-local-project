import { BrowserRouter, Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Movies from "./pages/Movies"
import Schedule from "./pages/Schedule"
import Profile from "./pages/Profile"

function App() {
  return (
    <BrowserRouter>

      <Layout>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/movies" element={<Movies />} />

          <Route path="/schedule" element={<Schedule />} />

          <Route path="/profile" element={<Profile />} />

        </Routes>

      </Layout>

    </BrowserRouter>
  )
}

export default App