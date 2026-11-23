import { z } from "zod";

export const COMMON_PASSWORDS = new Set([
  "password123",
  "1234567890",
  "123456789012",
  "qwertyuiop",
  "password1234",
  "admin123456",
  "welcome1234",
  "primehire123",
  "primehire2026",
  "worklanka123",
  "worklanka2024",
  "worklanka2025",
  "worklanka2026",
  "letmein1234",
  "iloveyou123",
  "sunshine123",
  "princess123",
  "football123",
  "monkey12345",
  "shadow12345",
  "master12345",
  "dragon12345",
  "superman123",
  "trustno1123",
  "changeme123",
  "default1234",
]);

export function isCommonPassword(password: string): boolean {
  const normalized = password.toLowerCase().trim();
  if (COMMON_PASSWORDS.has(normalized)) return true;

  // Pattern detection for trivial sequential strings
  if (/^(.)\1{9,}$/.test(normalized)) return true; // e.g. "aaaaaaaaaa"
  if ("12345678901234567890".includes(normalized)) return true;
  if ("abcdefghijklmnopqrstuvwxyz".includes(normalized)) return true;
  if ("qwertyuiopasdfghjklzxcvbnm".includes(normalized)) return true;

  return false;
}

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (val) => /[a-z]/.test(val),
    "Password must include at least one lowercase letter",
  )
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must include at least one uppercase letter",
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "Password must include at least one number",
  )
  .refine(
    (val) => /[^a-zA-Z0-9]/.test(val),
    "Password must include at least one special character",
  )
  .refine(
    (val) => !isCommonPassword(val),
    "This password is too common or easily guessable. Please choose a stronger password.",
  );

