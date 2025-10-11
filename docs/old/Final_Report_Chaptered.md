# Lumiere: Unified System for Insurance Claim Management

<!-- TITLE PAGE: Insert University/Module logo here. See Appendix 1 for the title page format. -->

Institute: SLIIT — Sri Lanka Institute of Information Technology (Campus: Malabe)
Module: IT2080 ITP — Assignment 3 (Final Presentation and Report), 2025 S2
Group: ITP25_B4_96
Date: 2025-10-06

Team Members
- IT23834774 — NATH I M N — it23834774@my.sliit.lk — +94 77 429 0347
- IT23836440 — FERNANDO PULLE N S — it23836440@my.sliit.lk — +94 70 311 4390
- IT23830332 — PATHIRANA P U O R — it23830332@my.sliit.lk — +94 71 679 2331
- IT23725010 — PERERA B I V — it23725010@my.sliit.lk — +94 70 134 6360
- IT23828766 — SENARATHNA P G R M — it23828766@my.sliit.lk — +94 71 777 6610

---

## Declaration

See Appendix 2 for the required declaration format.

We, the undersigned, hereby declare that this report titled “Lumiere: Unified System for Insurance Claim Management” is our own work and has not been submitted previously in identical or similar form for any other coursework or award. All sources of information used have been duly acknowledged.

Signatures
- IT23834774 — NATH I M N — .....................................................
- IT23836440 — FERNANDO PULLE N S — .............................................
- IT23830332 — PATHIRANA P U O R — ..............................................
- IT23725010 — PERERA B I V — ...................................................
- IT23828766 — SENARATHNA P G R M — .............................................

Date: 2025-10-06

---

## Abstract

Large organizations frequently provide group insurance benefits to employees, yet their claim workflows remain manual, fragmented, and slow—especially when multiple external insurers are involved. This report presents Lumiere, a unified web platform that digitizes end-to-end insurance claim management for employees, HR officers, and insurance agents. The system provides secure user management, policy tracking, dynamic questionnaire-driven claim submission, document storage on Azure Blob, real-time messaging and notifications via Socket.IO, and automated report generation (PDF) through Handlebars and Puppeteer. It integrates AI capabilities for conversational assistance (OpenAI) and message formalization (Gemini), and exposes a VAPI assistant proxy that safely performs function calls and role-aware database operations.

We adopt a modular Node.js/Express backend with MongoDB (Mongoose), and a React (Vite) frontend with Tailwind/MUI. Security is enforced with JWT authentication and strict role-based authorization across HTTP, sockets, and VAPI proxies. The architecture emphasizes maintainability (service modules, centralized error handling, machine-readable system index), scalability (stateless API, externalized file storage), and usability (clean UI flows and contextual guidance).

Evaluation focused on functional coverage from user stories, realistic workflow tests, and generation of operational reports. Results indicate substantially improved transparency, reduced turnaround time, and consistent enforcement of coverage and policy rules. We conclude that Lumiere offers a practical, extensible foundation for enterprise claim operations and outline future work in automated testing, analytics, and multi-tenant deployments.

---

## Acknowledgement

We thank our client at the Janashakthi Group for domain guidance and process insights, our lecturers and tutors for continuous feedback, and the open-source community for the tools and libraries (Node.js, Express, React, MongoDB, Socket.IO, Tailwind, MUI, Puppeteer, Handlebars) that enabled rapid delivery.

---

## Table of Contents

Note: When exporting to DOCX/ODT, generate the ToC automatically using the word processor's ToC tool. Likewise, generate List of Tables and List of Figures automatically.

- Pre-body section
  - Title page
  - Declaration
  - Abstract
  - Acknowledgement
  - Table of Contents
  - List of Tables
  - List of Figures
  - List of Abbreviations
- Chapter 1. Introduction
  - 1.1 Background
  - 1.2 Problem and Motivation
  - 1.3 Literature Review (summary)
  - 1.4 Aim and Objectives
  - 1.5 Solution Overview
  - 1.6 Methodology
  - 1.7 Structure of the Report
  - 1.8 Repository Link
- Chapter 2. Requirements — Stakeholder Analysis, Requirements Analysis, Requirements Modeling
- Chapter 3. Design and Development — Architecture, Components, Workflows, Database, Development
- Chapter 4. Testing — Acceptance Criteria and Main Test Cases with Results
- Chapter 5. Evaluation and Conclusion
- References
- Appendices
  - Appendix A — Full Literature Review (verbatim)
  - Appendix B — User Stories and Test Cases (verbatim)
  - Appendix C — Activities
  - Appendix D — System Index Reference

---

## List of Tables (LoT)

<!-- Populate automatically in Word/Writer; keep manual placeholders below if needed -->
- Table 4.1: Main Test Cases and Results (Chapter 4)
- Table 2.1: Stakeholders vs Key Needs (Chapter 2)

## List of Figures (LoF)

<!-- Populate automatically in Word/Writer; keep manual placeholders below if needed -->
- Figure 3.1: High-Level System Architecture
- Figure 3.2: Module/Component Diagram
- Figure 3.3: ER Diagram
- Figure 3.4: Claims Workflow Sequence Diagram

## List of Abbreviations (alphabetical)

- AI — Artificial Intelligence
- API — Application Programming Interface
- CRUD — Create, Read, Update, Delete
- DB — Database
- ER — Entity-Relationship
- HR — Human Resources
- JWT — JSON Web Token
- KPI — Key Performance Indicator
- MUI — Material UI
- PDF — Portable Document Format
- RBAC — Role-Based Access Control
- REST — Representational State Transfer
- SDK — Software Development Kit
- SMTP — Simple Mail Transfer Protocol
- UI/UX — User Interface / User Experience
- VAPI — Voice/Virtual Assistant API (assistant proxy)
- Vite — Frontend build tool

---

# Chapter 1. Introduction

## 1.1 Background

We are developing our application, Lumiere: A Unified System for Insurance Claim Management, as per request of our client, a senior business analyst for the Janashakthi Group of Companies[1]...
Within the organization, employees are often covered under group insurance policies for life and medical coverage... We are developing this system based on our client's requirements, with a focus on streamlining the insurance claim process...

<!-- INSERT CONTEXTUAL IMAGE / ORGANIZATION DIAGRAM HERE -->

## 1.2 Problem and Motivation

Insurance claim processing within the Janashakthi Group is currently handled through a manual, document-based system... This is the primary motivation for developing a Unified Insurance Claim Management System to streamline and automate the entire workflow.

## 1.3 Literature Review (summary)

- Existing carrier-focused solutions (e.g., Guidewire, FINEOS ClaimVantage) are powerful but costly and misaligned with HR-led corporate workflows.
- Local apps are typically single-insurer and not interoperable; corporates need a centralized, multi-provider solution.
- Summary implication: a unified, HR-centric, multi-insurer platform fills a clear gap.

<!-- For the full literature review, see Appendix A. -->

## 1.4 Aim and Objectives

Aim: Develop a unified digital platform to manage employee insurance claims, streamlining submission, verification, approval, documentation, and communication.

Objectives (step-by-step): understand user needs; design workflows and mockups; build core modules (auth, claims, documents, tracking, messaging); test and refine; deploy and train.

## 1.5 Solution Overview

- Frontend: React (Vite), React Router, MUI, Tailwind, Socket.IO client.
- Backend: Node.js, Express 5, MongoDB (Mongoose), Socket.IO.
- Storage & Reports: Azure Blob, Puppeteer + Handlebars for PDFs.
- AI & Assistant: OpenAI, Gemini, VAPI function-calling proxy.
- Security & RBAC: JWT + role-based middleware, DB proxy rules.

<!-- INSERT HIGH-LEVEL ARCHITECTURE DIAGRAM HERE -->

## 1.6 Methodology

- Requirements: interviews and observation of existing insurer portals.
- Design tools: Figma, Draw.io; dev stack: MERN; collaboration: GitHub, Agile sprints, ClickUp.
- Testing: unit, integration, system, UAT (manual focus within timeline).

## 1.7 Structure of the Report

- Chapter 2 presents stakeholders, requirements, and models.
- Chapter 3 details architecture, components, workflows, and data model.
- Chapter 4 covers testing approach, acceptance criteria, and results.
- Chapter 5 evaluates outcomes and concludes how objectives were met.

## 1.8 Repository Link

Project repository (clickable): https://github.com/NathIMN/Lumiere/

---

# Chapter 2. Requirements — Stakeholder Analysis, Requirements Analysis, Requirements Modeling

## 2.1 Stakeholder Analysis

- Site Admin: central control over accounts, settings, policy types.
- HR Officer: review/validate claims, forward to insurers, track employee insurance history.
- Regular Employee: submit life/medical claims, track status.
- Executive Employee: submit vehicle claims in addition to the above.
- Insurance Agent: process forwarded claims, approve/reject, request documents.

## 2.2 Functional Requirements (condensed)

- User Management: register/login, role assignment, profile management, password reset, account status control.
- Policy Management: create/assign policies, renewals, categorization, utilization reports, beneficiaries.
- Claim Management: dynamic questionnaires, submission, HR validation/forwarding, insurer decision, history.
- Document Management: secure upload/download, classification, versioning, search, sharing, verification.
- Messaging & Notifications: direct/group chats, claim-context threads, in-app/email alerts, preferences.
- Reports: users/policies/claims/financial PDFs, scheduling.
- AI & Assistant: chatbot Q&A, guidance, formalization, function-calling to internal APIs with RBAC.

## 2.3 Non-Functional Requirements

- Security: JWT auth, RBAC, secure file handling; audit logs where applicable.
- Performance: responsive UI, efficient uploads, handle concurrent reviews.
- Availability: minimal downtime; error handling and fallbacks.
- Scalability: stateless services, external object storage.
- Maintainability: modular services, centralized error handling, system index.

## 2.4 Requirements Modeling

- Use Cases: Submit Claim, Forward Claim, Approve/Reject Claim, Upload Document, Generate Report.
- Data: key entities — User, Policy, Claim, Document, Message, Notification, QuestionnaireTemplate.

<!-- INSERT USE CASE DIAGRAM HERE -->

---

# Chapter 3. Design and Development — Architecture, Components, Workflows, Database, Development

## 3.1 Architecture Overview

See System Overview (docs/SYSTEM_OVERVIEW.md) for a detailed mapping of routes, services, sockets, and env.

<!-- INSERT HIGH-LEVEL ARCHITECTURE DIAGRAM HERE -->

## 3.2 Components and Modules

- Users, Policies, Claims, Documents, Messaging, Notifications, Reports, Chatbot, VAPI proxy.

<!-- INSERT MODULE/COMPONENT DIAGRAM HERE -->

## 3.3 Database Design

Core entities and relationships as described in SYSTEM_OVERVIEW. Policies track claimed amounts by beneficiary and coverage type; claims reference questionnaire templates.

<!-- INSERT ER DIAGRAM HERE -->

## 3.4 Key Workflows

- Claim lifecycle: draft → employee → HR → insurer decision → approved/rejected/return.
- Document pipeline: upload (multer memory), Azure blob store, verify, archive.
- Reports generation: Handlebars HTML → Puppeteer PDF.

<!-- INSERT WORKFLOW/SEQUENCE DIAGRAMS HERE -->

## 3.5 Development Aspects

- Backend: Express 5, async wrappers, error handler, middleware (auth, upload, reportAuth).
- Frontend: React + Vite, router, MUI/Tailwind, services per API area.
- Integrations: Azure Blob, Nodemailer, OpenAI, Gemini, VAPI.

---

# Chapter 4. Testing — Acceptance Criteria and Main Test Cases with Results

## 4.1 Acceptance Criteria (examples)

- Users can register/login with valid credentials; incorrect passwords are rejected.
- Employees can submit claims with all required documents; HR can review/forward; agents can decide.
- Documents upload reliably and are retrievable; PDFs generate from report templates.

## 4.2 Main Test Cases (from Progress)

- TC01: New user registers with valid employee ID → Registration succeeds, email verification sent.
- TC02: Login with correct credentials → JWT issued.
- TC06: Employee submits a claim with required documents → Submission succeeds.
- TC08: HR approves a claim → Status updates, notifications sent.
- TC10: Agent processes claim → Decision recorded, reimbursement calculated.
- TC11: Document upload → Success, visible in viewer.
- TC12: Messaging → Direct message delivered, stored, recipient notified.
- TC14: Notification email on claim update → Correct content received.

<!-- INSERT TEST RESULT TABLE/SCREENSHOTS HERE -->

---

# Chapter 5. Evaluation and Conclusion

## 5.1 Evaluation

- Functionality: core flows validated across roles; reports generated.
- Performance: acceptable for prototype; file uploads and chats responsive.
- Usability: role-specific dashboards; chatbot guidance improved task clarity.
- Security: JWT auth and RBAC across HTTP, sockets, and VAPI DB proxies.

## 5.2 Conclusion

Lumiere standardizes and accelerates insurance claim management with a modular web stack and integrated AI. Objectives were met: streamlined claims, secure document handling, clear workflows, and actionable reporting. Future work: automated testing, analytics dashboards, mobile push, multi-tenant support.

---

## References

- Project repository: https://github.com/NathIMN/Lumiere/
- Prior documents: Proposal_ITP25_B4_96.pdf; Progress_ITP25_B4_96.txt
- Janashakthi Group. Home. https://www.jxg.lk/
- Janashakthi Insurance PLC. Home. https://www.janashakthi.com/
- Janashakthi Finance. Home. https://www.janashakthifinance.lk/
- FirstCap Limited. Home. https://firstcapltd.com/
- Janashakthi Corporate Services Limited. https://jcsl.lk/
- Guidewire. Guidewire (2019). https://www.guidewire.com/
- Majesco (ClaimVantage). Core Software Insurance Solutions. https://www.majesco.com/core-software-insurance-solutions/claimvantage/
- Allianz Australia. Make a Claim. https://www.allianz.com.au/claims.html

---

## Appendices

### Appendix 1 — Title Page Template

Use the following structure when typesetting the Title Page in the final DOCX/ODT/PDF:

- Institute Logo and Name (Centered)
- Module: IT2080 ITP — Assignment 3 (Final Presentation and Report), 2025 S2
- Project Title: “Lumiere: Unified System for Insurance Claim Management”
- Group: ITP25_B4_96
- Team Members:
  - IT23834774 — NATH I M N
  - IT23836440 — FERNANDO PULLE N S
  - IT23830332 — PATHIRANA P U O R
  - IT23725010 — PERERA B I V
  - IT23828766 — SENARATHNA P G R M
- Date of Submission

Center align the major headings, include the university logo at the top, and keep the page uncluttered. Page should not exceed one page.

### Appendix 2 — Declaration Template

We, the undersigned, hereby declare that this report titled “Lumiere: Unified System for Insurance Claim Management” is our own work and has not been submitted previously in identical or similar form for any other coursework or award. All sources of information used have been duly acknowledged.

Signatures

- IT23834774 — NATH I M N — .....................................................
- IT23836440 — FERNANDO PULLE N S — .............................................
- IT23830332 — PATHIRANA P U O R — ..............................................
- IT23725010 — PERERA B I V — ...................................................
- IT23828766 — SENARATHNA P G R M — .............................................

Date: ..........................

### Appendix A — Full Literature Review (verbatim)

(See Proposal for the complete text; summarized in Chapter 1.3.)

### Appendix B — User Stories and Test Cases (verbatim)

(See Progress report for the full list of user stories and test cases.)

### Appendix C — Activities

- Activity_01_ITP25_B4_96.pdf
- Activity_02_ITP25_B4_96.pdf
- Activity_3_ITP25_B6_143.pdf
- Activity_04_ITP25_B4_96.pdf

<!-- INSERT ACTIVITY SNAPSHOTS OR SUMMARIES HERE -->

### Appendix D — System Index Reference

- See `docs/system-index.json` and `docs/SYSTEM_OVERVIEW.md` for endpoints, models, services, sockets, and environment metadata used throughout the system.
