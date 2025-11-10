## Password reset (backend)

Configure environment variables (see `config/env.sample`):

- CLIENT_URL (e.g., http://localhost:3000)
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
- APP_NAME (defaults to "Bena Cosmetics")

Endpoints (mounted at `/api/auth`):

- POST `/forgot`: `{ email }` → always returns 200 with a generic message. Sends reset email if the user exists.
- POST `/reset`: `{ email, token, password }` → validates token and updates password.

How to test locally:

1) Set valid SMTP credentials (or use a testing SMTP service).
2) Start backend: `npm start`.
3) Call POST `/api/auth/forgot` with a registered user email.
4) Check email, open the reset link, then call POST `/api/auth/reset` with the token, email, and new password.

Security highlights:

- Token: 32-byte random, SHA-256 stored, 60-minute expiry.
- Bcrypt 10 rounds for new password.
- Generic responses avoid email enumeration.
- Rate limit on `/forgot` to reduce abuse.


