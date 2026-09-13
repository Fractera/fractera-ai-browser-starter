#!/bin/bash
# УСТАНОВКА СЛУЖБЫ ИИ-БРАУЗЕРА (шаг 196-2). Идемпотентна: повторный запуск доставляет недостающее.
#
# 🔒 Окружение Python и кэш браузера живут ВНУТРИ дерева службы (`engine/venv`, `engine/cache`): служба и её движок
# находят их по пути, а снос службы уносит всё целиком, без хвостов в домашней папке.
# 🔒 Версии закреплены: `camoufox==0.5.6` тянет Python-`playwright` 1.62.x, и Node-клиент `playwright-core` обязан быть
# той же версии — иначе соединение отказывает (замер 196-1).
# 🔒 Зависимости Node — `pnpm`, ПОЛНЫЙ состав: служба — приложение Next, и `next build` нужны зависимости разработки.
# 🛑 Системные пакеты (шрифты, библиотеки X, xvfb) здесь не ставятся: это решение установщика машины, а не службы.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UV="${UV:-/root/.local/bin/uv}"
cd "$ROOT"

command -v xvfb-run >/dev/null || { echo "INSTALL_FAIL: xvfb-run не найден — системные пакеты не поставлены"; exit 1; }
command -v pnpm >/dev/null || { echo "INSTALL_FAIL: pnpm не найден"; exit 1; }

[ -x engine/venv/bin/python ] || "$UV" venv --python 3.12 engine/venv
"$UV" pip install --python engine/venv/bin/python "camoufox==0.5.6"
XDG_CACHE_HOME="$ROOT/engine/cache" engine/venv/bin/python -m camoufox fetch > /tmp/ai-browser-fetch.log 2>&1 || { tail -5 /tmp/ai-browser-fetch.log; exit 1; }

PWV="$(engine/venv/bin/python -c "import importlib.metadata as m; print(m.version('playwright'))")"
NODE_PWV="$(node -p "require('./package.json').dependencies['playwright-core']")"
[ "$PWV" = "$NODE_PWV" ] || { echo "INSTALL_FAIL: python playwright $PWV != playwright-core $NODE_PWV"; exit 1; }

pnpm install --frozen-lockfile
echo "INSTALL_OK playwright=$PWV cache=$(du -sh engine/cache | cut -f1)"
