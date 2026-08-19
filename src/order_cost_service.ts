import { createServer } from "node:http";
import { z } from "zod";
import { runOrderWorkflow } from "./order_workflow.js";

const orderSchema = z.object({
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  items: z.array(z.object({ sku: z.string().min(1), quantity: z.number().int().positive() })).min(1),
  shippingCity: z.string().min(1),
  reviewAboveUsd: z.number().nonnegative()
}).strict();

const port = Number(process.env.PORT ?? 3000);

createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/orders/run") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "route_not_found" }));
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const parsed = orderSchema.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!parsed.success) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "invalid_order", issues: parsed.error.issues }));
      return;
    }

    const result = await runOrderWorkflow(parsed.data);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(500, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : "request_failed" }));
  }
}).listen(port, () => console.log(`order cost service listening on :${port}`));
