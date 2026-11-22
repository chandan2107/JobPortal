import React from "react";

/**
 * Normalizes any link (handles missing https://, leading whitespace, etc.)
 */
export const formatUrl = (href) => {
  if (!href || typeof href !== "string") return "";
  const trimmed = href.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Robust clickable link for Resume templates:
 * - Phone and email do NOT have an underline
 * - LinkedIn, Portfolio, and project links have an underline with offset spacing so underline doesn't touch the text
 */
export const ResumeLink = ({ href, children, className = "", style = {} }) => {
  const url = formatUrl(href);
  if (!url) {
    return <span className={className} style={style}>{children}</span>;
  }

  const isEmailOrPhone = url.startsWith("mailto:") || url.startsWith("tel:");

  // Clean class name (remove blue colors)
  let cleanClassName = className
    .replace(/\b(text-blue-\d+|hover:text-blue-\d+)\b/g, "")
    .trim();

  if (isEmailOrPhone) {
    cleanClassName = cleanClassName
      .replace(/\b(underline|underline-offset-\d+)\b/g, "")
      .trim();
  } else if (!cleanClassName.includes("underline")) {
    cleanClassName = `${cleanClassName} underline underline-offset-2`.trim();
  } else if (!cleanClassName.includes("underline-offset")) {
    cleanClassName = `${cleanClassName} underline-offset-2`.trim();
  }

  const shouldUnderline = !isEmailOrPhone && style.textDecoration !== "none";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cleanClassName}
      style={{
        textDecoration: shouldUnderline ? "underline" : "none",
        textDecorationLine: shouldUnderline ? "underline" : "none",
        textUnderlineOffset: shouldUnderline ? "3px" : undefined,
        ...style,
        ...(shouldUnderline
          ? {
              textDecoration: "underline",
              textDecorationLine: "underline",
              textUnderlineOffset: style.textUnderlineOffset || "3px",
            }
          : isEmailOrPhone
          ? {
              textDecoration: "none",
              textDecorationLine: "none",
            }
          : {}),
      }}
    >
      {children}
    </a>
  );
};

export default ResumeLink;
