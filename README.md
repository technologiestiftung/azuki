![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Azuki

Azuki helps young people in Germany find a vocational training (_Ausbildung_) that
fits them. Users answer a short questionnaire about their school background,
interests, strengths and expectations, and in a few minutes get a personal
strengths profile and a ranked list of matching _Ausbildungsberufe_.

## About Azuki

Azuki was built by [CityLAB Berlin](https://citylab-berlin.org/), a project of the
[Technologiestiftung Berlin](https://www.technologiestiftung-berlin.de/), supported
by the Senate Chancellery of Berlin.

Choosing an apprenticeship is hard: there are hundreds of recognised occupations, and
official databases are written for adults who already know what they are looking for.
Azuki turns that decision into a short, friendly conversation. It asks about who you
are rather than which job title you want, and matches your answers against the full
catalogue of German vocational occupations.

- **A guided questionnaire.** Ten steps cover school situation, degree, subjects,
  interests, strengths, work expectations, practical experience, work preferences and
  no-gos — no prior knowledge of any occupation required.
- **A personal strengths profile.** Answers are turned into a profile that is used for
  matching and shown back to the user.
- **Ranked occupation matches.** Every recognised occupation is scored against the
  profile, and the best matches are presented with a plain-language explanation of why
  they fit.
- **Real training vacancies.** Matches can be connected to open apprenticeship
  positions nearby via the German Federal Employment Agency's job search.

## Architecture

Azuki is a single monorepo with three [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces):

- **`frontend/`** — Vite + React single-page app (Zustand for state). The questionnaire
  UI and results view. In development it proxies `/api` to the backend.
- **`backend/`** — [Hono.js](https://hono.dev/) API server (port `3001`). Hosts the
  matching pipeline and integrations, and validates requests with Zod.
- **`shared/`** — TypeScript types and constants shared by frontend and backend,
  imported as `@azuki/shared`.

The occupation catalogue (~727 occupations, sourced from the Federal Employment
Agency's BerufeNet data) lives in `backend/data/`.

### Matching pipeline

```
POST /api/match (UserProfile)
  → preFilter:  score every occupation against the profile → top candidates
  → AI re-rank: (optional, needs OPENROUTER_API_KEY) → top 8 with explanations
  → fallback:   (no API key) → top 8 by score
```

The backend also exposes helper endpoints for training vacancies
(`POST /api/vacancies`, via the Arbeitsagentur Jobsuche API), reverse geocoding
(`POST /api/reverse-geocode`, via Nominatim) and occupation lookup
(`GET /api/occupations/:id`).

## Prerequisites

- [Node.js](https://nodejs.org/) `v22.9.0` (see [`.nvmrc`](./.nvmrc) — run `nvm use`)
- npm (ships with Node)

## Installation

```bash
git clone https://github.com/technologiestiftung/azuki.git
cd azuki
npm run install:all
```

## Environment variables

The backend reads its configuration from `.env` in the repository root — copy
`.env.example` and fill in the values you need:

- `OPENROUTER_API_KEY` — enables AI re-ranking of matches via
  [OpenRouter](https://openrouter.ai/). Without it, the pipeline falls back to
  returning the top matches by score.

## Development

```bash
npm run dev            # run frontend + backend together
npm run dev:frontend   # Vite dev server only
npm run dev:backend    # backend only (tsx watch)
```

The frontend is served by Vite and proxies `/api` to the backend on port `3001`.

Useful data scripts (regenerate the bundled occupation data):

```bash
npm run data:fetch-berufe                  # refresh the occupation catalogue
npm run data:generate-short-descriptions   # regenerate short descriptions (needs OPENROUTER_API_KEY)
```

### Build & format

```bash
npm run build      # build backend + frontend
npm run lint       # ESLint
npm run prettier   # format
```

## Deployment

Azuki ships to [Vercel](https://vercel.com/) as a single app: the frontend is served as
static assets and the backend runs as a serverless function
(`api/_handler.ts`). The build is driven by [`vercel.json`](./vercel.json).

## Tests

```bash
npm run test:unit   # Vitest unit tests
npm run test:e2e    # Playwright end-to-end tests
npm run test:a11y   # Playwright + axe accessibility tests
```

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zainab-tariq"><img src="https://avatars.githubusercontent.com/u/15946816?v=4?s=64" width="64px;" alt="Zainab Tariq"/><br /><sub><b>Zainab Tariq</b></sub></a><br /><a href="https://github.com/technologiestiftung/azuki/commits?author=zainab-tariq" title="Code">💻</a> <a href="#a11y-zainab-tariq" title="Accessibility">♿️</a> <a href="https://github.com/technologiestiftung/azuki/pulls?q=is%3Apr+reviewed-by%3Azainab-tariq" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/elona-m"><img src="https://avatars.githubusercontent.com/u/177862132?v=4?s=64" width="64px;" alt="Elona Müller"/><br /><sub><b>Elona Müller</b></sub></a><br /><a href="#design-elona-m" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://annaeschenbacher.com"><img src="https://avatars.githubusercontent.com/u/56318362?v=4?s=64" width="64px;" alt="Anna Eschenbacher"/><br /><sub><b>Anna Eschenbacher</b></sub></a><br /><a href="https://github.com/technologiestiftung/azuki/commits?author=aeschi" title="Code">💻</a> <a href="https://github.com/technologiestiftung/azuki/pulls?q=is%3Apr+reviewed-by%3Aaeschi" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nlspnsgen"><img src="https://avatars.githubusercontent.com/u/12913491?v=4?s=64" width="64px;" alt="Niels Poensgen"/><br /><sub><b>Niels Poensgen</b></sub></a><br /><a href="https://github.com/technologiestiftung/azuki/commits?author=nlspnsgen" title="Code">💻</a> <a href="#infra-nlspnsgen" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/technologiestiftung/azuki/pulls?q=is%3Apr+reviewed-by%3Anlspnsgen" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/niclasstengeltsberlin"><img src="https://avatars.githubusercontent.com/u/224381257?v=4?s=64" width="64px;" alt="Niclas Stengel"/><br /><sub><b>Niclas Stengel</b></sub></a><br /><a href="#design-niclasstengeltsberlin" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/myrigal"><img src="https://avatars.githubusercontent.com/u/124904583?v=4?s=64" width="64px;" alt="Myrian Rigal"/><br /><sub><b>Myrian Rigal</b></sub></a><br /><a href="#ideas-myrigal" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

## Credits

<table>
  <tr>
    <td>
      Made by <a href="https://citylab-berlin.org/de/start/">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-citylab-color.svg" alt="Link to the CityLAB Berlin website" />
      </a>
    </td>
    <td>
      A project by <a href="https://www.technologiestiftung-berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-de.svg" alt="Link to the Technologiestiftung Berlin website" />
      </a>
    </td>
    <td>
      Supported by <a href="https://www.berlin.de/rbmskzl/">
        <br />
        <br />
        <img width="80" src="https://logos.citylab-berlin.org/logo-berlin-senatskanzelei-de.svg" alt="Link to the Senate Chancellery of Berlin"/>
      </a>
    </td>
  </tr>
</table>
