# OJIX Workspace Rules & Behavioral Constraints

## Automated Browser Checking Disabled
1. **Never use browser automation tools**: Do NOT call `browser_subagent` or any external/automated browser verification tools.
2. **No automated UI previewing or rendering checks**: Do not attempt to load `localhost` URLs or check visual UI rendering.
3. **Manual verification by user**: All browser testing, visual inspection, and responsive layout validation are handled by the user.
4. **Code-first focus**: Strictly focus on editing, creating, and modifying workspace files cleanly and accurately.
