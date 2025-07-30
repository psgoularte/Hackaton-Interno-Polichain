-- CreateTable
CREATE TABLE "Raffle" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverImageUrl" VARCHAR(512) NOT NULL,
    "coverImageId" VARCHAR(512) NOT NULL,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);
