// lib/stream.js
import { StreamChat } from "stream-chat";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

if (!apiKey) {
  throw new Error("Missing Stream API Key in VITE_STREAM_API_KEY");
}

export const chatClient = StreamChat.getInstance(apiKey);
