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
├── backend/           # Spring Boot 3.2.4 + Java 17+
│   ├── src/
│   │   └── main/java/com/siponsika/
│   │       ├── config/       # CORS, DataInitializer
│   │       ├── controller/   # REST API
│   │       ├── model/        # JPA entities
│   │       ├── repository/   # Spring Data JPA
│   │       └── service/      # GroqService (AI)
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
| **Asisten AI** | Chat real-time streaming dengan Groq AI (llama-3.1-8b-instant) |

## Cara Menjalankan

### Prasyarat

- **Java** 17 atau lebih baru
- **Maven** 3.x (atau gunakan Maven Wrapper / download manual)
- **Python** 3.x (untuk server frontend)
- **Groq API Key** — daftar gratis di [console.groq.com](https://console.groq.com)

### 1. Backend

**Konfigurasi environment:**
```
cd backend
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Buka file `backend/.env` dan isi `GROQ_API_KEY` dengan API key Groq kamu:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Jalankan backend:**

macOS / Linux:
```bash
cd backend
mvn spring-boot:run
```

Windows (CMD):
```cmd
cd backend
mvn spring-boot:run
```

Windows (PowerShell):
```powershell
cd backend
..\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

> Jika `mvn` belum tersedia di PATH, kamu bisa download Maven dari [maven.apache.org](https://maven.apache.org/download.cgi) dan jalankan via path lengkap seperti contoh PowerShell di atas.

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
- **Backend:** Spring Boot 3.2.4, Java 17+, JPA, H2, WebFlux
- **AI:** Groq API — model `llama-3.1-8b-instant` (streaming SSE)

## Catatan

- File `.env` tidak di-commit ke Git (sudah di-*gitignore*). Simpan API Key hanya di file `.env` lokal.
- Database menggunakan H2 in-memory, data akan hilang setiap kali backend di-restart.
- Untuk kompatibilitas Java 25+, dependency Lombok telah dihapus dan digantikan dengan getter/setter manual.
