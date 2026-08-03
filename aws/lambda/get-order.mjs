// Lambda: GET /orders/{orderId}?email=...  -> consulta de pedido sem login
// Runtime: nodejs20.x | Handler: get-order.handler
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.ORDERS_TABLE;
const ORIGIN = process.env.ALLOWED_ORIGIN || "https://mjrimports.com";
const cors = { "Access-Control-Allow-Origin": ORIGIN, "Content-Type": "application/json" };

export const handler = async (event) => {
  const orderId = event.pathParameters?.orderId;
  const email = (event.queryStringParameters?.email || "").toLowerCase();
  if (!orderId || !email) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "orderId e email obrigatorios" }) };
  }

  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { orderId } }));
  // e-mail funciona como senha do pedido: sem ele, nada e devolvido
  if (!Item || Item.email !== email) {
    return { statusCode: 404, headers: cors, body: JSON.stringify({ message: "Pedido nao encontrado" }) };
  }

  const { orderId: id, status, items, total, createdAt } = Item;
  return { statusCode: 200, headers: cors, body: JSON.stringify({ orderId: id, status, items, total, createdAt }) };
};
