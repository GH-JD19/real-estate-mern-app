import React from "react"
import { FileText, ShieldCheck, Ban, AlertTriangle } from "lucide-react"

// Static content
const LEFT_POINTS = [
  "Transparent property platform",
  "Secure user interactions",
  "Responsible platform usage"
]

const SECTIONS = [
  {
    icon: FileText,
    title: "Acceptance",
    content:
      "By using our platform, you agree to comply with these terms and conditions."
  },
  {
    icon: ShieldCheck,
    title: "User Responsibilities",
    content: [
      "Provide accurate information",
      "Avoid fake or misleading listings",
      "Use the platform lawfully"
    ]
  },
  {
    icon: AlertTriangle,
    title: "Property Listings",
    content:
      "We aim to provide accurate listings but do not guarantee ownership authenticity. Users should verify details independently."
  },
  {
    icon: Ban,
    title: "Prohibited Activities",
    content: [
      "Fraudulent activities",
      "Unauthorized system access",
      "Misuse of platform or user data"
    ]
  },
  {
    icon: FileText,
    title: "Limitation of Liability",
    content:
      "We act only as a digital facilitator and are not responsible for transactions between users."
  }
]

export default function Terms() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-center p-12">

          <header>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              Terms of Use
            </h2>

            <p className="text-lg opacity-90 mb-10 leading-relaxed">
              Understand your rights and responsibilities while using our platform.
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
              Terms & Conditions
            </h1>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              By accessing and using our platform, you agree to comply with the
              following terms and conditions. Please read them carefully.
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