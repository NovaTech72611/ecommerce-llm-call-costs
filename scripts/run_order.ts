const response = await fetch("http://localhost:3000/orders/run", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    orderId: "ord_1042",
    customerName: "Avery Chen",
    items: [{ sku: "mug-black", quantity: 2 }],
    shippingCity: "Shanghai",
    reviewAboveUsd: 0.05
  })
});

const body: unknown = await response.json();
console.log(JSON.stringify(body, null, 2));

if (!response.ok) {
  process.exitCode = 1;
}
