// Build the Android app (docs/android.md): the web part for Android (vite --mode android), Capacitor's copy of it into the
// Android project, and Gradle's APK. Uses Android Studio's JDK and the Android SDK where JAVA_HOME / ANDROID_HOME don't say
// otherwise. `npm run android:apk` at the repository root builds a debug APK; options (after `--`):
//   --release           a release APK, signed with the key --signing names (default: SVE-signing/keystore.properties
//                       beside the repository; the key never goes into it)
//   --signing <file>    that key's properties file (android/app/build.gradle says what it holds)
//   --public <folder>   build the resources of this folder into the app (like the phone's public/ folder; theirs go first)
//   --out <file>        copy the APK there
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const gui = join(dirname(fileURLToPath(import.meta.url)), "..");
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
const release = args.includes("--release");
const bundle = option("--public");
const out = option("--out");

const env = { ...process.env };
if (!env.JAVA_HOME) {
  const jdks = ["C:\\Program Files\\Android\\Android Studio\\jbr", "/Applications/Android Studio.app/Contents/jbr/Contents/Home", "/opt/android-studio/jbr"];
  env.JAVA_HOME = jdks.find((dir) => existsSync(dir));
}
if (!env.ANDROID_HOME && !env.ANDROID_SDK_ROOT) {
  const sdk = process.platform === "win32" ? join(env.LOCALAPPDATA ?? "", "Android", "Sdk") : join(env.HOME ?? "", process.platform === "darwin" ? "Library/Android/sdk" : "Android/Sdk");
  if (existsSync(sdk)) env.ANDROID_HOME = sdk;
}
if (!env.JAVA_HOME) {
  console.error("No JDK: install Android Studio, or set JAVA_HOME.");
  process.exit(1);
}
if (bundle) {
  if (!existsSync(bundle) || !statSync(bundle).isDirectory()) {
    console.error(`--public: no folder ${bundle}`);
    process.exit(1);
  }
  env.SVE_BUNDLE_PUBLIC = bundle;
} else delete env.SVE_BUNDLE_PUBLIC;
if (release) {
  const signing = option("--signing") ?? join(gui, "..", "..", "..", "SVE-signing", "keystore.properties");
  if (!existsSync(signing)) {
    console.error(`No signing key: ${signing} (docs/android.md, "发行版").`);
    process.exit(1);
  }
  env.SVE_ANDROID_SIGNING = signing;
}

function run(command, args, cwd) {
  // Windows runs npx and gradlew.bat through its shell: one command line (these arguments have no spaces).
  const result =
    process.platform === "win32"
      ? spawnSync([command.includes(" ") ? `"${command}"` : command, ...args].join(" "), { cwd, env, stdio: "inherit", shell: true })
      : spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["vite", "build", "--mode", "android"], gui);
run("npx", ["cap", "sync", "android"], gui);
run(join(gui, "android", process.platform === "win32" ? "gradlew.bat" : "gradlew"), [release ? "assembleRelease" : "assembleDebug"], join(gui, "android"));
const apk = join(gui, "android", "app", "build", "outputs", "apk", release ? "release" : "debug", release ? "app-release.apk" : "app-debug.apk");
if (out) copyFileSync(apk, out);
console.log(`\nAPK: ${out ?? apk} (${Math.round(statSync(apk).size / 2 ** 20)} MB)`);
