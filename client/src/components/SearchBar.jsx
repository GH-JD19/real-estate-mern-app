import { useState } from "react"
import { useNavigate } from "react-router-dom"

function SearchBar() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    location: "",
    purpose: "",
    minPrice: "",
    maxPrice: ""
  })

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    )

    const query = new URLSearchParams(cleanFilters).toString()
    navigate(`/properties?${query}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl"
    >
      <div className="relative">
        <span className="absolute left-3 top-3">📍</span>
        <input
          type="text"
          placeholder="Location"
          onChange={(e) => handleChange("location", e.target.value)}
          className="w-full pl-10 p-3 rounded-lg border border-gray-300 
            bg-white text-gray-800 placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      <select
        onChange={(e) => handleChange("purpose", e.target.value)}
        className="p-3 rounded-lg border border-gray-300 
          bg-white text-gray-800
          focus:ring-2 focus:ring-blue-500
          dark:bg-gray-900 dark:text-white dark:border-gray-700"
      >
        <option value="">Purpose</option>
        <option value="buy">Buy</option>
        <option value="rent">Rent</option>
        <option value="sell">Sell</option>
      </select>

      <input
        type="number"
        placeholder="Min Price"
        onChange={(e) => handleChange("minPrice", e.target.value)}
        className="w-full pl-10 p-3 rounded-lg border border-gray-300 
            bg-white text-gray-800 placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-900 dark:text-white dark:border-gray-700"
      />

      <input
        type="number"
        placeholder="Max Price"
        onChange={(e) => handleChange("maxPrice", e.target.value)}
        className="w-full pl-10 p-3 rounded-lg border border-gray-300 
            bg-white text-gray-800 placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-900 dark:text-white dark:border-gray-700"
      />

      <button className="w-full md:w-auto bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition py-3">
        Search
      </button>
    </form>
  )
}

export default SearchBar