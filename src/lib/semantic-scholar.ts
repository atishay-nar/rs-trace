export type SemanticScholarSuggestion = {
    arxivId?: string;
    doi?: string;
    title: string;
    authors: string;
    abstract: string | null;
    url: string;
};

export async function getRecommendations(
    positivePaperIds: string[]
): Promise<SemanticScholarSuggestion[]>{

    if (positivePaperIds.length === 0) return [];

    const res = await fetch(
        `https://api.semanticscholar.org/recommendations/v1/papers?limit=10&fields=title,url,authors,abstract,externalIds`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              positivePaperIds,
              negativePaperIds: [],
            }),
          }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { recommendedPapers?: Array<{
        paperId?: string;
        title?: string;
        abstract?: string;
        url?: string;
        authors?: Array<{ name?: string }>;
        externalIds?: { ArXiv?: string; DBLP?: string; DOI?: string };
      }> };

    const papers = data.recommendedPapers ?? [];
    const suggestions: SemanticScholarSuggestion[] = [];

    for (const p of papers) {
        const arxivId = p.externalIds?.ArXiv ?? undefined;
        const doi = p.externalIds?.DOI ?? undefined;
        suggestions.push({
          arxivId,
          doi,
          title: p.title ?? "Unknown",
          authors: p.authors?.map((a) => a.name ?? "").filter(Boolean).join(", ") ?? "",
          abstract: p.abstract ?? null,
          url: (arxivId ? `https://arxiv.org/abs/${arxivId}` : doi ? `https://doi.org/${doi}` : null) ?? p.url ?? "#",        });
      }
      return suggestions;
}