export type Language = "en" | "tr" | "az" | "es" | "sq";

export const TRANSLATIONS = {
  en: {
    appTitle: "Modus",
    appSubtitle: "macOS Quick Access",
    loading: "Retrieving macOS system status...",
    
    // Toggles
    darkModeTitle: "Dark Mode",
    darkModeDesc: "Toggle system appearance",
    caffeineTitle: "Keep Awake",
    caffeineDesc: "Prevent screen from sleeping",
    desktopTitle: "Desktop Icons",
    desktopDesc: "Toggle icon visibility",
    muteTitle: "Mute Sound",
    muteDesc: "Mute all system audio",
    // Cleaner Card
    cleanerTitle: "Keyboard & Trackpad Cleaner",
    cleanerDesc: "Lock display, keyboard and mouse",
    
    // Action Buttons
    screensaver: "Screen Saver",
    emptyTrash: "Empty Trash",
    
    // Cleaner Screen
    cleanerScreenTitle: "Keyboard & Trackpad Locked",
    cleanerScreenDesc: "You can safely clean your device. All keys and clicks are disabled.",
    cleanerScreenBadge: "Hold Control + ESC for 3 seconds to exit",
    
    // Toast Messages
    toastDarkModeOn: "Dark Mode Enabled",
    toastDarkModeOff: "Light Mode Enabled",
    toastCaffeineOn: "Display Kept Awake",
    toastCaffeineOff: "Keep Awake Disabled",
    toastDesktopOn: "Desktop Icons Visible",
    toastDesktopOff: "Desktop Icons Hidden",
    toastMuteOn: "System Audio Muted",
    toastMuteOff: "System Audio Enabled",
    toastScreensaverStart: "Starting Screen Saver...",
    toastScreensaverFail: "Could not start screen saver",
    toastTrashEmpty: "Trash Emptied",
    toastTrashFail: "Could not empty trash",
    toastCleanerFail: "Could not start cleaner mode",
    toastDarkModeFail: "Could not change dark mode",
    toastCaffeineFail: "Could not change keep awake setting",
    toastDesktopFail: "Could not change desktop icons visibility",
    toastMuteFail: "Could not change audio status",
    
    // About Panel
    developer: "Developer",
    github: "GitHub",
    version: "Version",
    close: "Close",
    selectLanguage: "Language",
    openSource: "Open Source",
    quitApp: "Quit Modus",
    
    // Auto-updater
    checkUpdates: "Check for Updates",
    checkingUpdates: "Checking for updates...",
    upToDate: "Your app is at the latest version.",
    updateAvailable: "New version available:",
    downloadInstall: "Download & Install",
    downloadingUpdate: "Downloading update...",
    updateError: "Could not check for updates.",
    retry: "Retry"
  },
  tr: {
    appTitle: "Modus",
    appSubtitle: "macOS Hızlı Erişim",
    loading: "macOS sistem durumu alınıyor...",
    
    // Toggles
    darkModeTitle: "Karanlık Mod",
    darkModeDesc: "Sistem görünümünü değiştirin",
    caffeineTitle: "Uyanık Kal",
    caffeineDesc: "Ekranın kapanmasını engelle",
    desktopTitle: "Masaüstü Simgeleri",
    desktopDesc: "Simge görünürlüğünü yönetin",
    muteTitle: "Sesi Sustur",
    muteDesc: "Tüm sistem sesini kapatın",
    // Cleaner Card
    cleanerTitle: "Klavye & Trackpad Temizliği",
    cleanerDesc: "Ekranı, klavyeyi ve fareyi kilitleyin",
    
    // Action Buttons
    screensaver: "Ekran Koruyucu",
    emptyTrash: "Çöpü Boşalt",
    
    // Cleaner Screen
    cleanerScreenTitle: "Klavye ve Trackpad Kilitli",
    cleanerScreenDesc: "Cihazınızı güvenle temizleyebilirsiniz. Tüm tuşlar ve tıklamalar devre dışı bırakılmıştır.",
    cleanerScreenBadge: "Çıkmak için Control + ESC tuşlarını 3 saniye basılı tutun",
    
    // Toast Messages
    toastDarkModeOn: "Karanlık Mod Etkinleştirildi",
    toastDarkModeOff: "Aydınlık Mod Etkinleştirildi",
    toastCaffeineOn: "Ekran Uyanık Tutuluyor",
    toastCaffeineOff: "Uyanık Tutma Kapatıldı",
    toastDesktopOn: "Masaüstü Simgeleri Gösteriliyor",
    toastDesktopOff: "Masaüstü Simgeleri Gizlendi",
    toastMuteOn: "Sistem Sesi Kısıldı",
    toastMuteOff: "Sistem Sesi Açıldı",
    toastScreensaverStart: "Ekran Koruyucu Başlatılıyor...",
    toastScreensaverFail: "Ekran koruyucu başlatılamadı",
    toastTrashEmpty: "Çöp Sepeti Boşaltıldı",
    toastTrashFail: "Çöp sepeti boşaltılamadı",
    toastCleanerFail: "Temizlik modu başlatılamadı",
    toastDarkModeFail: "Karanlık mod değiştirilemedi",
    toastCaffeineFail: "Uyanık tutma ayarı değiştirilemedi",
    toastDesktopFail: "Masaüstü simgeleri değiştirilemedi",
    toastMuteFail: "Ses durumu değiştirilemedi",
    
    // About Panel
    developer: "Geliştirici",
    github: "GitHub",
    version: "Sürüm",
    close: "Kapat",
    selectLanguage: "Dil",
    openSource: "Açık Kaynak",
    quitApp: "Modus'tan Çık",
    
    // Auto-updater
    checkUpdates: "Güncellemeleri Denetle",
    checkingUpdates: "Güncellemeler denetleniyor...",
    upToDate: "Uygulamanız en güncel sürümde.",
    updateAvailable: "Yeni sürüm mevcut:",
    downloadInstall: "İndir ve Yükle",
    downloadingUpdate: "Güncelleme indiriliyor...",
    updateError: "Güncelleme denetlenemedi.",
    retry: "Tekrar Dene"
  },
  az: {
    appTitle: "Modus",
    appSubtitle: "macOS Sürətli Giriş",
    loading: "macOS sistem vəziyyəti alınır...",
    
    // Toggles
    darkModeTitle: "Qaranlıq Rejim",
    darkModeDesc: "Sistem görünüşünü dəyişin",
    caffeineTitle: "Oyaq Qal",
    caffeineDesc: "Ekranın sönməsinin qarşısını al",
    desktopTitle: "Masaüstü Nişanları",
    desktopDesc: "Nişanların görünməsini idarə edin",
    muteTitle: "Səsi Səssiz Et",
    muteDesc: "Bütün sistem səsini söndürün",
    // Cleaner Card
    cleanerTitle: "Klaviatura və Trekpad Təmizliyi",
    cleanerDesc: "Ekranı, klaviatura və siçanı kilidləyin",
    
    // Action Buttons
    screensaver: "Ekran Qoruyucusu",
    emptyTrash: "Zibili Boşalt",
    
    // Cleaner Screen
    cleanerScreenTitle: "Klaviatura və Trekpad Kilidlidir",
    cleanerScreenDesc: "Cihazınızı təhlükəsiz təmizləyə bilərsiniz. Bütün düymələr və kliklər söndürülüb.",
    cleanerScreenBadge: "Çıxmaq üçün Control + ESC düymələrini 3 saniyə basıb saxlayın",
    
    // Toast Messages
    toastDarkModeOn: "Qaranlıq Rejim Aktiv Edildi",
    toastDarkModeOff: "Aydınlıq Rejim Aktiv Edildi",
    toastCaffeineOn: "Ekran Oyaq Saxlanılır",
    toastCaffeineOff: "Oyaq Saxlama Söndürüldü",
    toastDesktopOn: "Masaüstü Nişanları Göstərilir",
    toastDesktopOff: "Masaüstü Nişanları Gizlədildi",
    toastMuteOn: "Sistem Səsi Səssizə Alındı",
    toastMuteOff: "Sistem Səsi Açıldı",
    toastScreensaverStart: "Ekran Qoruyucusu Başladılır...",
    toastScreensaverFail: "Ekran qoruyucusu başladılmadı",
    toastTrashEmpty: "Zibil Qutusu Boşaldıldı",
    toastTrashFail: "Zibil qutusu boşaldılmadı",
    toastCleanerFail: "Təmizlik rejimi başladılmadı",
    toastDarkModeFail: "Qaranlıq rejim dəyişdirilə bilmədi",
    toastCaffeineFail: "Oyaq saxlama ayarı dəyişdirilə bilmədi",
    toastDesktopFail: "Masaüstü nişanlarının görünməsi dəyişdirilə bilmədi",
    toastMuteFail: "Səs vəziyyəti dəyişdirilə bilmədi",
    
    // About Panel
    developer: "Tərtibatçı",
    github: "GitHub",
    version: "Versiya",
    close: "Bağla",
    selectLanguage: "Dil",
    openSource: "Açıq Mənbə",
    quitApp: "Modusdan Çıx",
    
    // Auto-updater
    checkUpdates: "Yeniləmələri Yoxla",
    checkingUpdates: "Yeniləmələr yoxlanılır...",
    upToDate: "Tətbiqiniz ən son versiyadadır.",
    updateAvailable: "Yeni versiya mövcuddur:",
    downloadInstall: "Yüklə və Quraşdır",
    downloadingUpdate: "Yeniləmə yüklənir...",
    updateError: "Yeniləmə yoxlanıla bilmədi.",
    retry: "Yenidən Cəhd Et"
  },
  es: {
    appTitle: "Modus",
    appSubtitle: "Acceso Rápido de macOS",
    loading: "Obteniendo estado del sistema macOS...",
    
    // Toggles
    darkModeTitle: "Modo Oscuro",
    darkModeDesc: "Cambia la apariencia del sistema",
    caffeineTitle: "Mantener Despierto",
    caffeineDesc: "Evita que la pantalla se apague",
    desktopTitle: "Iconos del Escritorio",
    desktopDesc: "Cambia la visibilidad de iconos",
    muteTitle: "Silenciar Sonido",
    muteDesc: "Silencia todo el audio del sistema",
    // Cleaner Card
    cleanerTitle: "Limpiador de Teclado y Trackpad",
    cleanerDesc: "Bloquea pantalla, teclado y ratón",
    
    // Action Buttons
    screensaver: "Salvapantallas",
    emptyTrash: "Vaciar Papelera",
    
    // Cleaner Screen
    cleanerScreenTitle: "Teclado y Trackpad Bloqueados",
    cleanerScreenDesc: "Puedes limpiar tu dispositivo de forma segura. Teclas y clics desactivados.",
    cleanerScreenBadge: "Mantén presionado Control + ESC durante 3 segundos para salir",
    
    // Toast Messages
    toastDarkModeOn: "Modo Oscuro Activado",
    toastDarkModeOff: "Modo Claro Activado",
    toastCaffeineOn: "Pantalla Mantendida Despierta",
    toastCaffeineOff: "Mantener Despierto Desactivado",
    toastDesktopOn: "Iconos de Escritorio Visibles",
    toastDesktopOff: "Iconos de Escritorio Ocultos",
    toastMuteOn: "Audio del Sistema Silenciado",
    toastMuteOff: "Audio del Sistema Activado",
    toastScreensaverStart: "Iniciando Salvapantallas...",
    toastScreensaverFail: "No se pudo iniciar el salvapantallas",
    toastTrashEmpty: "Papelera Vaciada",
    toastTrashFail: "No se pudo vaciar la papelera",
    toastCleanerFail: "No se pudo iniciar el modo limpieza",
    toastDarkModeFail: "No se pudo cambiar el modo oscuro",
    toastCaffeineFail: "No se pudo cambiar el ajuste de mantener despierto",
    toastDesktopFail: "No se pudo cambiar la visibilidad de los iconos de escritorio",
    toastMuteFail: "No se pudo cambiar el estado de audio",
    
    // About Panel
    developer: "Desarrollador",
    github: "GitHub",
    version: "Versión",
    close: "Cerrar",
    selectLanguage: "Idioma",
    openSource: "Código Abierto",
    quitApp: "Salir de Modus",
    
    // Auto-updater
    checkUpdates: "Buscar Actualizaciones",
    checkingUpdates: "Buscando actualizaciones...",
    upToDate: "Tu aplicación está en la última versión.",
    updateAvailable: "Nueva versión disponible:",
    downloadInstall: "Descargar e Instalar",
    downloadingUpdate: "Descargando actualización...",
    updateError: "No se pudo buscar actualizaciones.",
    retry: "Reintentar"
  },
  sq: {
    appTitle: "Modus",
    appSubtitle: "Akses i Shpejtë në macOS",
    loading: "Duke marrë gjendjen e sistemit macOS...",
    
    // Toggles
    darkModeTitle: "Modaliteti i Errët",
    darkModeDesc: "Ndrysho pamjen e sistemit",
    caffeineTitle: "Qëndro Zgjuar",
    caffeineDesc: "Parandalon fikjen e ekranit",
    desktopTitle: "Ikonat e Desktopit",
    desktopDesc: "Ndrysho dukshmërinë e ikonave",
    muteTitle: "Hesht Zërin",
    muteDesc: "Hesht të gjithë zërin e sistemit",
    // Cleaner Card
    cleanerTitle: "Pastruesi i Tastierës",
    cleanerDesc: "Blloko ekranin, tastierën dhe mausin",
    
    // Action Buttons
    screensaver: "Mbrojtësi i Ekranit",
    emptyTrash: "Zbraz Koshin",
    
    // Cleaner Screen
    cleanerScreenTitle: "Tastiera dhe Trackpad janë Bllokuar",
    cleanerScreenDesc: "Mund ta pastroni pajisjen tuaj me siguri. Të gjitha butonat dhe klikimet janë çaktivizuar.",
    cleanerScreenBadge: "Mbaj shtypur Control + ESC për 3 sekonda për të dalë",
    
    // Toast Messages
    toastDarkModeOn: "Modaliteti i Errët u Aktivizua",
    toastDarkModeOff: "Modaliteti i Ndritshëm u Aktivizua",
    toastCaffeineOn: "Ekrani po mbahet i zgjuar",
    toastCaffeineOff: "Qëndrimi Zgjuar u Çaktivizua",
    toastDesktopOn: "Ikonat e Desktopit po Shfaqen",
    toastDesktopOff: "Ikonat e Desktopit u Fshehën",
    toastMuteOn: "Zëri i Sistemit u Hesht",
    toastMuteOff: "Zëri i Sistemit u Aktivizua",
    toastScreensaverStart: "Duke nisur mbrojtësin e ekranit...",
    toastScreensaverFail: "Mbrojtësi i ekranit nuk mund të nisej",
    toastTrashEmpty: "Koshi i plehrave u zbraz",
    toastTrashFail: "Koshi i plehrave nuk mund të zbrazej",
    toastCleanerFail: "Modaliteti i pastrimit nuk mund të nisej",
    toastDarkModeFail: "Nuk mund të ndryshohej modaliteti i errët",
    toastCaffeineFail: "Nuk mund të ndryshohej cilësimi i qëndrimit zgjuar",
    toastDesktopFail: "Nuk mund të ndryshohej dukshmëria e ikonave të desktopit",
    toastMuteFail: "Nuk mund të ndryshohej gjendja e zërit",
    
    // About Panel
    developer: "Zhvilluesi",
    github: "GitHub",
    version: "Versioni",
    close: "Mbyll",
    selectLanguage: "Gjuha",
    openSource: "Burim i Hapur",
    quitApp: "Dil nga Modus",
    
    // Auto-updater
    checkUpdates: "Kërko për Përditësime",
    checkingUpdates: "Duke kontrolluar për përditësime...",
    upToDate: "Aplikacioni juaj është në versionin më të fundit.",
    updateAvailable: "Version i ri i disponueshëm:",
    downloadInstall: "Shkarko dhe Instalo",
    downloadingUpdate: "Duke shkarkuar përditësimin...",
    updateError: "Përditësimi nuk mund të kontrollohej.",
    retry: "Riprovo"
  }
};
