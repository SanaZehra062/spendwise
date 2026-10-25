import app, { ready } from "./app.js";

const PORT = process.env.PORT || 5000;

ready.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});