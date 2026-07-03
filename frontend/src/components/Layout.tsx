import type { ReactNode } from "react"
import Navbar from "./Navbar"
import "./Layout.css"

type Props = {
  children: ReactNode
}

function Layout({ children }: Props) {
  return (
    <>
      <Navbar />

      <main className="app-shell">
        {children}
      </main>
    </>
  )
}

export default Layout
