function detectPaper() {
  const url = window.location.href;

  // arXiv abstract or PDF page
  if (/arxiv\.org\/(abs|pdf)\//.test(url)) return url;

  // doi.org or dx.doi.org URL
  if (/(?:dx\.)?doi\.org\/10\./.test(url)) return url;

  // Meta tag: citation_doi (used by many publishers)
  const metaDoi = document.querySelector(
    'meta[name="citation_doi"], meta[name="dc.identifier"], meta[name="DC.identifier"]'
  );
  if (metaDoi) {
    const content = metaDoi.getAttribute("content");
    if (content && content.startsWith("10.")) return `https://doi.org/${content}`;
  }

  return null;
}

// Notify background to set/clear badge on page load
const paperUrl = detectPaper();
chrome.runtime.sendMessage({ type: paperUrl ? "PAPER_DETECTED" : "NO_PAPER" });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_PAPER_URL") {
    sendResponse({ url: detectPaper() });
  }
});
