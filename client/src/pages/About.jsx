import React from "react"
import { Target, Building2, Rocket, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function About() {

  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate("/login")
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            About Our Platform
          </h2>

          <p className="text-lg opacity-90 mb-10 leading-relaxed">
            We are redefining real estate with trust, technology and transparency.
          </p>

          <div className="space-y-4 text-sm">

            {[
              "10,000+ Properties Listed",
              "5,000+ Happy Clients",
              "200+ Verified Agents"
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-lg text-white shadow-sm hover:scale-[1.02] transition duration-300"
              >
                ✔ {item}
              </div>
            ))}

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12 lg:p-16 space-y-10 md:space-y-12">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Who We Are
            </h1>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              Welcome to <span className="font-semibold">RealEstate</span>, your trusted
              digital partner in buying, selling, renting and building properties.
              Our platform connects buyers, sellers, and agents through a modern,
              transparent and efficient property marketplace.
            </p>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* MISSION */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">

            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Target className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Our Mission
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To make real estate simple, secure and accessible for everyone.
              </p>
            </div>

          </div>


          {/* WHAT WE OFFER */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">

            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Building2 className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What We Offer
              </h2>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">

                {[
                  "Verified Property Listings",
                  "Smart Location Search",
                  "Construction Planning Support",
                  "Legal Assistance",
                  "Direct Buyer-Seller Communication"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    {item}
                  </li>
                ))}

              </ul>
            </div>

          </div>


          {/* VISION */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">

            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Rocket className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Our Vision
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To become India’s most reliable digital property platform and
                simplify the real estate journey for millions of people.
              </p>
            </div>

          </div>


          {/* CTA SECTION */}
          <div className="mt-6 p-6 rounded-xl bg-blue-600 text-white text-center shadow-md">

            <h3 className="text-xl font-semibold mb-2">
              Ready to find your dream property?
            </h3>

            <p className="text-sm opacity-90 mb-4">
              Start exploring verified listings and connect directly with sellers.
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 hover:gap-3 transition-all duration-300 active:scale-95"
            >
              Get Started
              <ArrowRight size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}