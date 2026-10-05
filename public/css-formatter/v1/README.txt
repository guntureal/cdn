
# CSS Minifier & Beautifier — Cloudflare CDN

Struktur upload:

public/
└── css-formatter/
    └── v1/
        ├── style.css
        └── script.js

URL setelah Worker/custom domain aktif:

https://cdn.gwntur.com/css-formatter/v1/style.css
https://cdn.gwntur.com/css-formatter/v1/script.js

Integrasi di Blogger:

<link rel="stylesheet" href="https://cdn.gwntur.com/css-formatter/v1/style.css">
<script src="https://cdn.gwntur.com/css-formatter/v1/script.js" defer></script>

Catatan:
- `public` adalah root asset Cloudflare, jadi folder `public` tidak muncul pada URL.
- HTML struktur tool tetap ditempatkan di halaman/widget Blogger.
- CSS dan JavaScript sudah dipisahkan dari source v36.
