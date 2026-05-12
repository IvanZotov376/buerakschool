1. Загрузите requirements.txt, runtime.txt, Procfile и api-config.js в корень репозитория.
2. В Render задайте Environment Variable: PYTHON_VERSION=3.9.18.
3. В Render выполните Manual Deploy -> Clear build cache & deploy.
4. В HTML-страницы, где есть запросы к /api/, добавьте в <head> ДО других скриптов:
   <script src="api-config.js"></script>
   Минимально: login.html, lk.html, lkteacher.html, lkadmin.html.
5. После деплоя откройте F12 -> Network и проверьте, что запросы идут на https://buerakschool.onrender.com/api/..., а не на GitHub Pages и не на :5000.
