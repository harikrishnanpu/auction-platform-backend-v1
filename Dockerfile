  FROM node:22-bookworm-slim AS builder

  WORKDIR /app
  
  RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
      openssl \
      && rm -rf /var/lib/apt/lists/*
  
  COPY package*.json ./
  COPY prisma ./prisma
  
  RUN npm ci
  
  COPY . .
  
  # Prisma only needs valid syntax
  ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
  
  RUN npx prisma generate
  RUN npm run build
  
  
  # ---------- Production stage ----------
  FROM node:22-bookworm-slim AS runner
  
  WORKDIR /app
  
  # Runtime deps only
  RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl \
      && rm -rf /var/lib/apt/lists/*
  
  ENV NODE_ENV=production
  ENV PORT=4000
  
  COPY package*.json ./
  RUN npm ci --omit=dev
  
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/node_modules ./node_modules
  
  EXPOSE 4000
  
  CMD ["node", "dist/index.js"]