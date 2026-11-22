// Date formatting utilities for Resume Builder templates

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats a date string (e.g., "2021-10", "2026-11", "2021-10-15") into "Oct 2021"
 * @param {string} dateStr
 * @returns {string}
 */
export const formatResumeDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  // 1. Match YYYY-MM or YYYY-MM-DD
  const yyyyMmMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/);
  if (yyyyMmMatch) {
    const year = yyyyMmMatch[1];
    const monthIndex = parseInt(yyyyMmMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTH_NAMES[monthIndex]} ${year}`;
    }
    return `${year}`;
  }

  // 2. Match MM/YYYY or MM-YYYY
  const mmYyyyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{4})$/);
  if (mmYyyyMatch) {
    const monthIndex = parseInt(mmYyyyMatch[1], 10) - 1;
    const year = mmYyyyMatch[2];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTH_NAMES[monthIndex]} ${year}`;
    }
    return `${year}`;
  }

  // 3. Match 4-digit Year only (e.g. "2021")
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // 4. Match already formatted Month Name + Year (e.g. "Oct 2021", "October 2021")
  const parts = trimmed.split(/[\s,]+/);
  if (parts.length === 2) {
    const [mPart, yPart] = parts;
    const testDate = new Date(`${mPart} 1, ${yPart}`);
    if (!isNaN(testDate.getTime())) {
      return `${MONTH_NAMES[testDate.getMonth()]} ${testDate.getFullYear()}`;
    }
  }

  // 5. General Date parse fallback
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return trimmed;
};

/**
 * Formats a start/end date range into "Oct 2021 - Nov 2026"
 * @param {string} startDate
 * @param {string} endDate
 * @param {boolean} current
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate, current = false) => {
  const start = formatResumeDate(startDate);
  const end = current ? "Present" : formatResumeDate(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return current ? `${start} - Present` : start;
  }
  if (end) {
    return end;
  }
  return "";
};
