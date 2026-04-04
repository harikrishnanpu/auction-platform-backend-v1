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
}
