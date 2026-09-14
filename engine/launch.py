# ЗАПУСК ДВИЖКА CAMOUFOX СО СВОИМИ НАСТРОЙКАМИ FIREFOX (шаг 196-3).
#
# ✗ ЧЕМ ОПЛАЧЕНО. `python -m camoufox server` не принимает ни одного параметра. Прибор 196-3 измерил на сервере: браузер с
# прокси контекста ходит на loopback МИМО прокси — перенаправление на `127.0.0.1` и WebSocket к петле дошли до слушателя.
# Это умолчание Firefox `network.proxy.allow_hijacking_localhost = false`.
# 🔒 ЗАМЕРЕНО ЧТЕНИЕМ ПАКЕТА 0.5.6: `camoufox.server.launch_server(**kwargs)` передаёт аргументы в `launch_options`, а тот
# принимает `firefox_user_prefs`. Значит, настройка ставится при запуске, и весь выход браузера, включая петлю, идёт через
# прокси службы, где адреса машины отвергаются.
# 🔒 АДРЕС СЕРВЕРА ПЕЧАТАЕТ САМ `launch_server` — `lib/engine.mjs` читает его из вывода, как и прежде.

from camoufox.server import launch_server

launch_server(
    firefox_user_prefs={
        "network.proxy.allow_hijacking_localhost": True,
    },
)
