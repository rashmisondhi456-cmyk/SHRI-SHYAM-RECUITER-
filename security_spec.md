# Security Specification — Shri Shyam Consulting ATS

## 1. Data Invariants
1. **Strict Ownership & Email Verification**: All user workspace documents (`/users/{userId}` and subcollections `private`, `candidates`, `jobs`, `interviews`) are readable and writable ONLY by the verified authenticated owner (`request.auth.uid == userId && request.auth.token.email_verified == true`), or an explicit verified admin.
2. **PII Isolation**: User email and provider metadata live exclusively under `/users/{userId}/private/{docId}`. Candidate contact details, salaries, notes, and interview links are AES-256-GCM encrypted in `encryptedPii` / `encryptedDetails`.
3. **Immutable Fields**: `uid`, `id`, `ownerId`, and `createdAt` can never be changed after creation. Server timestamp `request.time` is strictly enforced on `createdAt` (create) and `updatedAt` (create & update).
4. **Relational Integrity**: On interview creation, `candidateId` must reference an existing candidate document under `/users/{userId}/candidates/{candidateId}`.
5. **Terminal State Locking**: Once a job reaches `closed`, a candidate reaches `hired`, or an interview reaches `completed`/`cancelled`, non-admin updates are blocked.
6. **Strict Key & Size Enforcement**: Every entity uses `keys().hasAll(...) && keys().hasOnly(...)` on create, `affectedKeys().hasOnly(...)` per action on update, regex-validated IDs (`^[a-zA-Z0-9_\-]+$`), and explicit `.size()` upper bounds on every string and array.

## 2. "Dirty Dozen" Adversarial Test Payloads
1. **Unauthenticated Read/Write**: `auth = null` reading `/users/u1/candidates/c1` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoofing**: `auth = { uid: 'u1', token: { email: 'rashmisondhi456@gmail.com', email_verified: false } }` writing -> `PERMISSION_DENIED`.
3. **Cross-Tenant Access**: `auth = { uid: 'u2', token: { email_verified: true } }` reading/listing `/users/u1/candidates` -> `PERMISSION_DENIED`.
4. **Shadow/Ghost Field Injection**: Creating a candidate with extra `{ isVerified: true, role: 'admin' }` -> `PERMISSION_DENIED` (`hasOnly` rejection).
5. **OwnerId Spoofing**: Creating a job under `/users/u1/jobs/j1` with `ownerId: 'u2'` -> `PERMISSION_DENIED`.
6. **ID Poisoning (1.5KB Document ID)**: Creating `/users/u1/jobs/${'a'.repeat(1500)}` -> `PERMISSION_DENIED` (`isValidId` fails).
7. **Timestamp Forgery**: Creating a job with client timestamp `createdAt != request.time` -> `PERMISSION_DENIED`.
8. **Immutable Field Mutation**: Updating a candidate to change `ownerId` or `createdAt` -> `PERMISSION_DENIED`.
9. **Terminal State Bypass**: Updating an interview whose existing `status == 'completed'` back to `'scheduled'` -> `PERMISSION_DENIED`.
10. **Orphaned Interview Creation**: Creating an interview referencing a non-existent `candidateId` -> `PERMISSION_DENIED` (`exists()` check fails).
11. **Array Exhaustion**: Creating a job with `skillsRequired` containing > 15 items -> `PERMISSION_DENIED`.
12. **Self-Admin Escalation**: Writing to `/admins/{uid}` from client SDK -> `PERMISSION_DENIED`.
