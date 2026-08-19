export type WorkflowCall = {
  stage: "checkout" | "fulfillment" | "receipt" | "customer_update";
  costUsd: number;
  vendor: string;
};

export type CostDecision = {
  totalCostUsd: number;
  status: "ready" | "cost_review";
};

export function decideOrderCost(calls: WorkflowCall[], reviewAboveUsd: number): CostDecision {
  const totalCostUsd = Number(calls.reduce((sum, call) => sum + call.costUsd, 0).toFixed(6));
  return {
    totalCostUsd,
    status: totalCostUsd > reviewAboveUsd ? "cost_review" : "ready"
  };
}
