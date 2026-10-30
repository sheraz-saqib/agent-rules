# Agent Rules

Production rules for AI coding agents (Claude Code, Codex, and others), plus a git blocker that stops agents from committing or pushing.

## Install In A Project

Run this inside the project folder:

```
npx --yes github:sheraz-saqib/agent-rules
```

Or pass a path:

```
npx --yes github:sheraz-saqib/agent-rules D:/code/my-project
```

Requirements: Node.js, and GitHub access to this repo (log in to git first if the repo is private).

## What It Adds

```
my-project/
  instruction/
    AGENTS.md            # all rules
  AGENTS.md              # short pointer for Codex
  CLAUDE.md              # @instruction/AGENTS.md for Claude
  .claude/settings.json  # git blocker for Claude Code
  .codex/hooks.json      # git blocker for Codex
```

Existing files are merged, not overwritten. Running the command again is safe.

## After Installing

1. Commit and push the new files yourself. Agents are blocked from doing it.
2. In Codex, run `/hooks` once and trust the git blocker.
3. Start working. Agents follow the rules automatically.

## Update The Rules

1. Edit `AGENTS.md` in this repo, then commit and push.
2. Run the install command again in each project to pull the new rules.
