import {uid,validateTransaction} from './domain.js';

export const DEMO_MONTH='2026-11';
export function ensureRequests(s){if(!Array.isArray(s.workRequests))s.workRequests=[];return s.workRequests;}
export function requestStatus(s,r){
  if(r.kind!=='expense')return '결과 준비';
  const t=s.transactions.find(t=>t.id===r.transactionId);
  if(!t)return '거래 확인 필요';
  return ({missing:'증빙 대기',review:'검토 대기',approved:'앱 승인 완료',rejected:'반려'})[t.status]||'확인 필요';
}
export function makeReport(s,kind='report'){
  if(!['report','scan'].includes(kind))throw Error('지원하지 않는 업무입니다.');
  const tx=s.transactions.filter(t=>t.date.startsWith(DEMO_MONTH));
  const categories={};for(const t of tx)categories[t.category]=(categories[t.category]||0)+t.amount;
  const r={id:uid(),kind,title:kind==='scan'?'증빙 누락과 검토 대기 점검':'11월 지출 보고서',createdAt:new Date().toISOString(),period:DEMO_MONTH,
    result:{total:tx.reduce((n,t)=>n+t.amount,0),count:tx.length,categories:Object.entries(categories).sort((a,b)=>b[1]-a[1]),
      missing:tx.filter(t=>!t.evidence||t.status==='missing').map(t=>({id:t.id,merchant:t.merchant,amount:t.amount,owner:t.owner})),
      pending:tx.filter(t=>t.status==='review').map(t=>({id:t.id,merchant:t.merchant,amount:t.amount,owner:t.owner})),
      transactions:tx.map(t=>({id:t.id,merchant:t.merchant,date:t.date,category:t.category,amount:t.amount,status:t.status}))}};
  ensureRequests(s).unshift(r);s.workRequests=s.workRequests.slice(0,50);return r;
}
export function requestExpense(s,fields){
  const transaction={id:uid(),merchant:fields.merchant.trim(),amount:Number(fields.amount),date:fields.date,owner:fields.owner.trim(),note:fields.note.trim(),category:'기타',evidence:false,status:'missing'};
  validateTransaction(transaction);
  if(!transaction.owner)throw Error('담당자를 입력해 주세요.');
  try{validateTransaction({merchant:'기한',amount:1,date:fields.due});}catch{throw Error('유효한 처리 기한을 입력해 주세요.');}
  const id=uid();
  const task={id:uid(),title:`${transaction.merchant} 비용과 증빙 확인`,owner:transaction.owner,due:fields.due,status:'예정',priority:'보통',tag:'비용 검토',sourceTransactionId:transaction.id,sourceRequestId:id,
    note:`요청 내용: ${transaction.note||'비용 검토'}\n거래일: ${transaction.date}\n금액: ${transaction.amount.toLocaleString('ko-KR')}원\n증빙이 없어 원본 제출이 필요합니다. 자료함 또는 거래 상세에서 원본을 연결한 뒤 검토해 주세요. 지급이나 ERP 반영은 실행되지 않습니다.`};
  const r={id,kind:'expense',title:`${transaction.merchant} 비용 검토 요청`,createdAt:new Date().toISOString(),transactionId:transaction.id,taskId:task.id};
  s.transactions.unshift(transaction);s.tasks.push(task);ensureRequests(s).unshift(r);s.workRequests=s.workRequests.slice(0,50);return r;
}
export const GUIDE_STEPS=[
  {id:'dashboard',title:'대시보드 읽기',route:'dashboard',action:'대시보드 살펴보기',description:'등록 지출은 월간 거래 합계, 검토 대기는 승인을 기다리는 거래, 누락 증빙은 원본이 없는 거래입니다. 다가오는 할 일에서 담당자와 기한을 확인하세요.'},
  {id:'report',title:'업무를 맡기고 보고서 받기',route:'dashboard',action:'지출 보고서 만들기',description:'대시보드의 업무 요청에서 ‘지출 보고서’를 누르세요. 현재 등록된 거래로 합계와 비용별 내역을 계산하고, 결과를 열거나 CSV로 받을 수 있습니다.'},
  {id:'expense',title:'새 비용 검토 요청하기',route:'dashboard',action:'비용 검토 요청하기',description:'‘비용 검토 요청’에서 거래처·금액·담당자·기한을 입력하세요. 비용 초안과 증빙 확인 업무가 함께 생성됩니다. 증빙이 없으면 자동 승인하지 않고 ‘증빙 대기’로 표시합니다.'},
  {id:'approve',title:'증빙을 보고 승인 기록하기',route:'approvals',action:'예시 거래 검토하기',description:'네이버클라우드 예시 거래를 열어 금액과 증빙 미리보기를 비교한 뒤 ‘내용 확인 후 승인’을 누르세요. 앱의 집계와 승인 상태가 바뀝니다. 실제 지급이나 장부 반영은 실행되지 않습니다.'}
];
export function guideDone(s,progress){return [!!progress.dashboardRead,ensureRequests(s).some(r=>r.kind==='report'),ensureRequests(s).some(r=>r.kind==='expense'),s.transactions.some(t=>t.id==='t1'&&t.status==='approved')];}
