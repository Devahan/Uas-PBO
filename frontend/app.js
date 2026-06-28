const API_BASE_URL = (typeof ENV !== 'undefined' ? ENV.API_BASE_URL : 'http://localhost:8080/api');

// ── Muat info admin dari sesi ─────────────────────────────────────────────
function loadAdminSession() {
    try {
        const raw = sessionStorage.getItem('siponsika_admin');
        if (!raw) return;
        const admin = JSON.parse(raw);
        const namaEl   = document.getElementById('header-nama');
        const jabatanEl = document.getElementById('header-jabatan');
        const avatarEl  = document.getElementById('header-avatar');
        if (namaEl)    namaEl.textContent    = admin.namaLengkap || admin.username;
        if (jabatanEl) jabatanEl.textContent = admin.jabatan || 'Admin Posko';
        if (avatarEl && admin.avatarUrl) avatarEl.src = admin.avatarUrl;
    } catch (e) { /* ignore */ }
}

// ── Logout ────────────────────────────────────────────────────────────────
async function doLogout() {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (_) { /* tidak masalah jika gagal */ }
    sessionStorage.removeItem('siponsika_admin');
    window.location.replace('login.html');
}

// --- Navigation ---
document.addEventListener('DOMContentLoaded', () => {
    // Muat info admin
    loadAdminSession();

    // Tombol logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });

    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = {
        'dashboard': document.getElementById('section-dashboard'),
        'posko': document.getElementById('section-posko'),
        'pengungsi': document.getElementById('section-pengungsi'),
        'kamar': document.getElementById('section-kamar'),
        'ai': document.getElementById('section-ai')
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            Object.values(sections).forEach(sec => sec.classList.add('hidden'));

            const target = item.getAttribute('data-target');
            if (sections[target]) {
                sections[target].classList.remove('hidden');
                if (target === 'dashboard') loadLaporan();
                if (target === 'posko') loadPoskoData();
                if (target === 'pengungsi') loadPengungsiData();
                if (target === 'kamar') { loadKamarData(); loadPoskoSelect(); }
            }
        });
    });

    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('chat-input').value = btn.innerText;
            sendMessage();
        });
    });

    document.getElementById('btn-add-posko').addEventListener('click', () => openPoskoForm());
    document.getElementById('btn-add-pengungsi').addEventListener('click', () => openPengungsiForm());
    document.getElementById('btn-add-pengungsi-dashboard').addEventListener('click', () => {
        document.querySelector('.sidebar-item[data-target="pengungsi"]').click();
    });
    document.getElementById('btn-add-kamar').addEventListener('click', () => openKamarForm());

    const btnExportLaporan = document.getElementById('btn-export-laporan');
    if (btnExportLaporan) btnExportLaporan.addEventListener('click', exportLaporan);

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', saveModal);

    // Muat data dashboard saat pertama kali
    loadLaporan();
});


// --- Modal ---
let modalMode = null;
let modalEditId = null;

function closeModal() {
    document.getElementById('crud-modal').classList.add('hidden');
    modalMode = null;
    modalEditId = null;
}

function openModal(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('crud-modal').classList.remove('hidden');
}

function saveModal() {
    if (modalMode === 'posko') savePosko();
    else if (modalMode === 'pengungsi') savePengungsi();
    else if (modalMode === 'kamar') saveKamar();
}

// --- LAPORAN ---
async function loadLaporan() {
    try {
        const res = await fetch(`${API_BASE_URL}/laporan`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        document.getElementById('kpi-total-pengungsi').textContent = data.totalPengungsi.toLocaleString();
        document.getElementById('kpi-total-posko').textContent = data.totalPoskoAktif;
        document.getElementById('kpi-sisa-kapasitas').textContent = data.sisaKapasitas.toLocaleString();
        document.getElementById('kpi-kamar-penuh').textContent = data.kamarPenuh;
    } catch (e) {
        console.log('Laporan tidak tersedia');
    }
}

async function exportLaporan() {
    try {
        const btn = document.getElementById('btn-export-laporan');
        if (btn) {
            btn.textContent = 'Mengekspor...';
            btn.disabled = true;
        }

        const [laporanRes, poskoRes, pengungsiRes, kamarRes] = await Promise.all([
            fetch(`${API_BASE_URL}/laporan`),
            fetch(`${API_BASE_URL}/posko`),
            fetch(`${API_BASE_URL}/pengungsi`),
            fetch(`${API_BASE_URL}/kamar`)
        ]);

        if (!laporanRes.ok) throw new Error('API Error');

        const laporanData = await laporanRes.json();
        const poskoData = poskoRes.ok ? await poskoRes.json() : [];
        const pengungsiData = pengungsiRes.ok ? await pengungsiRes.json() : [];
        const kamarData = kamarRes.ok ? await kamarRes.json() : [];

        const poskoMap = {};
        poskoData.forEach(p => poskoMap[p.id] = p.namaPosko);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- Header ---
        doc.setFontSize(18);
        doc.setTextColor(10, 37, 64);
        doc.text('Laporan Komprehensif SIPONSIKA', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Tanggal Laporan: ${new Date().toLocaleString('id-ID')}`, 14, 30);
        
        let finalY = 40;

        // --- 1. Tabel Ikhtisar ---
        doc.setFontSize(14);
        doc.setTextColor(10, 37, 64);
        doc.text('1. Ikhtisar Operasi', 14, finalY);
        doc.autoTable({
            head: [["Indikator", "Nilai"]],
            body: [
                ["Total Pengungsi", laporanData.totalPengungsi.toLocaleString()],
                ["Posko Aktif", laporanData.totalPoskoAktif.toString()],
                ["Kapasitas Tersisa", laporanData.sisaKapasitas.toLocaleString()],
                ["Kamar Penuh", laporanData.kamarPenuh.toString()]
            ],
            startY: finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [10, 37, 64] }
        });
        finalY = doc.lastAutoTable.finalY + 15;

        // --- 2. Tabel Posko ---
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.text('2. Daftar Posko', 14, finalY);
        doc.autoTable({
            head: [["ID", "Nama Posko", "Kapasitas", "Okupansi", "Fasilitas"]],
            body: poskoData.map(p => [p.id, p.namaPosko, p.kapasitas, p.okupansi, p.fasilitas || '-']),
            startY: finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });
        finalY = doc.lastAutoTable.finalY + 15;

        // --- 3. Tabel Kamar ---
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.text('3. Daftar Distribusi Kamar', 14, finalY);
        doc.autoTable({
            head: [["ID", "Nama Kamar", "Posko", "Kapasitas", "Terisi", "Status"]],
            body: kamarData.map(k => {
                const namaPosko = k.poskoId ? (poskoMap[k.poskoId] || k.poskoId) : '-';
                const terisi = k.penghuniSaatIni || 0;
                const penuh = terisi >= k.kapasitas;
                return [k.id, k.namaKamar, namaPosko, k.kapasitas, terisi, penuh ? 'Penuh' : 'Tersedia'];
            }),
            startY: finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] }
        });
        finalY = doc.lastAutoTable.finalY + 15;

        // --- 4. Tabel Pengungsi ---
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.text('4. Daftar Pengungsi', 14, finalY);
        doc.autoTable({
            head: [["ID", "Nama", "Umur", "L/P", "Keluarga", "Kondisi Kesehatan"]],
            body: pengungsiData.map(p => [
                p.id, 
                p.nama, 
                p.umur, 
                p.jenisKelamin, 
                p.anggotaKeluarga || '-', 
                p.kondisiKesehatan || 'Sehat'
            ]),
            startY: finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [230, 126, 34] }
        });

        doc.save('Laporan_Komprehensif_Siponsika.pdf');
        
        if (btn) {
            btn.textContent = 'Ekspor Laporan';
            btn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert('Gagal mengekspor laporan ke PDF');
        const btn = document.getElementById('btn-export-laporan');
        if (btn) { btn.textContent = 'Ekspor Laporan'; btn.disabled = false; }
    }
}

// --- POSKO CRUD ---
function openPoskoForm(data = null) {
    modalMode = 'posko';
    modalEditId = data ? data.id : null;
    const isEdit = !!data;
    openModal(isEdit ? 'Edit Posko' : 'Tambah Posko', `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Nama Posko</label>
            <input id="f-namaPosko" value="${isEdit ? data.namaPosko : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
            <input id="f-alamat" value="${isEdit ? data.alamat : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                <input id="f-kapasitas" type="number" value="${isEdit ? data.kapasitas : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Okupansi</label>
                <input id="f-okupansi" type="number" value="${isEdit ? data.okupansi : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Fasilitas</label>
            <input id="f-fasilitas" value="${isEdit ? (data.fasilitas || '') : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Tenda, MCK, Dapur Umum">
        </div>
    `);
}

async function savePosko() {
    const body = {
        namaPosko: document.getElementById('f-namaPosko').value,
        alamat: document.getElementById('f-alamat').value,
        kapasitas: parseInt(document.getElementById('f-kapasitas').value) || 0,
        okupansi: parseInt(document.getElementById('f-okupansi').value) || 0,
        fasilitas: document.getElementById('f-fasilitas').value
    };
    if (!body.namaPosko) return alert('Nama Posko harus diisi');

    try {
        const url = modalEditId ? `${API_BASE_URL}/posko/${modalEditId}` : `${API_BASE_URL}/posko`;
        const method = modalEditId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        closeModal();
        loadPoskoData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menyimpan data. Pastikan backend berjalan.');
    }
}

async function deletePosko(id) {
    if (!confirm('Hapus posko ini?')) return;
    try {
        await fetch(`${API_BASE_URL}/posko/${id}`, { method: 'DELETE' });
        loadPoskoData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menghapus data.');
    }
}

// --- PENGUNGSI CRUD ---
async function openPengungsiForm(data = null) {
    modalMode = 'pengungsi';
    modalEditId = data ? data.id : null;
    const isEdit = !!data;
    let kamarOptions = '<option value="">-- Tidak Ada --</option>';
    try {
        const res = await fetch(`${API_BASE_URL}/kamar`);
        const kamars = await res.json();
        kamars.forEach(k => {
            const sel = isEdit && data.kamarId == k.id ? 'selected' : '';
            kamarOptions += `<option value="${k.id}" ${sel}>${k.namaKamar} (${k.penghuniSaatIni}/${k.kapasitas})</option>`;
        });
    } catch (e) {}

    openModal(isEdit ? 'Edit Pengungsi' : 'Tambah Pengungsi', `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Nama</label>
            <input id="f-nama" value="${isEdit ? data.nama : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
        </div>
        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Umur</label>
                <input id="f-umur" type="number" value="${isEdit ? data.umur : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select id="f-jenisKelamin" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
                    <option value="Laki-laki" ${isEdit && data.jenisKelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                    <option value="Perempuan" ${isEdit && data.jenisKelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Anggota Keluarga</label>
                <input id="f-anggotaKeluarga" type="number" value="${isEdit ? data.anggotaKeluarga : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Kondisi Kesehatan</label>
            <select id="f-kondisiKesehatan" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
                <option value="Sehat" ${isEdit && data.kondisiKesehatan === 'Sehat' ? 'selected' : ''}>Sehat</option>
                <option value="Luka Ringan" ${isEdit && data.kondisiKesehatan === 'Luka Ringan' ? 'selected' : ''}>Luka Ringan</option>
                <option value="Luka Berat" ${isEdit && data.kondisiKesehatan === 'Luka Berat' ? 'selected' : ''}>Luka Berat</option>
                <option value="Kritis" ${isEdit && data.kondisiKesehatan === 'Kritis' ? 'selected' : ''}>Kritis</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Kamar</label>
            <select id="f-kamarId" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
                ${kamarOptions}
            </select>
        </div>
    `);
}

async function savePengungsi() {
    const kamarIdVal = document.getElementById('f-kamarId').value;
    const body = {
        nama: document.getElementById('f-nama').value,
        umur: parseInt(document.getElementById('f-umur').value) || 0,
        jenisKelamin: document.getElementById('f-jenisKelamin').value,
        anggotaKeluarga: parseInt(document.getElementById('f-anggotaKeluarga').value) || 0,
        kondisiKesehatan: document.getElementById('f-kondisiKesehatan').value,
        kamarId: kamarIdVal ? parseInt(kamarIdVal) : null
    };
    if (!body.nama) return alert('Nama harus diisi');

    try {
        const url = modalEditId ? `${API_BASE_URL}/pengungsi/${modalEditId}` : `${API_BASE_URL}/pengungsi`;
        const method = modalEditId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        closeModal();
        loadPengungsiData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menyimpan data. Pastikan backend berjalan.');
    }
}

async function deletePengungsi(id) {
    if (!confirm('Hapus pengungsi ini?')) return;
    try {
        await fetch(`${API_BASE_URL}/pengungsi/${id}`, { method: 'DELETE' });
        loadPengungsiData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menghapus data.');
    }
}

let pengungsiCache = [];

async function searchPengungsi(query) {
    const tbody = document.getElementById('pengungsi-table-body');
    if (!query.trim()) {
        renderPengungsiTable(pengungsiCache);
        document.getElementById('total-pengungsi-count').textContent = pengungsiCache.length;
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/pengungsi/search?nama=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderPengungsiTable(data);
        document.getElementById('total-pengungsi-count').textContent = data.length;
    } catch (e) {
        const filtered = pengungsiCache.filter(p => p.nama.toLowerCase().includes(query.toLowerCase()));
        renderPengungsiTable(filtered);
        document.getElementById('total-pengungsi-count').textContent = filtered.length;
    }
}

// --- DATA LOADING & RENDERING ---
async function loadPoskoData() {
    const tbody = document.getElementById('posko-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...</td></tr>';
    try {
        const response = await fetch(`${API_BASE_URL}/posko`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        renderPoskoTable(data);
    } catch (error) {
        renderPoskoTable([]);
    }
}

function renderPoskoTable(data) {
    const tbody = document.getElementById('posko-table-body');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">Belum ada data posko. Klik "+ Tambah Posko" untuk menambahkan.</td></tr>';
        return;
    }
    data.forEach(item => {
        const percentage = Math.round((item.okupansi / item.kapasitas) * 100) || 0;
        let barColor = 'bg-brand-blue';
        if (percentage > 90) barColor = 'bg-red-600';
        else if (percentage > 70) barColor = 'bg-brand-orange';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 text-brand-blue font-medium">PK-${item.id}</td>
            <td class="px-6 py-4 font-bold text-slate-800">${item.namaPosko}</td>
            <td class="px-6 py-4 text-slate-500">${item.alamat}</td>
            <td class="px-6 py-4">
                <div class="flex justify-between text-xs mb-1">
                    <span class="font-bold text-slate-700">${item.okupansi} <span class="font-normal text-slate-400">/ ${item.kapasitas}</span></span>
                    <span class="text-slate-500">${percentage}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                    <div class="${barColor} h-1.5 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-500 text-xs">${item.fasilitas || '-'}</td>
            <td class="px-6 py-4">
                <button onclick='openPoskoForm(${JSON.stringify(item).replace(/'/g, "&#39;")})' class="text-brand-blue hover:text-navy-900 mr-3"><i class="fas fa-edit"></i></button>
                <button onclick="deletePosko(${item.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadPengungsiData() {
    const tbody = document.getElementById('pengungsi-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...</td></tr>';
    try {
        const response = await fetch(`${API_BASE_URL}/pengungsi`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        pengungsiCache = data;
        renderPengungsiTable(data);
        document.getElementById('total-pengungsi-count').textContent = data.length;
    } catch (error) {
        pengungsiCache = [];
        renderPengungsiTable([]);
    }
}

function renderPengungsiTable(data) {
    const tbody = document.getElementById('pengungsi-table-body');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-slate-400">Belum ada data pengungsi. Klik "+ Tambah Pengungsi" untuk menambahkan.</td></tr>';
        return;
    }
    data.forEach(item => {
        let badgeClass = 'bg-emerald-100 text-emerald-700';
        if (item.kondisiKesehatan.toLowerCase().includes('luka ringan')) badgeClass = 'bg-amber-100 text-amber-700';
        if (item.kondisiKesehatan.toLowerCase().includes('kritis') || item.kondisiKesehatan.toLowerCase().includes('berat')) badgeClass = 'bg-red-100 text-red-700';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 text-brand-blue font-medium">RF-${item.id}</td>
            <td class="px-6 py-4 font-bold text-slate-800">${item.nama}</td>
            <td class="px-6 py-4">${item.umur}</td>
            <td class="px-6 py-4">${item.jenisKelamin}</td>
            <td class="px-6 py-4">${item.anggotaKeluarga}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}">${item.kondisiKesehatan}</span></td>
            <td class="px-6 py-4">
                <button onclick='openPengungsiForm(${JSON.stringify(item).replace(/'/g, "&#39;")})' class="text-brand-blue hover:text-navy-900 mr-3"><i class="fas fa-edit"></i></button>
                <button onclick="deletePengungsi(${item.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- KAMAR CRUD ---
async function loadPoskoSelect() {
    try {
        const res = await fetch(`${API_BASE_URL}/posko`);
        const poskos = await res.json();
        const filter = document.getElementById('filter-kamar-posko');
        filter.innerHTML = '<option value="">Semua Posko</option>';
        poskos.forEach(p => {
            filter.innerHTML += `<option value="${p.id}">${p.namaPosko}</option>`;
        });
    } catch (e) {}
}

async function loadKamarData() {
    const tbody = document.getElementById('kamar-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-slate-500"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...</td></tr>';
    try {
        const filterPosko = document.getElementById('filter-kamar-posko').value;
        let url = `${API_BASE_URL}/kamar`;
        if (filterPosko) url = `${API_BASE_URL}/kamar/posko/${filterPosko}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const poskoRes = await fetch(`${API_BASE_URL}/posko`);
        const poskoMap = {};
        if (poskoRes.ok) {
            (await poskoRes.json()).forEach(p => { poskoMap[p.id] = p.namaPosko; });
        }

        renderKamarTable(data, poskoMap);
    } catch (e) {
        renderKamarTable([], {});
    }
}

function renderKamarTable(data, poskoMap) {
    const tbody = document.getElementById('kamar-table-body');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-slate-400">Belum ada data kamar.</td></tr>';
        return;
    }
    data.forEach(item => {
        const penuh = item.penghuniSaatIni >= item.kapasitas;
        const statusClass = penuh ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
        const statusText = penuh ? 'Penuh' : 'Tersedia';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 text-brand-blue font-medium">K-${item.id}</td>
            <td class="px-6 py-4 font-bold text-slate-800">${item.namaKamar}</td>
            <td class="px-6 py-4 text-slate-500">${poskoMap[item.poskoId] || 'Posko #'+item.poskoId}</td>
            <td class="px-6 py-4">${item.kapasitas}</td>
            <td class="px-6 py-4">${item.penghuniSaatIni}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusClass}">${statusText}</span></td>
            <td class="px-6 py-4">
                <button onclick='openKamarForm(${JSON.stringify(item).replace(/'/g, "&#39;")})' class="text-brand-blue hover:text-navy-900 mr-3"><i class="fas fa-edit"></i></button>
                <button onclick="deleteKamar(${item.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function openKamarForm(data = null) {
    modalMode = 'kamar';
    modalEditId = data ? data.id : null;
    const isEdit = !!data;

    let poskoOptions = '<option value="">-- Pilih Posko --</option>';
    try {
        const res = await fetch(`${API_BASE_URL}/posko`);
        const poskos = await res.json();
        poskos.forEach(p => {
            const sel = isEdit && data.poskoId == p.id ? 'selected' : '';
            poskoOptions += `<option value="${p.id}" ${sel}>${p.namaPosko}</option>`;
        });
    } catch (e) {}

    openModal(isEdit ? 'Edit Kamar' : 'Tambah Kamar', `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Posko</label>
            <select id="f-poskoId" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
                ${poskoOptions}
            </select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Nama Kamar</label>
            <input id="f-namaKamar" value="${isEdit ? data.namaKamar : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="A-01">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                <input id="f-kapasitasKamar" type="number" value="${isEdit ? data.kapasitas : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Penghuni Saat Ini</label>
                <input id="f-penghuni" type="number" value="${isEdit ? data.penghuniSaatIni : ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none">
            </div>
        </div>
    `);
}

async function saveKamar() {
    const body = {
        poskoId: parseInt(document.getElementById('f-poskoId').value),
        namaKamar: document.getElementById('f-namaKamar').value,
        kapasitas: parseInt(document.getElementById('f-kapasitasKamar').value) || 0,
        penghuniSaatIni: parseInt(document.getElementById('f-penghuni').value) || 0
    };
    if (!body.namaKamar || !body.poskoId) return alert('Nama Kamar dan Posko harus diisi');

    try {
        const url = modalEditId ? `${API_BASE_URL}/kamar/${modalEditId}` : `${API_BASE_URL}/kamar`;
        const method = modalEditId ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        closeModal();
        loadKamarData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menyimpan data. Pastikan backend berjalan.');
    }
}

async function deleteKamar(id) {
    if (!confirm('Hapus kamar ini?')) return;
    try {
        await fetch(`${API_BASE_URL}/kamar/${id}`, { method: 'DELETE' });
        loadKamarData();
        loadLaporan();
    } catch (e) {
        alert('Gagal menghapus data.');
    }
}

// --- CHAT ---
function handleChatEnter(event) {
    if (event.key === 'Enter') sendMessage();
}

function scrollChat() {
    const el = document.getElementById('chat-messages');
    el.scrollTop = el.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';

    const botMsgId = 'bot-' + Date.now();
    const chatMessages = document.getElementById('chat-messages');

    const botDiv = document.createElement('div');
    botDiv.id = botMsgId;
    botDiv.className = 'flex items-start max-w-3xl msg-bot';
    botDiv.innerHTML = `
        <div class="h-8 w-8 bg-brand-blue rounded flex items-center justify-center text-white text-xs shrink-0 mt-1">
            <i class="fas fa-robot"></i>
        </div>
        <div class="ml-4 bg-blue-50/80 border border-blue-100 p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm leading-relaxed shadow-sm min-w-[60px]">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>`;
    chatMessages.appendChild(botDiv);
    scrollChat();

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Gagal terhubung');
        if (!response.body) { throw new Error('Tidak ada response body'); }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        const contentDiv = botDiv.querySelector('div:last-child');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const chunk = line.substring(5);
                    fullText += chunk;
                    const formatted = fullText
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>');
                    contentDiv.innerHTML = formatted;
                    scrollChat();
                }
            }
        }

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        contentDiv.innerHTML += `<div class="text-[10px] text-slate-400 mt-2">${timeString}</div>`;
        scrollChat();

    } catch (error) {
        const contentDiv = botDiv.querySelector('div:last-child');
        contentDiv.innerHTML = 'Maaf, server tidak dapat dihubungi. Pastikan Spring Boot berjalan.';
        scrollChat();
    }
}

function appendMessage(text, sender, id = null) {
    const chatMessages = document.getElementById('chat-messages');
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    if (id) div.id = id;

    if (sender === 'user') {
        div.className = 'flex items-start justify-end max-w-3xl ml-auto msg-user';
        div.innerHTML = `
            <div class="mr-4 bg-brand-blue text-white p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-sm">
                ${text}
                <div class="text-[10px] text-blue-200 mt-2 text-right">${timeString}</div>
            </div>
            <div class="h-8 w-8 bg-brand-orange rounded flex items-center justify-center text-white text-xs shrink-0 mt-1">
                <i class="fas fa-user"></i>
            </div>`;
    } else {
        div.className = 'flex items-start max-w-3xl msg-bot';
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        div.innerHTML = `
            <div class="h-8 w-8 bg-brand-blue rounded flex items-center justify-center text-white text-xs shrink-0 mt-1">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ml-4 bg-blue-50/80 border border-blue-100 p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm leading-relaxed shadow-sm">
                ${formattedText}
                <div class="text-[10px] text-slate-400 mt-2">${timeString}</div>
            </div>`;
    }

    chatMessages.appendChild(div);
    scrollChat();
}
