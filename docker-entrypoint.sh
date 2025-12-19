#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done
echo "✅ Database is ready!"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed..."
npx prisma db seed || echo "⚠️ Seed skipped or already applied"

echo "🚀 Starting the application..."
exec "$@"
