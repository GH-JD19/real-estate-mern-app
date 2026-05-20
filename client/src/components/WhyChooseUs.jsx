import React, { memo, useMemo } from "react"

function WhyChooseUs() {

  // ✅ Stable data
  const items = useMemo(() => [
    { id: 1, title: "Trusted Agents" },
    { id: 2, title: "Secure Transactions" },
    { id: 3, title: "Wide Listings" }
  ], [])

  return (
    <section
      className="bg-white dark:bg-gray-800 py-20 text-center"
      aria-labelledby="why-choose-us-heading"
    >
      {/* TITLE */}
      <h2
        id="why-choose-us-heading"
        className="text-3xl font-bold mb-14 dark:text-white"
      >
        Why Choose Us
      </h2>

      {/* GRID */}
      <div
        className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6"
        role="list"
      >
        {items.map((item) => (
          <article
            key={item.id}
            role="listitem"
            className="p-8 bg-gray-50 dark:bg-gray-900 rounded-xl shadow"
          >
            <h3 className="text-xl font-semibold mb-3">
              {item.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300">
              Professional real estate services
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default memo(WhyChooseUs)