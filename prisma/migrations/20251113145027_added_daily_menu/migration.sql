-- CreateEnum
CREATE TYPE "DAY" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "DailyMenu" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT,
    "day" "DAY" NOT NULL,

    CONSTRAINT "DailyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMenuItems" (
    "id" TEXT NOT NULL,
    "dailyMenuId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,

    CONSTRAINT "DailyMenuItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenu_date_key" ON "DailyMenu"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenuItems_dailyMenuId_foodId_key" ON "DailyMenuItems"("dailyMenuId", "foodId");

-- AddForeignKey
ALTER TABLE "DailyMenuItems" ADD CONSTRAINT "DailyMenuItems_dailyMenuId_fkey" FOREIGN KEY ("dailyMenuId") REFERENCES "DailyMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMenuItems" ADD CONSTRAINT "DailyMenuItems_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
