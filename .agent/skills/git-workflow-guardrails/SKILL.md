---
name: ojix-git-workflow-guardrails
description: Git workflow hygiene, commit standards, branch protection rules, and merge safety for the 'bharath' branch and release tracks.
---

# OJIX Git Workflow Guardrails ('bharath' Branch Hygiene)

This skill enforces version control standards, branch discipline, and release verification for the OJIX codebase, especially when collaborating on the active feature branch `bharath`.

## 1. Branch Strategy & Hygiene
- **Primary Feature Branch**: `bharath`
- **Main / Production Branch**: `main`
- **Rules**:
  1. Always verify the active working branch before staging and committing (`git branch --show-current`).
  2. Pull the latest upstream changes with rebase or fast-forward before creating new commits:
     ```bash
     git pull origin bharath --rebase
     ```
  3. Never commit directly to `main` without testing and review.

## 2. Pre-Commit Validation Checks
Before committing any changes, run the repository automated sanity script:
```bash
npm test
```
This ensures syntax validation across `app.js`, `server.js`, and `db.js`:
- `node --check app.js`
- `node --check server.js`
- `node --check db.js`

If visual effects or vendor bundles were modified:
```bash
npm run build:effects
```

## 3. Commit Message Standards (Conventional Commits)
Follow concise, structured commit messages:
- `feat(desktop): implement fluid clamp typography for product hero`
- `fix(mobile): optimize touch swipe threshold on hero carousel`
- `style(theme): refine dark surface contrast and orange accent glow`
- `refactor(api): extract session validation into reusable middleware`
- `docs(skills): add local agent skill instructions for UI and backend`

## 4. File Cleanliness & Sensitive Data Guard
- Never track `.env` or local database files (`data/*.db`, `*.sqlite`). Check `.gitignore` before adding untracked files.
- Avoid committing OS artifacts (`Thumbs.db`, `.DS_Store`).
- Always verify file status prior to staging:
  ```bash
  git status
  ```
