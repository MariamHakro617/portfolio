/* ============================================================
   AUTH
   isAuthed(), login(), logout() come from js/data.js and talk to
   the real /api/auth endpoints (JWT-backed).
   ============================================================ */
function requireAuth() {
  if (!isAuthed()) window.location.href = "login.html";
}
function adminLogout() {
  logout();
  window.location.href = "login.html";
}

/* ============================================================
   SCHEMAS — describe every editable list-type content section
   ============================================================ */
const SCHEMAS = {
  skills: {
    label: "Skills",
    idField: null,
    titleField: "name",
    subField: (i) => `${i.category} — ${i.level}%`,
    fields: [
      { key: "name", label: "Skill Name", type: "text" },
      { key: "level", label: "Level (0-100)", type: "number" },
      { key: "category", label: "Category", type: "text" }
    ]
  },
  projects: {
    label: "Projects",
    idField: "id",
    titleField: "title",
    subField: (i) => i.tech.join(", "),
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "features", label: "Key Features (comma-separated)", type: "list" },
      { key: "tech", label: "Technologies (comma-separated)", type: "list" },
      { key: "github", label: "GitHub URL", type: "text" },
      { key: "demo", label: "Live Demo URL", type: "text" },
      { key: "featured", label: "Featured", type: "checkbox" }
    ]
  },
  experience: {
    label: "Experience",
    idField: null,
    titleField: "role",
    subField: (i) => `${i.org} · ${i.period}`,
    fields: [
      { key: "role", label: "Role / Title", type: "text" },
      { key: "org", label: "Organization", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  education: {
    label: "Education",
    idField: null,
    titleField: "degree",
    subField: (i) => `${i.institution} · ${i.period}`,
    fields: [
      { key: "degree", label: "Degree", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "details", label: "Details", type: "textarea" }
    ]
  },
  certifications: {
    label: "Certifications",
    idField: null,
    titleField: "name",
    subField: (i) => `${i.issuer} · ${i.year}`,
    fields: [
      { key: "name", label: "Certificate / Achievement Name", type: "text" },
      { key: "issuer", label: "Issuer", type: "text" },
      { key: "year", label: "Year", type: "text" }
    ]
  },
  services: {
    label: "Services",
    idField: null,
    titleField: "title",
    subField: (i) => i.description,
    fields: [
      { key: "title", label: "Service Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  testimonials: {
    label: "Testimonials",
    idField: null,
    titleField: "author",
    subField: (i) => i.role,
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author Name", type: "text" },
      { key: "role", label: "Author Role", type: "text" }
    ]
  },
  blog: {
    label: "Blog Posts",
    idField: "id",
    titleField: "title",
    subField: (i) => new Date(i.date).toLocaleDateString(),
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "excerpt", label: "Excerpt (shown on blog list)", type: "textarea" },
      { key: "body", label: "Full Article Body", type: "textarea" }
    ]
  }
};

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg) {
  let toast = document.querySelector(".save-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "save-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ============================================================
   GENERIC LIST RENDERING
   ============================================================ */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderSchemaSection(key) {
  const schema = SCHEMAS[key];
  const panel = document.getElementById("panel-" + key);
  const items = getData(key);

  panel.innerHTML = `
    <h2>${schema.label} — ${items.length} item${items.length === 1 ? "" : "s"}</h2>
    <div id="list-${key}"></div>
    <div class="admin-form-actions" style="margin-top:16px;">
      <button class="btn btn-primary" id="add-${key}" type="button">+ Add ${schema.label.replace(/s$/, "")}</button>
    </div>
    <div id="form-${key}" style="margin-top:20px;"></div>
  `;

  const listWrap = panel.querySelector(`#list-${key}`);
  if (!items.length) {
    listWrap.innerHTML = `<p class="empty-state">Nothing here yet. Add the first item below.</p>`;
  } else {
    listWrap.innerHTML = "";
    items.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "admin-list-item";
      row.innerHTML = `
        <div class="info">
          <h3>${escapeHtml(String(item[schema.titleField] ?? ""))}</h3>
          <p>${escapeHtml(String(schema.subField(item) ?? ""))}</p>
        </div>
        <div class="actions">
          <button data-action="edit" data-idx="${idx}">Edit</button>
          <button data-action="delete" data-idx="${idx}" class="danger">Delete</button>
        </div>
      `;
      listWrap.appendChild(row);
    });
    listWrap.querySelectorAll('[data-action="edit"]').forEach((btn) =>
      btn.addEventListener("click", () => renderSchemaForm(key, parseInt(btn.dataset.idx, 10)))
    );
    listWrap.querySelectorAll('[data-action="delete"]').forEach((btn) =>
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.idx, 10);
        if (!confirm("Delete this item? This cannot be undone.")) return;
        const arr = getData(key).slice();
        arr.splice(idx, 1);
        btn.disabled = true;
        try {
          await setData(key, arr);
          showToast("Deleted");
          renderSchemaSection(key);
        } catch (err) {
          btn.disabled = false;
          showToast(err.message || "Delete failed — is the server running?");
        }
      })
    );
  }

  panel.querySelector(`#add-${key}`).addEventListener("click", () => renderSchemaForm(key, null));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderSchemaForm(key, editIdx) {
  const schema = SCHEMAS[key];
  const items = getData(key);
  const editing = editIdx !== null;
  const item = editing ? items[editIdx] : {};
  const formWrap = document.getElementById(`form-${key}`);

  const fieldsHtml = schema.fields
    .map((f) => {
      const value = item[f.key];
      if (f.type === "textarea") {
        return `<div class="form-field"><label>${f.label}</label><textarea rows="4" data-key="${f.key}">${escapeHtml(value ?? "")}</textarea></div>`;
      }
      if (f.type === "checkbox") {
        return `<div class="form-field"><label><input type="checkbox" data-key="${f.key}" ${value ? "checked" : ""} style="width:auto;display:inline-block;margin-right:8px;" />${f.label}</label></div>`;
      }
      if (f.type === "list") {
        return `<div class="form-field"><label>${f.label}</label><input type="text" data-key="${f.key}" data-list="true" value="${escapeHtml((value || []).join(", "))}" /></div>`;
      }
      if (f.type === "date") {
        return `<div class="form-field"><label>${f.label}</label><input type="date" data-key="${f.key}" value="${escapeHtml(value || "")}" /></div>`;
      }
      if (f.type === "number") {
        return `<div class="form-field"><label>${f.label}</label><input type="number" min="0" max="100" data-key="${f.key}" value="${escapeHtml(value ?? "")}" /></div>`;
      }
      return `<div class="form-field"><label>${f.label}</label><input type="text" data-key="${f.key}" value="${escapeHtml(value ?? "")}" /></div>`;
    })
    .join("");

  formWrap.innerHTML = `
    <div class="admin-panel admin-form" style="background:var(--paper-dim);">
      <h2>${editing ? "Edit" : "Add"} ${schema.label.replace(/s$/, "")}</h2>
      ${fieldsHtml}
      <div class="admin-form-actions">
        <button class="btn btn-primary" id="save-${key}" type="button">Save</button>
        <button class="btn btn-dark-outline" id="cancel-${key}" type="button">Cancel</button>
      </div>
    </div>
  `;

  formWrap.querySelector(`#cancel-${key}`).addEventListener("click", () => {
    formWrap.innerHTML = "";
  });

  formWrap.querySelector(`#save-${key}`).addEventListener("click", async () => {
    const newItem = editing ? { ...item } : {};
    formWrap.querySelectorAll("[data-key]").forEach((input) => {
      const k = input.dataset.key;
      if (input.type === "checkbox") {
        newItem[k] = input.checked;
      } else if (input.dataset.list) {
        newItem[k] = input.value.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (input.type === "number") {
        newItem[k] = Number(input.value);
      } else {
        newItem[k] = input.value.trim();
      }
    });

    if (schema.idField && !newItem[schema.idField]) {
      newItem[schema.idField] = slugify(newItem[schema.titleField] || "item") + "-" + Date.now().toString(36);
    }

    const arr = getData(key).slice();
    if (editing) {
      arr[editIdx] = newItem;
    } else {
      arr.push(newItem);
    }

    const saveBtn = formWrap.querySelector(`#save-${key}`);
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    try {
      await setData(key, arr);
      showToast("Saved");
      formWrap.innerHTML = "";
      renderSchemaSection(key);
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
      showToast(err.message || "Save failed — is the server running?");
    }
  });
}

/* ============================================================
   PROFILE TAB (single object, custom form)
   ============================================================ */
function renderProfilePanel() {
  const panel = document.getElementById("panel-profile");
  const p = getData("profile");
  panel.innerHTML = `
    <h2>Profile</h2>
    <div class="admin-form">
      <div class="form-field"><label>Full Name</label><input type="text" id="pf-name" value="${escapeHtml(p.name)}" /></div>
      <div class="form-field"><label>Title / Role</label><input type="text" id="pf-title" value="${escapeHtml(p.title)}" /></div>
      <div class="form-field"><label>Tagline</label><input type="text" id="pf-tagline" value="${escapeHtml(p.tagline)}" /></div>
      <div class="form-field"><label>Location</label><input type="text" id="pf-location" value="${escapeHtml(p.location)}" /></div>
      <div class="form-field"><label>Email</label><input type="email" id="pf-email" value="${escapeHtml(p.email)}" /></div>
      <div class="form-field"><label>Phone</label><input type="text" id="pf-phone" value="${escapeHtml(p.phone)}" /></div>
      <div class="form-field"><label>About</label><textarea rows="4" id="pf-about">${escapeHtml(p.about)}</textarea></div>
      <div class="form-field"><label>Goals</label><textarea rows="3" id="pf-goals">${escapeHtml(p.goals)}</textarea></div>
      <div class="form-field"><label>Specializations (comma-separated)</label><input type="text" id="pf-specs" value="${escapeHtml(p.specializations.join(", "))}" /></div>
      <div class="form-field"><label>GitHub URL</label><input type="text" id="pf-github" value="${escapeHtml(p.social.github)}" /></div>
      <div class="form-field"><label>LinkedIn URL</label><input type="text" id="pf-linkedin" value="${escapeHtml(p.social.linkedin)}" /></div>
      <div class="form-field"><label>Twitter/X URL</label><input type="text" id="pf-twitter" value="${escapeHtml(p.social.twitter)}" /></div>
      <div class="form-field"><label>Dribbble URL</label><input type="text" id="pf-dribbble" value="${escapeHtml(p.social.dribbble)}" /></div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" id="save-profile" type="button">Save Profile</button>
      </div>
    </div>
  `;

  const saveBtn = panel.querySelector("#save-profile");
  saveBtn.addEventListener("click", async () => {
    const updated = {
      ...p,
      name: document.getElementById("pf-name").value.trim(),
      title: document.getElementById("pf-title").value.trim(),
      tagline: document.getElementById("pf-tagline").value.trim(),
      location: document.getElementById("pf-location").value.trim(),
      email: document.getElementById("pf-email").value.trim(),
      phone: document.getElementById("pf-phone").value.trim(),
      about: document.getElementById("pf-about").value.trim(),
      goals: document.getElementById("pf-goals").value.trim(),
      specializations: document.getElementById("pf-specs").value.split(",").map((s) => s.trim()).filter(Boolean),
      social: {
        github: document.getElementById("pf-github").value.trim(),
        linkedin: document.getElementById("pf-linkedin").value.trim(),
        twitter: document.getElementById("pf-twitter").value.trim(),
        dribbble: document.getElementById("pf-dribbble").value.trim()
      }
    };
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    try {
      await setData("profile", updated);
      showToast("Profile saved");
    } catch (err) {
      showToast(err.message || "Save failed — is the server running?");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Profile";
    }
  });
}

/* ============================================================
   MESSAGES TAB
   ============================================================ */
async function renderMessagesPanel() {
  const panel = document.getElementById("panel-messages");
  panel.innerHTML = `<h2>Contact Messages</h2><div id="msg-list"><p class="empty-state">Loading…</p></div>`;
  const list = panel.querySelector("#msg-list");

  let messages;
  try {
    messages = await fetchMessages();
  } catch (err) {
    list.innerHTML = `<p class="empty-state">Couldn't load messages — ${escapeHtml(err.message || "is the server running?")}</p>`;
    return;
  }

  panel.querySelector("h2").textContent = `Contact Messages — ${messages.length}`;

  if (!messages.length) {
    list.innerHTML = `<p class="empty-state">No messages yet. Submissions from the contact form will appear here.</p>`;
    return;
  }

  list.innerHTML = messages
    .map(
      (m) => `
    <div class="admin-list-item msg-item ${m.read ? "" : "unread"}">
      <div class="info">
        <h3>${escapeHtml(m.subject)} ${m.read ? "" : '<span class="badge" style="background:var(--signal);color:var(--ink);border-radius:999px;font-size:10px;padding:1px 7px;">NEW</span>'}</h3>
        <p>${escapeHtml(m.message)}</p>
        <p class="meta">${escapeHtml(m.name)} · ${escapeHtml(m.email)} ${m.phone ? "· " + escapeHtml(m.phone) : ""} · ${new Date(m.created_at).toLocaleString()}</p>
      </div>
      <div class="actions">
        ${!m.read ? `<button data-action="read" data-id="${m.id}">Mark Read</button>` : ""}
        <button data-action="delete" data-id="${m.id}" class="danger">Delete</button>
      </div>
    </div>
  `
    )
    .join("");

  list.querySelectorAll('[data-action="read"]').forEach((btn) =>
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await markMessageRead(btn.dataset.id);
        await renderMessagesPanel();
        await renderSidebarBadges();
      } catch (err) {
        btn.disabled = false;
        showToast(err.message || "Failed to update message.");
      }
    })
  );
  list.querySelectorAll('[data-action="delete"]').forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this message?")) return;
      btn.disabled = true;
      try {
        await deleteMessage(btn.dataset.id);
        await renderMessagesPanel();
        await renderSidebarBadges();
      } catch (err) {
        btn.disabled = false;
        showToast(err.message || "Failed to delete message.");
      }
    })
  );
}

async function renderSidebarBadges() {
  const badge = document.getElementById("msg-badge");
  if (!badge) return;
  try {
    const messages = await fetchMessages();
    const unread = messages.filter((m) => !m.read).length;
    badge.textContent = unread > 0 ? unread : "";
    badge.style.display = unread > 0 ? "inline-block" : "none";
  } catch (err) {
    // non-fatal — sidebar badge just stays hidden if this fails
    badge.style.display = "none";
  }
}

/* ============================================================
   TABS
   ============================================================ */
function switchTab(tab) {
  document.querySelectorAll(".admin-panel-wrap").forEach((p) => (p.style.display = "none"));
  document.querySelectorAll(".admin-nav button").forEach((b) => b.classList.remove("active"));
  document.getElementById("wrap-" + tab).style.display = "block";
  document.querySelector(`.admin-nav button[data-tab="${tab}"]`).classList.add("active");
  window.location.hash = tab;

  if (tab === "profile") renderProfilePanel();
  else if (tab === "messages") renderMessagesPanel();
  else if (SCHEMAS[tab]) renderSchemaSection(tab);
}

async function initAdminDashboard() {
  requireAuth();
  if (!isAuthed()) return; // requireAuth already redirected

  document.getElementById("logoutBtn").addEventListener("click", adminLogout);
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (!confirm("Reset ALL content to the default demo data? This cannot be undone.")) return;
    try {
      await resetData();
      showToast("Data reset");
      const active = document.querySelector(".admin-nav button.active").dataset.tab;
      switchTab(active);
      renderSidebarBadges();
    } catch (err) {
      showToast(err.message || "Reset failed");
    }
  });

  document.querySelectorAll(".admin-nav button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  const main = document.querySelector(".admin-main");
  try {
    await loadAllContent();
  } catch (err) {
    main.innerHTML = `<div class="admin-panel"><p class="empty-state">Couldn't reach the server. Make sure the backend is running (see README) and refresh this page.</p></div>`;
    return;
  }

  await renderSidebarBadges();
  const initialTab = window.location.hash ? window.location.hash.slice(1) : "profile";
  switchTab(document.querySelector(`.admin-nav button[data-tab="${initialTab}"]`) ? initialTab : "profile");
}
