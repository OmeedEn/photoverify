// PhotoVerify - Extension Popup Script (safe DOM methods, no innerHTML)

function getScoreClass(score) {
  if (score >= 70) return "score-green";
  if (score >= 30) return "score-yellow";
  return "score-red";
}

function getVerdictClass(verdict) {
  switch (verdict) {
    case "likely_original": return "verdict-original";
    case "found_elsewhere": return "verdict-found";
    case "known_scam": return "verdict-scam";
    default: return "verdict-found";
  }
}

function getVerdictLabel(verdict) {
  switch (verdict) {
    case "likely_original": return "Likely Original";
    case "found_elsewhere": return "Found Elsewhere";
    case "known_scam": return "Known Scam";
    default: return verdict;
  }
}

function getDotClass(reason) {
  const lower = reason.toLowerCase();
  if (lower.includes("no duplicates")) return "dot-green";
  if (lower.includes("scam") || lower.includes("stock")) return "dot-red";
  return "dot-yellow";
}

function buildResultUI(result) {
  const content = document.getElementById("content");
  // Clear existing content safely
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  if (result.error) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = result.error;
    content.appendChild(errorDiv);
    return;
  }

  const verdict = result.verdict || (
    result.trustScore >= 70 ? "likely_original" :
    result.trustScore >= 30 ? "found_elsewhere" : "known_scam"
  );
  const reasons = result.reasons || ["Verification complete"];

  // Score container
  const scoreContainer = document.createElement("div");
  scoreContainer.className = "score-container";

  const scoreValue = document.createElement("div");
  scoreValue.className = "score-value " + getScoreClass(result.trustScore);
  scoreValue.textContent = String(result.trustScore);
  scoreContainer.appendChild(scoreValue);

  const scoreLabel = document.createElement("div");
  scoreLabel.className = "score-label";
  scoreLabel.textContent = "Trust Score";
  scoreContainer.appendChild(scoreLabel);

  content.appendChild(scoreContainer);

  // Verdict badge container
  const verdictContainer = document.createElement("div");
  verdictContainer.style.textAlign = "center";
  verdictContainer.style.marginBottom = "16px";

  const verdictBadge = document.createElement("span");
  verdictBadge.className = "verdict " + getVerdictClass(verdict);
  verdictBadge.textContent = getVerdictLabel(verdict);
  verdictContainer.appendChild(verdictBadge);

  content.appendChild(verdictContainer);

  // Reasons list
  const reasonsList = document.createElement("ul");
  reasonsList.className = "reasons";

  reasons.forEach(function(reason) {
    const li = document.createElement("li");

    const dot = document.createElement("span");
    dot.className = "dot " + getDotClass(reason);
    li.appendChild(dot);

    const text = document.createTextNode(reason);
    li.appendChild(text);

    reasonsList.appendChild(li);
  });

  content.appendChild(reasonsList);
}

// Load last result from storage
chrome.storage.local.get(["lastResult", "lastImageUrl", "lastCheckedAt"], function(data) {
  if (!data.lastResult) return;
  buildResultUI(data.lastResult);
});
