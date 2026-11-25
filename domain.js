export const STATES={review:{label:'검토 필요',tone:'warn'},missing:{label:'증빙 누락',tone:'danger'},approved:{label:'승인 완료',tone:''},rejected:{label:'반려',tone:'neutral'}};
export const TASK_STATES=['예정','진행 중','검토 대기','완료'];
export const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
export const uid=()=>globalThis.crypto.randomUUID();
export const seed=()=>({version:1,company:'주식회사 그로브',settings:{deadline:true,approval:true,digest:false},transactions:[
 {id:'t1',merchant:'네이버클라우드',category:'서비스 이용료',amount:285000,date:'2026-11-18',owner:'김민지',status:'review',note:'11월 클라우드 서버 이용료',evidence:true},
 {id:'t2',merchant:'오피스디포',category:'소모품비',amount:187500,date:'2026-11-18',owner:'박서준',status:'missing',note:'사무용품 구매 · 영수증 제출 필요',evidence:false},
 {id:'t3',merchant:'위워크 여의도',category:'지급임차료',amount:2420000,date:'2026-11-17',owner:'김민지',status:'review',note:'11월 사무실 임차료',evidence:true},
 {id:'t4',merchant:'스타벅스 여의도점',category:'회의비',amount:38500,date:'2026-11-17',owner:'이수현',status:'approved',note:'외부 파트너 미팅',evidence:true},
 {id:'t5',merchant:'피그마',category:'서비스 이용료',amount:168000,date:'2026-11-16',owner:'정도윤',status:'approved',note:'디자인팀 월간 구독',evidence:true},
 {id:'t6',merchant:'카카오 T',category:'여비교통비',amount:24600,date:'2026-11-16',owner:'박서준',status:'missing',note:'고객사 방문 택시비',evidence:false},
 {id:'t7',merchant:'우아한형제들',category:'복리후생비',amount:96200,date:'2026-11-14',owner:'이수현',status:'review',note:'프로젝트 야근 식대',evidence:true},
 {id:'t8',merchant:'AWS',category:'서비스 이용료',amount:624000,date:'2026-11-13',owner:'김민지',status:'approved',note:'개발 환경 인프라',evidence:true},
 {id:'t9',merchant:'쿠팡',category:'소모품비',amount:214000,date:'2026-11-11',owner:'박서준',status:'approved',note:'모니터 암 및 멀티탭',evidence:true},
 {id:'t10',merchant:'서울교통공사',category:'여비교통비',amount:55400,date:'2026-11-09',owner:'이수현',status:'approved',note:'법인 교통카드 충전',evidence:true},
 {id:'t11',merchant:'노션',category:'서비스 이용료',amount:152000,date:'2026-11-06',owner:'정도윤',status:'approved',note:'팀 문서 도구',evidence:true},
 {id:'t12',merchant:'그린프린트',category:'광고선전비',amount:418000,date:'2026-11-03',owner:'김민지',status:'approved',note:'기업 소개서 인쇄',evidence:true}
 ],tasks:[
 {id:'k1',title:'11월 법인카드 증빙 대조',owner:'김민지',due:'2026-11-20',status:'진행 중',priority:'높음',note:'증빙이 누락된 거래 2건의 원본을 확인해 주세요.',tag:'월말 마감'},
 {id:'k2',title:'오피스디포 영수증 제출 요청',owner:'박서준',due:'2026-11-18',status:'진행 중',priority:'높음',note:'사무용품 구매 영수증 확인',tag:'증빙 관리'},
 {id:'k3',title:'사무실 임차료 지출 검토',owner:'김민지',due:'2026-11-19',status:'검토 대기',priority:'보통',note:'위워크 청구 내역과 계약 조건 확인',tag:'지출 검토'},
 {id:'k4',title:'11월 매입 세금계산서 수집',owner:'이수현',due:'2026-11-23',status:'예정',priority:'보통',note:'거래처별 세금계산서를 요청하고 수집합니다.',tag:'월말 마감'},
 {id:'k5',title:'정기 구독 내역 정리',owner:'정도윤',due:'2026-11-17',status:'완료',priority:'보통',note:'사용 중인 구독 도구와 비용 정리 완료',tag:'비용 관리'},
 {id:'k6',title:'10월 거래 자료 보관',owner:'김민지',due:'2026-11-16',status:'완료',priority:'보통',note:'검토 완료 자료 폴더 정리',tag:'자료 관리'},
 {id:'k7',title:'거래처 지급 예정표 작성',owner:'김민지',due:'2026-11-25',status:'예정',priority:'보통',note:'승인이 필요한 지급 건을 구분합니다.',tag:'지급 관리'}
 ],documents:[{id:'d1',name:'네이버클라우드_11월_청구서.pdf',date:'2026-11-18',type:'청구서',transaction:'t1',sample:true},{id:'d2',name:'위워크_11월_임차료.pdf',date:'2026-11-17',type:'청구서',transaction:'t3',sample:true},{id:'d3',name:'스타벅스_회의비_영수증.png',date:'2026-11-17',type:'영수증',transaction:'t4',sample:true},{id:'d4',name:'피그마_구독_영수증.pdf',date:'2026-11-16',type:'영수증',transaction:'t5',sample:true}],audit:[],messages:[],meeting:'',meetingTasks:[],meetingCreated:[],readAlerts:[],lastSaved:null});
export function metrics(s){const tx=s.transactions.filter(t=>t.date.startsWith('2026-11'));return{total:tx.reduce((n,t)=>n+t.amount,0),pending:tx.filter(t=>t.status==='review'),missing:tx.filter(t=>t.status==='missing'),approved:tx.filter(t=>t.status==='approved'),done:s.tasks.filter(t=>t.status==='완료').length};}
export function approveTransaction(s,id){const t=s.transactions.find(t=>t.id===id);if(!t)throw Error('거래를 찾을 수 없습니다.');if(!t.evidence||t.status==='missing')throw Error('증빙을 먼저 등록해 주세요.');if(t.status!=='review')throw Error('검토가 필요한 거래만 승인할 수 있습니다.');t.status='approved';return t;}
export function validateTransaction(t){if(!t.merchant?.trim())throw Error('거래처를 입력해 주세요.');if(!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>100000000000)throw Error('금액은 1원 이상 1,000억 원 이하의 정수로 입력해 주세요.');if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||(Number.isNaN(Date.parse(t.date+'T00:00:00Z'))||new Date(t.date+'T00:00:00Z').toISOString().slice(0,10)!==t.date))throw Error('유효한 거래일을 입력해 주세요.');}
export function answerLocal(q,s){const m=metrics(s);if(/누락|영수증|증빙/.test(q))return {text:m.missing.length?`증빙이 누락된 거래는 ${m.missing.length}건, 총 ${won(m.missing.reduce((n,t)=>n+t.amount,0))}입니다.\n${m.missing.map(t=>`${t.merchant} · ${won(t.amount)} · 담당 ${t.owner}`).join('\n')}\n거래를 열어 증빙을 등록하면 검토할 수 있습니다.`:'현재 등록된 거래에 증빙 누락이 없습니다.',ids:m.missing.map(t=>t.id)};
 if(/승인|검토/.test(q))return{text:m.pending.length?`검토가 필요한 거래는 ${m.pending.length}건, 총 ${won(m.pending.reduce((n,t)=>n+t.amount,0))}입니다.\n${m.pending.map(t=>`${t.merchant} · ${won(t.amount)} · ${t.category}`).join('\n')}\n검토와 승인 화면에서 확인할 수 있습니다. 실제 계좌 이체나 ERP 반영은 실행되지 않습니다.`:'현재 승인 대기 거래가 없습니다.',ids:m.pending.map(t=>t.id)};
 if(/할 일|마감|업무|진행/.test(q)){const tasks=s.tasks.filter(t=>t.status!=='완료').sort((a,b)=>a.due.localeCompare(b.due));return{text:`진행 중인 업무는 ${tasks.length}건입니다.\n${tasks.slice(0,5).map(t=>`${t.due.slice(5).replace('-','/')} · ${t.title} · ${t.owner} (${t.status})`).join('\n')}\n업무 보드에서 담당자와 진행 상태를 변경할 수 있습니다.`,ids:[]};}
 if(/지출|금액|얼마|비용|이번 달/.test(q)){const groups={};s.transactions.filter(t=>t.date.startsWith('2026-11')).forEach(t=>groups[t.category]=(groups[t.category]||0)+t.amount);return{text:`등록된 2026년 11월 거래 ${s.transactions.filter(t=>t.date.startsWith('2026-11')).length}건의 지출 합계는 ${won(m.total)}입니다.\n${Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} · ${won(v)}`).join('\n')}\n승인 여부와 관계없이 등록된 거래를 합산한 값입니다.`,ids:s.transactions.filter(t=>t.date.startsWith('2026-11')).slice(0,3).map(t=>t.id)};}
 const match=s.transactions.filter(t=>q.includes(t.merchant));if(match.length)return{text:match.map(t=>`${t.date} ${t.merchant}\n금액 ${won(t.amount)} · ${t.category} · ${STATES[t.status].label}\n${t.note}`).join('\n\n'),ids:match.map(t=>t.id)};
 return{text:'현재는 등록된 데이터의 지출 합계, 증빙 누락, 승인 대기, 업무 현황에 답할 수 있는 규칙 기반 도우미입니다. “이번 달 지출 알려줘” 또는 “승인할 거래 보여줘”라고 입력해 보세요. 외부 자료 검색과 자유로운 AI 답변은 모델 연동 후 사용할 수 있습니다.',ids:[]};}
