/* =====================================================
   HASABALLA AI PECS
   APP.JS
   PART 1 / 3
   CONFIG + LOAD DATA + DASHBOARD
===================================================== */

const SUPABASE_URL =
"https://oivtndqstklnsxwherpp.supabase.co";

const SUPABASE_KEY =
"sb_publishable_8F2wYjRCveireb8x-JOt0A_HyjnkAZB";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const SUPABASE_TABLE =
"project_state";

/* =====================================================
   GLOBAL DATA
===================================================== */

let tasks = [];
let subtasks = [];
let reports = [];

let phases = [];
let milestones = [];

let masterTasks = [];
let mappings = [];
let developers = [];
let developerTasks = {};

let notesStore = {};
let developerStore = {};
let subtaskStore = {};

let allRows = [];

/* =====================================================
   HELPERS
===================================================== */

function log(...msg){

console.log(
"[PECS]",
...msg
);

}

function error(...msg){

console.error(
"[PECS ERROR]",
...msg
);

}

function byId(id){

return document.getElementById(id);

}

async function loadJson(path){

const response =
await fetch(path);

if(!response.ok){

throw new Error(
`Failed: ${path}`
);

}

return await response.json();

}

/* =====================================================
   LOAD ALL FILES
===================================================== */

async function loadAllData(){

try{

[
tasks,
subtasks,
reports,
phases,
milestones,
masterTasks,
mappings,
developers,
developerTasks
]

=

await Promise.all([

loadJson(
"./data/tasks.json"
),

loadJson(
"./data/subtasks.json"
),

loadJson(
"./data/reports.json"
),

loadJson(
"./data/phases.json"
),

loadJson(
"./data/milestones.json"
),

loadJson(
"./data/master_tasks.json"
),

loadJson(
"./data/mappings.json"
),

loadJson(
"./data/developers.json"
),

loadJson(
"./data/developer_tasks.json"
)

]);

log(
"All JSON Loaded"
);

log(
"Tasks:",
tasks.length
);

log(
"Subtasks:",
subtasks.length
);

log(
"Reports:",
reports.length
);

}
catch(err){

error(
"LOAD ERROR",
err
);

alert(
"Error Loading JSON Files"
);

}

}

/* =====================================================
   FINDERS
===================================================== */

function getMasterTask(id){

return masterTasks.find(
m => m.id === id
);

}

function getMappingByTask(title){

return mappings.find(
m =>
m.developer_task
?.toLowerCase()
===
title
?.toLowerCase()
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
d =>
d.name
?.toLowerCase()
===
name
?.toLowerCase()
);

}

function getDeveloperTasksForSubtask(subtaskTitle){

return Object.keys(developerTasks)
.filter(task =>

developerTasks[task]
.includes(subtaskTitle)

);

}

/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard(){

const total = masterTasks.length;

const completed =
tasks.filter(
t =>
t.status
?.toLowerCase()
===
"completed"
).length;

const inProgress =
tasks.filter(
t =>
t.status
?.toLowerCase()
===
"in progress"
).length;

const remaining =
Math.max(0, total - completed);

byId(
"totalTasks"
).textContent =
total;

byId(
"completedTasks"
).textContent =
completed;

byId(
"inProgressTasks"
).textContent =
inProgress;

byId(
"remainingTasks"
).textContent =
remaining;

}

/* =====================================================
   PROGRESS BAR
===================================================== */

function progressHtml(value){

return `

<div class="progress">

<div
class="progress-bar"
style="width:${value}%">

${value}%

</div>

</div>

`;

}

/* =====================================================
   STATUS COLORS
===================================================== */

function getStatusBadge(status){

const s =
(status || "")
.toLowerCase();

if(
s === "completed"
){

return `
<span
style="
color:#16a34a;
font-weight:700;
">
Completed
</span>
`;

}

if(
s === "in progress"
){

return `
<span
style="
color:#f59e0b;
font-weight:700;
">
In Progress
</span>
`;

}

return `
<span
style="
color:#64748b;
font-weight:700;
">
Pending
</span>
`;

}

/* =====================================================
   SAVE LOCAL
===================================================== */

function saveLocal(){

localStorage.setItem(
"hasaballa_notes",
JSON.stringify(
notesStore
)
);

localStorage.setItem(
"hasaballa_subtasks",
JSON.stringify(
subtaskStore
)
);

localStorage.setItem(
"hasaballa_developers",
JSON.stringify(
developerStore
)
);

}

/* =====================================================
   LOAD LOCAL
===================================================== */

function loadLocal(){

try{

notesStore =
JSON.parse(
localStorage.getItem(
"hasaballa_notes"
)
|| "{}"
);

subtaskStore =
JSON.parse(
localStorage.getItem(
"hasaballa_subtasks"
)
|| "{}"
);

developerStore =
JSON.parse(
localStorage.getItem(
"hasaballa_developers"
)
|| "{}"
);

}
catch(err){

error(
"LOCAL STORAGE ERROR",
err
);

}

}
/* =====================================================
   HASABALLA AI PECS
   APP.JS
   PART 2 / 3
   TASKS + SUBTASKS + REPORTS
===================================================== */

/* =====================================================
   SUBTASKS
===================================================== */

function getSubtasks(masterId){

return subtasks.filter(
s =>
s.parent_task ===
masterId
);

}

function getSubtaskProgress(masterId){

const items =
getSubtasks(masterId);

if(
items.length === 0
)
return 0;

let completed = 0;

items.forEach(item=>{

const saved =
subtaskStore[item.id];

if(
saved === true
){

completed++;

}

});

return Math.round(

(
completed /
items.length
)
*100

);

}

/* =====================================================
   SUBTASK HTML
===================================================== */

function renderSubtasks(masterId){

const items = getSubtasks(masterId);

return `

<div class="subtask-wrapper">

<button
class="toggle-subtasks"
data-task="${masterId}"
>

▼ ${items.length} Tasks

</button>

<div
class="subtask-list hidden"
id="subtasks-${masterId}"
>

${items.map(item=>`

<div class="subtask">

<label>

<input
type="checkbox"
class="subtask-check"
data-id="${item.id}"
${subtaskStore[item.id] ? "checked" : ""}

>

${item.title}

${getDeveloperTasksForSubtask(item.title)
.map(devTask => `

<div class="developer-task">

⚙ ${devTask}

</div>

`)
.join("")}

</label>

</div>

`).join("")}

</div>

</div>

`;

}

/* =====================================================
   DEVELOPER SELECT
===================================================== */

function renderDeveloperSelect(taskId){

const current =
developerStore[taskId]
||
"Rini";

return `

<select
class="developer-select"
data-task="${taskId}"
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

/* =====================================================
   NOTES
===================================================== */

function renderNotes(taskId){

return `
<textarea
class="notes-box"
data-task="${taskId}"
placeholder="Notes...">${notesStore[taskId] || ""}</textarea>
`;

}

/* =====================================================
   TASK TABLE
===================================================== */

function renderTasks(){

const body =
byId(
"tasksBody"
);

if(!body)
return;

body.innerHTML = "";

masterTasks.forEach(master=>{

const taskInfo =
tasks.find(
t => t.id === master.id
);

const progress =
taskInfo?.status === "completed"
?
100
:
getSubtaskProgress(master.id);

const phase =
master.phase;

const phaseInfo =
getPhase(
phase
);

const milestoneInfo =
phaseInfo
?
getMilestone(
phaseInfo.milestone
)
:
null;

body.innerHTML += `

<tr class="${
progress === 100
?
'completed'
:
''
}">

<td>

<input
type="checkbox"
${progress===100
?
"checked"
:
""
}
disabled>

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

${phase}

</td>

<td>

${milestoneInfo
?
milestoneInfo.id
:
"-"
}

</td>

<td>

${master.week_start}
-
${master.week_end}

</td>

<td>

${renderDeveloperSelect(
master.id
)}

</td>

<td>

${getStatusBadge(
progress===100
?
"completed"
:
progress>0
?
"in progress"
:
"pending"
)}

</td>

<td>

${progressHtml(
progress
)}

</td>

<td>
   ${renderDeveloperTasks(master.id)}
</td>

<td>
   ${renderSubtasks(master.id)}
</td>

<td>

${renderNotes(
master.id
)}

</td>

</tr>

`;

});

attachTaskEvents();

}

function renderDeveloperTasks(masterId){

   const items = [];

   getSubtasks(masterId).forEach(sub => {

      Object.entries(developerTasks).forEach(([devTask, links]) => {

         if(links.includes(sub.title)){

            items.push(devTask);

         }

      });

   });

   return items.map(task => `
      <div class="developer-task">
         ${task}
      </div>
   `).join("");

}

/* =====================================================
   TASK EVENTS
===================================================== */

function attachTaskEvents(){

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

subtaskStore[id] =
this.checked;

saveLocal();

renderTasks();

renderDashboard();

});

});

document
.querySelectorAll(
".notes-box"
)
.forEach(area=>{

area.addEventListener(
"input",
function(){

notesStore[
this.dataset.task
]
=
this.value;

saveLocal();

});

});

document
.querySelectorAll(
".developer-select"
)
.forEach(select=>{

select.addEventListener(
"change",
function(){

developerStore[
this.dataset.task
]
=
this.value;

saveLocal();

});

});

document
.querySelectorAll(
".toggle-subtasks"
)
.forEach(btn=>{

btn.addEventListener(
"click",
function(){

const taskId =
this.dataset.task;

const target =
document.getElementById(
`subtasks-${taskId}`
);

if(target){

target.classList.toggle(
"hidden"
);

}

});

});

}

/* =====================================================
   WEEKLY REPORTS
===================================================== */

function renderWeeklyReports(){

const container =
byId(
"weeklyReports"
);

if(!container)
return;

container.innerHTML = "";

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

<b>Status:</b>

${report.status}

</p>

<p>

<b>Project Manager:</b>

${report.project_manager}

</p>

<p>

<b>Developers:</b>

${report.developers.join(
", "
)}

</p>

<hr>

<h4>

Completed Tasks

</h4>

<ul>

${report.completed_tasks
.map(item=>`
<li>${item}</li>
`)
.join("")}

</ul>

<h4>

In Progress

</h4>

<ul>

${report.in_progress
.map(item=>`
<li>${item}</li>
`)
.join("")}

</ul>

</div>

`;

});

}

/* =====================================================
   DAILY REPORTS
===================================================== */

function renderDailyReports(){

const container =
byId(
"dailyReports"
);

if(!container)
return;

container.innerHTML = `

<div class="report-card">

<h3>

Daily Reports

</h3>

<p>

Loaded From
daily_reports.json

</p>

<p>

Ready For Expansion

</p>

</div>

`;

}

/* =====================================================
   REFRESH ALL
===================================================== */

function refreshAll(){

renderDashboard();

renderTasks();

renderWeeklyReports();

renderDailyReports();

}
/* =====================================================
   HASABALLA AI PECS
   APP.JS
   PART 3 / 3
   FILTERS + SUPABASE + STARTUP
===================================================== */

/* =====================================================
   FILTERS
===================================================== */

function populateFilters(){

const phaseFilter =
byId("phaseFilter");

const milestoneFilter =
byId("milestoneFilter");

const developerFilter =
byId("developerFilter");

const taskTypeFilter =
byId("taskTypeFilter");

/* PHASES */

if(phaseFilter){

phaseFilter.innerHTML =
'<option value="">كل المراحل</option>';

const phaseList =
phases.filter(
p =>
p.id &&
p.id.startsWith("P")
);

phaseList.forEach(phase=>{

phaseFilter.innerHTML +=
`
<option value="${phase.id}">
${phase.id}
</option>
`;

});

}

/* MILESTONES */

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

/* DEVELOPERS */

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

/* TASK TYPES */

if(taskTypeFilter){

taskTypeFilter.innerHTML =
'<option value="">كل أنواع المهام</option>';

const uniqueTypes =
[
...new Set(
masterTasks.map(
t => t.task_type
)
)
];

uniqueTypes.forEach(type=>{

taskTypeFilter.innerHTML +=
`
<option value="${type}">
${type}
</option>
`;

});

}

}

/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters(){

const search =
(
byId("searchBox")
?.value
||
""
)
.toLowerCase();

const phase =
byId("phaseFilter")
?.value
||
"";

const milestone =
byId("milestoneFilter")
?.value
||
"";

const developer =
byId("developerFilter")
?.value
||
"";

const taskType =
byId("taskTypeFilter")
?.value
||
"";

document
.querySelectorAll(
"#tasksBody tr"
)
.forEach(row=>{

let visible = true;

const text =
row.innerText
.toLowerCase();

/* SEARCH */

if(
search &&
!text.includes(search)
){

visible = false;

}

/* PHASE */

if(
phase &&
visible
){

if(
!row.children[5]
.innerText
.includes(phase)
){

visible = false;

}

}

/* MILESTONE */

if(
milestone &&
visible
){

if(
!row.children[6]
.innerText
.includes(
milestone
)
){

visible = false;

}

}

/* DEVELOPER */

if(
developer &&
visible
){

if(
!row.children[8]
.innerText
.includes(
developer
)
){

visible = false;

}

}

/* TYPE */

if(
taskType &&
visible
){

if(
!row.children[2]
.innerText
.includes(
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

/* =====================================================
   FILTER EVENTS
===================================================== */

function bindFilters(){

[
"searchBox",
"phaseFilter",
"milestoneFilter",
"developerFilter",
"taskTypeFilter"

].forEach(id=>{

const element =
byId(id);

if(!element)
return;

element.addEventListener(

id==="searchBox"
?
"input"
:
"change",

applyFilters

);

});

}

/* =====================================================
   SUPABASE SAVE
===================================================== */

async function saveToSupabase(){

try{

const payload = {

id: 1,

notesStore,

developerStore,

subtaskStore,

updated_at:
new Date().toISOString()

};

const {
error: saveError
}
=
await supabaseClient
.from(
SUPABASE_TABLE
)
.upsert(
payload,
{
onConflict: "id"
}
);

if(saveError){

throw saveError;

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

/* =====================================================
   SUPABASE LOAD
===================================================== */

async function loadFromSupabase(){

try{

const {
data,
error:dbError
}
=
await supabaseClient

.from(
SUPABASE_TABLE
)

.select("*")

.eq(
"id",
1
)

.maybeSingle();

if(dbError){

log(
"No Remote State"
);

return;

}

if(!data)
return;

notesStore =
data.notesStore
||
{};

developerStore =
data.developerStore
||
{};

subtaskStore =
data.subtaskStore
||
{};

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

/* =====================================================
   FORCE SAVE
===================================================== */

async function forceSave(){

saveLocal();

alert(
"Saved Successfully"
);

}

/* =====================================================
   FORCE LOAD
===================================================== */

async function forceLoad(){

/* wait loadFromSupabase(); */

refreshAll();

alert(
"Loaded Successfully"
);

}

/* =====================================================
   CTRL + S
===================================================== */

window.addEventListener(
"keydown",
async function(event){

if(
event.ctrlKey &&
event.key==="s"
){

event.preventDefault();

await forceSave();

}

}
);

/* =====================================================
   AUTO SAVE
===================================================== */

setInterval(

()=>{

saveLocal();

},

30000

);

/* =====================================================
   TEST CONNECTION
===================================================== */

async function testSupabase(){

try{

const {
data,
error
}
=
await supabaseClient
.from(SUPABASE_TABLE)
.select("id")
.limit(1);

if(error){

throw error;

}

console.log(
"Supabase Connected"
);

return true;

}
catch(err){

console.error(
"Supabase Connection Error",
err
);

return false;

}

}

/* =====================================================
   STARTUP
===================================================== */

async function initializeSystem(){

try{

log(
"Starting PECS..."
);

await loadAllData();

loadLocal();

/*await loadFromSupabase();*/

populateFilters();

refreshAll();

bindFilters();

/*await testSupabase();*/

log(
"System Ready"
);

}
catch(err){

error(
"Initialization Error",
err
);

}

}

/* =====================================================
   DEBUG OBJECT
===================================================== */

window.hasaballa = {

get tasks(){
return tasks;
},

get subtasks(){
return subtasks;
},

get reports(){
return reports;
},

get phases(){
return phases;
},

get milestones(){
return milestones;
},

get masterTasks(){
return masterTasks;
},

get mappings(){
return mappings;
},

get developers(){
return developers;
},

refreshAll,

saveToSupabase,
loadFromSupabase,

forceSave,
forceLoad

};

/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(

"DOMContentLoaded",

async ()=>{

await initializeSystem();

}

);

/* =====================================================
   END OF FILE
===================================================== */
