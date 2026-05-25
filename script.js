var API_URL = 'https://script.google.com/macros/s/AKfycbz4UvN8c09Mv8ShudywG2YVp3E-mB1mwUUerT9EfhbJHHaFWDvWbxI_iLABoMZvhXkAKA/exec';
var FANBASE_DATA = {
    name: "LibRaly",
    tagline: "Official Fanbase of Ralyne Van Irawan",
    description: "LibRaly adalah fanbase tidak resmi yang didedikasikan untuk mendukung Ralyne Van Irawan — Trainee JKT48 Gen 14.",
    foundedDate: "2025-01-18",
    registrationOpen: false,
    registrationLink: '',
    faq: [],
    members: []
};

var GALLERY_RALYNE = [], GALLERY_RALVANDRA = [], SCHEDULE_DATA = { upcoming: [], tickets: [], unitSongs: [] };
var HASHTAG_DATA = [], FUNFACT_DATA = [], VIDEO_DATA = [], LETTER_DATA = [], NIGHTSKY_DATA = [];
var RESCHEDULE_DATA = [];

function escapeHtml(text) {
    if (!text) return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
}

function parseIDDate(str) {
    if (!str) return null;
    var bulanMap = { 'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11, 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'agu': 7, 'aug': 7, 'sep': 8, 'okt': 9, 'oct': 9, 'nov': 10, 'des': 11, 'dec': 11 };
    var clean = String(str).trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    var parts = clean.split(/\s+/);
    if (parts.length < 3) return null;
    var day = parseInt(parts[0], 10);
    var month = bulanMap[parts[1]];
    var year = parseInt(parts[2], 10);
    if (isNaN(day) || month === undefined || isNaN(year)) return null;
    return new Date(year, month, day);
}

function loadHashtags() { return fetch(API_URL + '?action=readHashtags&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data) && data.length > 0) { HASHTAG_DATA = data.map(function (row) { return { desc: row.keterangan || '', tag: row.hashtag || '' }; }).filter(function (h) { return h.tag.length > 0; }); } }).catch(function () { }); }
function loadFunFacts() { return fetch(API_URL + '?action=readFunFacts&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data) && data.length > 0) { FUNFACT_DATA = data.map(function (row) { return { text: row.text || '' }; }).filter(function (f) { return f.text.length > 0; }); } }).catch(function () { }); }
function loadVideos() { return fetch(API_URL + '?action=readVideos&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data) && data.length > 0) { VIDEO_DATA = data.map(function (row) { return { embed: row.link || '', title: row.judul || '', platform: row.platform || '', featured: row.featured === 'TRUE' || row.featured === true }; }).filter(function (v) { return v.embed.length > 0; }); } }).catch(function () { }); }
function loadLetters() { return fetch(API_URL + '?action=readWishes&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) { LETTER_DATA = data.map(function (row) { return { name: row.nama || '', social: row.social || '', message: row.pesan || '', time: row.waktu || '' }; }); } }).catch(function () { }); }
function loadFaq() { return fetch(API_URL + '?action=readFaq&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) { FANBASE_DATA.faq = data.map(function (row) { return { q: row.q || '', a: row.a || '' }; }); } }).catch(function () { }); }
function loadNightSky() { return fetch(API_URL + '?action=readNightSky&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) { NIGHTSKY_DATA = data.map(function (row) { return { id: row.id || '', name: row.nama || '', social: row.social || '', message: row.pesan || '', time: row.waktu || '' }; }); } }).catch(function () { }); }
function loadFanbase() { return fetch(API_URL + '?action=readFanbase&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (data) { FANBASE_DATA.name = data.name || FANBASE_DATA.name; FANBASE_DATA.tagline = data.tagline || FANBASE_DATA.tagline; FANBASE_DATA.description = data.description || FANBASE_DATA.description; FANBASE_DATA.foundedDate = data.foundedDate || FANBASE_DATA.foundedDate; FANBASE_DATA.registrationOpen = data.registrationOpen || false; FANBASE_DATA.registrationLink = data.registrationLink || ''; FANBASE_DATA.members = data.members || []; } }).catch(function () { }); }
function loadGalleryRalyne() { return fetch(API_URL + '?action=readGalleryRalyne&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) GALLERY_RALYNE = data; }).catch(function () { }); }
function loadGalleryRalvandra() { return fetch(API_URL + '?action=readGalleryRalvandra&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) GALLERY_RALVANDRA = data; }).catch(function () { }); }
function loadTickets() { return fetch(API_URL + '?action=readTickets&t=' + Date.now()).then(function (r) { return r.json(); }).then(function (data) { if (Array.isArray(data)) SCHEDULE_DATA.tickets = data; }).catch(function () { }); }

function loadSchedule() {
    return fetch(API_URL + '?action=readSchedule&t=' + Date.now())
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!Array.isArray(data)) return;
            var today = new Date(); today.setHours(0, 0, 0, 0);
            var upcoming = [], unitSongs = [];

            data.forEach(function (d) {
                var parsed = parseIDDate(d.tanggal);
                if (!parsed || parsed >= today) upcoming.push(d);
                if (d.unitSong && String(d.unitSong).trim() !== '') unitSongs.push(d);
            });

            upcoming.sort(function (a, b) {
                var da = parseIDDate(a.tanggal) || new Date(9999, 0, 1);
                var db = parseIDDate(b.tanggal) || new Date(9999, 0, 1);
                return da - db;
            });

            SCHEDULE_DATA.upcoming = upcoming;
            SCHEDULE_DATA.unitSongs = unitSongs;
        }).catch(function () { });
}

function loadReschedule() {
    return fetch(API_URL + '?action=readSchedule&t=' + Date.now())
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!Array.isArray(data) || data.length === 0) return;
            var today = new Date(); today.setHours(0, 0, 0, 0);
            var past = data.filter(function (d) { var p = parseIDDate(d.tanggal); return p && p < today; });
            if (!past.length) { RESCHEDULE_DATA = []; return; }
            var grouped = {};
            past.forEach(function (item) {
                var sName = item.nama || 'Unknown Show', sType = item.tipe || 'OTHER';
                var key = sType.toUpperCase() + ':::' + sName;
                if (!grouped[key]) grouped[key] = { type: sType, name: sName, dates: [] };
                var songsRaw = item.unitSong || '';
                var songsArr = typeof songsRaw === 'string' ? songsRaw.split(/\n/).map(function (s) { return s.trim() }).filter(function (s) { return s !== '' }) : [];
                grouped[key].dates.push({ date: item.tanggal || '', songs: songsArr });
            });
            RESCHEDULE_DATA = Object.values(grouped);
        }).catch(function () { });
}

async function initApp() {
    await Promise.all([loadHashtags(), loadFunFacts(), loadVideos(), loadLetters(), loadFanbase(), loadFaq(), loadGalleryRalyne(), loadGalleryRalvandra(), loadSchedule(), loadTickets(), loadNightSky(), loadReschedule()]);
    renderAllDynamicContent();
}

window.addEventListener('load', function () {
    setTimeout(function () { document.getElementById('introOverlay').classList.add('hide'); }, 1700);
    initApp();
});

function renderAllDynamicContent() {
    renderHashtagsPreview(); renderFunFactsPreview(); renderVideoPreview(); renderUpcoming(); renderTickets(); renderUnitSongs(); renderReschedule(); renderGalRalyne(); renderGalRalvandra(); renderFanbasePage(); renderLetters();
}

function renderHashtagsPreview() {
    var c = document.getElementById('hashtagPreviewContainer'); var badge = document.getElementById('hashtagCountBadge');
    if (!HASHTAG_DATA.length) { c.innerHTML = '<div class="empty-state">Belum ada hashtag.</div>'; if (badge) badge.textContent = '0'; return; }
    if (badge) badge.textContent = HASHTAG_DATA.length;
    c.innerHTML = HASHTAG_DATA.map(function (h) { return '<div class="info-row"><span class="hashtag-pill">#' + escapeHtml(h.tag) + '</span><span class="hashtag-desc">' + escapeHtml(h.desc) + '</span></div>'; }).join('');
}

function renderFunFactsPreview() {
    var c = document.getElementById('funfactContainer'); var badge = document.getElementById('funfactCountBadge');
    if (!FUNFACT_DATA.length) { c.innerHTML = '<div class="empty-state">Belum ada fun fact.</div>'; if (badge) badge.textContent = '0'; return; }
    if (badge) badge.textContent = FUNFACT_DATA.length;
    c.innerHTML = FUNFACT_DATA.map(function (f, i) { return '<div class="sticky-note" style="transform:rotate(' + (i % 2 === 0 ? '-' : '') + (i + 1) + 'deg)"><div class="sticky-note-quote">💡</div><div class="sticky-note-text">' + escapeHtml(f.text) + '</div></div>'; }).join('');
}

function renderVideoPreview() {
    var c = document.getElementById('videoPreviewContainer');
    if (!VIDEO_DATA.length) { c.innerHTML = '<div class="empty-state">Belum ada video.</div>'; return; }
    var feat = VIDEO_DATA.find(function (v) { return v.featured; }) || VIDEO_DATA[0];
    var others = VIDEO_DATA.filter(function (v) { return v !== feat; }).slice(0, 3);
    var html = '<div class="video-featured"><iframe src="' + escapeHtml(feat.embed) + '" allowfullscreen></iframe></div>';
    if (others.length) {
        html += '<div class="video-grid">';
        others.forEach(function (v) { html += '<div class="video-card" data-embed="' + escapeHtml(v.embed) + '" onclick="playVideo(this.dataset.embed)"><div class="video-card-play"><div>▶</div></div><div class="video-card-label">' + escapeHtml(v.title) + '</div></div>'; });
        html += '</div>';
    }
    c.innerHTML = html;
}

function playVideo(url) { if (!url) return; var feat = document.querySelector('.video-featured iframe'); if (feat) feat.src = url; }

function renderUpcoming() {
    var el = document.getElementById('upcomingList');
    if (!SCHEDULE_DATA.upcoming.length) { el.innerHTML = '<div class="empty-state">Belum ada jadwal yang akan datang.</div>'; return; }
    el.innerHTML = SCHEDULE_DATA.upcoming.map(function (u) {
        var tipe = (u.tipe || 'theater').toLowerCase();
        var tagClass = 'utag-theater';
        if (tipe === 'event' || tipe === 'offair') tagClass = 'utag-event';
        else if (tipe === 'digital') tagClass = 'utag-digital';
        else if (tipe === 'concert') tagClass = 'utag-concert';
        else if (tipe === 'vc' || tipe === '2shoot' || tipe === 'mg') tagClass = 'utag-tema';
        var tipeLabel = tipe === '2shoot' ? '2-Shoot' : tipe === 'vc' ? 'VC' : tipe === 'mg' ? 'M&G' : tipe === 'offair' ? 'Off Air' : tipe.charAt(0).toUpperCase() + tipe.slice(1);
        var timeStr = escapeHtml(u.tanggal || ''); if (u.jam) timeStr += ' • ' + escapeHtml(u.jam); if (u.so) timeStr += ' • ' + escapeHtml(u.so);
        var linkHtml = u.link ? '<a href="' + escapeHtml(u.link) + '" target="_blank" style="color:var(--gold-light);font-size:.76rem;text-decoration:none;margin-left:8px">🔗 Beli</a>' : '';
        return '<div class="upcoming-card cat-theater"><div class="upcoming-info"><div class="upcoming-title">' + escapeHtml(u.nama || '') + '</div><div class="upcoming-time">' + timeStr + linkHtml + '</div></div><span class="upcoming-tag ' + tagClass + '">' + tipeLabel + '</span></div>';
    }).join('');
}

function renderTickets() {
    var el = document.getElementById('ticketGrid');
    if (!SCHEDULE_DATA.tickets.length) { el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Belum ada tiket tersedia.</div>'; return; }
    el.innerHTML = SCHEDULE_DATA.tickets.map(function (t) {
        var soldClass = (t.status === 'sold') ? ' ticket-sold-card' : '';
        return '<div class="ticket-card' + soldClass + '"><div class="ticket-top"><div class="ticket-date-block"><div class="ticket-dow">' + escapeHtml(t.dow || '') + '</div><div class="ticket-day">' + escapeHtml(t.day || '') + '</div><div class="ticket-mon">' + escapeHtml(t.mon || '') + '</div></div><div class="ticket-body"><div class="ticket-header"><div><div class="ticket-title">' + escapeHtml(t.title || '') + '</div></div><span class="ticket-type-badge badge-' + escapeHtml(t.type || 'vc') + '">' + escapeHtml(t.typeLabel || t.type || '') + '</span></div><div class="ticket-footer"><div class="ticket-price">' + escapeHtml(t.price || '') + ' <span>' + escapeHtml(t.priceNote || '') + '</span></div><span class="ticket-status status-' + escapeHtml(t.status || 'open') + '"><span class="status-dot"></span>' + escapeHtml(t.statusLabel || t.status || '') + '</span></div></div></div></div>';
    }).join('');
}

function renderUnitSongs() {
    var container = document.getElementById('unitSongContainer');
    if (!SCHEDULE_DATA.unitSongs.length) { container.className = 'unit-song-grid rv'; container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Belum ada unit song tercatat.</div>'; return; }
    var songMap = {};
    SCHEDULE_DATA.unitSongs.forEach(function (s) {
        var raw = (s.unitSong || '').trim(); if (!raw) return;
        raw.split(/\n/).map(function (x) { return x.trim() }).filter(function (x) { return x !== '' }).forEach(function (name) {
            var key = name.toLowerCase(); if (!songMap[key]) songMap[key] = { name: name, count: 0 }; songMap[key].count++;
        });
    });
    var grouped = Object.keys(songMap).map(function (k) { return songMap[k]; }).sort(function (a, b) { return b.count - a.count; });
    var cardsHtml = grouped.map(function (s) { return '<div class="unit-card"><div class="unit-card-counter">' + s.count + 'x</div><div class="unit-card-name">' + escapeHtml(s.name) + '</div></div>'; }).join('');
    if (grouped.length <= 5) { container.className = 'unit-song-grid rv'; container.innerHTML = cardsHtml; } else { container.className = 'unit-song-scroll-wrap rv'; container.innerHTML = '<div class="unit-song-scroll-track">' + cardsHtml + cardsHtml + '</div>'; }
}

var typeConfig = { "THEATER": { icon: "🎭", cls: "theater" }, "SPECIAL EVENT": { icon: "🌟", cls: "event" }, "HANDSHAKE": { icon: "🤝", cls: "hs" }, "FESTIVAL": { icon: "🎪", cls: "fest" }, "LIVE STREAM": { icon: "📺", cls: "stream" }, "CONCERT": { icon: "🎤", cls: "concert" }, "OTHER": { icon: "✦", cls: "other" } };

function renderReschedule() {
    var container = document.getElementById('rescheduleContainer'); var oldDetail = document.getElementById('rescheduleDetailWrapper'); if (oldDetail) oldDetail.remove();
    if (!RESCHEDULE_DATA || RESCHEDULE_DATA.length === 0) { container.innerHTML = '<div class="empty-state">Belum ada riwayat kegiatan tercatat.</div>'; return; }
    var typeCounts = {}; RESCHEDULE_DATA.forEach(function (item) { var t = (item.type || 'OTHER').toUpperCase(); if (!typeCounts[t]) typeCounts[t] = 0; typeCounts[t] += item.dates.length; });
    var summaryHtml = '<div class="sec-header rv"><div class="sec-title sec-title-orange">📊 Ringkasan Aktivitas</div><div class="sec-sub">Total perform berdasarkan tipe kegiatan</div></div>';
    summaryHtml += '<div class="cat-summary rv">';
    for (var type in typeCounts) { var cfg = typeConfig[type] || { icon: "✦", cls: "other" }; summaryHtml += '<div class="cat-summary-card cat-' + cfg.cls + '-s">'; summaryHtml += '<div class="cat-summary-icon">' + cfg.icon + '</div>'; summaryHtml += '<div class="cat-summary-count" data-target="' + typeCounts[type] + '">0</div>'; summaryHtml += '<div class="cat-summary-label">' + escapeHtml(type) + '</div>'; summaryHtml += '</div>'; }
    summaryHtml += '</div><div class="sec-divider sec-divider-orange"></div>';
    var listHtml = '<div class="sec-header rv"><div class="sec-title sec-title-orange">🎬 Detail Kegiatan</div><div class="sec-sub">Klik untuk melihat detail tanggal & unit song</div></div>';
    listHtml += '<div class="show-card-list rv">';
    RESCHEDULE_DATA.forEach(function (item, index) { var cfg = typeConfig[(item.type || 'OTHER').toUpperCase()] || { icon: "✦", cls: "other" }; var totalPerf = item.dates.length; listHtml += '<div class="show-card-item" style="animation-delay:' + (index * 0.08) + 's" onclick="openShowDetail(' + index + ')">'; listHtml += '<div class="show-card-icon sc-' + cfg.cls + '">' + cfg.icon + '</div>'; listHtml += '<div class="show-card-info">'; listHtml += '<div class="show-card-name">' + escapeHtml(item.name) + '</div>'; listHtml += '<div class="show-card-meta"><span class="show-card-type-tag sct-' + cfg.cls + '">' + escapeHtml(item.type) + '</span><span class="show-card-count">' + totalPerf + 'x tampil</span></div></div><div class="show-card-arrow">→</div></div>'; });
    listHtml += '</div>';
    container.innerHTML = '<div id="rescheduleListWrapper">' + summaryHtml + listHtml + '</div>';
    container.querySelectorAll('.rv').forEach(function (el) { rvObs.observe(el); });
}

function openShowDetail(index) {
    var item = RESCHEDULE_DATA[index]; var container = document.getElementById('rescheduleContainer'); var listWrapper = document.getElementById('rescheduleListWrapper');
    var cfg = typeConfig[(item.type || 'OTHER').toUpperCase()] || { icon: "✦", cls: "other" }; var totalPerf = item.dates.length;
    listWrapper.classList.add('hiding');
    setTimeout(function () {
        listWrapper.style.display = 'none';
        var detailHtml = '<div class="reschedule-detail">';
        detailHtml += '<button class="reschedule-back" onclick="closeShowDetail()">← Kembali ke Daftar</button>';
        detailHtml += '<div class="show-detail-header"><div class="show-detail-type-icon sdti-' + cfg.cls + '">' + cfg.icon + '</div><div><div class="show-detail-title">' + escapeHtml(item.name) + '</div><div class="show-detail-subtitle sds-' + cfg.cls + '">' + escapeHtml(item.type) + '</div></div></div>';
        detailHtml += '<div class="show-detail-total">Total: <b>' + totalPerf + 'x tampil</b></div>';
        item.dates.forEach(function (perf, pIndex) {
            detailHtml += '<div class="show-detail-perf"><div class="show-detail-perf-header"><span class="perf-idx">#' + (pIndex + 1) + '</span> ' + escapeHtml(perf.date) + '</div><div class="show-detail-songs">';
            if (perf.songs && perf.songs.length > 0) { perf.songs.forEach(function (song, sIdx) { detailHtml += '<div class="show-detail-song" style="animation-delay:' + (sIdx * 0.06) + 's"><span class="song-label">🎵</span> ' + escapeHtml(song) + '</div>'; }); }
            else { detailHtml += '<div class="show-detail-song-empty">Tidak ada unit song tercatat</div>'; }
            detailHtml += '</div></div>';
        });
        detailHtml += '</div>';
        var detailWrapper = document.createElement('div'); detailWrapper.id = 'rescheduleDetailWrapper'; detailWrapper.innerHTML = detailHtml; container.appendChild(detailWrapper); window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

function closeShowDetail() {
    var container = document.getElementById('rescheduleContainer'); var listWrapper = document.getElementById('rescheduleListWrapper'); var detailWrapper = document.getElementById('rescheduleDetailWrapper');
    if (detailWrapper) {
        detailWrapper.classList.add('closing');
        setTimeout(function () { detailWrapper.remove(); listWrapper.style.display = 'block'; listWrapper.classList.remove('hiding'); listWrapper.classList.add('showing'); setTimeout(function () { listWrapper.classList.remove('showing'); }, 350); triggerResCount(); }, 300);
    }
}

var resCountTriggered = false;
function triggerResCount() { document.querySelectorAll('.cat-summary-count').forEach(function (el) { var target = parseInt(el.getAttribute('data-target')) || 0; animCount(el, target, 800); }); }

var galRalyneSubTab = null, galRalvandraSubTab = null, lbImages = [], lbIndex = 0;
function renderGalRalyne() { renderGalleryView('galRalyneContent', GALLERY_RALYNE, galRalyneSubTab, openGalRalyneSubTab, false); }
function renderGalRalvandra() { renderGalleryView('galRalvandraContent', GALLERY_RALVANDRA, galRalvandraSubTab, openGalRalvandraSubTab, true); }

function renderGalleryView(containerId, galleryData, subTab, setSubTabFn, isPurple) {
    var el = document.getElementById(containerId); if (!el) return;
    if (subTab !== null) { var folder = galleryData.find(function (f) { return f.key === subTab; }); if (folder) { renderGalSubTab(el, folder, isPurple, setSubTabFn); return; } else { setSubTabFn(null); return; } }
    if (!galleryData.length) { el.innerHTML = '<div class="empty-state">Belum ada album galeri.</div>'; return; }
    var html = '<div class="gal-folders-grid">';
    galleryData.forEach(function (folder) {
        var cover = folder.images && folder.images.length > 0 ? folder.images[0].src : ''; var count = folder.images ? folder.images.length : 0; var pClass = isPurple ? ' purple-theme' : ''; var pDot = isPurple ? ' purple' : ''; var pCount = isPurple ? ' purple' : '';
        html += '<div class="gal-folder-card' + pClass + '" onclick="' + setSubTabFn.name + '(\'' + folder.key + '\')"><div class="gal-folder-cover">' + (cover ? '<img src="' + cover + '" alt="' + escapeHtml(folder.label) + '" loading="lazy">' : '') + '<div class="gal-folder-cover-overlay"></div>' + (count > 0 ? '<div class="gal-folder-badge"><span class="gal-folder-badge-dot' + pDot + '"></span>' + count + ' foto</div>' : '') + '</div><div class="gal-folder-info"><div class="gal-folder-icon' + pDot + '"><svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="gal-folder-text"><div class="gal-folder-name">' + escapeHtml(folder.label) + '</div><div class="gal-folder-count' + pCount + '"><span>' + count + '</span> foto</div></div><svg class="gal-folder-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>';
    });
    html += '</div>'; el.innerHTML = html; setTimeout(function () { el.querySelectorAll('.gal-folder-card').forEach(function (c, i) { setTimeout(function () { c.classList.add('visible'); }, i * 100); }); }, 50);
}

function renderGalSubTab(el, folder, isPurple, setSubTabFn) {
    var imgs = folder.images ? folder.images.slice().reverse() : []; var pClass = isPurple ? ' purple-theme' : ''; var galleryType = isPurple ? 'ralvandra' : 'ralyne';
    var html = '<div class="gal-photos-header"><button class="back-btn" onclick="closeGalSubTab(\'' + galleryType + '\')" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h3>' + escapeHtml(folder.label) + '</h3><span class="gal-photos-count">' + imgs.length + ' foto</span></div>';
    if (!imgs.length) { html += '<div class="gal-masonry"><div class="gal-empty">Belum ada foto di album ini.</div></div>'; }
    else { html += '<div class="gal-masonry">'; imgs.forEach(function (img, i) { html += '<div class="gal-item' + pClass + '" onclick="openLightbox(' + i + ')"><div class="gal-item-img-wrap"><img src="' + img.src + '" alt="' + escapeHtml(img.alt || '') + '" loading="lazy"></div><div class="gal-item-overlay"><div class="gal-item-zoom"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div></div></div>'; }); html += '</div>'; }
    el.innerHTML = html; lbImages = imgs; setTimeout(function () { el.querySelectorAll('.gal-item').forEach(function (it, i) { setTimeout(function () { it.classList.add('visible'); }, i * 60); }); }, 50);
}

function openGalRalyneSubTab(key) { galRalyneSubTab = key; renderGalRalyne(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function openGalRalvandraSubTab(key) { galRalvandraSubTab = key; renderGalRalvandra(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function closeGalSubTab(gallery) { if (gallery === 'ralyne') { galRalyneSubTab = null; renderGalRalyne(); } else { galRalvandraSubTab = null; renderGalRalvandra(); } }
function openLightbox(idx) { lbIndex = idx; updateLightbox(); document.getElementById('lightbox').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); document.body.style.overflow = ''; }
function lightboxNav(dir) { lbIndex += dir; if (lbIndex < 0) lbIndex = lbImages.length - 1; if (lbIndex >= lbImages.length) lbIndex = 0; updateLightbox(); }
function updateLightbox() { var img = document.getElementById('lightboxImg'); img.style.opacity = '0'; setTimeout(function () { img.src = lbImages[lbIndex].src; img.alt = lbImages[lbIndex].alt || ''; img.style.opacity = '1'; }, 150); document.getElementById('lbCounter').textContent = (lbIndex + 1) + ' / ' + lbImages.length; document.getElementById('lbPrev').classList.toggle('disabled', lbImages.length <= 1); document.getElementById('lbNext').classList.toggle('disabled', lbImages.length <= 1); }
document.addEventListener('keydown', function (e) { var lb = document.getElementById('lightbox'); if (!lb.classList.contains('active')) return; if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowLeft') lightboxNav(-1); if (e.key === 'ArrowRight') lightboxNav(1); });

function renderFanbasePage() {
    var D = FANBASE_DATA; document.getElementById('fbDescText').textContent = D.description; document.getElementById('fbMemberCount').textContent = D.members.length > 0 ? D.members.length : '—';
    var fd = new Date(D.foundedDate); var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']; document.getElementById('fbFoundedShort').textContent = isNaN(fd.getTime()) ? '—' : fd.getDate() + ' ' + months[fd.getMonth()] + ' ' + fd.getFullYear();
    var faqEl = document.getElementById('fbFaqList');
    if (!D.faq.length) { faqEl.innerHTML = '<div class="empty-state" style="padding:32px 20px"><div style="font-size:1.8rem;margin-bottom:10px;opacity:.4">💬</div><div>Belum ada FAQ yang tersedia saat ini.</div></div>'; }
    else { faqEl.innerHTML = D.faq.map(function (item) { return '<div class="fb-faq-item"><button class="fb-faq-question" onclick="toggleFaq(this)">' + escapeHtml(item.q) + '<svg class="fb-faq-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button><div class="fb-faq-answer"><p>' + escapeHtml(item.a) + '</p></div></div>'; }).join(''); }
    var regStatusEl = document.getElementById('fbRegStatus'), regBtnEl = document.getElementById('fbRegBtn'), regNoteEl = document.getElementById('fbRegNote');
    if (D.registrationOpen) { regStatusEl.className = 'fb-reg-status open'; regStatusEl.innerHTML = '<span class="fb-reg-dot"></span>Open'; regBtnEl.className = 'fb-reg-btn open'; regBtnEl.disabled = false; if (D.registrationLink) { regBtnEl.onclick = function () { window.open(D.registrationLink, '_blank'); }; regNoteEl.textContent = 'Klik tombol untuk mengisi form pendaftaran.'; } else { regBtnEl.onclick = openRegModal; regNoteEl.textContent = 'Data akan diverifikasi oleh admin fanbase.'; } regBtnEl.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Daftar Sekarang'; }
    else { regStatusEl.className = 'fb-reg-status closed'; regStatusEl.innerHTML = '<span class="fb-reg-dot"></span>Belum Dibuka'; regBtnEl.className = 'fb-reg-btn closed'; regBtnEl.disabled = true; regBtnEl.onclick = null; regBtnEl.innerHTML = 'Belum Dibuka'; regNoteEl.textContent = 'Pendaftaran akan dibuka melalui web admin.'; }
}

function toggleFaq(btn) { var item = btn.closest('.fb-faq-item'); document.querySelectorAll('.fb-faq-item.active').forEach(function (ai) { if (ai !== item) ai.classList.remove('active'); }); item.classList.toggle('active'); }

async function submitRegistration() {
    var n = document.getElementById('regName').value.trim(), s = document.getElementById('regSocial').value.trim(), r = document.getElementById('regReason').value.trim();
    if (!n || !s) { showToast('⚠️ Nama dan akun sosmed harus diisi!'); return; }
    try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addMember', nama: n, social: s, alasan: r }), redirect: 'follow' }); FANBASE_DATA.members.push({ name: n, social: s, date: new Date().toISOString().split('T')[0] }); document.getElementById('regName').value = ''; document.getElementById('regSocial').value = ''; document.getElementById('regReason').value = ''; document.getElementById('regCharCount').textContent = '0'; closeRegModal(); showToast('✅ Pendaftaran berhasil!'); renderFanbasePage(); } catch (e) { showToast('⚠️ Gagal mendaftar. Coba lagi.'); }
}

var cdi;
function startCountdown() { clearInterval(cdi); var u = function () { var n = new Date(), t = new Date(n.getFullYear(), 9, 15); if (n > t) t = new Date(n.getFullYear() + 1, 9, 15); var d = t - n; document.getElementById('bdDays').textContent = String(Math.floor(d / 86400000)).padStart(2, '0'); document.getElementById('bdHours').textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0'); document.getElementById('bdMins').textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'); document.getElementById('bdSecs').textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, '0'); }; u(); cdi = setInterval(u, 1000); }

function renderLetters() {
    var g = document.getElementById('lettersMasonry'), b = document.getElementById('letterCountBadge'); if (b) b.textContent = LETTER_DATA.length;
    if (!LETTER_DATA.length) { g.innerHTML = '<div class="letters-empty"><div class="letters-empty-icon">✉️</div><div class="letters-empty-text"><span>Belum ada surat.</span><span class="letters-empty-highlight">Jadilah yang pertama! 🍃</span></div></div>'; return; }
    var ini = function (n) { return n.charAt(0).toUpperCase(); }; var rots = [-1.8, 1.2, -0.6, 1.6, -1.3, 0.9, -0.8, 1.4, 0.4, -1.1]; var pinRots = [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5, 0.5, -1];
    g.innerHTML = LETTER_DATA.map(function (l, i) { var t = String(l.time).substring(11, 16); var soc = l.social ? '<span class="letter-social">' + (l.social.startsWith('@') ? l.social : '@' + l.social) + '</span>' : ''; return '<div class="letter-card" style="--note-rot:' + rots[i % rots.length] + 'deg;--pin-rot:' + pinRots[i % pinRots.length] + 'deg;animation-delay:' + (i * 0.06) + 's"><div class="letter-card-accent"></div><div class="letter-card-header"><div class="letter-avatar">' + ini(l.name) + '</div><div class="letter-meta"><div class="letter-name">' + escapeHtml(l.name) + '</div>' + soc + '</div><div class="letter-card-time">' + t + '</div></div><div class="letter-msg">' + escapeHtml(l.message) + '</div></div>'; }).join('');
}

async function submitLetter() {
    var n = document.getElementById('fName').value.trim(), s = document.getElementById('fSocial').value.trim(), m = document.getElementById('fMsg').value.trim();
    if (!n || !m) { showToast('⚠️ Nama dan pesan harus diisi!'); return; }
    try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addWish', nama: n, social: s, pesan: m, timestamp: new Date().toISOString() }), redirect: 'follow' }); LETTER_DATA.unshift({ name: n, social: s, message: m, time: new Date().toISOString() }); document.getElementById('fName').value = ''; document.getElementById('fSocial').value = ''; document.getElementById('fMsg').value = ''; document.getElementById('charCount').textContent = '0'; closeLetterForm(); showToast('✅ Surat terkirim!'); renderLetters(); } catch (e) { showToast('⚠️ Gagal mengirim surat. Coba lagi.'); }
}

let nsCanvas, nsCtx, nsStars = [], nsShootingStars = [], nsAnimFrame = null, nsTime = 0, nsInitialized = false;

class NsStar {
    constructor(x, y, r, data) { this.x = x; this.y = y; this.r = r; this.data = data; this.alpha = Math.random() * 0.5 + 0.5; this.alphaDir = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.008 + 0.002); this.hovered = false; }
    draw(ctx) { this.alpha += this.alphaDir; if (this.alpha >= 1) { this.alpha = 1; this.alphaDir *= -1; } if (this.alpha <= 0.3) { this.alpha = 0.3; this.alphaDir *= -1; } let r = this.hovered ? this.r * 1.8 : this.r; let glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4); glow.addColorStop(0, `rgba(245, 230, 163, ${this.alpha * 0.9})`); glow.addColorStop(0.4, `rgba(212, 175, 55, ${this.alpha * 0.3})`); glow.addColorStop(1, 'rgba(212, 175, 55, 0)'); ctx.beginPath(); ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill(); ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 245, ${this.alpha})`; ctx.fill(); }
    isHover(x, y) { return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) < this.r * 4; }
}

class NsShootingStar {
    constructor(w, h) { this.x = Math.random() * w * 0.8; this.y = Math.random() * h * 0.4; this.len = Math.random() * 80 + 40; this.speed = Math.random() * 10 + 6; this.angle = Math.PI / 4; this.alpha = 1; }
    draw(ctx) { let tailX = this.x - this.len * Math.cos(this.angle); let tailY = this.y - this.len * Math.sin(this.angle); let grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y); grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(1, `rgba(255,255,240,${this.alpha})`); ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(this.x, this.y); ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke(); this.x += this.speed * Math.cos(this.angle); this.y += this.speed * Math.sin(this.angle); this.alpha -= 0.015; }
}

function initNightSky() { nsCanvas = document.getElementById('nightskyCanvas'); if (!nsCanvas) return; nsCtx = nsCanvas.getContext('2d'); resizeNsCanvas(); if (!nsInitialized) { window.addEventListener('resize', resizeNsCanvas); nsCanvas.addEventListener('mousemove', nsMouseMove); nsCanvas.addEventListener('click', nsClick); nsCanvas.addEventListener('touchstart', nsTouchClick, { passive: true }); nsInitialized = true; } nsStars = []; NIGHTSKY_DATA.forEach(function (l) { nsStars.push(new NsStar(Math.random() * nsCanvas.width, Math.random() * nsCanvas.height, Math.random() * 1.5 + 1, l)); }); updateNsCounter(); nsAnimate(); }
function updateNsCounter() { let el = document.getElementById('nsCounterNum'); if (el) el.textContent = NIGHTSKY_DATA.length; let emptyEl = document.getElementById('nsEmptyState'); let hintEl = document.querySelector('.nightsky-hint'); if (NIGHTSKY_DATA.length === 0) { if (emptyEl) emptyEl.classList.remove('hidden'); if (hintEl) hintEl.style.display = 'none'; } else { if (emptyEl) emptyEl.classList.add('hidden'); if (hintEl) hintEl.style.display = ''; } }
function resizeNsCanvas() { if (!nsCanvas) return; let wrap = nsCanvas.parentElement; nsCanvas.width = wrap.clientWidth; nsCanvas.height = wrap.clientHeight; }
function nsMouseMove(e) { let rect = nsCanvas.getBoundingClientRect(); let x = e.clientX - rect.left, y = e.clientY - rect.top; let found = false; nsStars.forEach(s => { s.hovered = s.isHover(x, y); if (s.hovered && s.data) found = true; }); nsCanvas.style.cursor = found ? 'pointer' : 'crosshair'; }
function nsClick(e) { let rect = nsCanvas.getBoundingClientRect(); let x = e.clientX - rect.left, y = e.clientY - rect.top; nsStars.forEach(s => { if (s.isHover(x, y) && s.data) openStarPopup(s.data); }); }
function nsTouchClick(e) { let rect = nsCanvas.getBoundingClientRect(); let t = e.touches[0]; let x = t.clientX - rect.left, y = t.clientY - rect.top; nsStars.forEach(s => { if (s.isHover(x, y) && s.data) openStarPopup(s.data); }); }
function nsAnimate() { if (!nsCtx) return; nsCtx.clearRect(0, 0, nsCanvas.width, nsCanvas.height); nsStars.forEach(s => s.draw(nsCtx)); nsTime++; if (NIGHTSKY_DATA.length > 0 && nsTime % 300 === 0 && Math.random() > 0.4) { nsShootingStars.push(new NsShootingStar(nsCanvas.width, nsCanvas.height)); } for (let i = nsShootingStars.length - 1; i >= 0; i--) { nsShootingStars[i].draw(nsCtx); if (nsShootingStars[i].alpha <= 0) nsShootingStars.splice(i, 1); } nsAnimFrame = requestAnimationFrame(nsAnimate); }
function openStarPopup(data) { document.getElementById('spName').textContent = data.name || 'Anonymous'; document.getElementById('spSocial').textContent = data.social ? (data.social.startsWith('@') ? data.social : '@' + data.social) : ''; document.getElementById('spMsg').textContent = data.message || ''; document.getElementById('spTime').textContent = data.time || ''; document.getElementById('starPopupOverlay').classList.add('active'); }
function closeStarPopup() { document.getElementById('starPopupOverlay').classList.remove('active'); }
function openStarForm() { document.getElementById('starFormModal').classList.add('open'); }
function closeStarForm() { document.getElementById('starFormModal').classList.remove('open'); }
function updateSfCharCount() { let m = document.getElementById('sfMsg'); document.getElementById('sfCharCount').textContent = m.value.length; }

async function submitStar() {
    let name = document.getElementById('sfName').value.trim(), msg = document.getElementById('sfMsg').value.trim(), social = document.getElementById('sfSocial').value.trim();
    if (!name || !msg) { showToast('⚠️ Name and message are required!'); return; }
    showToast('⭐ Sending your star...'); let isFirstStar = NIGHTSKY_DATA.length === 0;
    try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addStar', nama: name, social: social, pesan: msg }), redirect: 'follow' }); let newStarData = { name, social, message: msg, time: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) }; NIGHTSKY_DATA.push(newStarData); if (nsCanvas) { let sx = nsCanvas.width * 0.3 + Math.random() * nsCanvas.width * 0.4; let sy = nsCanvas.height * 0.25 + Math.random() * nsCanvas.height * 0.35; let newStar = new NsStar(sx, sy, Math.random() * 1.5 + 1.2, newStarData); newStar.alpha = 0; nsStars.push(newStar); if (isFirstStar) { let burst = document.createElement('div'); burst.className = 'ns-first-star-burst'; burst.style.left = sx + 'px'; burst.style.top = sy + 'px'; nsCanvas.parentElement.appendChild(burst); setTimeout(() => burst.remove(), 1300); } updateNsCounter(); } closeStarForm(); showToast(isFirstStar ? '🌟 Bintang pertama telah bersinar!' : '✨ Your star is now shining!'); document.getElementById('sfName').value = ''; document.getElementById('sfSocial').value = ''; document.getElementById('sfMsg').value = ''; document.getElementById('sfCharCount').textContent = '0'; } catch (e) { showToast('⚠️ Failed to send star.'); }
}

var navEl = document.getElementById('nav');
function toggleDropdown(e, id) { e.stopPropagation(); var dd = document.getElementById(id); var isOpen = dd.classList.contains('open'); document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); }); if (!isOpen) dd.classList.add('open'); }
function toggleMobDropdown(id) { document.getElementById(id).classList.toggle('open'); }
document.addEventListener('click', function () { document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); }); });

var _currentView = 'view-home';
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    var t = document.getElementById(viewId); if (t) { t.classList.add('active'); t.querySelectorAll('.rv').forEach(function (el) { el.classList.remove('show'); void el.offsetWidth; rvObs.observe(el); }); if (viewId === 'view-archive') setTimeout(animateStatBars, 600); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewId === 'view-home') navEl.classList.add('nav-dark'); else navEl.classList.remove('nav-dark');
    document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); }); var mnl = document.querySelector('.nav-link[data-view="' + viewId + '"]'); if (mnl) mnl.classList.add('active');
    document.querySelectorAll('.nav-dropdown-item').forEach(function (i) { i.classList.toggle('active', i.getAttribute('data-view') === viewId); });
    document.querySelectorAll('.mob-menu-link').forEach(function (l) { l.classList.remove('active'); }); var mml = document.querySelector('.mob-menu-link[data-view="' + viewId + '"]'); if (mml) mml.classList.add('active');
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); }); closeMob();
    if (viewId === 'view-reschedule') { renderReschedule(); triggerResCount(); }
    if (viewId === 'view-gallery-ralyne') { galRalyneSubTab = null; renderGalRalyne(); }
    if (viewId === 'view-gallery-ralvandra') { galRalvandraSubTab = null; renderGalRalvandra(); }
    if (viewId === 'view-fanbase') renderFanbasePage();
    if (viewId === 'view-nightsky') { initNightSky(); } else { if (nsAnimFrame) { cancelAnimationFrame(nsAnimFrame); nsAnimFrame = null; } }
    _currentView = viewId;
}

function openBirthday() { document.getElementById('bdayOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; startCountdown(); renderLetters(); }
function closeBirthday() { document.getElementById('bdayOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function openLetterForm() { document.getElementById('formModal').classList.add('open'); }
function closeLetterForm() { document.getElementById('formModal').classList.remove('open'); }
function openRegModal() { document.getElementById('regModal').classList.add('open'); }
function closeRegModal() { document.getElementById('regModal').classList.remove('open'); }

var burger = document.getElementById('burger'), mobMenu = document.getElementById('mobMenu'), mobOverlay = document.getElementById('mobOverlay'), mobOpen = false;
function toggleMob() { mobOpen = !mobOpen; burger.classList.toggle('open', mobOpen); mobMenu.classList.toggle('open', mobOpen); mobOverlay.classList.toggle('open', mobOpen); document.body.style.overflow = mobOpen ? 'hidden' : ''; }
function closeMob() { if (!mobOpen) return; mobOpen = false; burger.classList.remove('open'); mobMenu.classList.remove('open'); mobOverlay.classList.remove('open'); document.body.style.overflow = ''; }
burger.addEventListener('click', toggleMob); mobOverlay.addEventListener('click', closeMob);
document.getElementById('navBrand').addEventListener('click', function () { switchView('view-home'); });
document.querySelectorAll('.nav-link, .nav-dropdown-item, .mob-menu-link, .mob-dropdown-item').forEach(function (l) { l.addEventListener('click', function (e) { e.preventDefault(); var v = this.getAttribute('data-view'); if (v) switchView(v); }); });

var slides = document.querySelectorAll('.hero-slide'), dots = document.querySelectorAll('.slide-dot'), cur = 0;
setInterval(function () { slides[cur].classList.remove('active-slide'); dots[cur].classList.remove('active-dot'); cur = (cur + 1) % slides.length; slides[cur].classList.add('active-slide'); dots[cur].classList.add('active-dot'); }, 10000);

var jikoStr = "Ready Set Go! Game Play Aku Akan Menghibur Mu. Halo Semuanya Aku Ralyne", jikoEl = document.getElementById('jikoText'), jikoI = 0;
function typeJiko() { if (jikoI < jikoStr.length) { jikoEl.textContent += jikoStr.charAt(jikoI); jikoI++; setTimeout(typeJiko, 35); } }
setTimeout(typeJiko, 2200);

window.addEventListener('scroll', function () { navEl.classList.toggle('scrolled', window.scrollY > 50); document.getElementById('btt').classList.toggle('show', window.scrollY > 400); });
document.getElementById('btt').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

var rvObs = new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('show'); }); }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv').forEach(function (el) { rvObs.observe(el); });

function animCount(id, t, d) { d = d || 2000; var el; if (typeof id === 'string') { el = document.getElementById(id); } else { el = id; } if (!el) return; var s = performance.now(); function tick(n) { var p = Math.min((n - s) / d, 1); el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); }

(function () { var card = document.getElementById('pokecard'), holo = document.getElementById('pokecardHolo'); if (!card || !holo) return; card.addEventListener('mousemove', function (e) { var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; card.style.transform = 'rotateX(' + ((y - r.height / 2) / (r.height / 2) * -12) + 'deg) rotateY(' + ((x - r.width / 2) / (r.width / 2) * 12) + 'deg)'; holo.style.setProperty('--holo-angle', Math.atan2(y - r.height / 2, x - r.width / 2) * (180 / Math.PI) + 'deg'); }); card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform 0.5s ease-out'; setTimeout(function () { card.style.transition = 'transform 0.15s ease-out'; }, 500); }); card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.15s ease-out'; }); })();

function animateStatBars() { document.querySelectorAll('.pokecard-stat-bar').forEach(function (b) { b.style.width = '0'; setTimeout(function () { b.style.width = b.getAttribute('data-width') + '%'; }, 100); }); }
function updateCharCount() { var m = document.getElementById('fMsg'), c = document.getElementById('charCount'); c.textContent = m.value.length; c.style.color = m.value.length >= 280 ? '#eab308' : 'rgba(255,255,255,.2)'; }
function updateRegCharCount() { var m = document.getElementById('regReason'), c = document.getElementById('regCharCount'); c.textContent = m.value.length; }

var toastEl = document.getElementById('toast');
function showToast(m) { toastEl.innerHTML = m; toastEl.classList.add('show'); setTimeout(function () { toastEl.classList.remove('show'); }, 3500); }

document.getElementById('formModal').addEventListener('click', function (e) { if (e.target === this) closeLetterForm(); });
document.getElementById('regModal').addEventListener('click', function (e) { if (e.target === this) closeRegModal(); });
document.getElementById('starFormModal').addEventListener('click', function (e) { if (e.target === this) closeStarForm(); });