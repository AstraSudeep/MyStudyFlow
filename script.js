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

const analyticsBtn =
document.getElementById("analyticsBtn");

const streakCount =
document.getElementById("streakCount");

const heatmap =
document.getElementById("heatmap");

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

progressRing.style.strokeDashoffset =
CIRCUMFERENCE;

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

/* ---------------- HEATMAP ---------------- */

function updateHeatmap(){

if(!heatmap) return;

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

heatmap.innerHTML = "";

let dailyTotals = {};

sessions.forEach(session=>{

const day =
new Date(session.date)
.toDateString();

if(!dailyTotals[day]){

dailyTotals[day] = 0;

}

dailyTotals[day] +=
session.duration;

});

for(let i=29;i>=0;i--){

const date = new Date();

date.setDate(
date.getDate() - i
);

const dayKey =
date.toDateString();

const seconds =
dailyTotals[dayKey] || 0;

const box =
document.createElement("div");

if(seconds > 0){

    if(seconds < 10800){ // less than 3 hrs

        box.classList.add("heat-1");

    }else if(seconds < 21600){ // 3-6 hrs

        box.classList.add("heat-2");

    }else if(seconds < 32400){ // 6-9 hrs

        box.classList.add("heat-3");

    }else{ // 9+ hrs

        box.classList.add("heat-4");

    }

}

box.title =
`${dayKey}
${formatTime(seconds)}`;

heatmap.appendChild(box);

}

}

/* ---------------- DASHBOARD ---------------- */

function updateDashboard(){

let sessions =
JSON.parse(
localStorage.getItem("sessions")
) || [];

const today =
new Date().toDateString();

let todayTotal = 0;
let weekTotal = 0;
let monthTotal = 0;
let longest = 0;

const now = new Date();

sessions.forEach(session=>{

const sessionDate =
new Date(session.date);

if(session.duration > longest){

longest = session.duration;

}

/* TODAY */

if(
sessionDate.toDateString() === today
){

todayTotal += session.duration;

}

/* THIS WEEK */

const daysDiff =
(now - sessionDate) /
(1000 * 60 * 60 * 24);

if(daysDiff <= 7){

weekTotal += session.duration;

}

/* THIS MONTH */

if(
sessionDate.getMonth() === now.getMonth() &&
sessionDate.getFullYear() === now.getFullYear()
){

monthTotal += session.duration;

}

});

todayTime.textContent =
formatTime(todayTotal);

sessionCount.textContent =
sessions.length;

longestSession.textContent =
formatTime(longest);

const percentage =
Math.min(
100,
Math.floor(
(todayTotal / GOAL_SECONDS) * 100
)
);

goalPercent.textContent =
percentage + "%";

goalText.textContent =
`${formatTime(todayTotal)} / 12:00:00`;

goalProgress.style.width =
percentage + "%";

/* Average Session */

if(sessions.length){

avgSession.textContent =
formatTime(
Math.floor(
sessions.reduce(
(sum,s)=>sum+s.duration,
0
) / sessions.length
)
);

}else{

avgSession.textContent =
"00:00:00";

}

/* Weekly */

weeklyHours.textContent =
formatTime(weekTotal);

/* Monthly */

monthlyHours.textContent =
formatTime(monthTotal);

/* Subject Count */

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
updateHeatmap();
}

/* ---------------- STARTUP ---------------- */

analyticsBtn.onclick = ()=>{

document
.querySelector(".dashboard-grid")
.scrollIntoView({
behavior:"smooth"
});

};

loadSubjects();

progressRing.style.strokeDashoffset =
CIRCUMFERENCE;

renderSessions();
