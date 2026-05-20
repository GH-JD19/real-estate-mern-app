import React from "react"
import { ShieldCheck, Database, Lock, UserCheck } from "lucide-react"

// Static content (prevents re-creation on each render)
const LEFT_POINTS = [
  "Secure data handling",
  "Transparent policies",
  "User data protection"
]

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    content: [
      "Name and contact details",
      "Location and search preferences",
      "Platform usage behavior"
    ]
  },
  {
    icon: UserCheck,
    title: "How We Use Your Data",
    content: [
      "Provide personalized property listings",
      "Improve platform performance",
      "Enhance security and prevent fraud"
    ]
  },
  {
    icon: Lock,
    title: "Data Protection",
    content: `We use modern encryption, secure authentication, and
    industry-standard security practices to protect your
    personal information.`
  },
  {
    icon: ShieldCheck,
    title: "Your Rights",
    content: [
      "Access your stored data",
      "Update your information",
      "Request account or data deletion"
    ]
  }
]

export default function Privacy() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-center p-12">

          <header>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              Privacy Matters
            </h2>

            <p className="text-lg opacity-90 mb-10 leading-relaxed">
              Your data security and privacy are our top priorities.
            </p>
          </header>

          <div className="space-y-4 text-sm">
            {LEFT_POINTS.map((item) => (
              <div
                key={item}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-lg text-white shadow-sm hover:scale-[1.02] transition duration-300"
              >
                ✔ {item}
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12 lg:p-16 space-y-10 md:space-y-12">

          <header>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              We respect your privacy and are committed to protecting your personal data.
              This policy explains how we collect, use, and safeguard your information.
            </p>
          </header>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* SECTIONS */}
          {SECTIONS.map((section) => {
            const Icon = section.icon

            return (
              <section
                key={section.title}
                className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 shrink-0">
                  <Icon className="text-blue-600" size={20} />
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h2>

                  <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {Array.isArray(section.content) ? (
                      <ul className="space-y-2">
                        {section.content.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{section.content}</p>
                    )}
                  </div>
                </div>
              </section>
            )
          })}

        </div>

      </div>

    </section>
  )
}