import app, { ready } from "../app.js";

// Vercel runs this function for every request
export default async function handler(req, res) {
  await ready;
  return app(req, res);
}