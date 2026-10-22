"use strict";

/* =========================================================
   Kalkulator Ilmiah
   Parser rekursif sendiri (tanpa eval) agar aman.
   Tata bahasa:
     ekspresi = suku (('+'|'-') suku)*
     suku     = unari (('*'|'/'|implisit) unari)*
     unari    = ('-'|'+') unari | pangkat
     pangkat  = pascafiks ('^' unari)?
     pascafiks= utama ('!' | '%')*
     utama    = angka | konstanta | fungsi '(' ekspresi ')' | '(' ekspresi ')'
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);

let modeDerajat = true;
let jawabanTerakhir = 0;

function tokenisasi(teks) {
  const s = teks
    .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
    .replace(/π/g, "pi").replace(/√/g, "sqrt")
    .toLowerCase();
  const token = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    let m;
    if ((m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)))) {
      token.push({ t: "num", v: parseFloat(m[0]) });
      i += m[0].length;
    } else if ((m = /^[a-z]+/.exec(s.slice(i)))) {
      token.push({ t: "id", v: m[0] });
      i += m[0].length;
    } else if ("+-*/^()!%".includes(c)) {
      token.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error(`Karakter tidak dikenal: "${c}"`);
    }
  }
  return token;
}

function faktorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error("Faktorial hanya untuk bilangan bulat ≥ 0");
  if (n > 170) throw new Error("Faktorial terlalu besar (maks 170!)");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function hitung(teks) {
  const tok = tokenisasi(teks);
  if (!tok.length) return 0;
  let p = 0;
  const intip = () => tok[p];
  const ambil = () => tok[p++];
  const op = (v) => intip() && intip().t === "op" && intip().v === v;

  const kePantulan = (x) => (modeDerajat ? (x * Math.PI) / 180 : x);
  const dariRadian = (x) => (modeDerajat ? (x * 180) / Math.PI : x);

  const fungsi = {
    sin: (x) => Math.sin(kePantulan(x)),
    cos: (x) => Math.cos(kePantulan(x)),
    tan: (x) => {
      const r = kePantulan(x);
      if (Math.abs(Math.cos(r)) < 1e-12) throw new Error("tan tidak terdefinisi di sudut ini");
      return Math.tan(r);
    },
    asin: (x) => { if (x < -1 || x > 1) throw new Error("asin hanya untuk −1 s.d. 1"); return dariRadian(Math.asin(x)); },
    acos: (x) => { if (x < -1 || x > 1) throw new Error("acos hanya untuk −1 s.d. 1"); return dariRadian(Math.acos(x)); },
    atan: (x) => dariRadian(Math.atan(x)),
    ln: (x) => { if (x <= 0) throw new Error("ln hanya untuk bilangan > 0"); return Math.log(x); },
    log: (x) => { if (x <= 0) throw new Error("log hanya untuk bilangan > 0"); return Math.log10(x); },
    sqrt: (x) => { if (x < 0) throw new Error("Akar bilangan negatif tidak real"); return Math.sqrt(x); },
    cbrt: Math.cbrt,
    abs: Math.abs,
    exp: Math.exp,
  };
  const konstanta = { pi: Math.PI, e: Math.E, ans: jawabanTerakhir };

  function ekspresi() {
    let v = suku();
    while (op("+") || op("-")) {
      const o = ambil().v;
      const r = suku();
      v = o === "+" ? v + r : v - r;
    }
    return v;
  }

  function suku() {
    let v = unari();
    for (;;) {
      if (op("*") || op("/")) {
        const o = ambil().v;
        const r = unari();
        if (o === "/" && r === 0) throw new Error("Pembagian dengan nol");
        v = o === "*" ? v * r : v / r;
      } else if (intip() && (intip().t === "num" || intip().t === "id" || op("("))) {
        v *= unari(); // perkalian implisit: 2π, 3(4+1)
      } else break;
    }
    return v;
  }

  function unari() {
    if (op("-")) { ambil(); return -unari(); }
    if (op("+")) { ambil(); return unari(); }
    return pangkat();
  }

  function pangkat() {
    const dasar = pascafiks();
    if (op("^")) {
      ambil();
      const r = Math.pow(dasar, unari());
      if (Number.isNaN(r)) throw new Error("Hasil pangkat tidak real");
      return r;
    }
    return dasar;
  }

  function pascafiks() {
    let v = utama();
    while (op("!") || op("%")) {
      v = ambil().v === "!" ? faktorial(v) : v / 100;
    }
    return v;
  }

  function utama() {
    const t = ambil();
    if (!t) throw new Error("Ekspresi belum lengkap");
    if (t.t === "num") return t.v;
    if (t.t === "id") {
      if (t.v in konstanta) return konstanta[t.v];
      if (t.v in fungsi) {
        if (!op("(")) throw new Error(`Fungsi ${t.v} perlu tanda kurung`);
        ambil();
        const x = ekspresi();
        if (!op(")")) throw new Error("Kurung tutup kurang");
        ambil();
        return fungsi[t.v](x);
      }
      throw new Error(`Tidak dikenal: "${t.v}"`);
    }
    if (t.v === "(") {
      const x = ekspresi();
      if (!op(")")) throw new Error("Kurung tutup kurang");
      ambil();
      return x;
    }
    throw new Error(`Posisi "${t.v}" tidak valid`);
  }

  const hasil = ekspresi();
  if (p < tok.length) throw new Error(`Sisa ekspresi tidak terbaca: "${tok[p].v}"`);
  if (!Number.isFinite(hasil)) throw new Error("Hasil tidak terdefinisi atau terlalu besar");
  return hasil;
}

function formatAngka(x) {
  if (Math.abs(x) < 1e-12) return "0"; // buang sisa galat floating point
  const bulat = parseFloat(x.toPrecision(12));
  const abs = Math.abs(bulat);
  if (abs >= 1e15 || abs < 1e-9) return bulat.toExponential(6).replace(/\.?0+e/, "e");
  return String(bulat);
}

/* ---------- Antarmuka ---------- */
const inputKalk = $("#calcInput");
const hasilKalk = $("#calcResult");
const daftarRiwayat = $("#historyList");
const riwayat = [];

function tampilkanLive() {
  const teks = inputKalk.value.trim();
  if (!teks) {
    hasilKalk.textContent = "0";
    hasilKalk.classList.remove("error");
    inputKalk.classList.remove("error");
    return;
  }
  try {
    hasilKalk.textContent = "= " + formatAngka(hitung(teks));
    hasilKalk.classList.remove("error");
    inputKalk.classList.remove("error");
  } catch {
    // saat masih mengetik, abaikan galat agar tidak mengganggu
    hasilKalk.classList.remove("error");
  }
}

function samaDengan() {
  const teks = inputKalk.value.trim();
  if (!teks) return;
  try {
    const nilai = hitung(teks);
    const str = formatAngka(nilai);
    jawabanTerakhir = nilai;
    hasilKalk.textContent = str;
    hasilKalk.classList.remove("error");
    inputKalk.classList.remove("error");
    riwayat.unshift({ ekspresi: teks, hasil: str });
    if (riwayat.length > 8) riwayat.pop();
    gambarRiwayat();
  } catch (err) {
    hasilKalk.textContent = err.message;
    hasilKalk.classList.add("error");
    inputKalk.classList.add("error");
  }
}

function gambarRiwayat() {
  daftarRiwayat.innerHTML = "";
  if (!riwayat.length) {
    daftarRiwayat.innerHTML = '<li class="empty">Belum ada perhitungan.</li>';
    return;
  }
  riwayat.forEach((r) => {
    const li = document.createElement("li");
    li.title = "Klik untuk memakai ekspresi ini lagi";
    const a = document.createElement("span");
    a.textContent = r.ekspresi;
    const b = document.createElement("span");
    b.textContent = "= " + r.hasil;
    li.append(a, b);
    li.addEventListener("click", () => {
      inputKalk.value = r.ekspresi;
      tampilkanLive();
      inputKalk.focus();
    });
    daftarRiwayat.append(li);
  });
}

function sisipkan(teks) {
  const mulai = inputKalk.selectionStart ?? inputKalk.value.length;
  const akhir = inputKalk.selectionEnd ?? inputKalk.value.length;
  inputKalk.value = inputKalk.value.slice(0, mulai) + teks + inputKalk.value.slice(akhir);
  const pos = mulai + teks.length;
  inputKalk.setSelectionRange(pos, pos);
  inputKalk.focus();
  tampilkanLive();
}

$("#keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.ins !== undefined) return sisipkan(btn.dataset.ins);
  switch (btn.dataset.act) {
    case "clear":
      inputKalk.value = "";
      inputKalk.classList.remove("error");
      tampilkanLive();
      inputKalk.focus();
      break;
    case "back": {
      const mulai = inputKalk.selectionStart, akhir = inputKalk.selectionEnd;
      if (mulai !== akhir) inputKalk.setRangeText("", mulai, akhir, "end");
      else if (mulai > 0) inputKalk.setRangeText("", mulai - 1, mulai, "end");
      inputKalk.focus();
      tampilkanLive();
      break;
    }
    case "equals":
      samaDengan();
      break;
  }
});

inputKalk.addEventListener("input", tampilkanLive);
inputKalk.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); samaDengan(); }
});

$("#angleToggle").addEventListener("click", (e) => {
  modeDerajat = !modeDerajat;
  e.currentTarget.textContent = modeDerajat ? "DEG" : "RAD";
  tampilkanLive();
});

tampilkanLive();
