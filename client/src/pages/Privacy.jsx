import React from "react"
import { ShieldCheck, Database, Lock, UserCheck } from "lucide-react"

export default function Privacy() {

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6">
            Privacy Matters
          </h2>

          <p className="text-lg opacity-90 mb-10">
            Your data security and privacy are our top priorities.
          </p>

          <div className="space-y-4 text-sm">

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ Secure data handling
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ Transparent policies
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ User data protection
            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-6 md:p-6 md:p-6 md:p-6 md:p-6 md:p-6 md:p-10 md:p-12 space-y-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Privacy Policy
          </h1>


          {/* INFORMATION COLLECTED */}
          <div className="flex gap-4">

            <Database className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Information We Collect
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Name and contact details</li>
                <li>Location and search preferences</li>
                <li>Platform usage behavior</li>

              </ul>

            </div>

          </div>


          {/* HOW DATA USED */}
          <div className="flex gap-4">

            <UserCheck className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                How We Use Your Data
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Provide personalized property listings</li>
                <li>Improve platform performance</li>
                <li>Enhance security and prevent fraud</li>

              </ul>

            </div>

          </div>


          {/* DATA PROTECTION */}
          <div className="flex gap-4">

            <Lock className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Data Protection
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                We use modern encryption, secure authentication,
                and industry-standard security practices to
                protect your personal information.
              </p>

            </div>

          </div>


          {/* USER RIGHTS */}
          <div className="flex gap-4">

            <ShieldCheck className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Your Rights
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Access your stored data</li>
                <li>Update your information</li>
                <li>Request account or data deletion</li>

              </ul>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}