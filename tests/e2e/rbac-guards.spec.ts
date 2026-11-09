import { test, expect } from "@playwright/test";

test.describe("WorkLanka RBAC & Auth Guard Verification", () => {
  test("unauthenticated user is redirected to /login when attempting to access /admin", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("unauthenticated user is redirected to /login when attempting to access /candidate", async ({
    page,
  }) => {
    await page.goto("/candidate");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fcandidate/);
  });

  test("unauthenticated user is redirected to /login when attempting to access /employer", async ({
    page,
  }) => {
    await page.goto("/employer");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Femployer/);
  });

  test("registration page allows switching between Candidate and Employer tabs", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

    // Default tab is Job Seeker
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Register as Job Seeker" })).toBeVisible();

    // Switch to Employer tab
    await page.getByRole("button", { name: "Employer" }).click();
    await expect(page.getByLabel("Company Name")).toBeVisible();
    await expect(page.getByLabel("Company Slug")).toBeVisible();
    await expect(page.getByRole("button", { name: "Register as Employer" })).toBeVisible();
  });

  test("forgot password shows generic message without revealing email existence", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email Address").fill("nonexistent@example.com");
    await page.getByRole("button", { name: "Send Password Reset Link" }).click();

    await expect(page.getByRole("heading", { name: "Check Your Email" })).toBeVisible();
    await expect(page.getByText(/instructions to reset your password/)).toBeVisible();
  });
});
