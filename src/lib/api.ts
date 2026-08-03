// Base da API (API Gateway -> Lambda). Configure VITE_API_URL no build.
// Ex.: VITE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com
export const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

export type OrderPayload = {
  customer: { name: string; email: string; phone: string };
  shipping: { cep: string; address: string; city: string; state: string };
  items: { sku: string; name: string; size: string; price: number; qty: number }[];
  total: number;
};

export type OrderResponse = { orderId: string; status: string; paymentUrl?: string };

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  if (!API_URL) throw new Error("VITE_API_URL nao configurada - aponte para o endpoint do API Gateway.");
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Falha ao criar pedido [${res.status}]: ${await res.text()}`);
  return (await res.json()) as OrderResponse;
}
