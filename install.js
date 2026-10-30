#!/usr/bin/env node
// Copies the agent rules and git blocker into a repo. Safe to re-run: merges existing files instead of overwriting.
// Usage: npx github:<user>/<repo> [repo-path]   (defaults to the current folder)
const fs = require('fs');
const path = require('path');

const repo = process.argv[2] || process.cwd();
if (!fs.existsSync(repo)) {
  console.error(`Folder not found: ${repo}`);
  process.exit(1);
}
const template = __dirname;
const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};
const addHookOnce = (groups, group) => {
  const command = group.hooks[0].command;
  return groups.some(g => g.hooks.some(h => h.command === command)) ? groups : [...groups, group];
};

// instruction/AGENTS.md: full rules, the template is the source of truth.
const rulesText = fs.readFileSync(path.join(template, 'AGENTS.md'), 'utf8');
fs.mkdirSync(path.join(repo, 'instruction'), { recursive: true });
fs.writeFileSync(path.join(repo, 'instruction', 'AGENTS.md'), rulesText);

// Root AGENTS.md: short pointer for Codex. Replaces an old full copy, keeps a repo's own content.
const pointer = '# Agent Rules\n\nBefore any work, read `instruction/AGENTS.md` in full and follow every rule in it.\n';
const agentsMd = path.join(repo, 'AGENTS.md');
const agentsText = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, 'utf8') : '';
const isOldFullCopy = agentsText.startsWith('# AGENTS.md: Production Rules');
if (!agentsText || isOldFullCopy) fs.writeFileSync(agentsMd, pointer);
else if (!agentsText.includes('instruction/AGENTS.md')) fs.writeFileSync(agentsMd, pointer + '\n' + agentsText);

// Root CLAUDE.md: keep existing content, make sure it imports instruction/AGENTS.md.
const claudeMd = path.join(repo, 'CLAUDE.md');
const claudeText = (fs.existsSync(claudeMd) ? fs.readFileSync(claudeMd, 'utf8') : '').replace(/^@AGENTS\.md\r?\n?/m, '').trim();
if (!claudeText.includes('@instruction/AGENTS.md')) {
  fs.writeFileSync(claudeMd, '@instruction/AGENTS.md\n' + (claudeText ? '\n' + claudeText + '\n' : ''));
}

// .claude/settings.json: merge allow/deny rules and the hook.
const claudeTemplate = readJson(path.join(template, '.claude', 'settings.json'));
const claudeSettingsPath = path.join(repo, '.claude', 'settings.json');
const claudeSettings = readJson(claudeSettingsPath, {});
claudeSettings.permissions = claudeSettings.permissions || {};
for (const key of ['allow', 'deny']) {
  claudeSettings.permissions[key] = [...new Set([...(claudeSettings.permissions[key] || []), ...claudeTemplate.permissions[key]])];
}
claudeSettings.hooks = claudeSettings.hooks || {};
claudeSettings.hooks.PreToolUse = addHookOnce(claudeSettings.hooks.PreToolUse || [], claudeTemplate.hooks.PreToolUse[0]);
writeJson(claudeSettingsPath, claudeSettings);

// .codex/hooks.json: merge the hook.
const codexTemplate = readJson(path.join(template, '.codex', 'hooks.json'));
const codexHooksPath = path.join(repo, '.codex', 'hooks.json');
const codexHooks = readJson(codexHooksPath, { description: codexTemplate.description, hooks: {} });
codexHooks.hooks = codexHooks.hooks || {};
codexHooks.hooks.PreToolUse = addHookOnce(codexHooks.hooks.PreToolUse || [], codexTemplate.hooks.PreToolUse[0]);
writeJson(codexHooksPath, codexHooks);

console.log(`Installed agent rules in ${path.resolve(repo)}`);
