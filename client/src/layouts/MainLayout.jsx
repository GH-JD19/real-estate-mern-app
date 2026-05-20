import { memo } from "react"
import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"

const MainLayout = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {/* 🔹 HEADER */}
      <Header />

      {/* 🔹 MAIN CONTENT */}
      <main
        className="flex-1 w-full overflow-x-hidden"
        role="main"
      >
        <Outlet />
      </main>

      {/* 🔹 FOOTER */}
      <Footer />

    </div>
  )
}

// 🔹 PREVENT UNNECESSARY RE-RENDERS
export default memo(MainLayout)