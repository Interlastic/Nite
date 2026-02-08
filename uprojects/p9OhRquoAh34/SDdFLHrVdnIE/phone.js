let phoneNumber = '';
let callTimer = null;
let callDuration = 0;

document.addEventListener('DOMContentLoaded', () => {
    initPhoneKeypad();
    initTabs();
});

function initPhoneKeypad() {
    document.querySelectorAll('.keypad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            phoneNumber += value;
            updateDisplay();
        });
    });
    document.getElementById('delete-btn').addEventListener('click', () => {
        phoneNumber = phoneNumber.slice(0, -1);
        updateDisplay();
    });
    document.getElementById('call-btn').addEventListener('click', () => {
        if (phoneNumber.length > 0) startCall(phoneNumber);
    });
}

function initTabs() {
    document.querySelectorAll('.phone-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.phone-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(tabName + '-content').classList.remove('hidden');
        });
    });
}

function updateDisplay() {
    const display = document.getElementById('phone-display');
    const callBtn = document.getElementById('call-btn');
    if (phoneNumber.length > 0) {
        display.textContent = formatPhoneNumber(phoneNumber);
        callBtn.disabled = false;
    } else {
        display.textContent = '';
        callBtn.disabled = true;
    }
}

function formatPhoneNumber(num) {
    if (num.length <= 3) return num;
    if (num.length <= 6) return '(' + num.slice(0,3) + ') ' + num.slice(3);
    return '(' + num.slice(0,3) + ') ' + num.slice(3,6) + '-' + num.slice(6,10);
}

function startCall(nameOrNumber) {
    const callScreen = document.getElementById('call-screen');
    const callName = document.getElementById('call-name');
    const callStatus = document.getElementById('call-status');
    const callAvatar = document.getElementById('call-avatar');
    if (nameOrNumber.includes('(')) {
        callName.textContent = nameOrNumber;
        callAvatar.textContent = '?';
    } else {
        callName.textContent = nameOrNumber;
        callAvatar.textContent = nameOrNumber.split(' ').map(n => n[0]).join('').substring(0, 2);
    }
    callStatus.textContent = 'Calling...';
    callScreen.classList.add('active');
    let ringCount = 0;
    callTimer = setInterval(() => {
        ringCount++;
        callStatus.textContent = ringCount % 2 === 0 ? 'Calling...' : 'Ringing...';
        if (ringCount >= 20) {
            clearInterval(callTimer);
            callStatus.textContent = 'No Answer';
            setTimeout(() => endCall(), 2000);
        }
    }, 1000);
}

function endCall() {
    if (callTimer) clearInterval(callTimer);
    document.getElementById('call-screen').classList.remove('active');
    phoneNumber = '';
    updateDisplay();
}

function toggleMute() { event.currentTarget.classList.toggle('active'); }
function toggleSpeaker() { event.currentTarget.classList.toggle('active'); }
function closeApp() { window.location.href = 'index.html'; }
