# User Registration Test Plan

## Application overview

QA Dojo's Testing articles module allows visitors to create an account, enter the authenticated article feed, and subsequently sign in with their credentials. Registration is available from `http://104.168.59.50/articles` through **Register**, at `/articles/register`.

Explored on 22 October 2026 using the Playwright test planner agent and browser tools. This document is a test plan only; no Playwright tests were generated.

## Exploration evidence and limits

### Observed behavior

- The form has Username, Email, Password, Repeat password, Country, a referral radio group, weekly digest checkbox, terms checkbox, and Create account button.
- Country options are Ukraine (default), Poland, Germany, United States, and Other. Referral options are Search (default), A colleague recommended it, Social media, and A testing course. Weekly digest defaults to selected; terms defaults to unselected.
- Create account is initially disabled. Selecting terms enables it even when the text fields are blank.
- Submitting blank fields sends `POST /api/users`, returning HTTP 422 and messages `username ім'я має містити щонайменше 3 символи`, `email некоректний email`, and `password пароль має містити щонайменше 6 символів`.
- Username `ab` and password `12345` are rejected. The stated minimums are 3 and 6 characters respectively. Exact minimum acceptance and maximum lengths were not established.
- Mismatched passwords display `confirm password doesn't match` without a registration request. Inputs remain populated after validation failures.
- Unique valid credentials returned HTTP 201, redirected to `/articles`, and displayed New article and the registered username in navigation. The new user's personal feed was empty. The account profile displayed the chosen username; Settings displayed the chosen email.
- Both an existing email with a new username and an existing username with a new email were rejected with `body email або username вже зайняті`.
- The created account could log out through Profile → Edit profile → Log out, then sign in again. Authentication survived full navigation. An authenticated visitor could still open `/articles/register`; the form appeared with authenticated navigation.
- A successful submission with Country Other and weekly digest unselected sent only username, email, and password in the registration body. Country, referral, digest, terms, and confirmation were absent. No claim is made that these additional fields persist.
- Referral inputs are visually hidden native radios; clicking the visible A testing course label works. A direct input click was not actionable.
- At a 375 × 812 viewport the form remained in the accessibility tree and document width did not exceed viewport width. Full visual, keyboard, and screen reader verification remains planned.
- Stable test IDs observed: `auth-username`, `auth-email`, `auth-password`, `register-confirm-password`, `register-country`, `register-source-search`, `register-source-friend`, `register-source-social`, `register-source-course`, `register-newsletter`, `register-terms`, and `auth-submit`. A hidden `register-signup-source` input has value `web-form`.

### Expectations requiring product confirmation

Cases explicitly marked **Proposed** define useful quality expectations rather than verified current behavior. Confirm maximum field lengths, username character and whitespace rules, email normalization, password whitespace rules, country/referral/digest persistence, terms enforcement beyond the UI, expected behavior for authenticated visitors, and the supported browser matrix before fixing acceptance criteria for those cases. Do not treat unspecified limits or normalization as established requirements.

Network interruption, concurrency, keyboard-only completion, screen reader announcements, cross-browser coverage, and security payload handling were not executed during exploration. Error messages currently mix English field names and Ukrainian text; consistent localization is a review item rather than an assumed existing requirement.

### Planning tool constraint

The specialized `planner_setup_page` and `planner_save_plan` tools were not exposed in this session. The planner used available `browser_*` tools and saved this Markdown plan directly. No seed, fixture, application, configuration, or test file was created or changed.

## Execution conventions

1. **Fresh start F:** Start every scenario and every independent data row in a new browser context with empty cookies, local storage, and session storage, no authenticated user, and a blank page. Open `http://104.168.59.50/articles`, wait for the article module to finish loading, and click the header Register link. Never reuse another scenario's session or account.
2. **Unique data V:** Generate a new suffix for every successful registration attempt, for example UTC timestamp plus random digits. Use username `qa_reg_<suffix>`, email `qa_reg_<suffix>@example.com`, password `ValidPass123!`, and the same repeat password. Select terms unless the case says otherwise. Keep the default country, referral, and digest unless specified. Use only synthetic credentials.
3. **Fixture account:** When a case needs an existing account, create it within that case using V, record the credentials, then start a new fresh browser context. The case must never depend on this exploration's account or on another test's data.
4. **Successful registration:** Expect `/articles`, authenticated navigation containing New article and the exact username, and no registration error. Open the username profile and verify its heading; use Edit profile to verify the email when specified. Network-enabled runs should also observe one successful `POST /api/users` and HTTP 201.
5. **Rejected registration:** Expect to remain on `/articles/register` with actionable validation feedback, signed-out navigation, no successful registration response, and no authenticated session. Client-side rejection may produce no request; server rejection should not become an unhandled error. For cases asserting no account creation, attempt a fresh sign-in with that exact candidate and require rejection before continuing.
6. **Pass/fail rule:** A case passes only if every expected result and its stated success criterion holds. Missing outcomes, unhandled failures, unexpected authentication, or unintended account creation are failures. A case awaiting an explicitly identified product rule is **blocked pending that rule**, rather than assigned an invented pass result.
7. **Isolation/cleanup:** Allocate distinct account data per scenario and per successful data row. Track created accounts and use the demo's agreed cleanup/reset process after execution; never reset shared demo data without coordination. Remove request overrides and return viewport/theme settings to defaults after their cases. No project changes are needed to execute this manual plan.

## Test scenarios

### 1. Entry points and form state

#### REG-01 — Open registration from the article feed

**Priority:** P0. **Start:** F, stopping on the article feed before clicking Register.

1. Click the header Register link.
2. Verify the URL is `/articles/register` and the Create an account heading appears.
3. Verify all four credential fields are empty, Country is Ukraine, Search is the only selected referral, digest is selected, terms is unselected, and Create account is disabled.
4. Verify field labels, the inline Sign in link, and demo information are present; do not mistake the footer digest email for registration Email.

**Success:** All observed initial controls and defaults match. **Failure:** Missing controls, stale user data, or an enabled initial submit button.

#### REG-02 — Direct URL, reload, and sign-in entry path

**Priority:** P1. **Start:** F; use a separate fresh context for each entry route.

1. Navigate directly to `/articles/register`; wait for Create an account.
2. Reload and verify that the registration route and complete form still load.
3. In another fresh context, open `/articles/login` and click its inline Register link.
4. Verify the same registration form and defaults from REG-01 appear.

**Success:** All entry routes lead to the usable signed-out form. **Failure:** Route errors, indefinite loading, or wrong form.

#### REG-03 — Navigate to sign-in without submitting

**Priority:** P1. **Start:** F; repeat independently for the header and inline Sign in links.

1. Enter a unique username and email without creating an account.
2. Click the selected Sign in link.
3. Verify `/articles/login`, its Email and Password fields, and Sign in button.
4. Verify no registration request succeeded and the visitor remains signed out.

**Success:** Both links lead to sign-in without account creation. **Failure:** Accidental submission, broken navigation, or unintended authentication.

### 2. Successful registration and account lifecycle

#### REG-04 — Register with default choices

**Priority:** P0. **Start:** F.

1. Complete V, retaining Ukraine, Search, and digest selected.
2. Verify Create account becomes enabled after terms is selected; click it once.
3. Verify the successful registration outcomes in convention 4.
4. Open the username profile and Edit profile; verify the username and email match the submitted values.

**Success:** Exactly one usable account is created with the entered identity. **Failure:** Wrong identity, missing authentication, or duplicate successful submissions.

#### REG-05 — Register with non-default choices and digest opt-out

**Priority:** P1. **Start:** F.

1. Complete V, choose Other, click the A testing course label, and clear weekly digest.
2. Verify Other remains selected, only A testing course is selected, and digest is clear.
3. Submit and verify successful registration.
4. **Proposed:** Compare stored preferences with these selections through a documented supported mechanism after the persistence requirement is confirmed. Report any ignored selections separately from successful identity creation.

**Success:** Alternate choices do not prevent registration; persistence passes only against an agreed contract. **Failure:** Selection loss before submit or failed identity creation; unconfirmed persistence is blocked.

#### REG-06 — Sign in again with the newly created account

**Priority:** P0. **Start:** F.

1. Register V successfully within this scenario.
2. Open the username profile, click Edit profile, then Log out.
3. Verify signed-out navigation, open Sign in, and enter the recorded email and password.
4. Submit and verify `/articles` and the same authenticated username.

**Success:** Persisted credentials authenticate the same account after logout. **Failure:** Account is unusable, wrong account appears, or logout fails.

#### REG-07 — Authentication survives reload and full navigation

**Priority:** P1. **Start:** F.

1. Register V successfully within this scenario.
2. Reload `/articles` and wait for authenticated navigation.
3. Navigate directly to the account's `/articles/profile/<username>` URL.
4. Verify the same identity and own-profile Edit profile link; verify no new registration request is issued.

**Success:** The registered session remains consistent across full loads. **Failure:** Unexpected sign-out, mixed identity, or repeated account creation.

### 3. Validation and correction

#### REG-08 — Terms controls submission eligibility

**Priority:** P0. **Start:** F.

1. Complete V except terms; verify Create account remains disabled.
2. Try clicking it and pressing Enter from Repeat password; verify no successful registration or authentication.
3. Select terms and verify the button enables; clear terms and verify it disables again.
4. Select terms again, submit, and verify successful registration.

**Success:** No UI submission succeeds without consent, and granting consent permits a valid submission. **Failure:** Bypass through keyboard/click or stale enabled state.

#### REG-09 — Submit the blank form after accepting terms

**Priority:** P0. **Start:** F.

1. Leave all credential fields blank and select terms.
2. Click Create account.
3. Verify rejection and messages identifying username minimum 3, invalid email, and password minimum 6; inspect HTTP 422 when network observation is available.
4. Verify the form remains editable and terms stays selected.

**Success:** Blank credentials cannot create an account and relevant feedback appears. **Failure:** Authentication, silent failure, or unusable form.

#### REG-10 — Required credential omissions independently

**Priority:** P0. **Start:** F for each row: blank Username; blank Email; blank Password and matching blank Repeat password; blank Repeat password only.

1. Complete V, then clear only the field(s) in the selected row.
2. Submit.
3. Verify rejected registration and feedback appropriate to the omitted value; blank confirmation with a nonblank password should show the observed mismatch feedback.
4. Verify no account was created using the attempted email and password, where both are nonblank.

**Success:** Every omission is rejected independently. **Failure:** An omitted credential is accepted or an error refers only to unrelated values.

#### REG-11 — Username minimum boundaries

**Priority:** P0. **Start:** F per row; use unique emails. Rows: `a` (1), `ab` (2), and a reserved unused 3-character username.

1. Enter the row's username with otherwise valid V values.
2. Submit.
3. For lengths 1 and 2, expect rejection with minimum-3 feedback.
4. For length 3, expect success according to the advertised minimum, provided the value is unused; distinguish a collision error from a length failure.

**Success:** Boundary 2 fails and unused boundary 3 succeeds. **Failure:** Off-by-one acceptance/rejection. Exact-minimum acceptance is planned, not yet observed.

#### REG-12 — Password minimum boundaries

**Priority:** P0. **Start:** F per row. Rows: `a` (1), `abcde` (5), `abcdef` (6), and `abcdefg` (7).

1. Complete V using the row value in both password fields.
2. Submit.
3. Expect lengths 1 and 5 to be rejected with minimum-6 feedback.
4. Expect lengths 6 and 7 to succeed under the advertised length rule, then verify re-login using the exact value.

**Success:** The advertised minimum is enforced consistently at both sides of the boundary. **Failure:** Off-by-one behavior or accepted password cannot authenticate.

#### REG-13 — Invalid email formats

**Priority:** P0. **Start:** F per row. Rows: `plainaddress`, `name@`, `@example.com`, `name example@example.com`, and `name@@example.com`.

1. Complete V with the row's email.
2. Click Create account and also try Enter if the browser presents native email validation.
3. Verify native validation or application feedback identifies Email, no successful registration occurs, and the form remains editable.
4. Replace the email with a unique valid address and submit; verify success.

**Success:** Malformed emails are rejected and correction recovers. **Failure:** Invalid identity is registered or the form becomes stuck.

#### REG-14 — Valid email variants

**Priority:** P1. **Start:** F per row. Use a unique local part with a plus tag, a subdomain, and a mixed-case address.

1. Enter the selected syntactically valid email variant with V.
2. Submit and verify successful registration.
3. Log out and sign in using the exact submitted address.
4. **Proposed:** Test case-normalized login and duplicate comparison only after email normalization requirements are agreed.

**Success:** Supported valid formats register and exact-address login works. **Failure:** Unexplained rejection or unusable accepted address; normalization assertions await the contract.

#### REG-15 — Confirmation mismatch and case sensitivity

**Priority:** P0. **Start:** F per row. Rows: completely different confirmation; `validPass123!` versus password `ValidPass123!`; trailing extra character.

1. Complete V with the selected differing confirmation.
2. Submit and expect `confirm password doesn't match` without a registration request.
3. Correct Repeat password to match exactly; submit again.
4. Verify success and absence of stale mismatch feedback.

**Success:** Exact matching is required and correcting it enables registration. **Failure:** Mismatched credentials are accepted or correction remains blocked.

#### REG-16 — Multiple errors and correction without losing choices

**Priority:** P1. **Start:** F.

1. Enter Username `ab`, a blank Email, and matching password `12345`; choose Germany, Social media, digest off, and terms on.
2. Submit and verify all applicable server validation messages.
3. Verify entered values and selections remain available for correction.
4. Replace all invalid credential values with V, leaving the non-default choices, and submit.
5. Verify success and that prior errors do not remain on the destination.

**Success:** The user can recover in one corrected submission without redoing unrelated selections. **Failure:** Lost data, hidden remaining errors, or stale error blocking success.

#### REG-17 — Whitespace, allowed characters, Unicode, and maximum lengths

**Priority:** P2. **Start:** F per row. **Proposed; requirement-dependent.**

1. Obtain documented normalization, character-set, and maximum-length rules before assigning pass/fail outcomes.
2. Independently submit username values consisting only of spaces, padded valid names, internal spaces, punctuation, and Unicode text; keep all other inputs valid and unique.
3. Independently test padded emails and passwords with leading/trailing spaces; use matching confirmations.
4. For each documented maximum M, submit M−1, M, and M+1 characters; if no maximum is documented, use bounded exploratory samples of 255 and 256 characters and report behavior without inventing a limit.
5. For accepted rows, verify the displayed stored identity and re-login using credentials according to the agreed normalization rule. For rejected rows, verify clear feedback without truncation or crashes.

**Success:** Behavior matches agreed rules and accepted credentials remain usable. **Failure:** Silent truncation, inconsistent normalization, crash, or contract violation. Unspecified rules are blocked pending confirmation.

### 4. Identity conflicts

#### REG-18 — Existing email with a different username

**Priority:** P0. **Start:** F; create a fixture account within this case, then return to F.

1. Enter a new unused username, the fixture's exact email, and a different valid matching password pair; accept terms.
2. Submit and verify rejection with `body email або username вже зайняті`.
3. In a fresh context, sign in to the fixture with its original password; verify its original username.
4. Replace the duplicate email in the registration attempt with a unique email and retry using fresh data; verify success.

**Success:** Duplicate email is blocked, the original account is unchanged, and correction recovers. **Failure:** Account takeover, duplicate identity, or broken original credentials.

#### REG-19 — Existing username with a different email

**Priority:** P0. **Start:** F; create a fixture account within this case, then return to F.

1. Enter the fixture's exact username, a new unique email, and a valid password pair; accept terms.
2. Submit and verify the observed duplicate-identity message and rejected registration.
3. Verify the fixture still signs in with its original credentials and identity.
4. Verify the attempted new email cannot sign in with the attempted password.

**Success:** Username uniqueness is enforced without altering the original account. **Failure:** Duplicate username, new email authenticates, or original account changes.

#### REG-20 — Normalized duplicate identities

**Priority:** P2. **Start:** F per row; create a new fixture within each row. **Proposed.**

1. Confirm email and username case/whitespace normalization requirements.
2. Attempt registration using the fixture email in a different case with a new username.
3. In an independent row, attempt a case-varied or whitespace-padded fixture username with a new email.
4. Verify the agreed uniqueness outcome and that the original credentials and identity remain intact.

**Success:** Duplicate detection matches the agreed canonicalization rules. **Failure:** Contract violation or original identity alteration; unspecified normalization is blocked.

### 5. Choice controls, keyboard, and presentation

#### REG-21 — Every country and referral option is selectable

**Priority:** P1. **Start:** F.

1. Open Country and select Ukraine, Poland, Germany, United States, and Other in sequence; verify the visible selected value each time.
2. Click each visible referral label in sequence: Search, A colleague recommended it, Social media, and A testing course.
3. Verify exactly one referral is selected after each click; selecting one clears the previous selection.
4. Fill credential fields and verify the last country/referral selections remain unchanged.

**Success:** Every choice is reachable and radio selection is exclusive. **Failure:** Inaccessible option, multiple selected referrals, or unrelated edits reset choices.

#### REG-22 — Digest and terms remain independent

**Priority:** P1. **Start:** F.

1. Clear and reselect the registration weekly digest checkbox using both its box and visible label.
2. Verify neither action changes terms or the Create account eligibility imposed by terms.
3. Select terms, toggle digest again, and verify terms remains selected and submit remains enabled.
4. Toggle terms and verify digest remains in its previous state.

**Success:** Each checkbox controls its own state only. **Failure:** Consent and optional digest choices are coupled.

#### REG-23 — Complete registration using keyboard only

**Priority:** P1. **Start:** F. **Proposed accessibility acceptance.**

1. Use Tab and Shift+Tab to reach every registration field and control, checking visible focus and logical order.
2. Enter V, use arrow keys for country and the referral group, and Space for digest and terms.
3. Verify each control's state is perceivable and no focus trap occurs.
4. Submit with Enter and verify successful registration.
5. In a separate fresh run, submit a mismatch and verify the error is discoverable and the fields can be corrected by keyboard.

**Success:** All registration actions and recovery work without a pointer. **Failure:** Hidden focus, unreachable styled radios, trapped focus, or unusable error recovery.

#### REG-24 — Labels, password masking, and error accessibility

**Priority:** P1. **Start:** F. **Proposed accessibility acceptance.**

1. Inspect controls with a screen reader or accessibility inspector; verify distinct accessible names for Username, Email, Password, Repeat password, Country, both checkboxes, and the referral group.
2. Type test passwords; verify both are visually masked, email uses an email input, and password fields support new-password autofill.
3. Submit a mismatch and then invalid server-side credentials in independent fresh runs.
4. Verify errors are announced or receive an appropriate focus cue, identify the affected fields, and remain readable without color alone.

**Success:** Labels, grouping, masking, and error discovery support assistive use. **Failure:** Ambiguous fields, visible passwords, or inaccessible errors. Announcement behavior was not verified during exploration.

#### REG-25 — Mobile, zoom, and theme usability

**Priority:** P1. **Start:** F for each viewport/theme row. **Proposed full visual acceptance.**

1. Test 375 × 812 and a desktop viewport such as 1440 × 900, in each available theme; also inspect desktop at 200% zoom.
2. Scroll through all form controls, labels, choices, validation area, and submit button.
3. Verify no horizontal scrolling, clipped controls, overlapping labels, or obscured errors; verify readable focus/disabled states and text contrast.
4. Complete V and submit in each row; verify success.

**Success:** Registration remains readable and operable across the matrix. **Failure:** Layout or theme prevents completion. Only mobile DOM width and accessibility-tree presence were observed.

#### REG-26 — Theme changes preserve in-progress form values

**Priority:** P2. **Start:** F.

1. Enter V without submitting, choose Poland, Social media, and digest off.
2. Toggle the header theme twice.
3. Verify credentials, selected choices, terms state, and submit eligibility remain unchanged.
4. Submit and verify success.

**Success:** Theme changes preserve the draft and controls remain readable. **Failure:** Lost input, changed consent, or blocked submission.

### 6. Robustness and state boundaries

#### REG-27 — Rapid double submission

**Priority:** P1. **Start:** F. **Proposed robustness acceptance.**

1. Complete V and accept terms.
2. Double-click Create account or press Enter twice rapidly.
3. Observe registration requests and UI state until completion.
4. Verify one logical account, one stable authenticated identity, and no duplicate-account error replacing the success page. Additional requests, if any, must not create additional identities.

**Success:** Repeated activation has one stable successful outcome. **Failure:** Duplicate creation, contradictory final state, or unrecoverable pending state.

#### REG-28 — Registration request fails before reaching the server

**Priority:** P1. **Start:** F. **Proposed; use a browser-only request override without project changes.**

1. Complete V, then abort only `POST /api/users` before it reaches the server.
2. Submit and verify a comprehensible failure indication, no authenticated session, and a usable form retaining non-sensitive choices.
3. Remove the abort rule and retry the same valid data.
4. Verify successful registration and no permanent disabled/loading state.

**Success:** A definite transport failure is recoverable without losing account integrity. **Failure:** Silent failure, false success, or permanently blocked retry.

#### REG-29 — Server failure and slow response

**Priority:** P1. **Start:** F per row. **Proposed; browser-only interception.**

1. For the error row, fulfill only the registration request with a controlled HTTP 500 response; do not forward it to the server.
2. Submit V; verify safe feedback without stack traces, no authentication, and retry eligibility after removing the override.
3. For a separate slow-response row, delay a real registration response using a controlled delay while preserving its actual eventual result.
4. Verify a perceivable pending state, no accidental repeated creation, and correct success handling once the response arrives.

**Success:** Errors and latency produce understandable, recoverable states. **Failure:** False authentication, sensitive diagnostics, duplicate identities, or stuck UI.

#### REG-30 — Response lost after the server creates an account

**Priority:** P2. **Start:** F. **Proposed; controlled proxy/test environment required.**

1. Complete V and arrange for the server to process the registration while the successful response is lost to the browser.
2. Observe the UI failure, remove the fault, and retry the exact credentials.
3. If the retry reports an existing identity, follow Sign in with the original credentials.
4. Verify exactly one usable account, no changed password/identity, and a recovery path that does not require inventing a new email.

**Success:** Ambiguous delivery leaves one recoverable account. **Failure:** Duplicate identity, corrupted credentials, or unrecoverable state. Do not simulate this by aborting before delivery; that is REG-28.

#### REG-31 — Concurrent registration for the same identity

**Priority:** P2. **Start:** Two separate fresh contexts with no account for a new shared candidate. **Proposed.**

1. Open registration in both contexts and enter identical new username/email with the same valid password; accept terms.
2. Submit both as close together as practical.
3. Verify exactly one successful creation and a controlled uniqueness rejection for the other context.
4. In a third fresh context, verify the credentials sign in to one consistent identity.

**Success:** Uniqueness holds across concurrent requests. **Failure:** Two accounts, server crash, or inconsistent identity.

#### REG-32 — Browser Back, forward, and refresh around submission

**Priority:** P1. **Start:** F.

1. Register V successfully, then use Back and forward.
2. Verify navigation does not automatically submit the form again or create another account.
3. Refresh the authenticated destination and verify the same username.
4. **Proposed:** If Back exposes a registration form while signed in, verify handling against the agreed authenticated-registration policy; do not assume a redirect currently exists.

**Success:** History and reload do not repeat registration or corrupt the session. **Failure:** Automatic resubmission, duplicate creation, or identity change.

#### REG-33 — Open registration while already authenticated

**Priority:** P2. **Start:** F, then register V within the case.

1. Navigate directly to `/articles/register` while signed in.
2. Record the observed current behavior: registration form with authenticated navigation.
3. **Proposed:** Confirm whether product intends a redirect or permits creating another account. Exercise only the agreed policy with new synthetic data.
4. Verify no account creation occurs merely from visiting, and no unannounced identity replacement occurs.

**Success:** Route handling matches the confirmed policy without implicit side effects. **Failure:** Unintended creation or session replacement; policy-specific acceptance remains blocked until confirmed.

#### REG-34 — Registration and footer digest forms do not interfere

**Priority:** P2. **Start:** F.

1. Complete V in registration without submitting; enter a different synthetic address in the footer Your email field.
2. Change the footer Frequency selection without clicking Subscribe.
3. Verify registration Email, digest selection, terms, and all other registration values remain unchanged.
4. Submit Create account and verify the new account uses the registration Email, not the footer address; verify no digest-subscription request was accidentally submitted.

**Success:** Separate forms preserve their own data and submit targets. **Failure:** Cross-populated credentials or unintended footer submission.

### 7. Data handling and regression review

#### REG-35 — Treat supplied text as data

**Priority:** P2. **Start:** F per payload. **Proposed; use only inert synthetic strings.**

1. Enter a username containing a literal markup-like value such as `<b>qa_unique</b>` with a unique email and valid matching passwords.
2. Submit; accept either safe rejection under documented username rules or safe literal display if supported.
3. If accepted, inspect the profile heading and authenticated navigation; verify the value is text rather than interpreted markup.
4. In an independent row, submit a quote-containing username and verify it cannot alter another account, bypass validation, or trigger raw backend diagnostics.

**Success:** Input is safely rejected or rendered as text without identity side effects. **Failure:** Interpreted markup, account corruption, or exposed server internals. This is not a penetration test.

#### REG-36 — Credential exposure and registration payload boundaries

**Priority:** P1. **Start:** F. **Proposed data-handling acceptance.**

1. Complete V and submit while inspecting only the relevant request/response and URL.
2. Verify passwords never appear in the URL, rendered success/error text, profile fields, or application console diagnostics; browser tooling showing submitted test input is not itself application logging.
3. Verify the account-creation body uses the intended username, email, and password, does not send Repeat password, and does not mix in footer form values.
4. Record whether country/referral/digest/terms are transmitted or persisted; compare only with a confirmed data contract. Current observation: these values are absent from `POST /api/users`.
5. Repeat a rejected registration and inspect user-visible feedback for credential leakage.

**Success:** Credentials stay in their intended channels and the data contract is honored. **Failure:** Application credential leakage or confirmed contract violation; preference persistence is unresolved until specified.

#### REG-37 — Supported browser regression matrix

**Priority:** P1. **Start:** F per browser; allocate unique account data per run. **Proposed matrix pending support policy.**

1. Run REG-01, REG-04, REG-08, REG-13, REG-15, REG-18, and REG-23 in each supported Chromium, Firefox, and WebKit version or the product's approved alternatives.
2. Observe native email-validation differences without requiring identical browser-native wording.
3. Verify consistent registration eligibility, server validation, authentication, and error recovery across supported browsers.

**Success:** Critical registration outcomes match across the agreed browser matrix. **Failure:** Browser-specific inability to create, reject, or recover correctly.

## Completion and reporting

- Minimum smoke coverage: REG-01, REG-04, REG-06, REG-08, REG-09, REG-11, REG-12, REG-15, REG-18, and REG-19.
- Record scenario ID, environment/browser, data-row description, actual outcome, request status where relevant, and defect reference. Never report planned cases as executed.
- Report unresolved rules separately from defects. In particular, do not infer preference persistence from a successful identity registration.
- Exploration created one synthetic account, `qa_plan_20261022_1416`; the plan does not depend on it. Cleanup requires the demo's agreed reset process; no shared reset was performed.
