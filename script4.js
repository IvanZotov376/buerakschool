
   const API_URL = (() => {
  const saved = localStorage.getItem('api_url');
  if (saved) return saved.replace(/\/$/, '');
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    if ((location.port || '') === '5000') return location.origin;
    return `${location.protocol}//${location.hostname || '127.0.0.1'}:5000`;
  }
  return 'http://127.0.0.1:5000';
})();

const state = { data:null, debugText:'' };

function $(id){ return document.getElementById(id); }
function escapeHtml(v){ return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }
function statusClass(status){ return 's' + (status || 0); }
function getInitials(name){ return String(name||'У').trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'У'; }

function alignTeacherContentToHeader(){
  const root = document.documentElement;
  const logo = document.querySelector('#header-placeholder .logo img') || document.querySelector('#header-placeholder .logo');
  const logout = document.querySelector('#logoutBtn');
  const headerContent = document.querySelector('#header-placeholder .header-content');
  const leftRect = logo ? logo.getBoundingClientRect() : (headerContent ? headerContent.getBoundingClientRect() : null);
  const rightRect = logout ? logout.getBoundingClientRect() : (headerContent ? headerContent.getBoundingClientRect() : null);
  if (!leftRect || !rightRect) return;
  const contentRect = document.querySelector('.content')?.getBoundingClientRect();
  const left = Math.max(0, Math.round(leftRect.left));
  const right = Math.min(window.innerWidth, Math.round(rightRect.right || rightRect.left));
  const width = Math.max(320, right - left);
  const contentLeft = contentRect ? Math.round(contentRect.left) : 0;
  root.style.setProperty('--teacher-content-inset-left', Math.max(0, left - contentLeft) + 'px');
  root.style.setProperty('--teacher-content-width', width + 'px');
}

window.addEventListener('resize', alignTeacherContentToHeader);
window.addEventListener('load', alignTeacherContentToHeader);
setTimeout(alignTeacherContentToHeader, 300);

function initDates(){
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 13);
  $('dateStart').value = monday.toISOString().slice(0,10);
  $('dateEnd').value = sunday.toISOString().slice(0,10);
}

function applyUser(){
  const login = localStorage.getItem('login') || 'Учитель';
  const school = localStorage.getItem('school') || 'МКОУ Буерак-Поповская СШ';
  const elName = $('userName'); if (elName) elName.textContent = login;
  const elAvatar = $('avatar'); if (elAvatar) elAvatar.textContent = getInitials(login);
  const elSchool = $('schoolLine'); if (elSchool) elSchool.textContent = school;
}

async function api(path, payload){
  const res = await fetch(API_URL + path, {
    method:'POST',
    mode:'cors',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload || {})
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch(e) { throw new Error(`Сервер вернул не JSON. HTTP ${res.status}: ${text.slice(0, 160)}`); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function currentTeacherPayload(extra){
  return Object.assign({
    login: localStorage.getItem('login') || '',
    password: sessionStorage.getItem('password') || localStorage.getItem('password') || '',
    role: localStorage.getItem('role') || 'Учитель',
    school: localStorage.getItem('school') || 'МКОУ Буерак-Поповская СШ',
    start: $('dateStart')?.value,
    end: $('dateEnd')?.value
  }, extra || {});
}

async function refreshTeacherData(){
  const activeLoader = $('loaderDash');
  if (activeLoader) activeLoader.classList.add('active');
  const payload = currentTeacherPayload();
  try{
    const data = await api('/api/lkteacher/dashboard', payload);
    state.data = data;
    renderAll(data);
  }catch(err){
    renderError(err.message);
  }finally{
    if (activeLoader) activeLoader.classList.remove('active');
  }
}

function renderAll(data){
  const d = data || {};
  const debug = Array.isArray(d.debug) ? d.debug : [];
  const subjectGroups = getRealSubjectGroups(d);
  const school = d.school_actual || d.school || localStorage.getItem('school') || '—';

  const elSchool2 = $('schoolLine'); if (elSchool2) elSchool2.textContent = school;

  // В текущей версии вкладки endpoint-ов/диагностики удалены, поэтому любые
  // обращения к их старым DOM-элементам должны быть безопасными. Именно здесь
  // раньше возникала ошибка Cannot set properties of null.
  renderTeacherProfile(d);
  renderTeacherMiniPanel(d);
  renderWorkload(d.workload || {});
  renderClassesAndStaff(d.workload || {}, subjectGroups);
  renderJournal(d, subjectGroups);
  renderSchedule(d.schedule);
  state.debugText = debug.join('\n');
  const debugLog = $('debugLog');
  if (debugLog) debugLog.textContent = state.debugText || 'Дебаг пуст.';
}

function metric(title, value, small=false){
  return `<div class="card"><div class="metric-title">${escapeHtml(title)}</div><div class="metric-value ${small?'small':''}">${escapeHtml(value)}</div></div>`;
}


function renderContextData(data, jsonEndpoints) {
  const panel = $('contextDataPanel');
  const grid = $('contextDataGrid');
  if (!panel || !grid) return;

  const p = data.user_profile || {};
  const school = data.school_actual || data.school || '—';
  const parsed = data.parsed || {};

  const rows = [];

  if (p.full_name || p.login) rows.push(['ФИО учителя', p.full_name || p.login || '—']);
  if (p.user_id) rows.push(['ID пользователя СГО', p.user_id]);
  if (p.role) rows.push(['Роль в системе', p.role]);
  if (p.email) rows.push(['Email', p.email]);
  rows.push(['Школа', school]);
  if (p.source) rows.push(['Источник данных', p.source]);

  if (parsed.subjectgroups) {
    const sg = parsed.subjectgroups;
    if (sg.count != null) rows.push(['Субъект-групп в СГО', sg.count]);
    if (sg.subjects && sg.subjects.length) rows.push(['Предметы', sg.subjects.slice(0, 6).join(', ') + (sg.subjects.length > 6 ? ' …ещё ' + (sg.subjects.length - 6) : '')]);
    if (sg.classes && sg.classes.length) rows.push(['Классы', sg.classes.slice(0, 8).join(', ') + (sg.classes.length > 8 ? ' …ещё ' + (sg.classes.length - 8) : '')]);
    if (sg.terms && sg.terms.length) rows.push(['Учебные периоды', sg.terms.slice(0, 4).join(', ')]);
  }
  if (parsed.workload) {
    const wl = parsed.workload;
    if (wl.classes_count) rows.push(['Классов у учителя', wl.classes_count]);
    if (wl.subjects_count) rows.push(['Предметов у учителя', wl.subjects_count]);
    if (wl.pairs_count) rows.push(['Пар класс-предмет', wl.pairs_count]);
  }
  if (parsed.schedule) {
    const sc = parsed.schedule;
    if (sc.lessons) rows.push(['Уроков в расписании', sc.lessons]);
    if (sc.days) rows.push(['Дней в расписании', sc.days]);
  }

  // Cookies
  const cookieCount = Array.isArray(data.cookies) ? data.cookies.length : 0;
  if (cookieCount) rows.push(['Cookie сессии', data.cookies.join(', ')]);

  // at-токен
  if (data.at_token_present != null) rows.push(['AT-токен получен', data.at_token_present ? 'Да ✓' : 'Нет']);

  if (!rows.length) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';
  grid.innerHTML = rows.map(r =>
    `<div class="teacher-info-card">
      <div class="teacher-info-label">${escapeHtml(r[0])}</div>
      <div class="teacher-info-value">${escapeHtml(String(r[1]))}</div>
    </div>`
  ).join('');
}

function renderSgSummary(subjectGroups, parsed) {
  const panel = $('sgSummaryPanel');
  const content = $('sgSummaryContent');
  if (!panel || !content) return;

  const sg = parsed && parsed.subjectgroups ? parsed.subjectgroups : null;
  const groups = Array.isArray(subjectGroups) ? subjectGroups : [];

  if (!groups.length && !sg) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';

  let html = '';

  // Сводные метрики
  if (sg) {
    html += `<div class="workload-summary">
      <div class="workload-pill">Всего групп<b>${escapeHtml(sg.count || groups.length || 0)}</b></div>
      ${sg.subjects ? `<div class="workload-pill">Предметов<b>${escapeHtml(sg.subjects.length)}</b></div>` : ''}
      ${sg.classes ? `<div class="workload-pill">Классов<b>${escapeHtml(sg.classes.length)}</b></div>` : ''}
      ${sg.terms ? `<div class="workload-pill">Периодов<b>${escapeHtml(sg.terms.length)}</b></div>` : ''}
    </div>`;

    if (sg.subjects && sg.subjects.length) {
      html += `<div style="margin-bottom:10px"><b>Предметы:</b><div class="list-chips">${sg.subjects.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('')}</div></div>`;
    }
    if (sg.classes && sg.classes.length) {
      html += `<div style="margin-bottom:10px"><b>Классы:</b><div class="list-chips">${sg.classes.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('')}</div></div>`;
    }
    if (sg.terms && sg.terms.length) {
      html += `<div style="margin-bottom:14px"><b>Учебные периоды:</b><div class="list-chips">${sg.terms.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('')}</div></div>`;
    }
  }

  // Таблица субъект-групп (первые 30)
  if (groups.length) {
    const shown = groups.slice(0, 30);
    html += `<div class="table-wrap"><table>
      <thead><tr><th>ID</th><th>Предмет</th><th>Класс</th></tr></thead>
      <tbody>${shown.map(s =>
        `<tr>
          <td>${escapeHtml(String(s.id || s.sgId || '—'))}</td>
          <td>${escapeHtml(s.subject || s.name || '—')}</td>
          <td>${escapeHtml(s.className || s.class || '—')}</td>
        </tr>`
      ).join('')}</tbody>
    </table></div>`;
    if (groups.length > 30) {
      html += `<div class="footer-note" style="margin-top:8px">Показаны первые 30 из ${groups.length} групп. Все данные доступны на вкладке «Журнал».</div>`;
    }
  }

  content.innerHTML = html;
}

function renderSuccessEndpoints(jsonEndpoints) {
  const panel = $('successEndpointsPanel');
  const content = $('successEndpointsContent');
  if (!panel || !content) return;

  const successful = (jsonEndpoints || []).filter(x => x.status === 200 && x.json);
  const partial = (jsonEndpoints || []).filter(x => x.status === 200 && !x.json);

  if (!successful.length && !partial.length) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';

  let html = '';

  if (successful.length) {
    html += `<div style="margin-bottom:12px"><b style="color:#087348">✓ Вернули JSON (${successful.length}):</b><div class="table-wrap" style="margin-top:8px"><table>
      <thead><tr><th>Метод</th><th>URL</th><th>Статус</th><th>Preview</th></tr></thead>
      <tbody>${successful.map(x =>
        `<tr>
          <td>${escapeHtml(x.method || 'GET')}</td>
          <td style="font-family:monospace;font-size:.82rem">${escapeHtml(x.final_url || x.url || '')}</td>
          <td><span class="status s200">${escapeHtml(x.status || '200')}</span></td>
          <td style="max-width:340px;font-size:.82rem;word-break:break-all">${escapeHtml((x.preview || '').slice(0, 280))}</td>
        </tr>`
      ).join('')}</tbody>
    </table></div></div>`;
  }

  if (partial.length) {
    html += `<div><b style="color:#8d5b00">○ HTTP 200 (HTML/другой тип, ${partial.length}):</b>
      <div class="endpoint-list" style="margin-top:8px">${partial.map(x => `<span class="chip">${escapeHtml(x.final_url || x.url || '')}</span>`).join('')}</div>
    </div>`;
  }

  content.innerHTML = html;
}



function renderTeacherMiniPanel(data){
  const box = $('teacherMiniBox');
  if (!box) return;
  // Показываем ТОЛЬКО subjectgroups, которые сервер уже отфильтровал по точному teacherId профиля.
  // class_journal_dashboard.cards напрямую не используем: в них могут быть общие карточки без teacherId.
  const rows = getRealSubjectGroups(data).map(g => ({
    sgId: g.id || g.value || g.sgId || g.subjectGroupId,
    subject: g.subject || g.subject_name || g.name,
    class_name: g.class_name || g.className || g.class || '',
    average: g.average || g.avg || ''
  })).filter(r => r.sgId);
  const profileTeacherId = String((data && data.user_profile && data.user_profile.user_id) || '').trim();
  if (!rows.length){
    box.innerHTML = '<div class="empty">Нет предметов, где teacherId совпадает с ID текущего профиля' + (profileTeacherId ? ' (' + escapeHtml(profileTeacherId) + ')' : '') + '.</div>';
    return;
  }
  box.innerHTML = '<div class="teacher-mini-grid">' + rows.map(r => {
    const title = ((r.class_name || '') ? escapeHtml(r.class_name)+' • ' : '') + escapeHtml(r.subject || 'Предмет');
    const avg = (r.average !== undefined && r.average !== null && r.average !== '') ? String(r.average).replace('.', ',') : '—';
    return '<div class="teacher-mini-card"><div><div class="teacher-mini-title">'+title+'</div><div class="teacher-mini-id">ID: '+escapeHtml(r.sgId || '')+'</div></div><div class="teacher-mini-avg">'+escapeHtml(avg)+'</div><button class="btn ghost" onclick="openSubjectCard(''+escapeHtml(r.sgId || '')+'',''+escapeHtml(r.subject || '')+'',''+escapeHtml(r.class_name || '')+'')"><i class="fa-solid fa-book"></i></button></div>';
  }).join('') + '</div>';
}

function renderTeacherProfile(data) {
  const box = $('teacherProfileGrid');
  if (!box) return;
  data = data || {};
  const p = data.user_profile || {};
  const school = data.school_actual || data.school || p.school || localStorage.getItem('school') || '—';
  const rows = [
    ['Логин', p.login || data.login || localStorage.getItem('login') || '—'],
    ['ФИО / имя', p.full_name || localStorage.getItem('full_name') || '—'],
    ['Роль', p.role || localStorage.getItem('role') || 'Учитель'],
    ['Email', p.email || localStorage.getItem('email') || '—'],
    ['Школа', school],
    ['ID в СГО', p.user_id || '—'],
    ['Источник', p.source || '—'],
    ['Статус', data.success === false ? '✗ Ошибка' : '✓ Данные получены']
  ];
  box.innerHTML = rows.map(function(r, i){
    const isStatus = i === rows.length - 1;
    const style = isStatus ? (data.success === false ? ' style="color:#b71c1c"' : ' style="color:#087348"') : '';
    return `<div class="teacher-info-card"><div class="teacher-info-label">${escapeHtml(r[0])}</div><div class="teacher-info-value"${style}>${escapeHtml(r[1])}</div></div>`;
  }).join('');
}

function initialsFromName(name){
  return String(name || 'П').trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'П';
}

function buildFallbackClassesAndStaff(subjectGroups){
  const classMap = {};
  const staffMap = {};
  (subjectGroups || []).map(normalizeSubjectGroup).forEach(function(g){
    if (!classMap[g.className]) classMap[g.className] = {class_name:g.className, subjects:new Set(), teachers:new Set(), subjectgroups:0, lessons:0};
    classMap[g.className].subjects.add(g.subject);
    classMap[g.className].subjectgroups += 1;
    (g.teachers || []).forEach(function(t){
      classMap[g.className].teachers.add(t);
      if (!staffMap[t]) staffMap[t] = {name:t, subjects:new Set(), classes:new Set(), subjectgroups:0};
      staffMap[t].subjects.add(g.subject);
      staffMap[t].classes.add(g.className);
      staffMap[t].subjectgroups += 1;
    });
  });
  return {
    classes_detail: Object.values(classMap).map(x => ({class_name:x.class_name, subjects:[...x.subjects].sort(), teachers:[...x.teachers].sort(), subjectgroups:x.subjectgroups, lessons:x.lessons})).sort((a,b)=>classSort(a.class_name,b.class_name)),
    staff: Object.values(staffMap).map(x => ({name:x.name, subjects:[...x.subjects].sort(), classes:[...x.classes].sort(classSort), subjectgroups:x.subjectgroups})).sort((a,b)=>a.name.localeCompare(b.name,'ru'))
  };
}

function renderClassesAndStaff(workload, subjectGroups){
  const classesBox = $('classesBox');
  const staffBox = $('staffBox');
  if (!classesBox && !staffBox) return;
  const fallback = buildFallbackClassesAndStaff(subjectGroups || []);
  const classes = (Array.isArray(workload.classes_detail) && workload.classes_detail.length) ? workload.classes_detail : fallback.classes_detail;
  const staff = (Array.isArray(workload.staff) && workload.staff.length) ? workload.staff : fallback.staff;

  if (classesBox) {
    if (!classes.length) {
      classesBox.innerHTML = '<div class="empty">Список классов не найден. Нужен успешный ответ /webapi/subjectgroups.</div>';
    } else {
      classesBox.innerHTML = '<div class="real-data-grid">' + classes.map(function(c){
        const subjects = (c.subjects || []).slice(0, 8).map(s => '<span class="mini-chip">'+escapeHtml(s)+'</span>').join('');
        const teachers = (c.teachers || []).slice(0, 5).map(t => '<span class="mini-chip"><i class="fa-solid fa-user-tie"></i> '+escapeHtml(t)+'</span>').join('');
        return '<div class="real-card">'
          + '<div class="real-card-head"><div class="real-card-title">'+escapeHtml(c.class_name || 'Класс')+'</div><div class="real-card-badge">'+escapeHtml((c.subjects || []).length)+' предметов</div></div>'
          + '<div class="staff-meta">Субъект-групп: <b>'+escapeHtml(c.subjectgroups || 0)+'</b>'+(c.lessons ? ' · уроков за период: <b>'+escapeHtml(c.lessons)+'</b>' : '')+'</div>'
          + '<div class="mini-list">'+(subjects || '<span class="section-note">Предметы не указаны</span>')+'</div>'
          + (teachers ? '<div class="mini-list" style="margin-top:12px">'+teachers+'</div>' : '<div class="section-note">Преподаватели по классу не указаны в JSON.</div>')
          + '</div>';
      }).join('') + '</div><div class="section-note">Карточки построены из реальных субъект-групп СГО: класс → предметы → преподаватели.</div>';
    }
  }

  if (staffBox) {
    if (!staff.length) {
      staffBox.innerHTML = '<div class="empty">Педагогический состав не найден в текущем JSON. Обычно он приходит в поле teachers у /webapi/subjectgroups.</div>';
    } else {
      staffBox.innerHTML = '<div class="real-data-grid">' + staff.map(function(t){
        const subjects = (t.subjects || []).slice(0, 7).map(s => '<span class="mini-chip">'+escapeHtml(s)+'</span>').join('');
        const classes = (t.classes || []).slice(0, 10).map(c => '<span class="mini-chip">'+escapeHtml(c)+'</span>').join('');
        return '<div class="real-card staff-card">'
          + '<div class="staff-avatar">'+escapeHtml(initialsFromName(t.name))+'</div>'
          + '<div><div class="staff-name">'+escapeHtml(t.name || 'Преподаватель')+'</div>'
          + '<div class="staff-meta">Ведёт групп: <b>'+escapeHtml(t.subjectgroups || 0)+'</b></div>'
          + '<div class="mini-list">'+(subjects || '<span class="section-note">Предметы не указаны</span>')+'</div>'
          + '<div class="mini-list">'+(classes || '<span class="section-note">Классы не указаны</span>')+'</div></div>'
          + '</div>';
      }).join('') + '</div>';
    }
  }
}

function renderWorkload(workload){
  const box = $('workloadBox');
  if (!box) return;
  const w = workload || {};
  const pairs = Array.isArray(w.pairs) ? w.pairs : [];
  const subjects = Array.isArray(w.subjects) ? w.subjects : [];
  const classes = Array.isArray(w.classes) ? w.classes : [];
  if (!pairs.length && !subjects.length && !classes.length){
    box.innerHTML = '<div class="empty">Классы, предметы и нагрузка пока не найдены. Нажмите «Обновить» или проверьте, что СГО отдаёт subjectgroups/classmeetings.</div>';
    return;
  }
  let summary = '<div class="workload-summary">'
    + '<div class="workload-pill">Классы<b>'+escapeHtml(w.classes_count || classes.length || 0)+'</b></div>'
    + '<div class="workload-pill">Предметы<b>'+escapeHtml(w.subjects_count || subjects.length || 0)+'</b></div>'
    + '<div class="workload-pill">Предметные группы<b>'+escapeHtml(w.subjectgroups_count || 0)+'</b></div>'
    + '<div class="workload-pill">Уроки за период<b>'+escapeHtml(w.scheduled_lessons_count || 0)+'</b></div>'
    + '</div>';
  let classChips = (classes.length ? classes : ['—']).map(function(x){ return '<span class="chip">'+escapeHtml(x)+'</span>'; }).join('');
  let subjectChips = (subjects.length ? subjects : ['—']).map(function(x){ return '<span class="chip">'+escapeHtml(x)+'</span>'; }).join('');
  let chips = '<div><b>Классы:</b><div class="list-chips">'+classChips+'</div></div><div><b>Предметы:</b><div class="list-chips">'+subjectChips+'</div></div>';
  let table = '';
  if (pairs.length){
    table = '<div class="table-wrap"><table class="workload-table"><thead><tr><th>Класс</th><th>Предмет</th><th>Групп</th><th>Уроков за период</th><th>Ученики</th></tr></thead><tbody>'
      + pairs.map(function(p){ return '<tr><td>'+escapeHtml(p.class_name||'—')+'</td><td>'+escapeHtml(p.subject||'—')+'</td><td>'+escapeHtml(p.subjectgroups||0)+'</td><td>'+escapeHtml(p.lessons||0)+'</td><td>'+escapeHtml(p.students||'—')+'</td></tr>'; }).join('')
      + '</tbody></table></div>';
  }
  box.innerHTML = summary + chips + table;
}

function renderPages(pages){
  $('pagesTable').innerHTML = `<thead><tr><th>Метод</th><th>URL</th><th>Статус</th><th>Тип</th><th>Время</th></tr></thead><tbody>${
    (pages||[]).map(p=>`<tr>
      <td>${escapeHtml(p.method||'GET')}</td>
      <td>${escapeHtml(p.final_url || p.url || '')}</td>
      <td><span class="status ${statusClass(p.status)}">${escapeHtml(p.status || '—')}</span></td>
      <td>${escapeHtml(p.content_type || '—')}</td>
      <td>${escapeHtml(p.elapsed_sec ?? '—')} сек.</td>
    </tr>`).join('') || `<tr><td colspan="5" class="empty">Нет данных</td></tr>`
  }</tbody>`;
}

function renderEndpoints(endpoints){
  const box = $('endpointList');
  if (!box) return;
  box.innerHTML = (endpoints||[]).map(e=>`<span class="chip">${escapeHtml(e)}</span>`).join('') || '<div class="empty">Endpoint-ы не найдены</div>';
}

function renderResponses(items){
  const table = $('responsesTable');
  if (!table) return;
  table.innerHTML = `<thead><tr><th>Метод</th><th>URL</th><th>Статус</th><th>JSON</th><th>Preview</th></tr></thead><tbody>${
    (items||[]).map(x=>`<tr>
      <td>${escapeHtml(x.method||'GET')}</td>
      <td>${escapeHtml(x.final_url || x.url || '')}</td>
      <td><span class="status ${statusClass(x.status)}">${escapeHtml(x.status || '—')}</span></td>
      <td>${x.json ? 'да' : 'нет'}</td>
      <td>${escapeHtml((x.preview || '').slice(0,220))}</td>
    </tr>`).join('') || `<tr><td colspan="5" class="empty">Нет preview-ответов</td></tr>`
  }</tbody>`;
}

function normalizeTextValue(value){
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (typeof value === 'object') return String(value.label || value.name || value.fullName || value.title || value.value || '').trim();
  return String(value).trim();
}

function teacherNamesFromGroup(group){
  const raw = group?.teachers || group?.teacher_names || group?.teacherNames || [];
  const names = [];
  if (Array.isArray(raw)) {
    raw.forEach(function(t){
      const name = normalizeTextValue(t);
      if (name && !names.includes(name)) names.push(name);
    });
  } else {
    const name = normalizeTextValue(raw);
    if (name) names.push(name);
  }
  const single = normalizeTextValue(group?.teacher || group?.teacherName);
  if (single && !names.includes(single)) names.push(single);
  return names;
}

function getRealSubjectGroups(data){
  const direct = Array.isArray(data?.subjectgroups) ? data.subjectgroups : [];
  if (direct.length) return direct;

  const detailsRows = data?.subjectgroup_details?.rows;
  if (Array.isArray(detailsRows) && detailsRows.length) return detailsRows;

  const apiDetails = data?.subjectgroup_api_details || {};
  const rows = [];
  Object.keys(apiDetails).forEach(function(sgid){
    const item = apiDetails[sgid] || {};
    const norm = item.normalized || {};
    rows.push({
      id: sgid,
      sgId: sgid,
      subjectGroupId: sgid,
      subject: norm.subject || item.subject || sgid,
      name: norm.subject || item.subject || sgid,
      className: norm.class_name || item.class_name || '',
      class_name: norm.class_name || item.class_name || '',
      class: norm.class_name || item.class_name || '',
      teachers: norm.teachers || norm.teacher_names || [],
      teacher_ids: norm.teacher_ids || [],
      room: norm.room || '',
      students: item.students || [],
      students_count: item.students_count || 0,
      schedule_count: item.schedule_count || 0
    });
  });
  return rows;
}

function normalizeSubjectGroup(group){
  const subject = normalizeTextValue(group?.subject || group?.subjectName || group?.name || group?.fullName) || 'Без названия';
  const cls = normalizeTextValue(group?.className || group?.class_name || group?.class || group?.grade) || 'Без класса';
  return {
    id: normalizeTextValue(group?.id || group?.sgId || group?.subjectGroupId),
    subject: subject,
    className: cls,
    grade: normalizeTextValue(group?.grade),
    teachers: teacherNamesFromGroup(group)
  };
}

function buildClassSubjectMap(subjectGroups){
  const map = {};
  (subjectGroups || []).map(normalizeSubjectGroup).forEach(function(g){
    if (!map[g.className]) map[g.className] = {};
    const key = g.subject;
    if (!map[g.className][key]) map[g.className][key] = { subject:g.subject, className:g.className, ids:[], teachers:[] };
    if (g.id && !map[g.className][key].ids.includes(g.id)) map[g.className][key].ids.push(g.id);
    g.teachers.forEach(function(t){ if (t && !map[g.className][key].teachers.includes(t)) map[g.className][key].teachers.push(t); });
  });
  return map;
}

function classSort(a,b){
  const na = parseInt(String(a).match(/\d+/)?.[0] || '999', 10);
  const nb = parseInt(String(b).match(/\d+/)?.[0] || '999', 10);
  if (na !== nb) return na - nb;
  return String(a).localeCompare(String(b), 'ru');
}

function renderSelectedJournalClass(){
  const sgBox = $('subjectGroupsBox');
  const summary = $('journalClassSummary');
  const select = $('journalClassSelect');
  if (!sgBox || !select) return;

  const map = state.journalClassMap || {};
  const className = select.value;
  const subjects = Object.values(map[className] || {}).sort((a,b)=>a.subject.localeCompare(b.subject, 'ru'));

  if (!className || !subjects.length) {
    sgBox.innerHTML = '<div class="empty">Выберите класс, чтобы увидеть предметы и преподавателей.</div>';
    if (summary) summary.innerHTML = '';
    return;
  }

  const teacherCount = new Set(subjects.flatMap(s => s.teachers || [])).size;
  const groupCount = subjects.reduce((n,s)=>n+(s.ids ? s.ids.length : 0),0);
  if (summary) {
    summary.innerHTML = '<div class="journal-stat"><span>Класс</span><b>'+escapeHtml(className)+'</b></div>'
      + '<div class="journal-stat"><span>Предметов</span><b>'+escapeHtml(subjects.length)+'</b></div>'
      + '<div class="journal-stat"><span>Групп учителя</span><b>'+escapeHtml(groupCount || '—')+'</b></div>';
  }

  sgBox.innerHTML = '<div class="subject-card-grid">'
    + subjects.map(function(s){
      const teachers = (s.teachers && s.teachers.length)
        ? '<div class="teacher-list">'+s.teachers.map(t=>'<div class="teacher-item"><i class="fa-solid fa-user-tie"></i><span>'+escapeHtml(t)+'</span></div>').join('')+'</div>'
        : '<div class="teacher-empty">Преподаватель в ответе СГО не указан</div>';
      const ids = s.ids && s.ids.length ? '<div class="subject-meta"><span class="chip">Групп: '+escapeHtml(s.ids.length)+'</span><span class="chip">ID: '+escapeHtml(s.ids.slice(0,3).join(', '))+(s.ids.length>3?'…':'')+'</span></div>' : '';
      const mainId = s.ids && s.ids.length ? s.ids[0] : '';
      state.subjectById = state.subjectById || {};
      if (mainId) state.subjectById[String(mainId)] = {subject:s.subject, className:s.className};
      return '<div class="subject-card" onclick="openSubjectCard(\''+escapeHtml(mainId)+'\')"><div class="subject-card-title">'+escapeHtml(s.subject)+'</div>'+ids+'<div class="teacher-list-title"><b>Текущий учитель:</b></div>'+teachers+'<div class="journal-note">Нажмите, чтобы открыть расписание, список учеников и средние оценки.</div></div>';
    }).join('')
    + '</div><div class="journal-note">Всего субъект-групп по выбранному классу: '+escapeHtml(groupCount)+'. Если преподаватели пустые, значит текущий JSON /webapi/subjectgroups не вернул поле teachers/name для этих групп.</div>';
}


async function openSubjectCard(sgId, subjectName, className){
  const meta = (state.subjectById || {})[String(sgId)] || {};
  subjectName = subjectName || meta.subject || '';
  className = className || meta.className || '';
  const box = $('subjectCardDetail');
  if (!box) return;
  if (!sgId){
    box.innerHTML = '<div class="subject-detail-panel"><div class="subject-detail-body empty">У этой карточки нет subjectGroupId.</div></div>';
    return;
  }
  box.innerHTML = '<div class="subject-detail-panel"><div class="subject-detail-head"><div class="subject-detail-title">'+escapeHtml(className)+' · '+escapeHtml(subjectName)+'</div><button class="btn ghost" onclick="$(\'subjectCardDetail\').innerHTML=\'\'">Закрыть</button></div><div class="subject-detail-body"><div class="empty">Загрузка реальных данных из СГО...</div></div></div>';
  try{
    const d = await api('/api/lkteacher/subjectcard', currentTeacherPayload({sgId: sgId, subjectGroupId: sgId}));
    if (!d || d.success === false) throw new Error(d?.error || 'СГО не вернул данные по предмету');
    renderSubjectCardDetail(d, subjectName, className);
  }catch(err){
    box.innerHTML = '<div class="subject-detail-panel"><div class="subject-detail-head"><div class="subject-detail-title">'+escapeHtml(className)+' · '+escapeHtml(subjectName)+'</div><button class="btn ghost" onclick="$(\'subjectCardDetail\').innerHTML=\'\'">Закрыть</button></div><div class="subject-detail-body"><div class="empty" style="color:#b71c1c">'+escapeHtml(err.message)+'</div></div></div>';
  }
}

function avgClass(avg){
  const n = Number(avg);
  if (!Number.isFinite(n)) return '';
  if (n < 3) return 'bad';
  if (n < 4) return 'warn';
  return '';
}
function formatRuDate(value){
  const m = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  if (!m) return '—';
  const [y,mo,d] = m[0].split('-');
  return d+'.'+mo+'.'+y;
}
function renderSubjectCardDetail(d, fallbackSubject, fallbackClass){
  const box = $('subjectCardDetail');
  const info = d.subject || {};
  const title = (info.subject || fallbackSubject || 'Предмет') + (info.class_name || fallbackClass ? ' (' + (info.class_name || fallbackClass) + ')' : '');
  const schedule = Array.isArray(d.schedule) ? d.schedule : [];
  const students = Array.isArray(d.students) ? d.students : [];
  const averages = Array.isArray(d.averages) ? d.averages : [];
  const avgMap = {};
  averages.forEach(a => { avgMap[String(a.studentId)] = a.average; });
  const scheduleRows = schedule.map((l,i)=>{
    const time = l.time ? ((l.time.start || '') + (l.time.end ? '–' + l.time.end : '')) : '';
    const room = l.room && (l.room.name || l.room.title) ? (l.room.name || l.room.title) : '';
    const theme = l.lesson && (l.lesson.name || l.lesson.title) ? (l.lesson.name || l.lesson.title) : '—';
    return '<tr><td>'+escapeHtml(i+1)+'</td><td>'+escapeHtml(formatRuDate(l.day))+'</td><td>'+escapeHtml(time || '—')+'</td><td>'+escapeHtml(l.number || '—')+'</td><td>'+escapeHtml(room || info.room || '—')+'</td><td>'+escapeHtml(theme)+'</td></tr>';
  }).join('') || '<tr><td colspan="6" class="empty">Расписание по этой предметной группе не найдено за выбранный период.</td></tr>';
  const studentRows = students.map((st,i)=>{
    const avg = avgMap[String(st.id)];
    const avgText = avg === undefined || avg === null || avg === '' ? '—' : Number(avg).toFixed ? Number(avg).toFixed(2).replace('.', ',') : String(avg);
    return '<tr><td>'+escapeHtml(i+1)+'. '+escapeHtml(st.fullName || st.name || '—')+'</td><td><span class="avg-dot '+avgClass(avg)+'"></span><b>'+escapeHtml(avgText)+'</b></td></tr>';
  }).join('') || '<tr><td colspan="2" class="empty">Список учеников не найден в ответе журнала СГО.</td></tr>';
  box.innerHTML = '<div class="subject-detail-panel">'
    + '<div class="subject-detail-head"><div class="subject-detail-title">'+escapeHtml(title)+'</div><button class="btn ghost" onclick="$(\'subjectCardDetail\').innerHTML=\'\'">Закрыть</button></div>'
    + '<div class="subject-detail-body">'
    + '<div class="subject-mini-grid"><div class="subject-mini-stat"><span>subjectGroupId</span>'+escapeHtml(d.sgId || '')+'</div><div class="subject-mini-stat"><span>Уроков</span>'+escapeHtml(schedule.length)+'</div><div class="subject-mini-stat"><span>Учеников</span>'+escapeHtml(students.length)+'</div><div class="subject-mini-stat"><span>Кабинет</span>'+escapeHtml(info.room || '—')+'</div></div>'
    + '<h2><i class="fa-solid fa-calendar-days"></i> Расписание</h2><div class="table-wrap"><table><thead><tr><th>№ п.п.</th><th>Дата</th><th>Время</th><th>№ урока</th><th>Кабинет</th><th>Тема урока</th></tr></thead><tbody>'+scheduleRows+'</tbody></table></div>'
    + '<h2 style="margin-top:18px"><i class="fa-solid fa-users"></i> Ученики и средняя оценка</h2><div class="table-wrap"><table><thead><tr><th>Ученик</th><th>Средняя оценка</th></tr></thead><tbody>'+studentRows+'</tbody></table></div>'
    + (d.journal_message ? '<div class="journal-note">'+escapeHtml(d.journal_message)+'</div>' : '')
    + '</div></div>';
}

function renderJournal(data, subjectGroups){
  const sgBox = $('subjectGroupsBox');
  const jBox = $('journalBox');
  const select = $('journalClassSelect');
  const summary = $('journalClassSummary');

  const groups = Array.isArray(subjectGroups) ? subjectGroups : [];
  if (groups.length) {
    const map = buildClassSubjectMap(groups);
    state.journalClassMap = map;
    const classes = Object.keys(map).sort(classSort);
    if (select) {
      const previous = select.value;
      select.innerHTML = classes.map(c => '<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join('');
      select.value = classes.includes(previous) ? previous : (classes[0] || '');
    }
    renderSelectedJournalClass();
  } else {
    state.journalClassMap = {};
    if (select) select.innerHTML = '<option value="">Нет данных</option>';
    if (summary) summary.innerHTML = '';
    if (sgBox) sgBox.innerHTML = '<div class="empty">Данные предметных групп пока не получены. Найденный /webapi/subjectgroups возвращает 401 — нужен контекст авторизованной JSON-сессии.</div>';
  }

  if (jBox) {
    if (data?.journal?.found && Array.isArray(data.journal.rows)) {
      jBox.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Ученик</th><th>Предмет</th><th>Оценки</th></tr></thead><tbody>${data.journal.rows.map(r=>`<tr><td>${escapeHtml(r.student||'—')}</td><td>${escapeHtml(r.subject||'—')}</td><td>${escapeHtml(r.marks||'—')}</td></tr>`).join('')}</tbody></table></div>`;
    } else {
      jBox.innerHTML = escapeHtml(data?.parsed?.journal?.message || data?.journal?.message || 'Структурированный журнал не найден. Сейчас доступен просмотр предметов текущего учителя.');
    }
  }
}

function renderSchedule(schedule){
  const box = $('scheduleBox');
  const days = Array.isArray(schedule) ? schedule : [];
  if (!days.length){
    box.innerHTML = `<div class="panel empty"><i class="fa-solid fa-calendar-xmark" style="font-size:2.6rem;display:block;margin-bottom:12px;"></i>Расписание не найдено через проверенные teacher endpoint-ы.</div>`;
    return;
  }
  box.innerHTML = days.map(day => {
    const lessons = Array.isArray(day.lessons) ? day.lessons : [];
    return `<div class="lesson-card"><div class="lesson-head">${escapeHtml(day.date || 'День')}</div><div class="lesson-body">${
      lessons.length ? lessons.map((l,i)=>`<div style="padding:10px 0;border-bottom:1px solid #edf1f8"><b>${escapeHtml(l.number || i+1)}. ${escapeHtml(l.subject || 'Предмет')}</b><br><span>${escapeHtml(l.time || '')}</span></div>`).join('') : 'Уроков нет'
    }</div></div>`;
  }).join('');
}


let allMessages = [];
let dialogsMap = new Map();
let currentPartner = null;
function apiGet(path){ return fetch(API_URL + path, {mode:'cors'}); }
function formatTime(ts){ try{return new Date(String(ts).replace(' ','T') + '+03:00').toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});}catch(e){return '';} }
async function loadMessages(){
  const login = localStorage.getItem('login') || '';
  if (!login) return;
  try{
    const response = await apiGet('/api/messages?login='+encodeURIComponent(login));
    const data = await response.json();
    if(data.success){ allMessages = data.data || []; buildDialogs(); if(currentPartner) renderMessages(currentPartner); }
  }catch(e){ console.error(e); }
}
function buildDialogs(){
  const login = localStorage.getItem('login') || '';
  const box = $('dialogs'); if(!box) return;
  dialogsMap = new Map();
  allMessages.forEach(m => { const p = m.sender === login ? m.recipient : m.sender; if(!dialogsMap.has(p)) dialogsMap.set(p, []); dialogsMap.get(p).push(m); });
  const partners = Array.from(dialogsMap.keys()).sort((a,b)=>String((dialogsMap.get(b).at(-1)||{}).timestamp||'').localeCompare(String((dialogsMap.get(a).at(-1)||{}).timestamp||'')));
  box.innerHTML = partners.map(p => { const last = dialogsMap.get(p).at(-1) || {}; return '<div class="dialog '+(p===currentPartner?'active':'')+'" onclick="selectDialog(\''+escapeHtml(p)+'\')"><div class="dialog-avatar">'+escapeHtml(getInitials(p))+'</div><div><div class="dialog-name">'+escapeHtml(p)+'</div><div class="dialog-preview">'+escapeHtml((last.sender===login?'Вы: ':'') + String(last.text||'').slice(0,40))+'</div></div></div>'; }).join('') || '<div class="empty">Нет сообщений</div>';
}
window.selectDialog = function(partner){ currentPartner = partner; const h=$('chatHeader'), n=$('noDialog'), ia=$('inputArea'); if(h) h.style.display='flex'; if(n) n.style.display='none'; if(ia) ia.style.display='flex'; const u=$('chatUsername'); if(u) u.textContent=partner; const a=$('chatAvatar'); if(a) a.textContent=getInitials(partner); buildDialogs(); renderMessages(partner); markRead(partner); };
function renderMessages(partner){
  const login = localStorage.getItem('login') || '';
  const box = $('messages'); if(!box) return;
  const msgs = dialogsMap.get(partner) || [];
  box.innerHTML = msgs.map(m => { const me = m.sender === login; return '<div class="message-wrapper '+(me?'me':'other')+'"><div class="message '+(me?'me-message':'other-message')+'"><div class="message-text">'+escapeHtml(m.text||'')+'</div><div class="message-footer">'+escapeHtml(formatTime(m.timestamp||''))+'</div></div></div>'; }).join('') || '<div class="empty">Сообщений нет</div>';
  box.scrollTop = box.scrollHeight;
}
async function markRead(partner){ try{ await api('/api/mark_read', {login:localStorage.getItem('login')||'', partner}); }catch(e){} }
window.sendMessage = async function(){
  const input=$('msgInput'); const text=(input?.value||'').trim(); if(!text || !currentPartner) return;
  const d = await api('/api/send', {sender:localStorage.getItem('login')||'', recipient:currentPartner, text});
  if(d.success){ input.value=''; await loadMessages(); renderMessages(currentPartner); }
};
window.openNewMessagePrompt = async function(){
  const recipient = prompt('Логин получателя:'); if(!recipient) return;
  currentPartner = recipient.trim(); selectDialog(currentPartner);
  const input=$('msgInput'); if(input) input.focus();
};
setInterval(()=>{ const active=document.querySelector('.tab.active'); if(active && active.id==='tab-messages') loadMessages(); }, 5000);

function countLessons(schedule){
  return Array.isArray(schedule) ? schedule.reduce((n,d)=>n+(Array.isArray(d.lessons)?d.lessons.length:0),0) : 0;
}
function countStudents(journal){
  if (!journal || !Array.isArray(journal.rows)) return 0;
  return new Set(journal.rows.map(r=>r.student).filter(Boolean)).size;
}
function renderError(msg){
  const box = $('teacherProfileGrid');
  if (box) box.innerHTML = `<div class="teacher-info-card" style="grid-column:1/-1;color:#b71c1c"><div class="teacher-info-label">Ошибка</div><div class="teacher-info-value">${escapeHtml(msg)}</div></div>`;
}
function copyDebug(){
  navigator.clipboard?.writeText(state.debugText || '').then(()=>alert('Дебаг скопирован'));
}

document.querySelectorAll('.sidebar a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.dataset.tab;
    document.querySelectorAll('.sidebar a').forEach(x=>x.classList.toggle('active', x===a));
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.id === 'tab-' + id));
    localStorage.setItem('lkteacher_active_tab', id); if(id==='messages') loadMessages();
  });
});

applyUser();
initDates();
const savedTab = localStorage.getItem('lkteacher_active_tab');
if (savedTab && document.querySelector(`[data-tab="${savedTab}"]`)) document.querySelector(`[data-tab="${savedTab}"]`).click();
refreshTeacherData();
  