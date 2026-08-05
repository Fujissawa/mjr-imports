// Numero do WhatsApp do proprietario (formato internacional, so digitos).
// Ex.: 55 + DDD + numero => 5511999999999
export const OWNER_WHATSAPP =
  (import.meta.env["VITE_OWNER_WHATSAPP"] as string | undefined)?.replace(/\D/g, "") || "5513996079062";

type OrderMessage = {
  orderId: string;
  customer: { name: string; email: string; phone: string };
  shipping: { cep: string; address: string; city: string; state: string };
  items: { name: string; size: string; price: number; qty: number }[];
  total: number;
};

export function buildOrderMessage(o: OrderMessage) {
  const lines = [
    `*NOVO PEDIDO MJR IMPORTS*`,
    `Pedido: ${o.orderId}`,
    ``,
    `*Itens*`,
    ...o.items.map((i) => `- ${i.qty}x ${i.name} (${i.size}) - R$ ${i.price * i.qty}`),
    ``,
    `*Total:* R$ ${o.total}`,
    ``,
    `*Cliente*`,
    `${o.customer.name}`,
    `${o.customer.email}`,
    `${o.customer.phone}`,
    ``,
    `*Entrega*`,
    `${o.shipping.address}`,
    `${o.shipping.city} - ${o.shipping.state}`,
    `CEP ${o.shipping.cep}`,
  ];
  return lines.join("\n");
}

export function whatsappOrderUrl(o: OrderMessage) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}

export function newOrderId() {
  return `MJR-${Date.now().toString(36).toUpperCase()}`;
}
