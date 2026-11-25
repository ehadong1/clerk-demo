import {ensureMailState,MAIL_STATUSES,MAIL_TYPES,receiveDemoMail,processMail,sendDemoReply,completeMailReview,updateMailConfig} from './mail-domain.js';

export function installMailUI(ctx) {
  const {getState,esc,icon,render,modal,closeModal,toast,save,log}=ctx;
  let folder='all',selected=null,query='';
  const state=()=>getState();
  const mail=()=>ensureMailState(state());
  const tag=(label,tone='')=>`<span class="mail-status ${tone}">${esc(label)}</span>`;
  const date=at=>new Date(at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'});
  const button=(text,action,primary=false,disabled=false)=>`<button type="button" class="mail-button ${primary?'solid':''}" data-mail-action="${action}" ${disabled?'disabled':''}>${text}</button>`;
  function listItems(){const m=mail();return folder==='sent'?m.outbox.filter(x=>x.status==='sent'):m.inbox.filter(x=>folder==='all'||(folder==='pending'?x.status==='received'||x.status==='review':folder==='draft'?x.status==='draft':x.status==='done'));}
  function detail(item){
    if(!item)return `<div class="mail-empty">${icon('mail',36)}<h2>메일에서 업무가 시작됩니다</h2><p>메일을 선택하면 지시 내용과 처리 과정,<br>연결된 업무와 답장 초안을 확인할 수 있어요.</p></div>`;
    const m=mail();const sent=folder==='sent';const incoming=sent?m.inbox.find(x=>x.id===item.mailId):item;
    const draft=sent?item:m.outbox.find(x=>x.id===item.outboxId);
    return `<div class="mail-detail-head"><div class="mail-tag-row">${tag(sent?'데모 발신 기록':MAIL_TYPES[item.type]||'메일','neutral')}${sent?tag('실제 발송 아님','warn'):tag(...MAIL_STATUSES[item.status])}</div><h2>${esc(item.subject)}</h2><div class="mail-address"><b>${esc(sent?m.config.name:item.sender)}</b> &lt;${esc(sent?item.from:item.from)}&gt;<br><span>받는 사람: ${esc(item.to)} · ${date(item.at)}</span></div></div><div class="mail-original">${esc(item.body)}</div>${sent?'':`<div class="mail-section"><div class="mail-section-heading">${icon('spark',19)}<h3>클러크 처리 결과</h3></div><p class="mail-result">${esc(item.result||'아직 처리하지 않은 메일입니다. 처리하면 분류 결과와 연결된 업무가 여기에 표시됩니다.')}</p><div class="mail-controls">${item.status==='received'?button('이 메일 처리','process:'+item.id,true):''}${item.status==='review'?button('담당자 확인 완료','resolve:'+item.id):''}${(item.taskIds||[]).map(id=>`<button class="mail-button" data-task="${id}">${icon('task',16)} 연결된 업무 열기</button>`).join('')}</div></div>`}
    ${draft&&!sent?`<div class="mail-section mail-draft"><div class="mail-section-heading">${icon('send',18)}<h3>${draft.status==='sent'?'데모 답장 기록':'답장 초안'}</h3>${tag(draft.status==='sent'?'실제 발송 아님':'검토 후 기록','warn')}</div><p class="mail-subtle">받는 사람: ${esc(draft.to)} · ${esc(draft.subject)}</p>${draft.status==='sent'?`<div class="mail-original">${esc(draft.body)}</div>`:`<form id="mail-reply-form" data-reply-id="${draft.id}"><label class="mail-label" for="mail-reply-body">답장 내용</label><textarea id="mail-reply-body" name="body" maxlength="16000" required>${esc(draft.body)}</textarea><div class="mail-controls"><button class="mail-button" type="submit">초안 저장</button>${button('검토 후 데모 발신','send:'+draft.id,true)}</div><p class="mail-subtle">발신함에 기록하는 데모입니다. 실제 Gmail로 보내지 않습니다.</p></form>`}</div>`:''}
    ${incoming?`<div class="mail-section"><h3 class="mail-small-heading">처리 이력</h3>${m.events.filter(e=>e.mailId===incoming.id).map(e=>`<div class="mail-history"><span>${date(e.at)}</span><p>${esc(e.text)}</p></div>`).join('')||'<p class="mail-subtle">아직 처리 이력이 없습니다.</p>'}</div>`:''}`;
  }
  function view(){
    const m=mail();const items=listItems().filter(x=>!query||(x.subject+x.body+x.from).toLowerCase().includes(query.toLowerCase()));
    if(!selected||!items.some(x=>x.id===selected))selected=items[0]?.id||null;
    const item=items.find(x=>x.id===selected);if(item&&folder!=='sent')item.read=true;
    const todo=m.inbox.filter(x=>x.status==='received').length;
    const counts={all:m.inbox.length,pending:m.inbox.filter(x=>['received','review'].includes(x.status)).length,draft:m.inbox.filter(x=>x.status==='draft').length,done:m.inbox.filter(x=>x.status==='done').length,sent:m.outbox.filter(x=>x.status==='sent').length};
    return `<div class="page-heading"><div><div class="eyebrow">YOUR AI COLLEAGUE, BY EMAIL</div><h1>AI 직원 메일함</h1><p>메일로 지시하고, 접수된 업무와 처리 결과를 한곳에서 확인하세요.</p></div><div class="heading-actions">${button('메일 계정 설정','settings')}${button('테스트 메일 보내기','receive',true)}</div></div>
    <section class="mail-identity"><div class="mail-identity-icon">${icon('mail',27)}</div><div class="mail-identity-copy"><h2>${esc(m.config.name)}</h2><p>${m.config.address?esc(m.config.address):'회사 메일 주소 미정'} <span>Google Workspace</span></p></div>${tag('Gmail 미연결','warn')}<button class="mail-link" data-mail-action="settings">연결 준비</button></section>
    <div class="mail-mode"><b>메일 업무 처리 체험</b><p>아래 메일은 예시와 테스트 입력입니다. 실제 Gmail 수신·발신이나 앱을 닫은 뒤의 처리는 아직 연결되지 않았습니다. 자동 처리는 허용된 발신자의 업무 등록·현황 집계·답장 초안까지만 수행합니다.</p></div>
    <div class="mail-overview"><div><strong>${counts.pending}</strong><span>확인할 메일</span></div><div><strong>${m.inbox.reduce((n,x)=>n+x.taskIds.length,0)}</strong><span>등록된 업무</span></div><div><strong>${counts.draft}</strong><span>답장 검토</span></div><div><strong>${counts.done}</strong><span>메일 처리 완료</span></div><div class="mail-automation"><span>${m.config.autoProcess?'새 테스트 메일 자동 처리 켜짐':'새 테스트 메일 수동 처리'}</span>${button(`${todo}건 일괄 처리`,'batch',false,!todo)}</div></div>
    <div class="mail-inbox-shell"><div class="mail-inbox-toolbar"><div class="mail-folders">${[['all','받은 메일'],['pending','확인 필요'],['draft','답장 검토'],['done','처리 완료'],['sent','데모 발신함']].map(([key,title])=>`<button class="mail-folder ${folder===key?'active':''}" data-mail-folder="${key}">${title}<span>${counts[key]}</span></button>`).join('')}</div><label class="mail-search">${icon('search',17)}<input id="mail-search" aria-label="메일 검색" value="${esc(query)}" placeholder="메일 검색"></label></div><div class="mail-columns"><div class="mail-list" aria-label="메일 목록">${items.map(x=>`<button class="mail-row ${selected===x.id?'selected':''}" data-mail-select="${x.id}" aria-pressed="${selected===x.id}"><div class="mail-row-top"><strong>${esc(folder==='sent'?x.to:x.sender)}</strong><time>${date(x.at)}</time></div><h3>${esc(x.subject)}</h3><p>${esc(x.body.slice(0,90))}</p><div>${folder==='sent'?tag('데모 발신됨','neutral'):tag(...MAIL_STATUSES[x.status])}${x.taskIds?.length?tag('업무 연결','neutral'):''}</div></button>`).join('')||'<div class="mail-empty"><p>해당하는 메일이 없습니다.</p></div>'}</div><article class="mail-detail">${detail(item)}</article></div></div>`;
  }
  function settings(){const c=mail().config;modal('AI 직원 메일 계정',`<div class="mail-settings"><p class="mail-explainer">Google Workspace에서 AI 직원 전용 계정을 만든 뒤 연결합니다. 여기에서 주소를 저장해도 Google 계정이 생성되거나 Gmail과 연결되지는 않습니다.</p><form id="mail-settings-form"><div class="field"><label>AI 직원 이름</label><input name="name" value="${esc(c.name)}" maxlength="40" required></div><div class="field"><label>사용 예정 회사 메일 주소</label><input name="address" type="email" value="${esc(c.address)}" placeholder="아직 미정이면 비워 두세요"><small>예: ai-finance@회사도메인 · 비밀번호는 입력하지 않습니다.</small></div><div class="field"><label>업무 지시를 허용할 발신자</label><textarea name="trusted" rows="3" maxlength="13000">${esc(c.trusted.join('\n'))}</textarea><small>한 줄에 메일 주소 하나씩 입력하세요. .example 주소는 체험용 가상 주소입니다.</small></div><label class="mail-check"><input name="autoProcess" type="checkbox" ${c.autoProcess?'checked':''}><span>새 테스트 메일 접수 시 자동 분류하고 허용된 업무 처리</span></label><label class="mail-check"><input name="autoReply" type="checkbox" ${c.autoReply?'checked':''}><span>허용된 발신자에게 데모 답장 자동 기록</span></label><p class="mail-subtle">자동 답장도 실제로 전송되지 않습니다. 계좌 변경·송금·민감 정보 요청은 자동 처리에서 제외합니다.</p><button class="mail-button solid" type="submit">계정과 처리 규칙 저장</button></form><div class="mail-setup-steps"><h3>실제 Gmail 연결에 필요한 단계</h3><ol><li>Google 관리 콘솔에서 전용 메일 사용자와 라이선스 준비</li><li>회사 관리자가 Gmail API 접근 범위와 인증 허용</li><li>서버에 인증 정보와 토큰을 안전하게 저장</li><li>새 메일 알림·처리 대기열·답장 전송 연결 후 검증</li></ol><p>기존 직원의 별칭 주소는 별도 메일함과 권한을 만들지 않습니다. 전용 계정 또는 격리된 접근 범위로 구성합니다.</p></div></div>`);}
  function receive(){const c=mail().config;modal('테스트 메일로 업무 지시',`<form id="mail-receive-form" class="mail-compose"><p class="mail-explainer">AI 직원에게 메일이 도착했을 때의 흐름을 체험합니다. 이 입력은 현재 앱에만 저장되며 Gmail로 전송되지 않습니다.</p><div class="field"><label>받는 사람</label><input value="${esc(c.address||'clerk@grove.example')}" disabled></div><div class="field"><label>보내는 사람</label><input name="from" type="email" value="${esc(c.trusted[0]||'ceo@grove.example')}" maxlength="254" required></div><div class="field"><label>제목</label><input name="subject" maxlength="200" value="이번 달 지출 현황을 정리해 주세요" required></div><div class="field"><label>업무 지시 내용</label><textarea name="body" rows="5" maxlength="12000" required>이번 달 지출 현황을 정리해서 회신해 주세요.</textarea></div><button class="mail-button solid" type="submit">테스트 메일 접수</button><p class="mail-subtle">현황 조회, 업무 등록, 증빙 확인을 규칙으로 분류합니다. 자연어 해석용 외부 AI는 미연결입니다.</p></form>`);}
  document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;const d=el.dataset;
    if(d.mailSelect){selected=d.mailSelect;render();save();return;}
    if(d.mailFolder){folder=d.mailFolder;selected=null;render();save();return;}
    if(!d.mailAction)return;
    const [action,id]=d.mailAction.split(':');
    try{
      if(action==='settings')return settings();
      if(action==='receive')return receive();
      if(action==='process'){processMail(state(),id);log('메일 처리 · '+mail().inbox.find(x=>x.id===id).subject);render();toast('메일 처리 결과를 확인해 주세요.');}
      if(action==='batch'){for(const x of [...mail().inbox])if(x.status==='received')processMail(state(),x.id);log('메일 일괄 분류와 업무 처리');render();toast('미처리 메일의 분류와 처리 결과를 저장했습니다.');}
      if(action==='resolve'){completeMailReview(state(),id);log('메일 담당자 확인 완료');render();toast('메일 확인을 완료했습니다. 실제 요청을 실행한 것은 아닙니다.');}
      if(action==='send'){
        const out=mail().outbox.find(x=>x.id===id);
        const text=document.querySelector('#mail-reply-body');
        if(text&&text.value!==out.body)throw Error('수정한 답장을 먼저 저장해 주세요.');
        sendDemoReply(state(),id);log('데모 답장 기록 · 실제 이메일 전송 없음');render();toast('데모 발신함에 기록했습니다. 실제 이메일은 발송되지 않았습니다.');
      }
    }catch(err){toast(err.message);}
  });
  document.addEventListener('submit',e=>{const form=e.target;if(!form.id.startsWith('mail-'))return;e.preventDefault();const data=Object.fromEntries(new FormData(form));
    try{
      if(form.id==='mail-settings-form'){updateMailConfig(state(),data);log('AI 직원 메일 계정과 데모 규칙 저장');closeModal();render();toast('연결 준비 정보를 저장했습니다. 실제 Gmail은 미연결입니다.');}
      if(form.id==='mail-receive-form'){const r=receiveDemoMail(state(),data);selected=r.mail.id;folder='all';log('테스트 메일 접수 및 처리');closeModal();render();toast('테스트 메일을 접수했습니다. 처리 결과를 확인해 주세요.');}
      if(form.id==='mail-reply-form'){const out=mail().outbox.find(x=>x.id===form.dataset.replyId);if(!out||out.status!=='draft')throw Error('수정할 수 있는 초안이 아닙니다.');if(!data.body.trim())throw Error('답장 내용을 입력해 주세요.');out.body=data.body.trim();log('메일 답장 초안 수정');render();toast('답장 초안을 저장했습니다.');}
    }catch(err){toast(err.message);}
  });
  document.addEventListener('input',e=>{if(e.target.id!=='mail-search')return;query=e.target.value;const pos=e.target.selectionStart;render();const input=document.querySelector('#mail-search');input.focus();input.setSelectionRange(pos,pos);});
  return {view};
}
