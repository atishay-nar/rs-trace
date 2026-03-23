/*
  Warnings:

  - You are about to drop the column `relevanceExplanation` on the `Paper` table. All the data in the column will be lost.
  - You are about to drop the column `relevanceScore` on the `Paper` table. All the data in the column will be lost.

*/
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
    "url" TEXT,
    "projectId" TEXT,
    "relavanceScore" REAL,
    "relavanceExplanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Paper" ("abstract", "arxivId", "authors", "createdAt", "doi", "id", "pdfUrl", "projectId", "source", "title", "url") SELECT "abstract", "arxivId", "authors", "createdAt", "doi", "id", "pdfUrl", "projectId", "source", "title", "url" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
