export type SocketAckPayload = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export type SocketAckCallback = (payload: SocketAckPayload) => void;

export async function runWithAck(
  ack: SocketAckCallback | undefined,
  fn: () => Promise<SocketAckPayload>,
): Promise<void> {
  try {
    const result = await fn();
    ack?.(result);
  } catch {
    ack?.({ success: false, error: 'Internal Server Error' });
  }
}
