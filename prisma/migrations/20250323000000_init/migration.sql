-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "authors" TEXT,
    "abstract" TEXT,
    "doi" TEXT,
    "arxivId" TEXT,
    "source" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "localPath" TEXT,
    "url" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "relevanceExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPaper" (
    "projectId" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION,
    "relevanceExplanation" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPaper_pkey" PRIMARY KEY ("projectId","paperId")
);

-- AddForeignKey
ALTER TABLE "ProjectPaper" ADD CONSTRAINT "ProjectPaper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPaper" ADD CONSTRAINT "ProjectPaper_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
