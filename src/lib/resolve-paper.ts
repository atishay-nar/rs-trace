export type ResolvedPaper = {
    title: string;
    authors: string;
    abstract: string | null;
    doi: string | null;
    arxivId: string | null;
    source: "doi" | "arxiv";
    pdfUrl: string | null;
    url: string | null;
};

function isDoi(input: string): boolean {
    const t = input.trim();
    return /^10\.\d{4,}\//.test(t) || /(?:dx\.)?doi\.org\//i.test(t);
}

function isArxivId(input: string): boolean {
    const t = input.trim();
    return (
      /^\d{4}\.\d{4,5}/.test(t) ||
      /^[a-z-]+\/\d{7}/i.test(t) ||
      /arxiv\.org/i.test(t)
    );
}

function extractDoi(input: string): string {
    const t = input.trim();
    const m = t.match(/(?:dx\.)?doi\.org\/(10\.[^\s?#]+)/i);
    if (m) {
        try {
            return decodeURIComponent(m[1]);
        } catch {
            return m[1];
        }
    }
    return t;
}

function extractArxivId(input: string): string {
    const t = input.trim();
    // arxiv.org/abs/ID or arxiv.org/pdf/ID (with optional .pdf suffix)
    const urlMatch = t.match(/arxiv\.org\/(?:abs|pdf)\/([a-zA-Z0-9.\/-]+?)(?:\.pdf)?(?:\?|$|\s)/i)
      ?? t.match(/arxiv\.org\/(?:abs|pdf)\/([a-zA-Z0-9.\/-]+)/i);
    if (urlMatch) return urlMatch[1];
    // Raw ID: new format (2301.12345) or old format (q-bio/0503035)
    const newFormat = t.match(/^(\d{4}\.\d{4,5})/);
    if (newFormat) return newFormat[1];
    const oldFormat = t.match(/^([a-z-]+\/\d{7})/i);
    if (oldFormat) return oldFormat[1];
    return t;
}

async function fetchFromCrossRef(doi: string): Promise<ResolvedPaper> {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) throw new Error("DOI not found");

    const json = (await res.json()) as {
        message: {
            title: string[];
            author?: { given?: string; family?: string }[];
            abstract?: string;
            DOI: string;
            link?: { URL: string; type?: string }[];
        };
    };
    const m = json.message;

    const authors = (m.author ?? [])
        .map((a) => [a.given, a.family].filter(Boolean).join(" "))
        .filter(Boolean);
    const pdfLink = m.link?.find((l) => l.type === "application/pdf" || l.URL?.endsWith(".pdf"));

    return {
        title: m.title?.[0] ?? "Unknown",
        authors: JSON.stringify(authors),
        abstract: m.abstract ?? null,
        doi: m.DOI,
        arxivId: null,
        source: "doi",
        pdfUrl: pdfLink?.URL ?? null,
        url: m.link?.find((l) => l.type !== "application/pdf")?.URL ?? `https://doi.org/${m.DOI}`,
    };
}
    async function fetchFromArxiv(id: string): Promise<ResolvedPaper> {
        const res = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("arXiv request failed");
        const xml = await res.text();
        const titles = xml.match(/<title>([^<]+)<\/title>/g) ?? [];
        const paperTitle = titles[1] ? titles[1].replace(/<\/?title>/g, "").trim() : "Unknown";
        const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
        const authors = [...xml.matchAll(/<name>([^<]+)<\/name>/g)].map((x) => x[1]);
        return {
          title: paperTitle,
          authors: JSON.stringify(authors),
          abstract: summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim() : null,
          doi: null,
          arxivId: id,
          source: "arxiv",
          pdfUrl: id.includes("/") ? `https://arxiv.org/pdf/${id}` : `https://arxiv.org/pdf/${id}.pdf`,
          url: `https://arxiv.org/abs/${id}`,
        };
      }

      export async function resolvePaper(input: string): Promise<ResolvedPaper> {
        const t = input.trim();
        if (!t) throw new Error("Enter a DOI or arXiv ID");
        if (isDoi(t)) return fetchFromCrossRef(extractDoi(t));
        if (isArxivId(t)) return fetchFromArxiv(extractArxivId(t));
        throw new Error("Not a valid DOI or arXiv ID. Examples: 10.1234/foo, https://doi.org/10.1002/..., or https://arxiv.org/pdf/...");
      }
