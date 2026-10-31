import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

test("registers a new user and signs them in", async ({ page }) => {
  const runId = randomUUID().replace(/-/g, "").slice(0, 20);
  const username = `qa_${runId}`;
  const email = `qa.${runId}@example.com`;
  const password = "QaDojo!7fC93x2026";

  await page.goto("register");

  await page.getByTestId("auth-username").fill(username);
  await page.getByTestId("auth-email").fill(email);
  await page.getByTestId("auth-password").fill(password);
  await page.getByTestId("register-confirm-password").fill(password);
  await page.getByTestId("register-newsletter").uncheck();
  await page.getByTestId("register-terms").check();
  await page.getByTestId("auth-submit").click();

  await expect(page).toHaveURL(/\/articles\/?$/);

  const profileLink = page.getByRole("link", { name: username, exact: true });
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toHaveAttribute(
    "href",
    `/articles/profile/${username}`,
  );

  const newArticleLink = page.getByRole("link", {
    name: "New article",
    exact: true,
  });
  await expect(newArticleLink).toBeVisible();
  await expect(newArticleLink).toHaveAttribute("href", "/articles/editor");
});
