# e-Pantau Pesakit Klinik

Ini ialah asas MVP aplikasi pemantauan pesakit dan temujanji klinik.

## Apa yang ada
- Login page
- Dashboard
- Pesakit
- Temujanji
- Follow-Up
- Laporan
- Tetapan
- Struktur React + TypeScript + Vite
- Fail SQL untuk Supabase

## Cara guna
1. Extract fail zip
2. Buka folder projek
3. Jalankan:
   npm install
   npm run dev
4. Salin `.env.example` kepada `.env`
5. Masukkan nilai Supabase anda

## Nota
- Versi ini menggunakan mock data untuk demo
- Anda boleh sambungkan ke Supabase menggunakan `supabase_schema.sql`
- Follow-Up page distruktur semula daripada prototype HTML anda supaya menjadi sebahagian daripada aplikasi sebenar


## Sambung ke Supabase
1. Cipta projek Supabase
2. Buka SQL Editor dan jalankan `supabase_schema.sql`
3. Salin `.env.example` menjadi `.env`
4. Isi:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Jalankan semula:
   npm run dev

Apabila `.env` sudah lengkap, aplikasi akan cuba ambil data daripada Supabase.
Jika belum lengkap, aplikasi akan kekal dalam mode demo.


## Status versi ini
- Tambah Pesakit: aktif
- Tambah Temujanji: aktif
- Kemas kini Follow-Up: aktif
- Simpan ke Supabase: aktif jika `.env` diisi dengan betul
- Jika Supabase belum disambung, sistem kekal berjalan dalam mode demo


## Versi semasa
- Login page kini boleh menggunakan Supabase Auth
- Edit/Padam Pesakit: aktif
- Edit/Padam Temujanji: aktif
- Kemas kini Follow-Up: aktif
- Log keluar: aktif

## Untuk guna login sebenar
1. Buka Supabase > Authentication
2. Cipta pengguna admin
3. Guna emel dan kata laluan itu di halaman login


## Tambahan versi penuh
- Role asas: admin / staff / viewer
- Dashboard lebih dinamik dengan ringkasan visual
- Export laporan ke CSV
- Quick action ke halaman Follow-Up dari dashboard
- Viewer hanya boleh lihat data
- Staff boleh tambah dan edit
- Admin boleh tambah, edit, dan padam

### Nota role demo
Untuk demo mudah:
- emel mengandungi `viewer` -> viewer
- emel mengandungi `staff` -> staff
- selain itu -> admin


## Kemaskini modul Tetapan
- Butang `Simpan Perubahan` ditambah
- Butang `Reset` ditambah
- Nama Klinik dan Tema kini boleh dikemas kini dalam aplikasi


## Kemaskini tambahan
- Nama Klinik kini dipaparkan pada sidebar
- Tema Light/Dark kini memberi kesan pada rupa aplikasi
- Tetapan masih boleh diperluas ke jadual `app_settings` di Supabase kemudian


## Tambahan untuk data online
- Carian dan tapisan asas pada modul Pesakit
- Carian dan tapisan asas pada modul Temujanji
- Selepas tambah/edit/padam, aplikasi akan refresh semula data daripada Supabase
- Rekod pesakit dan temujanji kini lebih jelas disahkan sebagai tersimpan online


## Follow-Up online penuh
- Carian pada modul Follow-Up
- Tapisan status pada modul Follow-Up
- Selepas kemas kini follow-up, aplikasi refresh semula data dari Supabase
- Lebih sesuai untuk penggunaan data online sebenar
