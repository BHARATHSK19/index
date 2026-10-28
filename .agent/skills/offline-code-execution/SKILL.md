---
name: ojix-offline-code-execution
description: Core operating instructions disabling automated browser checks, visual previews, or browser subagents. Directs all focus strictly to workspace code editing and manual user verification.
---

# OJIX Core Instruction: Offline Code & File-First Execution Guardrail

## 1. Strict Prohibition of Automated Browser Checking
- **DO NOT** invoke or trigger browser subagents (`browser_subagent`), external browser windows, headless browsers, or any automated visual rendering tools.
- **DO NOT** attempt to take screenshots, scrape rendered local pages via browser drivers, or automate visual UI testing.
- **DO NOT** attempt to open `localhost` URLs or visual previews automatically.

## 2. Manual Verification Workflow
- The user handles all manual browser verification, localhost checking, and visual UI inspection on their end.
- The user's local server (e.g., `npm start`) is actively managed and tested directly by the user.

## 3. Scope of Responsibility
- Strictly focus on analyzing, writing, editing, refactoring, and saving code to files directly in the workspace.
- Adhere strictly to the clean modular HTML, CSS, and JS architecture of OJIX.
- When modifications to UI, styles, or logic are complete, confirm the exact file changes cleanly so the user can verify them directly in their browser.
