<div align="center">

# 🚀 CDN gwntur.com

<img src="https://img.shields.io/badge/Cloudflare-Workers-F68204?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
<img src="https://img.shields.io/badge/Static_Assets-Wrangler-9e9e9e?style=for-the-badge" alt="Wrangler"/>
<img src="https://img.shields.io/badge/Live-cdn.gwntur.com-0066cc?style=for-the-badge" alt="Live CDN"/>

**Repositori aset statis (CSS & JavaScript) untuk semua tools interaktif di gwntur.com** —
disajikan super cepat ke seluruh dunia lewat **Cloudflare Workers Static Assets**.

</div>

---

## ✨ Cara Kerja

HTML tiap tool ditempel di halaman Blogger, sedangkan file `style.css` & `script.js`-nya
diambil dari repo ini melalui Worker **`cdn`** di `https://cdn.gwntur.com`.

```
┌────────────┐   git push   ┌────────────┐  wrangler deploy  ┌───────────────────┐
│   GitHub   │ ──────────► │ Repo lokal │ ────────────────► │ Cloudflare Worker │
│ (repo ini) │              └────────────┘                   │  cdn.gwntur.com   │
└────────────┘                                               └────────┬──────────┘
                                                                      │ ?v=N
                                                                      ▼
                                                           ┌────────────────────┐
                                                           │  Halaman Blogger   │
                                                           │    gwntur.com      │
                                                           └────────────────────┘
```

> **Penting:** folder `public/` hanya direktori sumber asset — **bukan** bagian dari URL.
> `public/tiktok-downloader/v1/style.css` diakses sebagai
> `https://cdn.gwntur.com/tiktok-downloader/v1/style.css`.

---

## 🧰 Daftar Tools

| Tool | Versi | Deskripsi | URL Aset |
|------|-------|-----------|----------|
| **TikTok Downloader** | `v1` | Unduh video TikTok tanpa watermark (HD/SD), foto resolusi asli & MP3 — [demo](https://www.gwntur.com/p/tiktok-downloader.html) | [`tiktok-downloader/v1/`](https://cdn.gwntur.com/tiktok-downloader/v1/style.css) |
| **Facebook Downloader** | `v1` | Unduh video & Reels Facebook kualitas HD/SD — [demo](https://www.gwntur.com/p/facebook-downloader.html) | [`facebook-downloader/v1/`](https://cdn.gwntur.com/facebook-downloader/v1/style.css) |
| **Password Generator** | `v1` | Buat password acak yang kuat & aman | [`password-generator/v1/`](https://cdn.gwntur.com/password-generator/v1/style.css) |
| **Base64** | `v1`, `v2` | Encode & decode teks Base64 | [`base64/v2/`](https://cdn.gwntur.com/base64/v2/style.css) |
| **CSS Formatter** | `v1` | Rapikan & format kode CSS otomatis | [`css-formatter/v1/`](https://cdn.gwntur.com/css-formatter/v1/style.css) |
| **HTML Entity** | `v1` | Encode & decode HTML entities | [`html-entity/v1/`](https://cdn.gwntur.com/html-entity/v1/style.css) |
| **Hljs Parse** | `v1` | Highlight sintaks kode (highlight.js) | [`hljs-parse/v1/`](https://cdn.gwntur.com/hljs-parse/v1/style.css) |

Setiap versi memuat `style.css` + `script.js` (beberapa juga `README.txt` / `index.html`
sebagai dokumentasi & fragmen Blogger).

---

## 🚀 Deploy

Deploy dilakukan dari komputer lokal dengan **Wrangler** — tidak perlu Termux / HP.

```bash
# 1. Clone repo ini (cukup sekali)
git clone https://github.com/guntureal/cdn.git
cd cdn

# 2. Login Cloudflare (cukup sekali)
npx wrangler login

# 3. Setiap selesai mengedit file di public/, deploy:
npx wrangler deploy
```

`wrangler.jsonc` sudah dikonfigurasi — asset diambil dari `./public`:

```jsonc
{
  "name": "cdn",
  "compatibility_date": "2026-10-02",
  "assets": { "directory": "./public" }
}
```

Verifikasi setelah deploy — buka URL asset di browser dan pastikan isinya versi terbaru:

```
https://cdn.gwntur.com/<nama-tool>/v1/style.css
https://cdn.gwntur.com/<nama-tool>/v1/script.js
```

---

## ➕ Menambah Tool Baru

1. Buat folder `public/<nama-tool>/v1/` berisi `style.css` dan `script.js`.
2. Jalankan `npx wrangler deploy`.
3. Di halaman Blogger, panggil kedua file tersebut (lihat contoh di bawah).

## 🔄 Versioning & Cache-Busting

- **Jangan menimpa `v1`** jika ingin versi lama tetap tersedia. Untuk perubahan besar,
  buat folder versi baru: `public/<nama-tool>/v2/`, lalu arahkan URL Blogger ke `/v2/`.
- Untuk pembaruan kecil pada versi yang sama, gunakan **query string** di URL Blogger
  agar pengunjung tidak terjebak cache lama:

```html
<link href="https://cdn.gwntur.com/tiktok-downloader/v1/style.css?v=2" rel="stylesheet"/>
<script defer src="https://cdn.gwntur.com/tiktok-downloader/v1/script.js?v=2"></script>
```

> Naikkan angkanya (`?v=3`, `?v=4`, …) setiap kali isi file berubah.

---

## 📝 Pasang di Blogger

Tempel di halaman Blogger → **Tampilan HTML** → Publikasikan:

```html
<link href="https://cdn.gwntur.com/<nama-tool>/v1/style.css?v=2" rel="stylesheet" type="text/css"/>
<script defer="defer" src="https://cdn.gwntur.com/<nama-tool>/v1/script.js?v=2" type="text/javascript"></script>

<!-- + fragmen HTML tool -->
```

HTML tool tetap berada di Blogger; repo ini hanya menyajikan CSS & JS.

---

## 📁 Struktur Direktori

<details>
<summary>Klik untuk melihat struktur lengkap</summary>

```
public/
├── base64/
│   ├── v1/  (README.txt, index.html, script.js, style.css)
│   └── v2/  (README.txt, script.js, style.css)
├── css-formatter/
│   └── v1/  (README.txt, script.js, style.css)
├── facebook-downloader/
│   └── v1/  (README.txt, script.js, style.css)
├── hljs-parse/
│   └── v1/  (README.txt, script.js, style.css)
├── html-entity/
│   └── v1/  (README.txt, script.js, style.css)
├── password-generator/
│   └── v1/  (readme.txt, script.js, style.css)
└── tiktok-downloader/
    └── v1/  (README.txt, script.js, style.css)
wrangler.jsonc
```

</details>

---

## 🔒 Catatan Keamanan

CSS dan JavaScript frontend **tetap dapat dilihat & diunduh siapa pun** — browser
memang harus mengunduhnya agar tool berfungsi. Cloudflare hanya menyajikan file,
bukan menyembunyikannya. Jangan menaruh kunci API, token, atau data rahasia
di file repo ini; rahasia milik Worker disimpan sebagai *environment secret*,
bukan di repo.

---

<div align="center">

Dikelola oleh **Guntur** · 🌐 [gwntur.com](https://www.gwntur.com)

</div>
