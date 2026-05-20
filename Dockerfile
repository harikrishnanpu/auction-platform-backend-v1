  FROM node:25-bookworm-slim AS builder

  WORKDIR /app
  
  RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  python3-pip \
  python3-dev \
  build-essential \
  gcc \
  g++ \
  make \
  cmake \
  pkg-config \
  openssl \
  libssl-dev \
  git \
  && rm -rf /var/lib/apt/lists/*

  RUN ln -sf /usr/bin/python3 /usr/bin/python
  
  COPY package*.json ./
  COPY prisma ./prisma
  
  RUN npm ci
  
  COPY . .
  
  # Prisma only needs valid syntax
  ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
  
  RUN npx prisma generate
  RUN npm run build
  
  
  # ---------- Production stage ----------
    FROM node:25-bookworm-slim AS production
  
  WORKDIR /app
  
  # Runtime deps only
  RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  openssl \
  libssl3 \
  && rm -rf /var/lib/apt/lists/*

  RUN ln -sf /usr/bin/python3 /usr/bin/python

  COPY package*.json ./
  
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/package*.json ./
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
  COPY --from=builder /app/scripts ./scripts

  EXPOSE 2500
  EXPOSE 10000-10100/udp
  CMD ["node", "dist/index.js"]