# Nite Dashboard - Developer Guide (AGENT.md)

Welcome to the **Nite** dashboard codebase! This document provides essential information for AI assistants and developers to maintain the project's features, styles, and overall integrity.

## 🚀 Project Overview
Nite is a Discord bot management system with a high-performance, aesthetically pleasing online dashboard. It is built as a **Vanilla Web App** (no frameworks like React/Vue) to ensure speed and low overhead.

- **Main URL:** [nite.mingalabs.com](https://nite.mingalabs.com)
- **API URL:** `https://api.niteapiworker.workers.dev`
- **Tech Stack:** HTML5, CSS3 (Vanilla), JavaScript (ES6+), Cloudflare Workers (Backend).

## 📁 Key Files & Structure
- `index.html`: Entry point. Handles Discord OAuth login and server selection.
- `manage.html`: The main dashboard view where server-specific settings are edited.
- `style.css`: The "source of truth" for all styling. Contains custom animations and responsive rules.
- `script.js`: Logic for authentication and server list fetching/rendering.
- `settings.js`: **Core Logic.** Dynamically generates the dashboard UI based on a configuration file.
- `settings_config.json`: **UI Definition.** Determines which settings appear on the dashboard, their types (switch, select, etc.), and help text.
- `emoji_picker.js/.css`: Custom implementation of a Discord-style emoji picker.
- `embed_maker.html`: Standalone tool (iframe-compatible) for building Discord embeds.

## 🎨 Styling Guidelines (Keep the Vibe)
The project uses a **Discord-inspired Dark Mode**.
- **Palette:**
    - Background: `#2c2f33` (`--bg`)
    - Card: `#23272a` (`--card`)
    - Primary Button: `#5865F2` (`--btn`)
    - Success/Access: `#3ba55c` (`--acc`)
    - Danger: `#ed4245`
- **Animations:**
    - **Flying Cards:** When selecting a server, the card "flies" to the corner before navigating.
    - **Overshoot Glider:** Sidebar navigation has a "bouncy" glider (cubic-bezier) that follows the active tab.
    - **Sliding Panes:** Tabs slide up/down when switching.
- **Responsiveness:** Always test on mobile. Desktop uses a sidebar; mobile uses a different layout (e.g., floating cards move to the bottom).

## 🛠 Feature Knowledge
### 1. Dynamic Settings Generation
Instead of hardcoding every input, we use `settings_config.json`.
- **To add a setting:** Add an entry to the `settings` array in `settings_config.json`.
- **Types supported:** `switch`, `select`, `textarea`, `channelPick`, `dict` (for key-value pairs), `embedMaker`, `chatbotList`, `commandList`.

### 2. Command Permission System
Commands now use a `{command}_permissions` object instead of `{command}_enabled`.
- **Structure:** `{ roles: [], permissions: [], enabled: true }`.
- **Bulk Update:** Groups (like `/chatbot`) have a settings gear that can apply permissions to all sub-commands at once.
- **Saving:** During save, command permissions are sent in a separate `permissions` object in the POST body.

### 2. Welcome/Goodbye System
There are two systems. **Always ensure backward compatibility.**
- **Legacy:** `welcome_messages` (Array).
- **Advanced:** `welcome_goodbye_interactions` (Object).
- The dashboard should handle both appropriately (see `UPDATE.md` for migration logic).

### 3. Pattern Matching
Used in "Auto Reactions" and "Auto Replies".
- Supports Regex-like patterns (e.g., `(?i)text` for case-insensitivity).
- Includes special helpers like `\p{Extended_Pictographic}` for matching all emojis.

### 4. AI & Chatbots
- **Context:** AI picks up "Additional Context" for its personality.
- **Shared Memory:** Chatbots can be configured to "see" each other's messages.
- **Knowledge Base:** Custom entries (max 5) for bot-specific facts.

## ⚠️ Important Rules for Coding
1.  **No Frameworks:** Do not introduce React, Tailwind, or large libraries. Keep it Vanilla.
2.  **Dirty State:** Always call `markDirty()` when a user changes a setting. This triggers the "Unsaved Changes" popup.
3.  **HTML Escaping:** Use `escapeHtml()` or `escapeForHtml()` for any user-provided content reflected in the UI.
4.  **Animations:** Do not break the CSS transition logic. If adding a UI element, ensure it follows the existing animation patterns.
5.  **Backward Compatibility:** Never delete old setting keys from `settings_config.json` without ensuring the backend/bot can handle it.

## 🤖 AI Interaction Tips
- **Analyzing Styles:** Before changing a layout, check `style.css` for existing variable usage.
- **Adding Settings:** Only modify `settings_config.json` and the corresponding rendering logic in `settings.js` if a new input type is needed.
- **Debugging:** Most UI state is kept in `GLOBAL_SETTINGS`. Check console logs for API polling status.
