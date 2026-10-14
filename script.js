const KEY = "complaints";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cls = s => s.replace(" ", "");

// ---------- Storage ----------
let complaints = [];
try { complaints = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(complaints)); } catch (e) {} }

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.hidden = true);
    btn.classList.add("active");
    $(btn.dataset.view).hidden = false;
  });
});

// ---------- Submit complaint ----------
$("complaintForm").addEventListener("submit", e => {
  e.preventDefault();
  const num = complaints.length ? Math.max(...complaints.map(c => parseInt(c.id.slice(4)))) + 1 : 1001;
  const c = {
    id: "CMP-" + num,
    name: $("name").value.trim(),
    email: $("email").value.trim(),
    category: $("category").value,
    priority: $("priority").value,
    description: $("description").value.trim(),
    status: "Pending",
    date: new Date().toLocaleDateString("en-IN")
  };
  complaints.push(c);
  save();
  $("complaintForm").reset();
  $("submitMsg").className = "msg ok";
  $("submitMsg").textContent = "Complaint submitted. Your ID is " + c.id + ". Save it to track the status.";
  renderAdmin();
});

// ---------- Track complaint ----------
$("trackBtn").addEventListener("click", () => {
  const id = $("trackId").value.trim().toUpperCase();
  const c = complaints.find(x => x.id === id);
  $("trackResult").innerHTML = c
    ? `<p><b>${esc(c.id)}</b> <span class="badge ${cls(c.status)}">${c.status}</span></p>
       <p>Category: ${esc(c.category)} | Priority: ${c.priority}</p>
       <p>Submitted on: ${c.date}</p>
       <p>${esc(c.description)}</p>`
    : `<p class="msg err">No complaint found with this ID. Check the ID and try again.</p>`;
});

// ---------- Admin login ----------
$("loginBtn").addEventListener("click", () => {
  if ($("user").value === "admin" && $("pass").value === "admin123") {
    $("loginBox").hidden = true;
    $("adminPanel").hidden = false;
    $("loginMsg").textContent = "";
    renderAdmin();
  } else {
    $("loginMsg").className = "msg err";
    $("loginMsg").textContent = "Wrong username or password.";
  }
});
$("logoutBtn").addEventListener("click", () => {
  $("adminPanel").hidden = true;
  $("loginBox").hidden = false;
  $("user").value = ""; $("pass").value = "";
});

// ---------- Admin panel ----------
function renderAdmin() {
  const q = $("search").value.toLowerCase();
  const f = $("statusFilter").value;
  const list = complaints.filter(c =>
    (!f || c.status === f) &&
    (c.id + c.name + c.description).toLowerCase().includes(q));

  $("rows").innerHTML = list.map(c => `
    <tr>
      <td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.category)}</td>
      <td class="${c.priority === "High" ? "High" : ""}">${c.priority}</td>
      <td>${esc(c.description)}</td>
      <td><span class="badge ${cls(c.status)}">${c.status}</span></td>
      <td>
        <select onchange="changeStatus('${c.id}', this.value)" aria-label="Change status">
          ${["Pending", "In Progress", "Resolved"].map(s => `<option${s === c.status ? " selected" : ""}>${s}</option>`).join("")}
        </select>
        <button class="del" onclick="removeComplaint('${c.id}')">Delete</button>
      </td>
    </tr>`).join("");
  $("empty").hidden = list.length > 0;

  $("sTotal").textContent = complaints.length;
  $("sPending").textContent = complaints.filter(c => c.status === "Pending").length;
  $("sProgress").textContent = complaints.filter(c => c.status === "In Progress").length;
  $("sResolved").textContent = complaints.filter(c => c.status === "Resolved").length;
}

function changeStatus(id, status) {
  complaints.find(c => c.id === id).status = status;
  save(); renderAdmin();
}
function removeComplaint(id) {
  if (!confirm("Delete complaint " + id + "?")) return;
  complaints = complaints.filter(c => c.id !== id);
  save(); renderAdmin();
}

$("search").addEventListener("input", renderAdmin);
$("statusFilter").addEventListener("change", renderAdmin);
renderAdmin();
