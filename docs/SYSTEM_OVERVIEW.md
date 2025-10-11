# Lumiere System Overview

This document provides a comprehensive overview of the Lumiere system: architecture, major components, APIs, data models, workflows, integrations, environment configuration, and real‑time features.

## Architecture

- Frontend: React 19 (Vite), React Router, MUI, Tailwind CSS, Socket.IO client.
- Backend: Node.js, Express 5, MongoDB with Mongoose 8, Socket.IO 4.
- Storage/Infra: Azure Blob Storage for files; Nodemailer for email; Puppeteer + Handlebars for PDF reports.
- AI/Voice: OpenAI and Gemini services; VAPI server SDK for voice assistant and function-calling proxy.

Base API URL: `/api/v1` (proxied by Vite during development).

## Backend layout

- server.js: Express app bootstrap, CORS, route mounts, Socket.IO init, DB connect.
- routes → controllers → models/services pattern.
- middleware: auth (JWT + RBAC), upload (multer), async wrapper, error handler, reportAuth.
- services: azureBlobService, emailService, openaiService, geminiService, reportsService, vapiService, vapiProxyService.
- socket/socketHandler.js: real‑time messaging, presence, typing with JWT auth.

## Key environment variables

- Core: PORT, MONGO_URI, JWT_SECRET, CLIENT_URL
- Azure: AZURE_STORAGE_CONNECTION_STRING, AZURE_CONTAINER_NAME
- Email: EMAIL_PROVIDER, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, GMAIL_USER, GMAIL_PASS
- AI: OPENAI_API_KEY, GEMINI_API_KEY
- VAPI: VAPI_PRIVATE_API_KEY, VAPI_PUBLIC_API_KEY
- Frontend: VITE_API_BASE_URL (optional due to dev proxy)

## HTTP APIs (high level)

All under `/api/v1`.

- Documents `/documents` (auth): list, create, read, update, delete, stats, by reference, by user, verify, archive.
- Files `/files` (auth): upload single/multiple, download, delete.
- Users `/users`: register, login; profile CRUD; change password; admin/hr: list, CRUD by id, status, reset password, stats.
- Policies `/policies` (auth): my-policies, my-agent-policies; stats/expiring; eligibility; by agent; bulk status; CRUD; status/renew; beneficiaries add/remove; claimed amounts (by policy and summary); coverage consistency validation; usage metrics; get by policyId convenience routes.
- Questionnaire Templates `/questionnaireTemplates` (auth): valid/missing combinations, validate, by-type, CRUD, clone, toggle-status, hard-delete.
- Claims `/claims` (auth): stats/overview, actions/pending; CRUD (list/create/read by id); questionnaire fetch, section fetch, update answer(s), submit (section/all), submit claim; documents upload/list; workflow forward/decision/return; status update; employee draft delete.
- Messages `/messages` (auth): conversations list/create, contacts/search, unread-count, get conversation, send, mark read, edit/delete message.
- Notifications `/notifications` (auth): list, unread-count, mark read/all-read, delete; plus public testing endpoints for send (in-app/email/combined/bulk).
- Reports `/reports` (auth): templates; users, policies, claims, financial PDFs; custom, schedule (admin).
- VAPI `/vapi`: webhook (public), public-key (auth); assistant create/config/update; function-call; call create/history; metrics; execute-function; api-call; db-operation; test-function.
- Chatbot `/chatbot`: message, formalize, stream.

See `docs/system-index.json` for method-by-method mapping.

## Data models (key fields)

- User: email, password (hashed), role, profile/employment/dependents/bankDetails/provider, status, loginAttempts/lockUntil. Virtuals: fullName, age, isLocked.
- Policy: policyId, policyType (life|vehicle), coverage details by type, beneficiaries, claimedAmounts matrix, validity, premium, status, documents. Rich helpers to track claimed amounts and validate coverage consistency; pre-save syncing and validations.
- Claim: claimId, employeeId, policy ref, claimType/option, status workflow (draft→employee→hr→insurer→approved/rejected), questionnaire sections with responses, claimAmount, decision, returnReason, docs, timestamps; methods for questionnaire, submit/forward/decision with coverage validation and updates to policy claimed amounts.
- Document: Azure blob metadata (name, url, contentType, size), type/docType/status, accessLog, verification.
- Message: conversationId, sender/recipient, content, status (sent/delivered/read), edited, attachments, metadata; statics for conversations and helpers.
- Notification: userId, title, message, type/priority/status/category, actionButton, metadata, readAt/expiresAt; statics: getUserNotifications, markAsRead, markAllAsRead, getUnreadCount, cleanup.
- QuestionnaireTemplate: templateId, claimType/claimOption, sections[questions], isActive/version/modifiedBy; unique index and helpers.

## Workflows

Claims lifecycle:
1) Employee creates claim and fills questionnaire (per-section or all). 2) Submit claim (status → employee). 3) HR forwards to insurer (status → hr_officer). 4) Insurance agent makes decision (approved/rejected), with coverage validation and proportional updates to policy.claimedAmounts. 5) Claim may be returned to previous stage with a reason.

Policies coverage accounting:
- Policy tracks claimed amounts per beneficiary and coverage type; helpers compute remaining coverage and validate totals; controllers expose summaries and consistency checks.

Reporting:
- Handlebars templates render HTML; Puppeteer exports PDFs for users/policies/claims/financial; helpers for formatting.

VAPI and AI:
- VAPI exposes natural language and function-calling endpoints that proxy to internal APIs/DB with RBAC enforced in `vapiProxyService`.
- Chatbot integrates OpenAI/Gemini with graceful fallbacks.

Socket.IO events

- Auth handshake with JWT. Rooms per user and per conversation. Events: join_conversation, send_message, mark_as_read, typing_start/typing_stop, presence updates. System messages are supported.

## Frontend services (selected)

- user-api.js: auth, profile, user admin/HR operations, stats, auth state helpers.
- policyService.js: policies CRUD, stats, expiring, eligibility, beneficiaries management, claimed amounts utilities, coverage validators.
- insurance-api.js: claims CRUD, questionnaire flows, submission/forward/decision/return, coverage validation helpers.
- document-api.js: document metadata and file upload/download APIs.
- messaging-api.js: conversations, contacts, messages, search, unread count.
- notification-service.js: Socket.IO notifications and REST helpers.
- reports-api.js: report templates and PDF download helpers.
- chatbot-api.js: AI message, formalize, streaming.
- vapi-api.js: natural language and proxy to backend VAPI endpoints.

## Security and RBAC

- JWT auth; centralized authenticate middleware; role checks via authorize().
- Additional RBAC in DB proxy operations for VAPI to avoid data overreach.

## Error handling

- Central error handler maps common Mongoose and network errors to JSON responses. Async wrapper used across controllers.

## Development notes

- Dev proxy in Vite maps `/api` to backend at http://localhost:5000. Use `VITE_API_BASE_URL` for direct calls if needed.
- Ensure all env vars above are configured before running.

## Next steps

- Add API schema examples (request/response) per endpoint group.
- Add diagrams for claims workflow and policy coverage relationships.
