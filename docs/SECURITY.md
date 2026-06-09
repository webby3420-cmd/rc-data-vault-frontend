# Security — Secret Scanning

This repo uses [gitleaks](https://github.com/gitleaks/gitleaks) via the
[pre-commit](https://pre-commit.com) framework to block secrets from being committed.
The hook config is pinned in `.pre-commit-config.yaml`.

## Install (one-time, per clone)

```bash
brew install gitleaks
brew install pre-commit
pre-commit install   # activates the local pre-commit hook in .git/hooks/
```

After `pre-commit install`, every `git commit` runs gitleaks against the **staged**
changes (redacted) and blocks the commit if a secret is detected.

## Run manually

```bash
# Run the configured hooks against the whole working tree
pre-commit run --all-files

# Scan the current working tree directly (redacted output, no banner)
gitleaks dir . --redact --no-banner

# Scan full git history (redacted). Reports known historical findings — see note below.
gitleaks git . --redact
```

All gitleaks invocations here use `--redact` so secret values are masked in output.
Never write a gitleaks report file (`--report-path`) into the repo or CI logs — report
files can contain unredacted secrets. Use exit codes + redacted stdout.

## If a committed secret is found

1. **Rotate or restrict the credential at the provider first.** This is the only real
   remediation — rewriting git history does **not** undo exposure on a public repo
   (forks, clones, and caches may retain it).
2. Do **not** print the secret value in issues, PRs, commit messages, or logs.
3. Treat history rewriting as a separate, deliberate decision; it is not a substitute
   for rotation.

## Historical scan note

- **2026-06-09:** A scan found **2 history-only** `generic-api-key` findings in
  `app/layout.tsx` at commits `60fc617` and `c819809`. **Current HEAD is clean**
  (`app/layout.tsx` and the full working tree scan with no leaks). The credential class
  was **not recorded**, **no history rewrite** was performed, and **no secret value is
  recorded here**. Handling of the historical value is an **out-of-band repo-owner
  responsibility**. This forward-guard prevents *new* secrets from being committed; it
  does not alter existing history.
