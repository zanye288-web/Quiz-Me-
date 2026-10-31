# Security Policy

Quiz-Me! takes the security and privacy of its users seriously. This document explains which versions are covered by security updates and how to report a vulnerability responsibly.

## Supported versions

Security fixes are intended for the latest code on the default branch.

| Version | Supported |
| --- | --- |
| Latest default branch | Yes |
| Older commits and snapshots | No guarantee |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, pull requests, or social media.**

Use GitHub's private vulnerability reporting feature for this repository:

1. Open the repository's **Security** tab.
2. Select **Report a vulnerability** (or **Report a vulnerability privately**, depending on the GitHub interface).
3. Provide the details requested in the private report.

If private vulnerability reporting is not enabled for this repository, contact the repository maintainers through a private channel before sharing technical details. Do not publish proof-of-concept code or details that would make exploitation easier while waiting for a private reporting channel.

Please include, where possible:

- A clear description of the suspected vulnerability.
- The affected component, file, endpoint, or configuration.
- The steps needed to reproduce the issue in a test environment.
- The potential impact and any realistic attack prerequisites.
- Relevant logs or screenshots, after removing credentials and personal information.
- A suggested mitigation, if you have one.

You do not need to prove the issue against another person's account or data. Do not access, modify, or disclose information that does not belong to you.

## What to expect

The maintainers will make a reasonable effort to:

- Acknowledge a private report.
- Review and investigate the reported issue.
- Ask for clarification if more information is needed.
- Work on an appropriate fix and coordinate disclosure.

Response and remediation times are not guaranteed. Please allow maintainers a reasonable opportunity to investigate and address a report before making it public.

## Scope and security guidance

Examples of issues worth reporting include:

- Authentication or authorisation bypasses.
- Exposure of API keys, service-account credentials, or other secrets.
- Unauthorised access to private student profiles, learning records, or uploaded materials.
- Insecure Firestore rules or backend access controls.
- Injection, file-upload, or API vulnerabilities.
- Cross-site scripting or other issues that could affect users.
- Unintended disclosure of private data through logs, errors, exports, or generated content.

Please do not submit reports for ordinary bugs, feature requests, spam, or issues that require access to accounts or infrastructure you do not own.

## Safe testing

- Test only with accounts, data, and systems you own or have explicit permission to assess.
- Do not disrupt the service, degrade availability, or conduct denial-of-service testing.
- Do not download, alter, or retain other users' private information.
- Do not publicly disclose secrets or exploit instructions.
- Stop testing and report the issue privately if you encounter real user data.

Thank you for helping keep Quiz-Me! and its users safe.
