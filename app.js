"use strict";
// SUSTAINABLE UNITY KIKOBA - browser app (Supabase)
// Only the public anon/publishable key belongs here. NEVER put a service_role/secret key in this file.
const SUPABASE_URL = "https://sywizfswnfcbkxemwgek.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_u1PA6HvKWcuDwYwPUomzBg_QL2mngAe";

const CATS = ["HISA", "JAMII", "BIMA", "SHEREHE", "ADHABU", "UWEKEZAJI"];
const ROLES = ["admin", "treasurer", "secretary", "member"];
const STAFF = ["admin", "treasurer", "secretary"];

const sbReady = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_") && !!window.supabase;
const db = sbReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
let currentUser = null, profile = null;
let members = [], contributions = [], loans = [], repayments = [], memberRepaymentHistory = [], openingBalances = [], users = [];
let lang = "sw";
try { lang = localStorage.getItem("su_lang") || "sw"; } catch (_) {}

/* ---------------- translations ---------------- */
const dict = {
  sw: {
    welcome: "Karibu kwenye Kikoba", loginIntro: "Ingia kwa akaunti yako ili kuendelea.", username: "Jina la mtumiaji", password: "Nenosiri", login: "Ingia",
    accessManaged: "Akaunti zinaundwa na msimamizi wa mfumo.",
    overview: "Muhtasari", statement: "Taarifa ya mwanachama", members: "Wanachama", contributions: "Michango", loans: "Mikopo", repayments: "Marejesho", reports: "Ripoti", users: "Watumiaji", account: "Akaunti yangu",
    connected: "Muunganisho wa database", logout: "Toka",
    dashboardWelcome: "Karibu kwenye mfumo", dashboardSub: "Muhtasari wa shughuli za kikoba.",
    memberCount: "Wanachama", registeredMembers: "Waliosajiliwa", contributionsTotal: "Michango yote", allCategories: "Hisa, jamii, bima na mengine",
    loansIssued: "Mikopo iliyotolewa", loanPrincipal: "Jumla ya mitaji ya mikopo", outstanding: "Deni lililobaki", remainingBalance: "Salio la mikopo",
    recentContributions: "Michango ya hivi karibuni", latestEntries: "Miamala ya mwisho iliyoingizwa.", viewAll: "Ona yote",
    date: "Tarehe", member: "Mwanachama", category: "Aina", amount: "Kiasi", amountTsh: "Kiasi (TSh)",
    statementTitle: "Taarifa ya mwanachama", statementSub: "Michango yote, mikopo na salio la mwanachama mmoja.",
    memberRegister: "Daftari la wanachama", memberRegisterSub: "Sajili na angalia wanachama hadi 30.", memberCode: "Namba ya mwanachama", fullName: "Jina kamili", phone: "Simu",
    emailOptional: "Barua pepe (si lazima)", saveMember: "Hifadhi mwanachama", status: "Hali", active: "Hai", inactive: "Ametoka", showInactive: "Onyesha waliotoka",
    editMember: "Hariri mwanachama", activeMember: "Mwanachama hai", cancel: "Ghairi", save: "Hifadhi", edit: "Hariri",
    recordContribution: "Ingiza mchango", contributionSub: "Hifadhi michango ya kila mwanachama.", description: "Maelezo", saveContribution: "Hifadhi mchango", del: "Futa",
    registerLoan: "Sajili mkopo", loanSub: "Rekodi mikopo ya wanachama.", loanAmount: "Kiasi cha mkopo (TSh)", loanAmount2: "Mkopo", interestRate: "Riba (%)", insuranceRate: "Bima (%)", loanDate: "Tarehe ya mkopo",
    weeks: "Wiki za marejesho", saveLoan: "Hifadhi mkopo", interest: "Riba", insurance: "Bima", totalDue: "Jumla ya kulipa", balance: "Salio", installment: "Kila wiki", dueDate: "Mwisho", overdue: "Imechelewa", paid: "Imelipwa",
    loanPreview: "Riba {i} + Bima {b} = Jumla ya kulipa {t} (takriban {w} kila wiki)",
    recordRepayment: "Ingiza marejesho", repaymentSub: "Rekodi malipo ya mkopo.", loan: "Mkopo", saveRepayment: "Hifadhi marejesho",
    financialReports: "Ripoti za kifedha", reportsSub: "Muhtasari wa jumla kutoka kwenye database.", print: "Chapisha / PDF", exportCsv: "Pakua CSV (Excel)",
    cat_HISA: "Hisa", cat_JAMII: "Jamii", cat_BIMA: "Bima", cat_SHEREHE: "Sherehe", cat_ADHABU: "Adhabu", cat_UWEKEZAJI: "Uwekezaji",
    matrixTitle: "Michango kwa kila mwanachama", matrixSub: "Hisa, jamii, adhabu na zingine, pamoja na deni la mkopo.", total: "Jumla", loanBalance: "Deni la mkopo",
    reportNote: "Taarifa muhimu", reportDisclaimer: "Ripoti hizi zinakusanywa kutoka kwenye miamala iliyohifadhiwa. Hakikisha miamala imehakikiwa kabla ya kutumia ripoti rasmi.", generated: "Imetengenezwa",
    usersTitle: "Watumiaji wa mfumo", usersSub: "Tengeneza akaunti, badilisha majukumu, unganisha na mwanachama, weka nenosiri jipya.",
    role: "Jukumu", linkedMember: "Mwanachama anayehusika", tempPassword: "Nenosiri la muda (herufi 8+)", generate: "Tengeneza", createUser: "Tengeneza akaunti", none: "— hakuna —",
    role_admin: "Msimamizi", role_treasurer: "Mhazini", role_secretary: "Katibu", role_member: "Mwanachama",
    resetPw: "Nenosiri jipya", deactivate: "Zima", activate: "Washa",
    accountTitle: "Akaunti yangu", accountSub: "Badilisha nenosiri lako.", newPassword: "Nenosiri jipya", confirmPassword: "Rudia nenosiri", changePassword: "Badilisha nenosiri",
    secureWorkspace: "Eneo salama la wanachama",
    signingIn: "Inathibitisha...", badLogin: "Username au password si sahihi.", noProfile: "Akaunti haina profile. Muombe Admin.", profileError: "Imeshindwa kusoma profile. Hakikisha umeendesha supabase-schema.sql (v2).",
    inactiveUser: "Akaunti hii imezimwa. Wasiliana na Admin.", fnMissing: "Huduma ya kuingia haipatikani. Hakikisha Edge Function 'username-login' imewekwa (deployed) kwenye Supabase.",
    genericError: "Hitilafu imetokea. Jaribu tena.", setupNeeded: "Setup inahitajika: weka Supabase Project URL na anon/publishable key kwenye app.js.",
    dbError: "Database: ", noRecords: "Hakuna rekodi", addMembersFirst: "Ongeza wanachama kwanza", noOutstanding: "Hakuna mikopo inayodaiwa",
    saved: "Imehifadhiwa", deleted: "Imefutwa", confirmDelete: "Una uhakika unataka kufuta mchango huu? Haiwezi kurudishwa.", confirmToggle: "Una uhakika?",
    userCreated: "Akaunti imetengenezwa. Mpe mtumiaji: username = {u}, nenosiri = {p}. Nenosiri halitaonyeshwa tena.",
    pwPrompt: "Weka nenosiri jipya (herufi 8+):", pwShort: "Nenosiri liwe herufi 8 au zaidi.", pwMismatch: "Nenosiri hazifanani.", pwChanged: "Nenosiri limebadilishwa.",
    noMemberLink: "Akaunti yako haijaunganishwa na mwanachama. Muombe Admin akuunganishe.", stContrib: "Michango", stLoans: "Mikopo", stNoLoans: "Hana mikopo.", totalContrib: "Michango yote", stHistory: "Historia ya marejesho (hayajahusishwa na mkopo)", stHistoryNote: "Rekodi hizi zinaonyesha marejesho yaliyothibitishwa kwa mwanachama, lakini hayajapangiwa mkopo maalumu. Hazibadilishi salio la mkopo.", stHistoryTotal: "Jumla ya marejesho ya kihistoria", stNoHistory: "Hakuna historia ya marejesho.", stNotes: "Maelezo"
  },
  en: {
    welcome: "Welcome to the Kikoba", loginIntro: "Sign in with your account to continue.", username: "Username", password: "Password", login: "Sign in",
    accessManaged: "Accounts are created by the system administrator.",
    overview: "Overview", statement: "Member statement", members: "Members", contributions: "Contributions", loans: "Loans", repayments: "Repayments", reports: "Reports", users: "Users", account: "My account",
    connected: "Database connection", logout: "Log out",
    dashboardWelcome: "Welcome to the system", dashboardSub: "Kikoba activity overview.",
    memberCount: "Members", registeredMembers: "Registered members", contributionsTotal: "Total contributions", allCategories: "Shares, community, insurance and more",
    loansIssued: "Loans issued", loanPrincipal: "Total loan principal", outstanding: "Outstanding debt", remainingBalance: "Remaining loan balance",
    recentContributions: "Recent contributions", latestEntries: "Latest recorded transactions.", viewAll: "View all",
    date: "Date", member: "Member", category: "Category", amount: "Amount", amountTsh: "Amount (TZS)",
    statementTitle: "Member statement", statementSub: "All contributions, loans and balance for one member.",
    memberRegister: "Member register", memberRegisterSub: "Register and view up to 30 members.", memberCode: "Member code", fullName: "Full name", phone: "Phone",
    emailOptional: "Email (optional)", saveMember: "Save member", status: "Status", active: "Active", inactive: "Left", showInactive: "Show members who left",
    editMember: "Edit member", activeMember: "Active member", cancel: "Cancel", save: "Save", edit: "Edit",
    recordContribution: "Record contribution", contributionSub: "Save member contributions.", description: "Description", saveContribution: "Save contribution", del: "Delete",
    registerLoan: "Register a loan", loanSub: "Record member loans.", loanAmount: "Loan amount (TZS)", loanAmount2: "Loan", interestRate: "Interest rate (%)", insuranceRate: "Insurance rate (%)", loanDate: "Loan date",
    weeks: "Repayment weeks", saveLoan: "Save loan", interest: "Interest", insurance: "Insurance", totalDue: "Total due", balance: "Balance", installment: "Weekly", dueDate: "Due", overdue: "Overdue", paid: "Paid",
    loanPreview: "Interest {i} + Insurance {b} = Total due {t} (about {w} per week)",
    recordRepayment: "Record repayment", repaymentSub: "Record loan payments.", loan: "Loan", saveRepayment: "Save repayment",
    financialReports: "Financial reports", reportsSub: "Overall summary from the database.", print: "Print / PDF", exportCsv: "Download CSV (Excel)",
    cat_HISA: "Shares", cat_JAMII: "Community", cat_BIMA: "Insurance", cat_SHEREHE: "Celebration", cat_ADHABU: "Fines", cat_UWEKEZAJI: "Investment",
    matrixTitle: "Contributions per member", matrixSub: "Shares, community, fines and more, plus loan balance.", total: "Total", loanBalance: "Loan balance",
    reportNote: "Important information", reportDisclaimer: "Reports are calculated from saved transactions. Verify transactions before using an official report.", generated: "Generated",
    usersTitle: "System users", usersSub: "Create accounts, change roles, link to a member, set a new password.",
    role: "Role", linkedMember: "Linked member", tempPassword: "Temporary password (8+ characters)", generate: "Generate", createUser: "Create account", none: "— none —",
    role_admin: "Administrator", role_treasurer: "Treasurer", role_secretary: "Secretary", role_member: "Member",
    resetPw: "New password", deactivate: "Disable", activate: "Enable",
    accountTitle: "My account", accountSub: "Change your password.", newPassword: "New password", confirmPassword: "Repeat password", changePassword: "Change password",
    secureWorkspace: "Secure member workspace",
    signingIn: "Signing in...", badLogin: "Wrong username or password.", noProfile: "This account has no profile. Ask the Admin.", profileError: "Could not read profile. Make sure you ran supabase-schema.sql (v2).",
    inactiveUser: "This account is disabled. Contact the Admin.", fnMissing: "Sign-in service not reachable. Make sure the 'username-login' Edge Function is deployed on Supabase.",
    genericError: "Something went wrong. Try again.", setupNeeded: "Setup needed: put your Supabase Project URL and anon/publishable key in app.js.",
    dbError: "Database: ", noRecords: "No records found", addMembersFirst: "Add members first", noOutstanding: "No outstanding loans",
    saved: "Saved", deleted: "Deleted", confirmDelete: "Delete this contribution? This cannot be undone.", confirmToggle: "Are you sure?",
    userCreated: "Account created. Give the user: username = {u}, password = {p}. The password will not be shown again.",
    pwPrompt: "Enter the new password (8+ characters):", pwShort: "Password must be at least 8 characters.", pwMismatch: "Passwords do not match.", pwChanged: "Password changed.",
    noMemberLink: "Your account is not linked to a member. Ask the Admin to link it.", stContrib: "Contributions", stLoans: "Loans", stNoLoans: "No loans.", totalContrib: "Total contributions", stHistory: "Repayment history (not allocated to a loan)", stHistoryNote: "These records show verified repayments for this member, but they have not been assigned to a specific loan. They do not change any loan balance.", stHistoryTotal: "Total historical repayments", stNoHistory: "No repayment history.", stNotes: "Notes"
  }
};
const tr = (k, vars) => {
  let s = (dict[lang] && dict[lang][k]) ?? dict.en[k] ?? k;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace("{" + a + "}", b);
  return s;
};

/* ---------------- helpers ---------------- */
const money = n => new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(Number(n || 0));
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => (d ? String(d).split("-").reverse().join("/") : "—");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sum = (arr, f) => arr.reduce((s, x) => s + Number(f(x) || 0), 0);
const isStaff = () => !!profile && STAFF.includes(profile.role);
const isAdmin = () => !!profile && profile.role === "admin";
const canWrite = () => !!profile && ["admin", "treasurer"].includes(profile.role);
const canManageMembers = () => !!profile && ["admin", "secretary"].includes(profile.role);
const memberById = id => members.find(m => m.id === id);
const memberName = id => memberById(id)?.full_name || "—";
const emptyRow = cols => `<tr><td colspan="${cols}" class="empty">${esc(tr("noRecords"))}</td></tr>`;
const loanBalance = l => Math.max(0, Number(l.total_due) - Number(l.amount_repaid));
const installment = l => Math.ceil(Number(l.total_due) / Number(l.repayment_weeks));
function addDays(iso, days) { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10); }
const dueDate = l => addDays(l.loan_date, Number(l.repayment_weeks) * 7);
const loanStatus = l => loanBalance(l) <= 0 ? `<span class="badge ok">${esc(tr("paid"))}</span>` : (dueDate(l) < today() ? `<span class="badge bad">${esc(tr("overdue"))}</span>` : "");

let toastTimer;
function toast(text, bad = false) {
  const t = $("toast"); t.textContent = text; t.classList.toggle("bad", bad); t.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), bad ? 6000 : 2800);
}
function msg(text, error = false) { const m = $("loginMessage"); m.textContent = text; m.style.color = error ? "#b54747" : "#15966a"; }
function showNotice(text) { $("notice").textContent = text; $("notice").classList.remove("hidden"); }
function hideNotice() { $("notice").classList.add("hidden"); }

// Turn a failed Edge Function call into a readable message.
async function fnErrorMessage(error, data) {
  if (data && data.error) return data.error;
  try {
    if (error && error.context && typeof error.context.json === "function") {
      const b = await error.context.json();
      if (b && (b.error || b.message)) return b.error || b.message;
    }
  } catch (_) {}
  if (error && (error.name === "FunctionsFetchError" || /Failed to send|fetch/i.test(error.message || ""))) return tr("fnMissing");
  return (error && error.message) || tr("genericError");
}
async function callAdmin(action, payload = {}) {
  const { data, error } = await db.functions.invoke("admin-users", { body: { action, ...payload } });
  if (error || (data && data.error)) throw new Error(await fnErrorMessage(error, data));
  return data;
}

/* ---------------- language ---------------- */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  $("langToggle").textContent = lang === "sw" ? "EN" : "SW";
  if (profile) {
    $("userRole").textContent = tr("role_" + profile.role);
    $("todayLabel").textContent = new Date().toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-TZ", { year: "numeric", month: "long", day: "numeric" });
    $("pageTitle").textContent = tr(currentPage);
    renderAll();
    if (currentPage === "users") renderUsers();
  }
}
function setLanguage(next) { lang = next; try { localStorage.setItem("su_lang", next); } catch (_) {} applyLang(); }

/* ---------------- auth ---------------- */
async function signIn(e) {
  e.preventDefault();
  if (!db) { msg(tr("setupNeeded"), true); return; }
  const btn = $("loginBtn"); btn.disabled = true; msg(tr("signingIn"));
  try {
    const { data, error } = await db.functions.invoke("username-login", {
      body: { username: $("username").value.trim().toLowerCase(), password: $("password").value }
    });
    if (error || !data || !data.access_token || !data.refresh_token) { msg(await fnErrorMessage(error, data) || tr("badLogin"), true); return; }
    const { data: sd, error: se } = await db.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
    if (se) { msg(se.message, true); return; }
    currentUser = sd.user;
    $("password").value = "";
    await bootApp();
  } catch (err) {
    msg(tr("genericError") + " " + (err && err.message ? err.message : ""), true);
  } finally { btn.disabled = false; }
}
function showLogin() {
  currentUser = null; profile = null; members = []; contributions = []; loans = []; repayments = []; users = [];
  $("appView").classList.add("hidden"); $("loginView").classList.remove("hidden");
}
async function signOut() { if (db) await db.auth.signOut(); showLogin(); msg(""); }

async function bootApp() {
  const { data: p, error } = await db.from("profiles")
    .select("id,display_name,username,role,member_id,is_active").eq("id", currentUser.id).single();
  if (error || !p) {
    msg(error ? tr("profileError") + " (" + error.message + ")" : tr("noProfile"), true);
    await db.auth.signOut(); showLogin(); return;
  }
  if (p.is_active === false) { msg(tr("inactiveUser"), true); await db.auth.signOut(); showLogin(); return; }
  profile = p;
  $("loginView").classList.add("hidden"); $("appView").classList.remove("hidden");
  $("userName").textContent = p.display_name || p.username || currentUser.email;
  $("userRole").textContent = tr("role_" + p.role);
  $("todayLabel").textContent = new Date().toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-TZ", { year: "numeric", month: "long", day: "numeric" });
  applyPermissions();
  hideNotice();
  await refreshData();
  showPage("overview");
}

// Show/hide anything marked data-need="write|members|admin|staff" according to the role.
function applyPermissions() {
  const checks = { write: canWrite(), members: canManageMembers(), admin: isAdmin(), staff: isStaff() };
  document.querySelectorAll("[data-need]").forEach(el => el.classList.toggle("hidden", !checks[el.dataset.need]));
}

/* ---------------- data ---------------- */
async function refreshData() {
  const [m, c, l, r, h, o] = await Promise.all([
    db.from("members").select("*").order("member_code"),
    db.from("contributions").select("*").order("contribution_date", { ascending: false }).order("created_at", { ascending: false }).limit(5000),
    db.from("loans").select("*").order("loan_date", { ascending: false }).limit(2000),
    db.from("repayments").select("*").order("repayment_date", { ascending: false }).limit(5000),
    db.from("member_repayment_history").select("*").order("repayment_date", { ascending: false }).limit(5000),
    db.from("su_import_opening_balances").select("*").eq("period_label", "HISTORIA_2024_2025")
  ]);
  const bad = [m, c, l, r, h, o].find(x => x.error);
  if (bad) { showNotice(tr("dbError") + bad.error.message); return; }
  hideNotice();
  members = m.data || []; contributions = c.data || []; loans = l.data || []; repayments = r.data || []; memberRepaymentHistory = h.data || []; openingBalances = o.data || [];
  renderAll();
}

/* ---------------- rendering ---------------- */
const activeMembers = () => members.filter(m => m.is_active);
function setOptions(sel, html, keep = true) {
  const old = keep ? sel.value : "";
  sel.innerHTML = html;
  if (old && [...sel.options].some(o => o.value === old)) sel.value = old;
}

function renderAll() {
  renderOverview(); renderMembers(); renderContributions(); renderLoans(); renderRepayments(); renderReports(); fillSelects(); renderStatement();
}

function renderOverview() {
  $("statMembers").textContent = activeMembers().length;
  $("statContributions").textContent = money(sum(contributions, x => x.amount) + sum(openingBalances, x => x.opening_total));
  $("statLoans").textContent = money(sum(loans, x => x.principal));
  $("statOutstanding").textContent = money(sum(loans, loanBalance));
  $("recentRows").innerHTML = contributions.slice(0, 7).map(x =>
    `<tr><td>${esc(fmtDate(x.contribution_date))}</td><td>${esc(memberName(x.member_id))}</td><td>${esc(tr("cat_" + x.category))}</td><td class="num">${money(x.amount)}</td></tr>`).join("") || emptyRow(4);
}

function renderMembers() {
  const showAll = $("showInactive").checked;
  const list = members.filter(m => showAll || m.is_active);
  $("memberRows").innerHTML = list.map((m, i) =>
    `<tr class="${m.is_active ? "" : "muted-row"}"><td>${i + 1}</td><td>${esc(m.member_code)}</td><td>${esc(m.full_name)}</td><td>${esc(m.phone || "—")}</td>` +
    `<td><span class="badge ${m.is_active ? "ok" : "off"}">${esc(tr(m.is_active ? "active" : "inactive"))}</span></td>` +
    (canManageMembers() ? `<td class="actions"><button class="btn ghost compact" data-edit-member="${m.id}">${esc(tr("edit"))}</button></td>` : "<td class=\"hidden\"></td>") +
    `</tr>`).join("") || emptyRow(6);
}

function renderContributions() {
  $("contributionRows").innerHTML = contributions.map(x =>
    `<tr><td>${esc(fmtDate(x.contribution_date))}</td><td>${esc(memberName(x.member_id))}</td><td>${esc(tr("cat_" + x.category))}</td><td class="num">${money(x.amount)}</td><td>${esc(x.notes || "—")}</td>` +
    (isAdmin() ? `<td class="actions"><button class="btn danger compact" data-del-contribution="${x.id}">${esc(tr("del"))}</button></td>` : "<td class=\"hidden\"></td>") +
    `</tr>`).join("") || emptyRow(6);
}

function renderLoans() {
  $("loanRows").innerHTML = loans.map(x =>
    `<tr><td>${esc(fmtDate(x.loan_date))}</td><td>${esc(memberName(x.member_id))}</td><td>${esc(x.loan_code)}</td><td class="num">${money(x.principal)}</td><td class="num">${money(x.interest_amount)}</td><td class="num">${money(x.insurance_amount)}</td>` +
    `<td class="num">${money(x.total_due)}</td><td class="num"><b>${money(loanBalance(x))}</b></td><td class="num">${money(installment(x))}</td><td>${esc(fmtDate(dueDate(x)))} ${loanStatus(x)}</td></tr>`).join("") || emptyRow(10);
}

function renderRepayments() {
  $("repaymentRows").innerHTML = repayments.map(x => {
    const l = loans.find(z => z.id === x.loan_id);
    return `<tr><td>${esc(fmtDate(x.repayment_date))}</td><td>${esc(memberName(l?.member_id))}</td><td>${esc(l?.loan_code || "—")}</td><td class="num">${money(x.amount)}</td><td>${esc(x.notes || "—")}</td></tr>`;
  }).join("") || emptyRow(5);
}

function openingRowsForMember(memberId) {
  const member = memberById(memberId);
  if (!member) return [];
  return openingBalances.filter(x => x.member_code === member.member_code);
}

function historicalMemberTotal(memberId) {
  return sum(openingRowsForMember(memberId), x => x.opening_total);
}

function memberTotals(memberId) {
  const history = openingRowsForMember(memberId);
  const t = {};
  CATS.forEach(c => {
    const historicField = c === "ADHABU" ? "faini" : c.toLowerCase();
    t[c] = sum(contributions.filter(x => x.member_id === memberId && x.category === c), x => x.amount)
      + sum(history, x => x[historicField]);
  });
  t.total = CATS.reduce((s, c) => s + t[c], 0);
  t.loan = sum(loans.filter(l => l.member_id === memberId), loanBalance);
  return t;
}

function renderReports() {
  const ids = { HISA: "rHisa", JAMII: "rJamii", BIMA: "rBima", SHEREHE: "rSherehe", ADHABU: "rAdhabu", UWEKEZAJI: "rUwekezaji" };
  CATS.forEach(c => {
    const historicField = c === "ADHABU" ? "faini" : c.toLowerCase();
    $(ids[c]).textContent = money(sum(contributions.filter(x => x.category === c), x => x.amount) + sum(openingBalances, x => x[historicField]));
  });
  $("matrixHead").innerHTML = `<tr><th>#</th><th>${esc(tr("memberCode"))}</th><th>${esc(tr("fullName"))}</th>${CATS.map(c => `<th class="num">${esc(tr("cat_" + c))}</th>`).join("")}<th class="num">${esc(tr("total"))}</th><th class="num">${esc(tr("loanBalance"))}</th></tr>`;
  const list = activeMembers();
  const rows = list.map(m => ({ m, t: memberTotals(m.id) }));
  $("matrixRows").innerHTML = rows.map(({ m, t }, i) =>
    `<tr><td>${i + 1}</td><td>${esc(m.member_code)}</td><td>${esc(m.full_name)}</td>${CATS.map(c => `<td class="num">${money(t[c])}</td>`).join("")}<td class="num"><b>${money(t.total)}</b></td><td class="num">${money(t.loan)}</td></tr>`).join("") || emptyRow(CATS.length + 5);
  const tot = {}; CATS.forEach(c => { tot[c] = sum(rows, r => r.t[c]); }); tot.total = sum(rows, r => r.t.total); tot.loan = sum(rows, r => r.t.loan);
  $("matrixFoot").innerHTML = rows.length ? `<tr><td colspan="3">${esc(tr("total"))}</td>${CATS.map(c => `<td class="num">${money(tot[c])}</td>`).join("")}<td class="num">${money(tot.total)}</td><td class="num">${money(tot.loan)}</td></tr>` : "";
  $("reportGenerated").textContent = `${tr("generated")}: ${new Date().toLocaleString()}`;
}

function exportCsv() {
  const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [[tr("memberCode"), tr("fullName"), ...CATS.map(c => tr("cat_" + c)), tr("total"), tr("loanBalance")].map(q).join(",")];
  activeMembers().forEach(m => { const t = memberTotals(m.id); lines.push([m.member_code, m.full_name, ...CATS.map(c => t[c]), t.total, t.loan].map(q).join(",")); });
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `sustainable-unity-${today()}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function renderStatement() {
  const wrap = $("stBody");
  let id;
  if (isStaff()) {
    setOptions($("stMember"), activeMembers().map(m => `<option value="${m.id}">${esc(m.member_code)} — ${esc(m.full_name)}</option>`).join("") || `<option value="">${esc(tr("addMembersFirst"))}</option>`);
    id = $("stMember").value;
  } else { id = profile?.member_id; }
  const m = id && memberById(id);
  if (!m) { wrap.innerHTML = `<div class="content-card"><p class="muted">${esc(tr("noMemberLink"))}</p></div>`; return; }
  const t = memberTotals(m.id);
  const cs = contributions.filter(x => x.member_id === m.id);
  const ls = loans.filter(l => l.member_id === m.id);
  wrap.innerHTML =
    `<div class="content-card"><h3>${esc(m.member_code)} — ${esc(m.full_name)}</h3><p class="muted">${esc(m.phone || "")}</p><p class="muted">${lang === "sw" ? "Salio la historia (2024–2025)" : "Historical opening balance (2024–2025)"}: <strong>${money(historicalMemberTotal(m.id))}</strong></p></div>` +
    `<div class="stats-grid report-stats">${CATS.map(c => `<article class="stat-card"><span>${esc(tr("cat_" + c))}</span><strong>${money(t[c])}</strong></article>`).join("")}` +
    `<article class="stat-card accent"><span>${esc(tr("totalContrib"))}</span><strong>${money(t.total)}</strong></article>` +
    `<article class="stat-card accent"><span>${esc(tr("loanBalance"))}</span><strong>${money(t.loan)}</strong></article></div>` +
    `<div class="content-card"><h3>${esc(tr("stLoans"))}</h3><div class="table-wrap"><table><thead><tr><th>${esc(tr("date"))}</th><th>${esc(tr("loan"))}</th><th class="num">${esc(tr("totalDue"))}</th><th class="num">${esc(tr("balance"))}</th><th>${esc(tr("dueDate"))}</th></tr></thead><tbody>` +
    (ls.map(l => `<tr><td>${esc(fmtDate(l.loan_date))}</td><td>${esc(l.loan_code)}</td><td class="num">${money(l.total_due)}</td><td class="num">${money(loanBalance(l))}</td><td>${esc(fmtDate(dueDate(l)))} ${loanStatus(l)}</td></tr>`).join("") || `<tr><td colspan="5" class="empty">${esc(tr("stNoLoans"))}</td></tr>`) +
    `</tbody></table></div></div>` +
    (() => {
      const hs = memberRepaymentHistory.filter(x => x.member_id === m.id);
      const historyTotal = sum(hs, x => x.amount);
      return `<div class="content-card"><h3>${esc(tr("stHistory"))}</h3><p class="muted">${esc(tr("stHistoryNote"))}</p><p><strong>${esc(tr("stHistoryTotal"))}: ${money(historyTotal)}</strong></p><div class="table-wrap"><table><thead><tr><th>${esc(tr("date"))}</th><th class="num">${esc(tr("amount"))}</th><th>${esc(tr("stNotes"))}</th></tr></thead><tbody>` +
        (hs.map(x => `<tr><td>${esc(fmtDate(x.repayment_date))}</td><td class="num">${money(x.amount)}</td><td>${esc(x.notes || "—")}</td></tr>`).join("") || `<tr><td colspan="3" class="empty">${esc(tr("stNoHistory"))}</td></tr>`) +
        `</tbody></table></div></div>`;
    })() +
    `<div class="content-card"><h3>${esc(tr("stContrib"))}</h3><div class="table-wrap"><table><thead><tr><th>${esc(tr("date"))}</th><th>${esc(tr("category"))}</th><th class="num">${esc(tr("amount"))}</th><th>${esc(tr("description"))}</th></tr></thead><tbody>` +
    (cs.map(x => `<tr><td>${esc(fmtDate(x.contribution_date))}</td><td>${esc(tr("cat_" + x.category))}</td><td class="num">${money(x.amount)}</td><td>${esc(x.notes || "—")}</td></tr>`).join("") || emptyRow(4)) +
    `</tbody></table></div></div>`;
}

function fillSelects() {
  const opts = activeMembers().map(m => `<option value="${m.id}">${esc(m.member_code)} — ${esc(m.full_name)}</option>`).join("") || `<option value="">${esc(tr("addMembersFirst"))}</option>`;
  ["contributionMember", "loanMember"].forEach(id => setOptions($(id), opts));
  setOptions($("contributionCategory"), CATS.map(c => `<option value="${c}">${esc(tr("cat_" + c))}</option>`).join(""));
  const open = loans.filter(l => loanBalance(l) > 0);
  setOptions($("repaymentLoan"), open.map(l => `<option value="${l.id}">${esc(l.loan_code)} — ${esc(memberName(l.member_id))} · ${money(loanBalance(l))}</option>`).join("") || `<option value="">${esc(tr("noOutstanding"))}</option>`);
  setOptions($("newRole"), ROLES.map(r => `<option value="${r}">${esc(tr("role_" + r))}</option>`).join(""));
  setOptions($("newMember"), `<option value="">${esc(tr("none"))}</option>` + activeMembers().map(m => `<option value="${m.id}">${esc(m.member_code)} — ${esc(m.full_name)}</option>`).join(""));
}

let currentPage = "overview";
function showPage(page) {
  if (page === "users" && !isAdmin()) page = "overview";
  currentPage = page;
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  $("page-" + page).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  $("pageTitle").textContent = tr(page);
  if (page === "users") loadUsers();
}

/* ---------------- users page (admin) ---------------- */
async function loadUsers() {
  try { const r = await callAdmin("list"); users = r.users || []; renderUsers(); }
  catch (err) { toast(err.message, true); }
}
function renderUsers() {
  const memOpts = sel => `<option value="">${esc(tr("none"))}</option>` + activeMembers().concat(members.filter(m => !m.is_active && m.id === sel)).map(m => `<option value="${m.id}" ${m.id === sel ? "selected" : ""}>${esc(m.member_code)} — ${esc(m.full_name)}</option>`).join("");
  $("userRows").innerHTML = users.map(u => {
    const me = u.id === currentUser.id;
    return `<tr class="${u.is_active ? "" : "muted-row"}"><td>${esc(u.username || "—")}</td><td>${esc(u.display_name)}</td>` +
      `<td><select data-user="${u.id}" data-field="role" ${me ? "disabled" : ""}>${ROLES.map(r => `<option value="${r}" ${r === u.role ? "selected" : ""}>${esc(tr("role_" + r))}</option>`).join("")}</select></td>` +
      `<td><select data-user="${u.id}" data-field="member_id">${memOpts(u.member_id)}</select></td>` +
      `<td><span class="badge ${u.is_active ? "ok" : "off"}">${esc(tr(u.is_active ? "active" : "inactive"))}</span></td>` +
      `<td class="actions"><button class="btn ghost compact" data-reset="${u.id}">${esc(tr("resetPw"))}</button> ` +
      (me ? "" : `<button class="btn ${u.is_active ? "danger" : "secondary"} compact" data-toggle-user="${u.id}">${esc(tr(u.is_active ? "deactivate" : "activate"))}</button>`) + `</td></tr>`;
  }).join("") || emptyRow(6);
}
const randomPassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint32Array(10); crypto.getRandomValues(buf);
  return [...buf].map(n => chars[n % chars.length]).join("");
};
async function createUser(e) {
  e.preventDefault();
  const username = $("newUsername").value.trim().toLowerCase(), password = $("newPassword").value;
  try {
    await callAdmin("create", { username, display_name: $("newDisplayName").value.trim(), role: $("newRole").value, member_id: $("newMember").value || null, password });
    const box = $("userResult"); box.textContent = tr("userCreated", { u: username, p: password }); box.classList.remove("hidden");
    e.target.reset(); await loadUsers();
  } catch (err) { toast(err.message, true); }
}
async function userAction(e) {
  const sel = e.target.closest("select[data-user]");
  if (sel && e.type === "change") {
    const val = sel.value === "" ? null : sel.value;
    try { await callAdmin("update", { user_id: sel.dataset.user, [sel.dataset.field]: val }); toast(tr("saved")); }
    catch (err) { toast(err.message, true); }
    await loadUsers(); return;
  }
  if (e.type !== "click") return;
  const reset = e.target.closest("[data-reset]"), tog = e.target.closest("[data-toggle-user]");
  if (reset) {
    const pw = prompt(tr("pwPrompt")); if (pw === null) return;
    if (pw.length < 8) { toast(tr("pwShort"), true); return; }
    try { await callAdmin("reset_password", { user_id: reset.dataset.reset, password: pw }); toast(tr("saved")); } catch (err) { toast(err.message, true); }
  } else if (tog) {
    if (!confirm(tr("confirmToggle"))) return;
    const u = users.find(x => x.id === tog.dataset.toggleUser);
    try { await callAdmin("update", { user_id: u.id, is_active: !u.is_active }); toast(tr("saved")); } catch (err) { toast(err.message, true); }
    await loadUsers();
  }
}

/* ---------------- saving data ---------------- */
async function saveMember(e) {
  e.preventDefault(); if (!canManageMembers()) return;
  const payload = { member_code: $("memberCode").value.trim().toUpperCase(), full_name: $("memberName").value.trim(), phone: $("memberPhone").value.trim() || null, email: $("memberEmail").value.trim() || null };
  const { error } = await db.from("members").insert(payload);
  if (error) { toast(error.message, true); return; }
  e.target.reset(); toast(tr("saved")); await refreshData();
}
let editingId = null;
function openEdit(id) {
  const m = memberById(id); if (!m) return; editingId = id;
  $("editName").value = m.full_name; $("editPhone").value = m.phone || ""; $("editEmail").value = m.email || ""; $("editActive").checked = m.is_active;
  $("editDialog").showModal();
}
async function saveEdit(e) {
  e.preventDefault(); if (!canManageMembers() || !editingId) return;
  const { error } = await db.from("members").update({ full_name: $("editName").value.trim(), phone: $("editPhone").value.trim() || null, email: $("editEmail").value.trim() || null, is_active: $("editActive").checked }).eq("id", editingId);
  if (error) { toast(error.message, true); return; }
  $("editDialog").close(); toast(tr("saved")); await refreshData();
}
async function saveContribution(e) {
  e.preventDefault(); if (!canWrite()) return;
  const payload = { member_id: $("contributionMember").value, category: $("contributionCategory").value, amount: Number($("contributionAmount").value), contribution_date: $("contributionDate").value, notes: $("contributionNotes").value.trim() || null, created_by: currentUser.id };
  if (!payload.member_id || !(payload.amount > 0)) return;
  const { error } = await db.from("contributions").insert(payload);
  if (error) { toast(error.message, true); return; }
  e.target.reset(); $("contributionDate").value = today(); toast(tr("saved")); await refreshData();
}
async function deleteContribution(id) {
  if (!isAdmin() || !confirm(tr("confirmDelete"))) return;
  const { error } = await db.from("contributions").delete().eq("id", id);
  if (error) { toast(error.message, true); return; }
  toast(tr("deleted")); await refreshData();
}
function loanCalc() {
  const p = Number($("loanAmount").value), r = Number($("loanRate").value), i = Number($("loanInsurance").value), w = Number($("loanWeeks").value);
  if (!(p > 0)) return null;
  const interest = Math.round(p * r) / 100, ins = Math.round(p * i) / 100, total = p + interest + ins;
  return { interest, ins, total, weekly: w > 0 ? Math.ceil(total / w) : 0 };
}
function updateLoanPreview() {
  const c = loanCalc();
  $("loanPreview").textContent = c ? tr("loanPreview", { i: money(c.interest), b: money(c.ins), t: money(c.total), w: money(c.weekly) }) : "";
}
async function saveLoan(e) {
  e.preventDefault(); if (!canWrite()) return;
  const { error } = await db.rpc("create_loan", {
    p_member_id: $("loanMember").value, p_principal: Number($("loanAmount").value), p_interest_rate: Number($("loanRate").value),
    p_insurance_rate: Number($("loanInsurance").value), p_loan_date: $("loanDate").value, p_weeks: Number($("loanWeeks").value), p_notes: $("loanNotes").value.trim() || null
  });
  if (error) { toast(error.message, true); return; }
  e.target.reset(); $("loanDate").value = today(); $("loanRate").value = 8; $("loanInsurance").value = 2; $("loanWeeks").value = 12; updateLoanPreview();
  toast(tr("saved")); await refreshData();
}
async function saveRepayment(e) {
  e.preventDefault(); if (!canWrite()) return;
  const { error } = await db.rpc("record_loan_repayment", { p_loan_id: $("repaymentLoan").value, p_amount: Number($("repaymentAmount").value), p_repayment_date: $("repaymentDate").value, p_notes: $("repaymentNotes").value.trim() || null });
  if (error) { toast(error.message, true); return; }
  e.target.reset(); $("repaymentDate").value = today(); toast(tr("saved")); await refreshData();
}
async function changePassword(e) {
  e.preventDefault();
  const a = $("pw1").value, b = $("pw2").value;
  if (a.length < 8) { toast(tr("pwShort"), true); return; }
  if (a !== b) { toast(tr("pwMismatch"), true); return; }
  const { error } = await db.auth.updateUser({ password: a });
  if (error) { toast(error.message, true); return; }
  e.target.reset(); toast(tr("pwChanged"));
}

/* ---------------- start ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  $("loginForm").addEventListener("submit", signIn);
  $("logoutBtn").addEventListener("click", signOut);
  $("memberForm").addEventListener("submit", saveMember);
  $("contributionForm").addEventListener("submit", saveContribution);
  $("loanForm").addEventListener("submit", saveLoan);
  $("repaymentForm").addEventListener("submit", saveRepayment);
  $("userForm").addEventListener("submit", createUser);
  $("pwForm").addEventListener("submit", changePassword);
  $("editForm").addEventListener("submit", saveEdit);
  $("editCancel").addEventListener("click", () => $("editDialog").close());
  $("genPw").addEventListener("click", () => { $("newPassword").value = randomPassword(); });
  $("userRows").addEventListener("click", userAction);
  $("userRows").addEventListener("change", userAction);
  $("showInactive").addEventListener("change", renderMembers);
  $("stMember").addEventListener("change", renderStatement);
  ["loanAmount", "loanRate", "loanInsurance", "loanWeeks"].forEach(id => $(id).addEventListener("input", updateLoanPreview));
  $("mainNav").addEventListener("click", e => { const b = e.target.closest("[data-page]"); if (b) showPage(b.dataset.page); });
  $("userChip").addEventListener("click", () => showPage("account"));
  $("memberRows").addEventListener("click", e => { const b = e.target.closest("[data-edit-member]"); if (b) openEdit(b.dataset.editMember); });
  $("contributionRows").addEventListener("click", e => { const b = e.target.closest("[data-del-contribution]"); if (b) deleteContribution(b.dataset.delContribution); });
  document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => showPage(b.dataset.goto)));
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
  $("langToggle").addEventListener("click", () => setLanguage(lang === "sw" ? "en" : "sw"));
  $("printBtn").addEventListener("click", () => window.print());
  $("stPrint").addEventListener("click", () => window.print());
  $("csvBtn").addEventListener("click", exportCsv);
  ["contributionDate", "loanDate", "repaymentDate"].forEach(id => { $(id).value = today(); });

  applyLang();
  if (!sbReady) { msg(tr("setupNeeded"), true); return; }
  db.auth.onAuthStateChange(event => { if (event === "SIGNED_OUT" && profile) showLogin(); });
  db.auth.getSession().then(({ data }) => { if (data.session) { currentUser = data.session.user; bootApp(); } });
});
