import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [caffeine, setCaffeine] = useState(false);
  const [desktopIcons, setDesktopIcons] = useState(true);
  const [mute, setMute] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Fetch initial states from macOS backend
  useEffect(() => {
    async function fetchStates() {
      try {
        const [dm, caf, dt, mt] = await Promise.all([
          invoke<boolean>("get_dark_mode"),
          invoke<boolean>("get_caffeine"),
          invoke<boolean>("get_desktop_icons"),
          invoke<boolean>("get_mute"),
        ]);
        setDarkMode(dm);
        setCaffeine(caf);
        setDesktopIcons(dt);
        setMute(mt);
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
      showToast(target ? "Karanlık Mod Etkinleştirildi" : "Aydınlık Mod Etkinleştirildi");
    } catch (err) {
      console.error(err);
      showToast("Karanlık mod değiştirilemedi");
    }
  };

  const handleCaffeineToggle = async () => {
    try {
      const target = !caffeine;
      await invoke("set_caffeine", { active: target });
      setCaffeine(target);
      showToast(target ? "Ekran Uyanık Tutuluyor" : "Uyanık Tutma Kapatıldı");
    } catch (err) {
      console.error(err);
      showToast("Uyanık tutma ayarı değiştirilemedi");
    }
  };

  const handleDesktopIconsToggle = async () => {
    try {
      const target = !desktopIcons;
      await invoke("set_desktop_icons", { show: target });
      setDesktopIcons(target);
      showToast(target ? "Masaüstü Simgeleri Gösteriliyor" : "Masaüstü Simgeleri Gizlendi");
    } catch (err) {
      console.error(err);
      showToast("Masaüstü simgeleri değiştirilemedi");
    }
  };

  const handleMuteToggle = async () => {
    try {
      const target = !mute;
      await invoke("set_mute", { mute: target });
      setMute(target);
      showToast(target ? "Sistem Sesi Kısıldı" : "Sistem Sesi Açıldı");
    } catch (err) {
      console.error(err);
      showToast("Ses durumu değiştirilemedi");
    }
  };

  const handleStartScreensaver = async () => {
    try {
      await invoke("start_screensaver");
      showToast("Ekran Koruyucu Başlatılıyor...");
    } catch (err) {
      console.error(err);
      showToast("Ekran koruyucu başlatılamadı");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await invoke("empty_trash");
      showToast("Çöp Sepeti Boşaltıldı");
    } catch (err) {
      console.error(err);
      showToast("Çöp sepeti boşaltılamadı");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>macOS sistem durumu alınıyor...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && <div className="toast-notification">{toast}</div>}

      {/* Header */}
      <header className="app-header">
        <span className="app-title">Modus</span>
        <span className="app-subtitle">macOS Hızlı Erişim</span>
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
              <span className="control-title">Karanlık Mod</span>
              <span className="control-desc">Sistem görünümünü değiştirin</span>
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
              <span className="control-title">Uyanık Kal</span>
              <span className="control-desc">Ekranın kapanmasını engelle</span>
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
              <span className="control-title">Masaüstü Simgeleri</span>
              <span className="control-desc">Simge görünürlüğünü yönetin</span>
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
              <span className="control-title">Sesi Sustur</span>
              <span className="control-desc">Tüm sistem sesini kapatın</span>
            </div>
          </div>
          <button className={`toggle-switch ${mute ? "active" : ""}`} onClick={handleMuteToggle} aria-label="Toggle Mute Status">
            <span className="toggle-handle"></span>
          </button>
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
            <span className="action-btn-text">Ekran Koruyucu</span>
          </button>

          {/* Empty Trash */}
          <button className="action-btn" onClick={handleEmptyTrash}>
            <div className="action-btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <span className="action-btn-text">Çöpü Boşalt</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <span>v0.1.0 • Açık Kaynak</span>
      </footer>
    </div>
  );
}

export default App;
