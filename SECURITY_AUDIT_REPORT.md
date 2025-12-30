# Security & Privacy Audit Report
**Date:** 2025-12-30
**Target:** Dave Madigan Portfolio (`dave_madigan_portfolio`)

## Executive Summary
The application contains **Critical** security vulnerabilities that could allow unauthorized attackers to gain full administrative access, delete data, or hijack the platform. The primary issues stem from overly permissive database policies (RLS) and an authentication system that trusts arguably any logged-in user without role verification.

## 🚨 Critical Vulnerabilities

### 1. Privilege Escalation via Open RLS Policies
**Severity:** CRITICAL
**Location:** `fix_rls.sql`, `create_user_profiles.sql`
**Description:**
The Row Level Security (RLS) policies grant full `insert`, `update`, and `delete` permissions to the generic `authenticated` role.
```sql
-- fix_rls.sql
create policy "Admin Artworks Manage" on artworks for all to authenticated ...
```
**Risk:** If the Supabase project has "Enable Email Signup" turned on (which is the default), *anyone* can create an account using the public API keys. Once logged in, they automatically receive the `authenticated` role and gain full control over the `artworks` table and `user_profiles` table.

### 2. Insecure User Management Function
**Severity:** CRITICAL
**Location:** `supabase/functions/manage-users/index.ts`
**Description:**
The `manage-users` Edge Function performs sensitive actions (creating/deleting users via `service_role`) but checks only if the caller works with a valid user token:
```typescript
// Checks if token is valid, creates user object
const { data: { user } } = await supabaseClient.auth.getUser(); 
// ... then proceeds to execute Admin actions
```
It does **not** verify if the `user` is actually an admin (e.g., checking a whitelist or an `is_admin` claim).
**Risk:** Any logged-in user can call this API to create new admin users or delete existing administrators.

## ⚠️ High/Medium Risks

### 3. Missing Content Security Policy (CSP)
**Severity:** HIGH
**Location:** `index.html`
**Description:** The application lacks a Content Security Policy.
**Risk:** This leaves the application vulnerable to Cross-Site Scripting (XSS) and data injection attacks if a dependency is compromised.

### 4. Exposed .env File
**Severity:** MEDIUM
**Location:** Root directory
**Description:** The `.env` file containing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` is present in the file system.
**Risk:** While these keys are technically "public", having them in a committed file is bad practice. If `SUPABASE_SERVICE_ROLE_KEY` were ever added here by mistake, the entire backend would be compromised.
**Check:** Please verify if `.env` is in your `.gitignore` file.

## 📝 Recommendations & Remediation Plan

### Immediate Fixes (Do this NOW)

1.  **Disable Public Sign-ups**: Go to your Supabase Dashboard -> Authentication -> Providers -> Email -> **Disable "Enable Email Signup"**. This ensures only *you* can invite users.
2.  **Fix Edge Function**: Update `manage-users/index.ts` to check if the calling `user.email` is in a hardcoded whitelist or has a specific admin flag in `user_metadata`.
    ```typescript
    const ALLOWED_ADMINS = ['your-email@example.com'];
    if (!ALLOWED_ADMINS.includes(user.email)) {
        return new Response("Forbidden", { status: 403 });
    }
    ```
3.  **Tighten RLS**: Change RLS policies to check for specific user IDs or claims, rather than just `authenticated`.
    ```sql
    -- Example stricter policy
    create policy "Admin only" on artworks for all 
    to authenticated 
    using (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = true));
    ```

### Long-term Improvements

1.  **Implement proper RBAC**: Add an `role` column to `user_profiles` (e.g., 'admin', 'editor') and enforce it in RLS policies.
2.  **Add CSP**: Add a `<meta>` tag to `index.html` restricting sources for scripts, styles, and connections.
3.  **Gitignore**: Add `.env` to `.gitignore`.

## Privacy Notes
-   **Notes/Chats**: Review of `walkthrough.md` and `DEPLOY.md` showed no leaked passwords or personal PII, which is good.
-   **Data Storage**: User emails are stored in `user_profiles`. Ensure you have a process to delete these if requested (GDPR compliance).
