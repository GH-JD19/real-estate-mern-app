function SectionSkeleton({ height = "150px" }) {
  return (
    <div className="animate-pulse p-4">
      <div
        className="bg-gray-300 dark:bg-gray-700 rounded-xl w-full"
        style={{ height }}
      ></div>
    </div>
  )
}

export default SectionSkeleton