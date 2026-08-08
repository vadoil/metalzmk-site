#!/usr/bin/env bash
# Выкладка metalzmk.ru
#
# Главное здесь — версии в адресах css и js по хешу содержимого.
# Без них браузер держит стили неделю (так настроен nginx), а разметка
# приходит свежая — и посетитель видит новый html со старым css.
# Меняется файл → меняется хеш → меняется адрес → браузер берёт новое.

set -euo pipefail

SRC=/root/xnia/site
DST=/var/www/metalzmk.ru

CSS_V=$(md5sum "$SRC/assets/css/styles.css" | cut -c1-8)
JS_V=$(md5sum "$SRC/assets/js/main.js" | cut -c1-8)

for f in "$SRC"/*.html; do
  sed -i -E "s|(assets/css/styles\.css)(\?v=[a-f0-9]+)?|\1?v=$CSS_V|g" "$f"
  sed -i -E "s|(assets/js/main\.js)(\?v=[a-f0-9]+)?|\1?v=$JS_V|g" "$f"
done

rsync -a --delete "$SRC"/ "$DST"/
chown -R www-data:www-data "$DST"
find "$DST" -type d -exec chmod 755 {} \;
find "$DST" -type f -exec chmod 644 {} \;

echo "выложено · css=$CSS_V · js=$JS_V"
curl -s -o /dev/null -m 20 -w "https://metalzmk.ru — %{http_code}\n" https://metalzmk.ru/
