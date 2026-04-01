import { useState, useEffect } from "react"
import api from "../../services/api"
import socket from "../../services/socket"
import { toast } from "react-toastify"
import { useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"

const AdminUsers = () => {

  const [users, setUsers] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState([])

  const [page, setPage] = useState(1)
  const usersPerPage = 10

  const [searchParams] = useSearchParams()

  const role = searchParams.get("role")
  const blocked = searchParams.get("blocked")

  const [modal, setModal] = useState({
    show: false,
    type: "",
    user: null
  })

  const fetchUsers = async (showLoader = false) => {
    try {

      if (showLoader) setLoading(true)

      const res = await api.get("/admin/users", {
        params: { role, blocked }
      })

      const usersData = res.data.users || []
      const filtered = usersData.filter(u => u.role !== "admin")

      setUsers(filtered)

    } catch (err) {
      toast.error("Failed to fetch users")
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // 🚀 REAL-TIME + INITIAL LOAD
  useEffect(() => {

    fetchUsers(true)

    if (!socket.connected) {
      socket.connect()
      socket.emit("joinAdmin")
    }

    const handleUpdate = () => {
      console.log("Realtime users update")
      fetchUsers(false)
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
    }

  }, [role, blocked])

  const activateUser = async (user) => {
    if (user.isActive) {
      toast.info("User already active")
      return
    }

    try {
      setActionLoading(user._id)
      await api.patch(`/admin/activate/${user._id}`)
      toast.success("User activated")
      fetchUsers()
    } catch {
      toast.error("Activation failed")
    } finally {
      setActionLoading(null)
    }
  }

  const toggleBlock = async (user) => {
    try {
      setActionLoading(user._id)
      await api.patch(`/admin/block/${user._id}`)
      toast.info("User status updated")
      fetchUsers()
    } catch {
      toast.error("Update failed")
    } finally {
      setActionLoading(null)
    }
  }

  const promote = async (user) => {
    try {
      setActionLoading(user._id)
      await api.patch(`/admin/promote/${user._id}`)
      toast.success("User promoted to agent")
      fetchUsers()
    } catch {
      toast.error("Promotion failed")
    } finally {
      setActionLoading(null)
    }
  }

  const demote = async (user) => {
    try {
      setActionLoading(user._id)
      await api.patch(`/admin/demote/${user._id}`)
      toast.success("Agent demoted to user")
      fetchUsers()
    } catch {
      toast.error("Demotion failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentPageIds = paginatedUsers.map(u => u._id)
    const allSelected = currentPageIds.every(id => selected.includes(id))

    if (allSelected) {
      setSelected(prev => prev.filter(id => !currentPageIds.includes(id)))
    } else {
      setSelected(prev => [...new Set([...prev, ...currentPageIds])])
    }
  }

  const bulkAction = async (action) => {
    if (selected.length === 0)
      return toast.warning("Select users first")

    try {
      setActionLoading("bulk")

      await api.patch("/admin/bulk", {
        ids: selected,
        action
      })

      toast.success("Bulk action completed")
      setSelected([])
      fetchUsers()

    } catch {
      toast.error("Bulk action failed")
    } finally {
      setActionLoading(null)
    }
  }

  const openModal = (type, user = null) => {
    if ((type === "bulk-activate" || type === "bulk-block") && selected.length === 0) {
      return toast.warning("Select users first")
    }
    setModal({ show: true, type, user })
  }

  const confirmAction = async () => {
    const { type, user } = modal
    setModal({ show: false, type: "", user: null })

    if (type === "activate") return activateUser(user)
    if (type === "block") return toggleBlock(user)
    if (type === "promote") return promote(user)
    if (type === "demote") return demote(user)
    if (type === "bulk-activate") return bulkAction("activate")
    if (type === "bulk-block") return bulkAction("block")
  }

  const getModalText = () => {
    switch (modal.type) {
      case "activate": return "Are you sure to Activate this user?"
      case "block": return modal.user?.isBlocked
        ? "Are you sure to Unblock this user?"
        : "Are you sure to Block this user?"
      case "promote": return "Are you sure to Promote this user?"
      case "demote": return "Are you sure to Demote this agent?"
      case "bulk-activate": return "Are you sure to Activate selected users?"
      case "bulk-block": return "Are you sure to Block selected users?"
      default: return ""
    }
  }

  const getStatus = (u) => {
    if (u.isBlocked)
      return { label: "Blocked", color: "bg-red-500" }

    if (!u.isActive)
      return { label: "Pending", color: "bg-yellow-500" }

    return { label: "Active", color: "bg-green-500" }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (page - 1) * usersPerPage

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  )

  const isAllSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every(u => selected.includes(u._id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-gray-500">Control users, roles, and permissions</p>
        </div>

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow w-full md:w-64">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            placeholder="Search..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

      </div>

      {/* BULK ACTIONS */}
      <div className="mb-4 flex flex-wrap gap-2">

        <button
          disabled={actionLoading === "bulk"}
          onClick={()=>openModal("bulk-activate")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          Bulk Activate
        </button>

        <button
          disabled={actionLoading === "bulk"}
          onClick={()=>openModal("bulk-block")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          Bulk Block
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-2 md:p-4">

  {loading ? (
    <div className="text-center py-20 text-gray-400">
      Loading users...
    </div>
  ) : (
    <div className="overflow-x-auto">

      <table className="min-w-full text-xs md:text-sm">

        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-2 text-center">
              <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/>
            </th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-center hidden sm:table-cell">Role</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>

          {paginatedUsers.map(u => {

            const status = getStatus(u)

            return (

              <tr key={u._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">

                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(u._id)}
                    onChange={()=>handleSelect(u._id)}
                  />
                </td>

                <td className="p-2 font-medium">
                  <div className="flex flex-col">
                    {u.name}
                    <span className="text-xs text-gray-400 sm:hidden">
                      {u.role}
                    </span>
                  </div>
                </td>

                <td className="p-2 text-center hidden sm:table-cell capitalize">
                  {u.role}
                </td>

                <td className="p-2 text-center">
                  <span className={`px-2 py-1 text-xs text-white rounded ${status.color}`}>
                    {status.label}
                  </span>
                </td>

                <td className="p-2 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">

                    {!u.isActive && !u.isBlocked && (
                      <button onClick={()=>openModal("activate", u)}
                        className="bg-green-600 px-2 py-1 text-white rounded text-xs">
                        Activate
                      </button>
                    )}

                    {u.role === "user" && u.isActive && (
                      <button onClick={()=>openModal("promote", u)}
                        className="bg-blue-600 px-2 py-1 text-white rounded text-xs">
                        Promote
                      </button>
                    )}

                    {u.role === "agent" && u.isActive && (
                      <button onClick={()=>openModal("demote", u)}
                        className="bg-yellow-600 px-2 py-1 text-white rounded text-xs">
                        Demote
                      </button>
                    )}

                    <button onClick={()=>openModal("block", u)}
                      className="bg-red-600 px-2 py-1 text-white rounded text-xs">
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>

                  </div>
                </td>

              </tr>

            )

          })}

        </tbody>

      </table>

    </div>
  )}

</div>

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80">

            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6">{getModalText()}</p>

            <div className="flex justify-end gap-3">
              <button onClick={()=>setModal({ show:false, type:"", user:null })}
                className="px-4 py-2 bg-gray-400 text-white rounded">
                Cancel
              </button>

              <button onClick={confirmAction}
                className="px-4 py-2 bg-blue-600 text-white rounded">
                Yes
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default AdminUsers