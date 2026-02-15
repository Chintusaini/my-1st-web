(() => {
  const pwd = 'admin';
  const $ = id => document.getElementById(id);
  const loginBox = $('loginBox');
  const editor = $('editor');
  const msg = $('msg');

  function show(el) { el.classList.remove('hidden') }
  function hide(el) { el.classList.add('hidden') }

  $('loginBtn').addEventListener('click', () => {
    const v = $('adminPass').value;
    if (v === pwd) { hide(loginBox); show(editor); loadValues(); msg.textContent = 'Logged in'; }
    else msg.textContent = 'Incorrect password';
  });

  function getData() {
    try { return JSON.parse(localStorage.getItem('siteData') || 'null') || defaultData(); } catch (e) { return defaultData(); }
  }

  function defaultData() {
    return {
      hero: { title: document.querySelector('.hero h1')?.textContent || 'Chintu Saini | Digital Solutions', lead: document.querySelector('.lead')?.textContent || '' },
      kpis: ['20+ Projects', '10+ Clients', '5+ Years'],
      portfolio: [
        { title: 'Case Study — Acme Corp', content: 'Challenge → Solution → Impact', thumbnail: 'uploads/acme_thumb.svg' },
        { title: 'Sim Vault — Secure Simulation Manager', content: 'Challenge: Research teams needed a secure, versioned way to store and share simulation configurations and results across collaborators without exposing sensitive models.\n\nSolution: Built a lightweight vault service with authenticated repo access, encrypted asset storage, and a web UI for browsing and importing simulation bundles. Implemented role-based access and audit logging.\n\nTechnologies: Node.js, Express, SQLite, React (prototype).\n\nImpact: Reduced time-to-reproduce simulations by ~60% and improved collaboration across 3 internal teams.', thumbnail: 'uploads/sim_thumb.svg', link: 'https://github.com/Chintusaini/sim_vault' }
      ],
      services: ['Web Development', 'UI / UX', 'App Development']
    };
  }

  function saveData(data) { localStorage.setItem('siteData', JSON.stringify(data)); msg.textContent = 'Saved'; }

  function loadValues() {
    const d = getData();
    $('heroTitle').value = d.hero.title || '';
    $('heroLead').value = d.hero.lead || '';
    $('kpi1').value = d.kpis[0] || ''; $('kpi2').value = d.kpis[1] || ''; $('kpi3').value = d.kpis[2] || '';
    $('s1').value = d.services[0] || ''; $('s2').value = d.services[1] || ''; $('s3').value = d.services[2] || '';
    renderPortfolio(d.portfolio || []);
  }

  function renderPortfolio(list) {
    const container = $('portfolioList'); container.innerHTML = '';
    list.forEach((it, idx) => {
      const div = document.createElement('div'); div.className = 'row';
      const t = document.createElement('input'); t.value = it.title || ''; t.dataset.idx = idx; t.placeholder = 'Title';
      const c = document.createElement('input'); c.value = it.content || ''; c.dataset.idx = idx; c.placeholder = 'Short description';
      const th = document.createElement('input'); th.value = it.thumbnail || ''; th.dataset.idx = idx; th.placeholder = 'Thumbnail URL';
      const lk = document.createElement('input'); lk.value = it.link || ''; lk.dataset.idx = idx; lk.placeholder = 'Project / repo URL';
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'btn-ghost';
      del.addEventListener('click', () => { let d = getData(); d.portfolio.splice(idx, 1); saveData(d); loadValues(); });
      div.appendChild(t); div.appendChild(c); div.appendChild(th); div.appendChild(lk); div.appendChild(del);
      container.appendChild(div);
    });
  }

  // Submissions handling (localStorage + optional server fetch)
  function renderSubmissions() {
    const container = $('submissionsList'); container.innerHTML = '';
    const raw = localStorage.getItem('submissions');
    const list = raw ? JSON.parse(raw) : [];
    if (!list.length) container.textContent = 'No submissions found.';
    list.forEach((s, i) => {
      const div = document.createElement('div'); div.className = 'card small';
      div.style.padding = '8px'; div.style.marginBottom = '8px';
      div.innerHTML = `<strong>${s.name || ''}</strong> — ${s.email || ''} <br/>
        <small>${s.company || ''} • ${s.budget || ''} • ${s.timeline || ''}</small>
        <div style="margin-top:6px">${(s.summary || '').replace(/\n/g, '<br/>')}</div>
        <div style="margin-top:6px;color:var(--muted);font-size:12px">${s.date || ''}</div>`;
      container.appendChild(div);
    });
  }

  $('refreshSubs').addEventListener('click', renderSubmissions);
  $('exportSubs').addEventListener('click', () => {
    const raw = localStorage.getItem('submissions') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'submissions.json'; a.click(); URL.revokeObjectURL(url);
  });

  $('fetchServerSubs').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) return msg.textContent = 'Failed to fetch server submissions';
      const data = await res.json();
      // merge into localStorage (prepend server items)
      const local = JSON.parse(localStorage.getItem('submissions') || '[]');
      const merged = (data || []).concat(local);
      localStorage.setItem('submissions', JSON.stringify(merged));
      renderSubmissions();
      msg.textContent = 'Fetched and merged server submissions';
    } catch (err) { msg.textContent = 'Fetch failed'; }
  });

  $('addCase').addEventListener('click', () => {
    const t = $('newCaseTitle').value.trim();
    const c = $('newCaseContent').value.trim();
    const th = $('newCaseThumb').value.trim();
    const lk = $('newCaseLink').value.trim();
    if (!t) return; let d = getData(); d.portfolio.push({ title: t, content: c, thumbnail: th, link: lk }); saveData(d);
    $('newCaseTitle').value = ''; $('newCaseContent').value = ''; $('newCaseThumb').value = ''; $('newCaseLink').value = ''; loadValues();
  });

  // Upload thumbnail flow
  $('uploadThumbBtn').addEventListener('click', () => $('thumbFile').click());
  $('thumbFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    msg.textContent = 'Uploading...';
    try {
      const fd = new FormData(); fd.append('file', f);
      const headers = {};
      // include ADMIN_KEY if present in .env on server and you set it for the admin origin
      // fetch will send credentials from same origin; adjust if you use ADMIN_KEY.
      const res = await fetch('/api/upload', { method: 'POST', body: fd, headers });
      if (!res.ok) { msg.textContent = 'Upload failed'; return; }
      const json = await res.json();
      if (json && json.url) { $('newCaseThumb').value = json.url; msg.textContent = 'Upload ready: ' + json.url; }
      else msg.textContent = 'Upload returned no url';
    } catch (err) { console.error(err); msg.textContent = 'Upload error'; }
  });

  $('saveBtn').addEventListener('click', () => {
    const d = getData();
    d.hero.title = $('heroTitle').value; d.hero.lead = $('heroLead').value;
    d.kpis = [$('kpi1').value, $('kpi2').value, $('kpi3').value];
    d.services = [$('s1').value, $('s2').value, $('s3').value];
    // gather portfolio edits from inputs
    const pf = [];
    document.querySelectorAll('#portfolioList .row').forEach(r => {
      const inputs = r.querySelectorAll('input');
      if (inputs.length >= 2) pf.push({ title: inputs[0].value, content: inputs[1].value, thumbnail: inputs[2]?.value || '', link: inputs[3]?.value || '' });
    });
    d.portfolio = pf;
    saveData(d);
  });

  $('exportBtn').addEventListener('click', () => {
    const data = getData(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'siteData.json'; a.click(); URL.revokeObjectURL(url);
  });

  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => {
      try { const data = JSON.parse(r.result); saveData(data); loadValues(); msg.textContent = 'Imported'; } catch (err) { msg.textContent = 'Invalid JSON'; }
    }; r.readAsText(f);
  });

  $('resetBtn').addEventListener('click', () => { if (confirm('Reset to defaults?')) { localStorage.removeItem('siteData'); loadValues(); msg.textContent = 'Reset'; } });

  // populate editable fields when typed (live save optional)
  document.addEventListener('input', () => msg.textContent = 'Unsaved changes');

  // init
  loadValues();
})();
