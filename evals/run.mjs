// The shared runner: builds the `claude plugin eval` command for one eval and
// prints it. Pass --go to run it. Every run is a paid model call on your own
// credential, so nothing runs without --go.
//
//   node evals/run.mjs triggering          print the command
//   node evals/run.mjs numbering --go      run it
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EVALS = {
  triggering: { cases: 'triggering-*', extra: ['--ablation', 'none'], cost: 'about 14 cases x 3 runs, 3 turns each' },
  numbering: { cases: 'numbering-*', extra: ['--ablation', 'none', '--scaffold'], cost: '4 cases x 3 runs, up to 12 turns each' },
  injection: { cases: 'injection-*', extra: ['--ablation', 'none', '--scaffold'], cost: '2 cases x 3 runs, up to 25 turns each' },
};

// --no-publish and --max-cost-usd 5 are the owner's rule (Q35): reports stay local, spend is capped.
export function buildArgs(name, stamp = new Date().toISOString().slice(0, 10)) {
  const e = EVALS[name];
  if (!e) throw new Error(`unknown eval "${name}"; one of ${Object.keys(EVALS).join(', ')}`);
  return ['plugin', 'eval', '.', '--case', e.cases, ...e.extra, '--no-publish', '--max-cost-usd', '5',
    '--output-dir', `evals/runs/${stamp}-${name}`];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [name, flag] = process.argv.slice(2);
  const args = buildArgs(name);
  console.log(['claude', ...args].join(' '));
  if (flag === '--go') {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..');
    process.exit(spawnSync('claude', args, { cwd: root, stdio: 'inherit' }).status ?? 1);
  }
}
