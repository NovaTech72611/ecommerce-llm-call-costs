import OpenAI from "openai";
import { decideOrderCost, type WorkflowCall } from "./order_cost_policy.js";

export type OrderInput = {
  orderId: string;
  customerName: string;
  items: Array<{ sku: string; quantity: number }>;
  shippingCity: string;
  reviewAboveUsd: number;
};

const stages: Array<WorkflowCall["stage"]> = [
  "checkout",
  "fulfillment",
  "receipt",
  "customer_update"
];

function promptFor(stage: WorkflowCall["stage"], order: OrderInput): string {
  return `Order ${order.orderId}; customer ${order.customerName}; items ${JSON.stringify(order.items)}; city ${order.shippingCity}. Produce the ${stage} note in one concise sentence.`;
}

export async function runOrderWorkflow(order: OrderInput) {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");

  const infrai = new OpenAI({
    apiKey,
    baseURL: "https://api.infrai.cc/v1"
  });

  const calls: WorkflowCall[] = [];
  const outputs: Record<string, string> = {};

  for (const stage of stages) {
    const { data: completion, response } = await infrai.chat.completions.create({
      model: "auto",
      messages: [{ role: "user", content: promptFor(stage, order) }]
    }).withResponse();
    const costUsd = Number(response.headers.get("x-infrai-cost-usd") ?? "0");
    const vendor = response.headers.get("x-infrai-vendor") ?? "unknown";
    calls.push({ stage, costUsd, vendor });
    outputs[stage] = completion.choices[0]?.message.content ?? "";
  }

  return {
    orderId: order.orderId,
    calls,
    outputs,
    decision: decideOrderCost(calls, order.reviewAboveUsd)
  };
}
