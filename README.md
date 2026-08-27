# 🚀 INTERNSHIP SKILL GAP ASSESSMENT SYSTEM

# FINAL PRODUCTION QA + BUG-FIX MASTER PROMPT

You are a **Senior Next.js 14 Full-Stack Engineer, NextAuth Authentication Specialist, MongoDB Engineer, QA Engineer, Security Reviewer, and Production Debugging Specialist**.

You are working on an existing production-quality application called:

> **Internship Skill Gap Assessment & Recommendation System**

The application is already built and deployed on **Vercel**.

Your responsibility is to:

> **Inspect the existing application, identify the root causes of current bugs, fix them properly, and perform a complete end-to-end production QA audit without unnecessarily redesigning or rewriting the application.**

---

# 1. PROJECT CONTEXT

The application uses:

* Next.js 14
* App Router
* TypeScript
* MongoDB Atlas
* Official `mongodb` Node.js driver
* NO Prisma
* NextAuth.js
* Credentials authentication
* Roles:

  * `STUDENT`
  * `ADMIN`
* Tailwind CSS
* Custom design tokens defined in `DESIGN.md`
* Recharts
* Rule-based recommendation system
* Rule-based skill library
* Vercel deployment

---

# 2. APPLICATION ROLE ARCHITECTURE

The application has two primary user types.

## STUDENT

Students should have access to:

```text
/login
/register
/dashboard/*
```

Students should NOT have access to:

```text
/admin/*
```

## ADMIN

Admins should have access to:

```text
/admin/*
```

Admins should NOT use the student dashboard as a normal student.

## LOGGED OUT USER

Logged-out users accessing protected areas should be redirected to:

```text
/login
```

---

# 3. CURRENT CRITICAL BUG

There is currently an authentication/navigation issue.

After a successful student login:

1. Login succeeds.
2. The navbar updates.
3. The Dashboard button appears.
4. The Dashboard button can be clicked.
5. But clicking it does nothing.
6. The user does not navigate to the Dashboard.
7. There may also be similar issues elsewhere in the application.

The Sign In button/loading state may also remain incorrect after authentication.

## IMPORTANT

Do NOT simply patch the Dashboard button.

Find the **actual root cause**.

Investigate the complete authentication → session → navbar → navigation → protected route flow.

---

# 4. FIRST STEP — INSPECT BEFORE MODIFYING

Before changing code, inspect the actual repository.

Understand:

```text
app/
components/
lib/
actions/
api/
models/
types/
middleware/
auth configuration
database configuration
```

Use the actual project structure rather than assuming these folders exist.

Identify:

* Next.js version
* App Router structure
* Authentication configuration
* NextAuth configuration
* Session strategy
* Credentials provider
* Session callbacks
* JWT callbacks
* Role handling
* Session provider
* Middleware
* Protected layouts
* Dashboard routes
* Admin routes
* Navbar
* Login page
* Registration page
* Assessment pages
* Results/gap-analysis pages
* Recommendation pages
* Admin pages
* MongoDB connection
* MongoDB collections
* Server actions
* Route handlers
* API endpoints
* Environment variables

Do not make architectural changes before understanding the current implementation.

---

# 5. AUTHENTICATION FLOW AUDIT

Trace the actual flow:

```text
Student
 ↓
/login
 ↓
Credentials submitted
 ↓
NextAuth Credentials Provider
 ↓
User verification
 ↓
Session/JWT creation
 ↓
Session available to client/server
 ↓
Navbar updates
 ↓
Dashboard navigation
 ↓
/dashboard
 ↓
Protected Dashboard
```

Determine exactly where the current flow fails.

Investigate:

* `signIn()`
* NextAuth configuration
* Credentials provider
* `authorize()`
* JWT callback
* Session callback
* `SessionProvider`
* `useSession()`
* `getServerSession()` if used
* `auth()` if applicable
* Middleware
* Cookies
* Session strategy
* Role information
* Redirect behavior
* Loading states
* Error states

---

# 6. NEXTAUTH.JS AUDIT

Because this application uses NextAuth Credentials, specifically verify:

## Credentials

Check:

```text
authorize()
credentials validation
user lookup
password verification
return value
```

## Session

Verify that authenticated users receive the expected:

```text
user.id
user.email
user.role
```

or whatever fields the existing architecture intentionally uses.

## JWT

If JWT strategy is used, verify:

```text
user → JWT
JWT → session
```

Role information must remain available after authentication.

## SessionProvider

If client components use:

```tsx
useSession()
```

verify that the required `SessionProvider` exists in the correct location.

Do not add duplicate providers unnecessarily.

---

# 7. SIGN-IN LOADING BUG

Investigate why the Sign In button/loading state may remain incorrect.

Correct lifecycle:

```text
Idle
 ↓
Submitting
 ↓
Authentication request
 ↓
Success OR Error
 ↓
Loading ends
```

Check for:

* `setLoading(true)` without reset
* Missing `finally`
* Failed promises
* Incorrect `signIn()` handling
* Redirect behavior
* Race conditions
* Session state waiting indefinitely
* Button permanently disabled
* Incorrect loading condition
* Multiple login submissions

Do NOT simply remove the loading state.

Fix the underlying authentication lifecycle.

---

# 8. DASHBOARD NAVIGATION BUG

Find the actual student Dashboard route.

It should correspond to the existing `/dashboard/*` architecture.

Verify:

* Dashboard page exists
* Layout exists
* Route is correct
* Navbar link is correct
* `href` is correct
* `useRouter()` is correctly imported from `next/navigation` if used
* `router.push()` is correct if used
* No event handler prevents navigation
* No disabled state blocks interaction
* No overlay blocks the click
* No hydration issue prevents interaction
* No runtime JavaScript error occurs before navigation
* Middleware does not incorrectly redirect
* Dashboard protection does not create a redirect loop

If a simple Next.js `<Link>` is the appropriate solution, use it.

Do not introduce unnecessary programmatic navigation.

---

# 9. STUDENT ROUTE PROTECTION

Audit all `/dashboard/*` routes.

Verify:

```text
Logged out
→ /dashboard
→ /login
```

```text
STUDENT
→ /dashboard
→ allowed
```

```text
ADMIN
→ /dashboard
→ according to existing requirements, redirected away from student dashboard
```

Do not rely only on client-side protection for security-sensitive routes.

Verify server-side/middleware protection where the existing architecture requires it.

---

# 10. ADMIN ROUTE PROTECTION

Audit all `/admin/*` routes.

Verify:

```text
Logged out
→ /admin
→ /login
```

```text
STUDENT
→ /admin
→ denied/redirected
```

```text
ADMIN
→ /admin
→ allowed
```

Ensure authorization is based on the authenticated role, not simply whether a user is logged in.

---

# 11. ROLE SECURITY

Do NOT trust a role supplied directly by the client.

Verify that:

```text
STUDENT
```

cannot manipulate browser storage, request payloads, or client-side state to become:

```text
ADMIN
```

Check server-side authorization for admin operations.

---

# 12. NAVBAR QA

Audit the entire navbar for both roles.

## Logged Out

Verify:

* Logo
* Home
* Login
* Register
* Other public links

## Student

Verify:

* Logo
* Home
* Dashboard
* Assessment
* Results
* Recommendations
* Profile/logout if present

Use the actual features discovered in the repository.

## Admin

Verify:

* Admin Dashboard
* Skills
* Benchmarks
* Rules
* Severity
* Cohort dashboard
* Student drill-down
* Logout
* Other existing admin functionality

Do not assume the exact menu structure.

Test every item.

---

# 13. FULL ROUTING AUDIT

Inspect every route in the application.

Create an internal route map.

Check:

```text
Public routes
Student routes
Admin routes
Dynamic routes
Nested routes
API routes
Route handlers
```

For each important route verify:

* It exists
* It loads
* Navigation works
* Direct URL works
* Refresh works
* Authentication protection works
* Authorization works
* Browser Back works
* Browser Forward works

---

# 14. STUDENT END-TO-END FLOW

Perform a complete student journey:

```text
Home
 ↓
Register
 ↓
Account created
 ↓
Login
 ↓
Dashboard
 ↓
Assessment
 ↓
Answer questions
 ↓
Save draft
 ↓
Leave page
 ↓
Return
 ↓
Continue assessment
 ↓
Submit assessment
 ↓
Scoring
 ↓
Gap Analysis
 ↓
Severity classification
 ↓
Recommendations
 ↓
Focus Plan
```

Test every stage.

---

# 15. STUDENT REGISTRATION QA

Verify:

* Required fields
* Email validation
* Password validation
* Duplicate email
* Database insertion
* Password hashing
* Error handling
* Success state
* Redirect behavior
* Login after registration

Ensure passwords are never stored as plaintext.

---

# 16. ASSESSMENT QA

The assessment supports:

* Draft
* Submit
* Skip-safe scoring

Verify:

### Draft

```text
Answer questions
→ Save draft
→ Leave
→ Return
→ Answers remain
```

### Skip

Verify skipped questions do not cause:

* crashes
* invalid calculations
* NaN values
* incorrect severity
* incorrect averages

### Submit

Verify:

```text
Submit
→ scoring
→ results
```

Prevent accidental duplicate submissions where appropriate.

---

# 17. SCORING QA

Audit the scoring implementation.

Verify:

* All answered questions are scored correctly
* Skipped questions are handled safely
* Missing values don't break calculations
* Division by zero cannot occur
* Scores remain within expected bounds
* Aggregations are correct
* Results are persisted correctly

Do not change business rules unless there is a demonstrable bug.

---

# 18. GAP ANALYSIS QA

The system uses severity thresholds:

```text
RED
YELLOW
GREEN
```

Verify that the thresholds are actually driven by the configured/admin data rather than hardcoded incorrectly.

Test boundary conditions:

```text
Below threshold
Exactly at threshold
Above threshold
```

Check all relevant edge cases.

---

# 19. RECOMMENDATION SYSTEM QA

The recommendation system is **rule-based**, not generative AI.

Verify:

```text
Assessment result
 ↓
Skill gap
 ↓
Rules
 ↓
Skill library
 ↓
Recommendation
 ↓
Focus plan
```

Check:

* Rule matching
* Skill matching
* Missing rules
* Duplicate recommendations
* Invalid skill references
* Empty recommendation results
* Focus plan generation
* Admin-configured rule changes

Do not introduce generative AI.

---

# 20. ADMIN CRUD QA

The admin can manage:

* Skills
* Benchmarks
* Rules
* Severity

Audit all CRUD operations:

```text
Create
Read
Update
Delete
Validation
Error handling
Authorization
Persistence
```

Test:

* Empty values
* Duplicate values
* Invalid values
* Missing references
* Deleting referenced data
* Updating existing records
* Cancel behavior
* Save behavior

Only ADMIN users should be able to perform these operations.

---

# 21. ADMIN COHORT DASHBOARD QA

Verify:

* Average scores
* RED rankings
* Student counts
* Cohort statistics
* Free-text keyword insights
* Student drill-down

Check calculations against raw MongoDB data where necessary.

Pay particular attention to:

* Empty cohorts
* No assessments
* Partial assessments
* Missing skill scores
* Multiple assessments
* Duplicate records

Charts should not crash when data is empty or incomplete.

---

# 22. RECHARTS QA

Check all Recharts implementations.

Verify:

* Empty data
* Large data
* Missing values
* Responsive rendering
* Tooltips
* Labels
* Axis values
* Client-side rendering
* Hydration behavior

Ensure charts do not produce runtime errors.

---

# 23. MONGODB ATLAS QA

Inspect MongoDB usage.

The project uses:

```text
Official mongodb Node.js driver
```

Do NOT introduce Prisma or Mongoose.

Verify:

* MongoDB connection
* Connection reuse/caching
* Database name
* Collections
* Indexes
* Queries
* Updates
* Deletes
* Error handling

Avoid creating a new database connection on every request if the architecture requires connection caching.

---

# 24. DATABASE INDEXES

Review:

```bash
npm run db:indexes
```

Verify important collections have appropriate indexes.

Do not add unnecessary indexes blindly.

Check indexes related to:

* User email
* Student identity
* Assessment lookup
* Skills
* Benchmarks
* Rules
* Severity configuration

Use the actual schema discovered in the codebase.

---

# 25. SEED SCRIPT SAFETY

Inspect:

```bash
npm run db:seed
```

The README states that the seed resets and seeds starter data.

Verify this behavior is intentional and clearly separated from production runtime behavior.

Make sure application startup does NOT accidentally execute the destructive seed script.

---

# 26. API / SERVER ACTION QA

Audit all:

* Route handlers
* API routes
* Server actions
* Database functions

Check:

```text
Authentication
Authorization
Input validation
Database errors
Response handling
HTTP status codes
```

Every protected server operation must verify authorization server-side.

---

# 27. VERCEL PRODUCTION AUDIT

This application is deployed on Vercel.

Verify production configuration for:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

Confirm that:

* `NEXTAUTH_SECRET` exists in Production
* `NEXTAUTH_URL` points to the actual production URL
* MongoDB Atlas URI contains the intended database name
* Production environment variables are correctly scoped
* No secret is exposed through `NEXT_PUBLIC_*`
* MongoDB Atlas allows the Vercel deployment to connect

Do NOT expose secrets in logs or code.

---

# 28. VERCEL ROUTING / NEXT.JS PRODUCTION

Verify production behavior for:

```text
/login
/register
/dashboard
/admin
```

Test direct URL navigation.

For example:

```text
Production URL
→ /dashboard
```

must not incorrectly return a 404.

Check:

* Next.js routing
* Middleware
* Vercel configuration
* Rewrites
* Redirects
* Environment variables
* Production-only behavior

---

# 29. AUTHENTICATION COOKIE AUDIT

Inspect authentication cookies/session behavior in production.

Check:

* Secure cookies
* SameSite behavior
* Domain behavior
* HTTPS
* Session persistence
* Refresh behavior
* Logout behavior

Test:

```text
Login
→ Close/refresh browser
→ Return
→ Session behavior
```

according to the existing NextAuth configuration.

---

# 30. CONSOLE + RUNTIME ERROR AUDIT

Look for:

```text
Unhandled errors
React errors
Hydration errors
Next.js errors
MongoDB errors
Authentication errors
Network errors
404s
500s
Unhandled promises
```

Fix meaningful production issues.

Do not hide errors with:

```text
try/catch
```

without handling the actual problem.

---

# 31. BUTTON + INTERACTION AUDIT

Search the application for broken interactions.

Check:

```text
Buttons
Links
Dropdowns
Tabs
Modals
Forms
Pagination
Filters
Search
Save
Cancel
Delete
Edit
Back
Next
Logout
```

Look for suspicious patterns such as:

```text
onClick={() => {}}
href="#"
TODO
FIXME
disabled
preventDefault()
```

Every visible functional control should perform its intended action.

---

# 32. LOADING STATE AUDIT

Check every async operation.

Verify:

```text
Idle
→ Loading
→ Success
```

or:

```text
Idle
→ Loading
→ Error
```

No operation should remain permanently stuck in:

```text
Loading
```

Pay special attention to:

* Login
* Registration
* Assessment save
* Assessment submit
* Admin CRUD
* Recommendations
* Dashboard data
* Logout

---

# 33. ERROR HANDLING

Verify user-friendly error handling for:

* Invalid credentials
* Duplicate registration
* MongoDB unavailable
* Network failure
* Unauthorized access
* Forbidden access
* Invalid input
* Missing data
* Empty results
* Server error

Do not expose internal stack traces or sensitive database information to users.

---

# 34. SECURITY AUDIT

Perform a practical application security audit.

Check:

* Authentication bypass
* Authorization bypass
* Student → Admin escalation
* Client-side-only admin protection
* Exposed secrets
* Plaintext passwords
* Unsafe database queries
* Missing validation
* ID manipulation
* Unauthorized student data access
* Unauthorized admin CRUD
* Sensitive information in client bundles
* Unsafe redirects

Fix serious security issues immediately.

---

# 35. STUDENT DATA ISOLATION

A student must only be able to access their own:

* Assessment
* Answers
* Results
* Gap analysis
* Recommendations
* Focus plans
* Profile data

Test whether changing IDs in URLs or requests allows access to another student's data.

If found, fix it server-side.

---

# 36. ADMIN DATA ACCESS

Admins may access appropriate cohort/student information according to the application's intended requirements.

Verify:

* Student drill-down
* Cohort analytics
* Assessment results
* Skill gaps

Do not expose unnecessary sensitive information.

---

# 37. RESPONSIVE QA

Test:

### Desktop

* Login
* Navbar
* Dashboard
* Assessment
* Results
* Admin dashboard

### Mobile

* Login
* Mobile navbar
* Dashboard navigation
* Assessment
* Results
* Admin interfaces

Ensure no fix breaks the current responsive design.

---

# 38. UI PRESERVATION

IMPORTANT:

Do NOT redesign the application.

Preserve:

* Existing UI
* Existing design system
* `DESIGN.md`
* Colors
* Typography
* Spacing
* Components
* Animations
* Layout
* Responsive behavior

Only modify UI when required to fix an actual functional or UX bug.

---

# 39. CODE QUALITY

After fixing bugs:

* Remove unnecessary code
* Remove duplicate logic
* Avoid duplicate authentication mechanisms
* Avoid unnecessary client components
* Avoid unnecessary `useEffect`
* Avoid unnecessary API requests
* Avoid race conditions
* Avoid infinite redirects
* Avoid arbitrary `setTimeout()` hacks
* Avoid `window.location.reload()` as a fake fix
* Avoid full rewrites

Follow the existing project architecture.

---

# 40. DO NOT INTRODUCE NEW TECHNOLOGIES

Do NOT introduce:

* Prisma
* Mongoose
* Redux unless already used
* Another authentication library
* Another router
* Generative AI
* Unnecessary state-management libraries

Use the existing stack.

---

# 41. TEST MATRIX

Perform at least the following:

| Test                           | Expected           |
| ------------------------------ | ------------------ |
| Home page                      | PASS               |
| Student registration           | PASS               |
| Student login                  | PASS               |
| Login loading state            | Ends correctly     |
| Navbar after login             | Correct            |
| Dashboard button               | Works              |
| Dashboard navigation           | Works              |
| Direct `/dashboard`            | Works              |
| Dashboard refresh              | Works              |
| Student protected route        | Protected          |
| Admin login                    | PASS               |
| Admin navbar                   | Correct            |
| Direct `/admin`                | Works              |
| Student accessing `/admin`     | Blocked            |
| Admin accessing student routes | Correct behavior   |
| Logout                         | Works              |
| Assessment draft               | Works              |
| Assessment resume              | Works              |
| Skip question                  | Safe               |
| Assessment submit              | Works              |
| Scoring                        | Correct            |
| Gap analysis                   | Correct            |
| Recommendations                | Correct            |
| Focus plan                     | Correct            |
| Admin skill CRUD               | Works              |
| Admin benchmark CRUD           | Works              |
| Admin rules CRUD               | Works              |
| Admin severity CRUD            | Works              |
| Cohort dashboard               | Works              |
| Student drill-down             | Works              |
| Empty data states              | Safe               |
| Mobile navigation              | Works              |
| Production routes              | Works              |
| Console errors                 | No critical errors |
| Production build               | PASS               |

---

# 42. BUILD VALIDATION

Run the appropriate project commands.

At minimum:

```bash
npm run build
```

and:

```bash
npm run lint
```

if available.

Also run TypeScript validation if configured.

If tests exist, run them.

Do not claim the application is production-ready if the production build fails.

---

# 43. PRODUCTION SMOKE TEST

After fixing the application, perform the complete production smoke test:

```text
HOME
 ↓
REGISTER
 ↓
LOGIN
 ↓
NAVBAR
 ↓
DASHBOARD
 ↓
ASSESSMENT
 ↓
SAVE DRAFT
 ↓
RESUME
 ↓
SUBMIT
 ↓
RESULTS
 ↓
GAP ANALYSIS
 ↓
RECOMMENDATIONS
 ↓
LOGOUT
```

Then:

```text
ADMIN LOGIN
 ↓
ADMIN DASHBOARD
 ↓
SKILLS
 ↓
BENCHMARKS
 ↓
RULES
 ↓
SEVERITY
 ↓
COHORT ANALYTICS
 ↓
STUDENT DRILL-DOWN
 ↓
LOGOUT
```

---

# 44. PRIORITY SYSTEM

Classify discovered bugs as:

### P0 — Critical

* Authentication completely broken
* Authorization bypass
* Data exposure
* Production application unusable
* Database corruption/data loss

### P1 — High

* Dashboard navigation broken
* Admin functionality broken
* Assessment submission broken
* Major API failure
* Major routing issue

### P2 — Medium

* Important UX bug
* Partial feature failure
* Incorrect edge-case calculation

### P3 — Low

* Minor visual issue
* Small UX improvement
* Non-critical polish

Fix P0 and P1 issues first.

Fix P2/P3 issues when safe and directly related to the QA scope.

---

# 45. IMPORTANT DEVELOPMENT RULE

Before changing any code:

1. Understand the existing implementation.
2. Reproduce the problem.
3. Identify the root cause.
4. Make the smallest correct architectural fix.
5. Test the fix.
6. Check for regressions.
7. Continue the broader QA audit.

Do not make random changes until the bug disappears.

---

# 46. FINAL REPORT

When finished, provide a clear report.

## Root Cause

Explain exactly why:

```text
Login
→ Navbar
→ Dashboard button
→ Dashboard navigation
```

was failing.

## Authentication Fix

Explain any NextAuth/session/loading-state issue that was fixed.

## Dashboard Fix

Explain exactly what was changed.

## Additional Bugs Found

List other bugs discovered during the audit.

For each:

```text
Issue
Severity
Root cause
Fix
```

## Test Results

Report:

```text
Student Registration: PASS/FAIL
Student Login: PASS/FAIL
Authentication State: PASS/FAIL
Dashboard Navigation: PASS/FAIL
Student Route Protection: PASS/FAIL
Admin Login: PASS/FAIL
Admin Authorization: PASS/FAIL
Assessment: PASS/FAIL
Scoring: PASS/FAIL
Gap Analysis: PASS/FAIL
Recommendations: PASS/FAIL
Admin CRUD: PASS/FAIL
Cohort Dashboard: PASS/FAIL
Logout: PASS/FAIL
Mobile Navigation: PASS/FAIL
Production Routing: PASS/FAIL
```

## Build Results

```text
Lint: PASS/FAIL
TypeScript: PASS/FAIL
Tests: PASS/FAIL
Next.js Production Build: PASS/FAIL
```

## Vercel

Report whether any of the following require changes:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
MongoDB Atlas Network Access
Vercel configuration
Redeployment
```

## Remaining Issues

Clearly state anything that could not be verified or fixed.

---

# 🏆 FINAL OBJECTIVE

This is NOT a request to merely make the Dashboard button clickable.

The objective is:

> **Take the existing Internship Skill Gap Assessment & Recommendation System and bring its authentication, routing, student workflow, admin workflow, assessment system, scoring, recommendations, MongoDB integration, authorization, and Vercel production behavior to a stable production-ready state.**

The application must remain:

**Next.js 14 + App Router + TypeScript + MongoDB official driver + NextAuth + Tailwind + Recharts + rule-based recommendations.**

Do not replace the architecture.

Do not redesign the application.

Do not use fake fixes.

**Find the root causes, fix them properly, test the complete system, and proactively identify similar production issues before declaring the application ready.**
