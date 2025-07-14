#!/bin/bash

# Deploy Convex functions to Railway hosted instance

echo "Deploying Convex functions to Railway..."

# Используем переменные из .env.local
export $(cat .env.local | grep -v '^#' | xargs)

# Пробуем деплой через Convex CLI
npx convex deploy --url $NEXT_PUBLIC_CONVEX_URL --admin-key $CONVEX_ADMIN_KEY

echo "Deployment completed!"