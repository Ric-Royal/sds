# Develop SDS on two computers

Each computer keeps its own checkout of [Ric-Royal/sds](https://github.com/Ric-Royal/sds). Push committed changes from one computer and pull them on the other. Signing into ChatGPT on both devices does not copy a local project folder, installed dependencies or private settings.

## Windows setup

Install Git and Node.js 24 with npm, then open a new PowerShell window. These commands should report Git and Node 24:

```powershell
git --version
node --version
npm --version
```

Choose a development folder and clone the repository once. For example, if `$env:USERPROFILE\sds` does not already exist:

```powershell
Set-Location $env:USERPROFILE
git clone https://github.com/Ric-Royal/sds.git
Set-Location sds
npm ci
npm --prefix services/agents ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Website development and Worker tests do not require the production administrator key. GitHub sign-in is needed to push changes; use Git's credential manager or `gh auth login` on that computer. Do not copy an authentication token into this repository.

In Codex in the desktop app, add the cloned `sds` folder as a local project and start work from that project. Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) to continue from the technical handover. On the original computer, the project folder is `D:\sds`; the other computer can use a different path.

## Linux or WSL setup

The website and Worker also run on Linux with Git and Node.js 24. Clone into Linux storage, such as `~/sds`, and run the same npm commands. With a compatible version manager, use `.nvmrc` or `.node-version` to select Node 24.

Treat a Windows checkout and a WSL checkout as separate development environments. Install dependencies in each environment rather than sharing a `node_modules` directory between Windows and Linux.

The ERP runtime has additional requirements: Debian 13, Python 3.14, MariaDB, Redis and the pinned application stack. Follow [WINDOWS.md](../services/erp/WINDOWS.md) and [DEPLOYMENT.md](../services/erp/DEPLOYMENT.md) after inspecting the intended Linux instance. Installing the website dependencies alone does not start the ERP.

## Switch computers without losing work

Before starting work on either computer, save any existing edits, select the intended branch and update it:

```sh
git status
git pull --ff-only
```

For a new change, start a branch from the updated master:

```sh
git switch master
git pull --ff-only
git switch -c codex/describe-your-change
```

When finished, inspect the diff, stage the intended files, commit and push that branch. For example, after intentionally editing the README:

```sh
git diff
git add README.md
git commit -m "Update SDS documentation"
git push -u origin HEAD
```

On the other computer, fetch and switch to the same branch. If it has not been checked out there before:

```sh
git fetch origin
git switch --track origin/codex/describe-your-change
```

For a branch already present there, use `git switch codex/describe-your-change` and `git pull --ff-only`. Run `npm ci` and `npm --prefix services/agents ci` when their lock files change. Review and merge completed changes through a pull request; merging into `master` triggers the configured deployments. Use separate branches for concurrent changes.

## Keep data and credentials separate

Ignored files, including `.env*` and the Worker's `.dev.vars`, do not travel through Git. Configure necessary local values privately on each computer. The example local Worker variables are in `services/agents/.dev.vars.example`; follow its service guide before starting a local database.

The Cloudflare D1 database and any installed ERP's records are independent of these source checkouts. Use the ERP's encrypted backup and verified restore procedure when migrating its data. For two computers accessing the same business records, use one configured ERP host rather than assuming a Git pull synchronizes databases.

## Continue the same Codex chat remotely

Chat continuity and source-code synchronization are separate. A remote connection can use the files on a connected computer. To hand a Codex chat between hosts, first save a project for this same Git repository on the destination host, then use the chat's run-location control to select the host and hand off. This transfers the chat and its Git state into a worktree on that host.

See the official OpenAI documentation for [projects and local files](https://learn.chatgpt.com/docs/projects) and [remote connections and handoff](https://learn.chatgpt.com/docs/remote-connections). Feature availability depends on the app and workspace.
