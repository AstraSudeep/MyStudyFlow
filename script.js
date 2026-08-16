const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const subjectSelect =
document.getElementById("subjectSelect");

const todayTime =
document.getElementById("todayTime");

const sessionCount =
document.getElementById("sessionCount");

const goalPercent =
document.getElementById("goalPercent");

const goalText =
document.getElementById("goalText");

const goalProgress =
document.getElementById("goalProgress");

const longestSession =
document.getElementById("longestSession");

const addSubjectBtn =
document.getElementById("addSubjectBtn");

const newSubject =
document.getElementById("newSubject");

const progressRing =
document.getElementById("progressRing");

const weeklyHours =
document.getElementById("weeklyHours");

const monthlyHours =
document.getElementById("monthlyHours");

const bestSubject =
document.getElementById("bestSubject");

const mostStudied =
document.getElementById("mostStudied");

const avgSession =
document.getElementById("avgSession");

const subjectCount =
document.getElementById("subjectCount");

const exportBtn =
document.getElementById("exportBtn");

const streakCount =
document.getElementById("streakCount");

let running = false;
let elapsed = 0;
let interval;
let startTime = 0;
let pausedTime = 0;
const GOAL_SECONDS =
12 * 60 * 60;

const CIRCUMFERENCE = 754;

/* ---------------- FORMAT ---------------- */

function formatTime(seconds){

const hrs =
String(Math.floor(seconds/3600))
.padStart(2,"0");

const mins =
String(Math.floor((seconds%3600)/60))
.padStart(2,"0");

const secs =
String(seconds%60)
.padStart(2,"0");

return `${hrs}:${mins}:${secs}`;

}

/* ---------------- TIMER ---------------- */

function updateRing(){

const progress =
Math.min(
elapsed / GOAL_SECONDS,
1
);

const offset =
CIRCUMFERENCE -
(progress * CIRCUMFERENCE);

progressRing.style.strokeDashoffset =
offset;

}

function updateTimer(){

elapsed++;

timer.textContent =
formatTime(elapsed);

updateRing();

}

startBtn.onclick = ()=>{

if(running) return;

running = true;

startTime =
Date.now() - (elapsed * 1000);

interval =
setInterval(()=>{

elapsed =
Math.floor(
(Date.now() - startTime) / 1000
);

timer.textContent =
formatTime(elapsed);

updateRing();

},1000);

};

pauseBtn.onclick = ()=>{

running = false;

clearInterval(interval);

};

stopBtn.onclick = ()=>{

if(elapsed===0) return;

running = false;

clearInterval(interval);

saveSession();

elapsed = 0;

timer.textContent =
"00:00:00";

updateDashboard();

};

/* ---------------- SUBJECTS ---------------- */

function loadSubjects(){

const subjects =
JSON.parse(
localStorage.getItem("subjects")
) || [];

subjects.forEach(subject=>{

const exists =
Array.from(subjectSelect.options)
.some(option =>
option.value===subject
);

if(!exists){

const option =
document.createElement("option");

option.textContent =
subject;

subjectSelect.appendChild(option);

}

});

}

addSubjectBtn.onclick = ()=>{

const name =
newSubject.value.trim();

if(!name) return;

const option =
document.createElement("option");

option.textContent = name;

subjectSelect.appendChild(option);

let subjects =
JSON.parse(
localStorage.getItem("subjects")
) || [];

subjects.push(name);

localStorage.setItem(
"subjects",
JSON.stringify(subjects)
);

subjectCount.textContent =
subjectSelect.options.length;

newSubject.value = "";

};

/* ---------------- SAVE SESSION ---------------- */

function saveSession(){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

sessions.unshift({

subject:
subjectSelect.value,

duration:
elapsed,

date:
new Date().toLocaleString()

});

localStorage.setItem(
"sessions",
JSON.stringify(sessions)
);

renderSessions();

}

/* ---------------- ANALYTICS ---------------- */

function updateSubjectAnalytics(){

const container =
document.getElementById(
"subjectAnalytics"
);

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

let totals = {};

sessions.forEach(session=>{

if(!totals[session.subject]){

totals[session.subject] = 0;

}

totals[session.subject] +=
session.duration;

});

const highest =
Math.max(
...Object.values(totals),
1
);

container.innerHTML = "";

Object.entries(totals)
.forEach(([subject,time])=>{

const percent =
(time/highest)*100;

container.innerHTML +=

`
<li>

<span>${subject}</span>

<div class="bar">
<div
class="fill"
style="width:${percent}%">
</div>
</div>

<span>
${formatTime(time)}
</span>

</li>
`;

});

let best = "-";
let max = 0;

Object.entries(totals)
.forEach(([subject,time])=>{

if(time > max){

max = time;
best = subject;

}

});

bestSubject.textContent = best;
mostStudied.textContent = best;

}

/* ---------------- STREAK ---------------- */

function updateStreak(){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

if(sessions.length === 0){

streakCount.textContent =
"0 Days";

return;

}

let uniqueDays = [];

sessions.forEach(session=>{

const day =
new Date(session.date)
.toDateString();

if(!uniqueDays.includes(day)){

uniqueDays.push(day);

}

});

uniqueDays.sort(
(a,b)=>
new Date(b)-new Date(a)
);

let streak = 1;

for(let i=1;i<uniqueDays.length;i++){

const current =
new Date(uniqueDays[i-1]);

const previous =
new Date(uniqueDays[i]);

const diff =
Math.round(
(current-previous)/
(1000*60*60*24)
);

if(diff === 1){

streak++;

}else{

break;

}

}

streakCount.textContent =
`${streak} Days`;

}

/* ---------------- DASHBOARD ---------------- */

function updateDashboard(){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

let total = 0;
let longest = 0;

sessions.forEach(session=>{

total += session.duration;

if(session.duration > longest){

longest =
session.duration;

}

});

todayTime.textContent =
formatTime(total);

sessionCount.textContent =
sessions.length;

longestSession.textContent =
formatTime(longest);

const percentage =
Math.min(
100,
Math.floor(
(total/GOAL_SECONDS)*100
)
);

goalPercent.textContent =
percentage + "%";

goalText.textContent =
`${formatTime(total)} / 12:00:00`;

goalProgress.style.width =
percentage + "%";

if(sessions.length){

avgSession.textContent =
formatTime(
Math.floor(
total / sessions.length
)
);

}else{

avgSession.textContent =
"00:00:00";

}

weeklyHours.textContent =
formatTime(total);

monthlyHours.textContent =
formatTime(total);

subjectCount.textContent =
subjectSelect.options.length;

}

/* ---------------- DELETE ---------------- */

function deleteSession(index){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

sessions.splice(index,1);

localStorage.setItem(
"sessions",
JSON.stringify(sessions)
);

renderSessions();

}

window.deleteSession =
deleteSession;

/* ---------------- EXPORT ---------------- */

exportBtn.onclick = ()=>{

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

let csv =
"Subject,Duration,Date\n";

sessions.forEach(session=>{

csv +=
`${session.subject},${formatTime(session.duration)},${session.date}\n`;

});

const blob =
new Blob(
[csv],
{type:"text/csv"}
);

const url =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;

a.download =
"study_sessions.csv";

a.click();

URL.revokeObjectURL(url);

};

/* ---------------- RENDER ---------------- */

function renderSessions(){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

const table =
document.querySelector(
"#historyTable"
);

let html =

`
<tr>
<th>Subject</th>
<th>Duration</th>
<th>Date</th>
<th>Action</th>
</tr>
`;

sessions.forEach((session,index)=>{

html +=

`
<tr>

<td>${session.subject}</td>

<td>
${formatTime(session.duration)}
</td>

<td>${session.date}</td>

<td>

<button
class="delete-btn"
onclick="deleteSession(${index})">

Delete

</button>

</td>

</tr>
`;

});

table.innerHTML = html;

updateDashboard();
updateSubjectAnalytics();
updateStreak();

}

/* ---------------- STARTUP ---------------- */

loadSubjects();

progressRing.style.strokeDashoffset =
CIRCUMFERENCE;

renderSessions();
