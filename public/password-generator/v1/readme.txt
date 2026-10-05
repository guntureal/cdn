PASSWORD GENERATOR v1 — CLOUDFLARE WORKERS

Nama Worker yang digunakan: cdn

STRUKTUR ASSET
public/password-generator/v1/style.css
public/password-generator/v1/script.js

PENTING
Folder "public" hanya direktori sumber asset Cloudflare dan TIDAK muncul pada URL.
Dengan assets.directory = "./public", URL production menjadi:
https://cdn.gwntur.com/password-generator/v1/style.css
https://cdn.gwntur.com/password-generator/v1/script.js

BUKAN:
https://cdn.gwntur.com/public/password-generator/v1/style.css

HTML BLOGGER
Gunakan blogger-password-generator.html. HTML tersebut memanggil CSS dan JS melalui cdn.gwntur.com.
