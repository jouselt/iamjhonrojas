// bio.js — render bio content from data/bio.json into [data-bio] targets.
(function () {
  const T = (s) => (s == null ? "" : String(s));

  fetch("data/bio.json")
    .then((r) => { if (!r.ok) throw new Error("bio.json " + r.status); return r.json(); })
    .then((d) => {
      document.querySelectorAll("[data-bio]").forEach((el) => {
        const key = el.getAttribute("data-bio");
        if (key === "stats" && Array.isArray(d.stats)) {
          el.innerHTML = d.stats
            .map((s) => `<li><span class="label">${T(s.label)}</span><span class="value">${T(s.value)}</span></li>`)
            .join("");
        } else if (key === "skills" && Array.isArray(d.skills)) {
          el.innerHTML = d.skills.map((s) => `<li>${T(s)}</li>`).join("");
        } else if (typeof d[key] === "string") {
          el.textContent = d[key];
        }
      });

      // Contact mail + social
      const mail = document.getElementById("contactMail");
      if (mail && d.contact && d.contact.email) {
        mail.href = "mailto:" + d.contact.email +
          "?subject=" + encodeURIComponent("Oportunidad de colaboración — " + (d.name || ""));
        mail.textContent = d.contact.email;
      }
      const social = document.getElementById("contactSocial");
      if (social && d.contact) {
        const links = [];
        if (d.contact.instagram)
          links.push(`<li><a href="${d.contact.instagram}" target="_blank" rel="noopener">Instagram ↗</a></li>`);
        if (d.contact.phone)
          links.push(`<li><a href="tel:${d.contact.phone.replace(/\s+/g, "")}">WhatsApp / Tel ↗</a></li>`);
        social.innerHTML = links.join("");
      }
    })
    .catch((e) => console.warn("[bio] no cargó:", e.message));
})();
