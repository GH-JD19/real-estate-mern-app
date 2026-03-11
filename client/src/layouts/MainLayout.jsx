import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"

function MainLayout() {

  return (
    <div className="min-h-screen flex flex-col">

      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  )
}

export default MainLayout