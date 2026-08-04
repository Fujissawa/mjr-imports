#!/usr/bin/env bash
# Deploy completo: infra (CloudFormation/SAM) + build do site + sync no S3.
# Pre-requisitos: AWS CLI configurado, SAM CLI instalado, bun instalado.
set -euo pipefail
cd "$(dirname "$0")/.."

STACK=${STACK:-mjr-imports}
REGION=${REGION:-us-east-1}

echo "==> 1/4 instalando deps das lambdas"
cd aws/lambda
[ -f package.json ] || npm init -y >/dev/null
npm i --silent @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses @aws-sdk/client-s3
cd ../..

echo "==> 2/4 deploy da infra"
sam deploy \
  --template-file aws/infra/template.yaml \
  --stack-name "$STACK" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

out() { aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }

API_URL=$(out ApiUrl); SITE_BUCKET=$(out SiteBucket); DIST_ID=$(out DistributionId); CDN=$(out CloudFrontDomain)

echo "==> 3/4 build do site (VITE_API_URL=$API_URL)"
VITE_API_URL="$API_URL" bun run build

echo "==> 4/4 publicando no S3 + invalidando o CloudFront"
aws s3 sync dist/client/ "s3://$SITE_BUCKET/" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" >/dev/null

echo
echo "Pronto. Site: https://$CDN"
echo "API:  $API_URL"
