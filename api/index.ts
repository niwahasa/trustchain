import app from "./boot.js";
import type { IncomingMessage, ServerResponse } from "http";

// Vercel Node.js serverless function handler
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Convert Node.js IncomingMessage to Web API Request
  const url = `https://${req.headers.host}${req.url}`;
  const method = req.method || "GET";

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    body = Buffer.concat(chunks);
  }

  const webRequest = new Request(url, { method, headers, body });

  const webResponse = await app.fetch(webRequest);

  // Convert Web API Response back to Node.js ServerResponse
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const responseBody = await webResponse.arrayBuffer();
  res.end(Buffer.from(responseBody));
}
