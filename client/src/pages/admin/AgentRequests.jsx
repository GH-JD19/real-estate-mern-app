import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AgentRequests = () => {
  const [users, setUsers] = useState([])
  const token = JSON.parse(localStorage.getItem("userInfo"))?.token

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/users/agent-requests", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.users)
    } catch (err) {
      toast.error("Failed to load requests")
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const approveHandler = async (id) => {
    try {
      await axios.put(`/api/users/approve-agent/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Agent Approved")
      fetchRequests()
    } catch (err) {
      toast.error("Approval failed")
    }
  }

  return (
    <div>
      <h2>Agent Requests</h2>

      {users.length === 0 ? (
        <p>No Requests</p>
      ) : (
        users.map(user => (
          <div key={user._id}>
            <p>{user.name}</p>
            <p>{user.email}</p>
            <button onClick={() => approveHandler(user._id)}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default AgentRequests