import React from "react"
import { Target, Building2, Rocket } from "lucide-react"

export default function About() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6">
            About Our Platform
          </h2>

          <p className="text-lg opacity-90 mb-10">
            We are redefining real estate with trust, technology and transparency.
          </p>

          <div className="space-y-4 text-sm">

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ 10,000+ Properties Listed
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ 5,000+ Happy Clients
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ 200+ Verified Agents
            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-6 md:p-10 md:p-12 space-y-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Who We Are
          </h1>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to <span className="font-semibold">RealEstate</span>, your trusted
            digital partner in buying, selling, renting and building properties.
            Our platform connects buyers, sellers, and agents through a modern,
            transparent and efficient property marketplace.
          </p>


          {/* MISSION */}
          <div className="flex gap-4">

            <Target className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">
                Our Mission
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                To make real estate simple, secure and accessible for everyone.
              </p>

            </div>

          </div>


          {/* WHAT WE OFFER */}
          <div className="flex gap-4">

            <Building2 className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                What We Offer
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Verified Property Listings</li>
                <li>Smart Location Search</li>
                <li>Construction Planning Support</li>
                <li>Legal Assistance</li>
                <li>Direct Buyer-Seller Communication</li>

              </ul>

            </div>

          </div>


          {/* VISION */}
          <div className="flex gap-4">

            <Rocket className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">
                Our Vision
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                To become India’s most reliable digital property platform and
                simplify the real estate journey for millions of people.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}