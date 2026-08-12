const repoRoot = import.meta.dirname ?? Deno.cwd();
const siteUrl = "https://zack-murphy.com";

function color(code: number, text: string): string {
  return Deno.noColor ? text : `\x1b[${code}m${text}\x1b[0m`;
}

function step(label: string, command: string, args: string[] = []): string {
  console.log(`\n${color(36, `==> ${label}`)}`);
  const result = new Deno.Command(command, {
    args,
    cwd: repoRoot,
    stdin: "inherit",
    stdout: "piped",
    stderr: "inherit",
  }).outputSync();
  const output = new TextDecoder().decode(result.stdout).trim();
  if (!result.success) {
    throw new Error(`${label} failed with exit code ${result.code}.`);
  }
  if (output) console.log(output);
  return output;
}

function commandExists(command: string): boolean {
  try {
    const result = new Deno.Command(command, {
      args: ["--version"],
      cwd: repoRoot,
      stdout: "null",
      stderr: "null",
    }).outputSync();
    return result.success;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

function parseMessage(): string {
  const messageIndex = Deno.args.indexOf("--message");
  if (messageIndex === -1) return "Update website";
  const message = Deno.args[messageIndex + 1];
  if (!message) throw new Error("--message requires a commit message.");
  return message;
}

function gitLines(args: string[]): string[] {
  const output = step("Inspect changed files", "git", args);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function trimTrailingWhitespace(): void {
  const textExtensions = new Set([
    ".css", ".html", ".js", ".json", ".md", ".mjs", ".ps1", ".qmd",
    ".scss", ".ts", ".txt", ".yaml", ".yml",
  ]);
  const changedFiles = new Set([
    ...gitLines(["diff", "--name-only", "--diff-filter=ACMR"]),
    ...gitLines(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ]);

  for (const relativePath of [...changedFiles].sort()) {
    const extension = relativePath.match(/\.[^./\\]+$/)?.[0].toLowerCase();
    if (!extension || !textExtensions.has(extension)) continue;
    const target = `${repoRoot}/${relativePath}`;
    try {
      const content = Deno.readTextFileSync(target);
      const trimmed = content.replace(/[ \t]+(?=\r?$)/gm, "");
      if (trimmed !== content) {
        Deno.writeTextFileSync(target, trimmed);
        console.log(color(33, `Trimmed trailing whitespace: ${relativePath}`));
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }
}

function walkHtml(directory: string): string[] {
  const files: string[] = [];
  for (const entry of Deno.readDirSync(directory)) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory) files.push(...walkHtml(path));
    else if (entry.isFile && entry.name.toLowerCase().endsWith(".html")) files.push(path);
  }
  return files;
}

const refreshScript = `<script data-site-cache-refresh>
(() => {
  const marker = document.querySelector('meta[name="site-cache-version"]');
  if (!marker || !/^https?:$/.test(window.location.protocol)) return;

  const pageVersion = marker.content;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    try {
      const request = input instanceof Request ? input : null;
      const method = (init && init.method) || (request && request.method) || "GET";
      const url = new URL(request ? request.url : input, window.location.href);

      if (method.toUpperCase() === "GET" && url.origin === window.location.origin) {
        url.searchParams.set("site-version", pageVersion);
        input = request ? new Request(url, request) : url.toString();
      }
    } catch (error) {
      console.warn("Could not version a same-site request.", error);
    }

    return nativeFetch(input, init);
  };

  const endpoint = new URL("/site-version.json", window.location.origin);
  endpoint.searchParams.set("probe", Date.now().toString());

  nativeFetch(endpoint, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" }
  })
    .then((response) => {
      if (!response.ok) throw new Error(\`Freshness check returned \${response.status}.\`);
      return response.json();
    })
    .then(({ version }) => {
      if (!version || version === pageVersion) {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("site-version") === pageVersion) {
          currentUrl.searchParams.delete("site-version");
          window.history.replaceState(null, "", currentUrl);
        }
        return;
      }

      const refreshedUrl = new URL(window.location.href);
      refreshedUrl.searchParams.set("site-version", version);
      if (refreshedUrl.href !== window.location.href) {
        window.location.replace(refreshedUrl.href);
      }
    })
    .catch((error) => console.warn("Site freshness check failed.", error));
})();
</script>`;

function addCacheVersion(outputDirectory: string, version: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(version)) {
    throw new Error(`Cache version '${version}' contains unsupported characters.`);
  }
  const htmlFiles = walkHtml(outputDirectory);
  if (htmlFiles.length === 0) throw new Error(`No rendered HTML files were found in ${outputDirectory}.`);
  Deno.writeTextFileSync(`${outputDirectory}/site-version.json`, JSON.stringify({ version }));

  const attributeRegex = /\b(href|src)=(['"])([^'"]+)\2/gi;
  const cacheable = /\.(?:css|js|mjs|html|png|jpe?g|gif|svg|webp|avif|ico|pdf|json|xml)(?:$|[?#])/i;
  for (const htmlFile of htmlFiles) {
    let html = Deno.readTextFileSync(htmlFile);
    if (html.includes("site-cache-version") || html.includes("data-site-cache-refresh")) {
      throw new Error(`${htmlFile} already contains a cache-version marker. Start from a clean render.`);
    }
    html = html.replace(attributeRegex, (match, attribute, quote, originalUrl) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(originalUrl) || !cacheable.test(originalUrl)) return match;
      const hashIndex = originalUrl.indexOf("#");
      const fragment = hashIndex >= 0 ? originalUrl.slice(hashIndex) : "";
      const url = hashIndex >= 0 ? originalUrl.slice(0, hashIndex) : originalUrl;
      const separator = url.includes("?") ? "&" : "?";
      return `${attribute}=${quote}${url}${separator}site-version=${version}${fragment}${quote}`;
    });
    if (!/<\/head>/i.test(html)) throw new Error(`${htmlFile} has no closing head element.`);
    const marker = `<meta name="site-cache-version" content="${version}">`;
    html = html.replace(/<\/head>/i, `${marker}\n${refreshScript}\n</head>`);
    Deno.writeTextFileSync(htmlFile, html);
  }
  testCacheVersion(outputDirectory, version);
}

function testCacheVersion(outputDirectory: string, expectedVersion: string): void {
  const manifest = JSON.parse(Deno.readTextFileSync(`${outputDirectory}/site-version.json`));
  if (manifest.version !== expectedVersion) throw new Error("Cache-version manifest has the wrong version.");
  const htmlFiles = walkHtml(outputDirectory);
  const localResource = /\b(?:href|src)=(['"])([^'"]+)\1/gi;
  const cacheable = /\.(?:css|js|mjs|html|png|jpe?g|gif|svg|webp|avif|ico|pdf|json|xml)(?:$|[?#])/i;
  for (const htmlFile of htmlFiles) {
    const html = Deno.readTextFileSync(htmlFile);
    if ((html.match(/<meta name="site-cache-version"/g) ?? []).length !== 1 ||
        (html.match(/<script data-site-cache-refresh>/g) ?? []).length !== 1) {
      throw new Error(`${htmlFile} does not contain exactly one cache marker and refresh script.`);
    }
    for (const match of html.matchAll(localResource)) {
      const url = match[2];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) || !cacheable.test(url)) continue;
      if (!new RegExp(`(?:[?&])site-version=${expectedVersion}(?:[&#]|$)`).test(url)) {
        throw new Error(`${htmlFile} contains an unversioned local resource: ${url}`);
      }
    }
  }
  console.log(color(32, `Verified cache version ${expectedVersion} across ${htmlFiles.length} rendered pages.`));
}

async function confirmLiveVersion(expectedVersion: string): Promise<void> {
  let lastProblem = "The live site did not return the expected cache version.";
  for (let attempt = 1; attempt <= 20; attempt++) {
    const probe = `${expectedVersion}-${attempt}-${Date.now()}`;
    try {
      const headers = { "Cache-Control": "no-cache", "Pragma": "no-cache" };
      const manifestResponse = await fetch(`${siteUrl}/site-version.json?probe=${probe}`, { headers });
      if (!manifestResponse.ok) throw new Error(`Manifest request returned ${manifestResponse.status}.`);
      const liveVersion = (await manifestResponse.json()).version;
      if (liveVersion === expectedVersion) {
        const pageResponse = await fetch(`${siteUrl}/?site-version=${expectedVersion}&probe=${probe}`, { headers });
        if (!pageResponse.ok) throw new Error(`Home page request returned ${pageResponse.status}.`);
        const page = await pageResponse.text();
        if (page.includes(`<meta name="site-cache-version" content="${expectedVersion}">`)) {
          console.log(color(32, `Verified live cache version: ${expectedVersion}`));
          return;
        }
        lastProblem = "The live manifest is current, but the live home page is not.";
      } else {
        lastProblem = `The live manifest reports '${liveVersion}' instead of '${expectedVersion}'.`;
      }
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error);
    }
    if (attempt < 20) await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`Published cache version ${expectedVersion}, but live verification failed: ${lastProblem}`);
}

async function main(): Promise<void> {
  Deno.chdir(repoRoot);
  if (Deno.args.includes("--help")) {
    console.log("Usage: quarto run publish-website.ts [--message <commit message>] [--self-test]");
    return;
  }
  if (Deno.args.includes("--self-test")) {
    const fixture = Deno.makeTempDirSync({ prefix: "publish-website-" });
    try {
      Deno.writeTextFileSync(
        `${fixture}/index.html`,
        '<html><head><link href="styles.css"></head><body><img src="image.png#preview"></body></html>',
      );
      addCacheVersion(fixture, "self-test");
      console.log(color(32, "Publish helper self-test passed."));
    } finally {
      Deno.removeSync(fixture, { recursive: true });
    }
    return;
  }
  if (!commandExists("git")) throw new Error("Git was not found. Install Git and ensure it is on PATH.");
  if (!commandExists("quarto")) throw new Error("Quarto was not found. Install Quarto and ensure it is on PATH.");
  const branch = step("Check current branch", "git", ["branch", "--show-current"]);
  if (branch !== "main") throw new Error(`This publish script must run from main. Current branch: ${branch}`);

  step("Fetch latest GitHub state", "git", ["fetch", "origin", "main", "gh-pages"]);
  step("Update local main", "git", ["pull", "--ff-only", "origin", "main"]);
  console.log(`\n${color(36, "==> Trim trailing whitespace")}`);
  trimTrailingWhitespace();
  step("Check whitespace", "git", ["diff", "--check"]);

  const outputDirectory = `${repoRoot}/_site`;
  console.log(`\n${color(36, "==> Clear generated site output")}`);
  try {
    const realRepo = Deno.realPathSync(repoRoot);
    const realParent = Deno.realPathSync(`${outputDirectory}/..`);
    if (realParent !== realRepo) throw new Error(`Refusing to remove a path outside the repository: ${outputDirectory}`);
    Deno.removeSync(outputDirectory, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }

  step("Render Quarto website", "quarto", ["render", "--cache-refresh"]);
  const cacheVersion = new Date().toISOString().replace(/[-:.]/g, "").replace("Z", "Z");
  console.log(`\n${color(36, `==> Add browser cache version ${cacheVersion}`)}`);
  addCacheVersion(outputDirectory, cacheVersion);

  const status = step("Check source changes", "git", ["status", "--porcelain", "--untracked-files=all"]);
  if (status) {
    step("Stage source changes", "git", ["add", "--all", "--", "."]);
    const staged = step("Check staged source changes", "git", ["diff", "--cached", "--name-only"]);
    if (staged) {
      step("Commit source changes", "git", ["commit", "-m", parseMessage()]);
      step("Push source changes to main", "git", ["push", "origin", "main"]);
    } else console.log(color(33, "\nNo source changes to commit after staging."));
  } else console.log(color(33, "\nNo source changes to commit."));

  step("Publish rendered site to GitHub Pages", "quarto", ["publish", "gh-pages", "--no-render", "--no-prompt", "--no-browser"]);
  step("Fetch published GitHub Pages state", "git", ["fetch", "origin", "gh-pages"]);
  const publishedManifest = step("Read published cache version", "git", ["show", "origin/gh-pages:site-version.json"]);
  const publishedVersion = JSON.parse(publishedManifest).version;
  if (publishedVersion !== cacheVersion) throw new Error(`gh-pages has '${publishedVersion}'; expected '${cacheVersion}'.`);
  console.log(`\n${color(36, "==> Verify cache-busted live website")}`);
  await confirmLiveVersion(cacheVersion);
  console.log(`\n${color(32, `Website publish complete: ${siteUrl}`)}`);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(color(31, error instanceof Error ? error.message : String(error)));
    Deno.exit(1);
  }
}
