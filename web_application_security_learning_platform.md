# Web Application Security Learning Platform
## Project Overview, MVP Scope, and Roadmap

**Document status:** Initial product direction  
**Current scope:** Phase 1 — Interactive Learning; Phase 2 — Source-Code Analysis

---

## 1. Project Idea

Beginner web developers often learn how to build applications without understanding how vulnerabilities occur. This project aims to create an interactive platform where developers can learn about web application vulnerabilities in a safe, controlled environment and apply that knowledge to their own source code.

The core idea is to combine two experiences:

1. **Learn web security:** Understand vulnerabilities through guided lessons, controlled experiments, and secure-coding exercises.
2. **Analyze your own code:** Upload a project or connect a GitHub repository to receive security findings, explanations, and remediation guidance.

The platform should go beyond teaching concepts or producing a conventional vulnerability report. Its goal is to help developers understand whether their code may be vulnerable, why the issue matters, and how to improve it.

### Product principle

**Finding → Understand → Reproduce safely → Fix → Verify**

Not every issue can be automatically reproduced or verified. The platform must distinguish confirmed vulnerabilities from potential findings and informational observations.

---

## 2. Product Scope

The MVP focuses on two phases only.

### Phase 1 — Interactive Learning

Teach beginners how common vulnerabilities work through explanations, controlled experiments, and secure-coding exercises.

### Phase 2 — Source-Code Analysis

Allow users to upload a ZIP archive or connect a GitHub repository. Analyze source code, dependencies, and exposed secrets; present findings in an understandable dashboard; and connect relevant findings to learning modules.

### Explicitly out of scope for now

- Scanning arbitrary deployed websites by URL.
- Running users' applications as live instances on the platform.
- Dynamic Application Security Testing (DAST) against user applications.
- Full penetration-testing automation.
- Supporting every programming language and framework.
- Treating every scanner alert as a confirmed exploitable vulnerability.

These may be reconsidered later, but they are not part of the current implementation plan.

---

## 3. Phase 1 — Interactive Learning

### 3.1 Initial learning modules

Start with three core modules and expand after validating the learning experience.

| Module | Learning objective |
|---|---|
| SQL Injection | Understand how unsafe database queries can be manipulated and how parameterized queries help prevent injection. |
| Cross-Site Scripting (XSS) | Understand how untrusted input can become executable browser content and how to handle output safely. |
| Broken Access Control | Understand authorization failures, resource ownership, and why access checks must be enforced server-side. |

Potential follow-up modules:

- Authentication and session-management failures.
- Security misconfiguration.
- Sensitive data exposure.
- Vulnerable and outdated dependencies.
- Security headers and browser protections.

### 3.2 Lesson structure

Use a consistent learning loop:

1. **Understand:** Introduce the concept, terminology, and impact.
2. **Experiment:** Let the learner interact with a controlled example.
3. **Identify the flaw:** Ask the learner to recognize what is unsafe and why.
4. **Fix:** Present or let the learner choose a safer implementation.
5. **Assess:** Use short questions or practical tasks to test understanding.
6. **Review:** Summarize the lesson and link to related topics.

### 3.3 Safe learning environment

Use deliberately vulnerable examples and simulated applications for the initial lessons. Keep experiments within the platform's controlled environment. The initial learning modules do not need to execute arbitrary code submitted by users.

### 3.4 Learning experience goals

- Explain security concepts in beginner-friendly language.
- Show vulnerable and secure code side by side where useful.
- Explain impact without relying only on jargon or severity labels.
- Let learners practice and receive feedback.
- Track lesson completion and assessment results.
- Link lessons to relevant findings in Phase 2.

---

## 4. Phase 2 — Source-Code Analysis

### 4.1 Supported project entry points

The user should be able to:

- **Upload a project:** Submit a ZIP archive containing source code.
- **Connect GitHub:** Authorize access to a repository and select a project to analyze.

GitHub integration can follow ZIP upload if it slows down the initial release.

### 4.2 Analysis workflow

```text
Upload ZIP / Connect GitHub
            |
            v
       Select Project
            |
            v
       Detect Tech Stack
            |
            v
     Run Security Scanners
            |
            v
     Normalize Findings
            |
            v
      Security Dashboard
            |
            v
       Understand → Fix
            |
            v
       Analyze Again
```

### 4.3 Initial language scope

Start with **Python and JavaScript/TypeScript**. Expand to additional languages only after the initial scanning and explanation workflow is reliable.

### 4.4 Candidate scanning tools

| Tool | Purpose |
|---|---|
| [Semgrep](https://semgrep.dev/) | Static analysis for insecure coding patterns and selected vulnerability classes. |
| [OSV-Scanner](https://github.com/google/osv-scanner) | Identify known vulnerabilities in supported dependency manifests and lockfiles. |
| A dedicated secret scanner | Detect potentially exposed API keys, tokens, passwords, and other credentials. |

These tools complement one another. Static analysis does not prove that an issue is exploitable, dependency findings depend on package and version data, and secret scanners can produce false positives or miss secrets.

### 4.5 Security finding format

Each finding should ideally include:

- **Title:** A concise description of the potential issue.
- **Severity:** A consistent severity rating, with context where possible.
- **Confidence/status:** For example, potential issue, validated finding, or informational observation.
- **Location:** File path and line number when available.
- **Explanation:** What the code appears to do and why it may be unsafe.
- **Impact:** What could happen if the issue is real and exploitable.
- **Remediation:** Concrete steps to improve the code.
- **References:** Links to relevant security guidance.
- **Related lesson:** A link to the matching interactive learning module.
- **Scan metadata:** Scanner, scan time, and project revision or commit.

### 4.6 Example user journey

A developer receives a finding:

**Potential SQL Injection — `auth.py:42`**

The platform explains:

- **What may be wrong:** User input appears to be incorporated into a database query unsafely.
- **Why it matters:** An attacker may be able to manipulate the query's behavior.
- **How to improve it:** Use parameterized queries rather than constructing SQL from untrusted input.
- **Learn more:** Open the interactive SQL injection module.
- **Verify:** Analyze the updated code and check whether the original finding remains.

The wording should be careful: static analysis identifies potential issues, not necessarily exploitable vulnerabilities. The platform should communicate uncertainty rather than presenting every scanner warning as a confirmed exploit.

---

## 5. The Main Differentiator: Connecting Learning to Real Findings

The platform should not stop at generating a vulnerability report.

When a scanner identifies a potentially unsafe database query, the platform should guide the developer to the SQL injection lesson. When it identifies a possible authorization problem, it should point to the broken access control lesson.

This creates a connected experience:

1. A developer submits their own project.
2. The platform identifies a potential issue.
3. The developer learns what the issue means.
4. The developer receives actionable remediation guidance.
5. The developer updates the code.
6. The developer runs another analysis and compares results.

This connection between a developer's code and the relevant learning experience could become the product's strongest differentiator.

The platform must avoid claiming that a rescan proves the entire application is secure. It can report that a particular finding no longer appears, while explaining the limits of automated analysis.

---

## 6. Recommended MVP Architecture

Keep the initial architecture straightforward and separate untrusted scanning work from the main application.

```text
                 WEB APPLICATION
                React + TypeScript
                        |
                        v
                  FastAPI Backend
                        |
            +-----------+-----------+
            |           |           |
            v           v           v
         Learning     Project      Results
         Modules      Manager     Dashboard
                        |
                        v
                    Job Queue
                        |
                        v
                 Isolated Workers
                        |
             +----------+----------+
             |          |          |
             v          v          v
           SAST     Dependency   Secret
          Scanner    Scanner    Scanner
             |          |          |
             +----------+----------+
                        |
                        v
                Normalized Findings
                        |
                        v
                 Learning Dashboard
```

### Suggested technology stack

| Component | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend API | FastAPI |
| Database | PostgreSQL |
| Background jobs | Redis + Celery, or an equivalent job queue |
| Static analysis | Semgrep |
| Dependency analysis | OSV-Scanner |
| Secret detection | A dedicated secret scanner |
| GitHub integration | GitHub App or appropriately scoped OAuth integration |
| Deployment | Containerized application services; isolated scanner workers |

These are initial recommendations, not mandatory choices. Validate operational requirements, costs, scanner licensing, and integration effort before committing to the final stack.

### Why use a job queue?

Scans can take time and should not hold open a normal API request. The backend can create a scan job, return its status, and let the frontend show queued, running, completed, or failed states. Workers process jobs separately and store normalized findings for the dashboard.

### Security requirements for source-code analysis

Treat every uploaded archive and repository as untrusted input.

- Validate archive paths and reject path-traversal entries.
- Enforce upload-size, file-count, timeout, CPU, memory, and storage limits.
- Isolate scanner processes and run them with minimal privileges.
- Restrict worker network access and prevent access to internal services.
- Do not expose application secrets to scan jobs.
- Avoid executing submitted application code in this MVP.
- Protect repository credentials and request only the minimum GitHub permissions required.
- Define retention and deletion policies for source code, scan artifacts, and findings.
- Record scan status and errors without logging sensitive source content unnecessarily.

Containers are useful for isolation, but containers alone should not automatically be treated as a sufficient security boundary for hostile workloads.

---

## 7. Roadmap and Path Forward

### Stage 0 — Product definition

**Goal:** Agree on the initial user, feature boundaries, and success criteria.

Tasks:

- Define the primary user persona.
- Confirm the initial three learning modules.
- Define supported languages and file types.
- Specify the finding format and severity model.
- Decide what information is retained and for how long.
- Write acceptance criteria for the first release.

**Deliverable:** A concise product requirements document and MVP backlog.

### Stage 1 — Learning foundation

**Goal:** Deliver a usable interactive learning experience.

Tasks:

- Build the lesson interface and navigation.
- Implement SQL injection, XSS, and broken access control lessons.
- Create controlled vulnerable/secure examples.
- Add exercises, feedback, and short assessments.
- Track lesson completion and results.

**Exit criteria:** A learner can complete each initial module and demonstrate understanding through its assessment.

### Stage 2 — ZIP upload and analysis

**Goal:** Analyze a project and present understandable findings.

Tasks:

- Implement project upload and validation.
- Detect supported languages and dependency manifests.
- Add background scan jobs and status tracking.
- Integrate the selected static-analysis, dependency, and secret-scanning tools.
- Normalize tool outputs into a common finding schema.
- Build the findings dashboard.
- Show file locations, explanations, remediation guidance, and scanner details.
- Add safe failure handling and scan limits.

**Exit criteria:** A user can upload a supported project, receive a completed scan report, and understand the limitations of the results.

### Stage 3 — Connect learning and findings

**Goal:** Make findings lead naturally to learning and remediation.

Tasks:

- Map common finding categories to lessons.
- Add contextual explanations and remediation examples.
- Support repeat scans.
- Compare findings between scans.
- Clearly distinguish new, persistent, and no-longer-detected findings.

**Exit criteria:** A user can move from a finding to the relevant lesson, make a code change, and compare subsequent scan results.

### Stage 4 — GitHub integration

**Goal:** Make analysis convenient for repository-based workflows.

Tasks:

- Create a GitHub App or implement appropriately scoped authorization.
- Let users select repositories.
- Retrieve code securely for analysis.
- Associate scans with commit identifiers.
- Handle revoked permissions, private repositories, and API errors.
- Avoid exposing access tokens in logs or scan workers.

**Exit criteria:** A user can authorize access, select a repository, run a scan, and view findings tied to a specific revision.

### Later possibilities — Not part of the current scope

Only revisit these after the MVP has demonstrated value:

- More languages and vulnerability categories.
- Additional learning paths and assessments.
- Team dashboards and progress reporting.
- CI/CD integration.
- Isolated runtime testing and dynamic analysis.
- More advanced remediation workflows.

---

## 8. MVP Priorities

### Essential for the first release

1. User registration and project management, if accounts are required by the chosen deployment model.
2. Three interactive lessons: SQL injection, XSS, and broken access control.
3. ZIP upload and source-code analysis.
4. A findings dashboard with severity and code locations.
5. Remediation explanations and links to learning modules.
6. Repeat scanning and comparison of findings.

### Next priorities

- GitHub repository integration.
- More vulnerability categories.
- Scan history and progress tracking.
- More advanced assessments and achievement tracking.

**Recommendation:** Deliver a small number of complete, useful learning modules and a reliable code-analysis workflow instead of launching with many incomplete lessons or excessive scanner coverage.

---

## 9. Success Criteria

Evaluate the MVP on both learning value and analysis usefulness.

### Learning

- Can beginners explain the vulnerability in their own words?
- Can they distinguish vulnerable and safer implementations?
- Can they complete practical exercises without relying on memorized answers?
- Do they improve on a follow-up assessment?

### Source-code analysis

- Can a user upload a supported project without unnecessary friction?
- Do scans complete reliably within defined resource limits?
- Are findings presented with actionable file locations and explanations?
- Are false positives and uncertainty communicated clearly?
- Can users connect findings to relevant lessons?
- Can users compare results after changing code?

Avoid using the raw number of detected findings as the main success metric. More alerts do not necessarily mean better security education.

---

## 10. Important References

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — a reference for web application security testing concepts and techniques.
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop/) — an intentionally vulnerable application useful for security training and experimentation.
- [Semgrep](https://semgrep.dev/) — source-code analysis tooling.
- [OSV-Scanner](https://github.com/google/osv-scanner) — dependency vulnerability scanning.
- [GitHub Apps documentation](https://docs.github.com/en/apps) — options for building repository integrations.

Review current documentation, licensing, and deployment requirements before selecting and integrating tools.

---

## 11. Key Product Decision Still Open

The primary user persona has not yet been finalized.

- **A. Complete beginners** who have just started learning web development.
- **B. Developers** who can build applications but do not understand security.
- **C. Both**, with a beginner-friendly learning path and a more technical code-analysis experience.

**Recommended direction:** Option C, while initially designing the experience around developers who can already build something functional but need help understanding whether they've built it securely.

This keeps the learning experience approachable while making source-code analysis a meaningful differentiator.

---

## 12. Current Product Positioning

A concise positioning statement:

> An interactive web application security learning platform that helps developers understand common vulnerabilities, analyze their own source code, and learn how to remediate potential security issues.

The initial product combines guided security education with source-code analysis. Its value lies not in replacing professional security testing, but in helping developers build security awareness into their development process.

**Immediate next step:** Finalize the primary user persona and the requirements for the first three lessons and ZIP-based source-code analysis. Then turn those requirements into an implementation backlog.
