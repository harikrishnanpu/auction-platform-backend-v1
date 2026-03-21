export type SocketAckPayload = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export type SocketAckCallback = (payload: SocketAckPayload) => void;

export async function hanldeSocketCallback(
  callback: SocketAckCallback | undefined,
  fn: () => Promise<SocketAckPayload>,
): Promise<void> {
  try {
    const result = await fn();
    if (callback) {
      callback(result);
    }
  } catch {
    if (callback) {
      callback({ success: false, error: 'Internal Server Error' });
    }
  }
}
