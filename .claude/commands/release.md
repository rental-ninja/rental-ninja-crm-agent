Release a new version of the rental-ninja-crm plugin.

Argument: $ARGUMENTS (patch, minor, or major — default: patch)

## Steps

1. Read `.claude-plugin/plugin.json` to get the current version.
2. Compute the new version by bumping the appropriate semver segment (patch/minor/major).
3. Run `git log` from the last version-bump commit to HEAD to gather unreleased changes.
4. Show the user: current version → new version, plus a summary of unreleased changes.
5. **Wait for user confirmation** before proceeding.
6. Update `.claude-plugin/plugin.json` with the new version.
7. Stage all changes and commit with message: `v{new_version}: {short description of changes}` (include Co-Authored-By trailer).
8. Push to main.
9. Confirm the release is done and print the new version.

## Rules

- Never skip the confirmation step.
- If there are no changes beyond the version bump, warn the user and ask if they want to proceed anyway.
- Default to `patch` if no argument is provided.
