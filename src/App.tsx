import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { TRANSLATIONS } from "./translations";
import type { Language } from "./translations";
import "./App.css";

interface CursorSettings {
  color: string;
  size: number;
  shape: "circle" | "square" | "ring";
  ripple: boolean;
}

const DEFAULT_CURSOR_SETTINGS: CursorSettings = {
  color: "#3b82f6",
  size: 40,
  shape: "circle",
  ripple: true,
};

// Helper to determine the default browser language
const getBrowserLanguage = (): Language => {
  const code = navigator.language.split("-")[0].toLowerCase();
  if (["en", "tr", "az", "es", "sq"].includes(code)) {
    return code as Language;
  }
  return "en";
};

// --- KEYBOARD CLEANER VIEW ---
interface CleanerProps {
  t: (key: keyof typeof TRANSLATIONS["en"]) => string;
}

function Cleaner({ t }: CleanerProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressInterval = useRef<any>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isHoldingRef = useRef(false);

  useEffect(() => {
    // Try to force focus and native fullscreen on window load
    const win = getCurrentWindow();
    win.setFocus().catch(() => {});
    win.setFullscreen(true).catch(() => {});

    const resetProgress = () => {
      isHoldingRef.current = false;
      setIsHolding(false);
      setProgress(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept and prevent all default actions
      e.preventDefault();
      e.stopPropagation();

      // Ignore repeating key events to prevent performance lag
      if (e.repeat) {
        return;
      }

      // Track key states
      keysPressed.current[e.key] = true;
      
      const isCtrlPressed = e.ctrlKey || keysPressed.current["Control"];
      const isEscPressed = e.key === "Escape" || keysPressed.current["Escape"];

      if (isCtrlPressed && isEscPressed) {
        if (!isHoldingRef.current) {
          isHoldingRef.current = true;
          setIsHolding(true);
          const startTime = Date.now();
          const duration = 3000; // 3 seconds holding time

          progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const percentage = Math.min((elapsed / duration) * 100, 100);
            setProgress(percentage);

            if (percentage >= 100) {
              clearInterval(progressInterval.current);
              invoke("close_cleaner_window").catch(console.error);
            }
          }, 16);
        }
      } else {
        // If other keys are pressed, reset the progress
        if (e.key !== "Escape" && e.key !== "Control") {
          resetProgress();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      keysPressed.current[e.key] = false;
      
      // If either Control or Escape is released, reset progress
      const isCtrlPressed = e.ctrlKey || keysPressed.current["Control"];
      const isEscPressed = keysPressed.current["Escape"];

      if (!isCtrlPressed || !isEscPressed) {
        resetProgress();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Intercept all mouse clicks to prevent OS interaction
      e.preventDefault();
      e.stopPropagation();
    };

    // Global listeners for key and mouse events
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("mouseup", handleMouseDown, true);
    window.addEventListener("click", handleMouseDown, true);
    window.addEventListener("contextmenu", handleMouseDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("mouseup", handleMouseDown, true);
      window.removeEventListener("click", handleMouseDown, true);
      window.removeEventListener("contextmenu", handleMouseDown, true);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return (
    <div className="cleaner-container">
      {/* Glassmorphic Animated Background Blobs */}
      <div className="cleaner-bg-blob blob-1"></div>
      <div className="cleaner-bg-blob blob-2"></div>
      <div className="cleaner-bg-blob blob-3"></div>

      <div className="cleaner-content">
        {/* Animated Radial / Circular Progress */}
        <div className="progress-ring-wrapper">
          <svg className="progress-ring" width="120" height="120">
            {/* Background Circle */}
            <circle
              className="progress-ring-bg"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
            />
            {/* Glow Outer Circle */}
            {isHolding && (
              <circle
                className="progress-ring-glow-outer"
                stroke="rgba(52, 199, 89, 0.2)"
                strokeWidth="14"
                strokeDasharray="314.16"
                strokeDashoffset={314.16 - (314.16 * progress) / 100}
                strokeLinecap="round"
                fill="transparent"
                r="50"
                cx="60"
                cy="60"
              />
            )}
            {/* Glow Inner Circle */}
            {isHolding && (
              <circle
                className="progress-ring-glow-inner"
                stroke="rgba(52, 199, 89, 0.45)"
                strokeWidth="10"
                strokeDasharray="314.16"
                strokeDashoffset={314.16 - (314.16 * progress) / 100}
                strokeLinecap="round"
                fill="transparent"
                r="50"
                cx="60"
                cy="60"
              />
            )}
            {/* Progress Stroke */}
            <circle
              className="progress-ring-stroke"
              stroke="#34c759"
              strokeWidth="6"
              strokeDasharray="314.16"
              strokeDashoffset={314.16 - (314.16 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
            />
          </svg>

          {/* Central Status Icon */}
          <div className={`cleaner-status-icon ${isHolding ? "pulse" : ""}`}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1 className="cleaner-title">{t("cleanerScreenTitle")}</h1>
        <p className="cleaner-desc">{t("cleanerScreenDesc")}</p>

        <div className="cleaner-shortcut-badge">
          <span>{t("cleanerScreenBadge")}</span>
        </div>
      </div>
    </div>
  );
}


// --- CURSOR OVERLAY VIEW ---
function CursorOverlay() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [settings, setSettings] = useState<CursorSettings>(() => {
    const saved = localStorage.getItem("cursorSettings");
    return saved ? JSON.parse(saved) : DEFAULT_CURSOR_SETTINGS;
  });

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    let unlistenMove: (() => void) | null = null;
    let unlistenSettings: (() => void) | null = null;

    listen<{ x: number; y: number; clicked: boolean }>("cursor-move", (event) => {
      const { x, y, clicked } = event.payload;
      const currentSettings = settingsRef.current;

      // Direct DOM manipulation for performance (avoids React re-render per frame)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }

      if (clicked && currentSettings.ripple) {
        const id = Date.now() + Math.random();
        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
    }).then((fn) => {
      unlistenMove = fn;
    });

    listen<CursorSettings>("cursor-settings-changed", (event) => {
      setSettings(event.payload);
    }).then((fn) => {
      unlistenSettings = fn;
    });

    return () => {
      if (unlistenMove) unlistenMove();
      if (unlistenSettings) unlistenSettings();
    };
  }, []);

  const getRingStyle = () => {
    let borderRadius = "50%";
    if (settings.shape === "square") borderRadius = "8px";
    
    let background = "transparent";
    let border = "none";
    let boxShadow = "none";

    const hexToRgba = (hex: string, alpha: number) => {
      if (!hex.startsWith("#")) return hex; // Fallback
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const isRing = settings.shape === "ring";

    if (isRing) {
      border = `3px solid ${hexToRgba(settings.color, 0.7)}`;
      boxShadow = `0 0 10px 2px ${hexToRgba(settings.color, 0.4)}, inset 0 0 10px 2px ${hexToRgba(settings.color, 0.4)}`;
    } else {
      background = `radial-gradient(circle, ${hexToRgba(settings.color, 0.3)} 0%, ${hexToRgba(settings.color, 0.1)} 50%, transparent 70%)`;
      border = `2px solid ${hexToRgba(settings.color, 0.5)}`;
      boxShadow = `0 0 18px 4px ${hexToRgba(settings.color, 0.18)}`;
    }

    return {
      width: `${settings.size}px`,
      height: `${settings.size}px`,
      marginLeft: `-${settings.size / 2}px`,
      marginTop: `-${settings.size / 2}px`,
      borderRadius,
      background,
      border,
      boxShadow,
    };
  };

  const getRippleStyle = (x: number, y: number) => {
    let borderRadius = "50%";
    if (settings.shape === "square") borderRadius = "8px";
    
    let rStr = "59, 130, 246"; // default blue
    if (settings.color.startsWith("#")) {
      const r = parseInt(settings.color.slice(1, 3), 16);
      const g = parseInt(settings.color.slice(3, 5), 16);
      const b = parseInt(settings.color.slice(5, 7), 16);
      rStr = `${r}, ${g}, ${b}`;
    }

    return {
      left: x,
      top: y,
      borderRadius,
      "--ripple-color": rStr,
    } as React.CSSProperties;
  };

  return (
    <div className="cursor-overlay-container">
      <div ref={ringRef} className="cursor-highlight-ring" style={getRingStyle()} />
      {ripples.map((r) => (
        <div
          key={r.id}
          className="cursor-click-ripple"
          style={getRippleStyle(r.x, r.y)}
        />
      ))}
    </div>
  );
}

// --- MAIN CONTROL PANEL VIEW ---
interface MainPanelProps {
  t: (key: keyof typeof TRANSLATIONS["en"]) => string;
  lang: Language;
  changeLanguage: (newLang: Language) => void;
}

function MainPanel({ t, lang, changeLanguage }: MainPanelProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [caffeine, setCaffeine] = useState(false);
  const [desktopIcons, setDesktopIcons] = useState(true);
  const [mute, setMute] = useState(false);
  const [cursorHighlight, setCursorHighlight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [showAbout, setShowAbout] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "available" | "downloading" | "uptodate" | "error">("idle");
  const [newVersion, setNewVersion] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [showCursorSettings, setShowCursorSettings] = useState(false);
  const [cursorSettings, setCursorSettings] = useState<CursorSettings>(() => {
    const saved = localStorage.getItem("cursorSettings");
    return saved ? JSON.parse(saved) : DEFAULT_CURSOR_SETTINGS;
  });

  const updateCursorSetting = (key: keyof CursorSettings, value: any) => {
    const newSettings = { ...cursorSettings, [key]: value };
    setCursorSettings(newSettings);
    localStorage.setItem("cursorSettings", JSON.stringify(newSettings));
    emit("cursor-settings-changed", newSettings);
  };

  const handleCheckUpdates = async () => {
    setUpdateStatus("checking");
    setErrorMessage("");
    try {
      const update = await check();
      if (update) {
        setNewVersion(update.version);
        setUpdateStatus("available");
      } else {
        setUpdateStatus("uptodate");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || String(err));
      setUpdateStatus("error");
    }
  };

  const handleInstallUpdate = async () => {
    setUpdateStatus("downloading");
    setDownloadProgress(0);
    try {
      const update = await check();
      if (update) {
        let downloaded = 0;
        let total = 0;
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              total = event.data.contentLength || 0;
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              if (total > 0) {
                setDownloadProgress(Math.min((downloaded / total) * 100, 100));
              }
              break;
            case "Finished":
              break;
          }
        });
        await relaunch();
      } else {
        setUpdateStatus("uptodate");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || String(err));
      setUpdateStatus("error");
    }
  };

  useEffect(() => {
    async function fetchStates() {
      try {
        const [dm, caf, dt, mt, ch] = await Promise.all([
          invoke<boolean>("get_dark_mode"),
          invoke<boolean>("get_caffeine"),
          invoke<boolean>("get_desktop_icons"),
          invoke<boolean>("get_mute"),
          invoke<boolean>("get_cursor_highlight"),
        ]);
        setDarkMode(dm);
        setCaffeine(caf);
        setDesktopIcons(dt);
        setMute(mt);
        setCursorHighlight(ch);

      } catch (err) {
        console.error("Failed to load initial macOS states:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStates();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const handleDarkModeToggle = async () => {
    try {
      const target = !darkMode;
      await invoke("set_dark_mode", { dark: target });
      setDarkMode(target);
      showToast(target ? t("toastDarkModeOn") : t("toastDarkModeOff"));
    } catch (err) {
      console.error(err);
      showToast(t("toastDarkModeFail"));
    }
  };

  const handleCaffeineToggle = async () => {
    try {
      const target = !caffeine;
      await invoke("set_caffeine", { active: target });
      setCaffeine(target);
      showToast(target ? t("toastCaffeineOn") : t("toastCaffeineOff"));
    } catch (err) {
      console.error(err);
      showToast(t("toastCaffeineFail"));
    }
  };

  const handleDesktopIconsToggle = async () => {
    try {
      const target = !desktopIcons;
      await invoke("set_desktop_icons", { show: target });
      setDesktopIcons(target);
      showToast(target ? t("toastDesktopOn") : t("toastDesktopOff"));
    } catch (err) {
      console.error(err);
      showToast(t("toastDesktopFail"));
    }
  };

  const handleMuteToggle = async () => {
    try {
      const target = !mute;
      await invoke("set_mute", { mute: target });
      setMute(target);
      showToast(target ? t("toastMuteOn") : t("toastMuteOff"));
    } catch (err) {
      console.error(err);
      showToast(t("toastMuteFail"));
    }
  };

  const handleCursorHighlightToggle = async () => {
    try {
      const target = !cursorHighlight;
      await invoke("toggle_cursor_highlight", { active: target });
      setCursorHighlight(target);
      showToast(target ? t("toastCursorHighlightOn") : t("toastCursorHighlightOff"));
    } catch (err) {
      console.error(err);
      showToast(t("toastCursorHighlightFail"));
    }
  };

  const handleStartScreensaver = async () => {
    try {
      await invoke("start_screensaver");
      showToast(t("toastScreensaverStart"));
    } catch (err) {
      console.error(err);
      showToast(t("toastScreensaverFail"));
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await invoke("empty_trash");
      showToast(t("toastTrashEmpty"));
    } catch (err) {
      console.error(err);
      showToast(t("toastTrashFail"));
    }
  };

  const handleOpenCleaner = async () => {
    try {
      await invoke("open_cleaner_window");
      // Hide the main dropdown menu when opening the cleaner fullscreen overlay
      getCurrentWindow().hide();
    } catch (err) {
      console.error(err);
      showToast(t("toastCleanerFail"));
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && <div className="toast-notification">{toast}</div>}

      {/* About Modal */}
      {showAbout && (
        <div className="about-overlay">
          <div className="about-modal">
            <div className="about-header">
              <div className="about-logo-container">
                <img src="/modus_logo.svg" alt="Modus Logo" className="about-logo-img" />
              </div>
              <h2 className="about-title">{t("appTitle")}</h2>
              <span className="about-subtitle">{t("appSubtitle")}</span>
            </div>

            <div className="about-divider"></div>

            <div className="about-body">
              <div className="info-row">
                <span className="info-label">{t("developer")}</span>
                <span className="info-val">Yiğit Efe Avcı</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t("github")}</span>
                <a href="https://github.com/yigit433/modus" target="_blank" rel="noopener noreferrer" className="info-val link">yigit433/modus</a>
              </div>
              <div className="info-row">
                <span className="info-label">{t("version")}</span>
                <span className="info-val">v0.1.0</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t("selectLanguage")}</span>
                <select 
                  className="language-select" 
                  value={lang} 
                  onChange={(e) => changeLanguage(e.target.value as Language)}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="az">Azərbaycanca</option>
                  <option value="es">Español</option>
                  <option value="sq">Shqip</option>
                </select>
              </div>
              
              <div className="about-updater-section">
                {updateStatus === "idle" && (
                  <button className="updater-btn" onClick={handleCheckUpdates}>{t("checkUpdates")}</button>
                )}
                {updateStatus === "checking" && (
                  <div className="updater-status">
                    <div className="spinner-small"></div>
                    <span>{t("checkingUpdates")}</span>
                  </div>
                )}
                {updateStatus === "uptodate" && (
                  <div className="updater-status success">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t("upToDate")}</span>
                  </div>
                )}
                {updateStatus === "available" && (
                  <div className="updater-available-wrapper" style={{ width: "100%" }}>
                    <div className="updater-new-ver" style={{ fontSize: "11px", marginBottom: "6px", textAlign: "center" }}>{t("updateAvailable")} <b>v{newVersion}</b></div>
                    <button className="updater-btn install" onClick={handleInstallUpdate}>{t("downloadInstall")}</button>
                  </div>
                )}
                {updateStatus === "downloading" && (
                  <div className="updater-download-wrapper">
                    <span>{t("downloadingUpdate")} ({Math.round(downloadProgress)}%)</span>
                    <div className="updater-progress-bar">
                      <div className="updater-progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {updateStatus === "error" && (
                  <div className="updater-status error">
                    <span style={{ display: "block", textAlign: "center" }}>
                      {t("updateError")} {errorMessage && <span style={{ fontSize: "9px", opacity: 0.8, display: "block" }}>{errorMessage}</span>}
                    </span>
                    <button className="updater-btn-retry" onClick={handleCheckUpdates}>{t("retry")}</button>
                  </div>
                )}
              </div>
            </div>

            <button className="about-close-btn" onClick={() => { setShowAbout(false); setUpdateStatus("idle"); }}>{t("close")}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="header-titles">
            <span className="app-title">{t("appTitle")}</span>
            <span className="app-subtitle">{t("appSubtitle")}</span>
          </div>
          <button className="info-btn" onClick={() => setShowAbout(true)} aria-label="About App">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </header>

      {/* Control Elements List */}
      <div className="controls-list">
        {/* Dark Mode */}
        <div className="control-card">
          <div className="control-info">
            <div className={`control-icon icon-dark-mode ${darkMode ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {darkMode ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </>
                )}
              </svg>
            </div>
            <div className="control-text">
              <span className="control-title">{t("darkModeTitle")}</span>
              <span className="control-desc">{t("darkModeDesc")}</span>
            </div>
          </div>
          <button className={`toggle-switch ${darkMode ? "active" : ""}`} onClick={handleDarkModeToggle} aria-label="Toggle Dark Mode">
            <span className="toggle-handle"></span>
          </button>
        </div>

        {/* Caffeine */}
        <div className="control-card">
          <div className="control-info">
            <div className={`control-icon icon-caffeine ${caffeine ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <div className="control-text">
              <span className="control-title">{t("caffeineTitle")}</span>
              <span className="control-desc">{t("caffeineDesc")}</span>
            </div>
          </div>
          <button className={`toggle-switch ${caffeine ? "active" : ""}`} onClick={handleCaffeineToggle} aria-label="Toggle Caffeine">
            <span className="toggle-handle"></span>
          </button>
        </div>

        {/* Hide Desktop Icons */}
        <div className="control-card">
          <div className="control-info">
            <div className={`control-icon icon-desktop ${!desktopIcons ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                {!desktopIcons && <line x1="2" y1="2" x2="22" y2="22" strokeWidth="3" />}
              </svg>
            </div>
            <div className="control-text">
              <span className="control-title">{t("desktopTitle")}</span>
              <span className="control-desc">{t("desktopDesc")}</span>
            </div>
          </div>
          <button className={`toggle-switch ${!desktopIcons ? "active" : ""}`} onClick={handleDesktopIconsToggle} aria-label="Toggle Desktop Icons">
            <span className="toggle-handle"></span>
          </button>
        </div>

        {/* Mute Audio */}
        <div className="control-card">
          <div className="control-info">
            <div className={`control-icon icon-mute ${mute ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {mute ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </>
                )}
              </svg>
            </div>
            <div className="control-text">
              <span className="control-title">{t("muteTitle")}</span>
              <span className="control-desc">{t("muteDesc")}</span>
            </div>
          </div>
          <button className={`toggle-switch ${mute ? "active" : ""}`} onClick={handleMuteToggle} aria-label="Toggle Mute Status">
            <span className="toggle-handle"></span>
          </button>
        </div>

        {/* Cursor Highlight */}
        <div className={`control-card ${showCursorSettings ? "expanded" : ""}`}>
          <div className="control-info" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className={`control-icon icon-cursor-highlight ${cursorHighlight ? "active" : ""}`}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" opacity="0.4" />
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                </svg>
              </div>
              <div className="control-text">
                <span className="control-title">{t("cursorHighlightTitle")}</span>
                <span className="control-desc">{t("cursorHighlightDesc")}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                className={`gear-btn ${showCursorSettings ? "active" : ""}`}
                onClick={() => setShowCursorSettings(!showCursorSettings)}
                aria-label="Cursor Settings"
                title="Ayarlar"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button className={`toggle-switch ${cursorHighlight ? "active" : ""}`} onClick={handleCursorHighlightToggle} aria-label="Toggle Cursor Highlight">
                <span className="toggle-handle"></span>
              </button>
            </div>
          </div>
          
          {showCursorSettings && (
            <div className="cursor-settings-panel">
              <div className="setting-row">
                <span className="setting-label">Renk</span>
                <div className="color-picker-group">
                  {["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7"].map((color) => (
                    <button 
                      key={color} 
                      className={`color-swatch ${cursorSettings.color === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateCursorSetting("color", color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="setting-row">
                <span className="setting-label">Boyut</span>
                <input 
                  type="range" 
                  min="20" max="150" 
                  value={cursorSettings.size} 
                  onChange={(e) => updateCursorSetting("size", parseInt(e.target.value))}
                  className="size-slider"
                />
              </div>

              <div className="setting-row">
                <span className="setting-label">Şekil</span>
                <div className="shape-picker-group">
                  <button className={`shape-btn ${cursorSettings.shape === "circle" ? "active" : ""}`} onClick={() => updateCursorSetting("shape", "circle")}>Daire</button>
                  <button className={`shape-btn ${cursorSettings.shape === "ring" ? "active" : ""}`} onClick={() => updateCursorSetting("shape", "ring")}>Halka</button>
                  <button className={`shape-btn ${cursorSettings.shape === "square" ? "active" : ""}`} onClick={() => updateCursorSetting("shape", "square")}>Kare</button>
                </div>
              </div>

              <div className="setting-row">
                <span className="setting-label">Tıklama Efekti</span>
                <button className={`toggle-switch small ${cursorSettings.ripple ? "active" : ""}`} onClick={() => updateCursorSetting("ripple", !cursorSettings.ripple)}>
                  <span className="toggle-handle"></span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prominent Keyboard Cleaner Feature Block */}
        <div className="cleaner-launcher-card" onClick={handleOpenCleaner}>
          <div className="cleaner-launcher-info">
            <div className="cleaner-launcher-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                <line x1="6" y1="8" x2="6.01" y2="8" />
                <line x1="10" y1="8" x2="10.01" y2="8" />
                <line x1="14" y1="8" x2="14.01" y2="8" />
                <line x1="18" y1="8" x2="18.01" y2="8" />
                <line x1="6" y1="12" x2="6.01" y2="12" />
                <line x1="10" y1="12" x2="10.01" y2="12" />
                <line x1="14" y1="12" x2="14.01" y2="12" />
                <line x1="18" y1="12" x2="18.01" y2="12" />
                <line x1="7" y1="16" x2="17" y2="16" />
              </svg>
            </div>
            <div className="control-text">
              <span className="control-title">{t("cleanerTitle")}</span>
              <span className="control-desc">{t("cleanerDesc")}</span>
            </div>
          </div>
          <div className="cleaner-launcher-arrow">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="action-buttons-container">
          {/* Start Screen Saver */}
          <button className="action-btn" onClick={handleStartScreensaver}>
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <path d="M6 8l4 4-4 4" />
                <path d="M12 12h6" />
              </svg>
            </div>
            <span className="action-btn-text">{t("screensaver")}</span>
          </button>

          {/* Empty Trash */}
          <button className="action-btn" onClick={handleEmptyTrash}>
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10.01" y2="11" />
                <line x1="14" y1="11" x2="14.01" y2="11" />
              </svg>
            </div>
            <span className="action-btn-text">{t("emptyTrash")}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <span>v0.1.0 • {t("openSource")}</span>
        <button className="quit-btn" onClick={() => invoke("quit_app")} title={t("quitApp")}>
          {t("quitApp")}
        </button>
      </footer>
    </div>
  );
}

// --- MASTER ROUTER ---
function App() {
  const [windowLabel, setWindowLabel] = useState("");
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("modus-language");
    if (saved && ["en", "tr", "az", "es", "sq"].includes(saved)) {
      return saved as Language;
    }
    return getBrowserLanguage();
  });

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("modus-language", newLang);
  };

  const t = (key: keyof typeof TRANSLATIONS["en"]): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS["en"][key] || "";
  };

  useEffect(() => {
    // Detect which window context we are in (label is a string property in Tauri v2)
    setWindowLabel(getCurrentWindow().label);
  }, []);

  if (windowLabel === "cleaner") {
    return <Cleaner t={t} />;
  }

  if (windowLabel === "cursor_overlay") {
    return <CursorOverlay />;
  }



  return <MainPanel t={t} lang={lang} changeLanguage={changeLanguage} />;
}

export default App;

