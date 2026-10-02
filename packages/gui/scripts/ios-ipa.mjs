// Build the iOS app as an IPA: the web part for iOS (vite --mode ios), Capacitor's copy of it into the Xcode project (ios/),
// and Xcode's build of the app, packed into an IPA (Payload/App.app in a zip). The IPA isn't signed: a person installs it
// with a tool that signs it with their own Apple ID (AltStore, Sideloadly ...). Xcode runs only on a Mac: elsewhere this
// stops after the web part and the copy (the GitHub workflow .github/workflows/ios-ipa.yml builds it on a Mac). The version
// is packages/gui/package.json's. `npm run ios:ipa` at the repository root; options (after `--`):
//   --public <folder>   build the resources of this folder into the app (like the device's public/ folder; theirs go first)
//   --out <file>        where the IPA goes (default: SVEN-<version>-ios.ipa beside the repository)
// What the Xcode project sets (ios/App/App/Info.plist, AppDelegate.swift, project.pbxproj): played sideways on the whole
// screen without the status bar (an iPad too, no split view); the app's folder shows in the Files app (the player's own
// resources go there); the screen stays on; iOS 16.4 or later (the web view's CompressionStream "deflate-raw", module workers).
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const gui = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(join(gui, "package.json"), "utf8")).version;
const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  if (at < 0) return null;
  const value = args[at + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${name} needs a value.`);
    process.exit(1);
  }
  return resolve(value);
};
const bundle = option("--public");
const out = option("--out") ?? join(gui, "..", "..", "..", `SVEN-${version}-ios.ipa`);

// The build number: as Android's versionCode (0.2.1 -> 201), growing with each version.
const [major = 0, minor = 0, patch = 0] = version.split(".").map((n) => Number.parseInt(n, 10) || 0);
const build = String(major * 10000 + minor * 100 + patch);

// Capacitor copies the iOS web part (capacitor.config.ts: SVE_APP=ios -> dist-ios).
const env = { ...process.env, SVE_APP: "ios" };
if (bundle) {
  if (!existsSync(bundle) || !statSync(bundle).isDirectory()) {
    console.error(`--public: no folder ${bundle}`);
    process.exit(1);
  }
  env.SVE_BUNDLE_PUBLIC = bundle;
} else delete env.SVE_BUNDLE_PUBLIC;

function run(command, args, cwd) {
  // Windows runs npx through its shell: one command line (these arguments have no spaces).
  const result =
    process.platform === "win32"
      ? spawnSync([command, ...args].join(" "), { cwd, env, stdio: "inherit", shell: true })
      : spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["vite", "build", "--mode", "ios"], gui);
run("npx", ["cap", "sync", "ios"], gui);

if (process.platform !== "darwin") {
  console.error(
    "The web part is built and copied into packages/gui/ios. Xcode builds the app only on a Mac: run this there, or the " +
      'GitHub workflow "iOS IPA" (.github/workflows/ios-ipa.yml), whose run keeps the IPA as its artifact.',
  );
  process.exit(1);
}

// Xcode: the app for devices, unsigned (Release, arm64). The Swift packages (Capacitor and its plugins) are fetched here.
const derived = join(gui, "ios", "App", "build");
run(
  "xcodebuild",
  [
    "-project",
    join(gui, "ios", "App", "App.xcodeproj"),
    "-scheme",
    "App",
    "-configuration",
    "Release",
    "-sdk",
    "iphoneos",
    "-destination",
    "generic/platform=iOS",
    "-derivedDataPath",
    derived,
    `MARKETING_VERSION=${version}`,
    `CURRENT_PROJECT_VERSION=${build}`,
    "CODE_SIGNING_ALLOWED=NO",
    "CODE_SIGNING_REQUIRED=NO",
    "CODE_SIGN_IDENTITY=",
    "build",
  ],
  gui,
);
const app = join(derived, "Build", "Products", "Release-iphoneos", "App.app");
if (!existsSync(app)) {
  console.error(`Xcode made no app: ${app}`);
  process.exit(1);
}

// An IPA is a zip with the app in Payload/.
const work = mkdtempSync(join(tmpdir(), "sve-ipa-"));
mkdirSync(join(work, "Payload"));
cpSync(app, join(work, "Payload", "App.app"), { recursive: true, verbatimSymlinks: true });
rmSync(out, { force: true });
mkdirSync(dirname(out), { recursive: true });
run("zip", ["-qry", out, "Payload"], work);
rmSync(work, { recursive: true, force: true });
console.log(`Shadowverse: Evolve NEXT ${version} (iOS, build ${build}, unsigned) -> ${out}`);
