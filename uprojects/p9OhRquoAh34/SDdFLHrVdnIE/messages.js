let currentConversation = null;
let conversations = {'John Doe': {avatar:'JD',gradient:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',messages:[{text:'Hey, how are you doing today?',sent:false,time:'10:30 AM'}]},'Sarah Miller': {avatar:'SM',gradient:'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',messages:[{text:'The meeting is at 3pm tomorrow',sent:false,time:'Yesterday'}]},'Alex Wilson': {avatar:'AW',gradient:'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',messages:[{text:'Thanks for the help!',sent:false,time:'Monday'}]}};
document.addEventListener('DOMContentLoaded',() => {initMessages();});
function initMessages() {
    const mi = document.getElementById('message-input'); const nmi = document.getElementById('new-message-input');
    if(mi) mi.addEventListener('keypress',e => {if(e.key === 'Enter') sendMessage();});
    if(nmi) nmi.addEventListener('keypress',e => {if(e.key === 'Enter') sendNewMessage();});
}
function openConversation(name,avatar) {
    currentConversation = name; document.getElementById('conv-name').textContent = name; document.getElementById('conv-avatar').textContent = avatar;
    const mc = document.getElementById('conversation-messages'); mc.innerHTML = '';
    if(conversations[name]) conversations[name].messages.forEach(msg => addMessageBubble(msg.text,msg.sent,msg.time));
    document.getElementById('messages-list-screen').classList.remove('active'); document.getElementById('conversation-screen').classList.add('active'); mc.scrollTop = mc.scrollHeight;
}
function backToList() {
    document.getElementById('messages-list-screen').classList.add('active'); document.getElementById('conversation-screen').classList.remove('active'); document.getElementById('new-message-screen').classList.remove('active'); currentConversation = null;
}
function showNewMessage() {
    document.getElementById('messages-list-screen').classList.remove('active'); document.getElementById('new-message-screen').classList.add('active');
}
function sendMessage() {
    const input = document.getElementById('message-input'); const text = input.value.trim(); if(!text) return;
    const now = new Date(); const time = now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
    addMessageBubble(text,true,time);
    if(conversations[currentConversation]) conversations[currentConversation].messages.push({text,sent:true,time});
    updateMessagePreview(currentConversation, text);
    input.value = ''; document.getElementById('conversation-messages').scrollTop = document.getElementById('conversation-messages').scrollHeight;
    setTimeout(() => simulateResponse(), 1000 + Math.random() * 1000);
}
function simulateResponse() {
    const responses = ['ok','Got it!','Alright','Sure','Okay','Fine','Thanks']; const response = responses[Math.floor(Math.random() * responses.length)];
    const now = new Date(); const time = now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
    addMessageBubble(response,false,time);
    if(conversations[currentConversation]) {
        conversations[currentConversation].messages.push({text:response,sent:false,time});
        updateMessagePreview(currentConversation, response);
    }
    document.getElementById('conversation-messages').scrollTop = document.getElementById('conversation-messages').scrollHeight;
}
function updateMessagePreview(name, latestText) {
    const items = document.querySelectorAll('.message-item');
    items.forEach(item => {
        const nameEl = item.querySelector('.message-name');
        if (nameEl && nameEl.textContent === name) {
            const previewEl = item.querySelector('.message-preview');
            const timeEl = item.querySelector('.message-time');
            if (previewEl) previewEl.textContent = latestText;
            if (timeEl) timeEl.textContent = 'Now';
            const list = document.getElementById('messages-list');
            list.insertBefore(item, list.firstChild);
        }
    });
}
function addMessageBubble(text,sent,time) {
    const mc = document.getElementById('conversation-messages'); const bubble = document.createElement('div'); bubble.className = 'message-bubble ' + (sent ? 'sent' : 'received');
    const td = document.createElement('div'); td.className = 'message-text'; td.textContent = text;
    const td2 = document.createElement('div'); td2.className = 'message-time'; td2.textContent = time;
    bubble.appendChild(td); bubble.appendChild(td2); mc.appendChild(bubble);
}
function sendNewMessage() {
    const to = document.getElementById('to-input').value.trim(); const text = document.getElementById('new-message-input').value.trim(); if(!to || !text) return;
    const avatar = to.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const nowTime = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
    conversations[to] = {avatar,gradient:'linear-gradient(135deg,hsl(' + Math.random()*360 + ',70%,60%) 0%,hsl(' + Math.random()*360 + ',70%,50%) 100%)',messages:[{text,sent:true,time:nowTime}]};
    const ml = document.getElementById('messages-list'); const item = document.createElement('div'); item.className = 'message-item'; item.onclick = () => openConversation(to,avatar);
    item.innerHTML = '<div class="message-avatar" style="background:' + conversations[to].gradient + ';">' + avatar + '</div><div class="message-content"><div class="message-header"><span class="message-name">' + to + '</span><span class="message-time">Now</span></div><div class="message-preview">' + text + '</div></div>';
    ml.insertBefore(item, ml.firstChild); document.getElementById('to-input').value = ''; document.getElementById('new-message-input').value = ''; backToList();
}
function closeApp() { window.location.href = 'index.html'; }