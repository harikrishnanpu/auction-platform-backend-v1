import { Document } from 'langchain';

// ---------------------------------------------------------------------------
// RAG knowledge for the auction platform. Text is hand-maintained to match
// domain/application rules — update when enums or business rules change.
// ---------------------------------------------------------------------------

export const APP_KNOWLEDGE_DOCS = [
    // --- Overview ---
    new Document({
        pageContent: `What this platform is: an online auction product where people browse listings, join auction rooms, bid (rules depend on auction type), use an in-app wallet and payment flows after winning, and sellers create listings that move from draft to published. The assistant only explains this product; it does not perform money or admin actions for the user.`,
        metadata: { section: 'overview', priority: 'high' },
    }),

    // --- User roles (domain value objects / API roles) ---
    new Document({
        pageContent: `User roles (exact values used in the platform): USER, ADMIN, SELLER. USER: browse, join, bid, pay, wallet. SELLER: create and manage own auctions, publish when allowed, subject to KYC and category rules. ADMIN: back-office and moderation; normal users do not have admin capabilities. The assistant must not promise admin-only actions to USER or SELLER.`,
        metadata: { section: 'user-roles', priority: 'high' },
    }),

    // --- Account & auth (domain UserStatus, AuthProviderType) ---
    new Document({
        pageContent: `Account state: UserStatus values are ACTIVE, SUSPENDED, BLOCKED. AuthProviderType values are LOCAL, GOOGLE. Profile fields like isProfileCompleted and isVerified (and KYC where applicable) gate what the app allows. Suspended or blocked users are restricted; the assistant should not claim an account is active if context says otherwise.`,
        metadata: { section: 'account-auth', priority: 'high' },
    }),

    // --- Auction types (domain AuctionType) ---
    new Document({
        pageContent: `AuctionType values: LONG, LIVE, SEALED. LONG: time-bounded auction with configurable anti-snip, extensions, and bid cooldown in the model. LIVE: same broad lifecycle but oriented to real-time room and stream behaviour. SEALED: sealed-bid style flow; do not apply open-bid or visible-bid explanations from LONG/LIVE. Never mix type-specific rules across types.`,
        metadata: { section: 'auction-types', priority: 'high' },
    }),

    // --- Auction lifecycle statuses (domain AuctionStatus) ---
    new Document({
        pageContent: `AuctionStatus values: DRAFT, ACTIVE, PAUSED, ENDED, SOLD, CANCELLED, FAILED, FALLBACK_ENDED, FALLBACK_PUBLIC_NOTIFICATION. DRAFT: editing only, not a live public sale. ACTIVE/PAUSED: live listing rules apply. ENDED/SOLD/FAILED/CANCELLED: terminal or closed paths. FALLBACK_ENDED and FALLBACK_PUBLIC_NOTIFICATION tie to post-outcome fallback flows; describe only with data from tools, not invented steps.`,
        metadata: { section: 'auction-statuses', priority: 'high' },
    }),

    // --- Category approval (domain AuctionCategoryStatus) ---
    new Document({
        pageContent: `Category review: AuctionCategoryStatus is PENDING, APPROVED, or REJECTED. Creating an auction requires an APPROVED category for that listing; otherwise creation fails with “Auction category is not approved”.`,
        metadata: { section: 'categories', priority: 'high' },
    }),

    // --- Auction creation validation (domain Auction.create defaults & limits) ---
    new Document({
        pageContent: `Hard validation on create: minimum start price is greater than ${500} (numeric constant MIN_START_PRICE). maxExtensionCount must be strictly less than ${10} (MAX_MAX_EXTENSION_COUNT bound). extensionCount must not exceed maxExtensionCount. For AuctionType LONG, minIncrement must not be below 1 (domain rejects with min increment error). Defaults when creating include antiSnipSeconds 60, extensionCount 0, maxExtensionCount 3, bidCooldownSeconds 10 unless overridden.`,
        metadata: { section: 'auction-creation-rules', priority: 'high' },
    }),

    // --- Permissions & lifecycle (application AUCTION_MESSAGES — usecase layer) ---
    new Document({
        pageContent: `Auction action rules (messages returned by use cases): Not authorized to view/update/publish/end this auction where ownership/admin applies. Only draft auctions can be updated or published. Cannot publish if end time already passed. Only active auctions can be ended, paused, or resumed (paused only from active; resume only from paused). Auction not active, auction ended, auction not started appear when timing/state blocks an action.`,
        metadata: {
            section: 'auction-permissions-lifecycle',
            priority: 'high',
        },
    }),

    // --- Bidding (application + domain messages) ---
    new Document({
        pageContent: `Bidding: Seller cannot place bid on own auction. Bid must exceed latest bid when applicable. Bid must satisfy minimum increment rules from the auction. Domain also references: auction not active/started/ended, bid below minimum formula with increment, bid below start price, only one bid per user where enforced, cooldown wait message with seconds. Use tools for current bid amounts and auction id.`,
        metadata: { section: 'bidding-rules', priority: 'high' },
    }),

    new Document({
        pageContent: `Bid concurrency: bid lock TTL is ${5} seconds (BID_LOCK_TTL_SECONDS) — brief lock window around bid attempts.`,
        metadata: { section: 'bid-lock', priority: 'medium' },
    }),

    // --- Seller workflow ---
    new Document({
        pageContent: `Seller flow: create auction in DRAFT, add assets (asset types include IMAGE, VIDEO), set schedule and pricing, publish when draft-only rules allow. After publish, lifecycle follows ACTIVE/PAUSED/etc. Seller relies on approved category and seller KYC where the product requires it.`,
        metadata: { section: 'seller-flow', priority: 'high' },
    }),

    // --- KYC (domain KycFor, KycStatus, documents) ---
    new Document({
        pageContent: `KYC scopes KycFor: SELLER, MODERATOR (different flows). KycStatus: NOT_SUBMITTED, PENDING, APPROVED, REJECTED. Business rules: submit moves toward pending where allowed; only PENDING can be approved or rejected; rejected may reset for resubmission per domain. DocumentType examples: NATIONAL_ID, PASSPORT, DRIVING_LICENSE, VOTER_ID, PAN_CARD, KYC_ID, ADDRESS_PROOF. DocumentSide: FRONT, BACK. KYC document review status DocumentStatus: PENDING, APPROVED, REJECTED. Admins approve/reject seller KYC via admin flows.`,
        metadata: { section: 'kyc', priority: 'high' },
    }),

    // --- Payments (domain Payments entity) ---
    new Document({
        pageContent: `PaymentFor: AUCTION. PaymentStatus: PENDING, COMPLETED, FAILED, DECLINED. PaymentPhase: DEPOSIT, BALANCE. Payments link to a reference id and due dates. Deposits and balance phases are used in the auction payment story; exact amounts and due times come from live data and order/payment tools, not from guessing.`,
        metadata: { section: 'payments', priority: 'high' },
    }),

    new Document({
        pageContent: `Payment strategy constants (domain): deposit share of amount ${0.25} (AUCTION_PAYMENT_AMOUNT_SPLIT_STRATEGY.DEPOSIT_PERCENTAGE). Initial deposit portion constant ${0.1} (AUCTION_INTIAL_DEPOSIT_AMOUNT.PERCENTAGE). Due windows: deposit due offset ${24} hours in ms (DEPOSIT_DAYS_MS), balance horizon ${30} days in ms (BALANCE_MONTHS_MS). Public notification split: initial ${0.25}, remaining ${0.75} of the notification amount strategy.`,
        metadata: { section: 'payment-constants', priority: 'medium' },
    }),

    // --- Wallet ---
    new Document({
        pageContent: `WalletCurrency: INR, USD. WalletTransactionType: DEPOSIT, WITHDRAWAL, TRANSFER, HOLD, RELEASE. Wallet has main and held balance concepts in the domain. Top-ups and auction-related debits go through this model; always point users to in-app wallet and real balances from tools/APIs.`,
        metadata: { section: 'wallet', priority: 'medium' },
    }),

    // --- Winners & participants ---
    new Document({
        pageContent: `AuctionWinnerStatus: PENDING, PARTIAL_PAYMENT_PENDING, COMPLETED, FAILED, CANCELLED. AuctionParticipantPaymentStatus (participation payment flag): PENDING, PAID. Winner fallback max rank constant in domain is ${1} (AUCTION_WINNER_FALLBACK_CONSTANTS.MAX_RANK).`,
        metadata: { section: 'winners-participants', priority: 'medium' },
    }),

    // --- Public / participant fallback (domain enums) ---
    new Document({
        pageContent: `Public fallback offer: AuctionPublicFallbackStatus ACCEPTED, REJECTED, PENDING; AuctionPublicFallbackPaymentStatus PENDING, PAID (PAID can drive acceptance in domain). Participant rows: PublicAuctionFallbackParticipantsStatus same three; PublicAuctionFallbackParticipantsPaymentStatus PENDING, PAID. Do not describe steps that are not in product data.`,
        metadata: { section: 'fallback', priority: 'high' },
    }),

    // --- Fraud & suspension (domain) ---
    new Document({
        pageContent: `SuspensionType: TEMPORARY, PERMANENT. Fraud level constants used in configuration: LOW=1, MEDIUM=2, CRITICAL=3, SUSPENSION_THRESHOLD=3. Temporary suspension duration constant is 7 days in milliseconds. The assistant does not decide fraud; it explains that enforcement is admin-side and account status must match user context.`,
        metadata: { section: 'fraud-suspension', priority: 'medium' },
    }),

    // --- Room, chat, notifications ---
    new Document({
        pageContent: `Auction room chat is for participants in that room. The AI assistant chat is separate and for product help. Live rooms can include streaming/transport; keep explanations non-technical unless the user asks. Bid feeds and timers update in real time. Notifications cover bids, outcomes, and important events—users should check the in-app notification list for the latest.`,
        metadata: {
            section: 'realtime-chat-notifications',
            priority: 'medium',
        },
    }),

    // --- Tools & truthfulness ---
    new Document({
        pageContent: `For “my” auctions, a specific auction, or live counts, the assistant must use the provided tools and session (user id, optional auction id). For static policy and definitions, use search_platform_knowledge. Never output raw JSON to the user. If unsure, say so and point to the relevant page or support.`,
        metadata: { section: 'tools-and-truth', priority: 'high' },
    }),

    // --- Assistant chat style (reinforced in system prompt; stored for RAG) ---
    new Document({
        pageContent: `How the assistant should answer in the app: keep replies **short** (roughly 3–6 sentences or under ~120 words) unless the user explicitly asks for a long explanation. Use **bold** only for a few key terms. Offer one or two clear next steps instead of long essays. This platform’s assistant does not run actions—only guidance.`,
        metadata: { section: 'assistant-brevity', priority: 'high' },
    }),
];
