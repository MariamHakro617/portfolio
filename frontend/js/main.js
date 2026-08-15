/* ============================================================
   RENDER — pulls from data.js (localStorage-backed) into the DOM
   ============================================================ */

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderHero() {
  const p = getData("profile");
  document.getElementById("hero-name").textContent = p.name;
  document.getElementById("hero-role").textContent = p.title;
  document.getElementById("hero-tagline").textContent = p.tagline;
  document.getElementById("avatar-initials").textContent = initials(p.name);
  document.getElementById("tb-name").textContent = p.name;
  document.getElementById("tb-role").textContent = p.title;
  document.getElementById("tb-location").textContent = p.location;
  document.getElementById("brand-name").textContent = p.name.split(" ")[0];
}

function renderAbout() {
  const p = getData("profile");
  document.getElementById("about-text").textContent = p.about;
  document.getElementById("about-goals").textContent = p.goals;
  const chipRow = document.getElementById("spec-chips");
  chipRow.innerHTML = "";
  p.specializations.forEach((s) => chipRow.appendChild(el(`<span class="chip">${s}</span>`)));
}

function renderSkills() {
  const skills = getData("skills");
  const wrap = document.getElementById("skills-grid");
  wrap.innerHTML = "";
  skills.forEach((s) => {
    wrap.appendChild(
      el(`
      <div class="skill-row reveal">
        <div class="top"><span>${s.name}</span><span>${s.level}%</span></div>
        <div class="skill-bar"><span style="width:${s.level}%"></span></div>
      </div>
    `)
    );
  });
}

function renderTechnologies() {
  const tech = getData("technologies");
  const wrap = document.getElementById("tech-grid");
  wrap.innerHTML = "";
  Object.keys(tech).forEach((cat) => {
    const items = tech[cat].map((t) => `<li>${t}</li>`).join("");
    wrap.appendChild(el(`<div class="tech-cat reveal"><h4>${cat}</h4><ul>${items}</ul></div>`));
  });
}

function renderProjects() {
  const projects = getData("projects");
  const wrap = document.getElementById("project-grid");
  wrap.innerHTML = "";
  if (!projects.length) {
    wrap.appendChild(el(`<p class="empty-state">No projects published yet. Check back soon.</p>`));
    return;
  }
  projects.forEach((proj, i) => {
    const tags = proj.tech.map((t) => `<span>${t}</span>`).join("");
    const feats = proj.features.map((f) => `<li>${f}</li>`).join("");
    const links = [
      proj.github ? `<a href="${proj.github}" target="_blank" rel="noopener">Repo →</a>` : "",
      proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener">Live demo →</a>` : ""
    ].join("");
    wrap.appendChild(
      el(`
      <article class="bracket-card project-card reveal">
        <div class="project-thumb">FIG. ${String(i + 1).padStart(2, "0")} — SCREENSHOT</div>
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <ul class="feature-list">${feats}</ul>
        <div class="tech-tags">${tags}</div>
        <div class="project-links">${links}</div>
      </article>
    `)
    );
  });
}

function renderExperience() {
  const exp = getData("experience");
  const wrap = document.getElementById("timeline");
  wrap.innerHTML = "";
  exp.forEach((e) => {
    wrap.appendChild(
      el(`
      <div class="timeline-item reveal">
        <div class="period">${e.period}</div>
        <h3>${e.role}</h3>
        <div class="org">${e.org}</div>
        <p>${e.description}</p>
      </div>
    `)
    );
  });
}

function renderEducation() {
  const edu = getData("education");
  const wrap = document.getElementById("edu-grid");
  wrap.innerHTML = "";
  edu.forEach((e) => {
    wrap.appendChild(
      el(`
      <div class="bracket-card edu-card reveal">
        <div class="period">${e.period}</div>
        <h3>${e.degree}</h3>
        <div class="org mono">${e.institution}</div>
        <p>${e.details}</p>
      </div>
    `)
    );
  });
}

function renderCertifications() {
  const certs = getData("certifications");
  const wrap = document.getElementById("cert-grid");
  wrap.innerHTML = "";
  certs.forEach((c) => {
    wrap.appendChild(
      el(`
      <div class="bracket-card cert-card reveal">
        <div>
          <h4>${c.name}</h4>
          <div class="issuer">${c.issuer}</div>
        </div>
        <div class="year">${c.year}</div>
      </div>
    `)
    );
  });
}

function renderServices() {
  const services = getData("services");
  const wrap = document.getElementById("services-grid");
  wrap.innerHTML = "";
  services.forEach((s, i) => {
    wrap.appendChild(
      el(`
      <div class="bracket-card service-card reveal">
        <div class="num">${String(i + 1).padStart(2, "0")}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>
    `)
    );
  });
}

function renderTestimonials() {
  const t = getData("testimonials");
  const wrap = document.getElementById("testimonial-grid");
  if (!wrap) return;
  wrap.innerHTML = "";
  if (!t.length) {
    wrap.appendChild(el(`<p class="empty-state">No testimonials yet.</p>`));
    return;
  }
  t.forEach((x) => {
    wrap.appendChild(
      el(`
      <div class="bracket-card testimonial-card reveal">
        <p class="quote">"${x.quote}"</p>
        <div class="author">${x.author}</div>
        <div class="role">${x.role}</div>
      </div>
    `)
    );
  });
}

function renderContact() {
  const p = getData("profile");
  const dl = document.getElementById("contact-dl");
  if (!dl) return;
  dl.innerHTML = `
    <dt>Email</dt><dd><a href="mailto:${p.email}">${p.email}</a></dd>
    <dt>Phone</dt><dd>${p.phone}</dd>
    <dt>Location</dt><dd>${p.location}</dd>
  `;
  const socialRow = document.getElementById("social-row");
  if (socialRow) {
    socialRow.innerHTML = "";
    Object.keys(p.social).forEach((key) => {
      socialRow.appendChild(el(`<a href="${p.social[key]}" target="_blank" rel="noopener">${key}</a>`));
    });
  }
}

function renderFooter() {
  const p = getData("profile");
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const nameEl = document.getElementById("footer-name");
  if (nameEl) nameEl.textContent = p.name;
}

function renderAll() {
  renderHero();
  renderAbout();
  renderSkills();
  renderTechnologies();
  renderProjects();
  renderExperience();
  renderEducation();
  renderCertifications();
  renderServices();
  renderTestimonials();
  renderContact();
  renderFooter();
  initReveal();
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const items = document.querySelectorAll(".reveal:not(.in)");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((i) => observer.observe(i));
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const successBox = document.getElementById("formSuccess");

  const fieldValue = (name) => form.elements.namedItem(name).value.trim();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    const fields = {
      name: { value: fieldValue("fullname"), test: (v) => v.length >= 2 },
      email: { value: fieldValue("email"), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      subject: { value: fieldValue("subject"), test: (v) => v.length >= 3 },
      message: { value: fieldValue("message"), test: (v) => v.length >= 10 }
    };

    Object.keys(fields).forEach((key) => {
      const wrapper = form.querySelector(`[data-field="${key}"]`);
      const ok = fields[key].test(fields[key].value);
      wrapper.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      successBox.classList.remove("show");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    submitContactMessage({
      name: fields.name.value,
      email: fields.email.value,
      phone: fieldValue("phone"),
      subject: fields.subject.value,
      message: fields.message.value
    })
      .then(() => {
        form.reset();
        successBox.classList.remove("form-error-box");
        successBox.classList.add("show");
        successBox.textContent = "Message sent — thanks for reaching out. I'll reply within a couple of days.";
      })
      .catch((err) => {
        successBox.classList.add("show", "form-error-box");
        successBox.textContent = err.message || "Something went wrong sending your message. Please try again.";
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      });
  });
}

/* ============================================================
   BOOTSTRAP — load content from the API, then render
   ============================================================ */
async function bootstrap() {
  try {
    await loadAllContent();
    renderAll();
    document.dispatchEvent(new CustomEvent("content:loaded"));
  } catch (err) {
    console.error("Failed to load site content:", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div style="background:#c24a3e;color:#fff;padding:12px 20px;font-family:monospace;font-size:13px;text-align:center;">
        Couldn't reach the server. Make sure the backend is running (see README) and refresh this page.
      </div>`
    );
  }
  initNav();
  initContactForm();
}

document.addEventListener("DOMContentLoaded", bootstrap);
