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
  PARTICIPANTS_UPDATED = 'auction:participantsUpdated',
  ERROR = 'auction:error',
}
