// Express app for the front desk. Exports the app (no listen) so tests
// can hit it in-memory with Supertest; src/server.js opens the port.

import express from "express";
import { feesSubtotal, feesTotal } from "./fees.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  // provided
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST /checkout { items, code? } -> 200 { subtotal, waiver, total } | 400
  // TODO(student): validate the body, else respond with feesSubtotal/feesTotal
  // and waiver = subtotal - total.
 app.post("/checkout", (req, res) => {
  const { items, code } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items must be an array" });
  }

  const hasInvalidItem = items.some((item) => {
    return (
      typeof item.daysLate !== "number" ||
      typeof item.dailyRate !== "number"
    );
  });

  if (hasInvalidItem) {
    return res.status(400).json({ error: "invalid item" });
  }

  const subtotal = feesSubtotal(items);
  const total = feesTotal(items, code);
  const waiver = Number((subtotal - total).toFixed(2));

  res.json({ subtotal, waiver, total });
});

  return app;
}
