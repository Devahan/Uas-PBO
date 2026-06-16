# SIPONSIKA - Sistem Informasi Penanggulangan Bencana

Aplikasi manajemen darurat untuk penanganan bencana — mengelola posko, pengungsi, distribusi kamar, dan laporan operasional.

## Struktur Proyek

```
├── frontend/          # HTML + Tailwind CSS + JS (static)
│   ├── index.html     # UI utama
│   ├── app.js         # CRUD, chat, navigation
│   ├── config.js      # Runtime config
│   ├── .env.example
│   └── .env           # (local, jangan commit)
│
├── backend/           # Spring Boot 3.2.4 + Java 17
│   ├── src/
│   │   └── main/java/com/siponsika/
│   │       ├── config/       # CORS, DataInitializer
│   │       ├── controller/   # REST API
│   │       ├── model/        # JPA entities
│   │       ├── repository/   # Spring Data JPA
│   │       └── service/      # GeminiService
│   ├── .env.example
│   ├── .env            # (local, jangan commit)
│   └── pom.xml
│
├── .gitignore
└── README.md
```

## Fitur

| Modul | Fitur |
|-------|-------|
| **Dasbor** | KPI real-time: total pengungsi, posko aktif, sisa kapasitas, kamar penuh |
| **Manajemen Posko** | CRUD posko + fasilitas, kapasitas, okupansi |
| **Manajemen Pengungsi** | CRUD pengungsi + search by nama, assign kamar |
| **Distribusi Kamar** | CRUD kamar per posko, status penuh/tersedia, filter |
| **Asisten AI** | Chat real-time streaming dengan Gemini AI |

## Cara Menjalankan

### 1. Backend

**macOS / Linux:**
```bash
cd backend
cp .env.example .env
# Isi GEMINI_API_KEY di .env dengan API key Gemini-mu
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
mvn spring-boot:run
```

**Windows (CMD):**
```cmd
cd backend
copy .env.example .env
:: Isi GEMINI_API_KEY di .env dengan API key Gemini-mu
set JAVA_HOME=C:\Program Files\Java\jdk-17
mvn spring-boot:run
```

**Windows (PowerShell):**
```powershell
cd backend
Copy-Item .env.example .env
# Isi GEMINI_API_KEY di .env dengan API key Gemini-mu
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
mvn spring-boot:run
```

> Pastikan Java 17 dan Maven sudah terinstall dan terdaftar di PATH.

Backend berjalan di `http://localhost:8080`.

### 2. Frontend

**macOS / Linux:**
```bash
cd frontend
cp .env.example .env
python3 -m http.server 5500
```

**Windows (CMD / PowerShell):**
```cmd
cd frontend
copy .env.example .env
python -m http.server 5500
```

Buka `http://localhost:5500` di browser.

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/posko` | Semua posko |
| POST | `/api/posko` | Tambah posko |
| PUT | `/api/posko/{id}` | Edit posko |
| DELETE | `/api/posko/{id}` | Hapus posko |
| GET | `/api/pengungsi` | Semua pengungsi |
| GET | `/api/pengungsi/search?nama=` | Cari pengungsi |
| POST | `/api/pengungsi` | Tambah pengungsi |
| PUT | `/api/pengungsi/{id}` | Edit pengungsi |
| DELETE | `/api/pengungsi/{id}` | Hapus pengungsi |
| GET | `/api/kamar` | Semua kamar |
| GET | `/api/kamar/posko/{poskoId}` | Filter kamar by posko |
| POST | `/api/kamar` | Tambah kamar |
| PUT | `/api/kamar/{id}` | Edit kamar |
| DELETE | `/api/kamar/{id}` | Hapus kamar |
| GET | `/api/laporan` | Ringkasan dashboard |
| POST | `/api/ai/chat` | Chat dengan AI (SSE streaming) |

## Teknologi

- **Frontend:** HTML, Tailwind CSS, FontAwesome
- **Backend:** Spring Boot 3.2.4, Java 17, JPA, H2, WebFlux
- **AI:** Google Gemini API (streaming)
