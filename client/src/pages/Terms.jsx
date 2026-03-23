import React from "react"
import { FileText, ShieldCheck, Ban, AlertTriangle } from "lucide-react"

export default function Terms() {

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6">
            Terms of Use
          </h2>

          <p className="text-lg opacity-90 mb-10">
            Understand your rights and responsibilities while using our platform.
          </p>

          <div className="space-y-4 text-sm">

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ Transparent property platform
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ Secure user interactions
            </div>

            <div className="bg-white dark:bg-gray-800/10 backdrop-blur p-3 rounded-lg">
              ✔ Responsible platform usage
            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-6 md:p-10 md:p-12 space-y-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Terms & Conditions
          </h1>


          {/* ACCEPTANCE */}
          <div className="flex gap-4">

            <FileText className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                1. Acceptance
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                By using our platform, you agree to comply with these terms
                and conditions.
              </p>

            </div>

          </div>


          {/* USER RESPONSIBILITIES */}
          <div className="flex gap-4">

            <ShieldCheck className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                2. User Responsibilities
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Provide accurate information</li>
                <li>Avoid fake or misleading listings</li>
                <li>Use the platform lawfully</li>

              </ul>

            </div>

          </div>


          {/* PROPERTY LISTINGS */}
          <div className="flex gap-4">

            <AlertTriangle className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                3. Property Listings
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                While we aim to provide accurate listings, we do not guarantee
                ownership authenticity or property details. Users should verify
                information independently.
              </p>

            </div>

          </div>


          {/* PROHIBITED ACTIVITIES */}
          <div className="flex gap-4">

            <Ban className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                4. Prohibited Activities
              </h2>

              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">

                <li>Fraudulent activities</li>
                <li>Unauthorized access to systems</li>
                <li>Misuse of user or platform data</li>

              </ul>

            </div>

          </div>


          {/* LIMITATION */}
          <div className="flex gap-4">

            <FileText className="text-blue-600 mt-1" size={24} />

            <div>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                5. Limitation of Liability
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                Our platform acts solely as a digital facilitator connecting
                buyers, sellers, and agents. We are not responsible for
                transactions between parties.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}