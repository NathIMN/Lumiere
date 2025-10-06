# Lumiere: Unified System for Insurance Claim Management

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

<!-- INSERT COVER IMAGE / UNIVERSITY LOGO HERE -->

## Abstract

Large organizations frequently provide group insurance benefits to employees, yet their claim workflows remain manual, fragmented, and slow—especially when multiple external insurers are involved. This report presents Lumiere, a unified web platform that digitizes end-to-end insurance claim management for employees, HR officers, and insurance agents. The system provides secure user management, policy tracking, dynamic questionnaire-driven claim submission, document storage on Azure Blob, real-time messaging and notifications via Socket.IO, and automated report generation (PDF) through Handlebars and Puppeteer. It integrates AI capabilities for conversational assistance (OpenAI) and message formalization (Gemini), and exposes a VAPI assistant proxy that safely performs function calls and role-aware database operations.

We adopt a modular Node.js/Express backend with MongoDB (Mongoose), and a React (Vite) frontend with Tailwind/MUI. Security is enforced with JWT authentication and strict role-based authorization across HTTP, sockets, and VAPI proxies. The architecture emphasizes maintainability (service modules, centralized error handling, machine-readable system index), scalability (stateless API, externalized file storage), and usability (clean UI flows and contextual guidance).

Evaluation focused on functional coverage from user stories, realistic workﬂow tests, and generation of operational reports. Results indicate substantially improved transparency, reduced turnaround time, and consistent enforcement of coverage and policy rules. We conclude that Lumiere offers a practical, extensible foundation for enterprise claim operations and outline future work in automated testing, analytics, and multi-tenant deployments.

## Acknowledgments

We thank our client at the Janashakthi Group for domain guidance and real-world process insights, our lecturers and tutors for continuous feedback, and the broader open-source community whose tools and libraries (Node.js, Express, React, MongoDB, Socket.IO, Tailwind, MUI, Puppeteer, Handlebars) accelerated our delivery.

## Table of Contents

- 1. Background
- 2. Problem and Motivation
- 3. Literature Review
- 4. Aim and Objectives
- 5. Methodology
- 6. Solution Overview
	- 6.1 System Architecture
	- 6.2 Module Decomposition
	- 6.3 Data Model Summary
	- 6.4 Key Workflows
	- 6.5 Security and RBAC
	- 6.6 Integrations
	- 6.7 Deployment and Environment
	- 6.8 Non-Functional Requirements
- 7. Implementation Details
- 8. Testing and Evaluation
- 9. Results and Discussion
- 10. Limitations
- 11. Future Work
- 12. Conclusion
- References
- Appendices

## 1. Background (verbatim from Progress/Proposal)

Formal references (from Proposal):

- Janashakthi Group. Home. https://www.jxg.lk/
- Janashakthi Insurance PLC. Home. https://www.janashakthi.com/
- Janashakthi Finance. Home. https://www.janashakthifinance.lk/
- FirstCap Limited. Home. https://firstcapltd.com/
- Janashakthi Corporate Services Limited. https://jcsl.lk/
- Guidewire. Guidewire (2019). https://www.guidewire.com/
- Majesco (ClaimVantage). Core Software Insurance Solutions. https://www.majesco.com/core-software-insurance-solutions/claimvantage/
- Allianz Australia. Make a Claim. https://www.allianz.com.au/claims.html
Within the organization, employees are often covered under group insurance policies for life and medical coverage, and in some cases, individual vehicle insurance. These policies are maintained through partnerships with multiple third party insurance providers. Currently, companies within the Janashakthi Group handle most of their insurance claim processing manually, relying on physical document submissions to the HR departments.
Since this is a very time consuming and confusing task, they are seeking a web based solution to standardize the operations occurring within the company more systematically. 
We are developing this system based on our client's requirements, with a focus on streamlining the insurance claim process, enabling both employees and HR staff to efficiently manage claims, communicate, and carry out related tasks with improved accuracy and convenience.

<!-- INSERT CONTEXTUAL IMAGE / ORGANIZATION DIAGRAM HERE -->

## 2. Problem and Motivation (verbatim from Proposal)

# **Problem and motivation** {#problem-and-motivation .unnumbered}

## **Problem statement** {#problem-statement .unnumbered}

Insurance claim processing within the Janashakthi Group is currently
handled through a manual, document-based system and this is often a
confusing and grueling task with delays and other such issues,
especially due to having to communicate with multiple external insurance
providers.

## **Current problem and Current process** {#current-problem-and-current-process .unnumbered}

When an employee faces an incident that requires an insurance claim,
such as a medical emergency, some terminal illness or vehicle damage,
they must initiate the claiming process by contacting the HR department
of their respective company.

1.  **Initial Claim Request**

The employee visits the HR department and fills in the required forms,
including bio data, dependent information and details about the
incident. Employee also hands over the relevant physical documents such
as medical bills, police reports, photos etc. to the HR department. A HR
officer verifies the employee's eligibility for the claim based on the
assigned insurance policy.

2.  **Verification by HR**

HR department cross checks the claim details with internal employee
details and their assigned insurance policies. If there's any
information missing, the HR officer informs the employee to resubmit the
claim request or revise the documents.

3.  **Forwarding to Insurance Provider**

Once the claim request is verified, the HR officer forwards the claim
request to the relevant insurance provider(s) associated with the
employee's insurance policies. This communication is done via email, and
it requires HR officers scanning documents manually.

4.  **Insurance Provider Processing**

The claims team of the insurance provider reviews the claim, validates
the submitted documents, and decided on approval or rejection of the
claim request. They also determine the claim amount if the claim request
is approved. Their final decision is then sent back to the HR department
for confirmation.

5.  **Employee Notification**

Once a decision is made, the HR department notifies the employee of the
outcome. The payment process is handled independently by the insurance
company and a notification is sent to the employee.

6.  **Record Maintenance**

All claim details, approvals, rejections, and communications are
maintained manually in company files and spreadsheets. There is no
centralized system to track claims, view policy usage, or analyze
patterns over time.

This current procedure is prone to delays, document misplacement, and
inefficiencies, especially when dealing with multiple insurance
providers and a high volume of employee claims. This is the primary
motivation for developing a Unifies Insurance Claim Management System to
streamline and automate the entire workflow.

## **Motivation** {#motivation .unnumbered}

Implementing a Unified Insurance Claim Management System will bring
significant advantages to both the HR department and employees within
the Janashakthi Group. The new system will reduce manual workload,
eliminate paperwork related delays, and ensure faster and more
transparent claim processing**.**

	-----------------------------------------------------------------------
	User                                Benefits
	----------------------------------- -----------------------------------
	Site Admin                          Centralized control over HR
																			accounts and insurance provider
																			data

	HR Officer                          Organized claim tracking, document
																			handling, and insurer coordination

	Regular Employee                    Can easily claim life insurance and
																			track status

	Executive Employee                  Can also claim vehicle insurance
																			and upload documents

	Insurance Agent                     Faster, digital access to employee
																			claims; easy approval/rejection
	-----------------------------------------------------------------------

**General Benefits**

-   Reduced processing time.

-   Better management of documents.

-   Claim status transparency.

-   Centralized system for multiple insurers.

-   Ease of use.

## 3. Literature Review (verbatim from Proposal)

# **Literature review** {#literature-review .unnumbered}

In the insurance industry, several mobile applications are available for
customers to submit individual insurance claims, and most insurance
companies in Sri Lanka offer such platforms. However, as of now, there
is no solution specifically designed to manage insurance claims from the
perspective of a company's HR department, particularly for handling
claims made by employees under group insurance policies offered by their
employer as an additional benefit.

Large-scale organizations that partner with multiple insurance providers
to offer such benefits often face difficulties in managing claims
internally. While some companies have requested insurance providers to
deliver better systems that support HR teams in processing claims -
especially under group policies - no such solution has yet been
successfully implemented. Our client, in particular, emphasized the need
for a centralized platform to reduce delays, improve accessibility, and
simplify the overall process. They also believe such a solution would be
in high demand among corporates with large workforces.

##  **Existing Insurance Claim Management Platforms** {#existing-insurance-claim-management-platforms .unnumbered}

We researched global and domestic claim management platforms. Global
platforms like Guidewire^[6]^ and FINEOS ClaimVantage^[7]^ possess
strong functionality but are complex, costly, and geared towards being
used by insurance carriers more than corporate HR.

Local Sri Lankan solutions are vendor-specific - developed for one
insurer like SLIC, Union Assurance, etc. These packages do not support
multi-insurers and therefore turn out to be unsuitable for the firms
that deal with claims under multiple insurers. Our solution meets this
need by offering a centralized, multi-provider platform that is designed
for internal organizational use.

### **Available insurance claim management solutions worldwide**

**Guidewire P&C Insurance Solutions**

Guidewire provides Property and Casualty (P&C) insurance products
utilized by top global insurance companies such as Allianz
Insurance^[8]^ and Tokio Marine. One of its most high-profile
products, Guidewire ClaimCenter, delivers comprehensive end-to-end
automation of the claims process and is particularly suitable for
business organizations with a high volume of claims processing. Its
strongest points are its excellent scalability, faultless interfacing
with other fundamental insurance systems like underwriting, policy, and
billing, and an extensive range of analytics and reporting capabilities.
It also supports automated alerts to inform stakeholders regarding the
status of claims.

Nevertheless, despite its advantages, Guidewire solutions come with a
number of shortcomings when used internally in a corporate context. The
application is expensive, with paid licensing and considerable
investment in installation and training. It is also technically
demanding and difficult to implement and maintain, especially for
companies with poor IT backup. Most importantly, it is designed
essentially for insurance companies rather than corporate or internal HR
department use. For non-technical staff, it will be difficult to learn,
and therefore not ideal for firms seeking a straightforward and
effective way to manage internal insurance claims. In summary, while
potent for insurers, Guidewire is too costly and complex for corporates
who simply need to automate internal claim handling.

**FINEOS ClaimVantage**

FINEOS, the ClaimVantage acquirer, offers cloud-based software
tailor-made for insurance payers and third-party administrators (TPAs).
The software is particularly effective when working with life,
disability, and absence claims, and supports the automation of workflow
and tracking of cases, making it a suitable tool for large insurance
operations. Its cloud-native architecture also provides global
accessibility from any geographical location, providing the flexibility
to support remote work arrangements.

While FINEOS ClaimVantage does have its strengths, it is not ideally
suited for direct application by corporate HR departments. The system is
best designed for external insurance carriers, and there are no
integrated customization features for internal corporate processes.
Those HR-specific features addressing internal employee database
integration or multi-insurer group policy management might be missing or
might require some degree of extensive customization. Thus, even though
FINEOS is a good software for the insurance business, it is too
insurance-oriented and not flexible enough to suit generic corporate
claims procedures.

### **Sri Lankan Insurance Applications**

Most insurance apps in Sri Lanka belong to a single insurer. While they
enable submission of claims and access to policies, they are
non-interoperable and do not accept claims from multiple providers. They
force corporates to manually process claims on different platforms,
leading to inefficiency.

+------------------+---------+-------+------+-------+---------------+
| *                | **HDFC  | *     | **   | *     | **Lumiere     |
| *Functionality** | Life    | *SLIC | SLIC | *Soft | (Proposed)**  |
|                  | App**   | App** | B-C  | logic |               |
|                  |         |       | onne | Lif   |               |
|                  |         |       | ct** | eUP** |               |
+==================+=========+=======+======+=======+===============+
| **Policy         | ![Close | !     | ![C  | !     | ![Checkmark   |
| management**     | with    | [Chec | heck | [Chec | with solid    |
|                  | solid   | kmark | mark | kmark | fill](media/i |
|                  | fil     | with  | with | with  | mage6.svg){wi |
|                  | l](medi | solid | s    | solid | dth="0.333333 |
|                  | a/image | fi    | olid | fi    | 3333333333in" |
|                  | 4.svg){ | ll](m | ](me | ll](m | heig          |
|                  | width=" | edia/ | dia/ | edia/ | ht="0.3333333 |
|                  | 0.29166 | image | imag | image | 333333333in"} |
|                  | 6666666 | 6.svg | e6.s | 6.svg |               |
|                  | 6667in" | ){wid | vg){ | ){wid |               |
|                  | he      | th="0 | widt | th="0 |               |
|                  | ight="0 | .3333 | h="0 | .3333 |               |
|                  | .291666 | 33333 | .333 | 33333 |               |
|                  | 6666666 | 33333 | 3333 | 33333 |               |
|                  | 667in"} | 33in" | 3333 | 33in" |               |
|                  |         | heigh | 3333 | heigh |               |
|                  |         | t="0. | 3333 | t="0. |               |
|                  |         | 33333 | 3in" | 33333 |               |
|                  |         | 33333 | he   | 33333 |               |
|                  |         | 33333 | ight | 33333 |               |
|                  |         | 3in"} | ="0. | 3in"} |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **Claim          | ![Ch    | !     | ![C  | !     | ![Checkmark   |
| Handling**       | eckmark | [Chec | lose | [Chec | with solid    |
|                  | with    | kmark | with | kmark | fill](media/i |
|                  | solid   | with  | s    | with  | mage6.svg){wi |
|                  | fil     | solid | olid | solid | dth="0.333333 |
|                  | l](medi | fi    | fill | fi    | 3333333333in" |
|                  | a/image | ll](m | ](me | ll](m | heig          |
|                  | 6.svg){ | edia/ | dia/ | edia/ | ht="0.3333333 |
|                  | width=" | image | imag | image | 333333333in"} |
|                  | 0.33333 | 6.svg | e4.s | 6.svg |               |
|                  | 3333333 | ){wid | vg){ | ){wid | (Initiation , |
|                  | 3333in" | th="0 | widt | th="0 | Tracking)     |
|                  | he      | .3333 | h="0 | .3333 |               |
|                  | ight="0 | 33333 | .291 | 33333 |               |
|                  | .333333 | 33333 | 6666 | 33333 |               |
|                  | 3333333 | 33in" | 6666 | 33in" |               |
|                  | 333in"} | heigh | 6666 | heigh |               |
|                  |         | t="0. | 7in" | t="0. |               |
|                  |         | 33333 | he   | 33333 |               |
|                  |         | 33333 | ight | 33333 |               |
|                  |         | 33333 | ="0. | 33333 |               |
|                  |         | 3in"} | 2916 | 3in"} |               |
|                  |         |       | 6666 |       |               |
|                  |         | View  | 6666 |       |               |
|                  |         | only  | 6667 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **Notification   | ![Ch    | !     | ![C  | !     | ![Checkmark   |
| System**         | eckmark | [Chec | heck | [Chec | with solid    |
|                  | with    | kmark | mark | kmark | fill](media/i |
|                  | solid   | with  | with | with  | mage6.svg){wi |
|                  | fil     | solid | s    | solid | dth="0.333333 |
|                  | l](medi | fi    | olid | fi    | 3333333333in" |
|                  | a/image | ll](m | fill | ll](m | heig          |
|                  | 6.svg){ | edia/ | ](me | edia/ | ht="0.3333333 |
|                  | width=" | image | dia/ | image | 333333333in"} |
|                  | 0.33333 | 6.svg | imag | 6.svg |               |
|                  | 3333333 | ){wid | e6.s | ){wid |               |
|                  | 3333in" | th="0 | vg){ | th="0 |               |
|                  | he      | .3333 | widt | .3333 |               |
|                  | ight="0 | 33333 | h="0 | 33333 |               |
|                  | .333333 | 33333 | .333 | 33333 |               |
|                  | 3333333 | 33in" | 3333 | 33in" |               |
|                  | 333in"} | heigh | 3333 | heigh |               |
|                  |         | t="0. | 3333 | t="0. |               |
|                  |         | 33333 | 3in" | 33333 |               |
|                  |         | 33333 | he   | 33333 |               |
|                  |         | 33333 | ight | 33333 |               |
|                  |         | 3in"} | ="0. | 3in"} |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | 3333 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **Chatbot        | ![Close | ![    | ![C  | ![    | ![Checkmark   |
| Support**        | with    | Close | lose | Close | with solid    |
|                  | solid   | with  | with | with  | fill](media/i |
|                  | fil     | solid | s    | solid | mage6.svg){wi |
|                  | l](medi | fi    | olid | fi    | dth="0.333333 |
|                  | a/image | ll](m | fill | ll](m | 3333333333in" |
|                  | 4.svg){ | edia/ | ](me | edia/ | heig          |
|                  | width=" | image | dia/ | image | ht="0.3333333 |
|                  | 0.29166 | 4.svg | imag | 4.svg | 333333333in"} |
|                  | 6666666 | ){wid | e4.s | ){wid |               |
|                  | 6667in" | th="0 | vg){ | th="0 |               |
|                  | he      | .2916 | widt | .2916 |               |
|                  | ight="0 | 66666 | h="0 | 66666 |               |
|                  | .291666 | 66666 | .291 | 66666 |               |
|                  | 6666666 | 67in" | 6666 | 67in" |               |
|                  | 667in"} | heigh | 6666 | heigh |               |
|                  |         | t="0. | 6666 | t="0. |               |
|                  |         | 29166 | 7in" | 29166 |               |
|                  |         | 66666 | he   | 66666 |               |
|                  |         | 66666 | ight | 66666 |               |
|                  |         | 7in"} | ="0. | 7in"} |               |
|                  |         |       | 2916 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6667 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **Messaging      | ![Close | ![    | ![C  | !     | ![Checkmark   |
| Window (Chat)**  | with    | Close | lose | [Chec | with solid    |
|                  | solid   | with  | with | kmark | fill](media/i |
|                  | fil     | solid | s    | with  | mage6.svg){wi |
|                  | l](medi | fi    | olid | solid | dth="0.333333 |
|                  | a/image | ll](m | fill | fi    | 3333333333in" |
|                  | 4.svg){ | edia/ | ](me | ll](m | heig          |
|                  | width=" | image | dia/ | edia/ | ht="0.3333333 |
|                  | 0.29166 | 4.svg | imag | 6.svg | 333333333in"} |
|                  | 6666666 | ){wid | e4.s | ){wid |               |
|                  | 6667in" | th="0 | vg){ | th="0 |               |
|                  | he      | .2916 | widt | .3333 |               |
|                  | ight="0 | 66666 | h="0 | 33333 |               |
|                  | .291666 | 66666 | .291 | 33333 |               |
|                  | 6666666 | 67in" | 6666 | 33in" |               |
|                  | 667in"} | heigh | 6666 | heigh |               |
|                  |         | t="0. | 6666 | t="0. |               |
|                  |         | 29166 | 7in" | 33333 |               |
|                  |         | 66666 | he   | 3in"} |               |
|                  |         | 66666 | ight |       |               |
|                  |         | 7in"} | ="0. |       |               |
|                  |         |       | 2916 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6667 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **HR-Focused     | ![Close | ![    | ![C  | ![    | ![Checkmark   |
| Workflow**       | with    | Close | lose | Close | with solid    |
|                  | solid   | with  | with | with  | fill](media/i |
|                  | fil     | solid | s    | solid | mage6.svg){wi |
|                  | l](medi | fi    | olid | fi    | dth="0.333333 |
|                  | a/image | ll](m | fill | ll](m | 3333333333in" |
|                  | 4.svg){ | edia/ | ](me | edia/ | heig          |
|                  | width=" | image | dia/ | image | ht="0.3333333 |
|                  | 0.29166 | 4.svg | imag | 4.svg | 333333333in"} |
|                  | 6666666 | ){wid | e4.s | ){wid |               |
|                  | 6667in" | th="0 | vg){ | th="0 |               |
|                  | he      | .2916 | widt | .2916 |               |
|                  | ight="0 | 66666 | h="0 | 66666 |               |
|                  | .291666 | 66666 | .291 | 66666 |               |
|                  | 6666666 | 67in" | 6666 | 67in" |               |
|                  | 667in"} | heigh | 6666 | heigh |               |
|                  |         | t="0. | 6666 | t="0. |               |
|                  |         | 29166 | 7in" | 29166 |               |
|                  |         | 66666 | he   | 66666 |               |
|                  |         | 66666 | ight | 66666 |               |
|                  |         | 7in"} | ="0. | 7in"} |               |
|                  |         |       | 2916 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6667 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+
| **Multi-provider | ![Close | ![    | ![C  | ![    | ![Checkmark   |
| Claim Support**  | with    | Close | lose | Close | with solid    |
|                  | solid   | with  | with | with  | fill](media/i |
|                  | fil     | solid | s    | solid | mage6.svg){wi |
|                  | l](medi | fi    | olid | fi    | dth="0.333333 |
|                  | a/image | ll](m | fill | ll](m | 3333333333in" |
|                  | 4.svg){ | edia/ | ](me | edia/ | heig          |
|                  | width=" | image | dia/ | image | ht="0.3333333 |
|                  | 0.29166 | 4.svg | imag | 4.svg | 333333333in"} |
|                  | 6666666 | ){wid | e4.s | ){wid |               |
|                  | 6667in" | th="0 | vg){ | th="0 |               |
|                  | he      | .2916 | widt | .2916 |               |
|                  | ight="0 | 66666 | h="0 | 66666 |               |
|                  | .291666 | 66666 | .291 | 66666 |               |
|                  | 6666666 | 67in" | 6666 | 67in" |               |
|                  | 667in"} | heigh | 6666 | heigh |               |
|                  |         | t="0. | 6666 | t="0. |               |
|                  |         | 29166 | 7in" | 29166 |               |
|                  |         | 66666 | he   | 66666 |               |
|                  |         | 66666 | ight | 66666 |               |
|                  |         | 7in"} | ="0. | 7in"} |               |
|                  |         |       | 2916 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6666 |       |               |
|                  |         |       | 6667 |       |               |
|                  |         |       | in"} |       |               |
+------------------+---------+-------+------+-------+---------------+

## **Summary** {#summary .unnumbered}

Although many insurance companies now offer online platforms for
individual claim management, these systems are often too technical or
fragmented for employees to handle independently. As a result, most
employees forward their claims to the HR department manually. This
creates a significant burden for HR officers, especially in large
organizations with over 10,000 employees and multiple insurance
providers covering different types of insurance policies. This
highlights the urgent need for a unified and streamlined insurance claim
management system tailored to HR operations - one that Lumiere aims to
fulfill.

## 4. Aim and Objectives (verbatim from Proposal)

# **Aim and objectives** {#aim-and-objectives .unnumbered}

## **Aim (Goal)** {#aim-goal .unnumbered}

To develop a unified digital platform that effectively manages employee
insurance claims streamlining submission, verification, approval,
documentation, and communication ensuring fast, transparent, and error
reduced claim processing for all corporate stakeholders.

## **Objectives** {#objectives .unnumbered}

Step-by-step objectives that will help us achieve this aim:

	-----------------------------------------------------------------------
	**Step**             **What we will do**
	-------------------- --------------------------------------------------
	Understand user      Interview the HR and survey both the employees and
	needs                the insurance agents.

	Design the system    Design comprehensive process workflows and mockups
											 of systems.

	Develop core modules Implement user authentication, claim submission,
											 document upload, claim tracking, and messaging.

	Test and refine      Conduct end-user acceptance test; gather client
											 feedback from all concerned persons.

	Deployment and       Launch the platform and guide our client on how to
	training             use the system effectively.
	-----------------------------------------------------------------------

By following the above steps, our system will minimize claim processing
time, enhance transparency, and establish a centralized and efficient
workflow among all employees and stakeholders involved in the insurance
claim process.

## 5. Methodology (verbatim from Proposal)

# **Methodology** {#methodology .unnumbered}

## **Requirements Engineering Methods** {#requirements-engineering-methods .unnumbered}

Methods Used:

Stakeholder Interviews & Meetings - To gather core system requirements
directly from client representatives (HR officers, insurance agents, IT
coordinators, business analysts).

Observation of Insurance Provider Systems - We studied how existing
insurance claim portals function, specially the data flow and process
flow in them.

Alternatives Considered:

Formal Requirements Specification Documents - These involve writing
exhaustive software requirement specification (SRS) documents using IEEE
standards.

Questionnaires and Surveys - These can help reach a larger group of
users but often lack depth and context, especially when dealing with
non-technical users.

Justification for Chosen Methods:

The combination of interviews, meetings, and observing similar systems
ensures a comprehensive, real-world understanding of both user needs and
existing industry standards. It encourages direct communication, allows
for follow-up clarifications, and is more agile-friendly compared to
rigid formal documentation.


## **Design Methods** {#design-methods .unnumbered}

**Methods Used:**

Figma - For prototypes and UI/UX design.

Canva - For presentation visuals.

Draw.io - For use case diagrams, ER diagrams, system flowcharts.

**Alternatives Considered:**

Motiff - Modern design tool for prototyping.

MS PowerPoint - A very sophisticated presentation tool.

**Justification for Chosen Methods:**

Figma was chosen mainly for familiarity, its ease of use and excellent
third party integration. Canva was chosen over MS PowerPoint also for
its simplicity and ease of use while being able to deliver highly
visually appealing presentation slides.

**Development Tools & Technologies**

**Methods Used:**

MERN Stack - For the development of Lumiere, we have selected the MERN
stack, a modern JavaScript-based web development stack consisting of
MongoDB, Express.js, React, and Node.js, enabling full-stack development
using a single language.

	--------------------------------------------------------------------------------------------------------
	![](media/image9.png){width="0.8402777777777778in"    React - A fast, component-based JavaScript library
	height="0.75in"}                                      for building responsive and modular user
																												interfaces.
	----------------------------------------------------- --------------------------------------------------
	![](media/image10.png){width="1.2201388888888889in"   Node.js - A server-side runtime environment that
	height="0.75in"}                                      enables the execution of JavaScript outside the
																												browser for scalable backend development.

	![](media/image11.png){width="0.75in"                 Express.js - A fast and minimalist web framework
	height="0.75in"}                                      for Node.js, used to build efficient APIs and web
																												applications.

	![](media/image12.png){width="0.7298611111111111in"   MongoDB with Atlas - A flexible NoSQL cloud
	height="0.75in"}                                      database service that stores data as JSON-like
																												documents, offering scalability and real-time
																												access.

	![](media/image13.png){width="0.75in"                 Visual Studio Code - A modern, lightweight code
	height="0.75in"}                                      editor with robust features for debugging, version
																												control, and extension support.

	![](media/image14.png){width="0.75in"                 Postman - A platform for backend route
	height="0.75in"}                                      development, testing, and documentation with an
																												intuitive interface.

	![](media/image15.png){width="0.7701388888888889in"   Git & GitHub - Git is a distributed version
	height="0.75in"}                                      control system, and GitHub is a cloud-based
																												platform for managing and collaborating on code
																												repositories.

	![](media/image16.png){width="0.8in" height="0.75in"} MS Azure - A comprehensive cloud computing
																												platform by Microsoft for deploying, managing, and
																												scaling applications and services.

	![](media/image17.png){width="0.9298611111111111in"   ClickUp - A productivity platform that helps teams
	height="0.75in"}                                      manage tasks, projects, documents, and workflows
																												in a customizable and collaborative environment.
	--------------------------------------------------------------------------------------------------------

**Alternatives Considered:**

Spring Boot Stack - A Java-based backend framework that simplifies
enterprise application development.

LAMP Stack - A classic web development stack using PHP as the
server-side language.

**Justification for Chosen Methods:**

We chose the MERN stack (MongoDB, Express.js, React, Node.js) for its
ability to support full-stack development using a single language -
JavaScript - across both frontend and backend. This simplifies
development, improves team productivity, and allows for faster
prototyping. React enables a dynamic and responsive user interface,
while MongoDB offers flexible schema design ideal for handling varied
insurance claim data. Compared to Spring Boot and PHP stacks, MERN is
lighter, easier to learn, and more aligned with modern web development
practices, making it the most suitable choice for our project.

**Testing Methods**

**Methods Used:**

Unit Testing: To test individual components such as APIs and database
models to ensure they function correctly in isolation.

Integration Testing: To test the interaction between modules such as
user authentication, document upload, and claim processing.

System Testing: To validate the complete workflow of the application and
ensure all integrated modules work seamlessly.

User Acceptance Testing: To confirm the system meets real user
expectations by allowing actual HR staff, employees, and insurance
agents to test features and provide feedback.

**Alternatives Considered:**

Automated Testing Tools: Testing tools like Selenium and Cypress were
considered but not implemented due to time and resource constraints.

**Justification for Chosen Methods:**

The selected manual testing methods provide comprehensive coverage for a
mid-scale system like ours. Unit and integration testing ensure that
each component and its interactions are reliable. System testing
verifies the entire flow, while UAT ensures the system is practical and
user-friendly. Although automated tools were considered, the manual
approach was more feasible within the project timeline.

**Project Management & Collaboration**

**Methods Used:**

GitHub: Used for version control, team collaboration on code, issue
tracking, and managing branches for each feature.

Agile Methodology: The project follows a 12-week Agile sprint plan,
allowing iterative development and continuous feedback.

ClickUp: Used for sprint planning, task assignment, progress tracking,
and overall team coordination.

	---------------------------------------------------------------------------
	Sprint    Goal            Tasks                      Deliverables
	--------- --------------- -------------------------- ----------------------
	Sprint 1  System          • Design the database      • Initial schema
	(Weeks    foundation -    schema for all major       design document\
	1-2)      design and      collections\               • Git repository with
						setup           • Set up MongoDB hosting   separate branches\
														(MongoDB Atlas)\           • UI/UX prototype for
														• Initialize Git           core UI components
														repository and create      (Figma)\
														feature branches\          • Running backend with
														• Design base UI/UX\       basic structure\
														• Set up Node.js backend   • Authenticated user
														project structure with     flow working via API
														basic User Management API  (bcrypt for password
																											 hashing)

	Sprint 2  Core backend    • Implement Claims API and • Functional backend
	(Weeks    development -   Policies API (CRUD +       APIs for Claims and
	3-4)      Claims and      validations)\              Policies\
						Policies APIs   • Extend User Management   • Component-based
														API to support roles and   layout and routing
														authorization\             setup in React\
														• Build React components   • Postman collection
														for login and static pages for existing routes

	Sprint 3  Support         • Implement Document       • Document and
	(Weeks    systems -       Upload API (file storage   Messaging APIs ready
	5-6)      Documents and   with metadata)\            and tested\
						Messaging +     • Implement Messaging API\ • Integrated backend
						Feedback        • Integrate document logic and frontend logic\
														into Claims flow\          • React components for
														• Develop core functional  submitting claims and
														React components\          messaging\
														• Collect client feedback  • Mid-sprint client
														on the current             feedback report
														implementation             

	Sprint 4  AI and          • Build LLM-powered        • Working chatbot
	(Weeks    Notifications   Chatbot API (using gemini  module with sample
	7-8)      modules         API)\                      queries\
														• Implement Notifications  • Notification
														API (email or in-app       triggers on claim
														alerts or both)\           updates/messages\
														• Develop React components • Chat and
														for chatbot interaction    notification
														and alerts                 components integrated
																											 in UI

	Sprint 5  System          • Integrate all frontend   • Fully functional and
	(Weeks    integration and and backend modules        integrated system\
	9-10)     refinement      end-to-end\                • Role-based access
														• Secure backend routes    control working
														with proper role checks\   correctly\
														• Add validation and clear • Consistent and
														error feedback on all      user-friendly UI
														forms\                     
														• Improve UI styling and   
														flow consistency           

	Sprint 6  Final feedback, • Collect final feedback   • Finalized and tested
	(Weeks    testing, and    from client and refine     app\
	11-12)    deployment      system\                    • Client-approved
														• Conduct full system      final build\
														testing (Unit,             • Live deployed
														Integration, System)\      version with access
														• Fix bugs, polish UX, and credentials
														finalize features\         
														• Deploy the app to a      
														cloud host (Azure)         
	---------------------------------------------------------------------------

**Deployment & Integration**

**Methods Used:**

We are using Microsoft Azure for deploying and hosting the backend and
frontend components, and MongoDB Atlas for cloud-hosted database
services to ensure secure, scalable, and accessible data storage.

**Alternatives Considered:**

Alternatives considered include Netlify and Vercel for frontend hosting
with MongoDB Atlas. We also considered Google Cloud Platform and Amazon
Web Services for full stack deployment.

**Justification for Chosen Methods:**

As a privilege of being a SLIIT student, some MS tools are offered to us
free of charge. Therefore, we chose Microsoft Azure as our server-side
code hosting platform. We decided to use MongoDB Atlas as our database
hosting platform because of its ease of use and it is free without
requiring credit card information.

#  **Evaluation Method** {#evaluation-method .unnumbered}

![](media/image18.png){width="7.5in" height="4.843055555555556in"}

[]{#_Toc205413327 .anchor}A comprehensive evaluation process is
essential to validate the effectiveness of our insurance claim
management system and ensure it fulfills the expectations of Janashakthi
Group and its users. This evaluation will adopt a multi-layered
approach, focusing on the following key aspects:

-   **Functionality**: Verification that all major system features work
	as intended - including user registration, group policy handling,
	claim submission, document upload, messaging, and claim review
	workflows for HR officers and insurance agents.

-   **Performance**: Assessment of the system's responsiveness,
	scalability, and stability, especially under simultaneous usage by
	employees, HR personnel, and agents.

-   **Usability**: Evaluation of the user interface to ensure it is
	intuitive, accessible, and efficient for all roles, from
	non-technical employees to administrative staff.

-   **Security**: In-depth testing of authentication mechanisms,
	role-based access control, secure file uploads, and protection
	against vulnerabilities like unauthorized access or data leaks.

The evaluation will include systematic testing methodologies, such as:

-   **Unit Testing**: Ensuring that backend modules like user
	management, claims processing, and messaging operate correctly in
	isolation.

-   **Integration Testing**: Verifying seamless interaction between the
	document storage, claims API, and external systems (e.g., insurance
	provider databases).

-   **User Acceptance Testing (UAT)**: Involving real users - employees,
	HR officers, and insurance agents - to test the system in realistic
	workflows and provide critical feedback for refinement.

Through this structured evaluation, the team aims to identify any gaps
or inconsistencies early, allowing iterative improvements that result in
a reliable, secure, and user-friendly platform for insurance claim
management.

## 6. Solution Overview (freshly authored)

This section provides a comprehensive, chapterized overview of Lumiere’s architecture, data model, workflows, security, integrations, and deployment considerations, aligning with the final report criteria.

### 6.1 System Architecture

- Frontend: React (Vite), React Router, MUI, Tailwind, Socket.IO client.
- Backend: Node.js, Express 5, MongoDB via Mongoose 8, Socket.IO server.
- Storage: Azure Blob Storage for documents.
- AI/Voice: OpenAI + Google Gemini for chatbot and text formalization; VAPI server SDK for assistant + function-calling proxy.
- Reporting: Puppeteer + Handlebars for PDF generation.
- Dev/Prod: Vite dev proxy to `/api`; environment-driven configuration.

<!-- INSERT HIGH-LEVEL ARCHITECTURE DIAGRAM HERE -->

### 6.2 Module Decomposition

- Users: registration, login, profile, role-based operations.
- Policies: CRUD, renewal, eligibility, beneficiaries, analytics.
- Claims: questionnaire-driven submission, HR forwarding, insurer decision.
- Documents/Files: metadata + Azure Blob upload/download, verification, archive.
- Messaging: conversations, contacts, search, delivery/read tracking.
- Notifications: in-app + email; Socket.IO events.
- Reports: users, policies, claims, financial reports (PDF).
- Chatbot & VAPI: AI messaging, voice assistant, function-calling to internal APIs/DB with RBAC.

<!-- INSERT MODULE/COMPONENT DIAGRAM HERE -->

### 6.3 Data Model Summary

- Core entities: User, Policy, Claim, Document, Message, Notification, QuestionnaireTemplate.
- Key relationships: Policy → Claim (coverage validation, claimed amounts), Claim → QuestionnaireTemplate (sections/questions), User ↔ Messages/Notifications, Policy ↔ Beneficiaries/ClaimedAmounts.

<!-- INSERT ER DIAGRAM HERE -->

### 6.4 Key Workflows

- Claims lifecycle: draft → employee submission → HR review/forward → insurer decision (approve/reject/return) with coverage validation and policy claimed amounts updates.
- Policy coverage tracking: per-beneficiary claimed amounts by coverage type; consistency checks and summaries.
- Document pipeline: upload (multer memory), store (Azure Blob), download, verify, archive.
- Reporting: template selection → HTML render → PDF export.

<!-- INSERT SEQUENCE DIAGRAMS / FLOWCHARTS FOR CLAIMS + DOCUMENTS HERE -->

### 6.5 Security and RBAC

- JWT auth; centralized middleware; authorize by roles per route.
- VAPI proxy enforces role-based query modification for DB ops.
- Error handling with consistent JSON responses and async wrappers.

### 6.6 Integrations

- Azure Blob Storage: `@azure/storage-blob` via service wrapper.
- Email (Nodemailer): SMTP/Gmail/Ethereal development fallback.
- AI Services: OpenAI, Gemini with graceful fallbacks.
- VAPI: Function-calling proxy to internal APIs, assistant lifecycle, call management.

### 6.7 Deployment and Environment

- Backend env: PORT, MONGO_URI, JWT_SECRET, CLIENT_URL, Azure, Email, OpenAI, Gemini, VAPI keys.
- Frontend env: VITE_API_BASE_URL (optional due to proxy), VITE_GEMINI_API_KEY.
- CORS whitelist configured for dev URL(s) and CLIENT_URL.

### 6.8 Non-Functional Requirements

- Availability: centralized error handling; robust route guards; defensive fallbacks in AI services.
- Scalability: stateless API, Socket.IO for realtime; Azure Blob for large file storage.
- Maintainability: modular MVC; services for integrations; machine-readable `docs/system-index.json`.

## 7. Implementation Details

- Routing map and controllers are indexed in `docs/system-index.json`.
- Models encapsulate domain logic (e.g., Policy claimed amounts helpers; Claim workflow methods).
- Socket.IO handles presence and conversations with JWT handshake.

<!-- INSERT SELECTED UI SCREENSHOTS FOR MAJOR FLOWS (LOGIN, POLICIES, CLAIMS, MESSAGES) HERE -->

## 8. Testing and Evaluation

- Functional coverage from user stories and test cases (see appendix).
- Smoke tests conducted during development; reports PDF generation verified.
- Suggested future: automated unit/integration tests for controllers and model methods; load testing for file upload and messaging.

<!-- INSERT TESTING EVIDENCE / SAMPLE REPORT THUMBNAILS HERE -->

## 9. Results and Discussion

- Backend feature-complete prototype with integrated AI/chatbot and voice assistant proxy.
- UI/UX implemented to support end-to-end claim flows.
- Reporting outputs generated from templates.
- Observations: policy coverage validation centralization reduced errors; RBAC enforced across HTTP and sockets.

## 10. Limitations

- No comprehensive automated test suite yet.
- Assumes available third-party services (Azure, SMTP, AI) and correct env configuration.
- Complex coverage scenarios could require additional business rules.

## 11. Future Work

- Expand test coverage and CI pipeline.
- Mobile push notifications; richer analytics dashboards.
- Multi-tenant support; advanced claims fraud detection; offline document capture.

## 12. Conclusion

Lumiere standardizes and accelerates insurance claim management across roles with a modern web stack, robust RBAC, and integrated AI assistance. The architecture is modular and ready to evolve with enterprise needs.

## References

- Project repository: https://github.com/NathIMN/Lumiere/
- Prior documents: Proposal_ITP25_B4_96.pdf; Progress_ITP25_B4_96.txt


## Exporting this report (optional)

If you need .docx or .odt versions, you can convert this Markdown file using a document converter on your machine.

- Ensure a converter like Pandoc is installed.
- Open a terminal at the project root.
- Convert to Word (.docx) or OpenDocument (.odt) using your preferred converter.

Example commands:

```bash
# Convert to .docx
pandoc docs/Final_Report.md -o docs/Final_Report.docx

# Convert to .odt
pandoc docs/Final_Report.md -o docs/Final_Report.odt

# (Optional) Convert to .pdf (requires LaTeX or a PDF backend)
pandoc docs/Final_Report.md -o docs/Final_Report.pdf
```

Tip: After conversion, update the cover page, table of contents, and figure captions in the word processor.

## Appendices

### Appendix A — User Stories and Test Cases (from Progress)

[RAW COPY FROM PROGRESS – DO NOT EDIT]

- Includes list of user stories and the test cases table.

Test Cases

Test Case ID
System
Test Case Description
Expected Result
TC01
User Management
New user registers with valid employee ID
Registration succeeds, email verification sent
TC02
User Management
User tries to login with correct credentials
Login successful, JWT token generated
TC03
User Management
User tries to login with wrong password
Login fails with error message
TC04
Policy Management
Admin creates a new insurance policy with valid data
Policy is saved and visible in policy dashboard
TC05
Policy Management
HR assigns a policy to an employee
Assignment is successful, employee notified
TC06
Claims Management
Employee submits a claim with all required documents
Claim submission succeeds, confirmation displayed
TC07
Claims Management
Employee tracks status of a submitted claim
Status displayed correctly with timeline updates
TC08
Claims Management
HR reviews and approves a claim
Claim status updated to approved, notifications sent
TC09
Claims Management
HR forwards claim to insurance agent
Claim appears in agent dashboard, forwarding notification sent
TC10
Claims Management
Insurance agent processes the claim
Decision recorded, reimbursement calculated correctly
TC11
Document Management
User uploads a supporting document
Document uploaded successfully, visible in document viewer
TC12
Messaging System
User sends a direct message regarding a claim
Message delivered and stored, recipient notified
TC13
Messaging System
HR creates a group discussion for claim review
Group created, members added, notifications sent
TC14
Notifications System
System sends email notification for new claim update
User receives email with correct content
TC15
AI Chat-bot
Employee asks chatbot for claim guidance
Chatbot provides correct step-by-step instructions

### Appendix B — Activities

- Activity_01_ITP25_B4_96.pdf
- Activity_02_ITP25_B4_96.pdf
- Activity_3_ITP25_B6_143.pdf
- Activity_04_ITP25_B4_96.pdf

<!-- INSERT ACTIVITY SNAPSHOTS OR SUMMARIES HERE -->

### Appendix C — System Index Reference

- See `docs/system-index.json` for endpoint, models, and services catalog used during implementation.
