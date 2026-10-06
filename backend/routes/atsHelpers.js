const https = require("https");
const http = require("http");
const pdfParseModule = require("pdf-parse");

/**
 * Helper to parse PDF buffer supporting both pdf-parse v1 and v2.
 * Extracted from atsRoutes.js so it can be shared across ATS and RAG services.
 */
const parsePdfBuffer = async (buffer) => {
  if (typeof pdfParseModule === "function") {
    const data = await pdfParseModule(buffer);
    return typeof data === "string" ? data : data.text || "";
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    const result = await parser.getText();
    return typeof result === "string" ? result : result.text || "";
  } else {
    throw new Error("PDF parser module not recognized.");
  }
};

/**
 * Fetches a PDF from a URL (Cloudinary or other), follows redirects,
 * and extracts the text content.
 *
 * @param {string} resumeUrl - URL to the PDF file
 * @returns {Promise<string>} Extracted text from the PDF
 */
const extractTextFromResumeUrl = (resumeUrl) => {
  return new Promise((resolve, reject) => {
    // Try fetching via local proxy first to guarantee clean headers/PDF delivery
    const targetUrl = resumeUrl.includes("cloudinary.com")
      ? `http://localhost:${process.env.PORT || 8000}/api/auth/proxy-resume?url=${encodeURIComponent(resumeUrl)}`
      : resumeUrl;

    console.log("[ATS Helper] Extracting text from:", targetUrl);
    const client = targetUrl.startsWith("https") ? https : http;

    client.get(targetUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(extractTextFromResumeUrl(res.headers.location));
      }

      if (res.statusCode !== 200) {
        console.error(`[ATS Helper] Fetch failed with status ${res.statusCode} for ${targetUrl}`);
        reject(new Error(`Failed to fetch resume: HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          console.log(`[ATS Helper] Downloaded PDF buffer size: ${buffer.length} bytes`);
          const extractedText = await parsePdfBuffer(buffer);
          console.log(`[ATS Helper] Successfully extracted ${extractedText.length} characters of text`);
          resolve(extractedText.trim());
        } catch (err) {
          console.error("[ATS Helper] pdfParse error:", err);
          reject(new Error("Failed to parse PDF: " + err.message));
        }
      });
    }).on("error", (err) => {
      console.error("[ATS Helper] Network error fetching PDF:", err.message);
      reject(err);
    });
  });
};

module.exports = {
  parsePdfBuffer,
  extractTextFromResumeUrl,
};
