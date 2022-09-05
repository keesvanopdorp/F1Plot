import { createClient } from "redis";

export const client = createClient({
  url: process.env.REDIS_URL as string,
});

export const connect = async (): Promise<void> => {
  if (!client.isOpen) {
    client.connect();
  }
};

export const close = async () => {
  if (client.isOpen) {
    client.quit();
  }
};
