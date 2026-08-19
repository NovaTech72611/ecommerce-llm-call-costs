import { describe, expect, it } from "vitest";
import { decideOrderCost } from "../src/order_cost_policy.js";

describe("order cost policy", () => {
  it("sends an order over its workflow threshold to cost review", () => {
    const decision = decideOrderCost([
      { stage: "checkout", costUsd: 0.012, vendor: "vendor-a" },
      { stage: "fulfillment", costUsd: 0.009, vendor: "vendor-b" },
      { stage: "receipt", costUsd: 0.006, vendor: "vendor-a" },
      { stage: "customer_update", costUsd: 0.008, vendor: "vendor-b" }
    ], 0.03);

    expect(decision).toEqual({ totalCostUsd: 0.035, status: "cost_review" });
  });
});
