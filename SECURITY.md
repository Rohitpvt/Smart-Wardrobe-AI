# Security Policy

## Supported Versions
Currently, only the `main` branch is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please DO NOT report it by creating a public GitHub issue. Instead, please email the maintainer directly.

We will review all reports and respond as quickly as possible.

## Production Security Measures
The Smart Wardrobe AI incorporates the following production security hardening:
1. **Password Hashing:** `bcrypt` with a cost factor of 12.
2. **API Rate Limiting:** Applied to authentication and upload routes via `slowapi` to prevent brute force and abuse.
3. **Payload Limits:** 10MB maximum request size limit enforced via FastAPI middleware.
4. **S3 Hardening:** Strict content-type (`image/jpeg`, `image/png`, `image/webp`), sanitized filenames, and strict `user_id` directory scoping to prevent directory traversal or IDOR. Bucket remains private with temporary presigned URLs.
5. **CORS:** Restricted strictly to configured `CORS_ORIGINS`.
