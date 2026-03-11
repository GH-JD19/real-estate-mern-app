import { useState, useEffect } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useLocation } from "react-router-dom"

const AdminUsers = () => {

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const location = useLocation()

  useEffect(() => {
    fetchUsers()
  }, [location.search])

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users${location.search}`)
      setUsers(res.data.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const promote = async (id) => {
    await api.put(`/admin/promote/${id}`)
    toast.success("User Promoted")
    fetchUsers()
  }

  const demote = async (id) => {
    await api.put(`/admin/demote/${id}`)
    toast.info("Agent Demoted")
    fetchUsers()
  }

  const toggleBlock = async (id) => {
    await api.put(`/admin/block/${id}`)
    toast.warning("Block Status Updated")
    fetchUsers()
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">

      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      <input
        placeholder="Search user..."
        className="border dark:border-gray-700 p-2 mb-4 rounded w-full bg-white dark:bg-gray-800"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading Users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No Users Found
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-t dark:border-gray-700">

                  <td className="p-4">{u.name}</td>

                  {/* ROLE BADGE RESTORED */}
                  <td className="p-4 text-center capitalize">
                    <span className={`px-2 py-1 rounded text-sm
                      ${u.role === "admin" ? "bg-purple-500 text-white" :
                        u.role === "agent" ? "bg-blue-500 text-white" :
                        "bg-gray-500 text-white"}
                    `}>
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {u.isBlocked
                      ? <span className="text-red-500 font-semibold">Blocked</span>
                      : <span className="text-green-500 font-semibold">Active</span>}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">

                      {u.role === "user"
                        ? (
                          <button
                            onClick={() => promote(u._id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded">
                            Promote
                          </button>
                        )
                        : u.role === "agent"
                        ? (
                          <button
                            onClick={() => demote(u._id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded">
                            Demote
                          </button>
                        )
                        : null
                      }

                      <button
                        onClick={() => toggleBlock(u._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded">
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  )
}

export default AdminUsers