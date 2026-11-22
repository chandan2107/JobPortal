const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const getChromeExecutablePath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidatePaths = [
    // Windows Chrome & Edge
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google\\Chrome\\Application\\chrome.exe") : null,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance || !browserInstance.connected) {
    const executablePath = getChromeExecutablePath();
    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    browserInstance = await puppeteer.launch(launchOptions);
    browserInstance.on("disconnected", () => {
      browserInstance = null;
    });
  }
  return browserInstance;
};

/**
 * Generate razor-sharp vector PDF from HTML content using Puppeteer
 * @param {string} htmlContent - HTML of the resume
 * @param {object} options - { fontScale, styles }
 * @returns {Promise<Buffer>}
 */
const generatePdfFromHtml = async (htmlContent, options = {}) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    const fontScale = options.fontScale || 105;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Urbanist:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      width: 100% !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color: #000000 !important;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #resume-print {
      width: 794px !important;
      max-width: 794px !important;
      margin: 0 auto !important;
      box-shadow: none !important;
      transform: none !important;
      color: #000000 !important;
      --rf-scale: ${fontScale / 100};
    }
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }
    ${options.styles || ""}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    await page.setContent(fullHtml, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30000,
    });

    // Ensure all Google Fonts have finished loading
    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdfBuffer;
  } finally {
    await page.close().catch(() => {});
  }
};

module.exports = {
  generatePdfFromHtml,
};
