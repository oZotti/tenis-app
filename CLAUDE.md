# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Web tool that helps runners decide whether a specific shoe is worth buying, based on their profile (weight, use type, weekly mileage, injury history). Produces a **purchase verdict**, not a medical diagnosis — every result screen must include a disclaimer recommending professional validation. Runs 100% in the browser; no data is ever sent to a server (privacy/LGPD).

See `visao-projeto-tenis.md` for the full product vision, decision criteria, and roadmap.

## Commands

In a terminal (PowerShell):
```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

When starting the Claude Code preview server (e.g. via `.claude/launch.json`), use the node invocation directly because `npm` is not on the PATH inside the preview runner:
```bash
node node_modules/vite/bin/vite.js
node node_modules/vite/bin/vite.js build
node node_modules/vite/bin/vite.js preview
```

There are no lint or test scripts.

## Stack

- **React 19** + **Vite 6** — no router; single-page app with screen state managed in `src/App.jsx`
- **Tailwind v4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`; activated with `@import "tailwindcss"` in `src/index.css`
- No backend, no database, no auth

## Architecture

### Files
- `src/App.jsx` — React shell (UI only, no business logic)
- `src/logic/veredito.js` — pure scoring function, no React
- `src/data/tenis.json` — curated shoe list (expand as needed)

### `src/data/tenis.json` — shoe schema
Each entry has: `nome`, `marca`, `categoria` (`asfalto`|`trilha`|`misto`|`esteira`), `drop` (mm), `pisada_indicada` (`neutro`|`suporte`), `versatilidade_visual` (1–5), `preco` (R$), `categoria_preco` (`entrada`|`intermediario`|`premium`), `durabilidade_km`, `entressola` (`macia`|`equilibrada`|`firme`).

### `src/logic/veredito.js` — `calcularVeredito(perfil, tenis)`
Returns `{ nivel, titulo, razoes, pontos }` where `nivel` is `"vale" | "atencao" | "evite"` and `razoes` is `[{ tipo: "positivo"|"neutro"|"negativo", texto }]`.

Scoring breakdown (max ~100 pts):
| Criterion | Max | Key inputs |
|---|---|---|
| Versatilidade funcional | 40 | `perfil.tipoUso` × `tenis.categoria` via `COMPAT_FUNCIONAL` table |
| Versatilidade visual | 10 | `tenis.versatilidade_visual` |
| Dor × ficha técnica | 25 | `perfil.dores[]` crossed with `entressola`, `pisada_indicada`, `drop`, `categoria` |
| Custo-benefício | 25 | `tenis.categoria_preco` vs `perfil.faixaPreco` (NIVEL_PRECO diff) |
| Durabilidade | 0 (info) | `preco / durabilidade_km` displayed as custo por km |

Verdict thresholds: ≥70 "vale", ≥45 "atencao", <45 "evite".

Dor sub-rules (each deducts from the 25-pt pool, floored at 0):
- `fáscia plantar` + `entressola === 'firme'` → −10 pts
- `pronação` + `pisada_indicada === 'neutro'` → −10 pts
- `canela` + `entressola === 'firme'` → −6 pts
- `joelho` + `drop < 8` → −7 pts
- `tornozelo` + `categoria === 'trilha'` + tipoUso ≠ trilha → −8 pts

### `src/App.jsx` — UI structure
Sub-components: `<Opcao>` (single-select card), `<Checkbox>` (multi-select card), `<Grupo>` (label wrapper).

Main `App` state: `tela` (`landing`|`questionario`|`resultado`), `etapa` (1|2), `perfil`, `tenisIdx` (list index or `'outro'`), `tenisManual`, `veredito`.

**Etapa 1 — Perfil do corredor:** `peso`, `tipoUso`, `kmSemana`, `faixaPreco`, `dores` (array — multi-select; `'nenhuma'` deselects all others).

**Etapa 2 — Escolha do tênis:** dropdown from `tenisList`; selecting `'outro'` reveals manual form (`categoria`, `drop`, `pisada_indicada`, `entressola`, `preco`; `versatilidade_visual` defaults to 3, `durabilidade_km` to 600; `categoria_preco` derived from price).

`etapa1OK` / `etapa2OK` gate the nav buttons.

## Build phases

1. ✅ Landing screen
2. ✅ Questionnaire + verdict engine — dropdown with curated shoes, manual fallback, multi-select pain history (current state)
3. Shoe inventory + manual mileage tracking
4. Strava integration
5. (eventual) Monetization — paid PDF export; see `visao-projeto-tenis.md` §6

## Key constraints

- **No server-side code.** All logic lives in the browser.
- **Verdict is not a medical diagnosis.** Every result screen must include a disclaimer.
- **Portuguese only.** All UI copy is in Brazilian Portuguese.
- **One phase at a time.** Do not implement Phase 3+ features while Phase 2 is incomplete.

## Dívidas técnicas conhecidas (não resolver agora)

- O motor não usa `perfil.peso` nem `perfil.kmSemana` nas regras de dor — corredores pesados com alto volume não recebem alerta de desgaste acelerado. Lacuna de regra intencional; refinar em rodada futura do "cérebro".
- `tenis.json` tem apenas 4 entradas de exemplo; o usuário vai substituir/expandir essa lista manualmente.
