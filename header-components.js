class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <header class="header">
          <div class="container header-content">
  
            <div class="logo">
              <img src="logo.png" alt="Логотип">
            </div>
  
            <div class="title">
              <h1>МКОУ Буерак-Поповская СКШ</h1>
              <p>
                Муниципальное казенное общеобразовательное учреждение<br>
                Буерак-Поповская средняя казачья школа
              </p>
            </div>
  
            <div class="header-icons">
              <i class="fa-solid fa-eye" id="accessibilityBtn"></i>
  
              <div class="user-block" id="userBlock">
                <div class="user-name" id="userName"></div>
                <div class="user-role" id="userRole"></div>
              </div>
  
              <i class="fa-solid fa-user" id="loginBtn"></i>
              <i class="fa-solid fa-right-from-bracket" id="logoutBtn" style="display:none;"></i>
              <i class="fa-solid fa-magnifying-glass"></i>
  
              <div class="accessibility-panel" id="accessibilityPanel">
                <button class="close-panel" id="closeAccessibilityPanel">&times;</button>
                <h4><i class="fa-solid fa-universal-access"></i> Специальные возможности</h4>
  
                <div class="option-group">
                  <label>Цветовая тема</label>
                  <div class="option-buttons" data-group="theme">
                    <button class="option-btn active" data-value="original">Оригинальная</button>
                    <button class="option-btn" data-value="dark">Тёмная</button>
                    <button class="option-btn" data-value="blue">Синяя</button>
                  </div>
                </div>
  
                <div class="option-group">
                  <label>Размер шрифта</label>
                  <div class="option-buttons" data-group="fontSize">
                    <button class="option-btn active" data-value="1">1x</button>
                    <button class="option-btn" data-value="2">2x</button>
                    <button class="option-btn" data-value="3">3x</button>
                    <button class="option-btn" data-value="4">4x</button>
                  </div>
                </div>
  
                <div class="option-group">
                  <label>Эффекты</label>
                  <div class="checkbox-group">
                    <input type="checkbox" id="noEffectsCheckbox">
                    <label>Отключить анимацию</label>
                  </div>
                </div>
  
                <div class="option-group">
                  <label>Изображения</label>
                  <div class="option-buttons" data-group="imageMode">
                    <button class="option-btn active" data-value="original">Оригинал</button>
                    <button class="option-btn" data-value="grayscale">Ч/Б</button>
                    <button class="option-btn" data-value="hide">Скрыть</button>
                  </div>
                </div>
              </div>
            </div>
  
          </div>
        </header>
  
        <style id="site-header-submenu-style">
          .dropdown li { position: relative; }
          .dropdown-submenu > a::after { content: "›"; float: right; margin-left: 12px; }
          .submenu { position:absolute; top:0; left:100%; background:white; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,.2); min-width:280px; opacity:0; transform:translateX(-10px); pointer-events:none; transition:.25s; z-index:20; list-style:none; padding:0; }
          .dropdown-submenu:hover > .submenu { opacity:1; transform:translateX(0); pointer-events:auto; }
          body.dark-theme .submenu { background:#2a2a2a; }
          body.dark-theme .submenu a { color:#e0e0e0; }
          body.dark-theme .submenu a:hover { background:#4facfe; color:#121212; }
          body.blue-theme .submenu { background:#bbdefb; }
          body.blue-theme .submenu a { color:#0d47a1; }
          body.blue-theme .submenu a:hover { background:#1565c0; color:white; }
        </style>
        <nav class="nav">
          <div class="container">
            <ul class="menu">
              <li><a href="index.html">Главная</a></li>
              <li><a href="total.html">Сведения</a></li>
              <li>
                <a href="information.html">Информация</a>
                <ul class="dropdown">
                  <li><a href="information.html">Общая информация</a></li>
                  <li><a href="rods.html">Для Вас, родители!</a></li>
                  <li><a href="gia2026.html">ГИА 2026</a></li>
                  <li><a href="amtiterror.html">Защита АНТИТЕРРОР</a></li>
                  <li><a href="telephonts.html">Горячая линия и телефон доверия</a></li>
                  <li class="dropdown-submenu">
                    <a href="schoollife.html">Школьная жизнь</a>
                    <ul class="submenu">
                      <li><a href="shsc.html">Школьный Спортивный Клуб (ШСК)</a></li>
                      <li><a href="theatre.html">Школьный Театр</a></li>
                      <li><a href="uid.html">Юные Инспекторы Движения (ЮИД)</a></li>
                    </ul>
                  </li>
                  <li><a href="food.html">Столовая</a></li>
                  <li><a href="tochkarosta.html">Центр &quot;Точка Роста&quot;</a></li>
                </ul>
              </li>
              <li>
                <a href="#">Сервисы</a>
                <ul class="dropdown">
                  <li><a href="news.html">Новости</a></li>
                  <li><a href="gallery.html">Галерея</a></li>
                  <li><a href="warnings.html">Объявления</a></li>
                  <li><a href="rasp.html">Расписание</a></li>
                </ul>
              </li>
              <li><a href="contacts.html">Контакты</a></li>
            </ul>
          </div>
        </nav>
      `;
  
      this.initHeader();
    }
  
    initHeader() {
      const btn = this.querySelector('#accessibilityBtn');
      const panel = this.querySelector('#accessibilityPanel');
  
      btn.onclick = () => {
        panel.classList.toggle('active');
      };
    }
  }
  
  customElements.define('site-header', SiteHeader);
