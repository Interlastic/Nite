# Settings Update: Command Permission System

**Date:** 2026-01-29  
**Target:** Online Dashboard (https://nite.mingalabs.com)  
**Purpose:** Replace boolean enablement toggles with a structured permission-based system.

---

## New Settings Format

All commands now use a `{command_name}_permissions` object instead of `{command_name}_enabled`.

### Structure
```json
{
  "roles": [],       // List of role IDs (strings) or names
  "permissions": [], // List of Discord permission strings (e.g., "administrator", "manage_guild")
  "enabled": true    // Global toggle (replacement for the old _enabled flag)
}
```

### Example
```json
"gridpoll_permissions": {
  "roles": ["123456789", "Moderator"],
  "permissions": ["send_messages", "create_polls"],
  "enabled": true
}
```

---

## Dashboard Requirements

### 1. Unified Command Manager
- Update the existing command toggle list.
- Instead of a simple checkbox, each command should have:
    - **Global Toggle:** A switch/checkbox for the `enabled` field.
    - **Roles Selector:** A multi-select dropdown or tag input for `roles`.
    - **Permissions Selector:** A multi-select dropdown for `permissions` (hardcode valid Discord permissions).

### 2. Valid Discord Permissions
The dashboard should offer the following options in the permission selector:
- `administrator`
- `manage_guild`
- `manage_roles`
- `manage_channels`
- `manage_messages`
- `manage_webhooks`
- `manage_nicknames`
- `send_messages`
- `create_polls` (New!)
- `mention_everyone`
- `view_audit_log`
- `kick_members`
- `ban_members`

### 3. Migration Handling
- The bot still supports the old `_enabled` keys as fallbacks, but the dashboard should prioritize and migrate users to the `_permissions` objects.
- When a user updates a command setting, it MUST be saved in the `_permissions` format.

---

## Technical Details

- **Global Check:** The bot uses `globalTree.interaction_check` to validate these settings before command execution.
- **AND/OR Logic:** 
    - `enabled`: Must be `true`.
    - `permissions`: User must have **ALL** listed permissions.
    - `roles`: User must have **AT LEAST ONE** of the listed roles (if the list is not empty).
- **Special Case:** `/ask` still has internal logic in `ask_logic` that is not fully bypassed by this system, but its global execution is still gated by `ask_permissions`.
