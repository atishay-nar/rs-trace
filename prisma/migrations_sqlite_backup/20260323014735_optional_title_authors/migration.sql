-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "authors" TEXT,
    "abstract" TEXT,
    "doi" TEXT,
    "arxivId" TEXT,
    "source" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "localPath" TEXT,
    "url" TEXT,
    "relevanceScore" REAL,
    "relevanceExplanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Paper" ("abstract", "arxivId", "authors", "createdAt", "doi", "id", "localPath", "pdfUrl", "relevanceExplanation", "relevanceScore", "source", "title", "url") SELECT "abstract", "arxivId", "authors", "createdAt", "doi", "id", "localPath", "pdfUrl", "relevanceExplanation", "relevanceScore", "source", "title", "url" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
