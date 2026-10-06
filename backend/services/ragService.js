const { GoogleGenerativeAI } = require("@google/generative-ai");
const qdrant = require("../config/qdrant");
const crypto = require("crypto");

// ─── Constants ───────────────────────────────────────────────────────────────
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768; // gemini-embedding-001 with outputDimensionality 768

// Collection names — one for resumes, one for job descriptions
const COLLECTIONS = {
  RESUMES: "resume_chunks",
  JOBS: "job_chunks",
};

// ─── Gemini Embedding Client ────────────────────────────────────────────────
let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// ─── Text Chunking ──────────────────────────────────────────────────────────
/**
 * Splits text into overlapping chunks for better retrieval.
 * Each chunk is ~300 words with a 50-word overlap so context is not lost
 * at chunk boundaries.
 *
 * @param {string} text - The full document text
 * @param {number} chunkSize - Max words per chunk (default 300)
 * @param {number} overlap - Overlapping words between chunks (default 50)
 * @returns {string[]} Array of text chunks
 */
const chunkText = (text, chunkSize = 300, overlap = 50) => {
  if (!text || typeof text !== "string") return [];

  // Clean up whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");

  if (words.length <= chunkSize) {
    return [cleaned];
  }

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ");

    if (chunk.trim().length > 20) {
      // Skip tiny fragments
      chunks.push(chunk.trim());
    }

    if (end >= words.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
};

// ─── Embedding Generation ───────────────────────────────────────────────────
/**
 * Generates a vector embedding for a text string using Gemini gemini-embedding-001.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} 768-dimensional embedding vector
 */
const generateEmbedding = async (text) => {
  const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSION,
  });
  return result.embedding.values;
};

/**
 * Generates embeddings for multiple text chunks in batch.
 *
 * @param {string[]} texts - Array of text strings
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
const generateEmbeddings = async (texts) => {
  const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL });
  const BATCH_SIZE = 20;
  const allEmbeddings = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const chunkBatch = texts.slice(i, i + BATCH_SIZE);
    const result = await model.batchEmbedContents({
      requests: chunkBatch.map((text) => ({
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMENSION,
      })),
    });
    allEmbeddings.push(...result.embeddings.map((e) => e.values));
  }
  return allEmbeddings;
};

// ─── Collection Management ──────────────────────────────────────────────────
/**
 * Ensures a Qdrant collection exists. Creates it if missing.
 * Uses cosine distance which works best with normalized text embeddings.
 *
 * @param {string} collectionName
 */
const ensureCollection = async (collectionName) => {
  try {
    const exists = await qdrant.collectionExists(collectionName);
    // Handle both boolean and object responses from different SDK versions
    const collectionExists =
      typeof exists === "boolean" ? exists : exists?.exists === true;

    if (!collectionExists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: "Cosine",
        },
      });
      console.log(`[RAG] Created Qdrant collection: ${collectionName}`);

      // Create payload indexes for fast filtering
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "applicationId",
        field_schema: "keyword",
      });
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "jobId",
        field_schema: "keyword",
      });
      await qdrant.createPayloadIndex(collectionName, {
        field_name: "userId",
        field_schema: "keyword",
      });

      console.log(`[RAG] Created payload indexes for: ${collectionName}`);
    }
  } catch (err) {
    console.error(`[RAG] Error ensuring collection ${collectionName}:`, err.message);
    throw err;
  }
};

/**
 * Initializes all required Qdrant collections on server startup.
 * Call this once from server.js after connecting to MongoDB.
 */
const initializeCollections = async () => {
  try {
    for (const name of Object.values(COLLECTIONS)) {
      await ensureCollection(name);
    }
    console.log("[RAG] All Qdrant collections initialized successfully.");
  } catch (err) {
    console.error("[RAG] Failed to initialize collections:", err.message);
    // Don't crash the server — RAG is an enhancement, not a requirement
  }
};

// ─── Indexing (Upsert Documents) ────────────────────────────────────────────
/**
 * Indexes a resume into Qdrant by chunking, embedding, and upserting.
 *
 * @param {object} params
 * @param {string} params.resumeText    - Full extracted resume text
 * @param {string} params.applicationId - MongoDB Application _id
 * @param {string} params.jobId         - MongoDB Job _id
 * @param {string} params.userId        - MongoDB User _id (applicant)
 * @param {string} params.applicantName - Applicant display name
 * @returns {Promise<number>} Number of chunks indexed
 */
const indexResume = async ({ resumeText, applicationId, jobId, userId, applicantName }) => {
  if (!resumeText || resumeText.trim().length < 50) {
    console.warn("[RAG] Resume text too short to index, skipping.");
    return 0;
  }

  await ensureCollection(COLLECTIONS.RESUMES);

  // Delete any previously indexed chunks for this application (re-index safe)
  try {
    await qdrant.delete(COLLECTIONS.RESUMES, {
      filter: {
        must: [{ key: "applicationId", match: { value: applicationId } }],
      },
    });
  } catch (_) {
    // Collection might be empty — that's fine
  }

  const chunks = chunkText(resumeText);
  if (chunks.length === 0) return 0;

  // Generate embeddings for all chunks
  const embeddings = await generateEmbeddings(chunks);

  // Build Qdrant points
  const points = chunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    vector: embeddings[i],
    payload: {
      applicationId,
      jobId,
      userId,
      applicantName: applicantName || "Unknown",
      chunkIndex: i,
      chunkText: chunk,
      documentType: "resume",
      indexedAt: new Date().toISOString(),
    },
  }));

  // Upsert into Qdrant
  await qdrant.upsert(COLLECTIONS.RESUMES, { points });

  console.log(
    `[RAG] Indexed ${points.length} resume chunks for application ${applicationId}`
  );
  return points.length;
};

/**
 * Indexes a job description into Qdrant.
 *
 * @param {object} params
 * @param {string} params.jobId       - MongoDB Job _id
 * @param {string} params.title       - Job title
 * @param {string} params.description - Job description text
 * @param {string} params.requirements - Job requirements text
 * @param {string} params.employerId  - Employer User _id
 * @returns {Promise<number>} Number of chunks indexed
 */
const indexJob = async ({ jobId, title, description, requirements, employerId }) => {
  const fullText = `Job Title: ${title}\n\nDescription:\n${description}\n\nRequirements:\n${requirements}`;

  if (fullText.trim().length < 30) {
    console.warn("[RAG] Job text too short to index, skipping.");
    return 0;
  }

  await ensureCollection(COLLECTIONS.JOBS);

  // Delete previous index for this job
  try {
    await qdrant.delete(COLLECTIONS.JOBS, {
      filter: {
        must: [{ key: "jobId", match: { value: jobId } }],
      },
    });
  } catch (_) {
    // Collection might be empty
  }

  const chunks = chunkText(fullText);
  if (chunks.length === 0) return 0;

  const embeddings = await generateEmbeddings(chunks);

  const points = chunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    vector: embeddings[i],
    payload: {
      jobId,
      title,
      employerId: employerId || "",
      chunkIndex: i,
      chunkText: chunk,
      documentType: "job",
      indexedAt: new Date().toISOString(),
    },
  }));

  await qdrant.upsert(COLLECTIONS.JOBS, { points });

  console.log(`[RAG] Indexed ${points.length} job chunks for job ${jobId}`);
  return points.length;
};

// ─── Retrieval (Search) ─────────────────────────────────────────────────────
/**
 * Searches for resume chunks relevant to a query, optionally filtered
 * by applicationId, jobId, or userId.
 *
 * @param {object} params
 * @param {string} params.query         - Natural language query
 * @param {object} [params.filter]      - Qdrant filter conditions
 * @param {string} [params.filter.applicationId]
 * @param {string} [params.filter.jobId]
 * @param {string} [params.filter.userId]
 * @param {number} [params.limit=5]     - Max results to return
 * @returns {Promise<Array<{score: number, chunkText: string, payload: object}>>}
 */
const searchResumes = async ({ query, filter = {}, limit = 5 }) => {
  const queryVector = await generateEmbedding(query);

  // Build Qdrant filter from provided conditions
  const must = [];
  if (filter.applicationId) {
    must.push({ key: "applicationId", match: { value: filter.applicationId } });
  }
  if (filter.jobId) {
    must.push({ key: "jobId", match: { value: filter.jobId } });
  }
  if (filter.userId) {
    must.push({ key: "userId", match: { value: filter.userId } });
  }

  let points = [];
  if (typeof qdrant.query === "function") {
    const queryParams = {
      query: queryVector,
      limit,
      with_payload: true,
    };
    if (must.length > 0) {
      queryParams.filter = { must };
    }
    const res = await qdrant.query(COLLECTIONS.RESUMES, queryParams);
    points = res?.points || [];
  } else if (typeof qdrant.search === "function") {
    const searchParams = {
      vector: queryVector,
      limit,
      with_payload: true,
    };
    if (must.length > 0) {
      searchParams.filter = { must };
    }
    points = await qdrant.search(COLLECTIONS.RESUMES, searchParams);
  }

  return points.map((r) => ({
    score: r.score,
    chunkText: r.payload?.chunkText || "",
    payload: r.payload,
  }));
};

/**
 * Searches for job description chunks relevant to a query.
 *
 * @param {object} params
 * @param {string} params.query    - Natural language query
 * @param {number} [params.limit=5]
 * @returns {Promise<Array<{score: number, chunkText: string, payload: object}>>}
 */
const searchJobs = async ({ query, limit = 5 }) => {
  const queryVector = await generateEmbedding(query);

  let points = [];
  if (typeof qdrant.query === "function") {
    const res = await qdrant.query(COLLECTIONS.JOBS, {
      query: queryVector,
      limit,
      with_payload: true,
    });
    points = res?.points || [];
  } else if (typeof qdrant.search === "function") {
    points = await qdrant.search(COLLECTIONS.JOBS, {
      vector: queryVector,
      limit,
      with_payload: true,
    });
  }

  return points.map((r) => ({
    score: r.score,
    chunkText: r.payload?.chunkText || "",
    payload: r.payload,
  }));
};

/**
 * Retrieves all stored resume chunks for a given applicationId or userId using scroll.
 * Useful when semantic search returns few results or for broad questions.
 *
 * @param {object} params
 * @param {string} [params.applicationId]
 * @param {string} [params.userId]
 * @param {number} [params.limit=15]
 * @returns {Promise<Array<{chunkText: string, chunkIndex: number, payload: object}>>}
 */
const getResumeChunks = async ({ applicationId, userId, limit = 15 }) => {
  const must = [];
  if (applicationId) {
    must.push({ key: "applicationId", match: { value: applicationId } });
  }
  if (userId) {
    must.push({ key: "userId", match: { value: userId } });
  }

  if (must.length === 0) return [];

  try {
    const scrollRes = await qdrant.scroll(COLLECTIONS.RESUMES, {
      filter: { must },
      limit,
      with_payload: true,
    });
    const points = scrollRes?.points || [];
    points.sort((a, b) => (a.payload?.chunkIndex || 0) - (b.payload?.chunkIndex || 0));
    return points.map((p) => ({
      chunkText: p.payload?.chunkText || "",
      chunkIndex: p.payload?.chunkIndex || 0,
      payload: p.payload,
    }));
  } catch (err) {
    console.warn("[RAG] getResumeChunks scroll error:", err.message);
    return [];
  }
};

// ─── Deletion ───────────────────────────────────────────────────────────────
/**
 * Removes all indexed chunks for a specific application.
 *
 * @param {string} applicationId
 */
const deleteResumeChunks = async (applicationId) => {
  try {
    await qdrant.delete(COLLECTIONS.RESUMES, {
      filter: {
        must: [{ key: "applicationId", match: { value: applicationId } }],
      },
    });
    console.log(`[RAG] Deleted resume chunks for application ${applicationId}`);
  } catch (err) {
    console.error(`[RAG] Error deleting chunks: ${err.message}`);
  }
};

/**
 * Removes all indexed chunks for a specific job.
 *
 * @param {string} jobId
 */
const deleteJobChunks = async (jobId) => {
  try {
    await qdrant.delete(COLLECTIONS.JOBS, {
      filter: {
        must: [{ key: "jobId", match: { value: jobId } }],
      },
    });
    console.log(`[RAG] Deleted job chunks for job ${jobId}`);
  } catch (err) {
    console.error(`[RAG] Error deleting job chunks: ${err.message}`);
  }
};

// ─── Health Check ───────────────────────────────────────────────────────────
/**
 * Checks whether Qdrant is reachable and collections exist.
 *
 * @returns {Promise<object>} Status object
 */
const getHealthStatus = async () => {
  try {
    const collections = await qdrant.getCollections();
    const collectionNames = collections.collections.map((c) => c.name);

    const status = {
      connected: true,
      collections: {},
    };

    for (const name of Object.values(COLLECTIONS)) {
      if (collectionNames.includes(name)) {
        const info = await qdrant.getCollection(name);
        status.collections[name] = {
          exists: true,
          pointsCount: info.points_count || 0,
          vectorsCount: info.vectors_count || 0,
        };
      } else {
        status.collections[name] = { exists: false };
      }
    }

    return status;
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
};

// ─── Exports ────────────────────────────────────────────────────────────────
module.exports = {
  // Constants
  COLLECTIONS,
  EMBEDDING_DIMENSION,

  // Core functions
  chunkText,
  generateEmbedding,
  generateEmbeddings,

  // Collection management
  initializeCollections,
  ensureCollection,

  // Indexing
  indexResume,
  indexJob,

  // Search / Retrieval
  searchResumes,
  searchJobs,
  getResumeChunks,

  // Cleanup
  deleteResumeChunks,
  deleteJobChunks,

  // Health
  getHealthStatus,
};
