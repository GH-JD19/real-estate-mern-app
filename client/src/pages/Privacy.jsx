import React from "react"
import { ShieldCheck, Database, Lock, UserCheck } from "lucide-react"

export default function Privacy() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            Privacy Matters
          </h2>

          <p className="text-lg opacity-90 mb-10 leading-relaxed">
            Your data security and privacy are our top priorities.
          </p>

          <div className="space-y-4 text-sm">
            {[
              "Secure data handling",
              "Transparent policies",
              "User data protection"
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
              Privacy Policy
            </h1>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              We respect your privacy and are committed to protecting your personal data.
              This policy explains how we collect, use, and safeguard your information.
            </p>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* SECTION */}
          {[
            {
              icon: <Database size={20} className="text-blue-600" />,
              title: "Information We Collect",
              content: (
                <ul className="space-y-2 text-sm">
                  <li>• Name and contact details</li>
                  <li>• Location and search preferences</li>
                  <li>• Platform usage behavior</li>
                </ul>
              )
            },
            {
              icon: <UserCheck size={20} className="text-blue-600" />,
              title: "How We Use Your Data",
              content: (
                <ul className="space-y-2 text-sm">
                  <li>• Provide personalized property listings</li>
                  <li>• Improve platform performance</li>
                  <li>• Enhance security and prevent fraud</li>
                </ul>
              )
            },
            {
              icon: <Lock size={20} className="text-blue-600" />,
              title: "Data Protection",
              content: (
                <p className="text-sm leading-relaxed">
                  We use modern encryption, secure authentication, and
                  industry-standard security practices to protect your
                  personal information.
                </p>
              )
            },
            {
              icon: <ShieldCheck size={20} className="text-blue-600" />,
              title: "Your Rights",
              content: (
                <ul className="space-y-2 text-sm">
                  <li>• Access your stored data</li>
                  <li>• Update your information</li>
                  <li>• Request account or data deletion</li>
                </ul>
              )
            }
          ].map((section, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                {section.icon}
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>

                <div className="text-gray-600 dark:text-gray-300">
                  {section.content}
                </div>
              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  )
}