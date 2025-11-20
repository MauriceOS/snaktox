#!/bin/bash
# Script to seed database after deployment
# Run this via Render Shell or manually after deployment

echo "🌱 Seeding SnaKTox database..."

# Navigate to backend directory
cd apps/backend || exit 1

# Run Prisma seed
npx ts-node ../../prisma/seed.ts

echo "✅ Database seeding completed!"

