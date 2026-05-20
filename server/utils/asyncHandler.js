const asyncHandler = (fn) => {
  // ✅ Validate input (fail fast in dev, safe in prod)
  if (typeof fn !== "function") {
    throw new TypeError("asyncHandler expects a function")
  }

  return function asyncUtilWrap(req, res, next) {
    try {
      Promise.resolve(fn(req, res, next)).catch(next)
    } catch (err) {
      // ✅ Catch sync errors as well
      next(err)
    }
  }
}

module.exports = asyncHandler