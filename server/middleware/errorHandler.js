export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value, already exists" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  res.status(err.status || 500).json({ message: err.message || "Server error" });
};