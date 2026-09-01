import { useEffect, useState } from "react";

// Shows an "Install App" button when the browser supports the native
// install prompt (Chrome/Edge on Android & Desktop). On iOS Safari this
// API doesn't exist, so the button simply won't appear there — users on
// iOS install via Share > "Add to Home Screen" instead.
//
// Note on Chrome behavior: once Chrome has shown the install prompt once,
// it uses its own internal "engagement" heuristics to decide when to fire
// `beforeinstallprompt` again (e.g. after an uninstall). This is controlled
// by Chrome itself, not by this app — when the event doesn't fire, this
// button simply won't appear, but Chrome still offers its own install
// icon in the address bar (the little monitor/plus icon next to the
// bookmark star) as a fallback. Both are legitimate ways to install.
export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // If the app is already running as an installed PWA, never show the button.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true; // iOS Safari standalone flag
    if (isStandalone) setInstalled(true);

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt || installed) return null;

  async function handleInstallClick() {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg transition z-50"
    >
      📲 Install Aplikasi
    </button>
  );
}
