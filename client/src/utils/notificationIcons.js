import {
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck
} from "react-icons/fa"

// 🔹 ICON CONFIG (SCALABLE)
const ICON_MAP = {
  PROPERTY_CREATED: {
    icon: FaHome,
    className: "text-blue-500"
  },
  PROPERTY_APPROVED: {
    icon: FaCheckCircle,
    className: "text-green-500"
  },
  PROPERTY_REJECTED: {
    icon: FaTimesCircle,
    className: "text-red-500"
  },
  BOOKING_CREATED: {
    icon: FaCalendarCheck,
    className: "text-purple-500"
  }
}

// 🔹 DEFAULT FALLBACK
const DEFAULT_ICON = {
  icon: FaHome,
  className: "text-gray-400"
}

// 🔹 GET ICON
export const getNotificationIcon = (type) => {
  const config = ICON_MAP[type] || DEFAULT_ICON
  const Icon = config.icon

  return <Icon className={config.className} />
}