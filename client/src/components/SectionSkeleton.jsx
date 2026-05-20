import React, { memo } from "react"

function SectionSkeleton({ height = "150px", className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`animate-pulse p-4 ${className}`}
    >
      <div
        className="bg-gray-300 dark:bg-gray-700 rounded-xl w-full"
        style={{ height }}
      />
    </div>
  )
}

export default memo(SectionSkeleton)