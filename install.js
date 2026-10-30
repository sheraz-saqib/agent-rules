// Copies the agent rules and git blocker into a repo. Safe to re-run: merges existing files instead of overwriting.
// Usage: node D:/code/project-md/install.js <repo-path>
const fs = require('fs');
const path = require('path');

const repo = process.argv[2];
if (!repo || !fs.existsSync(repo)) {
  console.error('Usage: node install.js <repo-path>');
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

// AGENTS.md: the template is the source of truth.
fs.copyFileSync(path.join(template, 'AGENTS.md'), path.join(repo, 'AGENTS.md'));

// CLAUDE.md: keep existing content, make sure it imports AGENTS.md.
const claudeMd = path.join(repo, 'CLAUDE.md');
const claudeText = fs.existsSync(claudeMd) ? fs.readFileSync(claudeMd, 'utf8') : '';
if (!claudeText.includes('@AGENTS.md')) fs.writeFileSync(claudeMd, '@AGENTS.md\n' + (claudeText ? '\n' + claudeText : ''));

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
