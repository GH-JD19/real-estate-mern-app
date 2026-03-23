import { useState, useEffect } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useSearchParams } from "react-router-dom"

const AdminUsers = () => {

  const [users, setUsers] = useState([])
  const [actionLoading, setActionLoading] = useState(null)

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

  useEffect(() => {

    const loadUsers = async () => {
      await fetchUsers()
    }

    loadUsers()

  }, [role, blocked])


  const fetchUsers = async () => {
    try {

      const res = await api.get("/admin/users", {
        params: { role, blocked }
      })

      const usersData = res.data.users || []
      const filtered = usersData.filter(u => u.role !== "admin")

      setUsers(filtered)

    } catch (err) {
      console.log(err)
      toast.error("Failed to fetch users")
    }
  }


  const activateUser = async (user) => {

    if (user.isActive) {
      toast.info("User already active")
      return
    }

    try {

      setActionLoading(user._id)

      await api.patch(`/admin/activate/${user._id}`)
      toast.success("User activated")

      await fetchUsers()

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

  const isAllSelected = paginatedUsers.length > 0 &&
    paginatedUsers.every(u => selected.includes(u._id))


  return (
    <div className="p-6">

      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">
          Manage Users
        </h1>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64 dark:bg-gray-900"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">

        <button
          disabled={actionLoading === "bulk"}
          onClick={()=>openModal("bulk-activate")}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {actionLoading === "bulk" ? "Processing..." : "Bulk Activate"}
        </button>

        <button
          disabled={actionLoading === "bulk"}
          onClick={()=>openModal("bulk-block")}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {actionLoading === "bulk" ? "Processing..." : "Bulk Block"}
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">

          <thead className="bg-gray-200 dark:bg-gray-700">

            <tr>
              <th className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {paginatedUsers.map(u => {

              const status = getStatus(u)

              return (

                <tr key={u._id} className="border-t">

                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(u._id)}
                      onChange={()=>handleSelect(u._id)}
                    />
                  </td>

                  <td className="p-3">{u.name}</td>

                  <td className="p-3 text-center capitalize">
                    {u.role}
                  </td>

                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded text-white ${status.color}`}>
                      {status.label}
                    </span>
                  </td>

                  <td className="p-3 text-center flex gap-2 justify-center flex-wrap">

                    {!u.isActive && !u.isBlocked && (
                      <button
                        disabled={actionLoading === u._id}
                        onClick={()=>openModal("activate", u)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        {actionLoading === u._id ? "..." : "Activate"}
                      </button>
                    )}

                    {u.role === "user" && u.isActive && (
                      <button
                        disabled={actionLoading === u._id}
                        onClick={()=>openModal("promote", u)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        {actionLoading === u._id ? "..." : "Promote"}
                      </button>
                    )}

                    {u.role === "agent" && u.isActive && (
                      <button
                        disabled={actionLoading === u._id}
                        onClick={()=>openModal("demote", u)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                      >
                        {actionLoading === u._id ? "..." : "Demote"}
                      </button>
                    )}

                    <button
                      disabled={actionLoading === u._id}
                      onClick={()=>openModal("block", u)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      {actionLoading === u._id
                        ? "..."
                        : u.isBlocked
                        ? "Unblock"
                        : "Block"}
                    </button>

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

      </div>

      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">

            <h2 className="text-lg font-semibold mb-4">
              Confirm Action
            </h2>

            <p className="mb-6">{getModalText()}</p>

            <div className="flex justify-end gap-3">

              <button
                onClick={()=>setModal({ show:false, type:"", user:null })}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
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