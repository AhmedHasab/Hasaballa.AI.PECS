const SUPABASE_URL =
"https://oivtndqstklnsxwherpp.supabase.co";

const SUPABASE_KEY =
"sb_publishable_8F2wYjRCveireb8x-JOt0A_HyjnkAZB";

const supabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

let tasks = [];
let subtasks = [];
let masterTasks = [];
let mappings = [];
let phases = [];
let milestones = [];
let reports = [];
let dailyReports = [];
let developers = [];

async function loadData(){

const [
tasksRes,
subtasksRes,
masterRes,
mappingRes,
phaseRes,
milestoneRes,
reportsRes,
developersRes

] = await Promise.all([

fetch('./data/tasks.json'),
fetch('./data/subtasks.json'),
fetch('./data/master_tasks.json'),
fetch('./data/mappings.json'),
fetch('./data/phases.json'),
fetch('./data/milestones.json'),
fetch('./data/reports.json'),
fetch('./data/developers.json')

]);

tasks =
await tasksRes.json();

subtasks =
await subtasksRes.json();

masterTasks =
await masterRes.json();

mappings =
await mappingRes.json();

phases =
await phaseRes.json();

milestones =
await milestoneRes.json();

reports =
await reportsRes.json();

developers =
await developersRes.json();

populateFilters();

}

function populateFilters(){

const phaseFilter =
document.getElementById(
'phaseFilter'
);

const milestoneFilter =
document.getElementById(
'milestoneFilter'
);

const taskTypeFilter =
document.getElementById(
'taskTypeFilter'
);

masterTasks.forEach(task=>{

taskTypeFilter.innerHTML +=
`
<option value="${task.task_type}">
${task.task_type}
</option>
`;

});

phases
.filter(
p=>p.id &&
p.id.startsWith('P')
)
.forEach(phase=>{

phaseFilter.innerHTML +=
`
<option value="${phase.id}">
${phase.id}
</option>
`;

});

milestones.forEach(ms=>{

milestoneFilter.innerHTML +=
`
<option value="${ms.id}">
${ms.id}
</option>
`;

});

}

// =====================================
// PART 3
// LOAD + RELATION ENGINE
// =====================================

function getMappingByDeveloperTask(devId){

return mappings.find(
m => m.developer_task_id === devId
);

}

function getMasterTask(masterId){

return masterTasks.find(
m => m.id === masterId
);

}

function getSubtasks(masterId){

return subtasks.filter(
s => s.parent_task === masterId
);

}

function getMilestone(id){

return milestones.find(
m => m.id === id
);

}

function getPhase(id){

return phases.find(
p => p.id === id
);

}

// =====================================
// DASHBOARD
// =====================================

function renderDashboard(){

const total =
masterTasks.length;

let completed = 0;

masterTasks.forEach(task=>{

const related =
getSubtasks(task.id);

if(
related.length > 0 &&
related.every(
s=>s.status==="Completed"
)
){

completed++;

}

});

const inProgress =
tasks.filter(
t =>
t.status ===
'In Progress'
).length;

const remaining =
total - completed;

document.getElementById(
'totalTasks'
).innerText =
total;

document.getElementById(
'completedTasks'
).innerText =
completed;

document.getElementById(
'inProgressTasks'
).innerText =
inProgress;

document.getElementById(
'remainingTasks'
).innerText =
remaining;

}

// =====================================
// MASTER TASKS TABLE
// =====================================

function renderTasks(){

const tbody =
document.getElementById(
'tasksBody'
);

tbody.innerHTML='';

masterTasks.forEach(master=>{

const relatedSubtasks =
getSubtasks(master.id);

const mapping =
mappings.find(
m =>
m.reference_task_id ===
master.id
);

let progress = 0;

if(
relatedSubtasks.length > 0
){

const done =
relatedSubtasks.filter(
s =>
s.status ===
'Completed'
).length;

progress =
Math.round(
(done /
relatedSubtasks.length)
*100
);

}

const row =
document.createElement(
'tr'
);

if(progress===100){

row.classList.add(
'completed'
);

}

row.innerHTML = `

<td>

<input
type="checkbox"
class="master-check"
data-id="${master.id}"
${progress===100 ? 'checked':''}
>

</td>

<td>

<b>
${master.title}
</b>

<br>

<small>
${master.id}
</small>

</td>

<td>

${master.task_type}

</td>

<td>

${master.reference_task}

</td>

<td>

${master.id}

</td>

<td>

<span class="phase">

${master.phase}

</span>

</td>

<td>

<span class="milestone">

${findMilestoneForTask(master)}

</span>

</td>

<td>

${master.week_start}
-
${master.week_end}

</td>

<td>

<select
class="developer-select"
>

<option>Rini</option>
<option>Dhruvi</option>
<option>Charvina</option>
<option>Parth</option>
<option>Others</option>

</select>

</td>

<td>

${progress===100
?
'Completed'
:
'Pending'
}

</td>

<td>

<div class="progress">

<div
class="progress-bar"
style="width:${progress}%"
>

${progress}%

</div>

</div>

</td>

<td>

<div
id="sub-${master.id}"
>

${renderSubtaskList(
relatedSubtasks
)}

</div>

</td>

<td>

<textarea
data-id="${master.id}"
>

</textarea>

</td>

`;

tbody.appendChild(
row
);

});

}

// =====================================
// SUBTASK HTML
// =====================================

function renderSubtaskList(items){

let html='';

items.forEach(sub=>{

html += `

<div class="subtask">

<input
type="checkbox"
class="subtask-check"
data-id="${sub.id}"
${sub.status==="Completed"
?
'checked'
:
''
}
>

<b>

${sub.title}

</b>

<br>

${sub.task_type}

<br>

${sub.reference}

</div>

`;

});

return html;

}

// =====================================
// MILESTONE AUTO DETECTION
// =====================================

function findMilestoneForTask(task){

const phase =
task.phase;

const milestone =
phases.find(
p =>
p.id === phase
);

if(
milestone &&
milestone.milestone
){

return milestone.milestone;

}

return '-';

}

// =====================================
// REPORTS
// =====================================

function renderWeeklyReports(){

const container =
document.getElementById(
'weeklyReports'
);

container.innerHTML='';

reports.forEach(report=>{

container.innerHTML += `

<div class="report-card">

<h3>

${report.week}

</h3>

<p>

${report.period}

</p>

<p>

Status:
<b>
${report.status}
</b>

</p>

<p>

Manager:
${report.project_manager}

</p>

</div>

`;

});

}

// =====================================
// DAILY REPORTS PLACEHOLDER
// =====================================

function renderDailyReports(){

const container =
document.getElementById(
'dailyReports'
);

container.innerHTML = `

<div class="report-card">

<h3>

Dhruvi Daily Reports

</h3>

<p>

01 Jun 2026

Remote Desktop
Setup

</p>

<p>

02 Jun 2026

ComfyUI Setup

</p>

<p>

03 Jun 2026

Data Transfer

</p>

<p>

04 Jun 2026

Filestash Verification

</p>

<p>

05 Jun 2026

CosyVoice2 Setup

</p>

<p>

08 Jun 2026

Dialect Validation

</p>

<p>

11 Jun 2026

Timeline Editor

</p>

<p>

12 Jun 2026

Autosave
Undo/Redo
Transition System

</p>

</div>

`;

}
// =====================================
// PART 4
// EVENTS + PROGRESS + LOCAL STORAGE
// =====================================

let notesStore = {};

let developerStore = {};

const STORAGE_KEY =
'hasaballa_pecs_v1';

function attachEvents(){

// =====================================
// SUBTASK CHECKBOX
// =====================================

document
.querySelectorAll('.subtask-check')
.forEach(box=>{

box.addEventListener(
'change',
function(){

const id =
this.dataset.id;

const sub =
subtasks.find(
s=>s.id===id
);

if(!sub)
return;

if(this.checked){

sub.status =
'Completed';

}
else{

const answer =
confirm(
'هل أنت متأكد من إلغاء الإنجاز ؟'
);

if(!answer){

this.checked = true;

return;

}

sub.status =
'Pending';

}

saveLocalState();

renderDashboard();

renderTasks();

attachEvents();

restoreNotes();

restoreDevelopers();

}

);

});

});

// =====================================
// MASTER TASK CHECKBOX
// =====================================

document
.querySelectorAll('.master-check')
.forEach(box=>{

box.addEventListener(
'change',
function(){

const masterId =
this.dataset.id;

const related =
subtasks.filter(
s =>
s.parent_task ===
masterId
);

if(this.checked){

related.forEach(sub=>{

sub.status =
'Completed';

});

}
else{

const answer =
confirm(
'هل أنت متأكد من إلغاء المهمة بالكامل ؟'
);

if(!answer){

this.checked = true;

return;

}

related.forEach(sub=>{

sub.status =
'Pending';

});

}

saveLocalState();

renderDashboard();

renderTasks();

attachEvents();

restoreNotes();

restoreDevelopers();

}

);

});

});

// =====================================
// NOTES SAVE
// =====================================

document
.querySelectorAll(
'textarea[data-id]'
)
.forEach(area=>{

area.addEventListener(
'input',
function(){

const id =
this.dataset.id;

notesStore[id] =
this.value;

saveLocalState();

}

);

});

});

// =====================================
// DEVELOPER SAVE
// =====================================

document
.querySelectorAll(
'.developer-select'
)
.forEach(select=>{

select.addEventListener(
'change',
function(){

const row =
this.closest('tr');

const masterId =
row.querySelector(
'.master-check'
).dataset.id;

developerStore[
masterId
] = this.value;

saveLocalState();

}

);

});

});

}

// =====================================
// SAVE LOCAL
// =====================================

function saveLocalState(){

const state = {

subtasks,
notesStore,
developerStore

};

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(
state
)

);

}

// =====================================
// LOAD LOCAL
// =====================================

function loadLocalState(){

const saved =
localStorage.getItem(
STORAGE_KEY
);

if(!saved)
return;

try{

const state =
JSON.parse(saved);

if(state.subtasks){

subtasks =
state.subtasks;

}

if(state.notesStore){

notesStore =
state.notesStore;

}

if(state.developerStore){

developerStore =
state.developerStore;

}

}
catch(error){

console.error(
error
);

}

}
// =====================================
// PART 5
// RESTORE + SUPABASE
// =====================================

function restoreNotes(){

Object.keys(
notesStore
).forEach(id=>{

const area =
document.querySelector(

`textarea[data-id="${id}"]`

);

if(area){

area.value =
notesStore[id];

}

});

}

function restoreDevelopers(){

Object.keys(
developerStore
).forEach(id=>{

const select =
document.querySelector(

`tr:has(.master-check[data-id="${id}"]) .developer-select`

);

if(select){

select.value =
developerStore[id];

}

});

}

// =====================================
// SUPABASE SAVE
// =====================================

async function saveSupabase(){

try{

await supabase
.from('project_state')
.upsert([

{

id:1,

data:{

subtasks,
notesStore,
developerStore

},

updated_at:
new Date()
.toISOString()

}

]);

}
catch(error){

console.error(
error
);

}

}

// =====================================
// SUPABASE LOAD
// =====================================

async function loadSupabase(){

try{

const {

data,
error

}
=
await supabase

.from(
'project_state'
)

.select('*')

.eq('id',1)

.single();

if(error)
return;

if(data){

if(data.data){

if(
data.data.subtasks
){

subtasks =
data.data.subtasks;

}

if(
data.data.notesStore
){

notesStore =
data.data.notesStore;

}

if(
data.data.developerStore
){

developerStore =
data.data.developerStore;

}

}

}

}
catch(error){

console.error(
error
);

}

}

// =====================================
// AUTO SAVE
// =====================================

setInterval(()=>{

saveSupabase();

},30000);

// =====================================
// FILTERS
// =====================================

document
.getElementById(
'searchBox'
)
.addEventListener(
'input',
applyFilters
);

document
.getElementById(
'phaseFilter'
)
.addEventListener(
'change',
applyFilters
);

document
.getElementById(
'milestoneFilter'
)
.addEventListener(
'change',
applyFilters
);

document
.getElementById(
'developerFilter'
)
.addEventListener(
'change',
applyFilters
);

document
.getElementById(
'taskTypeFilter'
)
.addEventListener(
'change',
applyFilters
);

function applyFilters(){

const search =
document
.getElementById(
'searchBox'
)
.value
.toLowerCase();

const rows =
document
.querySelectorAll(
'#tasksBody tr'
);

rows.forEach(row=>{

const text =
row.innerText
.toLowerCase();

if(
text.includes(
search
)
){

row.style.display =
'';

}
else{

row.style.display =
'none';

}

});

}
// =====================================
// PART 6
// WEEKLY REPORTS + DAILY REPORTS
// =====================================

function renderWeeklyReports(){

const container =
document.getElementById(
'weeklyReports'
);

if(!container)
return;

container.innerHTML = '';

reports.forEach(report=>{

const completed =
(report.completed_tasks || [])
.map(task=>
`<li>${task}</li>`
)
.join('');

const progress =
(report.in_progress || [])
.map(task=>
`<li>${task}</li>`
)
.join('');

container.innerHTML += `

<div class="report-card">

<h3>
${report.week}
</h3>

<p>
${report.period}
</p>

<p>
<b>Status:</b>
${report.status}
</p>

<p>
<b>Project Manager:</b>
${report.project_manager}
</p>

<p>
<b>Developers:</b>
${(report.developers || []).join(', ')}
</p>

<h4>
Completed Tasks
</h4>

<ul>
${completed}
</ul>

<h4>
In Progress
</h4>

<ul>
${progress}
</ul>

</div>

`;

});

}

// =====================================
// DAILY REPORTS
// =====================================

function renderDailyReports(){

const container =
document.getElementById(
'dailyReports'
);

if(!container)
return;

container.innerHTML = `

<div class="report-card">

<h3>
Dhruvi Daily Reports
</h3>

<h4>19-05-2026</h4>
<p>
Replace Hardcoded Path Cleanup (Done)
</p>

<h4>21-05-2026</h4>
<p>
RunPod Model Setup Working
</p>

<h4>22-05-2026</h4>
<p>
ComfyUI Windows Setup Working
</p>

<h4>26-05-2026</h4>
<p>
Codebase Setup + Remote Desktop Connectivity
</p>

<h4>27-05-2026</h4>
<p>
ComfyUI Local Setup + AnyDesk Transfer
</p>

<h4>28-05-2026</h4>
<p>
Data Transfer + RDP Investigation
</p>

<h4>01-06-2026</h4>
<p>
Remote Desktop Setup Completed
</p>

<h4>02-06-2026</h4>
<p>
ComfyUI Setup Completed
</p>

<h4>03-06-2026</h4>
<p>
Data Transfer + Voice Download
</p>

<h4>04-06-2026</h4>
<p>
Filestash Verification
</p>

<h4>05-06-2026</h4>
<p>
CosyVoice 2 Setup Started
</p>

<h4>08-06-2026</h4>
<p>
Arabic Dialect Validation
</p>

<h4>11-06-2026</h4>
<p>
Timeline Editor Core Completed
</p>

<h4>12-06-2026</h4>
<p>
Timeline Editor Expansion
<br>
Undo / Redo
<br>
Autosave
<br>
Recovery
<br>
Transitions
</p>

</div>

`;

}

// =====================================
// MASTER TASK PROGRESS
// =====================================

function calculateMasterProgress(
masterId
){

const related =
subtasks.filter(
s =>
s.parent_task ===
masterId
);

if(
related.length === 0
)
return 0;

const completed =
related.filter(
s =>
s.status ===
'Completed'
).length;

return Math.round(
(
completed /
related.length
)
*100
);

}

// =====================================
// TASK STATUS
// =====================================

function getTaskStatus(
masterId
){

const progress =
calculateMasterProgress(
masterId
);

if(progress === 100)
return 'Completed';

if(progress > 0)
return 'In Progress';

return 'Pending';

}

// =====================================
// PART 7
// SUPABASE ENGINE
// =====================================

const SUPABASE_TABLE =
'project_state';

// =====================================
// SAVE TO SUPABASE
// =====================================

async function saveToSupabase(){

try{

const payload = {

id:1,

subtasks,

notesStore,

developerStore,

updated_at:
new Date()
.toISOString()

};

const {
error
}
=
await supabase

.from(
SUPABASE_TABLE
)

.upsert(
payload
);

if(error){

console.error(
'Supabase Save Error',
error
);

}

}
catch(error){

console.error(
error
);

}

}

// =====================================
// LOAD FROM SUPABASE
// =====================================

async function loadFromSupabase(){

try{

const {

data,
error

}
=
await supabase

.from(
SUPABASE_TABLE
)

.select('*')

.eq(
'id',
1
)

.single();

if(error){

console.warn(
'No Saved State Found'
);

return;

}

if(!data)
return;

if(data.subtasks){

subtasks =
data.subtasks;

}

if(data.notesStore){

notesStore =
data.notesStore;

}

if(data.developerStore){

developerStore =
data.developerStore;

}

}
catch(error){

console.error(
error
);

}

}

// =====================================
// AUTO SAVE
// =====================================

setInterval(

async ()=>{

await saveToSupabase();

},

30000

);

// =====================================
// AUTO REFRESH
// =====================================

setInterval(()=>{

renderDashboard();

},10000);

// =====================================
// RESTORE UI
// =====================================

function restoreUI(){

restoreNotes();

restoreDevelopers();

attachEvents();

}

// =====================================
// FORCE SAVE BUTTON
// =====================================

async function forceSave(){

await saveToSupabase();

alert(
'Saved Successfully'
);

}

// =====================================
// FORCE LOAD BUTTON
// =====================================

async function forceLoad(){

await loadFromSupabase();

renderDashboard();

renderTasks();

restoreUI();

alert(
'Loaded Successfully'
);

}

// =====================================
// STATUS SUMMARY
// =====================================

function buildSummary(){

const summary = {

total:
masterTasks.length,

completed:
masterTasks.filter(
task=>

calculateMasterProgress(
task.id
) === 100

).length,

inProgress:
masterTasks.filter(
task=>{

const p =
calculateMasterProgress(
task.id
);

return p>0 && p<100;

}
).length

};

return summary;

}

// =====================================
// HEADER COUNTERS REFRESH
// =====================================

function refreshCounters(){

const stats =
buildSummary();

document.getElementById(
'totalTasks'
).innerText =
stats.total;

document.getElementById(
'completedTasks'
).innerText =
stats.completed;

document.getElementById(
'inProgressTasks'
).innerText =
stats.inProgress;

document.getElementById(
'remainingTasks'
).innerText =
stats.total
-
stats.completed;

}

// =====================================
// PART 8
// STARTUP ENGINE
// =====================================

async function initializeSystem(){

try{

console.log(
'Loading Hasaballa AI PECS...'
);

await loadData();

await loadFromSupabase();

loadLocalState();

renderDashboard();

renderTasks();

renderWeeklyReports();

renderDailyReports();

restoreUI();

refreshCounters();

console.log(
'System Ready'
);

}
catch(error){

console.error(
'Initialization Error',
error
);

}

}

// =====================================
// FILTERS
// =====================================

function bindFilters(){

const search =
document.getElementById(
'searchBox'
);

if(search){

search.addEventListener(
'input',
applyFilters
);

}

const phase =
document.getElementById(
'phaseFilter'
);

if(phase){

phase.addEventListener(
'change',
applyFilters
);

}

const milestone =
document.getElementById(
'milestoneFilter'
);

if(milestone){

milestone.addEventListener(
'change',
applyFilters
);

}

const developer =
document.getElementById(
'developerFilter'
);

if(developer){

developer.addEventListener(
'change',
applyFilters
);

}

const taskType =
document.getElementById(
'taskTypeFilter'
);

if(taskType){

taskType.addEventListener(
'change',
applyFilters
);

}

}

// =====================================
// GLOBAL SAVE BUTTON
// =====================================

window.addEventListener(
'keydown',
async function(event){

if(
event.ctrlKey &&
event.key === 's'
){

event.preventDefault();

await saveToSupabase();

saveLocalState();

alert(
'Saved'
);

}

}
);

// =====================================
// AUTO START
// =====================================

document.addEventListener(
'DOMContentLoaded',
async ()=>{

await initializeSystem();

bindFilters();

}
);

// =====================================
// DEBUG
// =====================================

window.hasaballa = {

tasks,
subtasks,
masterTasks,
mappings,
phases,
milestones,
reports,

saveToSupabase,
loadFromSupabase,

renderTasks,
renderDashboard

};

console.log(
'Hasaballa PECS Loaded'
);
