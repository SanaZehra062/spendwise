const formatErrors = (error) =>
  error.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: formatErrors(result.error) });
  }

  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  // khali values (?category=) ko ignore karo
  const cleaned = Object.fromEntries(
    Object.entries(req.query).filter(([, v]) => v !== "")
  );

  const result = schema.safeParse(cleaned);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: formatErrors(result.error) });
  }

  req.validatedQuery = result.data;
  next();
};