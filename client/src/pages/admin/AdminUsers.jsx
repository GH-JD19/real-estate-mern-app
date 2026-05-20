import { useState, useEffect, useRef } from "react"
import api from "../../services/api"
import { io } from "socket.io-client"
import { toast } from "react-toastify"
import { useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

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

  const socketRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  const [modal, setModal] = useState({
    show: false,
    type: "",
    user: null
  })

  // ================= FETCH =================
  const fetchUsers = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const res = await api.get("/admin/users", {
        params: { role, blocked },
        signal: abortRef.current.signal
      })

      const usersData = Array.isArray(res.data?.users) ? res.data.users : []

      setUsers(usersData.filter(u => u.role !== "admin"))
      setSelected([]) // reset selection on new data

    } catch (err) {
      if (err.name !== "CanceledError") {
        toast.error("Failed to fetch users")
      }
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // ================= SOCKET =================
  useEffect(() => {

    fetchUsers(true)

    const newSocket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = newSocket

    newSocket.emit("joinAdmin")

    const handleUpdate = () => {
      clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        fetchUsers(false)
      }, 500)
    }

    newSocket.on("dashboard:update", handleUpdate)

    return () => {
      clearTimeout(debounceRef.current)
      newSocket.off("dashboard:update", handleUpdate)
      newSocket.disconnect()
      abortRef.current?.abort()
    }

  }, [role, blocked])

  // ================= ACTIONS =================
  const handleAction = async (fn, user, msg) => {
    try {
      setActionLoading(user?._id || "bulk")
      await fn()
      toast.success(msg)
      fetchUsers()
    } catch {
      toast.error("Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  const activateUser = (u) =>
    handleAction(() => api.patch(`/admin/activate/${u._id}`), u, "User activated")

  const toggleBlock = (u) =>
    handleAction(() => api.patch(`/admin/block/${u._id}`), u, "User updated")

  const promote = (u) =>
    handleAction(() => api.patch(`/admin/promote/${u._id}`), u, "Promoted")

  const demote = (u) =>
    handleAction(() => api.patch(`/admin/demote/${u._id}`), u, "Demoted")

  const bulkAction = async (action) => {
    if (!selected.length) return toast.warning("Select users first")

    try {
      setActionLoading("bulk")

      await api.patch("/admin/bulk", { ids: selected, action })

      toast.success("Bulk action completed")
      setSelected([])
      fetchUsers()

    } catch {
      toast.error("Bulk action failed")
    } finally {
      setActionLoading(null)
    }
  }

  // ================= MODAL =================
  const openModal = (type, user = null) => {
    if ((type.includes("bulk")) && selected.length === 0) {
      return toast.warning("Select users first")
    }
    setModal({ show: true, type, user })
  }

  const confirmAction = () => {
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
    const { type } = modal
    switch (type) {
      case "activate": return "Activate this user?"
      case "block": return "Toggle block status?"
      case "promote": return "Promote to agent?"
      case "demote": return "Demote to user?"
      case "bulk-activate": return "Activate selected users?"
      case "bulk-block": return "Block selected users?"
      default: return "Are you sure?"
    }
  }

  // ================= FILTER =================
  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  )

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const ids = paginatedUsers.map(u => u._id)
    const allSelected = ids.every(id => selected.includes(id))

    setSelected(prev =>
      allSelected
        ? prev.filter(id => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    )
  }

  const getStatus = (u) => {
    if (u.isBlocked) return { label: "Blocked", color: "bg-red-500" }
    if (!u.isActive) return { label: "Pending", color: "bg-yellow-500" }
    return { label: "Active", color: "bg-green-500" }
  }

  const isAllSelected =
    paginatedUsers.length &&
    paginatedUsers.every(u => selected.includes(u._id))

  return (
    <div className="min-h-screen p-6">

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
        <button disabled={actionLoading==="bulk"} onClick={()=>openModal("bulk-activate")}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Bulk Activate
        </button>

        <button disabled={actionLoading==="bulk"} onClick={()=>openModal("bulk-block")}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Bulk Block
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-2 md:p-4">

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading users...</div>
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
                          <span className="text-xs text-gray-400 sm:hidden">{u.role}</span>
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
                            <button disabled={actionLoading===u._id}
                              onClick={()=>openModal("activate", u)}
                              className="bg-green-600 px-2 py-1 text-white rounded text-xs">
                              Activate
                            </button>
                          )}

                          {u.role === "user" && u.isActive && (
                            <button disabled={actionLoading===u._id}
                              onClick={()=>openModal("promote", u)}
                              className="bg-blue-600 px-2 py-1 text-white rounded text-xs">
                              Promote
                            </button>
                          )}

                          {u.role === "agent" && u.isActive && (
                            <button disabled={actionLoading===u._id}
                              onClick={()=>openModal("demote", u)}
                              className="bg-yellow-600 px-2 py-1 text-white rounded text-xs">
                              Demote
                            </button>
                          )}

                          <button disabled={actionLoading===u._id}
                            onClick={()=>openModal("block", u)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={()=>setModal({ show:false, type:"", user:null })}>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80"
            onClick={(e)=>e.stopPropagation()}>

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