# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in idle-arcade, please report it by emailing the maintainer directly rather than opening a public issue.

**Email:** [open an issue with the label `security`](https://github.com/rohang98/idle-arcade/issues/new?labels=security) if the vulnerability is low-severity, or DM [@rohang98](https://github.com/rohang98) for anything sensitive.

## Scope

idle-arcade runs locally and does not make network requests. The main attack surface is:

- Hooks executed by Claude Code (command injection via game IDs or arguments)
- File writes to `~/.config/idle-arcade/` (path traversal)
- Dependencies (supply chain)

## Supported Versions

Only the latest published version on npm is supported.
