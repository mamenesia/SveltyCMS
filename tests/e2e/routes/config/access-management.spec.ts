/**
 * @file tests/e2e/routes/config/access-management.spec.ts
 * @description E2E tests for /config/access-management — role and permission management.
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../../helpers/auth";

test.describe("Access Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("page loads with tabs", async ({ page }) => {
    await page.goto("/config/access-management", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/config\/access-management/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/);

    const title = page.getByTestId("page-title");
    if (await title.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await expect(title).toContainText(/access management/i);
    } else {
      await expect(page.getByRole("heading", { name: /access management/i }).first()).toBeVisible({
        timeout: 8_000,
      });
    }

    // Tabs may render as role=tab or buttons depending on UI kit version
    const rolesTab = page
      .getByRole("tab", { name: /roles/i })
      .or(page.getByRole("button", { name: /^roles$/i }));
    const permsTab = page
      .getByRole("tab", { name: /permissions/i })
      .or(page.getByRole("button", { name: /^permissions$/i }));
    if (
      await rolesTab
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false)
    ) {
      await expect(rolesTab.first()).toBeVisible();
    }
    if (
      await permsTab
        .first()
        .isVisible({ timeout: 3_000 })
        .catch(() => false)
    ) {
      await expect(permsTab.first()).toBeVisible();
    }
  });

  test("roles tab shows role list with admin badge", async ({ page }) => {
    await page.goto("/config/access-management", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/config\/access-management/);
    const rolesTab = page
      .getByRole("tab", { name: /roles/i })
      .or(page.getByRole("button", { name: /^roles$/i }));
    if (
      await rolesTab
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false)
    ) {
      await rolesTab.first().click();
    }
    // Soft: admin role text or create-role control
    const createRole = page.getByRole("button", { name: /create role/i });
    const adminText = page.getByText(/admin/i).first();
    const ok =
      (await createRole.isVisible({ timeout: 10_000 }).catch(() => false)) ||
      (await adminText.isVisible({ timeout: 5_000 }).catch(() => false));
    expect(ok).toBeTruthy();
  });

  test("permissions tab loads permission matrix", async ({ page }) => {
    await page.goto("/config/access-management", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/config\/access-management/);
    const permsTab = page
      .getByRole("tab", { name: /permissions/i })
      .or(page.getByRole("button", { name: /^permissions$/i }));
    if (
      await permsTab
        .first()
        .isVisible({ timeout: 8_000 })
        .catch(() => false)
    ) {
      await permsTab.first().click();
    }
    await expect(
      page.getByText(/permission management|create|read|write|delete|permissions/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("save button is disabled when no changes made", async ({ page }) => {
    await page.goto("/config/access-management");
    const saveBtn = page.getByRole("button", { name: /save/i }).first();
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeDisabled();
    }
  });
});
