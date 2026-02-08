let cv='0', pv=null, op=null, sr=false;
document.addEventListener('DOMContentLoaded',() => {updateDisplay();});
function inputNum(n) {
    if(sr) { cv=n; sr=false; } else { if(cv==='0' && n!=='.') cv=n; else if(cv.length<9) cv+=n; } updateDisplay();
}
function inputDec() {
    if(sr) { cv='0.'; sr=false; } else if(!cv.includes('.')) cv+='.'; updateDisplay();
}
function setOp(o) {
    if(op && !sr) calc(); pv=parseFloat(cv); op=o; sr=true;
}
function calc() {
    if(!op || pv===null) return; const cur=parseFloat(cv); let res;
    switch(op) { case '+': res=pv+cur; break; case '-': res=pv-cur; break; case '*': res=pv*cur; break; case '/': if(cur===0) res='Error'; else res=pv/cur; break; }
    cv=res==='Error'?'Error':parseFloat(res.toPrecision(12)).toString(); pv=null; op=null; sr=true; updateDisplay();
}
function clearAll() { cv='0'; pv=null; op=null; sr=false; updateDisplay(); }
function toggleSign() { if(cv!=='0' && cv!=='Error') { cv=cv.startsWith('-')?cv.substring(1):'-'+cv; updateDisplay(); } }
function inputPercent() { if(cv!=='Error') { cv=(parseFloat(cv)/100).toString(); updateDisplay(); } }
function updateDisplay() {
    const d = document.getElementById('calculator-display');
    if(cv==='Error') d.textContent='Error';
    else { let dv=cv; if(dv!=='0' && !dv.includes('Error')) { const p=dv.split('.'); p[0]=parseFloat(p[0]).toLocaleString('en-US'); dv=p.join('.'); }
        if(dv.length>9) dv=parseFloat(dv.replace(/,/g,'')).toExponential(2); d.textContent=dv;
    }
}
function closeApp() { window.location.href = 'index.html'; }
