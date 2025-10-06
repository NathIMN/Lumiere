![](media/image1.png){width="1.7368055555555555in"
height="2.266233595800525in"}

Topic : Unified System for Insurance Claim Management

Group no : ITP25_B4_96

Campus : Malabe

  --------------------------------------------------------------------------------
  **Reg No**     **Name**           **Email**                  **Contact No**
  -------------- ------------------ -------------------------- -------------------
  IT23834774     NATH I M N         <it23834774@my.sliit.lk>   +94 77 429 0347

  IT23836440     FERNANDO PULLE N S <it23836440@my.sliit.lk>   +94 70 311 4390

  IT23830332     PATHIRANA P U O R  <it23830332@my.sliit.lk>   +94 71 679 2331

  IT23725010     PERERA B I V       <it23725010@my.sliit.lk>   +94 70 134 6360

  IT23828766     SENARATHNA P G R M <it23828766@my.sliit.lk>   +94 71 777 6610
  --------------------------------------------------------------------------------

# Contents {#contents .TOC-Heading .unnumbered}

[**Background** [3](#background)](#background)

[**Problem and motivation**
[4](#problem-and-motivation)](#problem-and-motivation)

[**Problem statement** [4](#problem-statement)](#problem-statement)

[**Current problem and Current process**
[4](#current-problem-and-current-process)](#current-problem-and-current-process)

[**Motivation** [6](#motivation)](#motivation)

[**Aim and objectives** [7](#aim-and-objectives)](#aim-and-objectives)

[**Aim (Goal)** [7](#aim-goal)](#aim-goal)

[**Objectives** [7](#objectives)](#objectives)

[**System overview** [8](#system-overview)](#system-overview)

[**Functional Requirements for main stakeholders**
[8](#functional-requirements-for-main-stakeholders)](#functional-requirements-for-main-stakeholders)

[**Non-functional requirements**
[9](#non-functional-requirements)](#non-functional-requirements)

[**Technical requirements**
[10](#technical-requirements)](#technical-requirements)

[**System Diagram** [11](#system-diagram)](#system-diagram)

[**Main functions** [12](#main-functions)](#main-functions)

[**Additional functions**
[13](#additional-functions)](#additional-functions)

[**Literature review** [14](#literature-review)](#literature-review)

[**Existing Insurance Claim Management Platforms**
[14](#existing-insurance-claim-management-platforms)](#existing-insurance-claim-management-platforms)

[**i)** **Available insurance claim management solutions worldwide**
[15](#available-insurance-claim-management-solutions-worldwide)](#available-insurance-claim-management-solutions-worldwide)

[**ii)** **Sri Lankan Insurance Applications**
[16](#sri-lankan-insurance-applications)](#sri-lankan-insurance-applications)

[**Summary** [17](#summary)](#summary)

[**Methodology** [18](#methodology)](#methodology)

[**Requirements Engineering Methods**
[18](#requirements-engineering-methods)](#requirements-engineering-methods)

[**Design Methods** [19](#design-methods)](#design-methods)

[**Evaluation Method** [26](#evaluation-method)](#evaluation-method)

[**References** [26](#_Toc205413327)](#_Toc205413327)

[**Appendix** [29](#appendixes)](#appendixes)

# **Background** {#background .unnumbered}

We are developing our application, Lumiere: A Unified System for
Insurance Claim Management, as per request of our client, a senior
business analyst for the Janashakthi Group of Companies^\[1\]^, a
prominent Sri Lankan conglomerate with business interests spanning
insurance, finance, real estate, and investment. Some of the companies
within the group are, Janashakthi Insurance PLC^\[2\]^, Janashakthi
Finance PLC^\[3\]^, First Capital Limited^\[4\]^ and Janashakthi
Corporate Services Limited^\[5\]^.

Within the organization, employees are often covered under group
insurance policies for life and medical coverage, and in some cases,
individual vehicle insurance. These policies are maintained through
partnerships with multiple third party insurance providers. Currently,
companies within the Janashakthi Group handle most of their insurance
claim processing manually, relying on physical document submissions to
the HR departments.

Since this is a very time consuming and confusing task, they are seeking
a web based solution to standardize the operations occurring within the
company more systematically.

We are developing this system based on our client's requirements, with a
focus on streamlining the insurance claim process, enabling both
employees and HR staff to efficiently manage claims, communicate, and
carry out related tasks with improved accuracy and convenience.

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
officer verifies the employee\'s eligibility for the claim based on the
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

# **System overview** {#system-overview .unnumbered}

## **Functional Requirements for main stakeholders** {#functional-requirements-for-main-stakeholders .unnumbered}

  -----------------------------------------------------------------------
  **Stakeholder**       **Functional Requirement**
  --------------------- -------------------------------------------------
  Employees             Register and securely log in to the system

                        Upload identity verification documents
                        (NIC/Passport)

                        View own insurance policies and remaining claim
                        limits

                        Submit insurance claims with supporting documents

                        Track the status of submitted claims

                        Communicate with HR via built-in messaging

                        Receive notifications (e.g., claim status
                        updates, document requests)

  HR Department         Secure login for HR users

                        Review and validate submitted claims

                        Forward valid claims to assigned insurance agents

                        View employee insurance history and ID
                        verification status

                        Respond to employee messages

                        Receive alerts when new claims are submitted or
                        pending

  Insurance Agents      Secure login for agents

                        Access claims forwarded by HR

                        Review claim details and uploaded documents

                        Approve, reject, or request additional documents
                        for a claim

                        Enter final claim decision and reimbursement
                        amount

                        Add internal notes visible to HR

  Admin                 Verify and activate HR and agent accounts

                        Manage system settings (policy types, coverage
                        categories, claim limits)

                        Monitor logs and analytics for claims processing

                        Configure chatbot knowledge base and notification
                        templates

  All Users             Enable secure internal messaging between
                        stakeholders

                        Implement chatbot support for FAQs and claim
                        guidance

                        Handle secure document uploads linked to claim
                        IDs

                        Generate and deliver in-app, email, or SMS
                        notifications

                        Track individual and group policy usage (claims
                        vs. total limit)
  -----------------------------------------------------------------------

## **Non-functional requirements** {#non-functional-requirements .unnumbered}

  ---------------------------------------------------------------------------
  **Stakeholder**   **Non-Functional Requirement**
  ----------------- ---------------------------------------------------------
  Employees         Usability: Interface should be intuitive for claim
                    submission, status tracking, and document upload

                    Security: Personal and claim data must be encrypted and
                    protected from unauthorized access

                    Performance: The system should allow smooth upload of
                    documents and load dashboards quickly

                    Accessibility: System should be accessible via both
                    desktop and mobile devices

                    Reliability: Users must be able to access the system
                    without unexpected downtimes

  HR Department     Usability: HR dashboard should enable quick filtering,
                    sorting, and viewing of employee claims

                    Security: Only authorized HR personnel can view/edit
                    employee data

                    Performance: System should handle large numbers of
                    concurrent claim reviews without lag

                    Auditability: All claim interactions must be logged for
                    internal auditing

  Insurance Agents  Usability: Clear interface for reviewing claims, viewing
                    attached documents, and entering decisions

                    Security: Access to only forwarded claims; ability to add
                    notes securely

                    Performance: Capable of processing multiple claims in
                    parallel efficiently

                    Availability: System should be accessible at all times
                    for real-time decision processing

  Admin             Security: Role-based access control for all user types
                    (employees, HR, agents)

                    Performance: Tools should allow for real-time monitoring
                    and management

                    Maintainability: Easy deployment of feature updates and
                    patches

                    Scalability: Ability to support increasing number of
                    users and claim volume

  System-Wide       Localization: Interface should support multiple languages
                    if needed

                    Backup & Recovery: Regular backups of data and fast
                    recovery in case of failure

                    Integration: Should integrate seamlessly with external
                    systems (payment gateways, identity verification, etc.)

                    Chatbot: Fast and context-aware responses; ability to be
                    updated with new queries

                    Notification System: Should deliver alerts instantly with
                    retry mechanisms in case of failure
  ---------------------------------------------------------------------------

## **Technical requirements** {#technical-requirements .unnumbered}

Front end - react.js (Tailwind CSS and bootstrap, material UI for UI)

Backend - node.js (express.js)

Data base - MongoDB

## **System Diagram** {#system-diagram .unnumbered}

![](media/image2.png){width="7.0in" height="7.333333333333333in"}

## **Main functions** {#main-functions .unnumbered}

1.  User Management

The module for user management provides secure and role-based access for
all the system users such as site administrators, employees, HR
officers, and insurance officers. It provides account creation, login,
profile management, and permission management to ensure
that every user uses the system based on his or her duties. The
system imposes authentication and authorization best
practices, ensuring data privacy and operational integrity.

2.  Policy Management

This module supports management of group and individual life
and car insurance policies. It offers policy creation,
renewal, cancellation, and categorization. The users can view, edit,
or print policy details while administrators and officers
can have control over the complete policy life cycle, view active
coverage, and manage policyholder records easily.

3.  Claims Management

The claims management module makes the entire insurance claims
process easier - starting from claim initiation by employees
to verification by HR and sending, and ultimate assessment
and settlement by insurance officers. It has document upload facility,
status tracking, auto-routing, and audit trails, ensuring transparency
and real-time insurance claim processing.

4.  Document Management API and Frontend

This module provides a central API and user interface for policy, claim,
and user document management. All users can easily upload, classify,
search, and retrieve files.
It stores and accesses sensitive documents securely and organizes them, making the administrative functions easier along with
regulatory compliance.

5.  Messaging API

The messaging module supports formalized communication between various
stakeholders such as staff, HR administrators, and insurance officers.
It enables direct messaging, group chat, and
contextual conversation related to claims or
policies, which promotes collaboration and decision - making within the
system.

## **Additional functions** {#additional-functions .unnumbered}

6.  AI Chatbot

An integrated AI chatbot assists individuals by providing answers
to common questions, guiding them through claim and policy processes,
and delivering quick navigation support. It uses natural language
processing to provide 24/7 support, reduce staff dependency
on standard tasks, and provide overall user experience improvement.

7.  Notification System

The notification
system informs users with minute-by-minute notifications of significant activities such
as approval of claims, renewal of policies, document uploads, and user
messages. It accommodates email as well
as in-app notifications to ensure users are informed of all activity and
deadlines of significance within the system.

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
platforms like Guidewire^\[6\]^ and FINEOS ClaimVantage^\[7\]^ possess
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
Insurance^\[8\]^ and Tokio Marine. One of its most high-profile
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
|                  | 4.svg){ | ll](m | fill | ll](m | heig          |
|                  | width=" | edia/ | ](me | edia/ | ht="0.3333333 |
|                  | 0.29166 | image | dia/ | image | 333333333in"} |
|                  | 6666666 | 6.svg | imag | 6.svg |               |
|                  | 6667in" | ){wid | e6.s | ){wid |               |
|                  | he      | th="0 | vg){ | th="0 |               |
|                  | ight="0 | .3333 | widt | .3333 |               |
|                  | .291666 | 33333 | h="0 | 33333 |               |
|                  | 6666666 | 33333 | .333 | 33333 |               |
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
|                  | 0.29166 | 4.svg | imag | image | 333333333in"} |
|                  | 6666666 | ){wid | e4.s | 6.svg |               |
|                  | 6667in" | th="0 | vg){ | ){wid |               |
|                  | he      | .2916 | widt | th="0 |               |
|                  | ight="0 | 66666 | h="0 | .3333 |               |
|                  | .291666 | 66666 | .291 | 33333 |               |
|                  | 6666666 | 67in" | 6666 | 33333 |               |
|                  | 667in"} | heigh | 6666 | 33in" |               |
|                  |         | t="0. | 6666 | heigh |               |
|                  |         | 29166 | 7in" | t="0. |               |
|                  |         | 66666 | he   | 33333 |               |
|                  |         | 66666 | ight | 33333 |               |
|                  |         | 7in"} | ="0. | 33333 |               |
|                  |         |       | 2916 | 3in"} |               |
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

![](media/image7.jpeg){width="3.720384951881015in"
height="2.09375in"}![](media/image8.png){width="3.6145833333333335in"
height="3.006463254593176in"}

Figure - client interview at the client's office Figure - Virtual client
meeting via Zoom to discuss project scope

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

**Alternatives Considered:**

Jira was considered for task management and sprint planning.

A centralized version controlling system or a manually managed cloud
drive was considered for version control and code hosting.

**Justification for Chosen Methods:**

ClickUp was chosen for its simplicity, ease of use, and all-in-one
capability to manage tasks, sprints, and team communication.

GitHub, as a distributed version control system, offers greater
flexibility, offline access, and collaboration capabilities compared to
centralized VCS tools.

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

#  {#section .unnumbered}

[]{#_Toc205413327 .anchor}A comprehensive evaluation process is
essential to validate the effectiveness of our insurance claim
management system and ensure it fulfills the expectations of Janashakthi
Group and its users. This evaluation will adopt a multi-layered
approach, focusing on the following key aspects:

-   **Functionality**: Verification that all major system features work
    as intended - including user registration, group policy handling,
    claim submission, document upload, messaging, and claim review
    workflows for HR officers and insurance agents.

-   **Performance**: Assessment of the system\'s responsiveness,
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

**\
**

# **References** {#references .unnumbered}

\[1\]. "Home," *Janashakthi Group*. <https://www.jxg.lk/>­

\[2\]. "Home - Janashakthi Insurance PLC," *www.janashakthi.com*.
<https://www.janashakthi.com/>

‌\[3\]. "Home," *Janashakthi Finance*, Jul. 28, 2025.
<https://www.janashakthifinance.lk/>

\[4\]. "Home - FirstCap Limited," *FirstCap Limited*, Aug. 2025.
<https://firstcapltd.com/>

\[5\]. *Jcsl.lk*, 2025. <https://jcsl.lk/> (accessed Aug. 06, 2025).

\[6\]. Guidewire, "Guidewire," *Guidewire*, 2019.
<https://www.guidewire.com/>

\[7\]. *Majesco.com*, 2025.
<https://www.majesco.com/core-software-insurance-solutions/claimvantage/>

\[8\]. "Make a Claim \| Allianz Australia," *AU_site*, 2025.
<https://www.allianz.com.au/claims.html>

**\
**

# **Appendixes** {#appendixes .unnumbered}

![](media/image19.png){width="7.383015091863517in"
height="6.790793963254593in"}

Figure - Onion diagram

![](media/image20.png){width="7.499747375328084in"
height="7.839622703412074in"}

Figure - Usecase diagram

![](media/image21.png){width="7.5in" height="5.708333333333333in"}

Figure - Data flow diagram

![](media/image22.png){width="6.376622922134733in"
height="8.402083333333334in"}

Figure - System activity diagram

![](media/image23.png){width="3.357638888888889in"
height="7.7659722222222225in"}

Figure - Mermaid chart for DB schema
