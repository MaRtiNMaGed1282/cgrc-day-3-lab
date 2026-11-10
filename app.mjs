import { pair,sources,nodes,sections,freshState,hydrate,signature,lastRun,invalidateLaunch,configure,scenarioSteps,completeRun,mappingValid,mappedCount,reconciliation,rollback,planChecks,gates,launch,planText,instruction,debrief } from './model.mjs';

const STORAGE='cgrc-day3-workspace-v2:'+new URL('.',location.href).pathname;
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=freshState(), durable=true;
try { state=hydrate(JSON.parse(localStorage.getItem(STORAGE))); } catch { durable=false; }
let current=1, selectedSource='CL-07', selectedStage=0, player=null, toastTimer;
const t=(en,ar)=>state.lang==='ar'?ar:en;
const l=value=>value&&typeof value==='object'?value[state.lang]:value;
const E=value=>esc(l(value));
const reduceMotion=()=>state.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
const mono=value=>`<bdi class="mono">${esc(value)}</bdi>`;
const button=(action,label,kind='primary',extra='')=>`<button type="button" class="button ${kind}" data-action="${action}" ${extra}>${label}</button>`;
const goto=(id,label,kind='secondary')=>`<a class="button ${kind}" href="#/${id}">${label}</a>`;
const status=(value,label)=>`<span class="status ${value}">${label??(value==='pass'?t('Verified','تم التحقق'):value==='fail'?t('Failed','إخفاق'):t('Pending','قيد الانتظار'))}</span>`;
const field=(id,label,options,value,help='')=>`<label class="field" for="${id}">${label}<select id="${id}" name="${id}">${options.map(([key,en,ar])=>`<option value="${key}" ${value===key?'selected':''}>${esc(t(en,ar))}</option>`).join('')}</select>${help?`<small>${help}</small>`:''}</label>`;
const ownerOptions=[['','Choose an owner','اختر المسؤول'],['payroll','Payroll Manager','مدير الرواتب'],['identity','Identity Operations','عمليات الهوية'],['compliance','Compliance Lead','مسؤول الامتثال']];
const controlOptions=[['','Choose a control','اختر الضابط'],['offboard','Two-system access removal','إلغاء الوصول في النظامين'],['approval','Role approval before access','اعتماد الدور قبل منح الوصول'],['retain','Controlled evidence retention','الاحتفاظ المضبوط بالأدلة']];
const evidenceOptions=[['','Choose evidence','اختر الدليل'],['logs','HR notice and two removal logs','إخطار المغادرة وسجلّا الإلغاء'],['ticket','Approved access ticket','تذكرة وصول معتمدة'],['index','Evidence index and retention record','فهرس الأدلة وسجل الاحتفاظ']];

function save() {
  try { localStorage.setItem(STORAGE,JSON.stringify(state)); durable=true; } catch { durable=false; }
  $('save-state').textContent=durable?t('Work is saved in this browser. Export the team record before changing device.','يُحفظ عملك في هذا المتصفح. نزّل سجل الفريق قبل تغيير الجهاز.'):t('Browser storage is unavailable. Keep this tab open and export your work.','التخزين في المتصفح غير متاح. احتفظ بالصفحة مفتوحة ونزّل عملك.');
  $('case-status').className='status-summary'+(state.launch?' ready':'');
  $('case-status').innerHTML=`<span>${t('Launch decision','قرار الإطلاق')}</span><strong>${state.launch?t('Approved','معتمد'):t('On hold','مؤجّل')}</strong>`;
}
function toast(message) {
  $('announcement').textContent=message;
  $('announcement').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('announcement').classList.remove('visible'),4400);
}
function feedback(message,good=false) {
  const target=$('activity-feedback');
  if(target) { target.className='feedback '+(good?'good':'error');target.textContent=message;target.hidden=false; }
  toast(message);
}
function checklist(checks,links=false) {
  return `<ul class="checklist">${checks.map(c=>`<li class="${c.pass?'done':''}"><span class="check-icon" aria-hidden="true">${c.pass?'✓':'○'}</span><span class="label">${E(c.label)} ${status(c.pass?'pass':'pending')}${links&&!c.pass?` <a href="#/${c.id}">${t('Open task','افتح المهمة')}</a>`:''}</span></li>`).join('')}</ul>`;
}
function explanation(id) {
  return `<details class="explanation" ${id===1||matchMedia('(min-width: 651px)').matches?'open':''}><summary>${t('Purpose and instructions','الشرح وخطوات العمل')}</summary><p>${E(instruction[id])}</p></details>`;
}
function icon(id) {
  const paths={
    people:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-4a7 7 0 0 1 14 0v4M3 9a3 3 0 0 0 0 6M21 9a3 3 0 0 1 0 6"/>',
    check:'<path d="m5 12 4 4L20 5M20 12v8H4V4h10"/>',
    key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9M16 16l3-3M19 19l3-3"/>',
    cloud:'<path d="M6 18a5 5 0 0 1 0-10 6 6 0 0 1 12 0 5 5 0 0 1 0 10ZM8 13h8"/>',
    server:'<rect x="3" y="3" width="18" height="8" rx="1"/><rect x="3" y="13" width="18" height="8" rx="1"/><path d="M7 7h1M11 7h6M7 17h1M11 17h6"/>',
    folder:'<path d="M3 6h7l2 3h9v12H3ZM3 6V3h7l2 3h9v3M7 14h10M7 17h7"/>'
  };
  return paths[id]||paths.folder;
}
const coords={hr:[82,180],approval:[257,180],iam:[432,180],cloud:[615,79],legacy:[615,281],evidence:[811,180]};
const routes={
  hr:'M 10 180 L 12 180', approval:'M 153 180 L 186 180',iam:'M 328 180 L 361 180',
  cloud:'M 503 180 C 540 180 514 79 544 79',legacy:'M 503 180 C 540 180 514 281 544 281',
  evidence:'M 686 281 C 730 281 704 180 740 180'
};
function mapHTML(events=[]) {
  const seen=new Map(events.map(e=>[e.node,e.status]));
  const nodeStatus=id=>seen.get(id)==='fail'?'failed':seen.get(id)==='pass'?'visited':'';
  const graph=nodes.map(n=>{
    const [x,y]=coords[n.id];
    const excluded=current===8&&!state.scope.includes(n.id);
    return `<g class="map-node ${nodeStatus(n.id)} ${state.selectedNode===n.id?'selected':''} ${excluded?'excluded':''}" role="button" tabindex="0" aria-pressed="${state.selectedNode===n.id}" aria-label="${E(n.name)}" data-node="${n.id}" transform="translate(${x} ${y})">
      <rect class="box" x="-71" y="-49" width="142" height="98" rx="7"/>
      <g class="map-icon" transform="translate(-13 -36) scale(1.08)">${icon(n.icon)}</g>
      <text y="10" text-anchor="middle" font-size="14" font-weight="600">${E(n.name)}</text>
      <text y="31" text-anchor="middle" class="node-state">${esc(n.sub)}</text>
    </g>`;
  }).join('');
  return `<svg class="system-map" viewBox="0 0 900 355" aria-label="${t('Payroll system and removal workflow','نظام الرواتب ومسار إلغاء الوصول')}" role="group">
    <defs><marker id="route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="#496a8c"/></marker></defs>
    <text x="615" y="15" font-size="11" text-anchor="middle" fill="#b3c4db">${t('Two systems in scope','نظامان ضمن النطاق')}</text>
    ${Object.entries(routes).filter(([key])=>key!=='hr').map(([key,d])=>`<path id="route-${key}" class="route" d="${d}" marker-end="url(#route-arrow)"/>`).join('')}
    <path class="route" d="M686 79 C730 79 704 180 740 180" marker-end="url(#route-arrow)"/>
    ${graph}<circle id="packet" class="packet" r="7" cx="82" cy="180" visibility="hidden"/>
  </svg>
  <div class="mobile-flow">${nodes.map(n=>`<button class="mobile-node ${nodeStatus(n.id)} ${state.selectedNode===n.id?'selected':''} ${current===8&&!state.scope.includes(n.id)?'excluded':''}" aria-pressed="${state.selectedNode===n.id}" data-node="${n.id}"><strong>${E(n.name)}</strong><span>${esc(n.sub)}</span></button>`).join('')}</div>`;
}
function inspectorHTML() {
  const n=nodes.find(x=>x.id===state.selectedNode)||nodes[2];
  return `<aside class="inspector"><h2>${E(n.name)}</h2>${mono(n.sub)}<dl><dt>${t('Purpose','الغرض')}</dt><dd>${E(n.role)}</dd><dt>${t('Responsible team','الفريق المسؤول')}</dt><dd>${E(n.owner)}</dd><dt>${t('Expected evidence','الدليل المتوقع')}</dt><dd>${E(n.evidence)}</dd></dl></aside>`;
}
function overview() {
  const run=lastRun(state);
  return `<div class="workspace"><section class="panel"><div class="panel-head"><h2>${t('One departure. Two payroll systems.','مغادرة واحدة ونظامان للرواتب')}</h2>${status(run?(run.pass?'pass':'fail'):'pending')}</div>${mapHTML(run?.events)}<p class="muted small">${t('Select a component to inspect its role and evidence. The cloud platform is in pilot and the legacy database remains accessible.','اختر مكوّنًا لفحص دوره وأدلته. النظام السحابي قيد التجربة وقاعدة البيانات القديمة ما زالت متاحة.')}</p><div class="actions">${goto(2,t('Start the case','ابدأ الحالة'),'primary')}${goto(4,t('Open the simulator','افتح المحاكاة'))}</div></section>${inspectorHTML()}</div>
    <div class="trace">${[
      pair('Read the obligation and build its mapping.','اقرأ الالتزام وابنِ خريطة تنفيذه.'),
      pair('Test the migration and justify the launch.','اختبر الترحيل وبرّر قرار الإطلاق.'),
      pair('Prepare and review the security plan.','أعدّ خطة الأمن وراجعها.'),
      pair('Control the documents and preserve evidence.','اضبط الوثائق واحفظ الأدلة.')
    ].map((x,i)=>`<div class="trace-item"><h3>${t('Lecture','المحاضرة')} ${i+5}</h3><p>${E(x)}</p></div>`).join('')}</div>`;
}
function sourceExplorer() {
  const s=sources.find(x=>x.id===selectedSource);
  return `<div class="workspace wide-inspector"><section class="document"><div class="doc-meta">${mono(s.id)} · ${E(s.type)}</div><h2>${E(s.title)}</h2><p>${E(s.text)}</p><h3>${t('Scope','النطاق')}</h3><p>${E(s.scope)}</p><div class="line"></div><p class="small">${t('Applicability note: these sources govern this fictional payroll service. A real legal applicability decision needs the entity, jurisdictions, processing purpose and supplier locations.','ملاحظة الانطباق: تحكم هذه المصادر خدمة الرواتب الافتراضية. يتطلب القرار القانوني الفعلي معرفة الكيان والاختصاصات وغرض المعالجة ومواقع الموردين.')}</p></section><aside class="panel"><h2>${t('Source files','ملفات المصادر')}</h2><div class="list-select">${sources.map(x=>`<button data-source="${x.id}" aria-pressed="${selectedSource===x.id}"><strong>${mono(x.id)} · ${E(x.title)}</strong><small>${E(x.type)} ${state.sourceRead.includes(x.id)?'✓':''}</small></button>`).join('')}</div><div class="actions">${button('read-source',t('Record source review','سجّل مراجعة المصدر'))}</div><p class="muted small" style="margin-top:14px">${t('All contract periods in this lab are fictional.','جميع المهل التعاقدية في المختبر افتراضية.')}</p></aside></div>`;
}
function register() {
  const m=state.maps[selectedSource]||{};
  return `<section class="panel"><div class="panel-head"><h2>${t('Obligations and traceability','الالتزامات وإمكانية التتبّع')}</h2>${status(mappedCount(state)===3?'pass':'pending',`${mappedCount(state)} / 3 ${t('mapped correctly','روابط صحيحة')}`)}</div><div class="table-wrap"><table><thead><tr><th>${t('Source','المصدر')}</th><th>${t('Obligation','الالتزام')}</th><th>${t('Accountable owner','المسؤول')}</th><th>${t('Mapping','الربط')}</th></tr></thead><tbody>${sources.map(s=>`<tr class="selectable ${selectedSource===s.id?'selected':''}"><td>${button('edit-map',mono(s.id),'secondary',`data-id="${s.id}"`)}</td><td>${E(s.title)}</td><td>${state.maps[s.id]?.owner?esc(l(ownerOptions.find(o=>o[0]===state.maps[s.id].owner)?pair(...ownerOptions.find(o=>o[0]===state.maps[s.id].owner).slice(1)):pair('Unknown','غير محدد'))):'—'}</td><td>${status(mappingValid(state.maps[s.id],s)?'pass':state.maps[s.id]?'fail':'pending')}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel"><h2>${t('Build the mapping','بناء الربط')} · ${mono(selectedSource)}</h2><p class="muted">${E(sources.find(x=>x.id===selectedSource).text)}</p><form id="mapping-form"><div class="form-grid">${field('map-owner',t('Accountable owner','صاحب المسؤولية'),ownerOptions,m.owner)}${field('map-control',t('Control','الضابط'),controlOptions,m.control)}${field('map-evidence',t('Evidence','الدليل'),evidenceOptions,m.evidence)}</div><div class="actions"><button class="button primary">${t('Save mapping','احفظ الربط')}</button></div></form><div id="activity-feedback" hidden></div></section>`;
}
function simulation() {
  const events=lastRun(state)?.events||[];
  return `<section class="panel">
    <div class="scenario-config"><label class="check-label"><input type="checkbox" id="include-legacy" ${state.config.legacy?'checked':''}>${t('Include legacy removal','تفعيل خطوة إلغاء النظام القديم')}</label><label class="check-label"><input type="checkbox" id="late-removal" ${state.config.delay?'checked':''}>${t('Delay legacy removal until Tuesday 11:00','تأخير إلغاء القديم إلى الثلاثاء 11:00')}</label></div>
    <div class="sim-toolbar">${button('sim-play',t('Play scenario','تشغيل السيناريو'))}${button('sim-pause',t('Pause','إيقاف مؤقت'),'secondary')}${button('sim-next',t('Next step','الخطوة التالية'),'secondary')}${button('sim-reset',t('Replay from start','إعادة من البداية'),'secondary')}<label class="speed" for="sim-speed">${t('Speed','السرعة')}<select id="sim-speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div>
    <div class="sim-workspace"><div>${mapHTML(events)}</div><section class="sim-reader">
      <div id="sim-detail" class="sim-detail" role="status"></div>
      <h3>${t('Event record','سجل الأحداث')}</h3><div id="sim-log" class="log"></div>
    </section></div>
  </section><div style="margin-top:20px">${inspectorHTML()}</div>`;
}
const stages=[
  [pair('Plan','التخطيط'),pair('Define the service, data flows, source obligations and system boundary. Both systems stay in scope during reconciliation.','حدّد الخدمة وتدفقات البيانات ومصادر الالتزامات وحدود النظام. يبقى النظامان في النطاق أثناء المطابقة.'),pair('Obligations register and scope record','سجل الالتزامات وتحديد النطاق')],
  [pair('Build','التنفيذ'),pair('Configure the workflow and the transitional legacy task. Assign the control owner and record where evidence will be stored.','اضبط الإجراء وخطوة النظام القديم الانتقالية. حدّد مسؤول الضابط ومكان حفظ الأدلة.'),pair('Workflow configuration and draft SSP','إعداد الإجراء ومسودة خطة الأمن')],
  [pair('Assess','التقييم'),pair('Run the removal test, reconcile migration records and test rollback. A missing result remains an open verification gap.','نفّذ اختبار الإلغاء ومطابقة سجلات الترحيل والتراجع. تبقى النتيجة المفقودة فجوة تحقق مفتوحة.'),pair('Removal, reconciliation and rollback results','نتائج الإلغاء والمطابقة والتراجع')],
  [pair('Launch','الإطلاق'),pair('The simulated launch authority reviews the evidence and approved procedure. The checklist below checks the actual work in this lab.','تراجع جهة الإطلاق المحاكاة الأدلة والإجراء المعتمد. تفحص القائمة أدناه عملك الفعلي داخل المختبر.'),pair('Decision and supporting evidence','القرار وأدلته')],
  [pair('Retire','الإيقاف'),pair('After launch and reconciliation, archive required records, check holds, remove remaining access and preserve the disposition record.','بعد الإطلاق والمطابقة، أرشف السجلات المطلوبة وراجع التحفظات وألغِ الوصول المتبقي واحفظ سجل التصرف.'),pair('Archive, access closure and disposition record','سجلات الأرشيف وإغلاق الوصول والتصرف')]
];
function lifecycle() {
  const s=stages[selectedStage];
  return `<section class="panel"><div class="stage-tabs">${stages.map((x,i)=>`<button data-stage="${i}" class="${i===selectedStage?'active':''}" aria-pressed="${i===selectedStage}">${E(x[0])}<small>${i+1} / 5</small></button>`).join('')}</div><h2>${E(s[0])}</h2><p>${E(s[1])}</p><p class="muted small">${t('Stage evidence','دليل المرحلة')} · ${E(s[2])}</p></section><section class="panel"><div class="panel-head"><h2>${t('Launch gate','شروط اعتماد الإطلاق')}</h2>${status(state.launch?'pass':'pending',state.launch?t('Launch approved','تم اعتماد الإطلاق'):t('Approval on hold','الموافقة مؤجّلة'))}</div>${checklist(gates(state),true)}<div class="actions">${button('launch',t('Review and approve launch','راجع واعتمد الإطلاق'))}${button('hold',t('Record a hold','سجّل التأجيل'),'secondary')}</div><div id="activity-feedback" hidden></div></section>`;
}
function tests() {
  const rec=state.tests.reconcile,back=state.tests.rollback,observed=reconciliation(state);
  return `<section class="panel"><h2>${t('Data reconciliation','مطابقة البيانات')}</h2><p class="muted">${t('The migration transfer is missing the final two records. Repairing the transfer changes the destination dataset. The test still needs to run again.','أغفل النقل آخر سجلين. يغيّر إصلاح النقل بيانات الوجهة، ويجب إعادة الاختبار للتحقق من النتيجة.')}</p><div class="test-counts"><div><strong>${observed.expected.toLocaleString('en')}</strong><span>${t('Source records','سجلات المصدر')}</span></div><div><strong>${observed.observed.toLocaleString('en')}</strong><span>${t('Destination records','سجلات الوجهة')}</span></div><div><strong>${observed.unmatched.length}</strong><span>${t('Unmatched records','سجلات غير مطابقة')}</span></div></div>
      <label class="check-label"><input type="checkbox" id="fix-transfer" ${state.reconcileFixed?'checked':''}>${t('Retransfer the two missing records','إعادة نقل السجلين الناقصين')}</label>
      <div class="actions">${button('test-reconcile',t('Run reconciliation','شغّل اختبار المطابقة'))}${status(rec?(rec.pass?'pass':'fail'):'pending')}</div><div id="reconcile-result" class="feedback" ${rec?'':'hidden'}>${rec?esc(l(rec.message)):''}</div></section>
    <section class="panel"><h2>${t('Rollback drill','تدريب التراجع')}</h2><p class="muted">${t('Simulate a failed migration. Choose a snapshot, restore the test baseline and compare every record with the original.','حاكِ فشل الترحيل. اختر نسخة، واستعد البيانات الاختبارية، وقارن كل سجل بالأصل.')}</p>
    <div class="form-grid">${field('rollback-snapshot',t('Snapshot for recovery','نسخة الاستعادة'),[['approved','Approved baseline · 1,000 records','النسخة المرجعية المعتمدة · ١٠٠٠ سجل'],['incomplete','Partial migration copy · 998 records','نسخة ترحيل جزئية · ٩٩٨ سجلًا']],state.rollbackSnapshot)}</div>
    <div class="workflow" id="test-pipeline">${[pair('Snapshot','نسخة مرجعية'),pair('Failed change','تغيير فاشل'),pair('Restore','استعادة'),pair('Verify','تحقق')].map((x,i)=>`<div class="workflow-step ${back&&i<3?'done':back?.pass?'done':back&&i===3?'blocked':''}" data-pipe="${i}">${E(x)}</div>`).join('')}</div><div class="actions">${button('test-rollback',t('Run rollback drill','شغّل تدريب التراجع'))}${status(back?(back.pass?'pass':'fail'):'pending')}</div><div id="rollback-result" class="feedback" ${back?'':'hidden'}>${back?esc(l(back.message)):''}</div></section>`;
}
function retirement() {
  const r=state.retirement;
  const checks=[
    {pass:state.launch,label:pair('Launch is approved','الإطلاق معتمد')},
    {pass:state.tests.reconcile?.pass&&state.reconcileFixed,label:pair('Migration reconciles successfully','المطابقة ناجحة')},
    {pass:r.archived,label:pair('Required records are archived','السجلات المطلوبة مؤرشفة')},
    {pass:r.access,label:pair('Legacy access is revoked','الوصول القديم مُلغى')},
    {pass:r.disposed,label:pair('Disposition record is complete','سجل التصرف مكتمل')}
  ];
  return `<div class="workspace"><section class="panel"><h2>${t('Controlled retirement','الإيقاف المضبوط')}</h2>${checklist(checks)}<label class="check-label"><input type="checkbox" id="retention-hold" ${r.hold?'checked':''}>${t('A retention hold is active','يوجد أمر تحفظ نشط')}</label><p class="muted small">${t('In this exercise, a hold preserves the retained copy and blocks disposal. Revoking operational access is still possible.','يحفظ أمر التحفظ النسخة المحتفظ بها ويمنع إتلافها في التدريب. يظل إلغاء الوصول التشغيلي ممكنًا.')}</p><div class="actions">${button('archive',t('Archive required records','أرشف السجلات'))}${button('revoke',t('Revoke legacy access','ألغِ وصول القديم'),'secondary')}${button('dispose',t('Record secure disposition','وثّق التصرف الآمن'),'secondary')}</div><div id="activity-feedback" hidden></div></section><aside class="inspector"><h2>${t('Required sequence','التسلسل المطلوب')}</h2><p class="small">${t('Approval and reconciliation precede retirement. Archive first. Verify access closure. Dispose only when retention duties and holds allow it.','يسبق الاعتماد والمطابقة الإيقاف. تبدأ العملية بالأرشفة ثم التحقق من إغلاق الوصول. يُسمح بالتصرف وفق التزامات الاحتفاظ وأوامر التحفظ.')}</p>${goto(14,t('Review launch readiness','راجع جاهزية الإطلاق'))}</aside></div>`;
}

function boundary() {
  return `<div class="workspace"><section class="panel"><h2>${t('Security plan boundary','حدود خطة أمن النظام')}</h2>${mapHTML(lastRun(state)?.events)}<div class="line"></div><div class="form-grid">${nodes.map(n=>`<label class="check-label"><input type="checkbox" data-scope="${n.id}" ${state.scope.includes(n.id)?'checked':''}>${E(n.name)}</label>`).join('')}</div><div class="feedback ${state.scope.includes('cloud')&&state.scope.includes('legacy')?'good':'error'}">${state.scope.includes('cloud')&&state.scope.includes('legacy')?t('Both payroll environments are included. Now assign their implementation responsibilities in the SSP.','تشمل الحدود بيئتَي الرواتب. حدّد الآن مسؤوليات التنفيذ في الخطة.'):t('The case still uses both payroll environments. Excluding either leaves the current boundary incomplete.','ما زالت الحالة تستخدم بيئتَي الرواتب. استبعاد أي منهما يجعل الحدود الحالية ناقصة.')}</div></section>${inspectorHTML()}</div>`;
}
function planBuilder() {
  const s=state.ssp;
  return `<div class="workspace wide-inspector"><section class="panel"><h2>${t('Access removal control entry','وصف ضابط إلغاء الوصول')}</h2><div class="form-grid">
    ${field('ssp-owner',t('Accountable owner','المسؤول عن النتيجة'),ownerOptions,s.owner)}
    ${field('ssp-trigger',t('Trigger','الحدث المحفّز'),[['','Choose the trigger','اختر الحدث'],['hr','Effective HR departure notice','إخطار مغادرة ساري من الموارد البشرية'],['monthly','Monthly review only','مراجعة شهرية فقط']],s.trigger)}
    ${field('ssp-systems',t('Systems covered','الأنظمة المشمولة'),[['both','Cloud and legacy payroll','السحابي والقديم'],['cloud','Cloud payroll only','السحابي فقط']],s.systems)}
    ${field('ssp-deadline',t('Removal deadline','مهلة الإلغاء'),[['1','Same time on the next working day','الوقت نفسه من يوم العمل التالي'],['2','Two working days','يوما عمل']],s.deadline)}
    ${field('ssp-evidence',t('Evidence reference','مرجع الدليل'),[['','Choose evidence coverage','اختر تغطية الدليل'],['all','HR notice, cloud log and legacy log','الموارد البشرية وسجلّا النظامين'],['cloud','Cloud log only','السجل السحابي فقط']],s.evidence)}
    ${field('ssp-status',t('Implementation status','حالة التنفيذ'),[['partial','Partial / verification gap','جزئي / فجوة تحقق'],['verified','Verified in the current test','تم التحقق في الاختبار الحالي']],s.status)}
    </div><div class="actions">${goto(10,t('Review the plan','راجع الخطة'),'primary')}</div></section><aside><div class="document"><div class="doc-meta">SSP-04 · ${t('Working preview','معاينة العمل')}</div><h2>${t('Access control implementation','تنفيذ ضابط الوصول')}</h2><p id="plan-preview">${esc(planText(state,state.lang))}</p><p class="small">${t('Operators: Identity Operations and legacy operations. Evidence belongs in the controlled case ticket.','المنفذون: عمليات الهوية وتشغيل النظام القديم. تُحفظ الأدلة في تذكرة الحالة المضبوطة.')}</p></div><div class="feedback">${t('The preview reflects your selections. The review screen checks consistency with the case.','تعكس المعاينة اختياراتك. تفحص شاشة المراجعة اتساقها مع الحالة.')}</div></aside></div>`;
}
function planReview() {
  const checks=planChecks(state);
  return `<div class="workspace"><section class="panel"><div class="panel-head"><h2>${t('Plan review checklist','قائمة مراجعة الخطة')}</h2>${status(state.ssp.reviewed?'pass':'pending',state.ssp.reviewed?t('Review recorded','المراجعة مسجّلة'):t('Review required','تحتاج إلى مراجعة'))}</div>${checklist(checks)}<div class="actions">${button('review-plan',t('Record plan review','سجّل مراجعة الخطة'))}${goto(9,t('Edit the entry','عدّل الوصف'))}</div><div id="activity-feedback" hidden></div></section><aside class="inspector"><h2>${t('Implementation evidence','دليل التنفيذ')}</h2><p class="small">${lastRun(state)?(lastRun(state).pass?t('The latest test passed for cloud and legacy.','نجح آخر اختبار في النظامين.'):t('The latest test contains a failed legacy step.','يتضمن آخر اختبار إخفاق خطوة النظام القديم.')):t('No completed test matches the current configuration.','لا يوجد اختبار مكتمل يطابق الإعداد الحالي.')}</p><p class="muted small">${t('A plan can accurately describe a partially implemented control. A new test or configuration change requires a new plan review.','يمكن أن تصف الخطة ضابطًا منفذًا جزئيًا بدقة. يلزم تجديد المراجعة بعد اختبار جديد أو تغيير الإعداد.')}</p>${goto(4,t('Inspect the test','افحص الاختبار'))}</aside></div>`;
}
function library() {
  const published=state.procedure==='v3';
  return `<div class="comparison"><section class="document"><div class="doc-meta">PROC-02 v2 · ${published?t('Superseded and retained','مستبدَل مع الاحتفاظ'):t('Approved and effective','معتمد وسارٍ')}</div><h2>${t('Version 2 baseline','الإصدار الثاني المرجعي')}</h2><p>${t('Identity Operations removes cloud and legacy payroll access by the same time on the next working day following an effective HR departure notice.','يلغي فريق عمليات الهوية الوصول إلى النظامين بحلول الوقت نفسه من يوم العمل التالي لإخطار المغادرة الساري.')}</p><p>${t('The Payroll Manager owns the requirement. Each case links the HR notice and the two removal records.','يتولى مدير الرواتب مسؤولية المتطلب. تربط كل حالة إخطار المغادرة بسجلَي الإلغاء.')}</p><p class="small">${t('Version owner: Identity Operations. Approved by the Payroll Manager.','مسؤول الإصدار: عمليات الهوية. الاعتماد من مدير الرواتب.')}</p></section>
    <section class="document"><div class="doc-meta">PROC-02 v3 · ${published?t('Published','منشور'):t('Draft awaiting review','مسودة تنتظر المراجعة')}</div><h2>${published?t('Effective revision','الإصدار الساري'):t('Proposed revision','التعديل المقترح')}</h2>
    ${published?`<p>${t('The published revision retains the CL-07 deadline and covers removal from both systems.','يحافظ الإصدار المنشور على مهلة البند CL-07 ويغطي الإلغاء في النظامين.')}</p><p>${esc(state.draft.reason)}</p>`:`<p>${t('The initial proposal extends the deadline to','يمدّد الاقتراح الأول المهلة إلى')} <mark class="change">${t('two working days','يومَي عمل')}</mark>.</p><p>${t('This conflicts with CL-07. Revise the draft before review and publication. A document version cannot alter a signed customer obligation.','يتعارض ذلك مع البند CL-07. عدّل المسودة قبل المراجعة والنشر. لا يغيّر إصدار الوثيقة التزامًا موقعًا مع العميل.')}</p>`}
    <div class="actions">${goto(12,t('Open the approval workflow','افتح مسار الاعتماد'),'primary')}</div></section></div>
    <section class="panel"><h2>${t('Controlled document register','سجل الوثائق المضبوطة')}</h2><div class="table-wrap"><table><thead><tr><th>${t('Document','الوثيقة')}</th><th>${t('Version','الإصدار')}</th><th>${t('Status','الحالة')}</th><th>${t('Owner / authoritative location','المسؤول / مكان الحفظ')}</th></tr></thead><tbody>
    <tr><td>PROC-02</td><td>v2</td><td>${status(state.procedure==='v3'?'pending':'pass',state.procedure==='v3'?t('Superseded, retained','مستبدَل مع الاحتفاظ'):t('Effective','سارٍ'))}</td><td>${t('Identity Operations / Controlled procedures','عمليات الهوية / الإجراءات المضبوطة')}</td></tr>
    <tr><td>PROC-02</td><td>v3</td><td>${status(published?'pass':'pending',published?t('Effective','سارٍ'):t('Draft','مسودة'))}</td><td>${published?t('Identity Operations / Controlled procedures','عمليات الهوية / الإجراءات المضبوطة'):t('Identity Operations / Revision workspace','عمليات الهوية / مساحة التعديلات')}</td></tr>
    <tr><td>SSP-04</td><td>v1</td><td>${status(state.ssp.reviewed?'pass':'pending',state.ssp.reviewed?t('Reviewed','تمت المراجعة'):t('Working draft','مسودة عمل'))}</td><td>${t('System owner / System plans','مالك النظام / خطط الأنظمة')}</td></tr>
    <tr><td>CL-07 / CL-12</td><td>v1</td><td>${status('pass',t('Signed case contract','عقد الحالة الموقّع'))}</td><td>${t('Compliance Lead / Contract register','مسؤول الامتثال / سجل العقود')}</td></tr>
    </tbody></table></div></section>`;
}
function workflow() {
  const d=state.draft,locked=d.stage===4;
  return `<section class="panel"><h2>${t('Procedure revision workspace','مساحة تعديل الإجراء')}</h2><form id="draft-form"><fieldset ${locked?'disabled':''} style="border:0;padding:0;margin:0"><div class="form-grid">
    ${field('draft-deadline',t('Proposed deadline','المهلة المقترحة'),[['1','Same time on the next working day','الوقت نفسه من يوم العمل التالي'],['2','Two working days','يوما عمل']],d.deadline)}
    ${field('draft-owner',t('Procedure operator','الفريق المنفذ'),[['identity','Identity Operations','عمليات الهوية'],['compliance','Compliance Lead','مسؤول الامتثال']],d.owner)}
    <label class="field" for="draft-reason">${t('Change rationale','مبرر التغيير')}<textarea id="draft-reason" maxlength="800" rows="3">${esc(d.reason)}</textarea><small>${t('Explain the legacy step, deadline and evidence change.','وضّح تغيير خطوة النظام القديم والمهلة والأدلة.')}</small></label>
    </div></fieldset></form><div class="document-track" aria-hidden="true"><span id="document-token" style="left:${state.lang==='ar'?87.5-25*Math.min(d.stage,3):12.5+25*Math.min(d.stage,3)}%"><svg width="22" height="22" viewBox="0 0 24 24">${icon('folder')}</svg></span></div><div class="workflow doc-workflow">${[pair('Draft','مسودة'),pair('Review','مراجعة'),pair('Approval','اعتماد'),pair('Publication','نشر')].map((s,i)=>`<div class="workflow-step ${d.stage>i?'done':d.stage===i?'current':''}" data-doc-stage="${i}">${E(s)}</div>`).join('')}</div>
    <p class="muted small">${t('Review role: Compliance Lead. Approval role: Payroll Manager. Publication role: document controller. These are simulated training roles.','دور المراجعة لمسؤول الامتثال، والاعتماد لمدير الرواتب، والنشر لمسؤول ضبط الوثائق. جميعها أدوار محاكاة تدريبية.')}</p>
    <div class="actions">${button('advance-doc',d.stage===0?t('Submit for review','قدّم للمراجعة'):d.stage===1?t('Record simulated approval','سجّل الاعتماد المحاكى'):d.stage===2?t('Prepare publication','جهّز النشر'):d.stage===3?t('Publish the effective version','انشر النسخة السارية'):t('Version 3 is effective','الإصدار الثالث سارٍ'),'primary',locked?'disabled':'')}</div><div id="activity-feedback" hidden></div></section>
    <section class="document"><div class="doc-meta">PROC-02 v3 · ${locked?t('Effective revision','الإصدار الساري'):t('Draft preview','معاينة المسودة')}</div><p>${d.deadline==='1'?t('Identity Operations removes access to cloud and legacy payroll by the same time on the next working day.','يلغي فريق عمليات الهوية الوصول إلى الرواتب السحابي والقديم بحلول الوقت نفسه من يوم العمل التالي.'):t('The proposed two-working-day deadline conflicts with CL-07.','تتعارض مهلة يومَي العمل المقترحة مع البند CL-07.')}</p><p>${t('Rationale','المبرر')} · <span id="draft-reason-preview">${esc(d.reason)||t('Not yet recorded.','لم يُسجّل بعد.')}</span></p></section>`;
}
const historicalEvidence=[
  ['HR-041',pair('HR departure notice','إخطار المغادرة'),pair('Monday 09:00. Account EMP-204. The same time on the next working day is Tuesday 09:00.','الاثنين 09:00. الحساب EMP-204. تنتهي المهلة الثلاثاء 09:00.')],
  ['CLD-201',pair('Cloud removal log','سجل الإلغاء السحابي'),pair('Monday 16:10. Access removed for EMP-204.','الاثنين 16:10. أُلغي وصول الحساب EMP-204.')],
  ['LEG-204',pair('Historical legacy export','كشف النظام القديم السابق'),pair('Tuesday 11:00. EMP-204 still active. Keep this failed-case evidence after the fix.','الثلاثاء 11:00. الحساب ما زال نشطًا. احتفظ بدليل الإخفاق بعد المعالجة.')],
  ['PROC-02',pair('Procedure effective during the event','الإجراء الساري وقت الحدث'),pair('Version 2 was approved during the failed case and supported the CL-07 deadline.','كان الإصدار الثاني معتمدًا وقت الحالة الفاشلة ومتوافقًا مع مهلة CL-07.')]
];
function investigation() {
  const f=state.finding;
  return `<div class="workspace wide-inspector"><section class="panel"><h2>${t('Evidence index','فهرس الأدلة')}</h2>${historicalEvidence.map(([id,title,detail])=>`<div class="evidence-card"><label><input type="checkbox" data-evidence="${id}" ${state.evidenceLinks.includes(id)?'checked':''}>${mono(id)} · ${E(title)}</label><p>${E(detail)}</p><small class="dim">${t('Owner: Compliance Lead · Controlled case repository','المسؤول: مسؤول الامتثال · مستودع الحالة المضبوط')}</small></div>`).join('')}</section>
    <aside class="panel"><h2>${t('Finding F-01','الملاحظة F-01')}</h2><p>${t('Legacy access remained active beyond the customer deadline. Document why the workflow missed the account and how you corrected it.','بقي الوصول القديم نشطًا بعد مهلة العميل. وثّق سبب إغفال الحساب وكيفية تصحيح الإجراء.')}</p><label class="field" for="finding-cause">${t('Root-cause rationale','تفسير السبب')}<textarea id="finding-cause" maxlength="1000" rows="3">${esc(f.cause)}</textarea></label><label class="field" for="finding-action" style="margin-top:14px">${t('Corrective action and retest','الإجراء التصحيحي وإعادة الاختبار')}<textarea id="finding-action" maxlength="1000" rows="3">${esc(f.action)}</textarea></label>
    <div class="actions">${button('verify-finding',t('Verify case closure','تحقق من إغلاق الحالة'))}</div>${status(f.verified?'pass':'pending')}<div id="activity-feedback" hidden></div></aside></div>
    <div class="trace"><div class="trace-item"><h3>CL-07</h3><p>${t('Required deadline','المهلة المطلوبة')}</p></div><div class="trace-item"><h3>HR-041 + LEG-204</h3><p>${t('Historical failure evidence','دليل الإخفاق السابق')}</p></div><div class="trace-item"><h3>${t('Latest retest','آخر إعادة اختبار')}</h3><p>${lastRun(state)?.pass?t('Both removals verified before deadline','تم التحقق من الإلغاء في النظامين قبل المهلة'):t('A successful current retest is required','يلزم اختبار حالي ناجح')}</p></div></div>`;
}
function summary() {
  return `<div class="workspace wide-inspector"><section class="panel"><h2>${t('Launch evidence checklist','قائمة أدلة الإطلاق')}</h2>${checklist(gates(state),true)}<div class="actions">${button('launch',t('Approve launch from the evidence','اعتمد الإطلاق بناءً على الأدلة'))}</div><div id="activity-feedback" hidden></div><div class="line"></div><h2>${t('Day 3 completion','إكمال اليوم الثالث')}</h2>${checklist([
    {id:13,pass:state.finding.verified,label:pair('Finding linked to evidence and a passing retest','ربط الملاحظة بالأدلة واختبار ناجح')},
    {id:7,pass:state.retirement.disposed,label:pair('Controlled legacy retirement completed','اكتمال الإيقاف المضبوط للنظام القديم')}
  ],true)}</section><aside class="panel"><h2>${t('Team audit record','سجل تدقيق الفريق')}</h2><label class="field" for="team-name">${t('Team name (optional)','اسم الفريق (اختياري)')}<input id="team-name" type="text" maxlength="80" value="${esc(state.team)}"></label><div class="line"></div><p class="small">${t('The export includes the register, test events, launch decision, security plan, procedure history and finding. Open tasks remain visible in the report.','يشمل التنزيل السجل وأحداث الاختبارات وقرار الإطلاق وخطة الأمن وتاريخ الإجراء والملاحظة. تظهر المهام المفتوحة في التقرير.')}</p><div class="actions">${button('export',t('Download audit record','تنزيل سجل التدقيق'))}${button('print',t('Print this handoff','اطبع التسليم'),'secondary')}</div><div class="line"></div>${button('reset-dialog',t('Start a new team session','ابدأ جلسة فريق جديدة'),'secondary')}</aside></div>
    <section class="panel summary-doc"><h2>${t('Current work product','ناتج العمل الحالي')}</h2><p>${t('Launch decision','قرار الإطلاق')} · <strong>${state.launch?t('Approved in the simulation','معتمد في المحاكاة'):t('On hold','مؤجّل')}</strong></p><p>${t('Current access test','اختبار الوصول الحالي')} · ${lastRun(state)?status(lastRun(state).pass?'pass':'fail'):status('pending')}</p><h3>SSP-04</h3><p>${esc(planText(state,state.lang))}</p><h3>PROC-02</h3><p>${state.procedure==='v3'?t('Version 3 is effective. Version 2 is preserved for historical evidence.','الإصدار الثالث سارٍ، مع الاحتفاظ بالإصدار الثاني كدليل للفترة السابقة.'):t('Version 2 remains effective. Version 3 is awaiting publication.','الإصدار الثاني سارٍ والإصدار الثالث ينتظر النشر.')}</p></section>`;
}

const renderers=[overview,sourceExplorer,register,simulation,lifecycle,tests,retirement,boundary,planBuilder,planReview,library,workflow,investigation,summary];

function render(moveFocus=false) {
  player?.pause();
  player=null;
  pipelineToken++;
  const route=location.hash.match(/^#\/(\d+)$/);
  const n=Number(route?.[1]);
  current=n>=1&&n<=14?n:1;
  const section=sections[current-1],ar=state.lang==='ar';
  document.documentElement.lang=state.lang;
  document.documentElement.dir=ar?'rtl':'ltr';
  document.documentElement.toggleAttribute('data-reduced-motion',state.reduceMotion);
  document.querySelector('.sidebar').setAttribute('aria-label',t('Lab navigation','التنقل في المختبر'));
  document.title=l(section.title)+' · CGRC Day 3 Lab';
  $('brand-day').textContent=t('Day 3','اليوم الثالث');
  $('brand-sub').textContent=t('Payroll migration lab','مختبر ترحيل نظام الرواتب');
  $('simulation-label').textContent=t('Fictional training environment','بيئة تدريبية افتراضية');
  $('language').textContent=ar?'English':'العربية';
  $('language').lang=ar?'en':'ar';
  $('notes-button').textContent=t('Guide & notes','الدليل والملاحظات');
  $('fullscreen').textContent=document.fullscreenElement?t('Exit full screen','خروج من العرض'):t('Full screen','عرض كامل');
  $('module-label').textContent=section.module?t('Lecture','المحاضرة')+' '+section.module:t('Day 3 workspace','مساحة عمل اليوم الثالث');
  $('skip').textContent=t('Skip to workspace','انتقل إلى مساحة العمل');
  $('position').innerHTML=t('Station','المحطة')+' <bdi dir="ltr">'+current+' / 14</bdi>';
  $('title').textContent=l(section.title);
  $('lead').textContent=l(section.lead);
  let group=-1;
  $('navigation').innerHTML=sections.map(s=>{
    let label='';
    if(s.module!==group) { group=s.module;label=`<div class="nav-group">${s.module?t('Lecture','المحاضرة')+' '+s.module:t('Case file','ملف الحالة')}</div>`; }
    return label+`<a href="#/${s.id}" class="nav-link" ${s.id===current?'aria-current="page"':''}><span class="nav-n">${String(s.id).padStart(2,'0')}</span><span>${E(s.title)}</span></a>`;
  }).join('');
  $('jump-label').textContent=t('Station','المحطة');
  $('jump').innerHTML=sections.map(s=>`<option value="${s.id}" ${s.id===current?'selected':''}>${s.id}. ${E(s.title)}</option>`).join('');
  $('screen').innerHTML=explanation(current)+renderers[current-1]();
  $('screen').classList.remove('screen-in');
  if(moveFocus) {
    void $('screen').offsetWidth;
    $('screen').classList.add('screen-in');
  }
  $('previous').href='#/'+Math.max(1,current-1);
  $('previous').textContent=t('Previous','السابق');
  $('previous').hidden=current===1;
  $('next').href='#/'+Math.min(14,current+1);
  $('next').textContent=t('Next station','المحطة التالية');
  $('next').hidden=current===14;
  $('page-count').innerHTML='<bdi dir="ltr">'+current+' / 14</bdi>';
  $('progress').style.width=(current/14*100)+'%';
  save();
  if(current===4) { player=new ScenarioPlayer();player.draw(); }
  if(moveFocus) { $('main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'}); }
}

class ScenarioPlayer {
  constructor() {
    this.steps=scenarioSteps(state);
    this.events=[...(lastRun(state)?.events||[])];
    this.index=this.events.length-1;
    this.flight=null;this.auto=false;this.frame=0;this.speed=1;this.last=0;this.committed=this.index===5;
  }
  pause() { this.auto=false;cancelAnimationFrame(this.frame);this.frame=0;this.last=0;this.controls(); }
  play() {
    if(this.index===5) this.reset();
    this.auto=true;
    this.advance();
  }
  next() { this.auto=false;this.advance(); }
  reset() { this.pause();this.index=-1;this.events=[];this.flight=null;this.committed=false;this.steps=scenarioSteps(state);this.draw(); }
  advance() {
    if(this.frame||this.index===5) return;
    if(!this.flight) this.flight={target:this.index+1,progress:0};
    this.last=performance.now();
    const tick=now=>{
      const f=this.flight;
      const duration=reduceMotion()?220:1400/this.speed;
      f.progress=Math.min(1,f.progress+(now-this.last)/duration);
      this.last=now;
      this.position(f.progress);
      if(f.progress<1) { this.frame=requestAnimationFrame(tick);return; }
      this.frame=0;
      const event=this.steps[f.target];
      this.events.push(event);this.index=f.target;this.flight=null;
      if(this.index===5&&!this.committed) {
        completeRun(state,this.events);this.committed=true;save();
      }
      this.draw();
      if(this.auto&&this.index<5) this.advance();
      else { this.auto=false;this.controls(); }
    };
    this.frame=requestAnimationFrame(tick);
    this.controls();
  }
  position(progress) {
    const event=this.steps[this.flight.target],packet=$('packet');
    const path=$('route-'+event.node);
    if(packet&&path) {
      const point=path.getPointAtLength(path.getTotalLength()*progress);
      packet.setAttribute('visibility',reduceMotion()?'hidden':'visible');
      packet.setAttribute('cx',point.x);packet.setAttribute('cy',point.y);
      packet.style.fill=event.status==='fail'?'var(--red)':'var(--cyan)';
    }
    document.querySelectorAll('[data-node]').forEach(n=>n.classList.toggle('active',n.dataset.node===event.node));
  }
  controls() {
    const play=document.querySelector('[data-action="sim-play"]');
    if(!play)return;
    play.disabled=!!this.frame&&this.auto;
    document.querySelector('[data-action="sim-pause"]').disabled=!this.frame;
    document.querySelector('[data-action="sim-next"]').disabled=!!this.frame||this.index===5;
    $('include-legacy').disabled=!!this.frame;
    $('late-removal').disabled=!!this.frame;
  }
  draw() {
    if(current!==4)return;
    const event=this.events.at(-1);
    $('sim-detail').innerHTML=event?`<div class="event-number">${mono(this.index+1+' / 6')} · ${mono(event.code)} · ${mono(event.time)}</div><p>${E(event.text)}</p>${this.index===5?status(event.status):''}`:`<div class="event-number">CASE-204 · ${t('Ready to run','جاهز للتشغيل')}</div><p>${t('Play the configured scenario or advance one step at a time. The baseline has no legacy removal task.','شغّل السيناريو أو تقدّم خطوة بخطوة. الوضع الأصلي لا يتضمن إلغاء النظام القديم.')}</p>`;
    $('sim-log').innerHTML=this.events.length?this.events.map(e=>`<div class="log-row">${esc(e.time)} · ${esc(e.code)} · ${esc(e.node.toUpperCase())} <strong class="${e.status}">${e.status.toUpperCase()}</strong></div>`).join(''):`<p>${t('No events generated yet.','لم تُنتج أحداث بعد.')}</p>`;
    const seen=new Map(this.events.map(e=>[e.node,e.status]));
    document.querySelectorAll('[data-node]').forEach(n=>{
      n.classList.toggle('visited',seen.get(n.dataset.node)==='pass');
      n.classList.toggle('failed',seen.get(n.dataset.node)==='fail');
      n.classList.toggle('active',event?.node===n.dataset.node);
    });
    $('packet')?.setAttribute('visibility','hidden');
    this.controls();
  }
}

let pipelineToken=0;
async function pipeline(elementId,onComplete) {
  const token=++pipelineToken;
  const el=$(elementId),items=[...el.querySelectorAll('.workflow-step')];
  const control=document.querySelector('[data-action="test-rollback"]');
  if(control)control.disabled=true;
  const snapshot=$('rollback-snapshot');
  if(snapshot)snapshot.disabled=true;
  for(let i=0;i<items.length;i++) {
    if(token!==pipelineToken)return;
    items[i].classList.remove('blocked','done');
    items[i].classList.add('current');
    await new Promise(resolve=>setTimeout(resolve,reduceMotion()?100:650));
    if(token!==pipelineToken)return;
    items[i].classList.remove('current');items[i].classList.add('done');
  }
  if(control)control.disabled=false;
  if(snapshot)snapshot.disabled=false;
  onComplete();
}

function refresh() {
  const active=document.activeElement;
  const id=active?.id;
  const keys=['node','source','stage','scope','evidence','action'];
  const attribute=keys.find(key=>active?.dataset[key]);
  const value=attribute?active.dataset[attribute]:null;
  const priorDetails=$('screen').querySelector('details')?.open;
  render();
  const details=$('screen').querySelector('details');
  if(details&&priorDetails!==undefined)details.open=priorDetails;
  const replacement=id?$(id):attribute?[...document.querySelectorAll('[data-'+attribute+']')].find(el=>el.dataset[attribute]===value&&!el.closest('svg[hidden]')&&el.getClientRects().length):null;
  replacement?.focus({preventScroll:true});
}

function downloadRecord() {
  const lines=[
    'CGRC · '+t('Day 3 audit handoff','تسليم نتائج تدقيق اليوم الثالث'),
    'CASE-204 · '+t('Fictional training record','سجل تدريبي افتراضي'),
    t('Team','الفريق')+': '+(state.team||t('Unnamed','بلا اسم')),
    '',t('Obligation register','سجل الالتزامات')
  ];
  const option=(options,key)=>{const o=options.find(x=>x[0]===key);return o?t(o[1],o[2]):'—';};
  for(const source of sources) {
    const m=state.maps[source.id]||{};
    lines.push(source.id+' · '+l(source.title),l(source.text),
      [option(ownerOptions,m.owner),option(controlOptions,m.control),option(evidenceOptions,m.evidence)].join(' / '),
      mappingValid(m,source)?t('Mapping complete','اكتمل الربط'):t('Mapping needs work','الربط يحتاج مراجعة'),'');
  }
  lines.push(t('Access test history','تاريخ اختبارات الوصول'));
  if(!state.runs.length)lines.push(t('No completed runs','لا توجد تشغيلات مكتملة'));
  for(const run of state.runs) {
    lines.push(t('Run','التشغيل')+' '+run.id+' · '+(run.pass?t('Pass','ناجح'):t('Fail','مخفق'))+' · '+(run.signature===signature(state)?t('Matches current configuration','يطابق الإعداد الحالي'):t('Prior configuration','إعداد سابق')));
    for(const event of run.events)lines.push(event.time+' · '+event.code+' · '+event.status+' · '+l(event.text));
  }
  lines.push('',t('Migration test bench','اختبارات الترحيل'),
    state.tests.reconcile?l(state.tests.reconcile.message):t('Reconciliation pending','المطابقة قيد الانتظار'),
    state.tests.rollback?l(state.tests.rollback.message):t('Rollback pending','التراجع قيد الانتظار'),
    '',t('Launch decision','قرار الإطلاق')+': '+(state.launch?t('Approved in the simulation','معتمد في المحاكاة'):t('On hold','مؤجّل')));
  gates(state).forEach(g=>lines.push((g.pass?'✓ ':'○ ')+l(g.label)));
  lines.push('',t('System security plan','خطة أمن النظام')+' · SSP-04',
    t('Boundary','الحدود')+': '+nodes.filter(n=>state.scope.includes(n.id)).map(n=>l(n.name)).join(', '),
    planText(state,state.lang),
    t('Implementation status','حالة التنفيذ')+': '+(state.ssp.status==='verified'?t('Verified in current test','تم التحقق في الاختبار الحالي'):t('Partial','جزئي')),
    state.ssp.reviewed?t('Review recorded','تم تسجيل المراجعة'):t('Review pending','المراجعة قيد الانتظار'),
    '',t('Document register','سجل الوثائق')+' · PROC-02',
    'v2 · '+(state.procedure==='v3'?t('Superseded, retained','مستبدَل مع الاحتفاظ'):t('Effective','سارٍ')),
    'v3 · '+(state.procedure==='v3'?t('Published','منشور'):t('Unpublished','غير منشور')),
    t('Rationale','المبرر')+': '+(state.draft.reason||'—'),
    '',t('Finding and evidence','الملاحظة والأدلة')+' · F-01',
    t('Selected evidence','الأدلة المختارة')+': '+(state.evidenceLinks.join(', ')||'—'),
    t('Cause rationale','تفسير السبب')+': '+(state.finding.cause||'—'),
    t('Corrective action','الإجراء التصحيحي')+': '+(state.finding.action||'—'),
    state.finding.verified?t('Closure supported by a passing current retest','يدعم إغلاق الحالة اختبار حالي ناجح'):t('Closure verification pending','التحقق من الإغلاق معلّق'),
    '',t('Legacy retirement','إيقاف النظام القديم'),
    (state.retirement.archived?'✓ ':'○ ')+t('Required records archived','أرشفة السجلات المطلوبة'),
    (state.retirement.access?'✓ ':'○ ')+t('Operational access revoked','إلغاء الوصول التشغيلي'),
    (state.retirement.disposed?'✓ ':'○ ')+t('Disposition recorded','توثيق التصرف'),
    '',t('Team notes','ملاحظات الفريق'));
  for(const [n,note] of Object.entries(state.notes))if(note&&sections[Number(n)-1])lines.push(l(sections[Number(n)-1].title)+': '+note);
  const blob=new Blob(['\uFEFF',lines.join('\r\n')],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='CGRC-Day-3-Audit-Handoff.txt';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast(t('Audit record downloaded.','تم تنزيل سجل التدقيق.'));
}

function advanceDocument() {
  const d=state.draft;
  if(d.stage===4)return;
  if(d.deadline!=='1'||d.owner!=='identity') {
    feedback(t('The draft conflicts with CL-07 or assigns the wrong operator. Keep the one-working-day deadline and Identity Operations.','تتعارض المسودة مع CL-07 أو تُسند التنفيذ للفريق الخطأ. أبقِ مهلة يوم عمل وفريق عمليات الهوية.'));
    return;
  }
  if(d.reason.trim().length<12) {
    feedback(t('Add a specific change rationale before submitting the draft.','أضف مبررًا محددًا قبل تقديم المسودة.'));
    $('draft-reason').focus();
    return;
  }
  const start=$('document-token')?.getBoundingClientRect().left;
  d.stage++;
  if(d.stage===4)state.procedure='v3';
  refresh();
  const token=$('document-token');
  if(token&&start!==undefined&&!reduceMotion()) {
    const distance=start-token.getBoundingClientRect().left;
    token.animate([{transform:`translateX(calc(-50% + ${distance}px))`},{transform:'translateX(-50%)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  feedback(d.stage===4?t('Version 3 published. Version 2 is retained for historical evidence.','تم نشر الإصدار الثالث، مع الاحتفاظ بالثاني للأدلة السابقة.'):t('Workflow step recorded.','تم تسجيل خطوة الاعتماد.'),true);
}

function retire(action) {
  const r=state.retirement;
  if(!state.launch||!state.tests.reconcile?.pass||!state.reconcileFixed) {
    feedback(t('Retirement requires launch approval and a passing reconciliation.','يتطلب الإيقاف اعتماد الإطلاق ونجاح المطابقة.'));
    return;
  }
  if(action==='archive')r.archived=true;
  if(action==='revoke') {
    if(!r.archived){feedback(t('Archive the required records first.','أرشف السجلات المطلوبة أولًا.'));return;}
    r.access=true;
  }
  if(action==='dispose') {
    if(r.hold){feedback(t('An active retention hold blocks disposition.','أمر التحفظ النشط يمنع التصرف.'));return;}
    if(!r.archived||!r.access){feedback(t('Complete archiving and access closure before disposition.','أكمل الأرشفة وإغلاق الوصول قبل التصرف.'));return;}
    r.disposed=true;
  }
  refresh();
  feedback(t('Retirement action recorded.','تم تسجيل إجراء الإيقاف.'),true);
}
function verifyFinding() {
  const f=state.finding;
  if(state.evidenceLinks.length!==historicalEvidence.length||f.cause.trim().length<12||f.action.trim().length<12) {
    feedback(t('Link the four source records and write the cause and corrective action.','اربط السجلات الأربعة واكتب السبب والإجراء التصحيحي.'));
    return;
  }
  if(!lastRun(state)?.pass) {
    feedback(t('The current retest must show timely removal in both systems.','يجب أن تثبت إعادة الاختبار الحالية الإلغاء في المهلة في النظامين.'));
    return;
  }
  f.verified=true;
  refresh();
  feedback(t('The current test supports case closure. Include your rationale in the instructor debrief.','يدعم الاختبار الحالي إغلاق الحالة. ناقش مبرراتك مع المحاضِرة.'),true);
}

const actions={
  'read-source'(){
    if(!state.sourceRead.includes(selectedSource))state.sourceRead.push(selectedSource);
    refresh();toast(t('Source review recorded.','تم تسجيل مراجعة المصدر.'));
  },
  'edit-map'(el){selectedSource=el.dataset.id;refresh();$('map-owner').focus({preventScroll:true});},
  'sim-play'(){player?.play();},
  'sim-pause'(){player?.pause();},
  'sim-next'(){player?.next();},
  'sim-reset'(){player?.reset();},
  launch(){
    if(!launch(state)) { feedback(t('Launch stays on hold. Complete the open checks and return.','يظل الإطلاق مؤجّلًا. أكمل الشروط المفتوحة ثم ارجع.'));return; }
    refresh();feedback(t('Launch approved in the simulation. You can now retire the legacy system.','تم اعتماد الإطلاق في المحاكاة. يمكنك الآن إيقاف النظام القديم.'),true);
  },
  hold(){invalidateLaunch(state);refresh();feedback(t('Launch hold recorded.','تم تسجيل تأجيل الإطلاق.'),true);},
  'test-reconcile'(){
    const result=reconciliation(state);
    state.tests.reconcile={...result,message:result.pass?pair('Reconciliation passed. All 1,000 record IDs and control totals match.','نجحت المطابقة. تطابقت معرّفات السجلات الألف وقيم التحقق.'):pair('Reconciliation failed. Missing records: '+result.unmatched.join(', '),'أخفقت المطابقة. السجلات الناقصة: '+result.unmatched.join(', '))};
    if(!result.pass)invalidateLaunch(state);
    refresh();toast(l(state.tests.reconcile.message));
  },
  'test-rollback'(){
    const result=rollback(state);
    pipeline('test-pipeline',()=>{
      state.tests.rollback={...result,message:result.pass?pair('Rollback passed. Restored the 1,000-record baseline after the simulated failure left 982 records.','نجح التراجع. استُعيدت السجلات الألف بعد أن ترك الإخفاق المحاكى ٩٨٢ سجلًا.'):pair('Rollback failed verification. The selected snapshot is missing '+result.unmatched.join(', '),'أخفق التحقق من التراجع. النسخة المختارة تفتقد '+result.unmatched.join(', '))};
      if(!result.pass)invalidateLaunch(state);
      refresh();toast(l(state.tests.rollback.message));
    });
  },
  archive(){retire('archive');},revoke(){retire('revoke');},dispose(){retire('dispose');},
  'review-plan'(){
    if(!planChecks(state).every(x=>x.pass)) { feedback(t('Resolve each open review check before recording the review.','عالج شروط المراجعة المفتوحة قبل تسجيل المراجعة.'));return; }
    state.ssp.reviewed=true;refresh();feedback(t('Plan review recorded against the current evidence.','تم تسجيل مراجعة الخطة مقابل الأدلة الحالية.'),true);
  },
  'advance-doc':advanceDocument,
  'verify-finding':verifyFinding,
  export:downloadRecord,
  print(){window.print();},
  'reset-dialog'(){
    $('reset-title').textContent=t('Start a new team session?','تبدأ جلسة فريق جديدة؟');
    $('reset-description').textContent=t('This clears the lab work saved in this browser. Download the audit record first if you need it.','يمسح هذا العمل المحفوظ في هذا المتصفح. نزّل سجل التدقيق أولًا إذا كنت تحتاجه.');
    $('cancel-reset').textContent=t('Keep this work','احتفظ بالعمل');
    $('confirm-reset').textContent=t('Start new session','ابدأ جلسة جديدة');
    $('reset-dialog').showModal();
    $('cancel-reset').focus();
  }
};

$('screen').addEventListener('click',event=>{
  const el=event.target.closest('[data-action],[data-node],[data-source],[data-stage]');
  if(!el||el.disabled)return;
  if(el.dataset.node) {
    state.selectedNode=el.dataset.node;
    const inspector=$('screen').querySelector('.inspector');
    if(inspector)inspector.outerHTML=inspectorHTML();
    $('screen').querySelectorAll('[data-node]').forEach(n=>{
      n.classList.toggle('selected',n.dataset.node===state.selectedNode);
      n.setAttribute('aria-pressed',String(n.dataset.node===state.selectedNode));
    });
    save();return;
  }
  if(el.dataset.source) { selectedSource=el.dataset.source;refresh();return; }
  if(el.dataset.stage!==undefined) { selectedStage=Number(el.dataset.stage);refresh();return; }
  actions[el.dataset.action]?.(el);
});
$('screen').addEventListener('keydown',event=>{
  if(event.target.matches('g[data-node]')&&['Enter',' '].includes(event.key)){
    event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  }
});
$('screen').addEventListener('submit',event=>{
  event.preventDefault();
  if(event.target.id!=='mapping-form')return;
  const m={owner:$('map-owner').value,control:$('map-control').value,evidence:$('map-evidence').value};
  if(Object.values(m).some(x=>!x)){feedback(t('Choose an owner, a control and evidence.','اختر المسؤول والضابط والدليل.'));return;}
  state.maps[selectedSource]=m;
  invalidateLaunch(state);
  const good=mappingValid(m,sources.find(s=>s.id===selectedSource));
  refresh();
  feedback(good?t('Mapping saved. The selected control and evidence support this obligation.','تم حفظ الربط. يدعم الضابط والدليل المختاران هذا الالتزام.'):t('Mapping saved for revision. Reopen the source and check who owns it and which record proves the action.','تم حفظ الربط للمراجعة. افتح المصدر وتحقق ممن يتحمل المسؤولية وأي سجل يثبت التنفيذ.'),good);
});
$('screen').addEventListener('change',event=>{
  const el=event.target,id=el.id;
  if(id==='include-legacy'||id==='late-removal') {
    configure(state,id==='include-legacy'?'legacy':'delay',el.checked);
    player?.reset();save();
    toast(t('Configuration changed. Run the scenario again for current evidence.','تغيّر الإعداد. أعد تشغيل المحاكاة للحصول على دليل حالي.'));
  } else if(id==='sim-speed') { if(player)player.speed=Number(el.value); }
  else if(id==='fix-transfer') {
    state.reconcileFixed=el.checked;state.tests.reconcile=null;invalidateLaunch(state);
    refresh();
  } else if(id==='rollback-snapshot') {
    state.rollbackSnapshot=el.value;state.tests.rollback=null;invalidateLaunch(state);
    refresh();
  } else if(id==='retention-hold') {
    state.retirement.hold=el.checked;save();
  } else if(el.dataset.scope) {
    const v=el.dataset.scope;
    state.scope=el.checked?[...new Set([...state.scope,v])]:state.scope.filter(x=>x!==v);
    state.ssp.reviewed=false;invalidateLaunch(state);
    refresh();
  } else if(id.startsWith('ssp-')) {
    state.ssp[id.slice(4)]=el.value;state.ssp.reviewed=false;invalidateLaunch(state);
    $('plan-preview').textContent=planText(state,state.lang);save();
  } else if(id.startsWith('draft-')&&id!=='draft-reason') {
    state.draft[id.slice(6)]=el.value;state.draft.stage=0;
    refresh();
  } else if(el.dataset.evidence) {
    const v=el.dataset.evidence;
    state.evidenceLinks=el.checked?[...new Set([...state.evidenceLinks,v])]:state.evidenceLinks.filter(x=>x!==v);
    state.finding.verified=false;refresh();
  }
});
$('screen').addEventListener('input',event=>{
  const el=event.target,id=el.id;
  if(id==='team-name')state.team=el.value;
  else if(id==='draft-reason') {
    state.draft.reason=el.value;
    if(state.draft.stage>0&&state.draft.stage<4) { state.draft.stage=0;refresh(); }
    else if($('draft-reason-preview')) $('draft-reason-preview').textContent=el.value||t('Not yet recorded.','لم يُسجّل بعد.');
  }
  else if(id==='finding-cause'||id==='finding-action') {
    state.finding[id.slice(8)]=el.value;
    if(state.finding.verified) { state.finding.verified=false;refresh(); }
  } else return;
  save();
});

$('language').addEventListener('click',()=>{state.lang=state.lang==='ar'?'en':'ar';render();});
$('skip').addEventListener('click',event=>{event.preventDefault();$('main').focus();});
$('jump').addEventListener('change',event=>{location.hash='#/'+event.target.value;});
$('notes-button').addEventListener('click',()=>{
  $('notes-title').textContent=t('Guide and team notes','دليل المحاضِرة وملاحظات الفريق');
  $('close-notes').textContent=t('Close','أغلق');
  $('instructor-notes').innerHTML=`<p>${E(instruction[current])}</p><h3>${t('Demonstration and debrief','عرض تطبيقي ومناقشة')}</h3><p>${E(debrief[current-1])}</p><p class="small">${t('Keyboard: [ and ] move between stations. On the simulator, Space plays or pauses, S advances one step, and R resets playback.','اختصارات: استخدم [ و ] للتنقل. في المحاكاة، المسافة للتشغيل أو الإيقاف، و S للخطوة التالية، و R للإعادة.')}</p>`;
  $('note-label').textContent=t('Team notes for this station','ملاحظات الفريق لهذه المحطة');
  $('team-note').value=state.notes[current]||'';
  $('motion-label').textContent=t('Reduce motion in this lab','تقليل الحركة في المختبر');
  $('reduce-motion').checked=state.reduceMotion;
  $('note-help').textContent=t('Notes are included in the audit record download.','تظهر الملاحظات في سجل التدقيق القابل للتنزيل.');
  $('notes-dialog').showModal();
});
$('team-note').addEventListener('input',event=>{state.notes[current]=event.target.value;save();});
$('reduce-motion').addEventListener('change',event=>{
  state.reduceMotion=event.target.checked;
  document.documentElement.toggleAttribute('data-reduced-motion',state.reduceMotion);
  save();
});
$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
$('confirm-reset').addEventListener('click',()=>{
  const {lang,reduceMotion}=state;
  state=freshState();state.lang=lang;state.reduceMotion=reduceMotion;selectedSource='CL-07';selectedStage=0;
  $('reset-dialog').close();
  save();location.hash='#/1';render(true);
});
$('fullscreen').addEventListener('click',async()=>{
  try { if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen(); }
  catch { toast(t('Full screen is unavailable in this browser.','وضع ملء الشاشة غير متاح في هذا المتصفح.')); }
});
document.addEventListener('fullscreenchange',()=>{
  $('fullscreen').textContent=document.fullscreenElement?t('Exit full screen','خروج من العرض'):t('Full screen','عرض كامل');
});
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,input,textarea,select,a,dialog,g[data-node]'))return;
  if(event.key===']'&&current<14)location.hash='#/'+(current+1);
  else if(event.key==='['&&current>1)location.hash='#/'+(current-1);
  else if(current===4&&event.key===' ') { event.preventDefault();if(player?.frame)player.pause();else player?.play(); }
  else if(current===4&&event.key.toLowerCase()==='s')player?.next();
  else if(current===4&&event.key.toLowerCase()==='r')player?.reset();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)player?.pause();});
window.addEventListener('hashchange',()=>render(true));
render();
