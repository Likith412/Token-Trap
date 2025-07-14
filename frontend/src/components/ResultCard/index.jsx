import { useState } from "react";

import "./index.css";

function ResultCard({ result, showFullCard, setShowFullCard }) {
  const github = result.SourceMetadata?.Data?.Github || {};
  const [showFullRaw, setShowFullRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const raw = result.Raw || "";
  const isRawLong = raw.length > 40;
  const displayedRaw =
    isRawLong && !showFullRaw ? raw.slice(0, 40) + "..." : raw;

  // Prepare fields: all github fields, then Raw
  const fields = [
    ...Object.entries(github).map(([key, value]) => ({
      key,
      value,
      isLink: key === "link" || key === "repository",
    })),
    raw && { key: "Raw", value: displayedRaw, isRaw: true },
  ].filter(Boolean);

  // Card is considered "big" if more than 6 fields or total text > 300 chars
  const totalTextLength = fields.reduce(
    (acc, f) => acc + String(f.value).length,
    0
  );
  const isCardBig = fields.length > 6 || totalTextLength > 300;
  const shownFields = isCardBig && !showFullCard ? fields.slice(0, 4) : fields;

  // Copy raw to clipboard
  const handleCopyRaw = async () => {
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="result-card card-bg result-card-fullwidth">
      <div className="result-card-accent" />
      {copied && <div className="copied-badge">Copied!</div>}
      <div className="result-card-content">
        <div className="result-card-header">
          <span className="result-detector">{result.DetectorName}</span>
        </div>
        <div className="result-meta-grid">
          {shownFields.map((field) => (
            <div key={field.key} className="fullwidth-grid-row">
              <span className="meta-label">
                {field.key.charAt(0).toUpperCase() + field.key.slice(1)}
              </span>
              <span className="meta-value">
                {field.isLink ? (
                  <a
                    href={field.value}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {field.value}
                  </a>
                ) : field.isRaw ? (
                  <>
                    <span
                      className="meta-value-copy"
                      title="Click to copy"
                      onClick={handleCopyRaw}
                    >
                      {field.value}
                    </span>
                    {isRawLong && (
                      <button
                        className="view-more-btn"
                        onClick={() => setShowFullRaw((v) => !v)}
                      >
                        {showFullRaw ? "View Less" : "View More"}
                      </button>
                    )}
                  </>
                ) : (
                  field.value
                )}
              </span>
            </div>
          ))}
          {isCardBig && !showFullCard && (
            <div className="centered-grid-row">
              <button
                className="view-more-btn view-more-btn-large"
                onClick={() => setShowFullCard(true)}
              >
                View More
              </button>
            </div>
          )}
          {isCardBig && showFullCard && fields.length > 4 && (
            <div className="centered-grid-row">
              <button
                className="view-more-btn view-more-btn-large"
                onClick={() => setShowFullCard(false)}
              >
                View Less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
