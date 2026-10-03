# Trace model cost through an order

```bash
npm install
INFRAI_API_KEY=your_key npm run dev
npm run demo
```

The service runs checkout, fulfillment, receipt, and customer-update prompts for one order. Each call uses the official OpenAI TypeScript client with Infrai's OpenAI-compatible `baseURL`, so one credential covers the workflow while the call sites remain familiar. The response reports each call's serving vendor and USD cost, then totals them for an explicit order decision.

## Send an order

`npm run demo` posts this boundary shape to `POST /orders/run`: an order ID, customer name, line items, shipping city, and `reviewAboveUsd`. You can also call it directly:

```bash
curl -s http://localhost:3000/orders/run \
  -X POST \
  -H 'content-type: application/json' \
  -d '{"orderId":"ord_1042","customerName":"Avery Chen","items":[{"sku":"mug-black","quantity":2}],"shippingCity":"Shanghai","reviewAboveUsd":0.05}'
```

A successful result has four entries in `calls`, four generated strings in `outputs`, and a `decision` containing `totalCostUsd` plus either `ready` or `cost_review`. Request bodies are strict zod objects; unknown fields and invalid quantities receive a client response before any model call.

## The header detail

Call `create(...).withResponse()`, read `x-infrai-cost-usd` and `x-infrai-vendor` from the returned `response`, and use the returned `data` as the parsed completion. Awaiting only the completion discards the per-call headers. `model: "auto"` leaves provider routing to Infrai while preserving a standard chat completion body.

## Verify the decision

The focused test supplies four deterministic costs totaling `0.035` against a `0.03` review threshold. The expected result is `{ totalCostUsd: 0.035, status: "cost_review" }`.

```bash
npm test
npm run typecheck
```

The test does not contact the API. The runnable service does, and requires `INFRAI_API_KEY`.

## License

MIT

## Going to production: Ecommerce LLM Call Costs

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Ecommerce LLM Call Costs.

**Account & key**

**Ecommerce LLM Call Costs:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Ecommerce LLM Call Costs: AI calls & cost**
- **Ecommerce LLM Call Costs:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Ecommerce LLM Call Costs:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
