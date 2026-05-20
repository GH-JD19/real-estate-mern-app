import React, { memo, useMemo } from "react"

function Testimonials() {

  // ✅ Stable data (no recreation on re-render)
  const reviews = useMemo(() => [
    { id: 1, name: "Rahul Sharma", text: "Amazing service." },
    { id: 2, name: "Priya Verma", text: "Best platform." },
    { id: 3, name: "Amit Singh", text: "Highly recommended." }
  ], [])

  return (
    <section
      className="max-w-7xl mx-auto px-6 py-20 text-center"
      aria-labelledby="testimonials-heading"
    >
      {/* TITLE */}
      <h2
        id="testimonials-heading"
        className="text-3xl font-bold mb-14 dark:text-white"
      >
        What Our Clients Say
      </h2>

      {/* GRID */}
      <div
        className="grid md:grid-cols-3 gap-8"
        role="list"
      >
        {reviews.map((r) => (
          <article
            key={r.id}
            role="listitem"
            className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow"
          >
            {/* RATING */}
            <p className="text-yellow-500 mb-3" aria-label="5 star rating">
              ★★★★★
            </p>

            {/* TEXT */}
            <p className="text-gray-600 dark:text-gray-300">
              {r.text}
            </p>

            {/* NAME */}
            <h4 className="mt-4 font-semibold">
              {r.name}
            </h4>
          </article>
        ))}
      </div>
    </section>
  )
}

export default memo(Testimonials)