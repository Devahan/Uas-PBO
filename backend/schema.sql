-- ============================================================
--  SIPONSIKA — Sistem Informasi Penanggulangan Bencana
--  MySQL Schema & Sample Data
--  Generated from: Spring Boot JPA Entity classes
--  Database: siponsikadb
-- ============================================================

-- ─── 1. Buat & Gunakan Database ──────────────────────────────
CREATE DATABASE IF NOT EXISTS siponsikadb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE siponsikadb;

-- ─── 2. Drop tabel (urutan: child dulu, lalu parent) ─────────
DROP TABLE IF EXISTS pengungsi;
DROP TABLE IF EXISTS kamar;
DROP TABLE IF EXISTS posko;
DROP TABLE IF EXISTS admin;

-- ============================================================
--  TABEL: admin
--  Entity: com.siponsika.model.Admin
--  @Table(name = "admin")
-- ============================================================
CREATE TABLE admin (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    username     VARCHAR(100) NOT NULL,
    email        VARCHAR(150)     NULL,
    password     VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150)     NULL,
    jabatan      VARCHAR(100)     NULL,
    avatar_url   TEXT             NULL,

    CONSTRAINT pk_admin       PRIMARY KEY (id),
    CONSTRAINT uq_admin_uname UNIQUE      (username),
    CONSTRAINT uq_admin_email UNIQUE      (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel akun admin / petugas posko';

-- ============================================================
--  TABEL: posko
--  Entity: com.siponsika.model.Posko
-- ============================================================
CREATE TABLE posko (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nama_posko  VARCHAR(200) NOT NULL,
    alamat      TEXT             NULL,
    kapasitas   INT              NULL,
    okupansi    INT          NOT NULL DEFAULT 0,
    fasilitas   TEXT             NULL,

    CONSTRAINT pk_posko PRIMARY KEY (id),
    CONSTRAINT chk_posko_okupansi CHECK (okupansi >= 0),
    CONSTRAINT chk_posko_kapasitas CHECK (kapasitas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel data posko / tempat penampungan bencana';

-- ============================================================
--  TABEL: kamar
--  Entity: com.siponsika.model.Kamar
--  Relasi: kamar.posko_id → posko.id (Many-to-One)
-- ============================================================
CREATE TABLE kamar (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    posko_id          BIGINT           NULL,
    nama_kamar        VARCHAR(100)     NULL,
    kapasitas         INT              NULL,
    penghuni_saat_ini INT          NOT NULL DEFAULT 0,

    CONSTRAINT pk_kamar            PRIMARY KEY (id),
    CONSTRAINT fk_kamar_posko      FOREIGN KEY (posko_id)
        REFERENCES posko(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_kamar_penghuni  CHECK (penghuni_saat_ini >= 0),
    CONSTRAINT chk_kamar_kapasitas CHECK (kapasitas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel data kamar per posko bencana';

-- ============================================================
--  TABEL: pengungsi
--  Entity: com.siponsika.model.Pengungsi
--  Relasi: pengungsi.kamar_id → kamar.id (Many-to-One)
-- ============================================================
CREATE TABLE pengungsi (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    nama             VARCHAR(200)     NULL,
    umur             INT              NULL,
    jenis_kelamin    VARCHAR(20)      NULL
                     COMMENT 'Laki-laki / Perempuan',
    anggota_keluarga INT              NULL,
    kondisi_kesehatan VARCHAR(100)    NULL
                     COMMENT 'Sehat / Luka Ringan / Luka Berat / Kritis',
    kamar_id         BIGINT           NULL,

    CONSTRAINT pk_pengungsi       PRIMARY KEY (id),
    CONSTRAINT fk_pengungsi_kamar FOREIGN KEY (kamar_id)
        REFERENCES kamar(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_pengungsi_umur CHECK (umur >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel data pengungsi bencana';

-- ============================================================
--  INDEXES TAMBAHAN (untuk performa query & pencarian)
-- ============================================================
CREATE INDEX idx_kamar_posko_id         ON kamar(posko_id);
CREATE INDEX idx_pengungsi_kamar_id     ON pengungsi(kamar_id);
CREATE INDEX idx_pengungsi_nama         ON pengungsi(nama);
CREATE INDEX idx_pengungsi_kondisi      ON pengungsi(kondisi_kesehatan);

-- ============================================================
--  SAMPLE DATA — dari DataInitializer.java
-- ============================================================

-- ── Admin ─────────────────────────────────────────────────────
INSERT INTO admin (username, email, password, nama_lengkap, jabatan, avatar_url)
VALUES
    ('admin',
     'admin@siponsika.go.id',
     'admin123',
     'Administrator Utama',
     'Super Admin',
     'https://ui-avatars.com/api/?name=Admin+Utama&background=0a2540&color=fff'),

    ('koordinator',
     'koordinator@siponsika.go.id',
     'posko2024',
     'A. Wijaya',
     'Koordinator Lapangan',
     'https://ui-avatars.com/api/?name=A+Wijaya&background=0D8ABC&color=fff'),

    ('petugas',
     'petugas@siponsika.go.id',
     'petugas123',
     'Sari Dewi',
     'Petugas Posko',
     'https://ui-avatars.com/api/?name=Sari+Dewi&background=ff6b35&color=fff');

-- ── Posko ─────────────────────────────────────────────────────
INSERT INTO posko (nama_posko, alamat, kapasitas, okupansi, fasilitas)
VALUES
    ('Posko Merapi 01',      'Jl. Merbabu No. 10, Cangkringan',  200,  184,  'Tenda, MCK, Dapur Umum'),
    ('Posko Merapi 02',      'Jl. Kaliurang Km 22, Pakem',       150,   68,  'Tenda, MCK, Dapur Umum'),
    ('Posko Merapi 03',      'Jl. Boyong, Turgo',                100,   78,  'Tenda, MCK'),
    ('Stadion Patriot Bhakti','Jl. Sudirman No. 45',            1500, 1250,  'Tenda, MCK, Dapur Umum, Lahan Parkir'),
    ('GOR Bung Hatta',       'Kecamatan Kebon Jeruk',           1000,  450,  'Tenda, MCK, Dapur Umum'),
    ('Balai Desa Makmur',    'Jl. Melati No. 12',                300,  295,  'Tenda, MCK');

-- ── Kamar ─────────────────────────────────────────────────────
-- (posko_id mengacu id posko di atas: 1 = Posko Merapi 01, 2 = Posko Merapi 02)
INSERT INTO kamar (posko_id, nama_kamar, kapasitas, penghuni_saat_ini)
VALUES
    (1, 'A-01', 4, 4),
    (1, 'A-02', 4, 3),
    (1, 'A-03', 4, 2),
    (2, 'B-01', 6, 6),
    (2, 'B-02', 6, 4);

-- ── Pengungsi ──────────────────────────────────────────────────
-- kamar_id NULL karena DataInitializer tidak assign kamar ke pengungsi
INSERT INTO pengungsi (nama, umur, jenis_kelamin, anggota_keluarga, kondisi_kesehatan, kamar_id)
VALUES
    ('Budi Pratama',   34, 'Laki-laki',  4, 'Sehat',       NULL),
    ('Laras Santoso',  28, 'Perempuan',  2, 'Luka Ringan',  NULL),
    ('Siti Yuliani',   52, 'Perempuan',  3, 'Luka Berat',   NULL),
    ('Ahmad Sulaiman', 42, 'Laki-laki',  4, 'Sehat',        NULL),
    ('Siti Aminah',    38, 'Perempuan',  3, 'Luka Ringan',  NULL),
    ('Bambang Hartono',65, 'Laki-laki',  1, 'Kritis',       NULL),
    ('Dewi Sartika',   22, 'Perempuan',  2, 'Sehat',        NULL),
    ('Rudi Hermawan',  45, 'Laki-laki',  5, 'Sehat',        NULL);

-- ============================================================
--  VIEWS (opsional — berguna untuk laporan dashboard)
-- ============================================================

-- View: ringkasan kapasitas per posko
CREATE OR REPLACE VIEW v_ringkasan_posko AS
SELECT
    p.id,
    p.nama_posko,
    p.kapasitas,
    p.okupansi,
    (p.kapasitas - p.okupansi)              AS sisa_kapasitas,
    COUNT(k.id)                              AS jumlah_kamar,
    SUM(CASE WHEN k.penghuni_saat_ini >= k.kapasitas THEN 1 ELSE 0 END)
                                             AS kamar_penuh
FROM posko p
LEFT JOIN kamar k ON k.posko_id = p.id
GROUP BY p.id, p.nama_posko, p.kapasitas, p.okupansi;

-- View: data pengungsi lengkap dengan info kamar & posko
CREATE OR REPLACE VIEW v_pengungsi_detail AS
SELECT
    pg.id,
    pg.nama,
    pg.umur,
    pg.jenis_kelamin,
    pg.anggota_keluarga,
    pg.kondisi_kesehatan,
    k.nama_kamar,
    p.nama_posko
FROM pengungsi pg
LEFT JOIN kamar  k ON k.id = pg.kamar_id
LEFT JOIN posko  p ON p.id = k.posko_id;

-- ============================================================
--  VERIFIKASI DATA
-- ============================================================
SELECT 'admin'     AS tabel, COUNT(*) AS total FROM admin     UNION ALL
SELECT 'posko',              COUNT(*)           FROM posko     UNION ALL
SELECT 'kamar',              COUNT(*)           FROM kamar     UNION ALL
SELECT 'pengungsi',          COUNT(*)           FROM pengungsi;
