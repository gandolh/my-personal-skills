/**
 * bin/sync.mjs against a scratch projects folder: a fake `my-personal-skills`
 * checkout holding this package in `house-style/`, and a fake app repo with npm
 * workspaces that syncs from it.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const PACKAGE = join(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const GIT_ENV = {
  GIT_AUTHOR_NAME: "test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "test",
  GIT_COMMITTER_EMAIL: "test@example.com",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
};

const scratch = mkdtempSync(join(tmpdir(), "house-style-sync-test-"));
const projects = join(scratch, "projects");
const checkout = join(projects, "platform", "my-personal-skills");
const app = join(projects, "apps", "demo");
const vendor = join(app, "vendor", "house-style");
const bootstrap = join(checkout, "house-style", "bin", "sync.mjs");
const vendored = join(vendor, "bin", "sync.mjs");

function git(args, cwd = checkout) {
  const run = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...GIT_ENV } });
  assert.equal(run.status, 0, `git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout.trim();
}

function sync(script, args, { cwd = app, projectsDir = projects } = {}) {
  const run = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, PROJECTS_DIR: projectsDir, HOUSE_STYLE_SYNC_HANDOVER: "" },
  });
  return { status: run.status, out: `${run.stdout}${run.stderr}` };
}

function committed(commit, path) {
  const run = spawnSync("git", ["cat-file", "blob", `${commit}:house-style/${path}`], { cwd: checkout });
  assert.equal(run.status, 0, `${path} at ${commit}`);
  return run.stdout;
}

let v1;

before(() => {
  mkdirSync(join(checkout, "house-style"), { recursive: true });
  git(["init", "-q", "-b", "main"]);
  for (const entry of [...pkg.files, "package.json", "README.md"]) {
    cpSync(join(PACKAGE, entry), join(checkout, "house-style", entry), { recursive: true });
  }
  writeFileSync(join(checkout, "README.md"), "# the library\n");
  git(["add", "-A"]);
  git(["commit", "-q", "-m", "house-style 1.0.0"]);
  git(["tag", "house-style-v1.0.0"]);
  v1 = git(["rev-parse", "HEAD"]);

  mkdirSync(join(app, "packages", "web"), { recursive: true });
  writeFileSync(
    join(app, "package.json"),
    `${JSON.stringify({ name: "demo", private: true, workspaces: ["packages/*"], devDependencies: { eslint: "10.9.1", prettier: "3.8.1" } }, null, 2)}\n`,
  );
  writeFileSync(
    join(app, "packages", "web", "package.json"),
    `${JSON.stringify({ name: "web", private: true, devDependencies: { typescript: "^6.0.3" } }, null, 2)}\n`,
  );
  git(["init", "-q", "-b", "main"], app);
});

after(() => rmSync(scratch, { recursive: true, force: true }));

describe("the first sync", () => {
  it("--check exits 1 before there is a copy", () => {
    const tagged = sync(bootstrap, ["house-style-v1.0.0", "--check"]);
    assert.equal(tagged.status, 1, tagged.out);
    assert.match(tagged.out, /eslint\.config\.js: missing/);
    assert.match(tagged.out, /README\.md: missing \(the header\)/);
    assert.ok(!existsSync(vendor), "--check wrote nothing");
  });

  it("copies the shipped files at the tag, byte for byte", () => {
    const run = sync(bootstrap, ["house-style-v1.0.0"]);
    assert.equal(run.status, 0, run.out);
    assert.match(run.out, new RegExp(`wrote house-style ${pkg.version} at ${v1}`));
    for (const path of ["package.json", "eslint.config.js", "prettier.config.js", "tsconfig.base.json", "knip.json", ".dependency-cruiser.cjs", "bin/sync.mjs", "CHANGELOG.md", "LICENSE"]) {
      assert.deepEqual(readFileSync(join(vendor, path)), committed(v1, path), path);
    }
    assert.ok(!existsSync(join(vendor, "test")), "tests stay in the package");
  });

  it("writes a header with the version, the commit and the upgrade notes, and no path", () => {
    const header = readFileSync(join(vendor, "README.md"), "utf8");
    assert.match(header, new RegExp(`^# house-style ${pkg.version.replace(/\./g, "\\.")} \\(vendored\\)$`, "m"));
    assert.match(header, new RegExp(`^- \\*\\*Version:\\*\\* ${pkg.version.replace(/\./g, "\\.")}$`, "m"));
    assert.match(header, /^- \*\*Source:\*\* the `my-personal-skills` repository, folder `house-style\/`$/m);
    assert.match(header, new RegExp(`^- \\*\\*Commit:\\*\\* \`${v1}\`$`, "m"));
    assert.match(header, /^- \*\*Upgrade notes:\*\* `house-style\/CHANGELOG\.md` in the same repository/m);
    assert.ok(!header.includes(scratch), "the header names no machine path");
    assert.ok(!/\| `[^`]+` \| Shipped with house-style \|/.test(header), "every shipped file has a description");
  });

  it("--check exits 0 after, with the tag or with the header's commit", () => {
    for (const args of [["--check"], ["house-style-v1.0.0", "--check"], [v1, "--check"]]) {
      const run = sync(vendored, args);
      assert.equal(run.status, 0, `${args.join(" ")}: ${run.out}`);
      assert.match(run.out, /byte for byte/);
    }
  });
});

describe("the copy is the commit, never the checkout's working tree", () => {
  it("ignores uncommitted edits, deletions and new files in the checkout", () => {
    appendFileSync(join(checkout, "house-style", "eslint.config.js"), "\n// an uncommitted edit\n");
    rmSync(join(checkout, "house-style", "LICENSE"));
    writeFileSync(join(checkout, "house-style", "bin", "untracked.mjs"), "export {};\n");
    appendFileSync(bootstrap, "\n// an uncommitted edit to the sync itself\n");
    try {
      const run = sync(bootstrap, ["HEAD"]);
      assert.equal(run.status, 0, run.out);
      for (const path of ["eslint.config.js", "LICENSE", "bin/sync.mjs"]) {
        assert.deepEqual(readFileSync(join(vendor, path)), committed(v1, path), path);
      }
      assert.ok(!existsSync(join(vendor, "bin", "untracked.mjs")));
      assert.equal(sync(vendored, ["--check"]).status, 0);
    } finally {
      git(["checkout", "--", "house-style"]);
      git(["clean", "-fdq", "house-style"]);
    }
  });
});

describe("--check after the copy changed", () => {
  it("lists a hand edit, an extra file and a stale header, and a sync puts it back", () => {
    appendFileSync(join(vendor, "eslint.config.js"), "\n// edited by hand\n");
    writeFileSync(join(vendor, "extra.txt"), "not shipped\n");
    appendFileSync(join(vendor, "README.md"), "\nedited\n");
    const run = sync(vendored, ["--check"]);
    assert.equal(run.status, 1, run.out);
    assert.match(run.out, /eslint\.config\.js: differs/);
    assert.match(run.out, /extra\.txt: not in /);
    assert.match(run.out, /README\.md: differs \(the header\)/);

    const back = sync(vendored, ["house-style-v1.0.0"]);
    assert.equal(back.status, 0, back.out);
    assert.ok(!existsSync(join(vendor, "extra.txt")), "a file the commit lacks is removed");
    assert.equal(sync(vendored, ["--check"]).status, 0);
  });
});

describe("a newer version", () => {
  let v2;
  before(() => {
    const script = join(checkout, "house-style", "bin", "sync.mjs");
    writeFileSync(script, readFileSync(script, "utf8").replace("This directory is a copy of house-style", "This folder is a copy of house-style"));
    const manifest = join(checkout, "house-style", "package.json");
    writeFileSync(manifest, readFileSync(manifest, "utf8").replace(`"version": "${pkg.version}"`, '"version": "9.9.9"'));
    git(["commit", "-q", "-am", "house-style 9.9.9"]);
    git(["tag", "house-style-v9.9.9"]);
    v2 = git(["rev-parse", "HEAD"]);
  });

  it("is written by its own sync script, so its header is its own", () => {
    const run = sync(vendored, ["house-style-v9.9.9"]);
    assert.equal(run.status, 0, run.out);
    const header = readFileSync(join(vendor, "README.md"), "utf8");
    assert.match(header, /^# house-style 9\.9\.9 \(vendored\)$/m);
    assert.match(header, /This folder is a copy of house-style/);
    assert.match(header, new RegExp(`\`${v2}\``));
    assert.equal(sync(vendored, ["--check"]).status, 0);
  });

  it("and going back hands over to the older script", () => {
    const run = sync(vendored, ["house-style-v1.0.0"]);
    assert.equal(run.status, 0, run.out);
    assert.match(readFileSync(join(vendor, "README.md"), "utf8"), /This directory is a copy of house-style/);
    assert.deepEqual(readFileSync(vendored), committed(v1, "bin/sync.mjs"));
    assert.equal(sync(vendored, ["--check"]).status, 0);
  });
});

describe("the pins", () => {
  it("reports each pin that differs, in the root and in a workspace, and changes nothing", () => {
    const before = readFileSync(join(app, "package.json"));
    const run = sync(vendored, ["--check"]);
    assert.equal(run.status, 0, "pins never change the exit code");
    assert.match(run.out, /pin prettier: package\.json has 3\.8\.1, house-style 1\.0\.0 lists 3\.9\.10/);
    assert.match(run.out, /pin typescript: packages\/web\/package\.json has \^6\.0\.3, house-style 1\.0\.0 lists 6\.0\.3/);
    assert.match(run.out, /not pinned in this repo: .*knip/);
    assert.doesNotMatch(run.out, /pin eslint:/, "a matching pin is not reported");
    assert.deepEqual(readFileSync(join(app, "package.json")), before);
  });
});

describe("finding the checkout", () => {
  it("refuses two checkouts with the same name", () => {
    const second = join(projects, "elsewhere", "my-personal-skills");
    mkdirSync(join(second, ".git"), { recursive: true });
    try {
      const run = sync(vendored, ["--check"]);
      assert.equal(run.status, 1);
      assert.match(run.out, /more than one my-personal-skills checkout/);
    } finally {
      rmSync(join(projects, "elsewhere"), { recursive: true, force: true });
    }
  });

  it("finds one directly in the projects folder too", () => {
    const flat = join(scratch, "flat");
    mkdirSync(flat);
    cpSync(checkout, join(flat, "my-personal-skills"), { recursive: true });
    const run = sync(vendored, ["--check"], { projectsDir: flat });
    assert.equal(run.status, 0, run.out);
  });

  it("says so when there is none", () => {
    const run = sync(vendored, ["--check"], { projectsDir: join(scratch, "empty") });
    assert.equal(run.status, 1);
    assert.match(run.out, /no my-personal-skills checkout/);
  });
});

describe("mistakes", () => {
  it("exits 2 on a usage error", () => {
    assert.equal(sync(vendored, []).status, 2);
    assert.equal(sync(vendored, ["a", "b"]).status, 2);
    assert.equal(sync(vendored, ["--force"]).status, 2);
  });

  it("exits 1 on a ref the checkout does not have", () => {
    const run = sync(vendored, ["house-style-v0.0.0"]);
    assert.equal(run.status, 1);
    assert.match(run.out, /"house-style-v0\.0\.0" is not a tag or commit/);
  });

  it("refuses to sync into the library checkout itself", () => {
    const run = sync(bootstrap, ["house-style-v1.0.0"], { cwd: join(checkout, "house-style") });
    assert.equal(run.status, 1);
    assert.match(run.out, /this is the my-personal-skills checkout itself/);
    assert.ok(!existsSync(join(checkout, "vendor")));
  });
});

describe("finding the repo", () => {
  it("is the git work tree it runs in, even from a workspace with its own package.json", () => {
    const run = sync(vendored, ["--check"], { cwd: join(app, "packages", "web") });
    assert.equal(run.status, 0, run.out);
    assert.ok(!existsSync(join(app, "packages", "web", "vendor")));
  });

  it("outside git, is the nearest folder with a package.json", () => {
    const loose = join(scratch, "loose");
    mkdirSync(join(loose, "src"), { recursive: true });
    writeFileSync(join(loose, "package.json"), "{}\n");
    const run = sync(bootstrap, ["house-style-v1.0.0"], { cwd: join(loose, "src") });
    assert.equal(run.status, 0, run.out);
    assert.ok(existsSync(join(loose, "vendor", "house-style", "README.md")));
  });
});
