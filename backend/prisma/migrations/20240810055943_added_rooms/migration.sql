-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomUser" (
    "id" TEXT NOT NULL,
    "Score" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "problemsSolved" INTEGER NOT NULL,
    "problemsAttempted" INTEGER NOT NULL,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
