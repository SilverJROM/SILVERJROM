## Jrom — software consultant, Philippines

Twenty years building software; the last three building the systems that let AI coding agents
do production work without being trusted blindly.

**I don't just use coding agents. I build the architecture in which they orchestrate each
other** — a deterministic coordinator that slices a spec, dispatches each slice to a model
seat, enforces a machine-readable callback protocol, and keeps the reviewer structurally
separate from the implementer.

And I measure it, because the interesting failures are invisible otherwise.

### Measured on my own harness

| | |
|---|---|
| Work slices landing with no human touch | **~70%** |
| Pass rate by retry attempt | 17% → 17% → 25% → 27% — **nearly flat** |
| My AI code reviewer's true-negative rate on genuinely broken diffs | **36%** |
| Share of wall-clock spent in decode | **~97%** |
| Output quality vs context length | −11% @ 32k · −40% @ 131k · −56% @ 254k |

Two of those changed how I build:

- **The retry curve is flat**, so retrying is not a strategy. Cap attempts and escalate to a
  different model or a smaller slice instead of letting an agent loop.
- **My AI reviewer was rubber-stamping.** Aggregate accuracy looked fine; against known-bad
  diffs it was missing nearly two-thirds of them. Every validator I route to is now scored
  against a frozen set of real broken changes before it is trusted.

The short version of my judgment on agents: **let them run free where failure is cheap and
verifiable; everywhere else put them inside a pipeline that checks them.** The hard part was
never the prompting — it's the verification.

### Models

**Frontier:** Claude (Opus/Sonnet) · OpenAI Codex · Grok — each wired as an interchangeable
seat behind one dispatch protocol.
**Self-hosted:** GLM · DeepSeek · Qwen and other open models — ten model seats across two GPU
boxes behind a router with failover, served on vLLM.

Planners, implementers and validators are benchmarked **separately**, because they are
different jobs. One model plans well and validates poorly; another is the reverse. The routing
table is derived from measurement, not vibes.

### Public work here

- **[kloo](https://github.com/lokalhub/kloo)** — agent coding driver in Go. One CLI that runs
  both frontier and self-hosted open models, with retry rails and a benchmark suite.
- **[Helm](https://github.com/SilverJROM/Helm)** — agent-orchestration application.
  Authors agents, binds swappable models to fixed roles, dispatches them into tmux under a
  Landlock write-fence, gates output and escalates on failure. TypeScript · Fastify · WS · SQLite.
- **[meet-poc](https://github.com/SilverJROM/meet-poc)** — Cloudflare-native WebRTC meeting
  app. Angular + Workers, multi-party calls, recording and transcription.
- **[agent-orchestration](https://github.com/SilverJROM/agent-orchestration)** — the design
  write-up: protocol grammar, topology, and what the measurements actually showed.

Most recent work is private client code. Happy to walk through architecture and code live.

### Also build

Cloudflare Workers (D1 + migrations, Durable Objects, R2, KV, Queues, Cron, Workers for
Platforms) · AWS · TypeScript · Python · Go · React / Next.js / Angular / Ionic ·
Node / Fastify / FastAPI · GraphQL · PostgreSQL · Redis · Playwright · Docker · CI/CD ·
MCP servers · RAG · Ethereum

**Shipping now:** a Philippine HRIS (attendance, payroll, SSS/PhilHealth/Pag-IBIG/BIR
compliance) · ReceiptBot (AI receipt extraction → Xero-ready output) · Lokal, a project
workspace with an ~80-tool MCP server so agents can operate it directly.

📍 Philippines · [lokalbase.app](https://lokalbase.app)
