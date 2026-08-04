# MJR Imports na AWS — site estático (S3 + CloudFront) + backend Lambda

## Atalho: deploy automatizado

Toda a infra deste README está descrita em `aws/infra/template.yaml`
(CloudFormation/SAM). Em vez de criar recurso por recurso no console:

```bash
# uma vez: aws configure   (e instalar SAM CLI)
./aws/deploy.sh
```

O script instala as deps das Lambdas, cria/atualiza buckets, DynamoDB,
Lambdas, API Gateway e CloudFront, faz o build com o `VITE_API_URL` correto,
sobe o `dist/client` no S3 e invalida o cache. No fim imprime a URL do site
e da API. As seções abaixo explicam o que cada peça faz (útil se preferir
fazer manualmente ou precisar ajustar algo).

Arquitetura:

```text
Navegador
   │  HTML/JS/CSS  ─────────► CloudFront ──► S3 (site estático)
   │  Fotos        ─────────► CloudFront ──► S3 (bucket mjrcatalog)
   └─ /orders (API) ────────► API Gateway (HTTP API) ──► Lambda ──► DynamoDB
                                                             └────► SES (e-mail)
Route 53: mjrimports.com → CloudFront | api.mjrimports.com → API Gateway
```

Carrinho vive no navegador (localStorage). Nenhum login: o pedido é
identificado por `orderId` + e-mail.

## 1. Buckets S3
1. `mjr-site` — arquivos do build. **Block Public Access ligado**; o acesso é
   só via CloudFront com OAC (Origin Access Control).
2. `mjrcatalog` — fotos dos produtos (já usado pelo importador). Também
   privado, servido por CloudFront.

## 2. CloudFront
- Distribuição com duas origens: `mjr-site` (default `/*`) e `mjrcatalog`
  (behavior `/produtos/*`).
- Default root object: `index.html`.
- Custom error response: 403 e 404 → `/index.html` com status 200 (necessário
  para as rotas do React funcionarem).
- Certificado ACM em **us-east-1** para `mjrimports.com` e `www`.

## 3. DynamoDB
Tabela `mjr-orders`, partition key `orderId` (String), modo On-Demand.
Opcional: GSI `email-index` para listar pedidos de um e-mail.

## 4. Lambdas (`aws/lambda/`)
| Arquivo | Rota | Função |
|---|---|---|
| `create-order.mjs` | `POST /orders` | cria pedido guest, recalcula o total, grava no DynamoDB, envia e-mail |
| `get-order.mjs` | `GET /orders/{orderId}?email=` | consulta de pedido sem login |
| `list-catalog.mjs` | `GET /catalog` | (opcional) monta o catálogo lendo os prefixos do S3 |

Runtime `nodejs20.x`. Empacote com as deps:

```bash
cd aws/lambda
npm init -y
npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses @aws-sdk/client-s3
zip -r create-order.zip create-order.mjs node_modules
aws lambda create-function --function-name mjr-create-order \
  --runtime nodejs20.x --handler create-order.handler \
  --role arn:aws:iam::<ACCOUNT_ID>:role/mjr-lambda-role \
  --zip-file fileb://create-order.zip
```

Variáveis de ambiente da `mjr-create-order`:
- `ORDERS_TABLE=mjr-orders`
- `ALLOWED_ORIGIN=https://mjrimports.com`
- `SES_FROM=pedidos@mjrimports.com`
- `PRICE_TABLE={"ARS-24-HOME":349,"BRA-98-HOME":299,"MAD-24-THIRD":389}`

O preço vem SEMPRE do `PRICE_TABLE` no servidor — o valor enviado pelo
navegador é ignorado. Sem isso, dá para comprar por R$ 1.

## 5. IAM (role `mjr-lambda-role`)
Política mínima: `dynamodb:PutItem`/`GetItem` na tabela, `ses:SendEmail`,
`s3:ListBucket` no `mjrcatalog`, e `AWSLambdaBasicExecutionRole` para logs.

## 6. API Gateway (HTTP API)
Rotas → integrações Lambda proxy:
- `POST /orders` → mjr-create-order
- `GET /orders/{orderId}` → mjr-get-order
- `GET /catalog` → mjr-list-catalog
CORS: origin `https://mjrimports.com`, methods `GET,POST,OPTIONS`, header
`Content-Type`. Custom domain `api.mjrimports.com` com certificado ACM.

## 7. Build e deploy do site
```bash
VITE_API_URL=https://api.mjrimports.com bun run build
aws s3 sync dist/client/ s3://mjr-site/ --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```
Observação: as server functions do Lovable (importador Yupoo) não vão junto —
elas viram a Lambda `list-catalog` / um importador próprio.

## 8. Route 53
| Tipo | Nome | Valor |
|---|---|---|
| A (alias) | mjrimports.com | distribuição CloudFront |
| A (alias) | www | distribuição CloudFront |
| A (alias) | api | domínio do API Gateway |

## 9. Pagamento
Em `create-order.mjs`, antes do `return`, crie a preferência no Mercado Pago
ou uma Checkout Session no Stripe e devolva `paymentUrl` — o front já
redireciona automaticamente. O webhook do provedor vira outra Lambda em
`POST /webhooks/pagamento` que atualiza `status` para `PAID`.
