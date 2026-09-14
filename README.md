# Fractera AI Browser

**A real browser on your server, for machines.** Memory, other services and AI agents give it addresses; it opens pages
and web applications the way a person does — with a real Camoufox browser — and returns what is actually there: the final
HTML after scripts, all visible text, headings, links, buttons, forms, fields, and media by their attributes. Several
pages in one call. YouTube videos come back with their data and subtitles with timestamps.

And a page it opens **cannot reach inside your machine**: addresses of the server itself, loopback and private networks are
refused before a tab opens and on every request the page makes — redirects and WebSockets included.

It ships with its own web console — passport, API reference with key generation, and a read test bench — wired up from
the first minute.

---

## Why a real browser

Many pages are drawn by scripts. A plain request to TodoMVC returns **645 characters** of HTML; this service returns
**3,289** after the scripts have run — the list, the input field, the buttons. A plain request sees an empty template; the
browser sees the page a person sees.

## What comes back

For every address:

| Field | What it is |
|---|---|
| `final_url`, `status`, `title`, `load_reached` | where the page ended up, its status, title, and whether it reached its load event |
| `html` (+ `html_length`, `html_truncated`) | the full final HTML after scripts |
| `text` (+ `text_length`, `text_truncated`) | all visible text |
| `lang`, `canonical`, `meta` | document language, canonical address, meta tags |
| `headings` | h1–h6 with their levels |
| `links`, `buttons`, `forms`, `fields` | interactive elements with names, labels, placeholders, options |
| `images`, `videos`, `audios`, `iframes` | media by attributes: address, alt, poster, duration, title |
| `blocked` | requests the page made that the address ban refused |

Every list carries `items` and `total`, so a cut list never pretends to be the whole page.

## Nothing inside the machine is reachable

The browser stands next to the data layer and other services. Three layers keep a page from using it as hands inside
the machine, and each was added because a probe measured the gap without it:

1. **Before the tab** — scheme, literal IP and the resolved name are checked: loopback, private networks, link-local and
   the machine's own addresses are refused.
2. **Every request** — all browser traffic leaves through the service's own proxy for that address. It resolves names
   itself and connects only to the address it checked. A redirect to `127.0.0.1` is refused there; without the proxy it
   reached a loopback listener.
3. **No way around** — the engine is launched with `network.proxy.allow_hijacking_localhost`, so even loopback goes
   through the proxy. Without it, Firefox sent loopback past the proxy.

The probe counts hits on a loopback listener after a direct address, a DNS name pointing at `127.0.0.1`, a redirect, an
image, a frame, a `fetch` and a WebSocket: **zero**.

## YouTube

`POST /v1/youtube` returns the video's data — title, description, channel, duration, dates, views, keywords — taken from
the video page, and subtitles taken from the request the player itself makes, as lines `[mm:ss–mm:ss] text`. A language
can be asked for. When there are no subtitles, or the player gives none, the answer still carries the data, with
`transcript: null` and the reason in words.

---

## Install

The **Fractera installer robot** deploys it onto your server together with every other microservice of the platform: the
browser engine, its system libraries, its port behind nginx, the certificate and the access key. There is nothing to
assemble by hand and no command on this page to copy.

## Quick start

```bash
export AI_BROWSER_KEY=fab_…                       # generated on the service's API page
export AB=https://ai-browser.<your-domain>/v1

# read an application drawn by scripts
curl -s $AB/read -H "Content-Type: application/json" -H "x-ai-browser-key: $AI_BROWSER_KEY" \
  -d '{ "urls": ["https://todomvc.com/examples/react/dist/"] }'

# read a YouTube video with subtitles
curl -s $AB/youtube -H "Content-Type: application/json" -H "x-ai-browser-key: $AI_BROWSER_KEY" \
  -d '{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "lang": "en" }'
```

---

# API

Every method is declared in `contract.mjs` and served live at `GET /v1/contract`. The documentation page inside the
service generates itself from that same object.

```
POST https://ai-browser.<your-domain>/v1/<method>
Content-Type: application/json
x-ai-browser-key: fab_…            # or:  Authorization: Bearer fab_…
```

The key is stored at `/etc/fractera/ai-browser-api-key` with mode `0600` and compared in constant time. **Generating a new
key revokes the previous one instantly.** Processes of the same machine may use the machine secret instead.

## `POST /v1/read`

| parameter | type | required | meaning |
|---|---|---|---|
| `urls` | array | yes | Page addresses, http or https, 1 to 10 per call. |

Returns `results` (one per address, same order), `failed` (how many did not open) and `limits`. An address that did not
open carries `error` — `url-invalid`, `url-forbidden`, `page-failed`, `page-timeout` — and `why`; a failed page also
carries `trace`: the page address at the moment of failure, recent requests with their state, and the proxy's connection log.

## `POST /v1/youtube`

| parameter | type | required | meaning |
|---|---|---|---|
| `url` | string | yes | `youtube.com/watch?v=…`, `youtu.be/…`, `/shorts/…`, `/embed/…` |
| `lang` | string | no | Subtitle language wanted; not given — the player's choice. |

Returns `id`, `video`, `playability`, `tracks`, `transcript` (or `null`), `why`, `blocked`, `ms`. Not a video address —
`400 not-youtube`; no such video — `422 video-unavailable`; a consent page — `422 consent-wall`.

## Service endpoints

```
GET /v1/health     open, no key: liveness, contract version, browser engine state
GET /v1/contract   the machine-readable contract
```

## Limits

| What | Limit |
|---|---|
| Addresses per call | 10 |
| Tabs open at once | 3 |
| Time per address | 90 s |
| Final HTML per page | 5,000,000 characters |
| Visible text per page | 1,000,000 characters |
| Each list of elements | 300 items (with `total`) |

Measured on the reference server: a light page opens in seconds; three heavy pages in one call take about 95 s.

## Boundaries that are design, not gaps

- **No sign-in to sites, no solving bot checks.** A check page comes back as the page it is, with its status.
- **Media is described, not downloaded.**
- **Nothing is silent.** What is cut is marked; what did not load is said; every refusal has a permanent code.

---

## Licence and contact

Fractera AI Browser is one microservice of the **Fractera platform** — the engineering infrastructure for autonomous agents:
[github.com/Fractera/Agentic-Engineering-Infrastructure](https://github.com/Fractera/Agentic-Engineering-Infrastructure).

Open source. Commercial enquiries: `admin@fractera.ai`.
