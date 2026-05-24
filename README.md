# Auction Platform Backend

REST API and real-time layer for an online auction platform. Handles users, auctions, bidding, payments, KYC, admin tools, and live auction streaming over WebRTC (mediasoup) with Socket.IO.

## Requirements

- Node.js 22+
- PostgreSQL
- Redis (queues and cache)

Optional, depending on features you use:

- AWS S3 (file uploads)
- Razorpay (payments)
- Chroma + Ollama or Gemini (auction chat agent)

## Quick start

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy environment variables into a `.env` file in the project root (see [Environment variables](#environment-variables)).

3. Set up the database:

```bash
npm run db:setup
```

This runs migrations, seeds subscription/system config, and creates an admin user (see script output for credentials).

4. Start the dev server:

```bash
npm run dev
```

The server listens on `PORT` (default `2500`). API routes are under `/api/v1`. Socket.IO uses path `/socket.io`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed subscription and system config |
| `npm run db:admin` | Create admin user |
| `npm run db:setup` | Full database setup |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Project layout

```
src/
  application/   Use cases, DTOs, interfaces
  domain/        Entities, policies, repositories (interfaces)
  infrastructure/ Prisma repos, AWS, email, queues, AI
  presentation/  HTTP routes, controllers, validators
  socket/        Socket.IO handlers, live auction (mediasoup)
  di/            Dependency injection (Inversify)
prisma/          Database schema and migrations
scripts/         Seeds and admin setup
```

## Environment variables

Create a `.env` file. Do not commit secrets.

### Core

### Live auction (mediasoup)

| Variable | Description |
|----------|-------------|
| `MEDIASOUP_ANNOUNCED_IP` | Public IP browsers use for WebRTC media. Required in production. |
| `SERVER_HOST` | Fallback if `MEDIASOUP_ANNOUNCED_IP` is not set |

On your own machine, `127.0.0.1` is often enough. On AWS EC2, set this to the instance Elastic IP (same IP as `curl ifconfig.me` on the server).

WebRTC media does not go through Nginx on port 443. Open UDP (and TCP if needed) on the EC2 security group for mediasoup ports. Without that, viewers see a black video element with no audio.



## Live auction flow (Socket.IO)

The auction owner (seller) publishes audio and video. Other users consume it.

1. Join the auction room: `auction:join`
2. Get router capabilities: `auction:liveAuctionGetCapabilities` (returns `isHost`, `rtpCapabilities`, existing `producerIds`)
3. Create transport with `direction`:
   - Host: `send` for `auction:liveAuctionCreateTransport`
   - Viewer: `recv`
4. Connect transport: `auction:liveAuctionConnectTransport` with the same `direction` and `dtlsParameters`
5. Host produces: `auction:liveAuctionProduce` for `audio` and `video`
6. Viewers consume: `auction:liveAuctionConsume` per producer, then attach tracks to a video element
7. Listen for `auction:liveAuctionNewProducer` when the host starts streaming after viewers join

Only the auction `sellerId` (or admin) gets `isHost: true` and can produce.

## Production (AWS EC2 example)

- Run the API behind Nginx on HTTPS. Proxy `/api` and `/socket.io` to port `2500`.
- Set `FRONTEND_URL` to your real frontend URL (HTTPS).
- Set `MEDIASOUP_ANNOUNCED_IP` to the EC2 public or Elastic IP.
- Open UDP on the security group for mediasoup (use a fixed port range on the worker when you configure one).
- Use an Elastic IP so the announced IP does not change on restart.

TURN is only needed if direct UDP between browser and server fails (strict NAT, some corporate networks). Fix announced IP and security groups first; most EC2 setups work without TURN.

## API overview

Base path: `/api/v1`

| Area | Path prefix |
|------|-------------|
| Auth | `/auth` |
| User | `/user` |
| Auction | `/auction` |
| Seller | `/seller` |
| Admin | `/admin` |
| Wallet | `/wallet` |
| Payments | `/payments` |
| KYC | `/kyc` |
| Fraud | `/fraud` |
| Webhooks | `/webhooks` |

Socket.IO connects to the same host as the API, path `/socket.io`, with cookies for authentication.

## License

ISC
