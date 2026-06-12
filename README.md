# Modus 🎛️

Modus, macOS için geliştirilmiş şık, hafif ve minimalist bir menü çubuğu (MenuBar) uygulamasıdır. Popüler "One Switch" uygulamasına açık kaynaklı, yüksek performanslı ve modern bir alternatif olarak tasarlanmıştır.

Sistem özelliklerini, ekran ayarlarını ve çeşitli geliştirici araçlarını tek bir tıkla menü çubuğundan kontrol etmenizi sağlar.

## ✨ Özellikler (Planlanan)

- **Karanlık Mod Geçişi:** macOS sistem temasını anında açık/koyu mod arasında değiştirin.
- **Ekranı Uyanık Tut (Caffeine/Amphetamine):** Belirli sürelerle veya süresiz olarak ekranın uyku moduna geçmesini engelleyin.
- **Masaüstü Simgelerini Gizle:** Sunum yaparken veya temiz bir çalışma alanı isterken tek tıkla masaüstünü temizleyin.
- **Rahatsız Etmeyin (Do Not Disturb):** macOS bildirimlerini hızlıca susturun.
- **Ekran Koruyucu:** Ekran koruyucuyu anında başlatın.
- **Kulaklık/Ses Çıkışı Kontrolü:** Hızlıca ses çıkış aygıtları arasında geçiş yapın.

## 🛠️ Teknolojiler

- **Backend:** [Rust](https://www.rust-lang.org/) (Yüksek performans, düşük kaynak tüketimi ve macOS sistem API'leri ile doğrudan entegrasyon)
- **Framework:** [Tauri v2](https://tauri.app/) (Güvenli, hafif ve modern yerel uygulama çalışma ortamı)
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Stil:** Özel Modern Vanilla CSS (Açık/Koyu tema uyumlu, macOS tasarım diline sadık cam efekti - glassmorphism)

## 🚀 Başlangıç

### Gereksinimler

- macOS (12.0 veya daha yeni bir sürüm)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18+) ve npm/pnpm/yarn

### Geliştirme Süreci

Geliştirici sunucusunu başlatmak ve uygulamayı çalıştırmak için:

```bash
npm install
npm run tauri dev
```

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
