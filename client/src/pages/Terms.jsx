import React from "react"
import { FileText, ShieldCheck, Ban, AlertTriangle } from "lucide-react"

export default function Terms() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-center p-12">

          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            Terms of Use
          </h2>

          <p className="text-lg opacity-90 mb-10 leading-relaxed">
            Understand your rights and responsibilities while using our platform.
          </p>

          <div className="space-y-4 text-sm">
            {[
              "Transparent property platform",
              "Secure user interactions",
              "Responsible platform usage"
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
              Terms & Conditions
            </h1>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              By accessing and using our platform, you agree to comply with the
              following terms and conditions. Please read them carefully.
            </p>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          {[
            {
              icon: <FileText size={20} className="text-blue-600" />,
              title: "Acceptance",
              content:
                "By using our platform, you agree to comply with these terms and conditions."
            },
            {
              icon: <ShieldCheck size={20} className="text-blue-600" />,
              title: "User Responsibilities",
              content: (
                <ul className="space-y-2 text-sm">
                  <li>• Provide accurate information</li>
                  <li>• Avoid fake or misleading listings</li>
                  <li>• Use the platform lawfully</li>
                </ul>
              )
            },
            {
              icon: <AlertTriangle size={20} className="text-blue-600" />,
              title: "Property Listings",
              content:
                "We aim to provide accurate listings but do not guarantee ownership authenticity. Users should verify details independently."
            },
            {
              icon: <Ban size={20} className="text-blue-600" />,
              title: "Prohibited Activities",
              content: (
                <ul className="space-y-2 text-sm">
                  <li>• Fraudulent activities</li>
                  <li>• Unauthorized system access</li>
                  <li>• Misuse of platform or user data</li>
                </ul>
              )
            },
            {
              icon: <FileText size={20} className="text-blue-600" />,
              title: "Limitation of Liability",
              content:
                "We act only as a digital facilitator and are not responsible for transactions between users."
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

                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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