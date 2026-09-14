// ЗАПРЕТ АДРЕСОВ ВНУТРИ МАШИНЫ (шаг 196-3).
//
// 🛑 ГЛАВНАЯ ОПАСНОСТЬ СЛУЖБЫ — НЕ ЧУЖАЯ СТРАНИЦА, А НАШ ЖЕ СЕРВЕР. Браузер стоит рядом со слоем данных `127.0.0.1:3300`,
// памятью `:3700`, графом и складом секретов. Адрес приходит от чужого зовущего, а открывает его браузер — без запрета
// `http://127.0.0.1:3300/...` превратил бы договор в чужие руки внутри машины.
// 🔒 ПЕРЕНЕСЕНО ИЗ ПАМЯТИ, А НЕ ИЗОБРЕТЕНО: `isForbiddenAddress` — дословно `fractera-memory-starter/lib/fractera/fetch-url.ts`
// (194-16). Список диапазонов у двух служб один; расходиться ему не с чего.
// 🔒 ПРОВЕРЯЕТСЯ АДРЕС, В КОТОРЫЙ ИМЯ РАЗРЕШИЛОСЬ, А НЕ ИМЯ: `localhost`, `127.1`, `127.0.0.1.nip.io` ловятся одинаково.
// 🔒 ПРОВЕРКА СТОИТ НА КАЖДОМ ЗАПРОСЕ СТРАНИЦЫ, А НЕ ТОЛЬКО НА ПЕРВОМ АДРЕСЕ: скрипт, картинка, фрейм, перенаправление и
// WebSocket разрешённой страницы иначе дошли бы до петли в обход. Держит это прокси контекста `lib/egress.mjs`, перехват
// `lib/browser.mjs` стоит перед ним ради типа запроса.
// 🪦 ЗДЕСЬ СТОЯЛ ПРЕДЕЛ «имя разрешаем мы, соединяется браузер — имя с нулевым TTL успевает сменить адрес». Снят тем же
// шагом: прокси соединяется с адресом, который сам проверил, второго разрешения имени нет.

import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { networkInterfaces } from "node:os"

/** Адреса самой машины — их нельзя достать и снаружи-внутрь. */
function ownAddresses() {
  const out = new Set()
  for (const list of Object.values(networkInterfaces())) {
    for (const i of list ?? []) out.add(i.address.toLowerCase())
  }
  return out
}

/** Запрещён ли адрес: петля, частная сеть, link-local, служебные диапазоны, адреса самой машины. */
export function isForbiddenAddress(address) {
  const ip = String(address).toLowerCase().replace(/^\[|\]$/g, "")
  const v = isIP(ip)
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return ownAddresses().has(ip)
  }
  if (v === 6) {
    if (ip === "::" || ip === "::1") return true
    if (ip.startsWith("::ffff:")) return isForbiddenAddress(ip.slice(7))
    if (/^f[cd]/.test(ip) || /^fe[89ab]/.test(ip)) return true
    return ownAddresses().has(ip)
  }
  return true
}

/**
 * Годен ли хост: буквальный IP проверяется сразу, имя — после разрешения, и запрещён хоть один его адрес — запрещено всё.
 * @param {string} host
 * @param {Map<string, Promise<string|null>>} [cache] — на один вызов `read`: имя, спрошенное сорок раз, разрешается один
 * @returns {Promise<string|null>} причина отказа или null
 */
export function hostRefusal(host, cache) {
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, "")
  if (cache?.has(h)) return cache.get(h)
  const job = (async () => {
    if (!h) return "empty-host"
    if (isIP(h)) return isForbiddenAddress(h) ? `forbidden-address ${h}` : null
    try {
      const list = await lookup(h, { all: true })
      const bad = list.find((a) => isForbiddenAddress(a.address))
      if (!list.length) return "unresolved"
      return bad ? `forbidden-address ${h} → ${bad.address}` : null
    } catch (e) {
      return `unresolved ${e.code ?? ""}`.trim()
    }
  })()
  cache?.set(h, job)
  return job
}

/**
 * Проверка адреса, присланного зовущим, ДО открытия вкладки.
 * @returns {Promise<{ok:true, url:string} | {ok:false, error:"url-invalid"|"url-forbidden", why:string}>}
 */
export async function checkUrl(raw, cache) {
  let u
  try {
    u = new URL(String(raw).trim())
  } catch {
    return { error: "url-invalid", ok: false, why: "not a URL" }
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { error: "url-forbidden", ok: false, why: `scheme ${u.protocol}` }
  }
  const why = await hostRefusal(u.hostname, cache)
  if (why?.startsWith("unresolved")) return { error: "url-invalid", ok: false, why }
  if (why) return { error: "url-forbidden", ok: false, why }
  return { ok: true, url: u.href }
}
