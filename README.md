# Password Generator v1 — Cloudflare Workers Static Assets

Paket ini berisi CSS dan JavaScript Password Generator v1 yang sudah dipisahkan untuk Cloudflare Workers Static Assets.

## Struktur

public/
└── password-generator/
    └── v1/
        ├── style.css
        └── script.js

wrangler.jsonc

> **Penting:** folder `public` hanya merupakan direktori sumber asset untuk Cloudflare. Nama `public` **tidak** menjadi bagian dari URL. Karena konfigurasi menggunakan `"directory": "./public"`, file `public/password-generator/v1/style.css` diakses sebagai `/password-generator/v1/style.css`, bukan `/public/password-generator/v1/style.css`.

## Deploy tanpa Termux

Gunakan GitHub + Cloudflare Workers Builds:

1. Buat repository GitHub baru, misalnya `gwntur-cdn`.
2. Upload seluruh isi folder paket ini ke repository tersebut melalui website GitHub.
3. Di Cloudflare buka Workers & Pages → Create application → Get started → Import a repository.
4. Pilih repository GitHub tersebut.
5. Pastikan root directory adalah root repository (tempat `wrangler.jsonc` berada).
6. Build command boleh dikosongkan karena tidak ada proses build.
7. Deploy command gunakan default Cloudflare: `npx wrangler deploy`.
8. Deploy.

Cloudflare Workers Builds akan menjalankan deployment dari repository; tidak perlu Termux di perangkat. `wrangler.jsonc` memberi tahu Cloudflare bahwa asset berada di `./public`.

## URL asset setelah Worker aktif

Jika Worker menggunakan domain:
`https://gwntur-cdn.<subdomain>.workers.dev`

maka asset menjadi:

`https://gwntur-cdn.<subdomain>.workers.dev/password-generator/v1/style.css`

`https://gwntur-cdn.<subdomain>.workers.dev/password-generator/v1/script.js`

Setelah custom domain `cdn.gwntur.com` dipasang ke Worker, gunakan:

`https://cdn.gwntur.com/password-generator/v1/style.css`

`https://cdn.gwntur.com/password-generator/v1/script.js`

## Blogger

Panggil CSS dan JS dari HTML Blogger:

<link rel="stylesheet" href="https://cdn.gwntur.com/password-generator/v1/style.css">
<script src="https://cdn.gwntur.com/password-generator/v1/script.js" defer></script>

HTML tool tetap berada di Blogger.

## Versioning

Jangan menimpa `v1` jika ingin mempertahankan versi lama. Untuk perubahan besar, buat:

public/password-generator/v2/
    style.css
    script.js

Kemudian ubah URL Blogger dari `/v1/` ke `/v2/`.

## Catatan keamanan

CSS dan JavaScript frontend tetap dapat diakses pengunjung karena browser harus mengunduhnya. Cloudflare memisahkan dan menyajikan asset, tetapi tidak dapat membuat kode frontend menjadi rahasia.
