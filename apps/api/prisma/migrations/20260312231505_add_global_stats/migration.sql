-- CreateTable
CREATE TABLE "GlobalStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completedOrdersCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GlobalStats_pkey" PRIMARY KEY ("id")
);
