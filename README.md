# Fractera Memory

**A self-hosted, open-source memory engine for agents.** Knowledge graph built on write and read
without a model turn · geospatial and temporal recall with `lat`/`lon` and radius search · native
multimodal input — voice, images, video, PDF — with its own object store · a deterministic router
that answers without any LLM when no LLM is needed · bounded deep reasoning that reaches conclusions
nobody wrote down · and a self-evolving skill core that **A/B split-tests its own candidates** before
promoting them.

Built to act as the architect's personal command centre — through a Telegram bot, a web chat or
anything else that speaks HTTP — it closes the gap between a volatile context window and real
cognitive continuity. A factual lookup comes back in **under 10 ms for zero tokens**; a question that
once took a minute of deep research is answered **in about 0.2 s** the second time it is asked.

It ships **with its own web console** — passport, API reference with key generation, a live
playground, the work journal and settings — wired up and working from the first minute. The console
is a microservice of its own: use it, or ignore it and drive the engine head-first through the REST
API. Your server. Your data. No per-request fees to anyone.

---

## Read this first if you are comparing systems

Three capabilities are usually the ones a comparison marks as missing. In this engine they are core,
not add-ons:

### 1. Multimodality is native, not a preprocessor you bolt on

Hand memory a whole thing — as a form upload to `keep_object`, by URL, or as `media` next to a phrase — and it
describes the thing itself and keeps it in four places at once, or in none:

| Kind | What happens inside |
|---|---|
| `audio` | speech-to-text by OpenAI whisper-1 with a timestamp on every segment; the description is written from the transcript |
| `image` | read by Claude with vision: every element, its position, colours and all visible text become the full description |
| `video` | ffmpeg extracts the sound track and six frames; the track is transcribed, the frames are read on one timeline |
| `pdf` | read whole by Claude: structure, headings, content, tables row by row |
| `markdown`, `html`, `text` | read by Claude; HTML is shown as a sandboxed page and as its source |
| source code | analysed, not rewritten — what it does, what it exports and imports; stored as text, never executed |

The file with its full description goes to the **object store**; the summary goes to a table row and a **vector**
search card; the full description with its origin — source, author, date — goes to the **knowledge graph**. Find it
by meaning with `find_objects`, open it with `open_object`, fetch the bytes with `GET /v1/objects/{id}/file`.
Web pages are not files: a URL that answers `text/html` is refused, and pages are the job of a browser.

### 2. Geolocation is a first-class dimension, not a text tag

A scope entry carries coordinates, not just a place name:

```json
"scope": [
  { "at": "2026-09-11", "place": "Madrid", "lat": 40.4168, "lon": -3.7038, "radius_m": 500 },
  { "place": "London" }
]
```

Coordinates are **spatially indexed**, so recall answers «what do I know near this point» with a
radius search rather than a string match. Coordinates are validated as a pair and against the bounds
of the planet — a lone latitude is half a point, and 200 degrees of longitude is a typo that would
otherwise become knowledge. Scope propagates into totals, life cycles and answers: a taxi ride in
Madrid never merges with one in London, and the same question asked in another city is a different
question. **An empty scope means «I do not know where and when» — never «everywhere, always».**

### 3. Skill evolution runs a real A/B split test

When memory sees a repeated miss, it writes a **second version of the skill next to the working
one** and runs it as a **challenger in the shadow**: on real traffic, while people keep being
answered by the champion. Promotion has a rule, not a feeling — the challenger wins only if it wins
on **external verdicts** and does not lose on **cost**, and quality is tracked **per case, per tool,
per version and per scope**, because one skill is excellent with one set of parameters and poor with
another. The loser is deleted together with the record of why. Every edit is a commit, and there is a
one-click return to the first version if an evolution goes wrong.

**The engine's own opinion of success is never counted.** A model retelling its own work errs in its
own favour; the verdict comes from whoever asked.

---

## Not to be confused with older descriptions

Third-party summaries of «Fractera» still describe a previous generation of the platform: LightRAG as
the memory core, Hermes agents, a Hermes Web UI, an SQLite-with-WAL story. **That is not this
service.** This repository is the memory engine itself: its own graph, vector, relational and object
stores behind one contract, with no external memory library in the middle and no agent framework
required to use it.

A machine-readable summary of everything claimed here lives in
[`capabilities.json`](./capabilities.json) and is verifiable against `GET /v1/contract` on a running
instance.

---

## Your checklist, line by line

| What you need | How this engine does it |
|---|---|
| **Any front-end — Telegram today, a web chat or mobile app tomorrow** | A working web console comes in the box and is already connected; every other client — a Telegram bot, a web widget, a mobile app, a cron job — attaches to the same REST API as a caller with a key. An agent's tool schema is generated from `GET /v1/contract` over HTTP, so a new front-end is wired in minutes. |
| **Decisions and actions, not hints** | Answers carry the conclusion, its source table, the kind of claim (said or inferred), the grounds, and the reasoning chain. Conclusions that imply a next step become scheduled follow-ups. |
| **Video, images, PDF, audio** | Native, with the pipeline and the object store inside — see §1 above. |
| **Geolocation, and dates when they matter** | Spatial-temporal scope with `lat`/`lon`, `radius_m` and `at`, spatially indexed — see §2 above. |
| **Deep reasoning that finds what was never written down** | Five explicit levels; above the database sit the knowledge graph, a reasoning session that builds and compares variants, semantic search, and bounded recursive research. «Who of my contacts could have known that person» is the reference case, not an edge case. |
| **Fast with no AI in some cases, a strong model in others** | A deterministic router decides. Level one is pure lookup: milliseconds, zero tokens. The model is called only when the cheap path found nothing, and `depth_used` always reports how far memory actually went. |
| **The slow answer must become instant next time** | Every expensive result is folded back — artefact into the object store, summary into text, into the vector store and into the graph, relation table updated. The repeat question is answered from the cheap levels. |
| **Complex requests should build an entity and come back as a report** | Memory creates the table while answering; `need_table` forces it at once. The answer carries the artefact plus a short summary — a report, not a dump. |
| **Its own object storage** | Built in, on your machine, referenced from answers by id. |
| **An evolution core with split-testing** | Champion/challenger shadow testing with an explicit promotion rule — see §3 above. |
| **Free, on my own server** | Self-hosted on your VPS, deployed by the installer robot. No metered API in the middle; nothing leaves the machine. |
| **A knowledge graph updated on write, nearly free on read** | Exactly the design: entities and links are built as facts arrive, and on read the graph is queried in context mode — **no model turn** — so the cheap path stays cheap. |
| **Open source, modifiable by hand** | This repository is the whole service: contract, verbs, stores, pages. Every design decision is written down next to the code that implements it. |

**What comes with it, and what stays yours.** The console ships connected: you sign in and you are
already talking to memory, generating keys, reading the journal, watching what each call cost. What
stays yours is the **product** front-end — the Telegram bot, the web chat, the mobile app your users
actually touch. The engine does not impose one, and it does not need one: the console is a separate
microservice, and the engine runs perfectly well with it switched off.

---

## Install

The **Fractera installer robot** deploys it onto your server: creates the service, gives it its port
and its place behind nginx, wires it into the machine's secret store, issues certificates, starts it
under the process manager. Minutes after you order a server you have a running memory engine with its
own pages, its own contract and its own key.

That is the whole of it: one run of the robot brings up every microservice of the platform, memory
included. There is nothing to assemble by hand and no command on this page to copy — a command
printed in a readme lives its own life and goes stale silently.

## Quick start

```bash
export MEMORY_KEY=fmk_…                       # generated on the service's API page
export MEM=https://memory.<your-domain>/v1

# tell it something a person said, in their own words
curl -s $MEM/remember -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman", "text": "my name is Roman and I live in Madrid", "lang": "en" }'

# ask what it knows — no question means everything, and no model is called
curl -s $MEM/recall -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman", "lang": "en" }'
```

No schema to design, no migration to run, no table to declare.

---

# API

Every method is declared in `contract.mjs` and served live at `GET /v1/contract`. The documentation
page inside the service generates itself from that same object, so it never drifts from what the
server accepts.

## Transport and authentication

```
POST https://memory.<your-domain>/v1/<verb>
Content-Type: application/json
x-memory-key: fmk_…            # or:  Authorization: Bearer fmk_…
```

One key covers reading and writing. It is shown once, stored at `/etc/fractera/memory-api-key` with
mode `0600`, compared in constant time. **Generating a new key revokes the previous one instantly.**
Calls without a valid key get `401 no-access`.

**Read the body, not the status code.** Memory answers `200` with `ok:false` for refusals it
understands and names; a non-200 status means the call never reached the verb.

## `POST /v1/remember`

| parameter | type | required | meaning |
|---|---|---|---|
| `who` | string | yes | Whose facts these are: a stable key for the person. |
| `text` | string | yes | The phrase as it was said, without paraphrasing. |
| `lang` | string | no | Language of the words meant for a person. |
| `scope` | array | no | Spatial-temporal scope: `{at, place, lat, lon, radius_m}` entries. |
| `media` | array | no | Attachments: `{url}` file addresses. Each goes the same way as `keep_object`; memory decides the kind. |
| `thread` | string | no | Continue an earlier line of reasoning. |
| `deny` | string | no | Overturn an earlier conclusion. |
| `need_table` | boolean | no | Make what is recorded its own table at once. |

Returns `what_happened` (words you can say straight to a person), `noted` (what was written down,
with `from_table` and `claim`), `params` (the fate of every optional parameter), `objects` (the fate of every
attachment) and `thread`.
On a contradiction: *«was X, now Y»* — the latest wins, out loud, with the previous value kept.

## `POST /v1/recall`

| parameter | type | required | meaning |
|---|---|---|---|
| `who` | string | yes | Who is being asked about. |
| `text` | string | no | The question in a human sentence; without it everything known comes back. |
| `lang` | string | no | Language of the words meant for a person. |
| `depth` | string | no | `standard` · `deep` · `extreme`. |
| `history` | string | no | The previous conversation, when the caller has one. |
| `prior` | string | no | What has already been found before this question. |
| `want_chain` | boolean | no | Return the steps of the search. |
| `thread` | string | no | Continue an earlier line of reasoning. |
| `scope` | array | no | Where and when the question is asked — including coordinates and radius. |

Returns `known` (each value with `from_table`, `claim`, `basis`), `not_yet_known`, `used_model`,
`depth_asked` / `depth_used`, `used_input`, `chain` and `params`.

## `POST /v1/keep_object`

A multipart form with the file in the `file` part — or JSON with `url`, and memory downloads the file itself.

| parameter | type | required | meaning |
|---|---|---|---|
| `file` | binary | file or url | The file itself, in multipart/form-data. |
| `url` | string | file or url | An http(s) file address, JSON body, up to 200 MB. Addresses inside the machine or a private network → `url-forbidden`; `text/html` → `is-a-page`. |
| `source` | string | no | Where it came from: `api` · `telegram` · …; default `api`. |
| `author` | string | no | Who sent it, in words; default `who`. |
| `who` | string | no | The person the object belongs to. |
| `title`, `summary`, `full` | string | no | Your own description; with `summary` no model is called. |
| `tags`, `anchors` | JSON array | no | Tags; graph anchors (people, places, products). |

Returns `messageId` (the row linking all four stores), `object` (id, name, size), `title`, `summary`, `kind`,
`described` and `ms`.

## `POST /v1/find_objects` and `POST /v1/open_object`

`find_objects { question }` searches by meaning with one embedding and no model turn; every result carries `id`,
`title`, `summary`, `kind`, `messageId` and `score`. `open_object { id, from? }` returns the card, the text in
parts for textual kinds, and `file` — the address to fetch the bytes from.

## Other endpoints

```
POST /v1/people           who memory knows at all
POST /v1/journal          memory's own account of its work, in plain text
POST /v1/forget_journal   erase that account; knowledge about people is untouched
GET  /v1/tables           names of everything memory keeps about a person
GET  /v1/tables/{name}    the description of one table
GET  /v1/objects/{id}/file  an object's file: the stored bytes with their type and name
GET  /v1/health           open, no key: liveness, contract version, name-quality figure
GET  /v1/contract         the machine-readable contract
```

## Multimodal and geospatial examples

```bash
# a voice message with the place it was recorded in
curl -s $MEM/remember -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman",
        "text": "voice note from the trip",
        "media": [{ "url": "https://…/note.oga" }],
        "scope": [{ "at": "2026-09-11", "lat": 40.4168, "lon": -3.7038, "radius_m": 300 }] }'

# a contract as PDF next to a phrase: read whole, described, kept in four stores
curl -s $MEM/remember -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman", "text": "this is the lease for the flat",
        "media": [{ "url": "https://…/lease.pdf" }] }'

# what do I know near this point
curl -s $MEM/recall -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman", "text": "what did I spend here",
        "scope": [{ "lat": 40.4168, "lon": -3.7038, "radius_m": 1000 }] }'

# something nobody ever wrote down — allow the expensive path, ask for the chain
curl -s $MEM/recall -H "Content-Type: application/json" -H "x-memory-key: $MEMORY_KEY" \
  -d '{ "who": "roman", "text": "who of my contacts could have known the president",
        "depth": "extreme", "want_chain": true }'
```

---

# How it works

## The deterministic router

Most questions do not deserve a language model, and the engine refuses to spend one on them.

| Level | What it brings in | Cost | Who opens it |
|---|---|---|---|
| **1** | direct lookup — **no model at all** | milliseconds, zero tokens | the engine |
| **2** | lookup plus one model call | one turn | the engine, when level one found nothing |
| **3** | **knowledge graph** context plus a reasoning session | graph read costs **no model turn** | the engine, when level two found nothing |
| **4** | **semantic search over the vector store** | seconds | the caller, `depth: "deep"` |
| **5** | **bounded recursive research**, ten minutes maximum | minutes | the caller, `depth: "extreme"` |

The ladder is ordered by **cost**, which is why the graph sits below the vector store: it returns
ready context without generating anything. The answer always reports `depth_used`, so you know what
you paid for.

*«What is my timezone»* is answered at level one with zero tokens. *«Who of my contacts could have
known that person»* exists nowhere in the stores and is assembled at levels three to five out of the
graph, the vector store and the model's knowledge of the world — returned as a probabilistic answer
**with the chain that produced it**.

## Four stores, one black box

Relational for values, **vector** for meaning, **knowledge graph** for connections, **object store**
for binaries. The caller never learns which of them answered: the answer names its source table, and
that is the only thing about storage that travels out. Deciding where to look stays the engine's job —
that is what keeps it a black box rather than a database under a thin cover.

## Schema that grows by itself

*«my friends Dima and Misha»* → a column and two rows. *«in the team Julia is the product manager,
Dima is the manager»* → a team table. The second value of a kind promotes a column into its own
table, carrying the first value with its origin, its claim kind and **its own timestamp** — so the
engine never reports that it learned about Misha today. Names are built through a whitelist and a
transliteration table, because a name born from a model ends up inside SQL.

## Claims and grounds

Every value carries its kind: `said` — the person stated it; `guess` — the engine inferred it, and an
inference is stored **only with its basis**, because a guess without its grounds becomes
indistinguishable from testimony within a week.

## Knowledge becomes an object, not a paragraph

Asked to summarise complex data — last month's spending, a project's state — the engine does not hand
back a wall of text. It builds the thing you asked for:

1. **Instantiates a structured entity**: a typed table with the columns the answer needs.
2. **Compiles, sorts and formats a clean Markdown artifact**, assigned its own **Object ID**.
3. **Returns a short executive summary next to the artifact**, so the answer reads well and the
   detail stays referenceable.

## Threads of reasoning — and why continuing one is cheaper

Every answer in which the engine thought carries `thread`; send it back and the same chain continues,
with the model seeing its own earlier conclusion.

| Turn | cache created | cache read | cost |
|---|---|---|---|
| first — the thread is born | 6362 | 8204 | `0.0289` |
| second — `thread` sent back | 843 | 15305 | `0.0065` |
| third | — | 16148 | `0.0036` |

Continuing a thread is **eight times cheaper** than restating context in a fresh call.

This is what makes `deny` meaningful: overturning a conclusion only matters if you can return to the
reasoning that produced it. The conclusion is withdrawn, the grounds are kept, and the refuted
hypothesis stays on record so the same search does not reproduce it tomorrow.

## The memoization loop: the slow answer becomes the fast one

Nothing expensive is paid for twice:

1. An expensive computation or research loop runs at level 4 or 5.
2. An artifact is created with its ID, alongside a concise conclusion.
3. The conclusion is indexed into the vector store, the knowledge graph and the tables.
4. Repeat questions are answered **in about 0.2 s at levels 1–3, for zero tokens**.

A computed table and the output of deep research are the same case, not two.

## The evolution core: skills that improve themselves under A/B testing

After every cycle the engine records the facts of the run: how deep it went, how many model turns,
how many seconds, what kind of answer came out, which skills and tools were called. These are data,
not impressions.

When it detects a repeated miss, it writes a **second version of the skill next to the working one**
and runs it as a **challenger in the shadow** — on real traffic, while people keep being answered by
the **champion**. Three rules hold it together:

- **No self-evaluation.** The verdict comes from whoever asked — a human or the calling model. A
  model retelling its own work errs in its own favour, and the design refuses to rely on that.
- **Deterministic promotion.** A challenger becomes champion only when it wins on external quality
  and regresses on neither speed nor cost — measured per case, per tool, per version and per scope.
- **Versioning and safe rollback.** Every modification is a commit, and one click returns the
  instructions to the baseline version without touching the accumulated data.

## Everything it did is written down

The journal records every call — what came in, what the model returned, what was decided, **what was
dropped and why**, what went out, how long it took. A human reads it on the Journal page; an agent
reads the same document as a file.

## The console that comes with it

The engine ships with its own web interface, already wired up and protected by role-based sign-in.
It is not a demo page: it is how you operate the memory day to day.

| Screen | What it is for |
|---|---|
| **Passport** | the full design of the engine, read from disk on every request — edit the document, reload, see it |
| **API** | this reference, generated from the live contract, with the **Generate access key** button |
| **Playground** | talk to memory with nothing in between and see the raw answer with its timing |
| **Journal** | what memory did: what arrived, what was decided, what was dropped and why |
| **Settings · Subscription** | keys and switches of the service itself |
| **Terminal** | a live shell into the service for the people who own the machine |

**What the playground is for**, in three lines: execute direct API requests against the memory core
with no front-end abstraction in the way; inspect raw JSON payloads, execution timings and exact
model token usage; verify the request body before committing a line of client code.

**The playground deserves its own paragraph.** Its controls mirror the API one to one — depth in
plain words, conversation history, previous findings, the reasoning thread with a button that lifts
the identifier from the last answer, the denial field, scope as cards with *«add an entry»*, the
demand for a table, uploads for everything that is not text. Above the send button it shows **the
exact request body about to leave**: the single panel that answers the question every integration
eventually asks — did the service ignore my parameter, or did my client never send it?

**And all of it is optional.** The console is a microservice beside the engine, not a layer in front
of it: nothing in the API path depends on it, and an installation that never opens a browser behaves
identically.

## How it compares

Two comparisons: one against the categories of memory tooling, one against a ready-made assistant
built on a different philosophy.

| Capability | **Fractera Memory** | Standard RAG frameworks | MemGPT / Letta | Mem0 / Zep |
|---|---|---|---|---|
| Storage architecture | Hybrid: graph + vector + relational + object store | Vector DB only | Relational / text files | Vector plus a basic graph |
| Zero-token reads | Yes — deterministic paths at levels 1–3 | No | No | Partial |
| Native multimodality | Built in: audio, video, PDF, images | Requires external parsers | Requires external parsers | Text focused |
| Spatial proximity indexing | Native lat/lon radius search | Text matching only | Function calling only | Basic metadata |
| Skill evolution | Champion / challenger A/B testing | None | Manual prompt edits | None |
| Self-hosted / open source | 100% on-premise, single node | Varies | Yes | Freemium / cloud |

| Feature | **Fractera Memory** | IVA Agent (`smixs/iva-agent`) |
|---|---|---|
| System classification | An autonomous memory engine behind an API, for any front-end | An end-to-end Telegram assistant tied to an Obsidian vault |
| Architecture | A decoupled microservice; the Telegram bot is an optional client | A monolith: Telegram, userbot and vault manager in one codebase |
| Cost optimisation | A five-tier deterministic router; instant zero-token reads | Every operation leans on model passes, BM25 and vector lookups |
| Multimodality | Built-in object storage; audio transcribed with timestamps; images, PDF, pages, code and video frames read by a vision model | Audio transcription and plain text handling |
| Geolocation | Native lat/lon plus radius_m proximity search | None; dates and places are unstructured text |
| Data processing | Dynamic SQL tables, structured artifacts with IDs, knowledge graph | Markdown cards written to a folder for Obsidian to sync |
| System evolution | Shadow A/B testing with external verdicts | None; execution logic is fixed in prompt files |
| Integrations | Many front-ends at once over one REST API | Bound to one Telegram account and an Obsidian setup |

## Boundaries that are design, not gaps

- **You never query a table directly.** Source names travel out in the answer and are not accepted in
  the question.
- **No history of your requests is kept.** Each call is a closed cycle; continuity is explicit,
  through the reasoning thread.
- **Facts about third parties are reported, not filed against the wrong person.**
- **Relations between two people are graph edges, not row fields** — a relation has a source and a
  target, and a column would lose one of them.
- **Nothing is promoted quietly.** An inference is stored only with its grounds; an empty scope stays
  empty.

---

## Questions and answers

**Does every request cost tokens?**
No. Levels 1 to 3 are answered without a model at all: a direct lookup, a graph traversal, a
conclusion already folded back into the stores. A model turn is spent only when the cheap
deterministic paths return nothing, and the answer reports `depth_used` so you can see what you paid
for.

**Can it answer questions about a place by coordinates, not by a word?**
Yes. A scope entry carries `lat`, `lon` and an optional `radius_m`, and the coordinates are spatially
indexed. You can ask what you know within 500 metres of a point, and knowledge recorded in Madrid
never merges with knowledge recorded in London.

**What can I send besides text?**
Voice notes, images, video, PDF, Markdown, HTML and source code — as a form upload, by URL, or as `media` next to a
phrase. Audio is transcribed by whisper-1 with timestamps; images, PDFs, pages and code are read by Claude; video
gives its sound track and six frames on one timeline. The original stays in the built-in object store, is found by
meaning with `find_objects` and fetched with `GET /v1/objects/{id}/file`.

**What schema do I have to design first?**
None. You send a sentence. The engine adds columns as new kinds of fact appear and generates typed
relational tables when a kind grows into an entity. There are no migrations to write.

**What happens after an expensive research run?**
It folds the result back — artifact, summary, vector store, knowledge graph, relation tables — and
the same question is then answered from the cheap levels in fractions of a second.

**How does it improve itself without breaking what works?**
It writes a second version of the skill and runs it as a challenger in the shadow, on real traffic,
while people keep being answered by the champion. Promotion needs an external verdict and no
regression in cost: the engine is never allowed to grade its own work.

**What can I connect to it?**
Any HTTP client: a Telegram bot, a web chat, a mobile app, a scheduled job. The bundled console is
optional — nothing in the API path depends on it.

**Where does my data live?**
On your server, in your database, in your object store, behind a key you can revoke in one click.
There is no metered API in the middle and no telemetry leaving the machine.

## Privacy and ownership

The engine runs on **your** server, stores its data in **your** database, keeps artefacts in **your**
object store and its key in **your** machine's secret store. Nothing about the people it remembers
leaves that machine, and the only door in is the one you authorise with a key you can revoke in a
single click.

## Licence and contact

Fractera Memory is one microservice of the **Fractera platform** — the engineering infrastructure
for autonomous agents:
[github.com/Fractera/Agentic-Engineering-Infrastructure](https://github.com/Fractera/Agentic-Engineering-Infrastructure).

Open source. Fork it, read it, change it. Commercial enquiries: `admin@fractera.ai`.
