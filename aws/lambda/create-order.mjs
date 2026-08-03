// Lambda: POST /orders  -> cria pedido guest (sem login) no DynamoDB
// Runtime: nodejs20.x | Handler: create-order.handler
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomUUID } from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const TABLE = process.env.ORDERS_TABLE;
const ORIGIN = process.env.ALLOWED_ORIGIN || "https://mjrimports.com";
const FROM = process.env.SES_FROM;

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

const reply = (status, body) => ({ statusCode: status, headers: cors, body: JSON.stringify(body) });

// Catalogo de precos no servidor: NUNCA confie no preco enviado pelo navegador.
const PRICES = JSON.parse(process.env.PRICE_TABLE || "{}"); // { "ARS-24-HOME": 349, ... }

export const handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;
  if (method === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (method !== "POST") return reply(405, { message: "Method not allowed" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return reply(400, { message: "JSON invalido" });
  }

  const { customer = {}, shipping = {}, items = [] } = payload;
  if (!customer.email || !customer.name || !Array.isArray(items) || items.length === 0) {
    return reply(400, { message: "Dados obrigatorios ausentes" });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return reply(400, { message: "E-mail invalido" });
  if (items.length > 50) return reply(400, { message: "Muitos itens" });

  // Recalcula o total com os precos oficiais
  let total = 0;
  const safeItems = [];
  for (const item of items) {
    const price = PRICES[item.sku];
    const qty = Number(item.qty);
    if (price === undefined) return reply(400, { message: `SKU desconhecido: ${item.sku}` });
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return reply(400, { message: "Quantidade invalida" });
    total += price * qty;
    safeItems.push({ sku: item.sku, name: String(item.name ?? ""), size: String(item.size ?? ""), price, qty });
  }

  const orderId = `MJR-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const order = {
    orderId,
    email: customer.email.toLowerCase(),
    customer: { name: customer.name, email: customer.email, phone: customer.phone ?? "" },
    shipping,
    items: safeItems,
    total,
    status: "PENDING_PAYMENT",
    createdAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: order }));

  if (FROM) {
    try {
      await ses.send(
        new SendEmailCommand({
          Source: FROM,
          Destination: { ToAddresses: [order.email] },
          Message: {
            Subject: { Data: `MJR Imports - pedido ${orderId}` },
            Body: {
              Text: {
                Data: `Recebemos seu pedido ${orderId}.\nTotal: R$ ${total}\nAcompanhe em https://mjrimports.com/pedido?id=${orderId}&email=${order.email}`,
              },
            },
          },
        }),
      );
    } catch (err) {
      console.error("SES falhou", err);
    }
  }

  // Se integrar pagamento, devolva paymentUrl aqui (Mercado Pago / Stripe Checkout).
  return reply(201, { orderId, status: order.status });
};
