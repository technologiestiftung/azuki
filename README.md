![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# What is AzuKi?

Azuki is an AI-powered app that helps young people in Berlin find a suitable apprenticeship. After answering a few questions about their education, interests, strengths, previous work experience and expectations of their future jobs, a profile is created. Based on this profile, AzuKi suggests suitable apprenticeships and shows available vacancies nearby.

Azuki was built by [CityLAB Berlin](https://citylab-berlin.org/), a project of [Technologiestiftung Berlin](https://www.technologiestiftung-berlin.de/) in collaboration with [JOBLINGE](https://joblinge.de) Berlin. The project was funded by the [Civic Innovation Platform](https://www.civic-innovation.de) of the [Federal Ministry of Labour and Social Affairs](https://www.bmas.de/EN/Home/home.html). 

## How does it work?

Choosing a future career is hard: there are hundreds of possible apprenticeships, and
official databases are written for adults who already know what they are looking for.
AzuKi turns that decision into a short and friendly conversation. It asks users about who they
are and what their strengths are rather than which job title they want, and matches these answers against the
catalogue of recognised apprenticeships available in the wider region of Berlin.

- **A guided questionnaire.** Ten steps cover school education, preferred subjects,
  interests, strengths, work expectations, previous work experience, as well as work preferences and
  no-gos - no prior knowledge of any apprenticeship needed.
- **A personal strengths profile.** Answers are turned into an individual profile that is used for
  matching and shown back to the user.
- **Ranked matches.** Every apprenticeship is scored against the
  profile, and the best matches are presented with a plain-language explanation of why
  they fit.
- **Up-to-date vacancies.** Together with the matches AzuKi shows available job vacancies nearby.

## Data sources

AzuKi uses data from the [BERUFENET](https://web.arbeitsagentur.de/berufenet) information portal and the Federal Employment Agency’s [job search service](https://www.arbeitsagentur.de/jobsuche). This way information on apprenticeships and job vacancies can be found all in one place. The photos accompanying the job descriptions also come from BERUFENET. The typical tasks are AI summaries in simple language. The original text of each apprenticeship can be found via the link to BERUFENET.

Further sources: The data on the recommended school-leaving qualification is based on the Trainee Data System ([DAZUBI](https://www.bibb.de/dazubi)) of the Federal Institute for Vocational Education and Training. If this information is missing there, we use the data on BERUFENET. Using figures from the Federal Statistical Office ([Destatis](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bildung-Forschung-Kultur/Schulen/Publikationen/_publikationen-innen-statistischer-bericht.html)), we calculate how many people are undertaking school-based apprenticeships in Berlin/Brandenburg. The location data comes from [OpenStreetMap](https://www.openstreetmap.org/copyright).

AzuKi is not a service provided by the Federal Employment Agency. The information may be out of date or incomplete. It is best to check important details such as salary or entry requirements on BERUFENET or directly with the employer.

AzuKi was developed by CityLAB Berlin as an open-source project. More information at: https://citylab-berlin.org/projekte/azuki

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

Third-party data is excluded; see [NOTICE](NOTICE).

## Architecture

AzuKi is a single monorepo with three [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces):

- **`frontend/`** — Vite + React single-page app (Zustand for state). The questionnaire
  UI and results view. In development it proxies `/api` to the backend.
- **`backend/`** — [Hono.js](https://hono.dev/) API server (port `3001`). Hosts the
  matching pipeline and integrations, and validates requests with Zod.
- **`shared/`** — TypeScript types and constants shared by frontend and backend,
  imported as `@azuki/shared`.

The catalogue (~528 apprenticeships) lives in `backend/src/data/`.

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

`npm install` generates `shared/data/popularity-index.json` and `availability-by-state.json` from the BIBB xlsx (needs devDependencies).

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

AzuKi ships to [Vercel](https://vercel.com/) as a single app: the frontend is served as
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
