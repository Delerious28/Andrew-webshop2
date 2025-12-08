/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" DATETIME,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Split existing name field into firstName and lastName
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "password", "resetToken", "resetTokenExpiry", "role", "updatedAt", "verificationToken", "firstName", "lastName") 
SELECT 
    "createdAt", 
    "email", 
    "emailVerified", 
    "id", 
    "password", 
    "resetToken", 
    "resetTokenExpiry", 
    "role", 
    "updatedAt", 
    "verificationToken",
    CASE 
        WHEN instr("name", ' ') > 0 THEN substr("name", 1, instr("name", ' ') - 1)
        ELSE "name"
    END as "firstName",
    CASE 
        WHEN instr("name", ' ') > 0 THEN substr("name", instr("name", ' ') + 1)
        ELSE ''
    END as "lastName"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
