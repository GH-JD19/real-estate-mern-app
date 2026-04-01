import {
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck
} from "react-icons/fa"

export const getNotificationIcon = (type) => {

  switch (type) {

    case "PROPERTY_CREATED":
      return <FaHome className="text-blue-500" />

    case "PROPERTY_APPROVED":
      return <FaCheckCircle className="text-green-500" />

    case "PROPERTY_REJECTED":
      return <FaTimesCircle className="text-red-500" />

    case "BOOKING_CREATED":
      return <FaCalendarCheck className="text-purple-500" />

    default:
      return <FaHome />
  }
}