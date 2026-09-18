import { test, expect } from "@playwright/test";

test.describe("Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("register");
  });

  test("REG 1 - successful registration", async ({ page }) => {
    const timestamp = Date.now();
    const username = `olga${timestamp}`;
    const email = `olga${timestamp}@test.com`;
    const password = "Test123!";

    await page.getByTestId("auth-username").fill(username);
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("register-confirm-password").fill(password);
    await page.getByTestId("register-terms").check();
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("nav-profile")).toContainText(username);
  });

  test("REG 2 - registration with existing email", async ({ page }) => {
    const timestamp = Date.now();
    const firstUsername = `olga${timestamp}`;
    const secondUsername = `test${timestamp}`;
    const email = `olga${timestamp}@test.com`;
    const password = "Test123!";

    // Precondition: create a user
    await page.getByTestId("auth-username").fill(firstUsername);
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("register-confirm-password").fill(password);
    await page.getByTestId("register-terms").check();
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("nav-profile")).toContainText(firstUsername);

    await page.getByTestId("nav-profile").click();
    await page.getByRole("link", { name: "Edit profile" }).click();
    await page.getByTestId("logout-button").click();

    // Try to register another user with the same email
    await page.goto("register");

    await page.getByTestId("auth-username").fill(secondUsername);
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("register-confirm-password").fill(password);
    await page.getByTestId("register-terms").check();
    await page.getByTestId("auth-submit").click();

    await expect(page.getByText("body email або username")).toBeVisible();
  });

  test("REG 3 - registration with invalid data", async ({ page }) => {
    const timestamp = Date.now();
    const email = `olga${timestamp}@test.com`;

    await page.getByTestId("auth-username").fill("ab");
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill("123");
    await page.getByTestId("register-confirm-password").fill("123");
    await page.getByTestId("register-terms").check();

    await page.getByTestId("auth-submit").click();

    const errorMessages = page.getByTestId("error-messages");

    await expect(errorMessages.getByText("username")).toBeVisible();
    await expect(errorMessages.getByText("password")).toBeVisible();

    await expect(page).toHaveURL(/\/articles\/register\/?$/);
  });
});

test.describe("Login", () => {
  test("LOGIN 1 - successful login", async ({ page }) => {
    const timestamp = Date.now();
    const username = `login${timestamp}`;
    const email = `login${timestamp}@test.com`;
    const password = "Test123!";

    // Precondition: create a user
    await page.goto("register");

    await page.getByTestId("auth-username").fill(username);
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("register-confirm-password").fill(password);
    await page.getByTestId("register-terms").check();
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("nav-profile")).toContainText(username);

    // Logout
    await page.getByTestId("nav-profile").click();
    await page.getByRole("link", { name: "Edit profile" }).click();
    await page.getByTestId("logout-button").click();

    // Login
    await page.getByTestId("nav-sign-in").click();

    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("nav-profile")).toContainText(username);
  });

  test("LOGIN 2 - login with wrong password", async ({ page }) => {
    const timestamp = Date.now();
    const username = `login${timestamp}`;
    const email = `login${timestamp}@test.com`;
    const password = "Test123!";

    // Precondition: create a user
    await page.goto("register");

    await page.getByTestId("auth-username").fill(username);
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill(password);
    await page.getByTestId("register-confirm-password").fill(password);
    await page.getByTestId("register-terms").check();
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("nav-profile")).toContainText(username);

    // Logout
    await page.getByTestId("nav-profile").click();
    await page.getByRole("link", { name: "Edit profile" }).click();
    await page.getByTestId("logout-button").click();

    // Login with wrong password
    await page.getByTestId("nav-sign-in").click();

    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill("WrongPassword123!");
    await page.getByTestId("auth-submit").click();

    await expect(page.getByText("email or password неправильні")).toBeVisible();
    await expect(page.getByTestId("nav-profile")).not.toBeVisible();
  });

  test("LOGIN 3 - login with non-existing email", async ({ page }) => {
    const timestamp = Date.now();
    const email = `nonexistent${timestamp}@test.com`;

    await page.goto("");

    await page.getByTestId("nav-sign-in").click();

    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill("Test123!");
    await page.getByTestId("auth-submit").click();

    await expect(page.getByText("email or password неправильні")).toBeVisible();
    await expect(page.getByTestId("nav-profile")).not.toBeVisible();
  });
});
