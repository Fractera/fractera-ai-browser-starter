// ЗАПРЕТ АДРЕСОВ ВНУТРИ МАШИНЫ (шаг 196-3).
//
// 🛑 ГЛАВНАЯ ОПАСНОСТЬ СЛУЖБЫ — НЕ ЧУЖАЯ СТРАНИЦА, А НАШ ЖЕ СЕРВЕР. Браузер стоит рядом со слоем данных `127.0.0.1:3300`,
// памятью `:3700`, графом и складом секретов. Адрес приходит от чужого зовущего, а открывает его браузер — без запрета
// `http://127.0.0.1:3300/...` превратил бы договор в чужие руки внутри машины.
// 🔒 ПЕРЕНЕСЕНО ИЗ ПАМЯТИ, А НЕ ИЗОБРЕТЕНО: `isForbiddenAddress` — дословно `fractera-memory-starter/lib/fractera/fetch-url.ts`
// (194-16). Список диапазонов у двух служб один; расходиться ему не с чего.
// 🔒 ПРОВЕРЯЕТСЯ АДРЕС, В КОТОРЫЙ ИМЯ РАЗРЕШИЛОСЬ, А НЕ ИМЯ: `127.1`, `127.0.0.1.nip.io` ловятся одинаково.
// 🔒 ПРОВЕРКА СТОИТ НА КАЖДОМ ЗАПРОСЕ СТРАНИЦЫ, А НЕ ТОЛЬКО НА ПЕРВОМ АДРЕСЕ: скрипт, картинка, фрейм, перенаправление и
// WebSocket разрешённой страницы иначе дошли бы до петли в обход. Держит это прокси контекста `lib/egress.mjs`, перехват
// `lib/browser.mjs` стоит перед ним ради типа запроса.
// 🪦 ЗДЕСЬ СТОЯЛ ПРЕДЕЛ «имя разрешаем мы, соединяется браузер — имя с нулевым TTL успевает сменить адрес». Снят тем же
// шагом: прокси соединяется с адресом, который сам проверил, второго разрешения имени нет.
//
// 🔒 ИМЕНА РАЗРЕШАЕТ `dns.Resolver` (c-ares), А НЕ `dns.lookup` (196-3, гипотеза, проверяемая прибором). `lookup` занимает
// один из четырёх потоков пула libuv на всё время `getaddrinfo`; три тяжёлые страницы разом дают десятки имён, и новая
// навигация ждала в очереди — прибор видел `about:blank`, ноль запросов и пустой журнал прокси при таймауте 45 с.
// `Resolver` сетевой и не занимает пул; у него свой таймаут, и имя, которое не ответило, — отказ через секунды, а не висение.
// 🛑 `Resolver` НЕ ЧИТАЕТ `/etc/hosts` — поэтому `localhost` и `*.localhost` запрещены ПО ИМЕНИ. Остальное безопасно по
// устройству: прокси соединяется ровно с тем адресом, который разрешили здесь, а не с тем, что сказал бы `/etc/hosts`.
// 🔒 ОБЩИЙ КЭШ НА 60 С, А НЕ НА ВЫЗОВ: имя, которое страница спрашивает сорок раз, разрешается однажды для всех вкладок.

import { Resolver } from "node:dns/promises"
import { isIP } from "node:net"
import { networkInterfaces } from "node:os"

const CACHE_MS = 60_000
const resolver = new Resolver({ timeout: 3000, tries: 2 })
const cache = new Map()

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

async function resolveName(h) {
  const [v4, v6] = await Promise.allSettled([resolver.resolve4(h), resolver.resolve6(h)])
  const list = [...(v4.status === "fulfilled" ? v4.value : []), ...(v6.status === "fulfilled" ? v6.value : [])]
  if (!list.length) {
    const code = v4.status === "rejected" ? v4.reason?.code : ""
    return { unresolved: true, why: `unresolved ${h} ${code ?? ""}`.trim() }
  }
  const bad = list.find((a) => isForbiddenAddress(a))
  if (bad) return { why: `forbidden-address ${h} → ${bad}` }
  return { addresses: list }
}

/**
 * Разрешить хост и проверить все его адреса. IPv4 — первыми.
 * @returns {Promise<{addresses: string[]} | {why: string, unresolved?: boolean}>}
 */
export function resolveAllowed(host) {
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "")
  if (!h) return Promise.resolve({ why: "empty-host" })
  if (isIP(h)) return Promise.resolve(isForbiddenAddress(h) ? { why: `forbidden-address ${h}` } : { addresses: [h] })
  if (h === "localhost" || h.endsWith(".localhost")) return Promise.resolve({ why: `forbidden-address ${h} (loopback name)` })
  const hit = cache.get(h)
  if (hit && Date.now() - hit.t < CACHE_MS) return hit.job
  const job = resolveName(h)
  cache.set(h, { job, t: Date.now() })
  if (cache.size > 2000) for (const [k, v] of cache) if (Date.now() - v.t >= CACHE_MS) cache.delete(k)
  return job
}

/** Причина отказа хоста или null. «Не разрешилось» тоже отказ: браузер туда всё равно не попадёт. */
export async function hostRefusal(host) {
  const r = await resolveAllowed(host)
  return r.addresses ? null : r.why
}

/**
 * Проверка адреса, присланного зовущим, ДО открытия вкладки.
 * @returns {Promise<{ok:true, url:string} | {ok:false, error:"url-invalid"|"url-forbidden", why:string}>}
 */
export async function checkUrl(raw) {
  let u
  try {
    u = new URL(String(raw).trim())
  } catch {
    return { error: "url-invalid", ok: false, why: "not a URL" }
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { error: "url-forbidden", ok: false, why: `scheme ${u.protocol}` }
  }
  const r = await resolveAllowed(u.hostname)
  if (r.unresolved) return { error: "url-invalid", ok: false, why: r.why }
  if (!r.addresses) return { error: "url-forbidden", ok: false, why: r.why }
  return { ok: true, url: u.href }
}
