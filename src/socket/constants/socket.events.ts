export enum SocketEvents {
    CONNECTION = 'connection',

    JOIN = 'auction:join',
    PLACE_BID = 'auction:placeBid',
    SEND_CHAT = 'auction:sendChatMessage',
    PAUSE = 'auction:pause',
    RESUME = 'auction:resume',
    END = 'auction:end',

    JOINED = 'auction:joined',
    BID_PLACED = 'auction:bidPlaced',
    CHAT_MESSAGE = 'auction:chatMessage',
    UPDATED = 'auction:updated',
    FALLBACK_STATS_UPDATED = 'auction:fallbackStatsUpdated',
    PARTICIPANTS_UPDATED = 'auction:participantsUpdated',
    ERROR = 'auction:error',

    FAIL_AUCTION = 'auction:failAuction',
    SEND_FALLBACK_PUBLIC_NOTIFICATION = 'auction:sendFallbackPublicNotification',

    CREATE_PAYMENT_ORDER_FOR_PUBLIC_FALLBACK_AUCTION = 'auction:createPaymentOrderForPublicFallbackAuction',
    VERIFY_PAYMENT_FOR_PUBLIC_FALLBACK_AUCTION = 'auction:verifyPaymentForPublicFallbackAuction',
    DECLINE_PAYMENT_FOR_PUBLIC_FALLBACK_AUCTION = 'auction:declinePaymentForPublicFallbackAuction',

    ADD_AUCTION_PARTICIPANT = 'auction:addAuctionParticipant',

    LIVE_AUCTION_GET_CAPABILITIES = 'auction:liveAuctionGetCapabilities',
    LIVE_AUCTION_CREATE_SEND_TRANSPORT = 'auction:liveAuctionCreateSendTransport',
    LIVE_AUCTION_CREATE_RECV_TRANSPORT = 'auction:liveAuctionCreateRecvTransport',
    LIVE_AUCTION_CONNECT_TRANSPORT = 'auction:liveAuctionConnectTransport',
    LIVE_AUCTION_PRODUCE = 'auction:liveAuctionProduce',
    LIVE_AUCTION_CONSUME = 'auction:liveAuctionConsume',
    LIVE_AUCTION_RESUME_CONSUMER = 'auction:liveAuctionResumeConsumer',
    LIVE_AUCTION_NEW_PRODUCER = 'auction:liveAuctionNewProducer',
    LIVE_AUCTION_PRODUCER_CLOSED = 'auction:liveAuctionProducerClosed',
}
