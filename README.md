# SDS

SDS's website, customer delivery platform and internal company operations code live in this repository. GitHub is the shared source for development on multiple computers.

| Part | Location | Development and deployment |
| --- | --- | --- |
| Public website | `src/`, `public/` | Next.js static export, published to [datasds.org](https://datasds.org) through GitHub Pages |
| Customer delivery platform | `services/agents/` | Cloudflare Worker and D1; [service guide](services/agents/README.md) |
| Internal company operations | `services/erp/` | ERPNext, CRM, HRMS, Helpdesk and SDS app; [operations guide](services/erp/README.md) |

Read [project context](docs/PROJECT_CONTEXT.md) for the technical handover and [development on two computers](docs/DEVELOPMENT.md) for Windows, WSL and Git instructions.

## Get started

Install Git and **Node.js 24** (with npm). This version supports both the website and customer service; `.nvmrc` and `.node-version` record it for version managers.

```sh
git clone https://github.com/Ric-Royal/sds.git
cd sds
npm ci
npm --prefix services/agents ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Website pages are under `src/app/`.

In another terminal, run the customer service locally with:

```sh
npm --prefix services/agents run dev
```

See the [service development instructions](services/agents/README.md#development) for local variables and database migrations. Production credentials are unnecessary for website development and automated Worker tests.

## Verify changes

```sh
npm run lint
npm run build
npm --prefix services/agents test
npm --prefix services/agents run build
```

The website build writes static files to `out/`. For local development use `npm run dev`; `next start` does not serve this project's static export.

The ERP has separate Python/Linux requirements and integration tests. Follow [ERP verification](services/erp/VERIFICATION.md) and [Windows/WSL installation](services/erp/WINDOWS.md). Cloning the code does not install or restore the operational ERP database.

## Deployment

Changes merged into `master` publish the website through GitHub Actions. Relevant backend changes deploy the Worker separately. See [service deployment](services/agents/DEPLOY.md) and [ERP deployment](services/erp/DEPLOYMENT.md) for their configuration and verification requirements.

Store credentials privately in the appropriate local ignored files or platform secret settings. Business records, mailbox access, database contents and private backups are separate from this source repository.
