import { useNavigate } from "react-router-dom"
import { useMemo, useCallback, useState } from "react"
import { Home, PlusCircle, Clock, XCircle } from "lucide-react"

function ManageProperties() {

  const navigate = useNavigate()
  const [navigating, setNavigating] = useState(false)

  // ================= NAVIGATION =================
  const handleNavigate = useCallback((route) => {
    if (navigating) return
    setNavigating(true)

    try {
      navigate(route)
    } catch {
      console.error("Navigation failed:", route)
    } finally {
      setTimeout(() => setNavigating(false), 300)
    }
  }, [navigate, navigating])

  // ================= CARDS =================
  const cards = useMemo(() => ([
    {
      title: "Add Property",
      desc: "Create a new property listing",
      icon: <PlusCircle className="text-green-600" size={28} />,
      badge: "Action",
      badgeColor: "bg-green-100 text-green-600",
      route: "/agent/add-property"
    },
    {
      title: "My Listings",
      desc: "View and manage your properties",
      icon: <Home className="text-blue-600" size={28} />,
      badge: "View",
      badgeColor: "bg-blue-100 text-blue-600",
      route: "/agent/my-listings"
    },
    {
      title: "Pending Approval",
      desc: "Track properties awaiting approval",
      icon: <Clock className="text-yellow-600" size={28} />,
      badge: "Pending",
      badgeColor: "bg-yellow-100 text-yellow-600",
      route: "/agent/pending-properties"
    },
    {
      title: "Rejected Properties",
      desc: "View rejected listings and fix issues",
      icon: <XCircle className="text-red-600" size={28} />,
      badge: "Alert",
      badgeColor: "bg-red-100 text-red-600",
      route: "/agent/rejected-properties"
    }
  ]), [])

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          Manage Properties
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your listings, approvals and activities
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {cards.map((card, index) => (
          <div
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={card.title}
            onClick={() => handleNavigate(card.route)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleNavigate(card.route)
              }
            }}
            className={`
              group p-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl
              cursor-pointer flex flex-col justify-between
              transition duration-300
              hover:shadow-xl hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${navigating ? "opacity-70 pointer-events-none" : ""}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              {card.icon}
              <span className={`text-xs px-2 py-1 rounded ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <h3 className="text-lg font-semibold">
              {card.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {card.desc}
            </p>
          </div>
        ))}

      </div>

      {/* EXTRA INFO SECTION */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h4 className="font-semibold text-lg mb-2">
            Tips for Approval
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Upload high-quality images</li>
            <li>• Add complete property details</li>
            <li>• Use correct pricing</li>
            <li>• Verify location properly</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h4 className="font-semibold text-lg mb-2">
            Quick Stats (Coming Soon)
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analytics for your listings performance will appear here.
          </p>
        </div>

      </div>

    </div>
  )
}

export default ManageProperties