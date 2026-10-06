const { QdrantClient } = require("@qdrant/js-client-rest");

/**
 * Qdrant Vector Database Client
 *
 * Connects to Qdrant Cloud (free tier) or a local Qdrant instance.
 * Used by ragService.js for storing and searching resume/job embeddings.
 *
 * Required .env variables:
 *   QDRANT_URL     – Cluster URL from https://cloud.qdrant.io
 *   QDRANT_API_KEY – API key from Qdrant Cloud dashboard
 */
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || undefined,
  checkCompatibility: false,
});

module.exports = qdrantClient;
