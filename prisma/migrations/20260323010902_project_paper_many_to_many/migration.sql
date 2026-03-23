/*
  Warnings:

  - You are about to drop the column `projectId` on the `Paper` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ProjectPaper" (
    "projectId" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "relevanceScore" REAL,
    "relevanceExplanation" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectId", "paperId"),
    CONSTRAINT "ProjectPaper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectPaper_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
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
INSERT INTO "new_Paper" ("abstract", "arxivId", "authors", "createdAt", "doi", "id", "pdfUrl", "relevanceExplanation", "relevanceScore", "source", "title", "url") SELECT "abstract", "arxivId", "authors", "createdAt", "doi", "id", "pdfUrl", "relevanceExplanation", "relevanceScore", "source", "title", "url" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
