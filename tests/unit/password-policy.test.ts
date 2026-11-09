import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  isCommonPassword,
  COMMON_PASSWORDS,
} from "@/lib/security/password-policy";

describe("Password Policy & Common Password Rejection", () => {
  it("rejects passwords shorter than 10 characters", () => {
    const result = passwordSchema.safeParse("Short1!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain(
        "at least 10 characters",
      );
    }
  });

  it("rejects passwords missing uppercase letters", () => {
    const result = passwordSchema.safeParse("alllowercase123!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("uppercase letter");
    }
  });

  it("rejects passwords missing lowercase letters", () => {
    const result = passwordSchema.safeParse("ALLLOWERCASE123!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("lowercase letter");
    }
  });

  it("rejects passwords missing numbers", () => {
    const result = passwordSchema.safeParse("NoNumbersHere!!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("at least one number");
    }
  });

  it("rejects passwords missing special characters", () => {
    const result = passwordSchema.safeParse("NoSpecialChar1234");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("special character");
    }
  });

  it("rejects known blacklisted common passwords", () => {
    for (const common of Array.from(COMMON_PASSWORDS)) {
      expect(isCommonPassword(common)).toBe(true);
    }
  });

  it("rejects repeated characters (e.g. aaaaaaaaaa)", () => {
    expect(isCommonPassword("aaaaaaaaaa")).toBe(true);
  });

  it("accepts strong, compliant passwords", () => {
    const validPasswords = [
      "WorkLanka#2026Secure!",
      "SuperSecretP@ssw0rd99",
      "CareerLanka$Dev#88!",
    ];

    for (const pass of validPasswords) {
      const result = passwordSchema.safeParse(pass);
      expect(result.success).toBe(true);
    }
  });
});
