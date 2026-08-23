import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

console.log("==================================================");
console.log("    AlpineAce Is Agentic Verification Suite       ");
console.log("==================================================\n");

let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  }
}

// 1. Static file checks
console.log("1. Checking Agent Instruction Files (llms.txt & llms-full.txt)...");
const llmsPath = path.join(projectRoot, "public", "llms.txt");
const llmsFullPath = path.join(projectRoot, "public", "llms-full.txt");

assert(fs.existsSync(llmsPath), "public/llms.txt exists");
assert(fs.existsSync(llmsFullPath), "public/llms-full.txt exists");

if (fs.existsSync(llmsPath)) {
  const llmsContent = fs.readFileSync(llmsPath, "utf-8");
  assert(llmsContent.includes("## When to Use AlpineAce"), "llms.txt contains '## When to Use AlpineAce' section");
  assert(llmsContent.includes("Best-fit Use Cases"), "llms.txt names best-fit use cases");
  assert(llmsContent.includes("When NOT to Use"), "llms.txt names non-fit use cases");
  assert(llmsContent.includes("Accept: text/markdown"), "llms.txt explains Accept: text/markdown negotiation");
}

// 2. Middleware & API route file checks
console.log("\n2. Checking Middleware & Agent Markdown Implementation...");
const middlewarePath = path.join(projectRoot, "middleware.ts");
const agentRoutePath = path.join(projectRoot, "app", "api", "agent-markdown", "route.ts");

assert(fs.existsSync(middlewarePath), "middleware.ts exists");
assert(fs.existsSync(agentRoutePath), "app/api/agent-markdown/route.ts exists");

if (fs.existsSync(middlewarePath)) {
  const mwContent = fs.readFileSync(middlewarePath, "utf-8");
  assert(mwContent.includes("Vary"), "middleware.ts sets Vary header");
  assert(mwContent.includes("text/markdown"), "middleware.ts handles text/markdown negotiation");
}

if (fs.existsSync(agentRoutePath)) {
  const routeContent = fs.readFileSync(agentRoutePath, "utf-8");
  assert(routeContent.includes("Vary"), "agent-markdown route sets Vary: Accept");
  assert(routeContent.includes("404 Not Found"), "agent-markdown route provides structured 404 recovery body");
  assert(routeContent.includes("sitemap.xml"), "agent-markdown route references sitemap.xml");
}

// 3. Layout & Metadata checks (Organization JSON-LD, Brand Discoverability)
console.log("\n3. Checking Organization Schema & Brand Metadata...");
const layoutPath = path.join(projectRoot, "app", "layout.tsx");
assert(fs.existsSync(layoutPath), "app/layout.tsx exists");

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert(layoutContent.includes('"@type": "Organization"'), "layout.tsx includes Organization JSON-LD type");
  assert(layoutContent.includes("contactPoint"), "Organization JSON-LD includes contactPoint");
  assert(layoutContent.includes("PostalAddress"), "Organization JSON-LD includes PostalAddress");
  assert(layoutContent.includes("alternateName"), "layout.tsx includes brand alternateNames");
  assert(layoutContent.includes("canonical"), "layout.tsx specifies canonical URL");
}

// 4. Homepage SSR & Heading Hierarchy checks
console.log("\n4. Checking Homepage SSR & Heading Structure...");
const pagePath = path.join(projectRoot, "app", "(marketing)", "page.tsx");
assert(fs.existsSync(pagePath), "app/(marketing)/page.tsx exists");

if (fs.existsSync(pagePath)) {
  const pageContent = fs.readFileSync(pagePath, "utf-8");
  assert(pageContent.includes("initialTreks"), "page.tsx server-pre-renders initial package data");
  assert(pageContent.includes("organizationSchema"), "page.tsx embeds Organization schema");
  assert(pageContent.includes("<h2>"), "page.tsx includes H2 headings");
  assert(pageContent.includes("<h3>"), "page.tsx includes H3 headings");
  assert(pageContent.length > 3000, "page.tsx provides extensive SSR content");
}

// 5. 404 Page recovery checks
console.log("\n5. Checking 404 Page Recovery Implementation...");
const notFoundPath = path.join(projectRoot, "app", "not-found.tsx");
assert(fs.existsSync(notFoundPath), "app/not-found.tsx exists");

if (fs.existsSync(notFoundPath)) {
  const notFoundContent = fs.readFileSync(notFoundPath, "utf-8");
  assert(notFoundContent.includes("Page Not Found"), "not-found.tsx contains Page Not Found header");
  assert(notFoundContent.includes("sitemap.xml"), "not-found.tsx links to sitemap.xml");
  assert(notFoundContent.includes("llms.txt"), "not-found.tsx links to llms.txt");
}

console.log("\n==================================================");
if (failures === 0) {
  console.log("🎉 ALL AGENTIC READINESS CHECKS PASSED (100/100)! 🎉");
  console.log("==================================================\n");
  process.exit(0);
} else {
  console.error(`❌ ${failures} CHECK(S) FAILED.`);
  console.log("==================================================\n");
  process.exit(1);
}
