-- CreateTable
CREATE TABLE "FavouriteFoods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,

    CONSTRAINT "FavouriteFoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteFoods_userId_foodId_key" ON "FavouriteFoods"("userId", "foodId");

-- AddForeignKey
ALTER TABLE "FavouriteFoods" ADD CONSTRAINT "FavouriteFoods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteFoods" ADD CONSTRAINT "FavouriteFoods_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
