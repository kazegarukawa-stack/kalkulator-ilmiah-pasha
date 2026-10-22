# Kalkulator Ilmiah

Kalkulator ilmiah berbasis web yang dibuat dengan HTML, CSS, dan JavaScript murni, tanpa pustaka tambahan. Ekspresi dihitung dengan parser buatan sendiri, bukan `eval`, sehingga aman dipakai.

## Apa itu Kalkulator Ilmiah?

Kalkulator biasa hanya menangani operasi dasar seperti tambah, kurang, kali, dan bagi. Kalkulator ilmiah menambahkan fungsi yang dipakai dalam sains, teknik, dan matematika tingkat lanjut, misalnya trigonometri, logaritma, akar, pangkat, dan faktorial.

Berbeda dengan kalkulator biasa yang menghitung satu operasi per langkah, kalkulator ini menerima **ekspresi utuh** dalam satu baris, misalnya `sin(30) + 2^3 + sqrt(16)`, lalu menghitungnya sesuai urutan operasi matematika yang benar.

## Fitur

- Trigonometri: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
- Logaritma dan akar: `ln`, `log`, `sqrt` (√), `cbrt`
- Pangkat (`^`), faktorial (`!`), persen (`%`), serta konstanta `π` dan `e`
- Pilihan satuan sudut **DEG** atau **RAD**
- Hasil tampil langsung saat mengetik
- Tombol **Ans** untuk memakai hasil terakhir
- Riwayat perhitungan yang bisa diklik untuk dipakai lagi
- Pesan galat yang jelas, misalnya pembagian dengan nol atau akar bilangan negatif
- Tampilan menyesuaikan mode terang atau gelap dan nyaman di layar ponsel

## Penjelasan Fungsi

| Fungsi / simbol | Arti | Contoh |
| --------------- | ---- | ------ |
| `sin(x)`, `cos(x)`, `tan(x)` | Sinus, kosinus, dan tangen dari sudut `x` | `sin(30)` = `0.5` (mode DEG) |
| `asin(x)`, `acos(x)`, `atan(x)` | Kebalikan trigonometri, menghasilkan sudut. `asin` dan `acos` hanya menerima −1 sampai 1 | `asin(0.5)` = `30` (mode DEG) |
| `ln(x)` | Logaritma natural (basis `e`), hanya untuk `x > 0` | `ln(e)` = `1` |
| `log(x)` | Logaritma basis 10, hanya untuk `x > 0` | `log(1000)` = `3` |
| `sqrt(x)` atau `√` | Akar kuadrat, `x` tidak boleh negatif | `sqrt(144)` = `12` |
| `cbrt(x)` | Akar pangkat tiga | `cbrt(27)` = `3` |
| `abs(x)` | Nilai mutlak | `abs(-7)` = `7` |
| `exp(x)` | `e` pangkat `x` | `exp(0)` = `1` |
| `x^y` | `x` pangkat `y` | `2^10` = `1024` |
| `n!` | Faktorial, hanya untuk bilangan bulat 0 sampai 170 | `5!` = `120` |
| `%` | Membagi bilangan di depannya dengan 100 | `15%` = `0.15` |
| `π` atau `pi` | Konstanta pi (3,14159…) | `2π` = `6.28318530718` |
| `e` | Bilangan Euler (2,71828…) | `e^2` = `7.38905609893` |
| `Ans` | Hasil perhitungan terakhir | `Ans * 2` |

### Mode sudut: DEG dan RAD

Fungsi trigonometri membutuhkan tahu satuan sudutnya. Tombol di bagian atas kalkulator mengganti satuan itu:

- **DEG (derajat):** `sin(90)` = `1`. Cocok untuk pemakaian sehari-hari.
- **RAD (radian):** `sin(π/2)` = `1`. Dipakai dalam kalkulus dan fisika.

Mode ini juga berlaku untuk `asin`, `acos`, dan `atan`: hasilnya dikembalikan dalam satuan yang sedang dipilih.

## Aturan Perhitungan

Kalkulator mengikuti urutan operasi matematika, dari yang paling diutamakan:

1. Tanda kurung `( )`
2. Faktorial `!` dan persen `%`
3. Pangkat `^`
4. Tanda negatif di depan bilangan
5. Kali `×` dan bagi `÷`
6. Tambah `+` dan kurang `−`

Beberapa hal yang perlu diketahui:

- **Pangkat dihitung sebelum tanda negatif.** Jadi `-2^2` bernilai `-4`, bukan `4`. Untuk mendapat `4`, tulis `(-2)^2`.
- **Perkalian boleh dilewat.** `2π` sama dengan `2×π`, dan `3(4+1)` sama dengan `3×(4+1)`.
- **Fungsi harus diikuti tanda kurung.** Tulis `sin(30)`, bukan `sin 30`.
- **Persen hanya membagi dengan 100.** Jadi `200 * 15%` = `30`, tetapi `50 + 10%` = `50.1`, bukan `55`. Untuk menambah 10% dari 50, tulis `50 + 50*10%`.
- **Pembulatan.** Hasil ditampilkan dengan ketelitian sekitar 12 angka penting. Selisih sangat kecil akibat cara komputer menyimpan bilangan desimal dibuang, sehingga `sin(180)` tampil `0`, bukan `1.2246e-16`.
- **Bilangan sangat besar atau sangat kecil** ditampilkan dalam notasi ilmiah, misalnya `1.5e20`.

## Cara Kerja di Balik Layar

Perhitungan dilakukan `app.js` dalam tiga tahap:

1. **Tokenisasi.** Teks yang diketik dipecah menjadi potongan bermakna: angka, nama fungsi atau konstanta, dan operator. Simbol seperti `×`, `÷`, `−`, `π`, dan `√` lebih dulu diubah ke bentuk standar.
2. **Parsing.** Potongan-potongan itu dibaca oleh parser *recursive descent*, yaitu sekumpulan fungsi kecil yang masing-masing mengurus satu tingkat prioritas operasi (tambah/kurang, kali/bagi, tanda negatif, pangkat, faktorial/persen, lalu angka dan fungsi). Urutan pemanggilan fungsi inilah yang menjamin urutan operasi yang benar.
3. **Evaluasi dan pemeriksaan.** Hasil dihitung sambil memeriksa kesalahan, misalnya pembagian dengan nol, kurung yang tidak lengkap, atau fungsi yang diberi nilai di luar jangkauan. Pesan galat ditampilkan dalam bahasa Indonesia.

Karena tidak memakai `eval`, kalkulator ini tidak akan menjalankan kode JavaScript yang diketik pengguna. Karakter di luar yang dikenali akan ditolak.

## Struktur Proyek

| File         | Fungsi                                      |
| ------------ | ------------------------------------------- |
| `index.html` | Kerangka halaman dan tombol kalkulator      |
| `style.css`  | Tampilan, termasuk mode gelap dan responsif |
| `app.js`     | Parser ekspresi, perhitungan, dan riwayat   |

## Cara Menjalankan

**Tanpa instalasi:** klik dua kali `index.html` agar terbuka di browser.

**Dengan VS Code:** pasang ekstensi **Live Server**, lalu klik kanan `index.html` dan pilih **Open with Live Server**.

## Contoh Ekspresi

| Ketik            | Hasil           |
| ---------------- | --------------- |
| `sin(30)`        | `0.5` (mode DEG) |
| `2^10`           | `1024`          |
| `sqrt(144) + 5!` | `132`           |
| `ln(e^3)`        | `3`             |
| `2π`             | `6.28318530718` |
| `200 * 15%`      | `30`            |
| `-2^2`           | `-4`            |

## Batasan

- Hanya bilangan real. Akar bilangan negatif dan logaritma bilangan nol atau negatif ditolak.
- Faktorial terbatas sampai `170!` karena hasil yang lebih besar melampaui batas bilangan di JavaScript.
- Pemisah desimal memakai titik (`3.14`), bukan koma.
- Riwayat hanya menyimpan 8 perhitungan terakhir dan hilang saat halaman dimuat ulang.
