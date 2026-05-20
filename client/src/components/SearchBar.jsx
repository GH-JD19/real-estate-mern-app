import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

function SearchBar() {
  const navigate = useNavigate()

  const initialState = {
    location: "",
    purpose: "",
    minPrice: "",
    maxPrice: ""
  }

  const [filters, setFilters] = useState(initialState)
  const [debouncedFilters, setDebouncedFilters] = useState(initialState)

  // ✅ Debounce (stable + simple)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 400)

    return () => clearTimeout(timer)
  }, [filters])

  // ✅ Handle input change
  const handleChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // ✅ Search handler
  const handleSearch = useCallback((e) => {
    e.preventDefault()

    const min = Number(filters.minPrice)
    const max = Number(filters.maxPrice)

    // Validation
    if (
      filters.minPrice &&
      filters.maxPrice &&
      min > max
    ) {
      alert("Min price cannot be greater than max price")
      return
    }

    // Clean query
    const cleanFilters = Object.fromEntries(
      Object.entries(debouncedFilters).filter(([_, v]) => v !== "")
    )

    const query = new URLSearchParams(cleanFilters).toString()

    navigate(query ? `/properties?${query}` : "/properties")

  }, [filters, debouncedFilters, navigate])

  // ✅ Reset
  const handleReset = useCallback(() => {
    setFilters(initialState)
    setDebouncedFilters(initialState)
  }, [])

  return (
    <form
      onSubmit={handleSearch}
      className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
    >

      {/* LOCATION */}
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">📍</span>
        <input
          type="text"
          value={filters.location}
          placeholder="Location"
          onChange={(e) => handleChange("location", e.target.value)}
          className="w-full pl-10 p-3 rounded-lg border border-gray-300 
          bg-white text-gray-900 placeholder-gray-500
          focus:ring-2 focus:ring-blue-500
          dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
        />
      </div>

      {/* PURPOSE */}
      <select
        value={filters.purpose}
        onChange={(e) => handleChange("purpose", e.target.value)}
        className="p-3 rounded-lg border border-gray-300 
        bg-white text-gray-900
        focus:ring-2 focus:ring-blue-500
        dark:bg-gray-900 dark:text-white dark:border-gray-700"
      >
        <option value="">Purpose</option>
        <option value="buy">Buy</option>
        <option value="rent">Rent</option>
        <option value="sell">Sell</option>
      </select>

      {/* MIN PRICE */}
      <input
        type="number"
        min="0"
        value={filters.minPrice}
        placeholder="Min Price"
        onChange={(e) => handleChange("minPrice", e.target.value)}
        className="p-3 rounded-lg border border-gray-300 
        bg-white text-gray-900 placeholder-gray-500
        focus:ring-2 focus:ring-blue-500
        dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
      />

      {/* MAX PRICE */}
      <input
        type="number"
        min="0"
        value={filters.maxPrice}
        placeholder="Max Price"
        onChange={(e) => handleChange("maxPrice", e.target.value)}
        className="p-3 rounded-lg border border-gray-300 
        bg-white text-gray-900 placeholder-gray-500
        focus:ring-2 focus:ring-blue-500
        dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
      />

      {/* BUTTONS */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition py-3">
          Search
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition py-3"
        >
          Reset
        </button>
      </div>

    </form>
  )
}

export default SearchBar