// --- SHARED EMOJI PICKER ---
let currentEmojiTarget = null;
let emojiModal = null;

function openEmojiPicker(btn) {
    if (!btn) {
        console.error("openEmojiPicker: No button passed");
        return;
    }
    // The target is usually the previous element (textarea or input)
    // In embed_maker, it might be slightly different or passed explicitly.
    // For dict rows: btn.previousElementSibling is the textarea.
    currentEmojiTarget = btn.previousElementSibling;

    // If not found (e.g. nested in a wrapper), look for the closest relevant input
    if (!currentEmojiTarget || !(currentEmojiTarget.tagName === 'TEXTAREA' || currentEmojiTarget.tagName === 'INPUT')) {
        // Try finding input inside the same wrapper first
        if (btn.parentElement) {
            currentEmojiTarget = btn.parentElement.querySelector('textarea, input');
        }
    }

    if (!currentEmojiTarget) {
        console.error("openEmojiPicker: Could not find target input");
        return;
    }

    if (!emojiModal) {
        createEmojiModal();
    }
    renderEmojiContent();
    emojiModal.classList.add('show');
}

function createEmojiModal() {
    emojiModal = document.createElement('div');
    emojiModal.id = 'emoji-modal';
    emojiModal.className = 'modal';
    emojiModal.innerHTML = `
        <div class="modal-content emoji-modal-content">
            <span class="close-btn" onclick="closeEmojiModal()">&times;</span>
            <h3 id="modalTitle">Select Emoji</h3>
            <input type="text" id="emoji-search" class="styled-input" placeholder="Search emojis..." style="margin-bottom:15px;">
            <div id="emoji-grid-container" class="emoji-grid-container">
                <!-- Content injected here -->
            </div>
        </div>
    `;
    document.body.appendChild(emojiModal);

    // Search listener
    document.getElementById('emoji-search').addEventListener('input', (e) => {
        renderEmojiContent(e.target.value.toLowerCase());
    });

    emojiModal.addEventListener('click', (e) => {
        if (e.target === emojiModal) closeEmojiModal();
    });
}

function closeEmojiModal() {
    if (emojiModal) emojiModal.classList.remove('show');
    currentEmojiTarget = null;
    const search = document.getElementById('emoji-search');
    if (search) search.value = "";
}

function renderEmojiContent(filter = "") {
    const container = document.getElementById('emoji-grid-container');
    if (!container) return;

    // Get emojis from local global or parent if available
    let emojis = { custom: [], unicode: {} };

    // Try finding GLOBAL_EMOJIS
    if (typeof window.GLOBAL_EMOJIS !== 'undefined') {
        emojis = window.GLOBAL_EMOJIS;
    } else if (typeof GLOBAL_EMOJIS !== 'undefined') {
        emojis = GLOBAL_EMOJIS;
    } else if (typeof parent !== 'undefined' && typeof parent.GLOBAL_EMOJIS !== 'undefined') {
        emojis = parent.GLOBAL_EMOJIS;
    } else if (typeof parent !== 'undefined' && typeof parent.window.GLOBAL_EMOJIS !== 'undefined') {
        emojis = parent.window.GLOBAL_EMOJIS;
    }

    let html = "";

    // 1. Custom Emojis
    if (emojis.custom && emojis.custom.length > 0) {
        const customFiltered = emojis.custom.filter(e => e.name.toLowerCase().includes(filter));
        if (customFiltered.length > 0) {
            html += `<div class="emoji-category-title">Server Emojis</div>`;
            html += `<div class="emoji-grid">`;
            customFiltered.forEach(e => {
                const format = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
                const content = e.url ? `<img src="${e.url}" title="${e.name}" alt="${e.name}">` : `<span>${e.name}</span>`;
                html += `<div class="emoji-item" onclick="insertEmoji('${format}')">${content}</div>`;
            });
            html += `</div>`;
        }
    }

    // 2. Unicode Emojis
    if (emojis.unicode) {
        // Handle optional categories or flat list? Original was categories.
        const categories = Object.keys(emojis.unicode);
        categories.forEach(cat => {
            const list = emojis.unicode[cat];
            const filtered = list.filter(e => {
                if (!filter) return true;
                // If we have keywords, search them
                if (typeof EMOJI_KEYWORDS !== 'undefined' && EMOJI_KEYWORDS[e]) {
                    return EMOJI_KEYWORDS[e].toLowerCase().includes(filter);
                } else if (typeof parent !== 'undefined' && typeof parent.EMOJI_KEYWORDS !== 'undefined' && parent.EMOJI_KEYWORDS[e]) {
                    return parent.EMOJI_KEYWORDS[e].toLowerCase().includes(filter);
                }
                return false;
            });

            if (filtered.length > 0) {
                html += `<div class="emoji-category-title">${cat}</div>`;
                html += `<div class="emoji-grid" style="font-size:1.5rem;">`;
                filtered.forEach(e => {
                    html += `<div class="emoji-item" onclick="insertEmoji('${e}')">${e}</div>`;
                });
                html += `</div>`;
            }
        });
    }

    if (!html && filter) {
        html = `<p style="color:#aaa; font-size:0.8rem; margin-top:20px; text-align:center;">No emojis found for "${filter}"</p>`;
    }

    container.innerHTML = html;
}

function insertEmoji(val) {
    if (currentEmojiTarget) {
        const start = currentEmojiTarget.selectionStart;
        const end = currentEmojiTarget.selectionEnd;
        const text = currentEmojiTarget.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        currentEmojiTarget.value = before + val + after;
        currentEmojiTarget.selectionStart = currentEmojiTarget.selectionEnd = start + val.length;
        currentEmojiTarget.focus();
        currentEmojiTarget.dispatchEvent(new Event('input'));
    }
    closeEmojiModal();
}

// Explicitly attach to window
window.openEmojiPicker = openEmojiPicker;
window.closeEmojiPicker = closeEmojiModal;
window.insertEmoji = insertEmoji;
