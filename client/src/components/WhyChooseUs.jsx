function WhyChooseUs() {
  const items = ["Trusted Agents", "Secure Transactions", "Wide Listings"]

  return (
    <section className="bg-white dark:bg-gray-800 py-20 text-center">
      <h2 className="text-3xl font-bold mb-14 dark:text-white">
        Why Choose Us
      </h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
        {items.map((title, i) => (
          <div key={i} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Professional real estate services
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseUs