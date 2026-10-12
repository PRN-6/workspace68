# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Reporting a Vulnerability

We take the security of **workspace68** seriously. If you discover a security vulnerability, please do not open a public issue. Instead, report it privately so we can investigate and address it promptly.

### How to Report

1. **Email:** Send details to **prinsonnazareth2@gmail.com** with the subject `[Security Vulnerability] workspace68`.
2. **GitHub Security Advisory:** Alternatively, submit a private advisory through the repository's **Security > Report a vulnerability** tab on GitHub.

### What to Include in Your Report

Please provide as much information as possible to help us reproduce and resolve the issue:
- Type of vulnerability (e.g., XSS, prototype pollution, secret leakage).
- Clear step-by-step reproduction instructions or a minimal proof of concept (PoC).
- Potential impact and affected components.
- Any suggested fixes or mitigations.

### Response Timeline

- **Initial acknowledgment:** Within 48 hours.
- **Status update / assessment:** Within 5 business days.
- **Resolution & release:** As soon as possible depending on severity.

---

## Security Considerations & Best Practices

- **API Keys & In-Memory Storage:**
  When configuring third-party AI providers in the builder, API keys are held strictly in browser memory and are **not** persisted to project files or exported packages.
- **Client-Side Requests:**
  Requests to LLM endpoints are made directly from your browser. Never hardcode or bundle private API keys in client builds distributed to untrusted environments.
- **Project Export:**
  Exported project ZIP files generate standard React source code. Always review third-party dependencies before deploying exported sites to production environments.
