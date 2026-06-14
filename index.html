/* =====================================================
   HASABALLA AI PECS
   CLEAN APP.JS
   PART 1 / 2
===================================================== */

const SUPABASE_URL =
"https://oivtndqstklnsxwherpp.supabase.co";

const SUPABASE_KEY =
"sb_publishable_8F2wYjRCveireb8x-JOt0A_HyjnkAZB";

const sb =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const DATA = {
tasks: [],
subtasks: [],
reports: [],
phases: [],
milestones: [],
masterTasks: [],
mappings: [],
developers: []
};

const FILTERS = {
search: "",
phase: "",
milestone: "",
developer: "",
taskType: ""
};

function el(id){
return document.getElementById(id);
}

async function loadJSON(path){

const response =
await fetch(path);

if(!response.ok){

throw new Error(
`Failed loading ${path}`
);

}

return await response.json();

}

async function loadAllData(){

const results =
await Promise.all([

loadJSON("./data/tasks.json"),

loadJSON("./data/subtasks.json"),

loadJSON("./data/reports.json"),

loadJSON("./data/phases.json"),

loadJSON("./data/milestones.json"),

loadJSON("./data/master_tasks.json"),

loadJSON("./data/mappings.json"),

loadJSON("./data/developers.json")

]);

DATA.tasks = results[0];
DATA.subtasks = results[1];
DATA.reports = results[2];
DATA.phases = results[3];
DATA.milestones = results[4];
DATA.masterTasks = results[5];
DATA.mappings = results[6];
DATA.developers = results[7];

}

function updateDashboard(){

const total =
DATA.masterTasks.length;

const completed =
DATA.tasks.filter(
x=>x.status==="Completed"
).length;

const inProgress =
DATA.tasks.filter(
x=>x.status==="In Progress"
).length;

const remaining =
Math.max(
0,
total-completed
);

el("totalTasks").textContent =
total;

el("completedTasks").textContent =
completed;

el("inProgressTasks").textContent =
inProgress;

el("remainingTasks").textContent =
remaining;

}

function populateFilters(){

const phaseFilter =
el("phaseFilter");

const developerFilter =
el("developerFilter");

const taskTypeFilter =
el("taskTypeFilter");

const milestoneFilter =
el("milestoneFilter");

DATA.phases.forEach(p=>{

phaseFilter.innerHTML +=
`
<option value="${p.id}">
${p.id} - ${p.name}
</option>
`;

});

DATA.milestones.forEach(m=>{

milestoneFilter.innerHTML +=
`
<option value="${m.id}">
${m.id}
</option>
`;

});

DATA.developers.forEach(dev=>{

developerFilter.innerHTML +=
`
<option value="${dev.name}">
${dev.name}
</option>
`;

});

const taskTypes =
[
...new Set(
DATA.subtasks.map(
s=>s.task_type
)
)
];

taskTypes.sort();

taskTypes.forEach(type=>{

taskTypeFilter.innerHTML +=
`
<option value="${type}">
${type}
</option>
`;

});

}

function getSubtasks(taskId){

return DATA.subtasks.filter(
s=>s.parent_task===taskId
);

}

function getMilestoneFromPhase(
phaseId
){

const phase =
DATA.phases.find(
p=>p.id===phaseId
);

if(!phase)
return "-";

return phase.milestone;

}

function buildSubtasksHTML(
taskId
){

const subtasks =
getSubtasks(taskId);

if(!subtasks.length){

return
"<span>—</span>";

}

return subtasks.map(st=>`

<div class="subtask">

<b>${st.id}</b>

<br>

${st.title}

<br>

<small>

${st.task_type}

</small>

</div>

`).join("");

}
/* =====================================================
   HASABALLA AI PECS
   CLEAN APP.JS
   PART 2 / 2
===================================================== */

function renderTasks(){

const tbody =
el("tasksBody");

if(!tbody)
return;

tbody.innerHTML = "";

DATA.masterTasks.forEach(task=>{

const milestone =
getMilestoneFromPhase(
task.phase
);

const subtasksHTML =
buildSubtasksHTML(
task.id
);

const phaseMatch =
!FILTERS.phase ||
task.phase.includes(
FILTERS.phase
);

const milestoneMatch =
!FILTERS.milestone ||
milestone ===
FILTERS.milestone;

const taskTypeMatch =
!FILTERS.taskType ||
task.task_type ===
FILTERS.taskType;

const searchMatch =
!FILTERS.search ||
task.title
.toLowerCase()
.includes(
FILTERS.search
.toLowerCase()
);

if(
!phaseMatch ||
!milestoneMatch ||
!taskTypeMatch ||
!searchMatch
){

return;

}

tbody.innerHTML += `

<tr>

<td>
☐
</td>

<td>

<b>

${task.title}

</b>

<br>

<small>

${task.id}

</small>

</td>

<td>

${task.task_type}

</td>

<td>

${task.reference_task}

</td>

<td>

${task.id}

</td>

<td>

${task.phase}

</td>

<td>

${milestone}

</td>

<td>

${task.week_start}
-
${task.week_end}

</td>

<td>

-

</td>

<td>

Pending

</td>

<td>

0%

</td>

<td>

${subtasksHTML}

</td>

<td>

-

</td>

</tr>

`;

});

}

function renderWeeklyReports(){

const container =
el("weeklyReports");

if(!container)
return;

container.innerHTML = "";

DATA.reports.forEach(report=>{

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

<b>Manager:</b>

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

Completed

</h4>

<ul>

${report.completed_tasks
.map(item=>
`<li>${item}</li>`
)
.join("")
}

</ul>

<h4>

In Progress

</h4>

<ul>

${report.in_progress
.map(item=>
`<li>${item}</li>`
)
.join("")
}

</ul>

</div>

`;

});

}

function renderDailyReports(){

const container =
el("dailyReports");

if(!container)
return;

container.innerHTML =

`

<div class="report-card">

<h3>

Daily Reports

</h3>

<p>

Ready For Future Updates

</p>

</div>

`;

}

function bindFilters(){

el("searchBox")
.addEventListener(
"input",
e=>{

FILTERS.search =
e.target.value;

renderTasks();

}
);

el("phaseFilter")
.addEventListener(
"change",
e=>{

FILTERS.phase =
e.target.value;

renderTasks();

}
);

el("milestoneFilter")
.addEventListener(
"change",
e=>{

FILTERS.milestone =
e.target.value;

renderTasks();

}
);

el("developerFilter")
.addEventListener(
"change",
e=>{

FILTERS.developer =
e.target.value;

renderTasks();

}
);

el("taskTypeFilter")
.addEventListener(
"change",
e=>{

FILTERS.taskType =
e.target.value;

renderTasks();

}
);

}

async function saveState(){

try{

await sb
.from(
"project_state"
)
.upsert({

id:1,

filters:
JSON.stringify(
FILTERS
)

});

}
catch(error){

console.error(
error
);

}

}

async function loadState(){

try{

const {
data
}
=
await sb
.from(
"project_state"
)
.select("*")
.eq(
"id",
1
)
.single();

if(
data &&
data.filters
){

Object.assign(

FILTERS,

JSON.parse(
data.filters
)

);

}

}
catch(error){

console.log(
"No Saved State"
);

}

}

async function initialize(){

try{

await loadAllData();

await loadState();

updateDashboard();

populateFilters();

renderTasks();

renderWeeklyReports();

renderDailyReports();

bindFilters();

setInterval(
saveState,
30000
);

console.log(
"PECS Ready"
);

}
catch(error){

console.error(
error
);

}

}

document
.addEventListener(

"DOMContentLoaded",

initialize

);

/* =====================================================
   END
===================================================== */
