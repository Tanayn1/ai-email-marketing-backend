/*
  Warnings:

  - Added the required column `session_name` to the `editor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "editor" ADD COLUMN     "session_name" TEXT NOT NULL;
