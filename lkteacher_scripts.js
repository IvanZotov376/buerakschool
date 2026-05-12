
   (function () {
  fetch('header.html')
    .then(function (res) {
      if (!res.ok) throw new Error('Ошибка загрузки header.html');
      return res.text();
    })
    .then(function (html) {
      document.getElementById('header-placeholder').innerHTML = html;
      applyLkHeaderMode();
      initHeaderAfterLoad();
      // Повторно применяем данные пользователя — шапка могла загрузиться позже основного скрипта
      if (typeof applyUser === 'function') applyUser();
    })
    .catch(function (err) { console.error(err); });


  function applyLkHeaderMode() {
      var placeholder = document.getElementById('header-placeholder');
      if (!placeholder) return;
      var nav = placeholder.querySelector('.nav') || document.querySelector('body > .nav');
      if (nav) nav.remove();
      if (!document.getElementById('lkHeaderHomeStyles')) {
          var style = document.createElement('style');
          style.id = 'lkHeaderHomeStyles';
          style.textContent = '.lk-home-btn{display:inline-flex;align-items:center;justify-content:center;color:white;text-decoration:none;font-size:1.25rem;line-height:1;cursor:pointer;transition:color .2s,transform .2s}.lk-home-btn:hover{color:#ffd966;transform:translateY(-1px)}body.dark-theme .lk-home-btn:hover{color:#4facfe}';
          document.head.appendChild(style);
      }
      var accessibilityBtn = document.getElementById('accessibilityBtn');
      if (accessibilityBtn && !document.getElementById('lkHomeBtn')) {
          var home = document.createElement('a');
          home.id = 'lkHomeBtn';
          home.className = 'lk-home-btn';
          home.href = 'index.html';
          home.title = 'На главную';
          home.setAttribute('aria-label', 'На главную');
          home.innerHTML = '<i class="fa-solid fa-house"></i>';
          accessibilityBtn.insertAdjacentElement('afterend', home);
      }
  }


  function initHeaderAfterLoad() {
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const panel = document.getElementById('accessibilityPanel');
    const closePanelBtn = document.getElementById('closeAccessibilityPanel');
    const noEffectsCheckbox = document.getElementById('noEffectsCheckbox');
    const themeBtns = document.querySelectorAll('[data-group="theme"] .option-btn');
    const fontSizeBtns = document.querySelectorAll('[data-group="fontSize"] .option-btn');
    const imageModeBtns = document.querySelectorAll('[data-group="imageMode"] .option-btn');
    const userBlock = document.getElementById('userBlock');
    const userAvatar = document.getElementById('userAvatar');
    const userNameSpan = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRole');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let settings = {
      theme: localStorage.getItem('a11y_theme') || 'original',
      fontSize: localStorage.getItem('a11y_fontSize') || '1',
      noEffects: localStorage.getItem('a11y_noEffects') === 'true',
      imageMode: localStorage.getItem('a11y_imageMode') || 'original'
    };

    function updatePanelButtons() {
      themeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === settings.theme));
      fontSizeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === settings.fontSize));
      imageModeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === settings.imageMode));
    }

    function saveSettings() {
      localStorage.setItem('a11y_theme', settings.theme);
      localStorage.setItem('a11y_fontSize', settings.fontSize);
      localStorage.setItem('a11y_noEffects', settings.noEffects);
      localStorage.setItem('a11y_imageMode', settings.imageMode);
    }

    function applySettings() {
      document.body.classList.remove('dark-theme', 'blue-theme');
      if (settings.theme === 'dark') document.body.classList.add('dark-theme');
      if (settings.theme === 'blue') document.body.classList.add('blue-theme');
      document.documentElement.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4');
      document.documentElement.classList.add('font-size-' + settings.fontSize);
      document.body.classList.toggle('no-effects', settings.noEffects);
      document.body.classList.remove('images-grayscale', 'images-hide');
      if (settings.imageMode === 'grayscale') document.body.classList.add('images-grayscale');
      if (settings.imageMode === 'hide') document.body.classList.add('images-hide');
      updatePanelButtons();
      if (noEffectsCheckbox) noEffectsCheckbox.checked = settings.noEffects;
    }

    themeBtns.forEach(btn => btn.addEventListener('click', () => { settings.theme = btn.dataset.value; saveSettings(); applySettings(); }));
    fontSizeBtns.forEach(btn => btn.addEventListener('click', () => { settings.fontSize = btn.dataset.value; saveSettings(); applySettings(); }));
    imageModeBtns.forEach(btn => btn.addEventListener('click', () => { settings.imageMode = btn.dataset.value; saveSettings(); applySettings(); }));
    if (noEffectsCheckbox) noEffectsCheckbox.addEventListener('change', () => { settings.noEffects = noEffectsCheckbox.checked; saveSettings(); applySettings(); });

    if (accessibilityBtn && panel) {
      accessibilityBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.classList.toggle('active');
        accessibilityBtn.classList.toggle('active-icon', panel.classList.contains('active'));
      });
    }
    if (closePanelBtn && panel) closePanelBtn.addEventListener('click', function () {
      panel.classList.remove('active');
      if (accessibilityBtn) accessibilityBtn.classList.remove('active-icon');
    });
    document.addEventListener('click', function (e) {
      if (panel && accessibilityBtn && !panel.contains(e.target) && e.target !== accessibilityBtn) {
        panel.classList.remove('active');
        accessibilityBtn.classList.remove('active-icon');
      }
    });

    const isAuth = localStorage.getItem('auth') === 'true';
    const savedLogin = localStorage.getItem('login') || '';
    const savedRole = localStorage.getItem('role') || 'Учитель';
    function rolePage(role) {
      const r = String(role || '').trim().toLowerCase();
      if (r === '\u0443\u0447\u0435\u043d\u0438\u043a' || r === '\u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044c') return 'lk.html';
      if (r === '\u0443\u0447\u0438\u0442\u0435\u043b\u044c' || r === '\u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c') return 'lkteacher.html';
      if (r === '\u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440' || r === '\u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440' || r === '\u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f') return 'lkadmin.html';
      if (r === '\u0433\u043e\u0441\u0442\u044c') return 'index.html';
      return 'login.html';
    }
    const currentRolePage = rolePage(savedRole);
    if (!isAuth || !savedLogin) {
      window.location.replace(currentRolePage === 'index.html' ? 'index.html' : 'login.html');
      return;
    }
    if (currentRolePage !== 'lkteacher.html') {
      window.location.replace(currentRolePage);
      return;
    }
    const savedFullName = localStorage.getItem('full_name') || savedLogin || 'Учитель';
    const savedAvatarColor = localStorage.getItem('avatar_color') || null;
    const savedProfilePhoto = localStorage.getItem('profile_photo') || '';

    function getInitials(name) { return name ? name.charAt(0).toUpperCase() : '?'; }
    function getDefaultAvatarColor(name) {
      let hash = 0;
      for (let i = 0; i < String(name).length; i++) hash = String(name).charCodeAt(i) + ((hash << 5) - hash);
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      ];
      return colors[Math.abs(hash) % colors.length];
    }
    function getProfilePageByRole() {
      const role = String(localStorage.getItem('role') || '').trim().toLowerCase();
      if (['ученик', 'родитель'].includes(role)) return 'lk.html';
      if (['учитель', 'преподаватель'].includes(role)) return 'lkteacher.html';
      if (['директор', 'администратор', 'администрация'].includes(role)) return 'lkadmin.html';
      if (role === 'гость') return 'index.html';
      return 'login.html';
    }
    function updateUserInterface() {
      if (isAuth && savedLogin) {
        if (userBlock) userBlock.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (userAvatar) {
          if (savedProfilePhoto) {
            userAvatar.classList.add('has-photo');
            userAvatar.style.backgroundImage = `url(${savedProfilePhoto})`;
            userAvatar.style.backgroundColor = 'transparent';
            userAvatar.textContent = '';
          } else {
            userAvatar.classList.remove('has-photo');
            userAvatar.style.backgroundImage = '';
            userAvatar.style.background = savedAvatarColor || getDefaultAvatarColor(savedFullName);
            userAvatar.textContent = getInitials(savedFullName);
          }
        }
        if (userNameSpan) userNameSpan.textContent = savedFullName;
        if (userRoleSpan) userRoleSpan.textContent = savedRole || 'Учитель';
      } else {
        if (userBlock) userBlock.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    }
    if (userBlock) userBlock.onclick = () => { if (isAuth && savedLogin && typeof window.openProfileModal === 'function') window.openProfileModal(); };
    if (loginBtn) loginBtn.onclick = (e) => { e.preventDefault(); window.location.href = 'login.html'; };
    if (logoutBtn) logoutBtn.onclick = () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        ['auth','login','password','role','full_name','avatar_color','profile_photo'].forEach(k => localStorage.removeItem(k));
        window.location.href = 'login.html';
      }
    };

    applySettings();
    updateUserInterface();
    if (typeof alignTeacherContentToHeader === 'function') {
      alignTeacherContentToHeader();
      setTimeout(alignTeacherContentToHeader, 50);
    }
  }
})();
  

  


(function(){
  'use strict';
  const avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)'
  ];
  let currentUserRole = localStorage.getItem('role') || 'Учитель';
  let currentUserFullName = localStorage.getItem('full_name') || localStorage.getItem('login') || 'Учитель';
  let currentAvatarColor = localStorage.getItem('avatar_color') || '';
  let currentProfilePhoto = localStorage.getItem('profile_photo') || '';
  let cropper = null;
  let objectUrlForCrop = null;

  function apiRoot(){
    const saved = localStorage.getItem('api_url');
    if (saved) return saved.replace(/\/$/, '');
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      if ((location.port || '') === '5000') return location.origin;
      return `${location.protocol}//${location.hostname || '127.0.0.1'}:5000`;
    }
    return 'http://127.0.0.1:5000';
  }
  function getDefaultAvatarColor(name){ let hash=0; const source=String(name||'user'); for(let i=0;i<source.length;i++) hash=source.charCodeAt(i)+((hash<<5)-hash); return avatarColors[Math.abs(hash)%avatarColors.length]; }
  function getInitials(name){ return String(name||'?').trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase() || '?'; }
  function setAvatarElement(el, name, color, photo){
    if(!el) return;
    if(photo){ el.classList.add('has-photo'); el.style.background='transparent'; el.style.backgroundImage=`url(${photo})`; el.style.backgroundSize='cover'; el.style.backgroundPosition='center'; el.textContent=''; }
    else { el.classList.remove('has-photo'); el.style.backgroundImage=''; el.style.background=color || getDefaultAvatarColor(name); el.textContent=getInitials(name); }
  }
  function refreshHeaderProfile(){
    const displayName = currentUserFullName || localStorage.getItem('login') || 'Учитель';
    const color = currentAvatarColor || getDefaultAvatarColor(displayName);
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    if(userName) userName.textContent = displayName;
    if(userRole) userRole.textContent = currentUserRole;
    setAvatarElement(userAvatar, displayName, color, currentProfilePhoto);
  }
  function updatePreview(){
    const nameInput = document.getElementById('profileFullName');
    const roleInput = document.getElementById('profileRole');
    const displayName = (nameInput && nameInput.value.trim()) || currentUserFullName || localStorage.getItem('login') || 'Учитель';
    const role = (roleInput && roleInput.value) || currentUserRole;
    const color = currentAvatarColor || getDefaultAvatarColor(displayName);
    setAvatarElement(document.getElementById('profileAvatarPreview'), displayName, color, currentProfilePhoto);
    const nameEl = document.getElementById('profilePreviewName');
    const roleEl = document.getElementById('profilePreviewRoleLabel');
    if(nameEl) nameEl.textContent = displayName;
    if(roleEl) roleEl.textContent = role;
    const removeBtn = document.getElementById('removeProfilePhotoBtn');
    if(removeBtn) removeBtn.style.display = currentProfilePhoto ? 'inline-flex' : 'none';
  }
  function initAvatarColorPicker(){
    const container = document.getElementById('avatarColors');
    if(!container) return;
    container.innerHTML = '';
    avatarColors.forEach(color => {
      const option = document.createElement('div');
      option.className = 'avatar-color-option';
      option.style.background = color;
      option.dataset.color = color;
      if(color === currentAvatarColor) option.classList.add('active');
      option.onclick = () => { document.querySelectorAll('.avatar-color-option').forEach(o=>o.classList.remove('active')); option.classList.add('active'); currentAvatarColor = color; updatePreview(); };
      container.appendChild(option);
    });
  }
  function initProfilePhotoControls(){
    const input = document.getElementById('profilePhotoInput');
    const uploadBtn = document.getElementById('uploadProfilePhotoBtn');
    const removeBtn = document.getElementById('removeProfilePhotoBtn');
    if(uploadBtn && input) uploadBtn.onclick = () => input.click();
    if(input) input.onchange = (event) => { const file = event.target.files && event.target.files[0]; if(!file) return; if(!file.type.startsWith('image/')){ alert('Выберите файл изображения'); input.value=''; return; } if(file.size > 8*1024*1024){ alert('Размер фото не должен превышать 8 МБ'); input.value=''; return; } openPhotoCropModal(file); input.value=''; };
    if(removeBtn) removeBtn.onclick = () => { currentProfilePhoto=''; localStorage.removeItem('profile_photo'); refreshHeaderProfile(); updatePreview(); };
  }
  function openPhotoCropModal(file){
    const modal = document.getElementById('photoCropModal');
    const image = document.getElementById('cropperImage');
    if(!modal || !image) return;
    if(cropper){ cropper.destroy(); cropper = null; }
    if(objectUrlForCrop) URL.revokeObjectURL(objectUrlForCrop);
    objectUrlForCrop = URL.createObjectURL(file);
    image.src = objectUrlForCrop;
    modal.style.display = 'block';
    image.onload = () => { cropper = new Cropper(image, { aspectRatio:1, viewMode:1, dragMode:'move', autoCropArea:.9, background:false, responsive:true, preview:'.cropper-preview-sm, .cropper-preview-lg' }); };
  }
  window.closePhotoCropModal = function(){ const modal=document.getElementById('photoCropModal'); if(modal) modal.style.display='none'; if(cropper){ cropper.destroy(); cropper=null; } if(objectUrlForCrop){ URL.revokeObjectURL(objectUrlForCrop); objectUrlForCrop=null; } };
  window.applyCroppedPhoto = function(){ if(!cropper) return; const canvas = cropper.getCroppedCanvas({ width:360, height:360, imageSmoothingEnabled:true, imageSmoothingQuality:'high' }); if(!canvas) return; currentProfilePhoto = canvas.toDataURL('image/jpeg', .88); localStorage.setItem('profile_photo', currentProfilePhoto); refreshHeaderProfile(); updatePreview(); closePhotoCropModal(); };
  window.openProfileModal = function(){
    currentUserRole = localStorage.getItem('role') || 'Учитель';
    currentUserFullName = localStorage.getItem('full_name') || localStorage.getItem('login') || 'Учитель';
    currentAvatarColor = localStorage.getItem('avatar_color') || getDefaultAvatarColor(currentUserFullName);
    currentProfilePhoto = localStorage.getItem('profile_photo') || '';
    const roleEl = document.getElementById('profileRole');
    const nameEl = document.getElementById('profileFullName');
    if(roleEl){ roleEl.value = currentUserRole; roleEl.onchange = updatePreview; }
    if(nameEl){ nameEl.value = currentUserFullName; nameEl.oninput = updatePreview; }
    initAvatarColorPicker(); initProfilePhotoControls(); updatePreview();
    const modal = document.getElementById('profileModal'); if(modal) modal.style.display = 'block';
  };
  window.closeProfileModal = function(){ const modal=document.getElementById('profileModal'); if(modal) modal.style.display='none'; };
  window.saveProfile = async function(){
    const role = document.getElementById('profileRole')?.value || 'Учитель';
    const fullName = document.getElementById('profileFullName')?.value.trim() || localStorage.getItem('login') || 'Учитель';
    const finalColor = currentAvatarColor || getDefaultAvatarColor(fullName);
    currentUserRole = role; currentUserFullName = fullName; currentAvatarColor = finalColor;
    localStorage.setItem('role', role); localStorage.setItem('full_name', fullName); localStorage.setItem('avatar_color', finalColor);
    if(currentProfilePhoto) localStorage.setItem('profile_photo', currentProfilePhoto); else localStorage.removeItem('profile_photo');
    refreshHeaderProfile();
    try {
      const response = await fetch(apiRoot() + '/api/register', { method:'POST', mode:'cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ login:localStorage.getItem('login') || '', password:sessionStorage.getItem('password') || localStorage.getItem('password') || '', role, email:localStorage.getItem('email') || '', school:localStorage.getItem('school') || '', full_name:fullName, avatar_color:finalColor, profile_photo:currentProfilePhoto || '' }) });
      const data = await response.json().catch(()=>({}));
      if(!response.ok || data.success === false) throw new Error(data.error || 'Ошибка сохранения');
      closeProfileModal(); alert('Профиль успешно сохранён!');
    } catch(err) { closeProfileModal(); alert('Профиль сохранён локально. Сервер не ответил: ' + err.message); }
  };
  document.addEventListener('click', function(event){ const profile=document.getElementById('profileModal'); const crop=document.getElementById('photoCropModal'); if(event.target === profile) closeProfileModal(); if(event.target === crop) closePhotoCropModal(); });
  document.addEventListener('DOMContentLoaded', refreshHeaderProfile);
})();
  

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


function teacherLoadingHtml(text){
  return '<div class="panel empty teacher-loading-panel"><i class="fa-solid fa-spinner fa-spin" style="font-size:2.4rem;display:block;margin-bottom:12px;color:#4c6ef5"></i>'+escapeHtml(text || 'Идёт загрузка данных...')+'</div>';
}

function showTeacherSectionLoading(){
  const scheduleBox = $('scheduleBox');
  const staffBox = $('staffBox');
  if (scheduleBox) scheduleBox.innerHTML = teacherLoadingHtml('Загружается расписание из СГО...');
  if (staffBox) staffBox.innerHTML = teacherLoadingHtml('Загружается педагогический состав из СГО...');
}

async function refreshTeacherData(){
  const activeLoader = $('loaderDash');
  if (activeLoader) activeLoader.classList.add('active');
  showTeacherSectionLoading();
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
  renderClassesAndStaff(d.workload || {}, subjectGroups, d);
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
  const cards = (data?.class_journal_dashboard?.cards || []).filter(c => c && c.sgId);
  const rows = cards.length ? cards : getRealSubjectGroups(data).map(g => ({sgId:g.id || g.value || g.subjectGroupId, subject:g.subject || g.subject_name, class_name:g.class_name || g.class, average:g.average}));
  if (!rows.length){
    box.innerHTML = '<div class="empty">Минипанель /webapi/dashboard/extensions/classJournal не вернула предметы для текущего логина.</div>';
    return;
  }
  box.innerHTML = '<div class="teacher-mini-grid">' + rows.map(r => {
    const title = ((r.class_name || '') ? escapeHtml(r.class_name)+' • ' : '') + escapeHtml(r.subject || 'Предмет');
    const avg = (r.average !== undefined && r.average !== null && r.average !== '') ? String(r.average).replace('.', ',') : '—';
    return '<div class="teacher-mini-card"><div><div class="teacher-mini-title">'+title+'</div><div class="teacher-mini-id">ID: '+escapeHtml(r.sgId || '')+'</div></div><div class="teacher-mini-avg">'+escapeHtml(avg)+'</div><button class="btn ghost" onclick="openSubjectCard(\''+escapeHtml(r.sgId || '')+'\',\''+escapeHtml(r.subject || '')+'\',\''+escapeHtml(r.class_name || '')+'\')"><i class="fa-solid fa-book"></i></button></div>';
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
    if (!classMap[g.className]) classMap[g.className] = {class_name:g.className, subjects:new Set(), teachers:new Set(), subjectgroups:0, lessons:0, studentsMap:{}};
    classMap[g.className].subjects.add(g.subject);
    classMap[g.className].subjectgroups += 1;
    (g.students || []).forEach(function(st){
      const key = String(st.id || st.fullName || st.name || '').trim();
      if (key && !classMap[g.className].studentsMap[key]) classMap[g.className].studentsMap[key] = st;
    });
    (g.teachers || []).forEach(function(t){
      classMap[g.className].teachers.add(t);
      if (!staffMap[t]) staffMap[t] = {name:t, subjects:new Set(), classes:new Set(), subjectgroups:0};
      staffMap[t].subjects.add(g.subject);
      staffMap[t].classes.add(g.className);
      staffMap[t].subjectgroups += 1;
    });
  });
  return {
    classes_detail: Object.values(classMap).map(x => ({class_name:x.class_name, subjects:[...x.subjects].sort(), teachers:[...x.teachers].sort(), students:Object.values(x.studentsMap).sort((a,b)=>String(a.fullName || a.name).localeCompare(String(b.fullName || b.name),'ru')), subjectgroups:x.subjectgroups, lessons:x.lessons})).sort((a,b)=>classSort(a.class_name,b.class_name)),
    staff: Object.values(staffMap).map(x => ({name:x.name, subjects:[...x.subjects].sort(), classes:[...x.classes].sort(classSort), subjectgroups:x.subjectgroups})).sort((a,b)=>a.name.localeCompare(b.name,'ru'))
  };
}

function renderClassesAndStaff(workload, subjectGroups, data){
  const classesBox = $('classesBox');
  const staffBox = $('staffBox');
  if (!classesBox && !staffBox) return;
  const fallback = buildFallbackClassesAndStaff(subjectGroups || []);
  const classMergeKey = function(value){
    return String(value || '').toLowerCase().replace(/класс|кл\.?/gi, '').replace(/[^0-9a-zа-яё]/gi, '').trim();
  };
  const fallbackByClass = {};
  (fallback.classes_detail || []).forEach(function(c){
    fallbackByClass[classMergeKey(c.class_name)] = c;
  });
  const classesSource = (Array.isArray(workload.classes_detail) && workload.classes_detail.length) ? workload.classes_detail : fallback.classes_detail;
  const classes = (classesSource || []).map(function(c){
    const fb = fallbackByClass[classMergeKey(c.class_name)] || {};
    return Object.assign({}, c, {
      students: (Array.isArray(c.students) && c.students.length) ? c.students : (fb.students || []),
      teachers: (Array.isArray(c.teachers) && c.teachers.length) ? c.teachers : (fb.teachers || []),
      subjects: (Array.isArray(c.subjects) && c.subjects.length) ? c.subjects : (fb.subjects || [])
    });
  });
  const allStaff = Array.isArray(data?.staff_catalog) && data.staff_catalog.length
    ? data.staff_catalog
    : (Array.isArray(data?.staff_teachers_catalog) && data.staff_teachers_catalog.length
      ? data.staff_teachers_catalog
      : (Array.isArray(data?.all_subjectgroup_details?.staff) ? data.all_subjectgroup_details.staff : []));
  const staff = allStaff.length ? allStaff : ((Array.isArray(workload.staff) && workload.staff.length) ? workload.staff : fallback.staff);

  if (classesBox) {
    if (!classes.length) {
      classesBox.innerHTML = '<div class="empty">Список классов не найден. Нужен успешный ответ /webapi/subjectgroups.</div>';
    } else {
      classesBox.innerHTML = '<div class="real-data-grid">' + classes.map(function(c){
        const subjects = (c.subjects || []).slice(0, 8).map(s => '<span class="mini-chip">'+escapeHtml(s)+'</span>').join('');
        const teachers = (c.teachers || []).slice(0, 5).map(t => '<span class="mini-chip"><i class="fa-solid fa-user-tie"></i> '+escapeHtml(t)+'</span>').join('');
        const students = (Array.isArray(c.students) ? c.students : []).map(function(st, idx){
          return '<div class="teacher-item"><i class="fa-solid fa-user-graduate"></i><span>'+escapeHtml((idx+1)+'. '+(st.fullName || st.name || st.id || 'Ученик'))+'</span></div>';
        }).join('');
        const studentsBlock = students
          ? '<div class="teacher-list" style="margin-top:12px"><div class="teacher-list-title"><b>Учащиеся класса:</b></div>'+students+'</div>'
          : '<div class="section-note">Список учащихся пока не получен. Нужен ответ /webapi/grade/studentList?sgId=...</div>';
        return '<div class="real-card">'
          + '<div class="real-card-head"><div class="real-card-title">'+escapeHtml(c.class_name || 'Класс')+'</div><div class="real-card-badge">'+escapeHtml((Array.isArray(c.students) && c.students.length) ? c.students.length + ' учеников' : (c.subjects || []).length + ' предметов')+'</div></div>'
          + '<div class="staff-meta">Субъект-групп: <b>'+escapeHtml(c.subjectgroups || 0)+'</b>'+(c.lessons ? ' · уроков за период: <b>'+escapeHtml(c.lessons)+'</b>' : '')+'</div>'
          + '<div class="mini-list">'+(subjects || '<span class="section-note">Предметы не указаны</span>')+'</div>'
          + (teachers ? '<div class="mini-list" style="margin-top:12px">'+teachers+'</div>' : '<div class="section-note">Преподаватели по классу не указаны в JSON.</div>')
          + studentsBlock
          + '</div>';
      }).join('') + '</div><div class="section-note">Карточки построены из реальных субъект-групп СГО и /webapi/grade/studentList?sgId=...: класс → предметы → преподаватели → учащиеся.</div>';
    }
  }

  if (staffBox) {
    if (!staff.length) {
      staffBox.innerHTML = '<div class="empty">Педагогический состав пока не найден. Проверьте ответ /webapi/rooms и /webapi/subjectgroups в терминале.</div>';
    } else {
      staffBox.innerHTML = '<div class="real-data-grid">' + staff.map(function(t){
        const subjects = (t.subjects || []).slice(0, 7).map(s => '<span class="mini-chip">'+escapeHtml(s)+'</span>').join('');
        const classes = (t.classes || []).slice(0, 10).map(c => '<span class="mini-chip">'+escapeHtml(c)+'</span>').join('');
        const rooms = (t.rooms || []).map(r => '<span class="mini-chip">'+escapeHtml(r)+'</span>').join('');
        return '<div class="real-card staff-card">'
          + '<div class="staff-avatar">'+escapeHtml(initialsFromName(t.name))+'</div>'
          + '<div><div class="staff-name">'+escapeHtml(t.name || 'Преподаватель')+'</div>'
          + '<div class="staff-meta">Предметы:</div><div class="mini-list">'+(subjects || '<span class="section-note">Предметы не указаны</span>')+'</div>'
          + '<div class="staff-meta" style="margin-top:10px">Классы:</div><div class="mini-list">'+(classes || '<span class="section-note">Классы не указаны</span>')+'</div>'
          + (rooms ? '<div class="staff-meta" style="margin-top:10px">Кабинеты:</div><div class="mini-list">'+rooms+'</div>' : '')
          + '</div></div>';
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

function subjectGroupIdValue(group){
  return normalizeTextValue(group?.id || group?.sgId || group?.subjectGroupId || group?.subject_group_id);
}

function enrichSubjectGroupWithApiDetails(group, apiDetails){
  const sgid = subjectGroupIdValue(group);
  const detail = sgid ? (apiDetails || {})[sgid] : null;
  if (!detail) return group;
  const norm = detail.normalized || {};
  return Object.assign({}, group, {
    id: sgid || group.id,
    sgId: sgid || group.sgId,
    subjectGroupId: sgid || group.subjectGroupId,
    subject: normalizeTextValue(group.subject || group.subjectName || group.name || norm.subject || detail.subject),
    name: normalizeTextValue(group.name || group.subject || norm.subject || detail.subject),
    className: normalizeTextValue(group.className || group.class_name || group.class || norm.class_name || detail.class_name),
    class_name: normalizeTextValue(group.class_name || group.className || group.class || norm.class_name || detail.class_name),
    class: normalizeTextValue(group.class || group.className || group.class_name || norm.class_name || detail.class_name),
    teachers: group.teachers || group.teacher_names || norm.teachers || norm.teacher_names || [],
    teacher_ids: group.teacher_ids || norm.teacher_ids || [],
    room: group.room || norm.room || '',
    students: Array.isArray(group.students) && group.students.length ? group.students : (detail.students || []),
    students_count: Number(group.students_count || detail.students_count || 0),
    schedule_count: Number(group.schedule_count || detail.schedule_count || 0)
  });
}

function getRealSubjectGroups(data){
  const apiDetails = data?.subjectgroup_api_details || {};
  const direct = Array.isArray(data?.subjectgroups) ? data.subjectgroups : [];
  if (direct.length) return direct.map(function(group){ return enrichSubjectGroupWithApiDetails(group, apiDetails); });

  const detailsRows = data?.subjectgroup_details?.rows;
  if (Array.isArray(detailsRows) && detailsRows.length) {
    return detailsRows.map(function(group){ return enrichSubjectGroupWithApiDetails(group, apiDetails); });
  }

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
  const studentsRaw = Array.isArray(group?.students) ? group.students : [];
  const students = [];
  studentsRaw.forEach(function(st){
    if (!st || typeof st !== 'object') return;
    const id = normalizeTextValue(st.id || st.studentId || st.StudentId || st.personId || st.pupilId || st.userId);
    const parts = [st.lastName || st.surname || st.familyName, st.firstName || st.givenName, st.middleName || st.patronymic]
      .map(normalizeTextValue).filter(Boolean);
    const name = normalizeTextValue(st.fullName || st.fio || st.studentName || st.displayName || st.name || parts.join(' '));
    if ((id || name) && !students.some(x => String(x.id) === String(id) && String(x.fullName) === String(name))) {
      students.push({ id:id, studentId:id, name:name || id, fullName:name || id });
    }
  });
  students.sort((a,b)=>String(a.fullName || a.name).localeCompare(String(b.fullName || b.name), 'ru'));
  return {
    id: normalizeTextValue(group?.id || group?.sgId || group?.subjectGroupId),
    subject: subject,
    className: cls,
    grade: normalizeTextValue(group?.grade),
    teachers: teacherNamesFromGroup(group),
    students: students,
    students_count: Number(group?.students_count || students.length || 0)
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

  const groupCount = subjects.reduce((n,s)=>n+(s.ids ? s.ids.length : 0),0);
  if (summary) {
    summary.innerHTML = '<div class="journal-stat"><span>Класс</span><b>'+escapeHtml(className)+'</b></div>'
      + '<div class="journal-stat"><span>Предметов</span><b>'+escapeHtml(subjects.length)+'</b></div>';
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
  if (n <= 2.59) return 'bad';
  if (n <= 3.59) return 'warn';
  if (n <= 4.59) return 'blue';
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
  averages.forEach(a => {
    [a.studentId, a.id, a.personId, a.pupilId, a.userId].forEach(key => {
      const text = String(key || '').trim();
      if (text) avgMap[text] = a.average;
    });
    const nameKey = String(a.fullName || a.name || '').trim().toLowerCase();
    if (nameKey) avgMap['name:' + nameKey] = a.average;
  });
  function averageForStudent(st) {
    const keys = [st.id, st.studentId, st.personId, st.pupilId, st.userId];
    if (Array.isArray(st.idAliases)) keys.push(...st.idAliases);
    for (const key of keys) {
      const text = String(key || '').trim();
      if (text && Object.prototype.hasOwnProperty.call(avgMap, text)) return avgMap[text];
    }
    const nameKey = String(st.fullName || st.name || '').trim().toLowerCase();
    if (nameKey && Object.prototype.hasOwnProperty.call(avgMap, 'name:' + nameKey)) return avgMap['name:' + nameKey];
    return undefined;
  }
  const scheduleRows = schedule.map((l,i)=>{
    const time = l.time ? ((l.time.start || '') + (l.time.end ? '–' + l.time.end : '')) : '';
    const room = l.room && (l.room.name || l.room.title) ? (l.room.name || l.room.title) : '';
    const theme = l.lesson && (l.lesson.name || l.lesson.title) ? (l.lesson.name || l.lesson.title) : '—';
    return '<tr><td>'+escapeHtml(i+1)+'</td><td>'+escapeHtml(formatRuDate(l.day))+'</td><td>'+escapeHtml(time || '—')+'</td><td>'+escapeHtml(l.number || '—')+'</td><td>'+escapeHtml(room || info.room || '—')+'</td><td>'+escapeHtml(theme)+'</td></tr>';
  }).join('') || '<tr><td colspan="6" class="empty">Расписание по этой предметной группе не найдено за выбранный период.</td></tr>';
  const studentRows = students.map((st,i)=>{
    const avg = averageForStudent(st);
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
let messageUserCache = new Map();
function chatRoleClass(role){ return 'role-' + String(role || 'Пользователь').replace(/\s+/g, '-'); }
function roleBadgeHtml(role){ const r = role || 'Пользователь'; return '<span class="role-badge '+chatRoleClass(r)+'">'+escapeHtml(r)+'</span>'; }
function messageDefaultColor(name){ return getDefaultAvatarColor(name || 'Пользователь'); }
function mergeMessageUsers(users){
  if(!Array.isArray(users)) return;
  users.forEach(u => {
    if(!u || !u.login) return;
    const login = String(u.login).trim();
    const existing = messageUserCache.get(login) || {login, full_name:login, role:'Пользователь', avatar_color:messageDefaultColor(login), profile_photo:''};
    messageUserCache.set(login, Object.assign(existing, u, {login}));
  });
}
async function getMessageUser(login){
  login = String(login || '').trim();
  if(!login) return {login:'', full_name:'', role:'Пользователь', avatar_color:messageDefaultColor(''), profile_photo:''};
  if(messageUserCache.has(login)) return messageUserCache.get(login);
  let user = {login, full_name:login, role:'Пользователь', avatar_color:messageDefaultColor(login), profile_photo:''};
  try{
    const res = await apiGet('/api/user_info?login=' + encodeURIComponent(login));
    const data = await res.json();
    if(data.success && data.user) user = Object.assign(user, data.user, {login});
  }catch(e){ console.warn('Не удалось получить профиль пользователя', login, e); }
  messageUserCache.set(login, user);
  return user;
}
async function preloadMessageUsers(){
  const users = new Set([localStorage.getItem('login') || '']);
  allMessages.forEach(m => { if(m.sender) users.add(m.sender); if(m.recipient) users.add(m.recipient); });
  await Promise.all(Array.from(users).filter(Boolean).map(getMessageUser));
}
function displayNameFor(login){ const u = messageUserCache.get(login); return (u && (u.full_name || u.login)) || login; }
function roleFor(login){ const u = messageUserCache.get(login); return (u && u.role) || 'Пользователь'; }
function photoFor(login){ const u = messageUserCache.get(login); return (u && u.profile_photo) || ''; }
function colorFor(login){ const u = messageUserCache.get(login); return (u && u.avatar_color) || messageDefaultColor(login); }
function avatarHtml(login, cls){
  const name = displayNameFor(login);
  const photo = photoFor(login);
  const safeCls = cls || 'message-avatar';
  if(photo) return '<div class="'+safeCls+' has-photo" style="background-image:url(&quot;'+escapeHtml(photo)+'&quot;)"></div>';
  return '<div class="'+safeCls+'" style="background:'+escapeHtml(colorFor(login))+'">'+escapeHtml(getInitials(name || login))+'</div>';
}
function applyAvatarTo(el, login){
  if(!el) return;
  const name = displayNameFor(login);
  const photo = photoFor(login);
  el.classList.remove('has-photo');
  el.style.backgroundImage = '';
  if(photo){ el.classList.add('has-photo'); el.style.backgroundImage = 'url("'+photo.replace(/"/g, '&quot;')+'")'; el.textContent=''; }
  else { el.style.background = colorFor(login); el.textContent = getInitials(name || login); }
}
function ownSenderProfile(){
  return {
    login: localStorage.getItem('login') || '',
    full_name: localStorage.getItem('full_name') || localStorage.getItem('login') || '',
    role: localStorage.getItem('role') || 'Учитель',
    avatar_color: localStorage.getItem('avatar_color') || '',
    profile_photo: localStorage.getItem('profile_photo') || ''
  };
}
function apiGet(path){ return fetch(API_URL + path, {mode:'cors'}); }
function formatTime(ts){ try{return new Date(String(ts).replace(' ','T') + '+03:00').toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});}catch(e){return '';} }
async function loadMessages(){
  const login = localStorage.getItem('login') || '';
  if (!login) return;
  try{
    const response = await apiGet('/api/messages?login='+encodeURIComponent(login));
    const data = await response.json();
    if(data.success){ allMessages = data.data || []; window.messageLoginAliases = Array.isArray(data.login_aliases) ? data.login_aliases : [login]; mergeMessageUsers(data.users); await preloadMessageUsers(); buildDialogs(); if(currentPartner) { renderMessages(currentPartner); applyAvatarTo($('chatAvatar'), currentPartner); const u=$('chatUsername'); if(u) u.textContent=displayNameFor(currentPartner); } }
  }catch(e){ console.error(e); }
}
function buildDialogs(){
  const login = localStorage.getItem('login') || '';
  const box = $('dialogs'); if(!box) return;
  dialogsMap = new Map();
  allMessages.forEach(m => { const p = m.sender === login ? m.recipient : m.sender; if(!dialogsMap.has(p)) dialogsMap.set(p, []); dialogsMap.get(p).push(m); });
  const partners = Array.from(dialogsMap.keys()).sort((a,b)=>String((dialogsMap.get(b).at(-1)||{}).timestamp||'').localeCompare(String((dialogsMap.get(a).at(-1)||{}).timestamp||'')));
  box.innerHTML = partners.map(p => { const last = dialogsMap.get(p).at(-1) || {}; const display = displayNameFor(p); return '<div class="dialog '+(p===currentPartner?'active':'')+'" onclick="selectDialog(\''+escapeHtml(p)+'\')">'+avatarHtml(p,'dialog-avatar')+'<div class="dialog-info"><div class="dialog-name">'+escapeHtml(display)+'</div><div class="dialog-preview">'+escapeHtml((last.sender===login?'Вы: ':'') + String(last.text||'').slice(0,40))+'</div></div></div>'; }).join('') || '<div class="empty">Нет сообщений</div>';
}
window.selectDialog = function(partner){ currentPartner = partner; window.currentChatPartner = partner; window.setupMessageTools && window.setupMessageTools(); window.showClearDialogButton && window.showClearDialogButton(true); const h=$('chatHeader'), n=$('noDialog'), ia=$('inputArea'); if(h) h.style.display='flex'; if(n) n.style.display='none'; if(ia) ia.style.display='flex'; const u=$('chatUsername'); if(u) u.textContent=displayNameFor(partner); applyAvatarTo($('chatAvatar'), partner); buildDialogs(); renderMessages(partner); markRead(partner); };
function renderMessages(partner){
  const login = localStorage.getItem('login') || '';
  const box = $('messages'); if(!box) return;
  const msgs = dialogsMap.get(partner) || [];
  box.innerHTML = ''; if(!msgs.length){ box.innerHTML='<div class="empty">Сообщений нет</div>'; } else { msgs.forEach(m => { const me = m.sender === login; const author = m.sender || ''; const wrap=document.createElement('div'); wrap.className='message-wrapper '+(me?'me':'other'); const stack='<div class="message-stack"><div class="message-sender"><span>'+escapeHtml(displayNameFor(author))+'</span>'+roleBadgeHtml(roleFor(author))+'</div><div class="message '+(me?'me-message':'other-message')+'"><div class="message-text">'+escapeHtml(m.text||'')+'</div><div class="message-footer">'+escapeHtml(formatTime(m.timestamp||''))+'</div></div></div>'; wrap.innerHTML=(me ? stack + avatarHtml(author,'message-avatar') : avatarHtml(author,'message-avatar') + stack); const att=window.renderMessageAttachments?window.renderMessageAttachments(m):null; const bubble=wrap.querySelector('.message'); const footer=wrap.querySelector('.message-footer'); if(att&&bubble) bubble.insertBefore(att, footer||null); box.appendChild(wrap); }); }
  box.scrollTop = box.scrollHeight;
}
async function markRead(partner){ try{ await api('/api/mark_read', {login:localStorage.getItem('login')||'', partner}); }catch(e){} }
window.sendMessage = async function(){
  const input=$('msgInput'); const text=(input?.value||'').trim(); const attachments = window.collectMessageAttachments ? await window.collectMessageAttachments() : []; if((!text && !attachments.length) || !currentPartner) return;
  const d = await api('/api/send', {sender:localStorage.getItem('login')||'', recipient:currentPartner, text, attachments, sender_profile: ownSenderProfile()});
  if(d.success){ input.value=''; window.clearMessageAttachments && window.clearMessageAttachments(); await loadMessages(); renderMessages(currentPartner); }
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
  


(function(){
  const allowedExt = ['pdf','prd','doc','docx','xls','xlsx','jpg','jpeg','png','gif','webp','bmp','svg'];
  window.__messageAttachFiles = window.__messageAttachFiles || [];
  window.messageAttachmentsForPreview = function(){ return window.__messageAttachFiles || []; };
  function escapeHtml(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtSize(n){ n=Number(n||0); if(!n) return ''; if(n<1024) return n+' Б'; if(n<1048576) return Math.round(n/1024)+' КБ'; return (n/1048576).toFixed(1)+' МБ'; }
  function iconFor(name,type){ const ext=String(name||'').split('.').pop().toLowerCase(); if(String(type||'').startsWith('image/')) return 'fa-file-image'; if(ext==='pdf'||ext==='prd') return 'fa-file-pdf'; if(ext==='doc'||ext==='docx') return 'fa-file-word'; if(ext==='xls'||ext==='xlsx') return 'fa-file-excel'; return 'fa-file'; }
  function updateAttachPreview(){
    const box=document.getElementById('messageAttachPreview'); if(!box) return;
    const files=window.__messageAttachFiles||[];
    box.classList.toggle('active', files.length>0);
    box.innerHTML = files.map((f,i)=>'<span class="message-file-pill"><i class="fa-solid '+iconFor(f.name,f.type)+'"></i><span>'+escapeHtml(f.name)+'</span><button type="button" title="Убрать" onclick="window.removeMessageAttach('+i+')">×</button></span>').join('');
  }
  window.removeMessageAttach=function(i){ window.__messageAttachFiles.splice(i,1); updateAttachPreview(); };
  window.clearMessageAttachments=function(){ window.__messageAttachFiles=[]; const input=document.getElementById('messageFileInput'); if(input) input.value=''; updateAttachPreview(); };
  window.collectMessageAttachments=function(){
    const files=(window.__messageAttachFiles||[]).slice(0,3);
    return Promise.all(files.map(file => new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve({name:file.name,type:file.type||'application/octet-stream',size:file.size||0,data:reader.result}); reader.onerror=reject; reader.readAsDataURL(file); })));
  };
  window.renderMessageAttachments=function(msg){
    let attachments = msg && msg.attachments;
    if(!Array.isArray(attachments)) { try { attachments = JSON.parse((msg && msg.attachments_json) || '[]'); } catch(e){ attachments=[]; } }
    if(!Array.isArray(attachments) || !attachments.length) return null;
    const wrap=document.createElement('div'); wrap.className='message-attachments';
    attachments.forEach((att,idx)=>{
      const name=att && (att.name || att.filename) || 'Файл'; const type=att && att.type || '';
      const msgId = msg.id || msg.message_id || msg.mid;
      const openUrl = msgId ? `/api/message_attachment/${msgId}/${idx}` : (att.data || '#');
      const downUrl = msgId ? `/api/message_attachment/${msgId}/${idx}?download=1` : (att.data || '#');
      const card=document.createElement('div'); card.className='message-attachment-card';
      card.innerHTML='<div class="message-attachment-icon"><i class="fa-solid '+iconFor(name,type)+'"></i></div><div class="message-attachment-info"><div class="message-attachment-name">'+escapeHtml(name)+'</div><div class="message-attachment-size">'+escapeHtml(fmtSize(att.size))+'</div></div><div class="message-attachment-actions"><a href="'+openUrl+'" target="_blank" rel="noopener">Открыть</a><a href="'+downUrl+'" download>Скачать</a></div>';
      wrap.appendChild(card);
    });
    return wrap;
  };
  window.setupMessageTools=function(){
    const input=document.getElementById('msgInput'); const area=document.getElementById('inputArea');
    if(input && area && !document.getElementById('messageFileInput')){
      const file=document.createElement('input'); file.type='file'; file.id='messageFileInput'; file.multiple=true; file.accept='.pdf,.prd,.doc,.docx,.xls,.xlsx,image/*'; file.style.display='none';
      const btn=document.createElement('button'); btn.type='button'; btn.className='message-attach-btn'; btn.title='Прикрепить файлы'; btn.innerHTML='<i class="fa-solid fa-paperclip"></i>'; btn.onclick=()=>file.click();
      area.insertBefore(btn,input); area.appendChild(file);
      file.onchange=function(){ const chosen=Array.from(file.files||[]); const valid=[]; for(const f of chosen){ const ext=String(f.name||'').split('.').pop().toLowerCase(); if(!allowedExt.includes(ext) && !String(f.type||'').startsWith('image/')){ alert('Формат файла не разрешён: '+f.name); continue; } valid.push(f); } if(valid.length>3){ alert('К сообщению можно прикрепить не более 3 файлов.'); } window.__messageAttachFiles=valid.slice(0,3); updateAttachPreview(); };
      const preview=document.createElement('div'); preview.id='messageAttachPreview'; preview.className='message-attach-preview'; area.parentNode.insertBefore(preview, area);
    }
    const header=document.getElementById('chatHeader');
    if(header && !document.getElementById('clearDialogBtn')){
      const clear=document.createElement('button'); clear.type='button'; clear.id='clearDialogBtn'; clear.className='message-clear-btn'; clear.title='Очистить историю диалога'; clear.style.display='none'; clear.innerHTML='<i class="fa-solid fa-trash"></i>';
      clear.onclick=async function(){ const partner=window.currentChatPartner; const login=localStorage.getItem('login')||''; if(!partner) return; if(!confirm('Вы уверены, что хотите очистить историю этого диалога?')) return; try{ const res=await fetch('/api/clear_messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:login,partner:partner,login_aliases:window.messageLoginAliases||undefined})}); const data=await res.json(); if(!data.success) throw new Error(data.error||'Ошибка очистки'); window.clearMessageAttachments(); if(typeof loadMessages==='function') await loadMessages(); const box=document.getElementById('messages'); if(box) box.innerHTML='<div class="no-dialog"><div>История диалога очищена</div></div>'; }catch(e){ alert('Не удалось очистить переписку: '+e.message); } };
      header.appendChild(clear);
    }
  };
  window.showClearDialogButton=function(show){ const b=document.getElementById('clearDialogBtn'); if(b) b.style.display=show?'inline-flex':'none'; };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(window.setupMessageTools,50));
  setTimeout(window.setupMessageTools,300);
})();
