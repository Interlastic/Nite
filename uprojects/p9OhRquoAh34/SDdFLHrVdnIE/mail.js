let mails=[{id:0,sender:'Apple',avatar:'A',gradient:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',subject:'Your Apple ID was used',preview:'Your Apple ID was used to sign in...',body:'Your Apple ID was used to sign in to iCloud.',date:'10:30 AM',unread:true},{id:1,sender:'Newsletter',avatar:'N',gradient:'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',subject:'Weekly Digest',preview:'Here are this week\'s stories...',body:'Top stories this week:\n1. New features\n2. Industry news',date:'Yesterday',unread:true}]; let cmi=null;
document.addEventListener('DOMContentLoaded',() => renderList());
function renderList() {
    const l=document.getElementById('mail-list'); l.innerHTML='';
    mails.forEach(m => { const i=document.createElement('div'); i.className='mail-item '+(m.unread?'unread':''); i.onclick=()=>openMail(m.id);
        i.innerHTML='<div class="mail-avatar" style="background:'+m.gradient+';">'+m.avatar+'</div><div class="mail-content"><div class="mail-header"><span class="mail-sender">'+m.sender+'</span><span class="mail-date">'+m.date+'</span></div><div class="mail-subject">'+m.subject+'</div><div class="mail-preview">'+m.preview+'</div></div>'; l.appendChild(i);
    });
}
function openMail(id) {
    cmi=id; const m=mails.find(x=>x.id===id); if(m) {
        document.getElementById('mail-view-subject').textContent=m.subject; document.getElementById('mail-view-sender').textContent=m.sender;
        document.getElementById('mail-view-date').textContent=m.date; document.getElementById('mail-view-avatar').textContent=m.avatar; document.getElementById('mail-view-avatar').style.background=m.gradient; document.getElementById('mail-view-body').innerHTML=m.body.replace(/\n/g,'<br>');
        m.unread=false;
    }
    document.getElementById('mail-list-screen').classList.remove('active'); document.getElementById('mail-view-screen').classList.add('active');
}
function backToList() {
    document.getElementById('mail-list-screen').classList.add('active'); document.getElementById('mail-view-screen').classList.remove('active'); cmi=null; renderList();
}
function compose() { alert('Compose coming soon!'); }
function reply() { const m=mails.find(x=>x.id===cmi); if(m) alert('Replying to: '+m.sender); }
function deleteMail() {
    if(cmi!==null && confirm('Delete?')) { mails=mails.filter(x=>x.id!==cmi); backToList(); }
}
function closeApp() { window.location.href='index.html'; }
