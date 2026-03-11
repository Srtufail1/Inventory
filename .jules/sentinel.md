## 2025-05-15 - [Authorization Gap in Server Actions]
**Vulnerability:** Server actions performing sensitive administrative tasks (role updates, log deletion) lacked explicit authorization checks, relying solely on client-side/layout-level routing protection.
**Learning:** In Next.js, protecting a route (e.g., via `layout.tsx` or `middleware.ts`) does not automatically secure the Server Actions used within that route. Attackers can potentially invoke these actions directly if they are exported and lack internal authorization logic.
**Prevention:** Always implement explicit authorization checks inside every sensitive Server Action, verifying the user's permissions against the database within the action body.
