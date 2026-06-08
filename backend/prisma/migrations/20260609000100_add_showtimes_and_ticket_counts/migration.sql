CREATE TABLE "Showtime" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "Showtime_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Showtime_movieId_startsAt_key" ON "Showtime"("movieId", "startsAt");

ALTER TABLE "Booking" ADD COLUMN "ticketCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Booking" ADD COLUMN "showtimeId" TEXT;

ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
