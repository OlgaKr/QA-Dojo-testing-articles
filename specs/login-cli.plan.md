# Login test plan

**Scope:** Login only at <http://104.168.59.50/articles/login>.
**Explored:** 2026-10-22 using Playwright CLI through the shell.

Run each scenario independently in a fresh browser context with no authenticated session. Wait for the Sign in form to finish loading. Use the demo account displayed on the login page; exploration confirmed `olena@example.com` / `password`. No registration or unrelated application features are required.

## 1. Successful login

**Starting state:** Signed out on the login page; the displayed demo account is available and unchanged.

1. Enter `olena@example.com` in **Email**.
2. Enter `password` in **Password**.
3. Click the form's **Sign in** button.
4. Wait for navigation and inspect only the header for authentication evidence.

**Expected outcomes / observed:** The URL becomes `http://104.168.59.50/articles`. The header shows the user link **olena**, and the signed-out **Sign in** and **Register** links are replaced by authenticated navigation. All of these outcomes were observed.

**Success criteria:** The redirect and matching user link appear, with no login error.
**Failure conditions:** Valid demo credentials are rejected, the login form remains, or the matching user link does not appear.

## 2. Login with an incorrect password

**Starting state:** A fresh signed-out context on the login page; `olena@example.com` is an existing demo account whose correct password is `password`.

1. Enter `olena@example.com` in **Email**.
2. Enter `WrongPassword123!` in **Password**.
3. Click the form's **Sign in** button.
4. Wait for the response and inspect the error, URL, and header.

**Expected outcomes / observed:** The form displays `email or password неправильні`. The URL remains `http://104.168.59.50/articles/login`, and the header continues to show **Sign in** and **Register** with no authenticated user link. These outcomes were observed; both entered values also remained in the form.

**Success criteria:** Login is rejected with the observed error and the user remains signed out.
**Failure conditions:** Authentication succeeds, the form redirects as if authenticated, or no visible rejection feedback appears.

## 3. Login with empty required fields

**Starting state:** A fresh signed-out context on the login page, with both **Email** and **Password** empty.

1. Confirm both login inputs are empty.
2. Click the form's **Sign in** button without entering any values.
3. Wait for the response and inspect the error, URL, and header.

**Expected outcomes / observed:** Submission is rejected with `email or password неправильні`. Both inputs remain empty, the URL stays at `http://104.168.59.50/articles/login`, and signed-out navigation remains visible. These outcomes were observed. No field-specific required-field messages were shown; mandatory input attributes and individual-field-empty cases were not inspected.

**Success criteria:** Empty credentials do not authenticate and visible rejection feedback appears.
**Failure conditions:** Empty credentials authenticate, or no visible rejection feedback appears. Field-specific required-field feedback would need a separate agreed requirement before being treated as mandatory.

## Exploration limits

All three login outcomes above were observed. Successful login was checked only through its redirect and authenticated header. No article, profile, registration, or other feature was opened or exercised. No Playwright tests were generated. The dedicated browser session was closed.

## Playwright CLI command log

Commands are listed verbatim in execution order, including failed launch attempts. They ran from a dedicated temporary directory so CLI artifacts stayed outside the project. The first command was blocked by PowerShell execution policy; the second hit sandbox `EPERM`. The repeated `.cmd` launch succeeded with approved sandbox escalation.

```powershell
playwright-cli -s=login-plan open http://104.168.59.50/articles/login
playwright-cli.cmd -s=login-plan open http://104.168.59.50/articles/login
playwright-cli.cmd -s=login-plan open http://104.168.59.50/articles/login
playwright-cli.cmd -s=login-plan snapshot
playwright-cli.cmd -s=login-plan click e34
playwright-cli.cmd -s=login-plan snapshot
playwright-cli.cmd -s=login-plan fill e30 olena@example.com
playwright-cli.cmd -s=login-plan fill e33 WrongPassword123!
playwright-cli.cmd -s=login-plan click e34
playwright-cli.cmd -s=login-plan snapshot
playwright-cli.cmd -s=login-plan fill e33 password
playwright-cli.cmd -s=login-plan click e34
playwright-cli.cmd -s=login-plan snapshot "header"
playwright-cli.cmd -s=login-plan close
```
