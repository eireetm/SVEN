// Build the Android app (docs/android.md): the web part for Android (vite --mode android), Capacitor's copy of it into the
// Android project, and Gradle's debug APK. Uses Android Studio's JDK and the Android SDK where JAVA_HOME / ANDROID_HOME
// don't say otherwise. `npm run android:apk` at the repository root.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const gui = join(dirname(fileURLToPath(import.meta.url)), "..");
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
run(join(gui, "android", process.platform === "win32" ? "gradlew.bat" : "gradlew"), ["assembleDebug"], join(gui, "android"));
console.log(`\nAPK: ${join(gui, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")}`);
