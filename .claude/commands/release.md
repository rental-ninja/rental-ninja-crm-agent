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
9. Clone `https://github.com/rental-ninja/claude-plugins-marketplace.git` into a temp dir.
10. Update `.claude-plugin/marketplace.json` — ONLY change the `version` field of the plugin named `rental-ninja-crm` in the `plugins` array. The file has this exact schema:

    ```json
    {
      "name": "rental-ninja",
      "owner": { "name": "Rental Ninja" },
      "metadata": { "description": "Claude Code plugins for Rental Ninja" },
      "plugins": [
        {
          "name": "rental-ninja-crm",
          "description": "CRM operator for Rental Ninja Hub — inbox triage, customer replies, booking research, sales pipeline",
          "version": "<UPDATE THIS TO NEW VERSION>",
          "source": {
            "source": "url",
            "url": "https://github.com/rental-ninja/rental-ninja-crm-agent.git"
          }
        }
      ]
    }
    ```

    Only modify the `version` value. Do not change any other field.

11. Commit: `Bump rental-ninja-crm to v{new_version}` and push to main.
12. Remove the temp dir.
13. Confirm the release is done and print the new version.

## Rules

- Never skip the confirmation step.
- If there are no changes beyond the version bump, warn the user and ask if they want to proceed anyway.
- Default to `patch` if no argument is provided.
