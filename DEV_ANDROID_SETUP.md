Android development checklist for running the Capacitor app against local Next.js dev server

1) Choose how the emulator/device will reach your dev server
- Recommended for Android Studio AVD (emulator): use 10.0.2.2
- For Genymotion emulator: 10.0.3.2
- For a physical device on the same Wi‑Fi LAN: use your machine IP (e.g. http://192.168.1.163:3000)

2) Optional: set DEV_SERVER_URL environment variable (preferred for physical devices)
- PowerShell example (temporary):
  $env:DEV_SERVER_URL = 'http://192.168.1.163:3000'
- Or set in your OS environment variables / .env file if your workflow supports it.

3) Start Next.js dev server (make sure it listens on all interfaces for emulator/device testing)
- From project root:
  npx next dev --hostname 0.0.0.0

4) Allow port 3000 in Windows Firewall (temporary while developing)
- PowerShell (run as Administrator):
  New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

5) Sync and open Android project
- From project root:
  npx cap sync android
  npx cap open android

6) Run app in Android Studio
- Wait for Gradle sync and indexing
- Create/open an AVD (or connect your device via USB)
- Run the app (green ▶ button)

7) If the WebView shows a network error, debug steps
- Open emulator browser and try:
  http://10.0.2.2:3000  (AVD)
  http://10.0.3.2:3000  (Genymotion)
  http://<your-pc-ip>:3000  (physical device)
- Use adb reverse for a USB device:
  adb devices
  adb reverse tcp:3000 tcp:3000

8) Useful commands
- Check whether port 3000 is reachable locally:
  curl http://localhost:3000
- Check adb path (Windows):
  where adb
  (or check Android SDK: %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe)

9) If Next prints allowedDevOrigins warnings
- Add the origin shown in the warning to `next.config.mjs` -> `allowedDevOrigins` and restart Next.

10) If nothing works, attach these logs:
- `adb logcat` (filter for WebView/ERR_CONNECTION)
- Next.js terminal output (any blocked origin or asset errors)
- The exact URL shown in the emulator WebView error page

If you want, I can also add a package.json dev script that sets DEV_SERVER_URL automatically for a given mode (e.g., `npm run dev:emu`). Let me know which mode(s) you use (AVD / Genymotion / physical) and I'll add the script.