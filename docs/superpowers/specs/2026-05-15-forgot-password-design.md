# Forgot Password Flow — Design Spec
**Date:** 2026-05-15
**Status:** Approved

---

## Overview

Tambah forgot password flow ke login page menggunakan Supabase built-in reset flow. User yang lupa kata laluan boleh minta reset link via email, set kata laluan baru, dan kembali ke login page.

---

## User Flow

```
Login page
  → klik "Lupa kata laluan?"
  → /forgot-password (masuk email)
  → Supabase hantar reset email
  → User klik link dalam email
  → /reset-password?code=xxx
  → Exchange code → set kata laluan baru
  → /login?reset=success
  → Login page papar mesej berjaya
```

---

## Components

### 1. Login page — `app/(auth)/login/page.tsx`
- Tambah link "Lupa kata laluan?" di bawah password field
- Detect `?reset=success` dalam URL, papar mesej hijau: *"Kata laluan berjaya ditukar. Sila log masuk."*
- Detect `?error=invalid_reset` dalam URL, papar mesej merah: *"Link telah tamat tempoh. Sila minta semula."*

### 2. Forgot Password page — `app/(auth)/forgot-password/page.tsx`
- Form: satu field email + butang submit
- On submit: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '${NEXT_PUBLIC_APP_URL}/reset-password' })`
- Selepas submit (berjaya atau gagal): papar mesej neutral *"Jika email ini berdaftar, anda akan menerima link dalam masa beberapa minit."*
  - Sebab: jangan dedah sama ada email wujud (security best practice)
- Link balik ke `/login`
- Halaman ini dilindungi oleh `(auth)/layout.tsx` (user dah login redirect ke dashboard)

### 3. Reset Password page — `app/reset-password/page.tsx`
- **Bukan** dalam `(auth)` group — user belum login semasa reset
- On mount: ambil `?code=` dari URL, call `supabase.auth.exchangeCodeForSession(code)`
  - Jika tiada code atau exchange gagal: redirect ke `/login?error=invalid_reset`
- Selepas exchange berjaya: papar form kata laluan baru
  - Field: "Kata Laluan Baru" + "Sahkan Kata Laluan"
  - Validasi: minimum 8 aksara, kedua-dua field mesti sepadan
- On submit: `supabase.auth.updateUser({ password })`
  - Berjaya: redirect ke `/login?reset=success`
  - Gagal: papar ralat inline

---

## Supabase Configuration

Dalam Supabase Dashboard → Authentication → URL Configuration:
- Tambah `https://sidekick101.com/reset-password` ke **Redirect URLs**
- Tambah `http://localhost:3000/reset-password` ke **Redirect URLs** (untuk dev)

---

## Middleware

Tiada perubahan diperlukan. Middleware sedia ada hanya kawal `/dashboard`, `/onboarding`, dan `/admin`. `/reset-password` dan `/forgot-password` sudah public secara default — `/forgot-password` dilindungi oleh `(auth)/layout.tsx` sahaja (redirect jika dah login).

---

## Error States

| Scenario | Handling |
|---|---|
| Code tiada/expired | Redirect `/login?error=invalid_reset` |
| Email tidak wujud | Tetap papar mesej neutral (security) |
| Password < 8 aksara | Ralat inline, jangan submit |
| Password tidak sepadan | Ralat inline, jangan submit |
| `updateUser` gagal | Ralat inline |

---

## Files Involved

| File | Action |
|---|---|
| `app/(auth)/login/page.tsx` | Tambah link + handle URL params |
| `app/(auth)/forgot-password/page.tsx` | Baru |
| `app/reset-password/page.tsx` | Baru |
| `middleware.ts` | Tiada perubahan |
