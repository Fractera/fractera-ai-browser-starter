#!/bin/bash
# УСТАНОВКА СЛУЖБЫ ИИ-БРАУЗЕРА (шаг 196-2). Идемпотентна: повторный запуск доставляет недостающее.
#
# 🔒 Окружение Python и кэш браузера живут РЯДОМ со службой — `/opt/fractera/ai-browser-engine` (переопределяется
# `AI_BROWSER_ENGINE_DIR`). 🪦 Прежде они лежали внутри дерева (`engine/venv`): трассировщик Turbopack обходил их и падал на
# ссылке `venv/bin/python3 → /usr/bin` («points out of the filesystem root») — сборка не собиралась вовсе.
# 🔒 Версии закреплены: `camoufox==0.5.6` тянет Python-`playwright` 1.62.x, и Node-клиент `playwright-core` обязан быть
# той же версии — иначе соединение отказывает (замер 196-1).
# 🔒 Зависимости Node — `pnpm`, ПОЛНЫЙ состав: служба — приложение Next, и `next build` нужны зависимости разработки.
# 🛑 Системные пакеты (шрифты, библиотеки X, xvfb) здесь не ставятся: это решение установщика машины, а не службы.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UV="${UV:-/root/.local/bin/uv}"
ENGINE="${AI_BROWSER_ENGINE_DIR:-$(cd "$ROOT/.." && pwd)/ai-browser-engine}"
mkdir -p "$ENGINE"
cd "$ROOT"

command -v xvfb-run >/dev/null || { echo "INSTALL_FAIL: xvfb-run не найден — системные пакеты не поставлены"; exit 1; }
command -v pnpm >/dev/null || { echo "INSTALL_FAIL: pnpm не найден"; exit 1; }

[ -x "$ENGINE/venv/bin/python" ] || "$UV" venv --python 3.12 "$ENGINE/venv"
"$UV" pip install --python "$ENGINE/venv/bin/python" "camoufox==0.5.6"
XDG_CACHE_HOME="$ENGINE/cache" "$ENGINE/venv/bin/python" -m camoufox fetch > /tmp/ai-browser-fetch.log 2>&1 || { tail -5 /tmp/ai-browser-fetch.log; exit 1; }

PWV="$("$ENGINE/venv/bin/python" -c "import importlib.metadata as m; print(m.version('playwright'))")"
NODE_PWV="$(node -p "require('./package.json').dependencies['playwright-core']")"
[ "$PWV" = "$NODE_PWV" ] || { echo "INSTALL_FAIL: python playwright $PWV != playwright-core $NODE_PWV"; exit 1; }

pnpm install --frozen-lockfile
echo "INSTALL_OK playwright=$PWV engine=$ENGINE cache=$(du -sh "$ENGINE/cache" | cut -f1)"
