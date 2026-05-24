import type { ReactNode } from "react"
import Navbar from "./Navbar"

type Props = {
  children: ReactNode
}

function Layout({ children }: Props) {
  return (
    <>
      <Navbar />

      <main
        style={{
          padding: "40px"
        }}
      >
        {children}
      </main>
    </>
  )
}

export default Layout