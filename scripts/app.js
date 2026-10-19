'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = (name, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const STORE = 'kage-dojo-v1';
  const defaults = () => ({completed: [], notes: [], motionPaused: false});
  let state = defaults();
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && typeof saved === 'object') {
      state.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => ['sqli', 'xss', 'access'].includes(id)) : [];
      state.completed = [...new Set(state.completed)];
      state.notes = Array.isArray(saved.notes) ? saved.notes.filter(n => n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.body === 'string' && typeof n.topic === 'string' && typeof n.updated === 'number').map(n => ({id:n.id,title:n.title.slice(0,100),body:n.body.slice(0,15000),topic:n.topic,updated:n.updated})) : [];
      state.motionPaused = saved.motionPaused === true;
    }
  } catch { storageAvailable = false; }
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch { storageAvailable = false; storageWarning(); }
  };
  function storageWarning() {
    if ($('.storage-warning')) return;
    const warning = document.createElement('div');
    warning.className = 'storage-warning';
    warning.setAttribute('role', 'status');
    warning.textContent = 'Browser storage is unavailable. Notes and progress will last only for this session.';
    document.body.append(warning);
  }
  if (!storageAvailable) storageWarning();

  const lessons = [
    {
      id:'sqli', number:'01', title:'SQL Injection', icon:'gate', duration:'12 min', category:'Injection', challenge:'The Broken Gate',
      summary:'Keep untrusted input from changing the meaning of a database query.',
      objective:'Separate data from instructions.',
      explanation:'A database query is an instruction. When an application builds that instruction by joining strings with user input, the input can become part of the SQL syntax. A carefully crafted value may change which records are returned. The impact depends on the query, the database permissions, and the application.',
      unsafe:`# User input becomes SQL syntax\nquery = "SELECT id FROM users WHERE name = '" + name + "'"\ncursor.execute(query)`,
      secure:`# SQLite parameter binding\nquery = "SELECT id FROM users WHERE name = ?"\ncursor.execute(query, (name,))`,
      impact:'Depending on the application, injection can expose data, bypass a check, or modify records. This lesson demonstrates a query-behaviour simulation, not a live database.',
      fix:'Bind user values with the database driver’s parameter API. Placeholder syntax varies by driver. Use allowlists for dynamic identifiers such as table names, because value parameters do not bind identifiers. Give the application’s database account only the privileges it needs.',
      experiment:'Enter a name to see how string concatenation changes a query. Try the example, then compare it with the parameterized version.',
      example:"' OR '1'='1' --", label:'Simulated username', placeholder:'For example: alex',
      question:'Which change addresses the unsafe construction of this query?',
      choices:['Hide database errors from the page.', 'Pass the name as a bound parameter through the database driver.', 'Remove spaces from the input.'], answer:1,
      feedback:'Correct. Bound parameters keep the supplied value separate from SQL syntax. Error handling and validation can help, but do not replace parameterization.',
    },
    {
      id:'xss', number:'02', title:'Cross-Site Scripting', icon:'code', duration:'10 min', category:'Browser safety', challenge:'The Whispering Scroll',
      summary:'Understand why untrusted text must stay text in the browser.',
      objective:'Choose a safe output context.',
      explanation:'Cross-site scripting happens when untrusted content can become executable browser code in another user’s page. A common mistake is assigning user-controlled content to innerHTML. Safe handling depends on the output context: HTML text, attributes, URLs, and scripts each have different rules.',
      unsafe:`// Untrusted content is parsed as HTML\nconst message = getUserMessage();\npreview.innerHTML = message;`,
      secure:`// For plain text, use a text sink\nconst message = getUserMessage();\npreview.textContent = message;`,
      impact:'An exploitable XSS issue can act within a user’s browser session. These exercises never execute your input; they show it as text and explain the risky interpretation.',
      fix:'Use framework auto-escaping or textContent for plain text. If rich HTML is required, use a maintained HTML sanitizer with an appropriate policy. Validate URLs and avoid placing untrusted values into script contexts. A Content Security Policy adds a layer of protection but does not replace safe output handling.',
      experiment:'Enter a message containing an HTML tag. The simulator shows how a safe text sink preserves the input as text.',
      example:'<img src=x onerror="alert(1)">', label:'Simulated message', placeholder:'Write a message or try an HTML tag',
      question:'You need to display an untrusted comment as plain text. Which API should you use?',
      choices:['element.innerHTML = comment', 'element.textContent = comment', 'eval(comment)'], answer:1,
      feedback:'Correct. textContent treats the comment as text instead of parsing it as HTML. Context still matters when displaying data in attributes, URLs, or other sinks.',
    },
    {
      id:'access', number:'03', title:'Broken Access Control', icon:'shield', duration:'12 min', category:'Authorization', challenge:'The Hidden Ledger',
      summary:'Check that the person making a request can access the requested resource.',
      objective:'Enforce ownership on the server.',
      explanation:'Authentication answers who you are. Authorization answers what you may do. A signed-in user must not automatically receive every record they can name. When a server retrieves a record using an ID without checking ownership or permissions, changing that ID may expose another person’s data.',
      unsafe:`# Signed in does not mean authorized\ninvoice = db.get_invoice(invoice_id)\nreturn invoice`,
      secure:`# Scope the query to the current user\ninvoice = db.get_invoice_for_owner(\n    invoice_id, current_user.id\n)\nif invoice is None:\n    raise HTTPException(status_code=404)\nreturn invoice`,
      impact:'Missing resource-level checks can expose or modify other users’ data. Random IDs and hidden buttons do not substitute for authorization. This simulator uses fixed fictional records only.',
      fix:'Enforce permission checks on the server for every relevant request. Scope database lookups to authorized resources, deny by default, and test both horizontal access between users and vertical access between roles. Choose consistent error handling that does not reveal private resource information.',
      experiment:'You are signed in as Alex. Invoice 101 belongs to Alex; invoice 102 belongs to Morgan. Request either ID and compare the server behaviours.',
      example:'102', label:'Fictional invoice ID', placeholder:'101 or 102',
      question:'What prevents Alex from reading Morgan’s invoice by changing an ID?',
      choices:['Hide the invoice link in Alex’s interface.', 'Use an unpredictable invoice ID as the only protection.', 'Check the authenticated user’s permission to read that invoice on the server.'], answer:2,
      feedback:'Correct. The server must check access to the requested resource. Unpredictable IDs can reduce discovery, but are not authorization controls.',
    },
  ];
  const lessonById = id => lessons.find(lesson => lesson.id === id);
  const complete = id => state.completed.includes(id);
  const routes = ['home','learn','practice','analyse','notes','profile'];
  let route = 'home';
  let mapMode = 'map';
  let noteQuery = '';
  let noteTopic = 'all';
  let practiceFilter = 'all';
  const modal = $('#modal');
  let lastFocus;
  let toastTimer;
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3300);
  }
  function openModal(title, content, opts = {}) {
    if (!modal.open) lastFocus = document.activeElement;
    modal.className = opts.lesson ? 'lesson-dialog' : '';
    $('#modal-content').innerHTML = `<div class="modal-header"><div><p class="eyebrow">// ${opts.eyebrow || 'KAGE DOJO'}</p><h2 id="modal-title">${escape(title)}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>${content}`;
    if (!modal.open) modal.showModal();
  }
  modal.addEventListener('close', () => { (lastFocus?.isConnected ? lastFocus : $('#main')).focus({preventScroll:true}); });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
  function closeMenu() {
    $('#mobile-nav').hidden = true;
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
  }
  function heading(eyebrow, title, subtitle) {
    return `<div class="page-heading"><p class="eyebrow">// ${eyebrow}</p><h1>${title}</h1><p>${subtitle}</p></div>`;
  }
  function renderRoute() {
    const previousRoute = route;
    const requested = location.hash.slice(1).split('/')[0] || 'home';
    route = routes.includes(requested) ? requested : 'home';
    document.body.dataset.route = route;
    $('#landing').hidden = route !== 'home';
    $('.sidebar').hidden = route === 'home';
    const workspace = $('#workspace');
    workspace.hidden = route === 'home';
    workspace.className = `workspace route-${route}`;
    $$('[data-nav]').forEach(el => {
      if (el.dataset.nav === route) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    const names = {home:'Cybersecurity Dojo',learn:'Learning Paths',practice:'Cyber Arena',analyse:'The Forge',notes:'Field Notes',profile:'Your Progress'};
    document.title = `KAGE — ${names[route]}`;
    closeMenu();
    if (route !== 'home') {
      const views = {learn:renderLearn, practice:renderPractice, analyse:renderAnalyse, notes:renderNotes, profile:renderProfile};
      workspace.innerHTML = `<div class="page-environment" aria-hidden="true"></div><section class="page-body" aria-label="${names[route]}">${views[route]()}</section>`;
    }
    if (previousRoute !== route) {
      if (modal.open) modal.close();
      window.scrollTo({top:0,behavior:'instant'});
      $('#main').focus({preventScroll:true});
    }
    atmosphere?.update();
  }
  function renderLearn() {
    const percent = Math.round(state.completed.length / lessons.length * 100);
    const nodes = lessons.map((lesson,index) => `<button class="trail-node node-${index + 1} ${index === 0 ? 'active' : ''}" data-lesson="${lesson.id}" type="button">${icon(complete(lesson.id) ? 'check' : lesson.icon,'node-icon')}<div><small>${lesson.number} / WEB SECURITY</small><h2>${lesson.title}</h2><p>${complete(lesson.id) ? 'Completed · Revisit lesson' : lesson.objective}</p></div>${icon('arrow','node-arrow')}</button>`).join('');
    return `${heading('LEARNING PATHS','Follow your path.','Understand the system. Practise with purpose. Build your defence.')}
      <div class="map-toolbar" aria-label="Learning paths display"><button type="button" data-view="map" aria-pressed="${mapMode === 'map'}">${icon('gate')}Journey map</button><button type="button" data-view="list" aria-pressed="${mapMode === 'list'}">${icon('list')}Lesson list</button></div>
      <div class="map-progress"><span class="quiet-label">YOUR PROGRESS</span><strong>${state.completed.length} / 3 modules</strong><p>${percent}% complete</p><div class="progress-track" style="--progress:${percent}%"><span></span></div></div>
      ${mapMode === 'map' ? `<div class="trail-nodes" aria-label="Web security learning modules">${nodes}<button class="trail-node planned node-4" data-action="planned" data-title="Cryptography" type="button">${icon('lock','node-icon')}<div><small>FUTURE DISCIPLINE</small><h2>Cryptography</h2><p>Encryption · Hashing · Trust</p></div></button><button class="trail-node planned node-5" data-action="planned" data-title="Defensive Security" type="button">${icon('lock','node-icon')}<div><small>FUTURE DISCIPLINE</small><h2>Defensive Security</h2><p>Monitor · Investigate · Respond</p></div></button></div><p class="trail-note">THREE CORE MODULES. ONE STRONGER FOUNDATION.</p>` : `<div class="learning-list">${lessons.map(lesson => `<button class="panel list-lesson" data-lesson="${lesson.id}" type="button">${icon(lesson.icon)}<div><h2>${lesson.title}</h2><p>${lesson.summary}</p></div><span class="pill ${complete(lesson.id) ? 'teal' : ''}">${complete(lesson.id) ? 'Completed' : lesson.duration}</span></button>`).join('')}</div>`}`;
  }
  function renderPractice() {
    const filtered = practiceFilter === 'all' ? lessons : lessons.filter(l => l.id === practiceFilter);
    return `${heading('CYBER ARENA','Train your instincts.','A quiet mind. A sharp eye. A safer system.')}
      <div class="arena-intro"><h2>Find the flaw.<br>Learn to defend it.</h2><p>Three guided challenges. Explore a vulnerable pattern, understand its impact, and choose the safer implementation.</p></div>
      <div class="category-tabs" aria-label="Challenge filters">${[{id:'all',label:'All challenges',icon:'swords'},...lessons.map(l=>({id:l.id,label:l.category,icon:l.icon}))].map(f=>`<button type="button" data-filter="${f.id}" aria-pressed="${practiceFilter===f.id}">${icon(f.icon)}${f.label}</button>`).join('')}</div>
      <div class="challenge-grid">${filtered.map(l=>`<article class="panel challenge-card"><div class="challenge-art" aria-hidden="true"><span class="pill">${l.category}</span></div><div class="panel-content"><h2>${l.challenge}</h2><p>${l.summary}</p><div class="challenge-meta"><span>BEGINNER</span><span>${complete(l.id)?'COMPLETED':l.duration.toUpperCase()}</span></div><button class="button button-primary" data-lesson="${l.id}" data-stage="1" type="button">${complete(l.id)?'Revisit challenge':'Enter challenge'} ${icon('arrow')}</button></div></article>`).join('')}</div>
      <p class="practice-footnote">${icon('shield')}Controlled simulations. Your input is never executed against a live target.</p>`;
  }
  function renderAnalyse() {
    return `${heading('CODE ANALYSIS','The Forge','Understand your code. Strengthen what you build.')}
      <div class="forge-grid"><div class="upload-zone" id="upload-zone">${icon('upload')}<h2>Bring your project to the forge.</h2><p>Preview a ZIP selection. Source-code scanning is the next stage of KAGE.</p><button class="button button-primary" type="button" data-action="choose-file">Choose a ZIP file</button><input id="project-file" type="file" accept=".zip,application/zip,application/x-zip-compressed" hidden><small>Selection stays on your device. Nothing is uploaded.</small><div id="file-preview" class="file-preview" role="status"></div></div><div class="forge-side"><div class="forge-caption"><span class="quiet-label">CRAFT WITH INTENTION</span><h2 style="margin-top:9px">A finding is the beginning<br>of understanding.</h2><p>Connect the code you write to the lessons you learn. Understand the risk, make the change, and compare the next scan.</p></div></div><div class="panel forge-status">${icon('shield')}<div><h2>Real findings. Clear explanations.</h2><p>The analysis service is not connected yet. No scan has run, and no findings have been generated.</p><a class="text-link" href="#learn">Build your web security foundations ${icon('arrow')}</a></div><span class="pill">IN DEVELOPMENT</span></div></div><div class="workflow"><span>01 / FIND</span><span>02 / UNDERSTAND</span><span>03 / FIX</span><span>04 / COMPARE</span></div>`;
  }
  function filteredNotes() {
    return state.notes.filter(n => (noteTopic === 'all' || n.topic === noteTopic) && `${n.title} ${n.body} ${n.topic}`.toLowerCase().includes(noteQuery.toLowerCase())).sort((a,b)=>b.updated-a.updated);
  }
  function noteCards() {
    const notes = filteredNotes();
    if (!notes.length) return `<div class="empty-state">${icon('book')}<h2>${state.notes.length?'A quieter corner of the archive.':'Every discovery deserves a place.'}</h2><p>${state.notes.length?'No notes match these filters. Try another topic or search.':'Keep the concepts, code patterns, and small discoveries that make you a better defender.'}</p>${state.notes.length?'<button class="button" type="button" data-action="clear-notes-filter">Clear filters</button>':'<button class="button button-primary" type="button" data-action="new-note">Write your first note</button>'}</div>`;
    return `<div class="notes-grid">${notes.map(n => `<button class="note-card" type="button" data-note="${escape(n.id)}"><small>${escape(n.topic.toUpperCase())}</small><h2 style="margin-top:12px">${escape(n.title)}</h2><p>${escape(n.body.slice(0,125))}${n.body.length>125?'…':''}</p><small>${new Date(n.updated).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</small></button>`).join('')}</div>`;
  }
  function renderNotes() {
    return `<div class="heading-row">${heading('FIELD NOTES','The Archive','Your discoveries. Your words. Your growing understanding.')}<button class="button" type="button" data-action="new-note">${icon('plus')}New note</button></div><div class="archive-tools"><div class="input-wrap">${icon('search')}<input type="search" id="note-search" value="${escape(noteQuery)}" placeholder="Search your field notes" aria-label="Search notes" maxlength="200"></div><select id="note-topic" aria-label="Filter notes by topic">${['all','Web Security','Secure Coding','Cheat Sheets','General'].map(t=>`<option value="${t}" ${noteTopic===t?'selected':''}>${t==='all'?'All topics':t}</option>`).join('')}</select></div><div id="notes-results" aria-live="polite">${noteCards()}</div><p class="local-note">Your notes are saved in this browser. They are not synced to an account.</p>`;
  }
  function renderProfile() {
    const percent = Math.round(state.completed.length/3*100);
    return `${heading('YOUR PROGRESS','The path to mastery.','Small steps. Deliberate practice. Lasting understanding.')}
      <div class="profile-summary"><div class="profile-emblem" aria-hidden="true" lang="ja">影</div><div class="profile-name"><h2>${state.completed.length===3?'A stronger foundation.':'A new discipline.'}</h2><p>${state.completed.length===3?'Three core assessments completed':'Your journey begins with understanding'}</p><div class="progress-track" style="--progress:${percent}%"><span></span></div></div><div class="profile-stats"><div><strong>${state.completed.length}</strong><span>Modules completed</span></div><div><strong>${state.notes.length}</strong><span>Notes written</span></div><div><strong>${percent}%</strong><span>Core path progress</span></div></div></div>
      <div class="mastery-grid"><div class="panel"><div class="panel-title">WEB SECURITY / YOUR FOUNDATION</div><div class="skill-list">${lessons.map(l=>`<div class="skill-row">${icon(complete(l.id)?'check':l.icon)}<div><h3>${l.title}</h3><p>${l.objective}</p></div><span class="pill ${complete(l.id)?'teal':''}">${complete(l.id)?'Completed':'Not completed'}</span></div>`).join('')}</div></div><div class="panel mastery-aside">${icon('leaf')}<h2>Mastery is a practice,<br>not a number.</h2><p>Complete each assessment to record your progress. Revisit any lesson when you need to refresh a concept.</p><a class="button button-primary" href="#learn">${state.completed.length?'Continue your path':'Begin your training'} ${icon('arrow')}</a></div></div><p class="local-note">Progress is saved in this browser. <button type="button" data-action="reset">Reset learning progress</button></p>`;
  }

  let currentLesson = null;
  let lessonStage = 0;
  const stages = ['Understand','Experiment','Fix','Assess'];
  function openLesson(id, stage = 0) {
    currentLesson = lessonById(id);
    if (!currentLesson) return;
    lessonStage = Math.max(0,Math.min(3,stage));
    const l = currentLesson;
    const tabs = `<nav class="lesson-steps" aria-label="Lesson steps">${stages.map((s,i)=>`<button type="button" data-lesson-stage="${i}" ${lessonStage===i?'aria-current="step"':''}>${String(i+1).padStart(2,'0')} ${s}</button>`).join('')}</nav>`;
    let content;
    if (lessonStage === 0) content = `<h3>${l.objective}</h3><p>${l.explanation}</p><div class="lesson-callout">${l.impact}</div><div class="code-box"><div class="code-label">THE VULNERABLE PATTERN</div><pre>${escape(l.unsafe)}</pre></div>`;
    else if (lessonStage === 1) content = `<h3>A controlled experiment.</h3><p>${l.experiment}</p><form class="experiment-form" id="experiment-form"><label for="experiment-input">${l.label}</label><input class="field" id="experiment-input" name="input" placeholder="${escape(l.placeholder)}" maxlength="500" required autocomplete="off"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><button class="button button-primary" type="submit">Run simulation ${icon('arrow')}</button><button class="text-link" type="button" data-action="example">Use example input</button></div></form><div class="experiment-result" id="experiment-result" role="status"></div><div class="lesson-callout">Educational simulation only. No submitted code is executed, no real database is queried, and no private records are accessed.</div>`;
    else if (lessonStage === 2) content = `<h3>A safer implementation.</h3><p>${l.fix}</p><div class="code-grid"><div class="code-box"><div class="code-label">VULNERABLE PATTERN</div><pre>${escape(l.unsafe)}</pre></div><div class="code-box secure"><div class="code-label">SAFER PATTERN</div><pre>${escape(l.secure)}</pre></div></div>`;
    else content = `<h3>Check your understanding.</h3><p>${l.question}</p><form id="assessment-form">${l.choices.map((c,i)=>`<label class="assessment-choice"><input type="radio" name="answer" value="${i}" required><span>${escape(c)}</span></label>`).join('')}<button class="button button-primary" type="submit">Check answer ${icon('arrow')}</button></form><div id="assessment-feedback" class="assessment-feedback" role="status"></div>`;
    const footer = `<div class="lesson-footer"><span>${l.number} / ${l.duration} / ${complete(l.id)?'COMPLETED':'WEB SECURITY'}</span>${lessonStage<3?`<button class="button button-primary" type="button" data-lesson-stage="${lessonStage+1}">Continue ${icon('arrow')}</button>`:'<button class="button" type="button" data-action="lesson-note">Save a field note '+icon('book')+'</button>'}</div>`;
    openModal(l.title, `${tabs}<div class="lesson-stage">${content}</div>${footer}`, {lesson:true,eyebrow:'WEB SECURITY / '+l.number});
    if (lessonStage > 0) $('.lesson-stage h3',modal)?.setAttribute('tabindex','-1');
  }
  function simulate(value) {
    let text;
    if (currentLesson.id === 'sqli') {
      const pattern = /'\s*(or|union)|--|;\s*(drop|select)/i.test(value);
      text = `UNSAFE QUERY CONSTRUCTION\nSELECT id FROM users WHERE name = '${value}'\n\n${pattern?'This input contains SQL-like syntax. Depending on the database and surrounding query, input like this may alter the query’s behaviour.':'This value does not trigger the example pattern detector. Concatenating input is still unsafe; this is not a security test.'}\n\nPARAMETERIZED VERSION\nQuery: SELECT id FROM users WHERE name = ?\nBound value: ${JSON.stringify(value)}\n\nThe driver treats the entire bound value as data.`;
    } else if (currentLesson.id === 'xss') {
      text = `SAFE TEXT OUTPUT\n${value}\n\n${/<[a-z!/]|on\w+\s*=/i.test(value)?'The input includes HTML-like content. An HTML sink could interpret markup; an exploitable script context can lead to XSS. Here the content remains plain text.':'Plain text stays text. The safer sink must still be used even when an individual input looks harmless.'}\n\npreview.textContent = message\n\nNo markup or JavaScript from your input was executed.`;
    } else {
      const id = value.trim();
      text = id==='101'?'REQUEST /invoices/101\nSigned in as: Alex\nRecord owner: Alex\n\nUnsafe handler: returns the invoice.\nOwnership-scoped handler: returns Alex’s invoice.\n\nThe owner matches the authenticated user.':id==='102'?'REQUEST /invoices/102\nSigned in as: Alex\nRecord owner: Morgan\n\nUnsafe handler: exposes Morgan’s invoice.\nOwnership-scoped handler: returns no accessible record.\n\nAuthentication alone is not permission to read every invoice.':'This simulation contains only invoice 101 (Alex) and invoice 102 (Morgan). Try one of those IDs.';
    }
    $('#experiment-result').textContent = text;
  }
  function editNote(id, seed) {
    const existing = state.notes.find(n => n.id===id);
    const note = existing || {title:seed||'',body:'',topic:'Web Security'};
    openModal(existing?'Edit field note':'A new field note', `<form class="modal-body note-form" id="note-form" data-id="${escape(existing?.id||'')}"><label for="note-title">Title</label><input class="field" id="note-title" name="title" maxlength="100" value="${escape(note.title)}" placeholder="A concept worth remembering" required><label for="note-body">Your notes</label><textarea class="field" id="note-body" name="body" maxlength="15000" placeholder="What did you discover? Why does it matter?" required>${escape(note.body)}</textarea><div class="form-row"><div><label for="note-category">Topic</label><select class="field" id="note-category" name="topic">${['Web Security','Secure Coding','Cheat Sheets','General'].map(t=>`<option ${note.topic===t?'selected':''}>${t}</option>`).join('')}</select></div></div><div class="modal-footer">${existing?'<button class="button danger-button" type="button" data-delete-note="'+escape(existing.id)+'">Delete note</button>':''}<button class="button" type="button" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">Save note ${icon('check')}</button></div></form>`,{eyebrow:'THE ARCHIVE'});
    $('#note-title').focus();
  }
  function openSearch() {
    openModal('Find your next discovery.', `<div class="modal-body"><input type="search" class="field search-input" id="global-search" placeholder="Search lessons, screens, and your notes" aria-label="Search the dojo" maxlength="200"><div id="search-results" aria-live="polite"></div></div>`,{eyebrow:'SEARCH THE DOJO'});
    updateSearch('');
    $('#global-search').focus();
  }
  function updateSearch(query) {
    const q=query.toLowerCase().trim();
    const pages=[{title:'Learning Paths',route:'learn'},{title:'Cyber Arena',route:'practice'},{title:'Code Analysis · The Forge',route:'analyse'},{title:'Field Notes · The Archive',route:'notes'},{title:'Your Progress',route:'profile'}];
    const results=[...lessons.filter(l=>`${l.title} ${l.summary}`.toLowerCase().includes(q)).map(l=>`<button class="search-result" type="button" data-lesson="${l.id}"><strong>${l.title}</strong><span>LESSON · ${l.duration}</span></button>`),...pages.filter(p=>p.title.toLowerCase().includes(q)).map(p=>`<a class="search-result" href="#${p.route}" data-search-link><strong>${p.title}</strong><span>EXPLORE THE DOJO</span></a>`),...state.notes.filter(n=>`${n.title} ${n.body}`.toLowerCase().includes(q)).slice(0,6).map(n=>`<button class="search-result" type="button" data-note="${escape(n.id)}"><strong>${escape(n.title)}</strong><span>YOUR FIELD NOTE</span></button>`)];
    $('#search-results').innerHTML=results.join('')||'<p class="muted">No matching discoveries. Try “SQL”, “notes”, or “practice”.</p>';
  }
  function showFile(file) {
    if (!file) return;
    const output=$('#file-preview');
    if (!/\.zip$/i.test(file.name)) { output.textContent='Choose a ZIP archive to preview your selection.';return; }
    output.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(2)} MB selected. No upload or scan has started.`;
  }
  document.addEventListener('click', event => {
    const target=event.target.closest('button,a');
    if(!target)return;
    if (target.hasAttribute('data-search-link')) modal.close();
    if (target.dataset.lesson) {openLesson(target.dataset.lesson,Number(target.dataset.stage||0));return;}
    if (target.dataset.lessonStage!==undefined) {openLesson(currentLesson.id,Number(target.dataset.lessonStage));return;}
    if (target.dataset.note) {editNote(target.dataset.note);return;}
    if (target.dataset.deleteNote) {
      const id=target.dataset.deleteNote;
      openModal('Delete this field note?',`<div class="modal-body"><p>This removes the note from this browser. This action cannot be undone.</p><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Keep note</button><button class="button danger-button" type="button" data-confirm-delete="${escape(id)}">Delete note</button></div></div>`);return;
    }
    if (target.dataset.confirmDelete) {state.notes=state.notes.filter(n=>n.id!==target.dataset.confirmDelete);save();modal.close();renderRoute();toast('Field note deleted.');return;}
    if (target.dataset.view) {mapMode=target.dataset.view;renderRoute();$(`[data-view="${mapMode}"]`).focus();return;}
    if (target.dataset.filter) {practiceFilter=target.dataset.filter;renderRoute();$(`[data-filter="${practiceFilter}"]`).focus();return;}
    const action=target.dataset.action;
    if(action==='close-modal')modal.close();
    if(action==='menu') {
      const open=$('#mobile-nav').hidden;
      $('#mobile-nav').hidden=!open;target.setAttribute('aria-expanded',String(open));target.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    }
    if(action==='search')openSearch();
    if(action==='choose-file')$('#project-file').click();
    if(action==='account')openModal('Your journey starts here.',`<div class="modal-body"><p>You can explore all three core lessons and save notes without signing in. Progress is stored in this browser.</p><p>Account sign-in and syncing are not connected yet.</p><a class="button button-primary" href="#learn" data-search-link>Begin training ${icon('arrow')}</a></div>`,{eyebrow:'WELCOME TO KAGE'});
    if(action==='leaderboard')openModal('A discipline of your own.',`<div class="modal-body"><p>Public rankings are not available yet. Your progress comes from completed assessments, with no invented scores or activity.</p><a class="button button-primary" href="#profile" data-search-link>View your progress ${icon('arrow')}</a></div>`,{eyebrow:'MASTERY'});
    if(action==='planned')openModal(target.dataset.title,`<div class="modal-body"><p>This discipline is planned for a later release. The three web-security modules are available now.</p><button class="button button-primary" type="button" data-action="close-modal">Return to the path</button></div>`,{eyebrow:'FUTURE DISCIPLINE'});
    if(action==='new-note')editNote();
    if(action==='lesson-note')editNote(null,currentLesson.title);
    if(action==='clear-notes-filter'){noteQuery='';noteTopic='all';renderRoute();}
    if(action==='example'){$('#experiment-input').value=currentLesson.example;$('#experiment-input').focus();}
    if(action==='reset')openModal('Begin with a clean slate?',`<div class="modal-body"><p>This resets completed lesson assessments in this browser. Your field notes stay in the archive.</p><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Keep progress</button><button class="button danger-button" type="button" data-action="confirm-reset">Reset progress</button></div></div>`);
    if(action==='confirm-reset'){state.completed=[];save();modal.close();renderRoute();toast('Learning progress reset.');}
    if(action==='motion'){state.motionPaused=!state.motionPaused;save();atmosphere.update();}
  });
  document.addEventListener('input', event=>{
    if(event.target.id==='note-search'){noteQuery=event.target.value;$('#notes-results').innerHTML=noteCards();}
    if(event.target.id==='global-search')updateSearch(event.target.value);
  });
  document.addEventListener('change', event=>{
    if(event.target.id==='note-topic'){noteTopic=event.target.value;$('#notes-results').innerHTML=noteCards();}
    if(event.target.id==='project-file')showFile(event.target.files[0]);
  });
  document.addEventListener('submit', event=>{
    if(event.target.id==='experiment-form'){event.preventDefault();simulate($('#experiment-input').value);}
    if(event.target.id==='assessment-form'){
      event.preventDefault();
      const answer=Number(new FormData(event.target).get('answer'));
      if(answer===currentLesson.answer){
        if(!complete(currentLesson.id)){state.completed.push(currentLesson.id);save();}
        $('#assessment-feedback').textContent=currentLesson.feedback+' Assessment completed. Your progress has been saved in this browser.';
        const pos=window.scrollY;renderRoute();window.scrollTo({top:pos,behavior:'instant'});
      } else {$('#assessment-feedback').textContent='Not quite. Revisit the safer implementation, then try again. Focus on the control that directly addresses the flaw.';}
    }
    if(event.target.id==='note-form'){
      event.preventDefault();
      const data=new FormData(event.target);
      const title=data.get('title').trim(),body=data.get('body').trim();
      if(!title||!body){toast('Add a title and a note before saving.');return;}
      const note={id:event.target.dataset.id||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title,body,topic:data.get('topic'),updated:Date.now()};
      const index=state.notes.findIndex(n=>n.id===note.id);
      if(index>=0)state.notes[index]=note;else state.notes.push(note);
      save();modal.close();if(route==='notes'||route==='profile')renderRoute();toast('Field note saved in this browser.');
    }
  });
  document.addEventListener('dragover',event=>{if(event.target.closest('#upload-zone')){event.preventDefault();$('#upload-zone').classList.add('dragging');}});
  document.addEventListener('dragleave',event=>{if(event.target.id==='upload-zone')event.target.classList.remove('dragging');});
  document.addEventListener('drop',event=>{if(event.target.closest('#upload-zone')){event.preventDefault();$('#upload-zone').classList.remove('dragging');showFile(event.dataTransfer.files[0]);}});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeMenu();
    if((event.ctrlKey||event.metaKey)&&event.key==='k'){event.preventDefault();openSearch();}
  });
  document.addEventListener('click',event=>{if(!$('#mobile-nav').hidden&&!event.target.closest('#mobile-nav,.menu-toggle'))closeMenu();});

  const atmosphere=window.createKageScene({
    host:$('#landing'),sceneCanvas:$('#hero-scene'),atmosphereCanvas:$('#atmosphere'),
    isHome:()=>route==='home',isPaused:()=>state.motionPaused,
  });
  window.KageScene=atmosphere;
  window.addEventListener('hashchange',renderRoute);
  renderRoute();
})();
