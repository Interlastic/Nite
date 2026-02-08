let notes=[{id:0,title:'Shopping List',content:'- Milk\n- Eggs\n- Bread\n- Butter\n- Cheese',date:'Today'},{id:1,title:'Meeting Notes',content:'Discussed Q4 goals.\n\n1. Review budget\n2. Schedule follow-up',date:'Yesterday'},{id:2,title:'Ideas',content:'- New app\n- Website redesign',date:'Monday'}]; let cni=null;
document.addEventListener('DOMContentLoaded',() => {loadNotes(); setupAutoSave(); setupCloseButton(); });
function loadNotes() {
    const s = localStorage.getItem('notes'); if(s) notes=JSON.parse(s); renderList();
}
function saveNotes() { localStorage.setItem('notes',JSON.stringify(notes)); }
function renderList() {
    const l = document.getElementById('notes-list'); l.innerHTML = '';
    notes.forEach(n => { const i = document.createElement('div'); i.className='note-item'; i.onclick=()=>openNote(n.id); i.innerHTML='<div class="note-title">'+(n.title||'Untitled')+'</div><div class="note-preview">'+n.content.substring(0,50)+'...</div><div class="note-date">'+n.date+'</div>'; l.appendChild(i); });
}
function createNote() {
    const nn={id:Date.now(),title:'',content:'',date:'Today'}; notes.unshift(nn); saveNotes(); openNote(nn.id);
}
function openNote(id) {
    cni=id; const n=notes.find(x=>x.id===id); if(n) { document.getElementById('note-title').value=n.title; document.getElementById('note-content').value=n.content; document.getElementById('note-date').textContent=n.date; }
    document.getElementById('notes-list-screen').classList.remove('active'); document.getElementById('note-editor-screen').classList.add('active');
}
function backToNotesList() { 
    saveCurrent(); 
    document.getElementById('notes-list-screen').classList.add('active'); 
    document.getElementById('note-editor-screen').classList.remove('active'); 
    renderList(); 
    cni=null; 
}
function saveCurrent() {
    if(cni===null) return; const n=notes.find(x=>x.id===cni); if(n) { n.title=document.getElementById('note-title').value; n.content=document.getElementById('note-content').value; saveNotes(); }
}
function setupAutoSave() {
    ['note-title','note-content'].forEach(id => { 
        const e=document.getElementById(id); 
        if(e) {
            e.addEventListener('input',saveCurrent);
            e.addEventListener('blur',saveCurrent);
        }
    });
}
function setupCloseButton() {
    const closeBtn = document.querySelector('#note-editor-screen .close-app');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeApp);
        closeBtn.addEventListener('click', backToNotesList);
    }
}
function deleteCurrentNote() {
    if(cni!==null && confirm('Delete?')) { notes=notes.filter(x=>x.id!==cni); saveNotes(); backToNotesList(); }
}
function closeApp() { saveCurrent(); window.location.href='index.html'; }