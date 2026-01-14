// --- EMOJI PICKER ---
let currentEmojiTarget = null;
let emojiModal = null;

function openEmojiPicker(btn) {
    currentEmojiTarget = btn.previousElementSibling; // The textarea
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

    let html = "";

    // 1. Custom Emojis
    const customFiltered = GLOBAL_EMOJIS.custom.filter(e => e.name.toLowerCase().includes(filter));
    if (customFiltered.length > 0) {
        html += `<div class="emoji-category-title">Server Emojis</div>`;
        html += `<div class="emoji-grid">`;
        customFiltered.forEach(e => {
            const format = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
            // Use image if available, else name
            const content = e.url ? `<img src="${e.url}" title="${e.name}" alt="${e.name}">` : `<span>${e.name}</span>`;
            html += `<div class="emoji-item" onclick="insertEmoji('${format}')">${content}</div>`;
        });
        html += `</div>`;
    }

    // 2. Unicode Emojis
    if (filter === "") {
        html += `<div class="emoji-category-title">Regular Emojis</div>`;
        html += `<div class="emoji-grid" style="font-size:1.5rem;">`;
        GLOBAL_EMOJIS.unicode.forEach(e => {
            html += `<div class="emoji-item" onclick="insertEmoji('${e}')">${e}</div>`;
        });
        html += `</div>`;
    } else {
        html += `<p style="color:#aaa; font-size:0.8rem; margin-top:20px;">(Unicode emojis hidden during search)</p>`;
    }

    container.innerHTML = html;
}

function insertEmoji(val) {
    if (currentEmojiTarget) {
        // Insert at cursor position
        const start = currentEmojiTarget.selectionStart;
        const end = currentEmojiTarget.selectionEnd;
        const text = currentEmojiTarget.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        currentEmojiTarget.value = before + val + after;
        currentEmojiTarget.selectionStart = currentEmojiTarget.selectionEnd = start + val.length;
        currentEmojiTarget.focus();
        // Trigger input event for auto-resize or save check
        currentEmojiTarget.dispatchEvent(new Event('input'));
    }
    closeEmojiModal();
}
