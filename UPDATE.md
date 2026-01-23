# Settings Update: Welcome/Goodbye Interaction System

**Date:** 2026-01-23  
**Target:** Online Dashboard (https://nite.mingalabs.com)  
**Purpose:** Add support for new interaction-based welcome/goodbye message system

---

## New Settings Added

### 1. `welcome_goodbye_interactions` (Object)
**Type:** `{}`  
**Default:** `{}`  
**Description:** Maps definition IDs to lists of interaction types

**Structure:**
```json
{
  "definition_id": ["interaction_type1", "interaction_type2"]
}
```

**Valid Interaction Types:**
- `"bot_joined"` - When a bot member joins the server
- `"bot_left"` - When a bot member leaves the server
- `"member_joined"` - When a regular member joins for the first time
- `"member_left"` - When a regular member leaves
- `"member_returned"` - When a member rejoins after previously leaving

**Example:**
```json
{
  "1": ["bot_joined", "bot_left"],
  "2": ["member_joined", "member_returned"],
  "3": ["member_left"]
}
```

**Dashboard Requirements:**
- Allow users to create/edit/delete definition IDs
- Multi-select dropdown for interaction types per definition
- Validate that definition IDs match those in `welcome_goodbye_definitions`

---

### 2. `welcome_goodbye_definitions` (Object)
**Type:** `{}`  
**Default:** `{}`  
**Description:** Contains message/embed configurations for each definition ID

**Structure:**
```json
{
  "definition_id": {
    "content": "Message text",
    "username": "Optional webhook username",
    "avatar_url": "Optional webhook avatar URL",
    "embeds": [...]
  }
}
```

**Example:**
```json
{
  "1": {
    "content": "🤖 A bot has joined/left!"
  },
  "2": {
    "content": "Welcome {mention}!",
    "embeds": [{
      "title": "New Member",
      "description": "Welcome to {server}!",
      "color": 3066993
    }]
  }
}
```

**Dashboard Requirements:**
- Reuse existing embed editor (from current welcome/goodbye system)
- Add definition ID input field
- Support webhook customization (username, avatar_url)
- List all defined IDs with preview

---

### 3. `member_history` (Object)
**Type:** `{}`  
**Default:** `{}`  
**Description:** Tracks member join/leave timestamps (managed by bot, not user-editable)

**Structure:**
```json
{
  "member_id": {
    "joined_at": "ISO 8601 timestamp",
    "left_at": "ISO 8601 timestamp"
  }
}
```

**Dashboard Requirements:**
- **READ-ONLY** display (users should not edit this)
- Optional: Show statistics (e.g., "Tracking 245 members")
- Optional: Show recent entries (last 10) with formatted dates
- Include clear button to reset history (with confirmation)

---

### 4. `member_history_retention_days` (Integer)
**Type:** Number  
**Default:** `30`  
**Min:** `30`  
**Max:** `120`  
**Description:** How many days to keep member history for return detection

**Dashboard Requirements:**
- Number input with validation (30-120 range)
- Slider or dropdown for common values (30, 60, 90, 120)
- Help text: "Members who left more than X days ago won't trigger 'member returned' messages"

---

## New Placeholders Available

The following placeholders can now be used in welcome/goodbye messages:

### Context-Specific Placeholders

| Placeholder | Description | Available In |
|------------|-------------|--------------|
| `{join_method}` | "OAuth" for bots, "Invite Link" for members | All join interactions |
| `{invite_link}` | Invite URL or "Unknown" | All join interactions |
| `{time_to_return}` | Days since member last left | `member_returned` only |

### Existing Placeholders (Still Valid)
- `{mention}`, `{username}`, `{displayname}`, `{userid}`
- `{server}`, `{servername}`, `{serverid}`, `{membercount}`
- `{profileurl}`, `{profileopenurl}`
- `{channel}`, `{channellink}`, `{date}`, `{time}`

**Dashboard Requirements:**
- Add new placeholders to placeholder picker/autocomplete
- Show context availability (e.g., "Only for member_returned")
- Update placeholder documentation/tooltips

---

## Existing Settings (Unchanged - Backward Compatible)

These settings still exist and work as before:

- `welcome_messages` (Array) - Legacy random message list
- `welcome_channel` (Channel ID) - Channel for welcome messages
- `welcome_enabled_bool` (Boolean) - Enable/disable welcomes
- `welcome_show_join_number` (Boolean) - Show join number
- `welcome_show_roles` (Boolean) - Show roles
- `goodbye_messages` (Array) - Legacy random goodbye list
- `goodbye_channel` (Channel ID) - Channel for goodbye messages
- `goodbye_enabled_bool` (Boolean) - Enable/disable goodbyes

**Important:** The bot will use the **new system** if `welcome_goodbye_interactions` and `welcome_goodbye_definitions` are populated, otherwise it falls back to the **legacy system**.

---

## Proposed Dashboard UI Flow

### Option 1: Separate Tab/Section
Create a new "Advanced Welcome/Goodbye" section with:

1. **Interaction Manager:**
   - List of definition IDs (1, 2, 3, etc.)
   - For each definition:
     - Interaction type checkboxes (bot_joined, member_left, etc.)
     - Edit button → Opens embed editor
     - Delete button

2. **Add Definition Button:**
   - Opens modal with:
     - Definition ID input
     - Interaction type multi-select
     - Embed editor

3. **Settings Panel:**
   - Member history retention slider (30-120 days)
   - View history button (shows read-only list)
   - Clear history button (with confirmation)

### Option 2: Enhanced Existing Welcome/Goodbye Page
Add toggle: "Use Advanced Interaction System"

When enabled:
- Hide legacy message array editors
- Show interaction definition builder
- Add definition management UI

When disabled:
- Show original simple message editors
- Hide interaction settings

---

## Migration Guide for Dashboard

### For Servers Using Legacy System
**No action required.** The legacy system continues to work. Users can optionally migrate to the new system when ready.

### For New Servers
Dashboard can default to showing the new interaction system if:
- `welcome_goodbye_interactions` is empty
- `welcome_goodbye_definitions` is empty
- `welcome_messages` is empty

Or provide a setup wizard asking: "Simple or Advanced welcome messages?"

### Migrating Legacy to Interaction System
Dashboard could offer a "Convert to Advanced" button that:

1. Creates definition "1" with interaction types `["member_joined"]`
2. Copies first `welcome_messages` entry to definition "1"
3. Creates definition "2" with interaction types `["member_left"]`
4. Copies first `goodbye_messages` entry to definition "2"
5. Clears `welcome_messages` and `goodbye_messages` arrays

---

## Example Dashboard Configuration

```json
{
  "welcome_goodbye_interactions": {
    "1": ["bot_joined", "bot_left"],
    "2": ["member_joined"],
    "3": ["member_returned"],
    "4": ["member_left"]
  },
  "welcome_goodbye_definitions": {
    "1": {
      "content": "🤖 A bot has joined/left the server!"
    },
    "2": {
      "content": "Welcome {mention}! You joined via {join_method}.",
      "embeds": [{
        "title": "New Member 🎉",
        "description": "{displayname} is member #{membercount}!",
        "color": 3066993,
        "thumbnail": {
          "url": "{profileurl}"
        }
      }]
    },
    "3": {
      "content": "Welcome back {mention}! You were gone for {time_to_return} days! 🎊"
    },
    "4": {
      "content": "Goodbye {displayname}! We'll miss you! 😢",
      "embeds": [{
        "description": "They were with us since {date}",
        "color": 15158332
      }]
    }
  },
  "welcome_channel": 123456789,
  "goodbye_channel": 987654321,
  "member_history_retention_days": 60
}
```

---

## Validation Rules for Dashboard

### `welcome_goodbye_interactions`
- ✅ Definition IDs must exist in `welcome_goodbye_definitions`
- ✅ Interaction types must be one of: bot_joined, bot_left, member_joined, member_left, member_returned
- ✅ Each interaction type can appear in multiple definitions (intentional - allows multiple messages)
- ⚠️  Warn if `welcome_goodbye_definitions` is empty but `welcome_goodbye_interactions` has entries

### `welcome_goodbye_definitions`
- ✅ Must be valid message object (content or embeds required)
- ✅ Embeds must follow Discord embed structure
- ⚠️  Warn if definition ID not referenced in `welcome_goodbye_interactions`

### `member_history_retention_days`
- ✅ Must be integer between 30 and 120
- ✅ Default to 30 if invalid

### Channels
- ✅ `welcome_channel` required for join interactions (bot_joined, member_joined, member_returned)
- ✅ `goodbye_channel` required for leave interactions (bot_left, member_left)
- ⚠️  Show warning if interaction types are configured but channels are not set

---

## API Endpoints (if applicable)

If the dashboard uses API endpoints to update settings:

### `GET /api/servers/{guild_id}/settings`
**Response:** Include new settings in existing response
```json
{
  "welcome_goodbye_interactions": {},
  "welcome_goodbye_definitions": {},
  "member_history": {},
  "member_history_retention_days": 30
}
```

### `PATCH /api/servers/{guild_id}/settings`
**Request Body:** Allow updating new settings
```json
{
  "welcome_goodbye_interactions": {...},
  "welcome_goodbye_definitions": {...},
  "member_history_retention_days": 60
}
```

### `DELETE /api/servers/{guild_id}/member_history` (Optional)
Clear member history for server

---

## Testing Checklist for Dashboard

- [ ] Create new definition with interaction types
- [ ] Edit existing definition
- [ ] Delete definition
- [ ] Validate interaction types
- [ ] Test embed editor integration
- [ ] Test placeholder picker shows new placeholders
- [ ] Adjust retention days slider
- [ ] View member history (read-only)
- [ ] Clear member history
- [ ] Save and load configuration
- [ ] Test validation warnings
- [ ] Test backward compatibility (legacy system still works)
- [ ] Test migration wizard (if implemented)

---

## Questions to Consider

1. Should the dashboard allow multiple definitions for the same interaction type?
   - **Answer:** Yes, the bot supports this. All matching definitions will send messages.

2. Should there be a preview function?
   - **Recommendation:** Yes, show preview with example placeholders filled in.

3. How to handle definition ID conflicts?
   - **Recommendation:** Auto-increment (suggest next available ID) or validate uniqueness.

4. Should member_history be exportable?
   - **Recommendation:** Optional feature - export as CSV with member IDs and timestamps.

---

## Additional Notes

- The bot automatically cleans up `member_history` entries on member join
- Maximum 1500 entries are kept per server
- All timestamps are stored in UTC (ISO 8601 format)
- Message sending uses webhooks when `username` or `avatar_url` is provided
- The system is fully backward compatible - no breaking changes
