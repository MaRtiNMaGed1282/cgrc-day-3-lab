export const VERSION = 2;
export const pair = (en, ar) => ({ en, ar });
export const sources = [
  { id: 'CL-07', type: pair('Signed customer contract', 'عقد عميل موقّع'), title: pair('Access removal', 'إلغاء صلاحيات المغادرين'), text: pair('For a departure on a working day, remove access to cloud and legacy payroll by the same time on the next working day.', 'عند المغادرة في يوم عمل، ألغِ الوصول إلى نظامَي الرواتب السحابي والقديم بحلول الوقت نفسه من يوم العمل التالي.'), scope: pair('Both payroll systems during the migration.', 'يشمل النظامين خلال فترة الترحيل.'), owner: 'payroll' },
  { id: 'POL-01', type: pair('Approved internal policy', 'سياسة داخلية معتمدة'), title: pair('Authorized payroll access', 'الوصول المعتمد إلى الرواتب'), text: pair('The Payroll Manager approves each payroll role before Identity Operations grants it. Keep the approval with the access ticket.', 'يعتمد مدير الرواتب كل دور قبل أن يمنحه فريق عمليات الهوية. احفظ الموافقة مع تذكرة الوصول.'), scope: pair('Staff and temporary reconciliation accounts.', 'يشمل الموظفين وحسابات المطابقة المؤقتة.'), owner: 'payroll' },
  { id: 'CL-12', type: pair('Signed customer contract', 'عقد عميل موقّع'), title: pair('Evidence retention', 'الاحتفاظ بأدلة التنفيذ'), text: pair('Keep access approvals and removal records for 90 days in the controlled evidence repository. A documented hold suspends disposal.', 'احتفظ بموافقات الوصول وسجلات الإلغاء ٩٠ يومًا في مستودع الأدلة المضبوط. يوقف أمر التحفظ الموثّق الإتلاف.'), scope: pair('Access records. The 90-day rule is fictional and specific to this case.', 'سجلات الوصول. مهلة ٩٠ يومًا افتراضية وتخص هذه الحالة فقط.'), owner: 'compliance' }
];
export const nodes = [
  { id:'hr', icon:'people', name:pair('HR register','سجل الموارد البشرية'), sub:'HR-041', role:pair('Records departures and the authoritative departure time.','يسجّل المغادرة ووقتها المعتمد.'), evidence:pair('Departure notice, account ID, effective time.','إخطار المغادرة ومعرّف الحساب ووقت السريان.'), owner:pair('HR Operations','عمليات الموارد البشرية') },
  { id:'approval', icon:'check', name:pair('Payroll Manager','مدير الرواتب'), sub:'POL-01', role:pair('Owns the access requirement and approves payroll roles.','يتحمل مسؤولية متطلب الوصول ويعتمد أدوار الرواتب.'), evidence:pair('Signed role approval and exception review.','موافقة الدور ومراجعة الاستثناءات.'), owner:pair('Payroll Manager','مدير الرواتب') },
  { id:'iam', icon:'key', name:pair('Identity Operations','عمليات الهوية'), sub:'IAM-01', role:pair('Executes the removal workflow and records completion separately for each system.','ينفّذ سير الإلغاء ويسجّل اكتماله لكل نظام على حدة.'), evidence:pair('Access ticket and execution timestamps.','تذكرة الوصول وتوقيتات التنفيذ.'), owner:pair('Identity Operations','عمليات الهوية') },
  { id:'cloud', icon:'cloud', name:pair('Cloud payroll','الرواتب السحابي'), sub:'CLOUD-01', role:pair('New payroll portal in pilot. A shared identity service disables payroll access.','بوابة الرواتب الجديدة قيد التجربة. تلغي خدمة الهوية المشتركة الوصول إليها.'), evidence:pair('Cloud access removal log.','سجل إلغاء الوصول السحابي.'), owner:pair('Cloud application team','فريق التطبيق السحابي') },
  { id:'legacy', icon:'server', name:pair('Legacy payroll','الرواتب القديم'), sub:'LEGACY-01', role:pair('Remains in use for reconciliation. Local accounts need a separate removal action.','يبقى قيد الاستخدام للمطابقة. تحتاج الحسابات المحلية إلى إجراء إلغاء منفصل.'), evidence:pair('Legacy account export and removal log.','كشف الحسابات القديمة وسجل الإلغاء.'), owner:pair('Legacy operations team','فريق تشغيل النظام القديم') },
  { id:'evidence', icon:'folder', name:pair('Evidence repository','مستودع الأدلة'), sub:'EV-INDEX', role:pair('Preserves approved documents and dated records with controlled reviewer access.','يحفظ الوثائق المعتمدة والسجلات المؤرّخة مع ضبط وصول المراجعين.'), evidence:pair('Version history, evidence index and retention record.','سجل الإصدارات وفهرس الأدلة وسجل الاحتفاظ.'), owner:pair('Compliance Lead','مسؤول الامتثال') }
];
export const sections = [
  [0,'Case briefing','موجز الحالة','Explore the payroll environment and your assignment.','استكشف بيئة الرواتب والمهمة المطلوبة.'],
  [5,'Source explorer','استكشاف الالتزامات','Read the authoritative source before defining the requirement.','اقرأ المصدر المعتمد قبل صياغة المتطلب.'],
  [5,'Requirements register','سجل المتطلبات','Assign a control, accountable owner and evidence to every obligation.','اربط كل التزام بضابط ومسؤول ودليل.'],
  [5,'Access simulation','محاكاة إلغاء الوصول','Observe the removal workflow and repair its missing legacy step.','راقب إجراء الإلغاء وعالج خطوة النظام القديم الناقصة.'],
  [6,'Lifecycle decisions','قرارات دورة الحياة','Review the evidence needed at each stage and record a launch decision.','راجع أدلة كل مرحلة ووثّق قرار الإطلاق.'],
  [6,'Migration test bench','اختبارات الترحيل','Run reconciliation and rollback tests against the current configuration.','نفّذ اختبارات المطابقة والتراجع على الإعداد الحالي.'],
  [6,'Legacy retirement','إيقاف النظام القديم','Complete a controlled retirement after launch and reconciliation.','نفّذ الإيقاف المضبوط بعد الإطلاق والمطابقة.'],
  [7,'System boundary','حدود النظام','Define what the security plan covers and where responsibility sits.','حدّد ما تغطيه الخطة وأين تقع المسؤولية.'],
  [7,'Security plan builder','بناء خطة الأمن','Write a control entry that an operator and assessor can use.','اكتب وصف ضابط يستطيع المنفّذ والمقيّم استخدامه.'],
  [7,'Plan review','مراجعة الخطة','Inspect completeness and approve a plan that matches the evidence.','راجع الاكتمال واعتمد خطة تتفق مع الأدلة.'],
  [8,'Document library','مكتبة الوثائق','Compare the approved procedure with a proposed revision.','قارن الإجراء المعتمد بالتعديل المقترح.'],
  [8,'Approval workflow','مسار الاعتماد','Review and publish a compatible procedure through simulated roles.','راجع إجراءً متوافقًا وانشره عبر أدوار محاكاة.'],
  [8,'Evidence investigation','فحص الأدلة','Trace the finding to dated records and verify corrective action.','تتبّع الملاحظة إلى سجلات مؤرّخة وتحقق من الإجراء التصحيحي.'],
  [0,'Audit handoff','تسليم نتائج التدقيق','Review the work product and export the team audit record.','راجع ناتج العمل ونزّل سجل تدقيق الفريق.']
].map(([module,en,ar,le,la],index)=>({id:index+1,module,title:pair(en,ar),lead:pair(le,la)}));

export function freshState() {
  return {
    version:VERSION, lang:'ar', reduceMotion:false, maps:{}, sourceRead:[], selectedNode:'iam',
    config:{legacy:false,delay:false}, runs:[], scope:['hr','approval','iam','cloud','legacy','evidence'],
    tests:{reconcile:null,rollback:null}, reconcileFixed:false, rollbackSnapshot:'approved',
    ssp:{owner:'',trigger:'',systems:'both',deadline:'1',evidence:'',status:'partial',reviewed:false},
    draft:{deadline:'2',owner:'identity',reason:'',stage:0}, procedure:'v2',
    launch:false, retirement:{archived:false,hold:false,access:false,disposed:false},
    evidenceLinks:[], finding:{cause:'',action:'',owner:'identity',verified:false},
    notes:{}, team:''
  };
}
export function hydrate(raw) {
  const state=freshState();
  if (!raw || raw.version!==VERSION) return state;
  state.lang=raw.lang==='en'?'en':'ar';
  state.reduceMotion=raw.reduceMotion===true;
  if(nodes.some(n=>n.id===raw.selectedNode))state.selectedNode=raw.selectedNode;
  state.maps=raw.maps && typeof raw.maps==='object' && !Array.isArray(raw.maps)?raw.maps:{};
  state.sourceRead=Array.isArray(raw.sourceRead)?raw.sourceRead.filter(x=>sources.some(s=>s.id===x)):[];
  state.scope=Array.isArray(raw.scope)?raw.scope.filter(x=>nodes.some(n=>n.id===x)):state.scope;
  state.config={legacy:raw.config?.legacy===true,delay:raw.config?.delay===true};
  state.runs=Array.isArray(raw.runs)?raw.runs.filter(x=>Array.isArray(x.events)&&typeof x.signature==='string').slice(-12):[];
  state.tests={reconcile:raw.tests?.reconcile??null,rollback:raw.tests?.rollback??null};
  state.reconcileFixed=raw.reconcileFixed===true;
  state.rollbackSnapshot=raw.rollbackSnapshot==='incomplete'?'incomplete':'approved';
  for (const key of ['ssp','draft','finding','retirement']) {
    if (raw[key] && typeof raw[key]==='object') state[key]={...state[key],...raw[key]};
  }
  state.procedure=raw.procedure==='v3'?'v3':'v2';
  state.launch=raw.launch===true;
  state.evidenceLinks=Array.isArray(raw.evidenceLinks)?raw.evidenceLinks.filter(x=>['HR-041','CLD-201','LEG-204','PROC-02'].includes(x)):[];
  state.notes=raw.notes && typeof raw.notes==='object' && !Array.isArray(raw.notes)?raw.notes:{};
  state.team=typeof raw.team==='string'?raw.team.slice(0,80):'';
  return state;
}
export function signature(state) { return JSON.stringify(state.config); }
export function lastRun(state) {
  const run=state.runs.at(-1);
  return run?.signature===signature(state)?run:null;
}
export function invalidateLaunch(state) {
  state.launch=false;
  state.retirement.access=false;
  state.retirement.disposed=false;
}
export function invalidate(state) {
  invalidateLaunch(state);
  state.ssp.reviewed=false;
  state.finding.verified=false;
}
export function configure(state,key,value) {
  if (state.config[key]===value) return;
  state.config[key]=value;
  invalidate(state);
}
export function scenarioSteps(state) {
  const c=state.config, late=c.delay;
  return [
    {node:'hr',time:'Mon 09:00',code:'HR-041',status:'info',text:pair('HR records the departure. The case deadline is Tuesday at 09:00.','تسجّل الموارد البشرية المغادرة. تنتهي مهلة الحالة الثلاثاء الساعة 09:00.')},
    {node:'approval',time:'Mon 09:05',code:'TKT-204',status:'info',text:pair('The Payroll Manager confirms scope. Cloud and legacy access both require removal.','يؤكد مدير الرواتب النطاق. يجب إلغاء الوصول إلى النظامين السحابي والقديم.')},
    {node:'iam',time:'Mon 09:10',code:'IAM-204',status:'info',text:pair('Identity Operations starts the configured workflow.','يبدأ فريق عمليات الهوية إجراء الإلغاء وفق الإعداد الحالي.')},
    {node:'cloud',time:'Mon 16:10',code:'CLD-201',status:'pass',text:pair('The cloud log records effective removal before the deadline.','يثبت السجل السحابي الإلغاء الفعلي قبل انتهاء المهلة.')},
    {node:'legacy',time:c.legacy?(late?'Tue 11:00':'Tue 08:30'):'Tue 11:00',code:c.legacy?'LEG-205':'LEG-204',status:c.legacy&&!late?'pass':'fail',
      text:c.legacy?(late?pair('Legacy removal completes two hours late. The workflow covers both systems but misses the contract deadline.','يكتمل إلغاء النظام القديم متأخرًا بساعتين. يغطي الإجراء النظامين لكنه يتجاوز مهلة العقد.'):pair('Legacy removal completes 30 minutes before the deadline.','يكتمل إلغاء النظام القديم قبل المهلة بثلاثين دقيقة.')):pair('The legacy step is missing. The Tuesday 11:00 export still lists the account as active.','خطوة النظام القديم ناقصة. يُظهر كشف الثلاثاء 11:00 أن الحساب ما زال نشطًا.')},
    {node:'evidence',time:'Tue 11:05',code:'EV-204',status:c.legacy&&!late?'pass':'fail',text:c.legacy&&!late?pair('Matching HR and both removal records supports a passing result for this test case.','تدعم مطابقة سجل الموارد البشرية وسجلَي الإلغاء نجاح حالة الاختبار.'):pair('The collected records show a missed requirement. Preserve them for the finding.','تثبت السجلات المجمّعة إخفاقًا في المتطلب. احتفظ بها لدعم الملاحظة.')}
  ];
}
export function completeRun(state,events) {
  const expected=scenarioSteps(state);
  if (events.length!==expected.length) throw new Error('Incomplete scenario');
  const run={id:state.runs.length?state.runs.at(-1).id+1:1,signature:signature(state),events:expected,pass:expected.at(-1).status==='pass'};
  state.runs.push(run);
  if(state.runs.length>12) state.runs.shift();
  invalidate(state);
  return run;
}
export function mappingValid(map,source) {
  return !!map && map.owner===source.owner && map.control===({ 'CL-07':'offboard','POL-01':'approval','CL-12':'retain' }[source.id]) &&
    map.evidence===({'CL-07':'logs','POL-01':'ticket','CL-12':'index'}[source.id]);
}
export function mappedCount(state) { return sources.filter(s=>mappingValid(state.maps[s.id],s)).length; }
const payrollRecords=Array.from({length:1000},(_,index)=>({
  id:'PAY-'+String(index+1).padStart(4,'0'),
  controlTotal:((index+1)*31)%9973
}));
function compareRecords(destination) {
  const observed=new Map(destination.map(record=>[record.id,record.controlTotal]));
  const unmatched=payrollRecords.filter(record=>observed.get(record.id)!==record.controlTotal).map(record=>record.id);
  return {expected:payrollRecords.length,observed:destination.length,unmatched,pass:unmatched.length===0&&destination.length===payrollRecords.length};
}
export function reconciliation(state) {
  return compareRecords(state.reconcileFixed?payrollRecords:payrollRecords.slice(0,-2));
}
export function rollback(state) {
  const snapshot=state.rollbackSnapshot==='approved'?payrollRecords:payrollRecords.slice(0,-2);
  // The simulated failed transfer overwrites the working set before recovery.
  let working=payrollRecords.slice(0,-18);
  const failedCount=working.length;
  working=snapshot.map(record=>({...record}));
  return {...compareRecords(working),failedCount};
}
export function planChecks(state) {
  const s=state.ssp;
  return [
    {id:'scope',label:pair('Both payroll systems are inside the boundary','النظامان داخل حدود الخطة'),pass:state.scope.includes('cloud')&&state.scope.includes('legacy')},
    {id:'owner',label:pair('Accountable owner is the Payroll Manager','مدير الرواتب مسؤول عن النتيجة'),pass:s.owner==='payroll'},
    {id:'trigger',label:pair('Trigger names the HR departure notice','الإجراء يبدأ بإخطار المغادرة'),pass:s.trigger==='hr'},
    {id:'coverage',label:pair('Control covers cloud and legacy','الضابط يغطي السحابي والقديم'),pass:s.systems==='both'},
    {id:'deadline',label:pair('Deadline agrees with CL-07','المهلة متوافقة مع البند CL-07'),pass:s.deadline==='1'},
    {id:'evidence',label:pair('Evidence references HR and both system logs','الدليل يشمل سجل الموارد البشرية والنظامين'),pass:s.evidence==='all'},
    {id:'status',label:pair('Implementation status matches the latest test','حالة التنفيذ متفقة مع آخر اختبار'),pass:s.status===(lastRun(state)?.pass?'verified':'partial')}
  ];
}
export function gates(state) {
  return [
    {id:3,label:pair('All obligations have valid mappings','ربط جميع الالتزامات ربطًا صحيحًا'),pass:mappedCount(state)===3},
    {id:4,label:pair('Current access test passes in both systems','نجاح اختبار الوصول الحالي في النظامين'),pass:lastRun(state)?.pass===true},
    {id:6,label:pair('Migration records reconcile','نجاح مطابقة سجلات الترحيل'),pass:state.tests.reconcile?.pass===true&&state.reconcileFixed},
    {id:6,label:pair('Rollback restores the test baseline','نجاح استعادة النسخة المرجعية في اختبار التراجع'),pass:state.tests.rollback?.pass===true},
    {id:10,label:pair('Security plan reviewed against current evidence','مراجعة خطة الأمن مقابل الأدلة الحالية'),pass:state.ssp.reviewed&&planChecks(state).every(x=>x.pass)},
    {id:12,label:pair('Compatible procedure revision published','نشر إصدار إجراء متوافق'),pass:state.procedure==='v3'&&state.draft.stage===4}
  ];
}
export function launch(state) {
  if (!gates(state).every(x=>x.pass)) return false;
  state.launch=true;
  return true;
}
export function planText(state,lang) {
  const ar=lang==='ar',s=state.ssp;
  const owner=s.owner==='payroll'?(ar?'مدير الرواتب':'Payroll Manager'):(ar?'[مسؤول غير محدد]':'[owner not assigned]');
  const trigger=s.trigger==='hr'?(ar?'عند إخطار المغادرة من الموارد البشرية':'On an HR departure notice'):(ar?'[حدث غير محدد]':'[trigger not defined]');
  const systems=s.systems==='both'?(ar?'النظام السحابي والنظام القديم':'cloud and legacy payroll'):(ar?'النظام السحابي فقط':'cloud payroll only');
  const timing=s.deadline==='1'?(ar?'بحلول الوقت نفسه من يوم العمل التالي':'by the same time on the next working day'):(ar?'خلال يومَي عمل':'within two working days');
  const evidence=s.evidence==='all'?(ar?'تربط التذكرة سجل الموارد البشرية وسجلَي الإلغاء':'The ticket links the HR notice and both removal logs'):(ar?'[مرجع الأدلة غير مكتمل]':'[evidence reference incomplete]');
  return ar?`${trigger}، يلغي فريق عمليات الهوية الوصول إلى ${systems} ${timing}. يتولى ${owner} مسؤولية النتيجة ومراجعة الاستثناءات. ${evidence}.`:`${trigger}, Identity Operations removes access to ${systems} ${timing}. The ${owner} owns the outcome and exception review. ${evidence}.`;
}
export const instruction = {
  1:pair('You are the review team. Follow one departure across two systems, repair the failed workflow, and assemble the evidence needed for launch. Every activity uses fictional records.','أنت ضمن فريق المراجعة. تتبّع مغادرة موظف عبر نظامين، وعالج الإجراء الناقص، وجهّز أدلة قرار الإطلاق. جميع السجلات افتراضية.'),
  2:pair('Open each source. Record why it applies. The contract supplies the deadline, the policy supplies approval responsibilities, and CL-12 supplies the case retention rule.','افتح كل مصدر وحدّد سبب انطباقه. يحدد العقد المهلة، وتحدد السياسة مسؤوليات الموافقة، ويحدد CL-12 قاعدة الاحتفاظ الخاصة بالحالة.'),
  3:pair('A mapping must identify who owns the outcome, what control fulfils it, and what evidence will demonstrate it. Save a row for each source. A saved row can still need correction.','يحدد الربط صاحب المسؤولية والضابط الذي يحقق الالتزام والدليل الذي يثبته. احفظ صفًا لكل مصدر. قد يحتاج الصف المحفوظ إلى تصحيح.'),
  4:pair('First run the baseline with the legacy task disabled. Inspect each event. Then include legacy removal and run again. Test a late removal to distinguish coverage from timeliness. The two weekdays in this case are working days.','شغّل الوضع الأصلي أولًا وخطوة النظام القديم غير مفعّلة. افحص الأحداث، ثم فعّل الإلغاء وأعد التشغيل. جرّب الإلغاء المتأخر للتمييز بين التغطية والالتزام بالوقت. اليومان في هذه الحالة يوما عمل.'),
  5:pair('Move through the lifecycle and inspect the stage evidence. The launch gate checks work from later sections too. Record a hold now and return when every condition is met.','استكشف دورة الحياة وأدلة كل مرحلة. يفحص قرار الإطلاق أعمالًا من الأقسام التالية أيضًا. سجّل التأجيل الآن وارجع بعد استيفاء الشروط.'),
  6:pair('The baseline has 1,000 source records but only 998 destination records. Run the reconciliation to expose the gap, repair the transfer, then rerun. A separate rollback drill checks recovery to the approved baseline. Counts alone are only one part of a real reconciliation.','يوجد ١٠٠٠ سجل في المصدر و٩٩٨ في الوجهة. اختبر المطابقة لكشف الفجوة، وعالج النقل ثم أعد الاختبار. يفحص تدريب منفصل التراجع إلى النسخة المرجعية المعتمدة. الأعداد وحدها جزء من المطابقة الفعلية.'),
  7:pair('A launch approval and successful reconciliation are required before retirement. Archive retained records first. Check the hold before disposition, revoke access, and preserve completion evidence. This section can be revisited after the final launch approval.','يلزم اعتماد الإطلاق ونجاح المطابقة قبل الإيقاف. أرشف السجلات المطلوبة أولًا، وراجع أمر التحفظ قبل الإتلاف، وألغِ الوصول واحفظ أدلة الإكمال. ارجع لهذا القسم بعد اعتماد الإطلاق النهائي.'),
  8:pair('Select each component to inspect its purpose, owner and evidence. Mark the scope. Legacy payroll must stay in scope while it holds accessible records during reconciliation. A supplier’s service does not remove the organization’s responsibilities.','اختر كل مكوّن لفحص غرضه ومسؤوله وأدلته، وحدّد النطاق. يبقى النظام القديم ضمنه ما دامت سجلاته متاحة أثناء المطابقة. خدمة المورد لا تلغي مسؤوليات المؤسسة.'),
  9:pair('Complete the control entry. The preview is built from your actual choices. Match the status to the current test result and reference the source records an assessor can retrieve.','أكمل وصف الضابط. تعكس المعاينة اختياراتك الفعلية. طابق حالة التنفيذ بنتيجة الاختبار الحالية، وأشر إلى سجلات يستطيع المقيّم استرجاعها.'),
  10:pair('Inspect each review check. A good description can still report partial implementation. Review the plan after changing the workflow or running a new test, because the evidence has changed.','افحص شروط المراجعة. قد يصف النص الضابط جيدًا مع بقاء التنفيذ جزئيًا. راجع الخطة بعد تغيير الإجراء أو إجراء اختبار جديد لأن الأدلة تغيرت.'),
  11:pair('Version 2 is approved. Version 3 is a draft proposing a longer deadline. Compare the change against CL-07. A later version number by itself does not make the draft effective.','الإصدار الثاني معتمد. الإصدار الثالث مسودة تقترح مهلة أطول. قارن التعديل بالبند CL-07. رقم الإصدار الأحدث وحده لا يجعل المسودة سارية.'),
  12:pair('Repair the draft deadline and supply a reason. Advance it through review, simulated approval, and publication. The simulator prevents publication when the draft conflicts with CL-07.','صحّح مهلة المسودة وأضف سبب التغيير، ثم مرّرها للمراجعة والاعتماد المحاكى والنشر. يمنع المختبر نشر مسودة تتعارض مع البند CL-07.'),
  13:pair('The historical failed case remains evidence even after a later test succeeds. Select the records that support the finding, document a cause and corrective action, then verify closure against the latest test.','تبقى الحالة الفاشلة السابقة دليلًا حتى بعد نجاح اختبار لاحق. اختر السجلات التي تدعم الملاحظة، ووثّق السبب والإجراء التصحيحي، ثم تحقق من الإغلاق مقابل آخر اختبار.'),
  14:pair('Review the conditions and the team work product. A download includes the current state, including gaps. Successful completion depends on the evidence you created throughout the lab.','راجع الشروط وناتج عمل الفريق. يتضمن التنزيل الحالة الحالية بما فيها الفجوات. يعتمد الإكمال على الأدلة التي أنشأتها عبر المختبر.')
};

export const debrief = [
  pair('Open Legacy payroll first. Ask why the application stays in the scope after the cloud pilot starts. Its operational accounts and retained records are still accessible.','افتح النظام القديم أولًا. اسأل لماذا يبقى في النطاق بعد بدء التجربة السحابية. ما زالت حساباته وسجلاته متاحة.'),
  pair('Compare CL-07 with POL-01. The contract sets a deadline. The policy establishes role approval. Ask what fact would change the applicability decision.','قارن CL-07 بـ POL-01. يحدد العقد المهلة وتحدد السياسة اعتماد الأدوار. اسأل ما المعلومة التي قد تغيّر قرار الانطباق.'),
  pair('Demonstrate the first row: Payroll Manager owns the obligation, two-system removal is the control, and the HR notice with both logs is the evidence. Let students map the other two.','اعرض الصف الأول: مدير الرواتب مسؤول، والإلغاء في النظامين هو الضابط، وإخطار المغادرة مع السجلين هو الدليل. اترك الصفين الآخرين للمتدربين.'),
  pair('Pause at the legacy node. Ask whether a green cloud result can satisfy CL-07. Run the late variant, then repair the legacy branch and compare the three event records.','أوقف العرض عند النظام القديم. اسأل هل يكفي نجاح السحابي لتحقيق CL-07. شغّل الحالة المتأخرة ثم أصلح الفرع وقارن سجلات الحالات الثلاث.'),
  pair('Record a hold while one test or approval is open. Ask who can approve launch and which evidence would let them reconsider.','سجّل تأجيلًا عند وجود اختبار أو اعتماد مفتوح. اسأل من يملك اعتماد الإطلاق وما الدليل اللازم لإعادة النظر.'),
  pair('Run the first reconciliation and identify the exact record IDs. Compare restoring an incomplete copy with restoring the approved snapshot.','نفّذ المطابقة الأولى وحدد معرّفات السجلات. قارن استعادة نسخة ناقصة باستعادة النسخة المرجعية المعتمدة.'),
  pair('Activate the hold after archiving. Ask which actions can continue. Revoking operational access can proceed, and disposal remains blocked.','فعّل أمر التحفظ بعد الأرشفة. اسأل ما الإجراءات التي يمكن استكمالها. يمكن إلغاء الوصول التشغيلي ويظل الإتلاف ممنوعًا.'),
  pair('Temporarily remove the legacy system from scope. Ask who owns the legacy evidence and why the cloud service cannot provide that record.','استبعد النظام القديم مؤقتًا. اسأل من يملك أدلته ولماذا لا تستطيع الخدمة السحابية توفير ذلك السجل.'),
  pair('Compare a vague phrase such as “access is restricted” with the generated entry. Ask a learner to explain how an assessor would reproduce the evidence check.','قارن عبارة عامة مثل «الوصول مقيّد» بالوصف الناتج. اطلب شرح كيف يكرر المقيّم التحقق من الدليل.'),
  pair('Show why a partial status can be accurate. If a new passing result arrives, update the status and record a new review against that test.','وضّح كيف تكون حالة التنفيذ الجزئي دقيقة. عند ورود اختبار ناجح جديد، حدّث الحالة وسجّل مراجعة جديدة مقابل ذلك الاختبار.'),
  pair('Ask which version governed the historical event. Compare effective status and document history before discussing the proposed revision.','اسأل أي إصدار كان يحكم الحدث السابق. قارن حالة السريان وتاريخ الوثيقة قبل مناقشة التعديل.'),
  pair('Try submitting the two-day draft, inspect the rejection, then retain the one-day term and add a rationale. Identify the reviewer, approver and publisher at each step.','جرّب تقديم مسودة اليومين وافحص الرفض. أبقِ مهلة اليوم الواحد وأضف المبرر. حدّد المراجع والمعتمِد والناشر في كل خطوة.'),
  pair('Compare the failed legacy export with the new successful retest. A passing retest supports closure but does not erase the earlier finding.','قارن كشف الإخفاق السابق بإعادة الاختبار الناجحة. يدعم الاختبار الناجح الإغلاق، ويظل الإخفاق السابق محفوظًا.'),
  pair('Ask each team to justify its launch decision using one source, one test result and one approved document. Continue on Day 4 with a monitoring rule for overdue removals.','اطلب من كل فريق تبرير قرار الإطلاق بمصدر ونتيجة اختبار ووثيقة معتمدة. استكمل في اليوم الرابع بقاعدة مراقبة لحالات الإلغاء المتأخرة.')
];
