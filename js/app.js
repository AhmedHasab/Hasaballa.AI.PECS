const SUPABASE_URL =
"https://oivtndqstklnsxwherpp.supabase.co";

const SUPABASE_KEY =
"sb_publishable_8F2wYjRCveireb8x-JOt0A_HyjnkAZB";

const supabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

// ======================================
// GLOBAL DATA
// ======================================

let tasks = [];
let subtasks = [];
let masterTasks = [];
let mappings = [];
let phases = [];
let milestones = [];
let reports = [];
let dailyReports = [];
let developers = [];

// ======================================
// LOCAL STORAGE
// ======================================

const STORAGE_KEY =
"hasaballa_ai_pecs_v2";

let notesStore = {};

let developerStore = {};

let appReady = false;

// ======================================
// DOM HELPERS
// ======================================

function $(id){

return document.getElementById(id);

}

function create(tag){

return document.createElement(tag);

}

// ======================================
// LOGGING
// ======================================

function log(message){

console.log(
"[Hasaballa AI]",
message
);

}

function error(message,data){

console.error(
"[Hasaballa AI]",
message,
data
);

}
// ======================================
// JSON LOADER
// ======================================

async function loadJson(path){

try{

const response =
await fetch(path);

if(!response.ok){

throw new Error(
`Failed: ${path}`
);

}

return await response.json();

}
catch(err){

error(
`JSON Load Error: ${path}`,
err
);

return [];

}

}

// ======================================
// LOAD ALL DATA
// ======================================

async function loadAllData(){

log(
"Loading JSON Files..."
);

const results =
await Promise.all([

loadJson(
"./data/tasks.json"
),

loadJson(
"./data/subtasks.json"
),

loadJson(
"./data/master_tasks.json"
),

loadJson(
"./data/mappings.json"
),

loadJson(
"./data/phases.json"
),

loadJson(
"./data/milestones.json"
),

loadJson(
"./data/reports.json"
),

loadJson(
"./data/daily_reports.json"
),

loadJson(
"./data/developers.json"
)

]);

tasks =
results[0];

subtasks =
results[1];

masterTasks =
results[2];

mappings =
results[3];

phases =
results[4];

milestones =
results[5];

reports =
results[6];

dailyReports =
results[7];

developers =
results[8];

log(
"All JSON Files Loaded"
);

populateFilters();

}

// ======================================
// LOOKUP HELPERS
// ======================================

function getMasterTask(id){

return masterTasks.find(
t => t.id === id
);

}

function getSubtasks(masterId){

return subtasks.filter(
s =>
s.parent_task ===
masterId
);

}

function getMapping(masterId){

return mappings.find(
m =>
m.reference_task_id ===
masterId
);

}

function getPhase(id){

return phases.find(
p => p.id === id
);

}

function getMilestone(id){

return milestones.find(
m => m.id === id
);

}

function getDeveloper(name){

return developers.find(
d => d.name === name
);

}

// ======================================
// FILTER DROPDOWNS
// ======================================

function populateFilters(){

const phaseFilter =
$("phaseFilter");

const milestoneFilter =
$("milestoneFilter");

const taskTypeFilter =
$("taskTypeFilter");

const developerFilter =
$("developerFilter");

if(phaseFilter){

phaseFilter.innerHTML =
'<option value="">كل المراحل</option>';

phases
.filter(
p =>
p.id &&
p.id.startsWith("P")
)
.forEach(phase=>{

phaseFilter.innerHTML +=
`

<option value="${phase.id}">
${phase.id}
</option>
`;

});

}

if(milestoneFilter){

milestoneFilter.innerHTML =
'<option value="">كل الـ Milestones</option>';

milestones.forEach(ms=>{

milestoneFilter.innerHTML +=
`

<option value="${ms.id}">
${ms.id}
</option>
`;

});

}

if(taskTypeFilter){

taskTypeFilter.innerHTML =
'<option value="">كل أنواع المهام</option>';

masterTasks.forEach(task=>{

taskTypeFilter.innerHTML +=
`

<option value="${task.task_type}">
${task.task_type}
</option>
`;

});

}

if(developerFilter){

developerFilter.innerHTML =
'<option value="">كل المطورين</option>';

developers.forEach(dev=>{

developerFilter.innerHTML +=
`

<option value="${dev.name}">
${dev.name}
</option>
`;

});

}

}
// ======================================
// RELATIONS ENGINE
// ======================================

function getTaskMapping(masterId){

return mappings.find(
m =>
m.reference_task_id ===
masterId
);

}

function getDeveloperTask(masterId){

const mapping =
getTaskMapping(masterId);

if(!mapping)
return null;

return tasks.find(
t =>
t.id ===
mapping.developer_task_id
);

}

function getMasterPhase(master){

if(master.phase)
return master.phase;

const task =
getDeveloperTask(
master.id
);

if(task && task.phase)
return task.phase;

return "-";

}

function getMasterMilestone(master){

if(master.milestone)
return master.milestone;

const phase =
getMasterPhase(
master
);

const phaseObj =
phases.find(
p =>
p.id === phase
);

if(
phaseObj &&
phaseObj.milestone
){

return phaseObj.milestone;

}

return "-";

}

// ======================================
// SUBTASKS
// ======================================

function getMasterSubtasks(masterId){

return subtasks.filter(
sub =>
sub.parent_task ===
masterId
);

}

function getCompletedSubtasks(masterId){

return getMasterSubtasks(
masterId
)
.filter(
sub =>
sub.status ===
"Completed"
);

}

// ======================================
// PROGRESS
// ======================================

function calculateProgress(masterId){

const items =
getMasterSubtasks(
masterId
);

if(
items.length === 0
)
return 0;

const completed =
items.filter(
item =>
item.status ===
"Completed"
).length;

return Math.round(
(
completed /
items.length
)
*100
);

}

function getStatus(masterId){

const progress =
calculateProgress(
masterId
);

if(progress === 100){

return "Completed";

}

if(progress > 0){

return "In Progress";

}

return "Pending";

}

// ======================================
// DASHBOARD STATS
// ======================================

function getDashboardStats(){

const total =
masterTasks.length;

let completed = 0;

let inProgress = 0;

let pending = 0;

masterTasks.forEach(task=>{

const status =
getStatus(
task.id
);

if(
status ===
"Completed"
){

completed++;

}
else if(
status ===
"In Progress"
){

inProgress++;

}
else{

pending++;

}

});

return {

total,
completed,
inProgress,
pending

};

}

// ======================================
// COUNTERS
// ======================================

function refreshCounters(){

const stats =
getDashboardStats();

$("totalTasks").innerText =
stats.total;

$("completedTasks").innerText =
stats.completed;

$("inProgressTasks").innerText =
stats.inProgress;

$("remainingTasks").innerText =
stats.pending;

}

// ======================================
// TASK TYPE
// ======================================

function getTaskType(master){

if(
master.task_type
){

return master.task_type;

}

const task =
getDeveloperTask(
master.id
);

if(
task &&
task.task_type
){

return task.task_type;

}

return "General";

}

// ======================================
// WEEK RANGE
// ======================================

function getWeekRange(master){

if(
master.week_start &&
master.week_end
){

return
`${master.week_start}
---------------------

${master.week_end}`;

}

const task =
getDeveloperTask(
master.id
);

if(
task &&
task.week
){

return task.week;

}

return "-";

}
// ======================================
// DASHBOARD RENDER
// ======================================

function renderDashboard(){

refreshCounters();

}

// ======================================
// SUBTASK HTML
// ======================================

function renderSubtasks(masterId){

const items =
getMasterSubtasks(
masterId
);

if(
items.length === 0
){

return `

<div class="subtask">
No Subtasks
</div>
`;

}

return items.map(item=>`

<div class="subtask">

<label>

<input
type="checkbox"
class="subtask-check"
data-id="${item.id}"
${item.status==="Completed"
?
"checked"
:
""
}

>

<b>
${item.title}
</b>

</label>

<br>

<small>

${item.task_type || ""}

</small>

</div>

`).join("");

}

// ======================================
// DEVELOPER
// ======================================

function renderDeveloper(master){

const saved =
developerStore[
master.id
];

const current =
saved || "Rini";

return `

<select
class="developer-select"
data-id="${master.id}"

>

${developers.map(dev=>`

<option
value="${dev.name}"
${current===dev.name
?
"selected"
:
""
}
>

${dev.name}

</option>

`).join("")}

</select>

`;

}

// ======================================
// PROGRESS BAR
// ======================================

function renderProgress(masterId){

const progress =
calculateProgress(
masterId
);

return `

<div class="progress">

<div
class="progress-bar"
style="
width:${progress}%;
"
>

${progress}%

</div>

</div>

`;

}

// ======================================
// TASK ROW
// ======================================

function buildTaskRow(master){

const progress =
calculateProgress(
master.id
);

const status =
getStatus(
master.id
);

const rowClass =
progress === 100
?
"completed"
:
"";

return `

<tr class="${rowClass}">

<td>

<input
type="checkbox"
class="master-check"
data-id="${master.id}"
${progress===100
?
"checked"
:
""
}

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

${getTaskType(
master
)}

</td>

<td>

${master.reference_task || "-"}

</td>

<td>

${master.id}

</td>

<td>

<span class="phase">

${getMasterPhase(
master
)}

</span>

</td>

<td>

<span class="milestone">

${getMasterMilestone(
master
)}

</span>

</td>

<td>

${getWeekRange(
master
)}

</td>

<td>

${renderDeveloper(
master
)}

</td>

<td>

${status}

</td>

<td>

${renderProgress(
master.id
)}

</td>

<td>

${renderSubtasks(
master.id
)}

</td>

<td>

<textarea
data-id="${master.id}"
>

${notesStore[
master.id
] || ""}

</textarea>

</td>

</tr>

`;

}

// ======================================
// TASK TABLE
// ======================================

function renderTasks(){

const body =
$("tasksBody");

if(!body)
return;

body.innerHTML = "";

masterTasks.forEach(master=>{

body.innerHTML +=
buildTaskRow(
master
);

});

attachEvents();

}

// ======================================
// REFRESH ALL
// ======================================

function refreshAll(){

renderDashboard();

renderTasks();

}
// ======================================
// EVENTS ENGINE
// ======================================

function attachEvents(){

attachSubtaskEvents();

attachMasterEvents();

attachNotesEvents();

attachDeveloperEvents();

}

// ======================================
// SUBTASK EVENTS
// ======================================

function attachSubtaskEvents(){

document
.querySelectorAll(
".subtask-check"
)
.forEach(box=>{

box.addEventListener(
"change",
function(){

const id =
this.dataset.id;

const sub =
subtasks.find(
s => s.id === id
);

if(!sub)
return;

sub.status =
this.checked
?
"Completed"
:
"Pending";

saveLocalState();

refreshAll();

});

});

}

// ======================================
// MASTER EVENTS
// ======================================

function attachMasterEvents(){

document
.querySelectorAll(
".master-check"
)
.forEach(box=>{

box.addEventListener(
"change",
function(){

const masterId =
this.dataset.id;

const related =
getMasterSubtasks(
masterId
);

related.forEach(item=>{

item.status =
this.checked
?
"Completed"
:
"Pending";

});

saveLocalState();

refreshAll();

});

});

}

// ======================================
// NOTES EVENTS
// ======================================

function attachNotesEvents(){

document
.querySelectorAll(
"textarea[data-id]"
)
.forEach(area=>{

area.addEventListener(
"input",
function(){

const id =
this.dataset.id;

notesStore[id] =
this.value;

saveLocalState();

});

});

}

// ======================================
// DEVELOPER EVENTS
// ======================================

function attachDeveloperEvents(){

document
.querySelectorAll(
".developer-select"
)
.forEach(select=>{

select.addEventListener(
"change",
function(){

const id =
this.dataset.id;

developerStore[id] =
this.value;

saveLocalState();

});

});

}

// ======================================
// LOCAL STORAGE SAVE
// ======================================

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

// ======================================
// LOCAL STORAGE LOAD
// ======================================

function loadLocalState(){

const raw =
localStorage.getItem(
STORAGE_KEY
);

if(!raw)
return;

try{

const state =
JSON.parse(raw);

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
catch(err){

error(
"Local Storage Error",
err
);

}

}

// ======================================
// CLEAR STORAGE
// ======================================

function clearLocalState(){

localStorage.removeItem(
STORAGE_KEY
);

}

// ======================================
// RESTORE UI
// ======================================

function restoreUI(){

attachEvents();

}

// ======================================
// AUTO SAVE
// ======================================

setInterval(()=>{

saveLocalState();

},15000);
// ======================================
// WEEKLY REPORTS
// ======================================

function renderWeeklyReports(){

const container =
$("weeklyReports");

if(!container)
return;

container.innerHTML = "";

reports.forEach(report=>{

const completed =
(report.completed_tasks || [])
.map(task=>`

<li>

${task}

</li>

`)
.join("");

const progress =
(report.in_progress || [])
.map(task=>`

<li>

${task}

</li>

`)
.join("");

container.innerHTML += `

<div class="report-card">

<h3>

${report.week || ""}

</h3>

<p>

${report.period || ""}

</p>

<p>

<b>
Status:
</b>

${report.status || ""}

</p>

<p>

<b>
Project Manager:
</b>

${report.project_manager || ""}

</p>

<p>

<b>
Developers:
</b>

${(report.developers || [])
.join(", ")}

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

// ======================================
// DAILY REPORTS
// ======================================

function renderDailyReports(){

const container =
$("dailyReports");

if(!container)
return;

container.innerHTML = "";

// لو الملف موجود

if(
dailyReports &&
dailyReports.length
){

dailyReports.forEach(item=>{

container.innerHTML += `

<div class="report-card">

<h3>

${item.date || ""}

</h3>

<p>

${item.title || ""}

</p>

<p>

${item.description || ""}

</p>

</div>

`;

});

return;

}

// ======================================
// FALLBACK REPORTS
// ======================================

const fallback = [

{
date:"19-05-2026",
text:"Replace Hardcoded Path Cleanup"
},

{
date:"21-05-2026",
text:"RunPod Model Setup"
},

{
date:"22-05-2026",
text:"ComfyUI Windows Setup"
},

{
date:"26-05-2026",
text:"Remote Desktop Connectivity"
},

{
date:"27-05-2026",
text:"AnyDesk Transfer + ComfyUI"
},

{
date:"28-05-2026",
text:"Data Transfer"
},

{
date:"01-06-2026",
text:"Remote Desktop Setup Completed"
},

{
date:"02-06-2026",
text:"ComfyUI Setup Completed"
},

{
date:"03-06-2026",
text:"Voice Download + Transfer"
},

{
date:"04-06-2026",
text:"Filestash Verification"
},

{
date:"05-06-2026",
text:"CosyVoice 2 Setup"
},

{
date:"08-06-2026",
text:"Arabic Dialect Validation"
},

{
date:"11-06-2026",
text:"Timeline Editor Completed"
},

{
date:"12-06-2026",
text:"Undo / Redo / Autosave / Recovery"
}

];

fallback.forEach(item=>{

container.innerHTML += `

<div class="report-card">

<h3>

${item.date}

</h3>

<p>

${item.text}

</p>

</div>

`;

});

}

// ======================================
// REPORT SUMMARY
// ======================================

function getReportsCount(){

return {

weekly:
reports.length,

daily:
dailyReports.length

};

}

// ======================================
// REPORT REFRESH
// ======================================

function refreshReports(){

renderWeeklyReports();

renderDailyReports();

}
// ======================================
// SUPABASE TABLE
// ======================================

const SUPABASE_TABLE =
"project_state";

// ======================================
// SAVE TO SUPABASE
// ======================================

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

throw error;

}

log(
"Supabase Saved"
);

}
catch(err){

error(
"Supabase Save Error",
err
);

}

}

// ======================================
// LOAD FROM SUPABASE
// ======================================

async function loadFromSupabase(){

try{

const {

data,
error:dbError

# }

await supabase

.from(
SUPABASE_TABLE
)

.select("*")

.eq(
"id",
1
)

.single();

if(dbError){

log(
"No Remote State Found"
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

log(
"Supabase Loaded"
);

}
catch(err){

error(
"Supabase Load Error",
err
);

}

}

// ======================================
// FORCE SAVE
// ======================================

async function forceSave(){

saveLocalState();

await saveToSupabase();

alert(
"Saved Successfully"
);

}

// ======================================
// FORCE LOAD
// ======================================

async function forceLoad(){

await loadFromSupabase();

refreshAll();

restoreUI();

alert(
"Loaded Successfully"
);

}

// ======================================
// CTRL + S
// ======================================

window.addEventListener(
"keydown",
async function(event){

if(
event.ctrlKey &&
event.key === "s"
){

event.preventDefault();

await forceSave();

}

}
);

// ======================================
// AUTO SAVE
// ======================================

setInterval(

async ()=>{

saveLocalState();

await saveToSupabase();

},

30000

);

// ======================================
// SAVE BEFORE EXIT
// ======================================

window.addEventListener(
"beforeunload",
function(){

saveLocalState();

}
);

// ======================================
// CONNECTION TEST
// ======================================

async function testSupabase(){

try{

const {
error
}
=

await supabase

.from(
SUPABASE_TABLE
)

.select("id")

.limit(1);

if(error){

console.warn(
"Supabase Not Ready"
);

return false;

}

console.log(
"Supabase Connected"
);

return true;

}
catch(err){

console.error(
err
);

return false;

}

}
// ======================================
// FILTERS ENGINE
// ======================================

function applyFilters(){

const search =
$("searchBox")?.value
.toLowerCase()
.trim() || "";

const phase =
$("phaseFilter")?.value || "";

const milestone =
$("milestoneFilter")?.value || "";

const developer =
$("developerFilter")?.value || "";

const taskType =
$("taskTypeFilter")?.value || "";

document
.querySelectorAll(
"#tasksBody tr"
)
.forEach(row=>{

const rowText =
row.innerText
.toLowerCase();

let visible = true;

// SEARCH

if(
search &&
!rowText.includes(search)
){

visible = false;

}

// PHASE

if(
phase &&
visible
){

const phaseCell =
row.children[5];

if(
phaseCell &&
!phaseCell.innerText.includes(
phase
)
){

visible = false;

}

}

// MILESTONE

if(
milestone &&
visible
){

const milestoneCell =
row.children[6];

if(
milestoneCell &&
!milestoneCell.innerText.includes(
milestone
)
){

visible = false;

}

}

// DEVELOPER

if(
developer &&
visible
){

const developerCell =
row.children[8];

if(
developerCell &&
!developerCell.innerText.includes(
developer
)
){

visible = false;

}

}

// TASK TYPE

if(
taskType &&
visible
){

const typeCell =
row.children[2];

if(
typeCell &&
!typeCell.innerText.includes(
taskType
)
){

visible = false;

}

}

row.style.display =
visible
?
""
:
"none";

});

}

// ======================================
// FILTER EVENTS
// ======================================

function bindFilters(){

[
"searchBox",
"phaseFilter",
"milestoneFilter",
"developerFilter",
"taskTypeFilter"
]

.forEach(id=>{

const element =
$(id);

if(!element)
return;

element.addEventListener(

id === "searchBox"
?
"input"
:
"change",

applyFilters

);

});

}

// ======================================
// STARTUP
// ======================================

async function initializeSystem(){

try{

log(
"Starting Hasaballa AI PECS..."
);

// JSON

await loadAllData();

// LOCAL

loadLocalState();

// REMOTE

await loadFromSupabase();

// UI

renderDashboard();

renderTasks();

renderWeeklyReports();

renderDailyReports();

restoreUI();

refreshCounters();

bindFilters();

// TEST

await testSupabase();

appReady = true;

log(
"System Ready"
);

}
catch(err){

error(
"Startup Error",
err
);

}

}

// ======================================
// DEBUG PANEL
// ======================================

window.hasaballa = {

tasks,
subtasks,
masterTasks,
mappings,
phases,
milestones,
reports,
dailyReports,
developers,

refreshAll,
renderTasks,
renderDashboard,

saveToSupabase,
loadFromSupabase,

forceSave,
forceLoad

};

// ======================================
// AUTO START
// ======================================

document.addEventListener(
"DOMContentLoaded",
async ()=>{

await initializeSystem();

});

// ======================================
// HEARTBEAT
// ======================================

setInterval(()=>{

if(!appReady)
return;

console.log(
"Hasaballa AI PECS Running"
);

},60000);

// ======================================
// END OF APP.JS
// ======================================
