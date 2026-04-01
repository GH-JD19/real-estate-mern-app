function Testimonials() {
  const reviews = [
    { name: "Rahul Sharma", text: "Amazing service." },
    { name: "Priya Verma", text: "Best platform." },
    { name: "Amit Singh", text: "Highly recommended." }
  ]

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl font-bold mb-14 dark:text-white">
        What Our Clients Say
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <div key={i} className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-yellow-500 mb-3">★★★★★</p>
            <p className="text-gray-600 dark:text-gray-300">{r.text}</p>
            <h4 className="mt-4 font-semibold">{r.name}</h4>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials