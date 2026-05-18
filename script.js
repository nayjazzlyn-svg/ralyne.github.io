      var API_BASE = 'https://script.google.com/macros/s/AKfycbzvN2jrVizwdrrajwHUWBfgf5i7dRH9Igj87l4BoheczBfmqnOgis93U44wojs9r9oQ/exec';

var FANBASE_DATA = {
    name: "LibRaly",
    tagline: "Official Fanbase of Ralyne Van Irawan",
    description: "LibRaly adalah fanbase tidak resmi yang didedikasikan untuk mendukung Ralyne Van Irawan — Trainee JKT48 Gen 14. Kami berkumpul untuk berbagi informasi, mendokumentasikan perjalanan Ralyne, dan menciptakan komunitas yang positif serta suportif bagi sesama Ralynee.",
    foundedDate: "2025-01-18",
    foundedDesc: "LibRaly didirikan pada 18 Januari 2025.",
    registrationOpen: false,
    registrationLink: '',
    faq: [],
    members: []
};

var GALLERY_RALYNE = [];
var GALLERY_RALVANDRA = [];
var SCHEDULE_DATA = { upcoming: [], tickets: [], unitSongs: [], history: {} };

// FIX: Tambah fungsi POST dan getUcapan
var DS = {
    async getHashtags() { try { var r = await fetch(API_BASE + '?path=hashtags&t=' + Date.now()); return r.ok ? await r.json() : []; } catch (e) { console.error('Hashtags error:', e); return []; } },
    async getFunFacts() { try { var r = await fetch(API_BASE + '?path=funfacts&t=' + Date.now()); return r.ok ? await r.json() : []; } catch (e) { console.error('FunFacts error:', e); return []; } },
    async getVideos() { try { var r = await fetch(API_BASE + '?path=videos&t=' + Date.now()); return r.ok ? await r.json() : []; } catch (e) { console.error('Videos error:', e); return []; } },
    async getUcapan() { try { var r = await fetch(API_BASE + '?path=ucapan&t=' + Date.now()); return r.ok ? await r.json() : []; } catch (e) { console.error('Ucapan error:', e); return []; } },
    async post(data) {
        try {
            var r = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data),
                redirect: 'follow'
            });
            var text = await r.text();
            try { return JSON.parse(text); } catch(e) { return { success: true }; }
        } catch (e) { console.error('POST error:', e); return { success: false, error: e.message }; }
    }
};

async function loadFanbaseData() { 
    try { 
        var r = await fetch(API_BASE + '?path=fanbase&t=' + Date.now()); 
        if (!r.ok) return; 
        var d = await r.json(); 
        
        FANBASE_DATA.name = d.name || FANBASE_DATA.name;
        FANBASE_DATA.tagline = d.tagline || FANBASE_DATA.tagline;
        FANBASE_DATA.description = d.description || FANBASE_DATA.description;
        FANBASE_DATA.foundedDate = d.foundedDate || FANBASE_DATA.foundedDate;
        FANBASE_DATA.foundedDesc = d.foundedDesc || FANBASE_DATA.foundedDesc;
        FANBASE_DATA.registrationOpen = d.registrationOpen || false;
        FANBASE_DATA.registrationLink = d.registrationLink || '';
        FANBASE_DATA.faq = d.faq || [];
        FANBASE_DATA.members = d.members || [];
        
        renderFanbasePage(); 
    } catch (e) { console.error('Fanbase Error:', e); } 
}

async function loadGalleryRalyne() { 
    try { 
        var r = await fetch(API_BASE + '?path=gallery/ralyne&t=' + Date.now()); 
        if (!r.ok) return; 
        GALLERY_RALYNE = await r.json();
        renderGalRalyne(); 
    } catch (e) { console.error('Gallery Ralyne Error:', e); } 
}

async function loadGalleryRalvandra() { 
    try { 
        var r = await fetch(API_BASE + '?path=gallery/ralvandra&t=' + Date.now()); 
        if (!r.ok) return; 
        GALLERY_RALVANDRA = await r.json();
        renderGalRalvandra(); 
    } catch (e) { console.error('Gallery Ralvandra Error:', e); } 
}

async function loadSchedule() { 
    try { 
        var r = await fetch(API_BASE + '?path=schedule&t=' + Date.now()); 
        if (!r.ok) return; 
        var d = await r.json();
        
        var upcoming = [], tickets = [], unitSongs = [], history = {};
        
        if (d.upcoming) upcoming = d.upcoming;
        if (d.tickets) tickets = d.tickets;
        
        if (d.unitSongs && Array.isArray(d.unitSongs)) {
            unitSongs = d.unitSongs;
        }
        
        if (d.history && typeof d.history === 'object') {
            var hist = d.history;
            Object.keys(hist).forEach(function(c) {
                if (!hist[c].shows) return;
                if (!history[c]) history[c] = { shows: [] };
                history[c].shows = hist[c].shows.map(function(show) {
                    return {
                        name: show.name || '',
                        count: show.count || 0,
                        dates: (show.dates || []).map(function(dt) {
                            return { day: String(dt.day || ''), mon: dt.mon || dt.month || '', time: dt.time || '' };
                        })
                    };
                });
            });
        }
        
        SCHEDULE_DATA = { upcoming: upcoming, tickets: tickets, unitSongs: unitSongs, history: history };
        renderAll(); 
    } catch (e) { console.error('Schedule Error:', e); } 
}

// FIX: Tambah loadUcapanData
async function loadUcapanData() {
    try {
        var d = await DS.getUcapan();
        if (d && d.length) {
            letters = d.map(function(l) {
                return { name: esc(l.name || ''), social: esc(l.social || ''), message: esc(l.message || ''), time: l.time || '' };
            });
        }
    } catch(e) { console.error('Ucapan load error:', e); }
}

// FIX: Masukkan loadUcapanData ke initApp
async function initApp() { await Promise.all([loadFanbaseData(), loadGalleryRalyne(), loadGalleryRalvandra(), loadSchedule(), rHP(), rHF(), rVP(), loadUcapanData()]); }
function es(i, m) { return '<div class="empty-state"><div style="font-size:2rem;margin-bottom:12px;opacity:.5">' + i + '</div><div>' + m + '</div></div>'; }

window.addEventListener('load', function () { setTimeout(function () { document.getElementById('introOverlay').classList.add('hide'); }, 1700); initApp(); });
var navEl = document.getElementById('nav');

function toggleDropdown(e, id) { e.stopPropagation(); var dd = document.getElementById(id); var isOpen = dd.classList.contains('open'); document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); }); if (!isOpen) dd.classList.add('open'); }
function toggleMobDropdown(id) { document.getElementById(id).classList.toggle('open'); }
document.addEventListener('click', function () { document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); }); });

var _currentView = 'view-home';
var _viewHistory = ['view-home'];

function pushHistoryState(stateData, title) {
    history.pushState(stateData, title || '', '#' + (stateData.view || ''));
}

function switchView(viewId, fromPopState) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    var t = document.getElementById(viewId);
    if (t) {
        t.classList.add('active');
        t.querySelectorAll('.rv').forEach(function (el) { el.classList.remove('show'); void el.offsetWidth; rvObs.observe(el); });
        if (viewId === 'view-archive') setTimeout(animateStatBars, 600);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewId === 'view-home') navEl.classList.add('nav-dark'); else navEl.classList.remove('nav-dark');

    document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
    var mnl = document.querySelector('.nav-link[data-view="' + viewId + '"]'); if (mnl) mnl.classList.add('active');
    var st = document.querySelector('#schedDropdown .nav-dropdown-trigger');
    var gt = document.querySelector('#galleryDropdown .nav-dropdown-trigger');
    if (st) st.classList.toggle('active', viewId === 'view-schedule' || viewId === 'view-reschedule');
    if (gt) gt.classList.toggle('active', viewId === 'view-gallery-ralyne' || viewId === 'view-gallery-ralvandra');
    document.querySelectorAll('.nav-dropdown-item').forEach(function (i) { i.classList.toggle('active', i.getAttribute('data-view') === viewId); });
    document.querySelectorAll('.mob-menu-link').forEach(function (l) { l.classList.remove('active'); });
    var mml = document.querySelector('.mob-menu-link[data-view="' + viewId + '"]'); if (mml) mml.classList.add('active');
    document.querySelectorAll('.mob-dropdown-item').forEach(function (i) { i.classList.toggle('active', i.getAttribute('data-view') === viewId); });
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
    closeMob();

    if (viewId === 'view-reschedule') triggerResCount();
    if (viewId === 'view-gallery-ralyne') { galRalyneSubTab = null; renderGalRalyne(); }
    if (viewId === 'view-gallery-ralvandra') { galRalvandraSubTab = null; renderGalRalvandra(); }
    if (viewId === 'view-hashtags') rHA();
    if (viewId === 'view-funfacts') rHF2();
    if (viewId === 'view-videos') rVA();
    if (viewId === 'view-fanbase') renderFanbasePage();

    if (!fromPopState) {
        _currentView = viewId;
        _viewHistory.push(viewId);
        pushHistoryState({ type: 'view', view: viewId }, viewId);
    } else {
        _currentView = viewId;
    }
}

function openBirthday() {
    document.getElementById('bdayOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    startCountdown();
    renderLetters();
    pushHistoryState({ type: 'overlay', overlay: 'bday' }, 'bday');
}

function closeBirthday(fromPopState) {
    document.getElementById('bdayOverlay').classList.remove('open');
    document.body.style.overflow = '';
    if (!fromPopState) history.back();
}

function openLightbox(idx) {
    lbIndex = idx; updateLightbox();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
    pushHistoryState({ type: 'overlay', overlay: 'lightbox' }, 'lightbox');
}

function closeLightbox(fromPopState) {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
    if (!fromPopState) history.back();
}

function openLetterForm() {
    document.getElementById('formModal').classList.add('open');
    pushHistoryState({ type: 'overlay', overlay: 'formModal' }, 'formModal');
}

function closeLetterForm(fromPopState) {
    document.getElementById('formModal').classList.remove('open');
    if (!fromPopState) history.back();
}

function openRegModal() {
    if (!FANBASE_DATA.registrationOpen) return;
    document.getElementById('regModal').classList.add('open');
    pushHistoryState({ type: 'overlay', overlay: 'regModal' }, 'regModal');
}

function closeRegModal(fromPopState) {
    document.getElementById('regModal').classList.remove('open');
    if (!fromPopState) history.back();
}

function openGalRalyneSubTab(key) {
    galRalyneSubTab = key; renderGalRalyne();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    pushHistoryState({ type: 'galsubtab', gallery: 'ralyne', key: key }, 'galsubtab-ralyne');
}
function openGalRalvandraSubTab(key) {
    galRalvandraSubTab = key; renderGalRalvandra();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    pushHistoryState({ type: 'galsubtab', gallery: 'ralvandra', key: key }, 'galsubtab-ralvandra');
}

function closeGalSubTab(gallery, fromPopState) {
    if (gallery === 'ralyne') { galRalyneSubTab = null; renderGalRalyne(); }
    else if (gallery === 'ralvandra') { galRalvandraSubTab = null; renderGalRalvandra(); }
    if (!fromPopState) history.back();
}

window.addEventListener('popstate', function (e) {
    if (document.getElementById('formModal').classList.contains('open')) { closeLetterForm(true); return; }
    if (document.getElementById('regModal').classList.contains('open')) { closeRegModal(true); return; }
    if (document.getElementById('lightbox').classList.contains('active')) { closeLightbox(true); return; }
    if (document.getElementById('bdayOverlay').classList.contains('open')) { closeBirthday(true); return; }
    if (mobOpen) { closeMob(); return; }
    if (galRalyneSubTab !== null) { galRalyneSubTab = null; renderGalRalyne(); return; }
    if (galRalvandraSubTab !== null) { galRalvandraSubTab = null; renderGalRalvandra(); return; }

    if (e.state && e.state.type === 'view') {
        var targetView = e.state.view;
        if (targetView && targetView !== _currentView) {
            _currentView = targetView;
            document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
            var t = document.getElementById(targetView);
            if (t) {
                t.classList.add('active');
                t.querySelectorAll('.rv').forEach(function (el) { el.classList.remove('show'); void el.offsetWidth; rvObs.observe(el); });
                if (targetView === 'view-archive') setTimeout(animateStatBars, 600);
            }
            if (targetView === 'view-home') navEl.classList.add('nav-dark'); else navEl.classList.remove('nav-dark');
            document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
            var mnl = document.querySelector('.nav-link[data-view="' + targetView + '"]'); if (mnl) mnl.classList.add('active');
            var st2 = document.querySelector('#schedDropdown .nav-dropdown-trigger');
            var gt2 = document.querySelector('#galleryDropdown .nav-dropdown-trigger');
            if (st2) st2.classList.toggle('active', targetView === 'view-schedule' || targetView === 'view-reschedule');
            if (gt2) gt2.classList.toggle('active', targetView === 'view-gallery-ralyne' || targetView === 'view-gallery-ralvandra');
            document.querySelectorAll('.nav-dropdown-item').forEach(function (i) { i.classList.toggle('active', i.getAttribute('data-view') === targetView); });

            if (targetView === 'view-reschedule') triggerResCount();
            if (targetView === 'view-gallery-ralyne') { galRalyneSubTab = null; renderGalRalyne(); }
            if (targetView === 'view-gallery-ralvandra') { galRalvandraSubTab = null; renderGalRalvandra(); }
            if (targetView === 'view-hashtags') rHA();
            if (targetView === 'view-funfacts') rHF2();
            if (targetView === 'view-videos') rVA();
            if (targetView === 'view-fanbase') renderFanbasePage();
        }
    } else if (!e.state) {
        if (_currentView !== 'view-home') { switchView('view-home', true); }
    }
});

pushHistoryState({ type: 'view', view: 'view-home' }, 'view-home');

document.getElementById('navBrand').addEventListener('click', function () { switchView('view-home'); });
document.querySelectorAll('.nav-link').forEach(function (l) { l.addEventListener('click', function (e) { e.preventDefault(); switchView(this.getAttribute('data-view')); }); });
document.querySelectorAll('.nav-dropdown-item').forEach(function (item) { item.addEventListener('click', function (e) { e.preventDefault(); switchView(this.getAttribute('data-view')); }); });
document.querySelectorAll('.mob-menu-link').forEach(function (l) { l.addEventListener('click', function (e) { e.preventDefault(); switchView(this.getAttribute('data-view')); }); });
document.querySelectorAll('.mob-dropdown-item').forEach(function (item) { item.addEventListener('click', function (e) { e.preventDefault(); switchView(this.getAttribute('data-view')); }); });

var slides = document.querySelectorAll('.hero-slide'), dots = document.querySelectorAll('.slide-dot'), cur = 0;
setInterval(function () { slides[cur].classList.remove('active-slide'); dots[cur].classList.remove('active-dot'); cur = (cur + 1) % slides.length; slides[cur].classList.add('active-slide'); dots[cur].classList.add('active-dot'); }, 10000);

var jikoStr = "Ready Set Go! Game Play Aku Akan Menghibur Mu. Halo Semuanya Aku Ralyne", jikoEl = document.getElementById('jikoText'), jikoI = 0;
function typeJiko() { if (jikoI < jikoStr.length) { jikoEl.textContent += jikoStr.charAt(jikoI); jikoI++; setTimeout(typeJiko, 35); } }
setTimeout(typeJiko, 2200);

window.addEventListener('scroll', function () { navEl.classList.toggle('scrolled', window.scrollY > 50); document.getElementById('btt').classList.toggle('show', window.scrollY > 400); });

var burger = document.getElementById('burger'), mobMenu = document.getElementById('mobMenu'), mobOverlay = document.getElementById('mobOverlay'), mobOpen = false;
function toggleMob() { mobOpen = !mobOpen; burger.classList.toggle('open', mobOpen); mobMenu.classList.toggle('open', mobOpen); mobOverlay.classList.toggle('open', mobOpen); document.body.style.overflow = mobOpen ? 'hidden' : ''; }
function closeMob() { if (!mobOpen) return; mobOpen = false; burger.classList.remove('open'); mobMenu.classList.remove('open'); mobOverlay.classList.remove('open'); document.body.style.overflow = ''; }
burger.addEventListener('click', toggleMob); mobOverlay.addEventListener('click', closeMob);

var rvObs = new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('show'); }); }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv').forEach(function (el) { rvObs.observe(el); });

function animCount(id, t, d) { d = d || 2000; var el = document.getElementById(id); if (!el) return; var s = performance.now(); function tick(n) { var p = Math.min((n - s) / d, 1); el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); }
function animCountEl(el, t, d) { d = d || 800; if (!el) return; var s = performance.now(); function tick(n) { var p = Math.min((n - s) / d, 1); el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); }

var fanSt = false; var fObs = new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting && !fanSt) { fanSt = true; animCount('songC', SCHEDULE_DATA.unitSongs.length || 2); var totalShows = 0; Object.keys(SCHEDULE_DATA.history).forEach(function (c) { SCHEDULE_DATA.history[c].shows.forEach(function (s) { totalShows += s.count; }); }); animCount('showC', totalShows || 12); } }); }, { threshold: 0.3 });
var heroEl = document.getElementById('hero'); if (heroEl) fObs.observe(heroEl);

var resSt = false;
function triggerResCount() { if (resSt) return; resSt = true; document.querySelectorAll('.cat-summary-count').forEach(function (el) { var target = parseInt(el.getAttribute('data-target')) || 0; animCountEl(el, target, 800); }); }
var resObs = new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting && !resSt) triggerResCount(); }); }, { threshold: 0.2 });
var resView = document.getElementById('view-reschedule'); if (resView) resObs.observe(resView);

var toastEl = document.getElementById('toast');
function showToast(m) { toastEl.innerHTML = m; toastEl.classList.add('show'); setTimeout(function () { toastEl.classList.remove('show') }, 3500); }
document.getElementById('btt').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

(function () { var card = document.getElementById('pokecard'), holo = document.getElementById('pokecardHolo'); if (!card || !holo) return; card.addEventListener('mousemove', function (e) { var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; card.style.transform = 'rotateX(' + ((y - r.height / 2) / (r.height / 2) * -12) + 'deg) rotateY(' + ((x - r.width / 2) / (r.width / 2) * 12) + 'deg)'; holo.style.setProperty('--holo-angle', Math.atan2(y - r.height / 2, x - r.width / 2) * (180 / Math.PI) + 'deg'); }); card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform 0.5s ease-out'; setTimeout(function () { card.style.transition = 'transform 0.15s ease-out'; }, 500); }); card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.15s ease-out'; }); })();
function animateStatBars() { document.querySelectorAll('.pokecard-stat-bar').forEach(function (b) { b.style.width = '0'; setTimeout(function () { b.style.width = b.getAttribute('data-width') + '%'; }, 100); }); }

async function rHP() { var d = await DS.getHashtags(), c = document.getElementById('hashtagPreviewContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('🏷️', 'Belum ada hashtag.'); return; } c.innerHTML = d.slice(0, 5).map(function (h) { return '<div class="info-row"><span class="hashtag-pill">#' + esc(h.tag || h.name || h) + '</span><span class="hashtag-desc">' + esc(h.desc || '') + '</span></div>'; }).join(''); }
async function rHF() { var d = await DS.getFunFacts(), c = document.getElementById('funfactContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('💡', 'Belum ada fun fact.'); return; } c.innerHTML = d.slice(0, 4).map(function (f, i) { return '<div class="sticky-note" style="transform:rotate(' + (i % 2 === 0 ? '-' : '') + (i + 1) + 'deg)"><div class="sticky-note-quote">💡</div><div class="sticky-note-text">' + esc(f.text || f.fact || f) + '</div></div>'; }).join(''); var lmWrap = document.getElementById('funfactPreviewLoadmore'); if (lmWrap) lmWrap.style.display = d.length > 4 ? '' : 'none'; }
async function rVP() { var d = await DS.getVideos(), c = document.getElementById('videoPreviewContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('🎬', 'Belum ada video.'); return; } var feat = d.find(function (v) { return v.featured; }) || d[0]; var others = d.filter(function (v) { return v !== feat; }).slice(0, 3); var html = '<div class="video-featured"><iframe src="' + esc(feat.embed || feat.url) + '" allowfullscreen></iframe></div>'; if (others.length) { html += '<div class="video-grid">'; others.forEach(function (v) { html += '<div class="video-card" onclick="playVideo(\'' + esc(v.embed || v.url) + '\')"><div class="video-card-play"><div>▶</div></div><div class="video-card-label">' + esc(v.title || 'Video') + '</div></div>'; }); html += '</div>'; } c.innerHTML = html; }
function playVideo(url) { var feat = document.querySelector('.video-featured iframe'); if (feat) feat.src = url; }
async function rHF2() { var d = await DS.getFunFacts(), c = document.getElementById('fullFunfactContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('💡', 'Belum ada fun fact.'); return; } c.innerHTML = d.map(function (f, i) { return '<div class="sticky-note" style="transform:rotate(' + (i % 2 === 0 ? '-' : '') + (i + 1) + 'deg)"><div class="sticky-note-quote">💡</div><div class="sticky-note-text">' + esc(f.text || f.fact || f) + '</div></div>'; }).join(''); }
async function rHA() { var d = await DS.getHashtags(), c = document.getElementById('hashtagFullContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('🏷️', 'Belum ada hashtag.'); return; } c.innerHTML = d.map(function (h) { return '<div class="info-row"><span class="hashtag-pill">#' + esc(h.tag || h.name || h) + '</span><span class="hashtag-desc">' + esc(h.desc || '') + '</span></div>'; }).join(''); }
async function rVA() { var d = await DS.getVideos(), c = document.getElementById('videoFullContainer'); if (!c) return; if (!d.length) { c.innerHTML = es('🎬', 'Belum ada video.'); return; } var feat = d.find(function (v) { return v.featured; }) || d[0]; var others = d.filter(function (v) { return v !== feat; }); var html = '<div class="video-featured"><iframe src="' + esc(feat.embed || feat.url) + '" allowfullscreen></iframe></div>'; if (others.length) { html += '<div class="video-grid">'; others.forEach(function (v) { html += '<div class="video-card" onclick="playVideo(\'' + esc(v.embed || v.url) + '\')"><div class="video-card-play"><div>▶</div></div><div class="video-card-label">' + esc(v.title || 'Video') + '</div></div>'; }); html += '</div>'; } c.innerHTML = html; }

function renderUpcoming() { var el = document.getElementById('upcomingList'); if (!el) return; if (!SCHEDULE_DATA.upcoming.length) { el.innerHTML = '<div class="empty-state">Belum ada jadwal yang akan datang.</div>'; return; } el.innerHTML = SCHEDULE_DATA.upcoming.map(function (u) { return '<div class="upcoming-card cat-theater"><div class="upcoming-date"><div class="d">' + u.day + '</div><div class="m">' + u.month + '</div></div><div class="upcoming-info"><div class="upcoming-title">' + esc(u.title) + '</div><div class="upcoming-time">' + esc(u.time || '') + '</div></div><span class="upcoming-tag utag-theater">' + esc(u.tag || 'Show') + '</span></div>'; }).join(''); }
function renderTickets() { var el = document.getElementById('ticketGrid'); if (!el) return; if (!SCHEDULE_DATA.tickets.length) { el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Belum ada tiket tersedia.</div>'; return; } el.innerHTML = SCHEDULE_DATA.tickets.map(function (t) { var soldClass = t.status === 'sold' ? ' ticket-sold-card' : ''; return '<div class="ticket-card' + soldClass + '"><div class="ticket-top"><div class="ticket-date-block"><div class="ticket-dow">' + esc(t.dow || '') + '</div><div class="ticket-day">' + esc(t.day || '') + '</div><div class="ticket-mon">' + esc(t.mon || '') + '</div></div><div class="ticket-body"><div class="ticket-header"><div><div class="ticket-title">' + esc(t.title || '') + '</div><div class="ticket-subtitle">' + esc(t.subtitle || '') + '</div></div><span class="ticket-type-badge badge-' + esc(t.type || 'vc') + '">' + esc(t.typeLabel || t.type || '') + '</span></div><div class="ticket-meta"><span class="ticket-meta-item"><span class="ticket-meta-icon">🕐</span><span class="ticket-meta-val">' + esc(t.time || '') + '</span></span><span class="ticket-meta-item"><span class="ticket-meta-icon">📍</span><span class="ticket-meta-val">' + esc(t.venue || '') + '</span></span></div><div class="ticket-footer"><div class="ticket-price">' + esc(t.price || '') + ' <span>' + esc(t.priceNote || '') + '</span></div><span class="ticket-status status-' + esc(t.status || 'open') + '"><span class="status-dot"></span>' + esc(t.statusLabel || t.status || '') + '</span></div></div></div></div>'; }).join(''); }
function renderUnitSongs() { var el = document.getElementById('unitScrollTrack'); if (!el) return; if (!SCHEDULE_DATA.unitSongs.length) { el.style.animation = 'none'; el.innerHTML = '<div class="empty-state" style="width:100%;min-width:0;">Belum ada unit song tercatat.</div>'; return; } var cards = SCHEDULE_DATA.unitSongs.map(function (s, i) { return '<div class="unit-card"><div class="unit-card-num">' + (i + 1) + '</div><div class="unit-card-setlist">' + esc(s.setlist || '') + '</div><div class="unit-card-name">' + esc(s.name || '') + '</div><div class="unit-card-original">' + esc(s.original || '') + '</div></div>'; }).join(''); el.innerHTML = cards + cards; el.style.animation = ''; }
function renderReschedule() { var summaryEl = document.getElementById('catSummary'), sectionsEl = document.getElementById('historySections'); if (!summaryEl || !sectionsEl) return; var hist = SCHEDULE_DATA.history, cats = Object.keys(hist); if (!cats.length) { summaryEl.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Belum ada riwayat show tercatat.</div>'; sectionsEl.innerHTML = ''; return; } summaryEl.innerHTML = cats.map(function (c) { var count = 0; hist[c].shows.forEach(function (s) { count += s.count; }); return '<div class="cat-summary-card cat-theater-s"><div class="cat-summary-icon">🎭</div><div class="cat-summary-count" data-target="' + count + '">0</div><div class="cat-summary-label">' + esc(c) + '</div></div>'; }).join(''); sectionsEl.innerHTML = cats.map(function (c) { return '<div class="history-section rv"><div class="history-section-header"><div class="history-section-dot" style="background:var(--gold)"></div><div class="history-section-title" style="color:var(--gold-light)">' + esc(c) + '</div></div><div class="show-accordion">' + hist[c].shows.map(function (show, si) { return '<div class="show-accordion-item"><div class="show-accordion-header" onclick="toggleShowAcc(this)"><div class="show-acc-icon icon-theater">🎭</div><div class="show-acc-info"><div class="show-acc-name">' + esc(show.name || '') + '</div><div class="show-acc-meta"><span>' + show.count + 'x tampil</span></div></div><div class="show-acc-arrow">▼</div></div><div class="show-accordion-body"><div class="show-accordion-inner">' + (show.dates || []).map(function (d) { return '<div class="show-detail-card"><div class="show-detail-date"><div class="d">' + esc(d.day || '') + '</div><div class="m">' + esc(d.mon || '') + '</div></div><div class="show-detail-info"><div class="show-detail-time">' + esc(d.time || '') + '</div></div></div>'; }).join('') + '</div></div></div>'; }).join('') + '</div></div>'; }).join(''); resSt = false; }
function toggleShowAcc(btn) { var item = btn.closest('.show-accordion-item'); if (!item) return; document.querySelectorAll('.show-accordion-item.open').forEach(function (ai) { if (ai !== item) ai.classList.remove('open'); }); item.classList.toggle('open'); }
function renderHeroPeek() { var peek = document.getElementById('heroPeek'); if (!peek) return; if (!SCHEDULE_DATA.upcoming.length) { peek.innerHTML = '<span class="hero-peek-label">Next</span><span class="hero-peek-info">Belum ada jadwal</span>'; return; } var n = SCHEDULE_DATA.upcoming[0]; peek.innerHTML = '<span class="hero-peek-label">Next</span><span class="hero-peek-info"><b>' + esc(n.title || '') + '</b> — ' + esc(n.day || '') + ' ' + esc(n.month || '') + '</span><span class="hero-peek-arrow" onclick="switchView(\'view-schedule\')">→</span>'; }
function renderAll() { renderUpcoming(); renderTickets(); renderUnitSongs(); renderReschedule(); renderHeroPeek(); renderGalRalyne(); renderGalRalvandra(); }
renderAll();

var galRalyneSubTab = null;
var galRalvandraSubTab = null;
var lbImages = []; var lbIndex = 0;

function renderGalleryView(containerId, galleryData, subTab, setSubTabFn, isPurple) {
    var el = document.getElementById(containerId); if (!el) return;
    if (subTab !== null) {
        var folder = galleryData.find(function (f) { return f.key === subTab; });
        if (folder) { renderGalSubTab(el, folder, isPurple, setSubTabFn); return; }
        else { setSubTabFn(null); renderGalleryView(containerId, galleryData, null, setSubTabFn, isPurple); return; }
    }
    if (!galleryData.length) { el.innerHTML = '<div class="empty-state">Belum ada album galeri.</div>'; return; }
    var html = '<div class="gal-folders-grid">';
    galleryData.forEach(function (folder) {
        var cover = folder.images && folder.images.length > 0 ? folder.images[0].src : '';
        var count = folder.images ? folder.images.length : 0;
        html += '<div class="gal-folder-card' + (isPurple ? ' purple-theme' : '') + '" onclick="' + setSubTabFn.name + '(\'' + folder.key + '\')">';
        html += '<div class="gal-folder-cover">' + (cover ? '<img src="' + cover + '" alt="' + folder.label + '" loading="lazy">' : '') + '<div class="gal-folder-cover-overlay"></div>' + (count > 0 ? '<div class="gal-folder-badge"><span class="gal-folder-badge-dot' + (isPurple ? ' purple' : '') + '"></span>' + count + ' foto</div>' : '') + '</div>';
        html += '<div class="gal-folder-info"><div class="gal-folder-icon' + (isPurple ? ' purple' : '') + '"><svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="gal-folder-text"><div class="gal-folder-name">' + folder.label + '</div><div class="gal-folder-count' + (isPurple ? ' purple' : '') + '"><span>' + count + '</span> foto</div></div><svg class="gal-folder-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>';
    });
    html += '</div>'; el.innerHTML = html;
    setTimeout(function () { el.querySelectorAll('.gal-folder-card').forEach(function (c, i) { setTimeout(function () { c.classList.add('visible'); }, i * 100); }); }, 50);
}

function renderGalRalyne() { renderGalleryView('galRalyneContent', GALLERY_RALYNE, galRalyneSubTab, openGalRalyneSubTab, false); }
function renderGalRalvandra() { renderGalleryView('galRalvandraContent', GALLERY_RALVANDRA, galRalvandraSubTab, openGalRalvandraSubTab, true); }

function renderGalSubTab(el, folder, isPurple, setSubTabFn) {
    var imgs = folder.images ? folder.images.slice().reverse() : [];
    var pClass = isPurple ? ' purple-theme' : '';
    var galleryType = isPurple ? 'ralvandra' : 'ralyne';
    var html = '<div class="gal-photos-header"><button class="back-btn" onclick="closeGalSubTab(\'' + galleryType + '\')" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h3>' + folder.label + '</h3><span class="gal-photos-count">' + imgs.length + ' foto</span></div>';
    if (!imgs.length) { html += '<div class="gal-masonry"><div class="gal-empty">Belum ada foto di album ini.</div></div>'; }
    else {
        html += '<div class="gal-masonry">';
        imgs.forEach(function (img, i) {
            html += '<div class="gal-item' + pClass + '" onclick="openLightbox(' + i + ')"><div class="gal-item-img-wrap"><img src="' + img.src + '" alt="' + img.alt + '" loading="lazy"></div><div class="gal-item-overlay"><div class="gal-item-zoom"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div></div></div>';
        }); html += '</div>';
    }
    el.innerHTML = html; lbImages = imgs;
    setTimeout(function () { el.querySelectorAll('.gal-item').forEach(function (it, i) { setTimeout(function () { it.classList.add('visible'); }, i * 60); }); }, 50);
}

function lightboxNav(dir) { lbIndex += dir; if (lbIndex < 0) lbIndex = lbImages.length - 1; if (lbIndex >= lbImages.length) lbIndex = 0; updateLightbox(); }
function updateLightbox() {
    var img = document.getElementById('lightboxImg'); img.style.opacity = '0';
    setTimeout(function () { img.src = lbImages[lbIndex].src; img.alt = lbImages[lbIndex].alt; img.style.opacity = '1'; }, 150);
    document.getElementById('lbCounter').textContent = (lbIndex + 1) + ' / ' + lbImages.length;
    document.getElementById('lbPrev').classList.toggle('disabled', lbImages.length <= 1);
    document.getElementById('lbNext').classList.toggle('disabled', lbImages.length <= 1);
}
document.addEventListener('keydown', function (e) {
    var lb = document.getElementById('lightbox');
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
});

function toggleFaq(btn) { var item = btn.closest('.fb-faq-item'); if (!item) return; document.querySelectorAll('.fb-faq-item.active').forEach(function (ai) { if (ai !== item) ai.classList.remove('active'); }); item.classList.toggle('active'); }

var cdi;
function startCountdown() {
    clearInterval(cdi);
    var u = function () {
        var n = new Date(), t = new Date(n.getFullYear(), 9, 15);
        if (n > t) t = new Date(n.getFullYear() + 1, 9, 15);
        var d = t - n;
        if (d <= 0) { document.getElementById('bdDays').textContent = '00'; document.getElementById('bdHours').textContent = '00'; document.getElementById('bdMins').textContent = '00'; document.getElementById('bdSecs').textContent = '00'; clearInterval(cdi); return; }
        document.getElementById('bdDays').textContent = String(Math.floor(d / 86400000)).padStart(2, '0');
        document.getElementById('bdHours').textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0');
        document.getElementById('bdMins').textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
        document.getElementById('bdSecs').textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
    };
    u(); cdi = setInterval(u, 1000);
}

document.getElementById('formModal').addEventListener('click', function (e) { if (e.target === this) closeLetterForm(); });

var letters = [];
function updateCharCount() { var m = document.getElementById('fMsg'), c = document.getElementById('charCount'); c.textContent = m.value.length; c.style.color = m.value.length >= 280 ? '#eab308' : 'rgba(255,255,255,0.2)'; }
function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// FIX: POST Surat ke Backend
async function submitLetter() {
    var n = document.getElementById('fName').value.trim(), s = document.getElementById('fSocial').value.trim(), m = document.getElementById('fMsg').value.trim();
    if (!n) { showToast('⚠️ Nama harus diisi!'); return; }
    if (!m) { showToast('⚠️ Pesan harus diisi!'); return; }
    
    var result = await DS.post({ action: 'submitLetter', nama: n, social: s, pesan: m, timestamp: new Date().toISOString() });
    
    if (result.success) {
        letters.unshift({ name: esc(n), social: esc(s), message: esc(m), time: new Date().toISOString() });
        document.getElementById('fName').value = ''; document.getElementById('fSocial').value = ''; document.getElementById('fMsg').value = '';
        document.getElementById('charCount').textContent = '0';
        closeLetterForm(); showToast('✅ Surat terkirim!');
        renderLetters();
    } else {
        showToast('⚠️ Gagal mengirim surat. Coba lagi.');
    }
}

// FIX: Load Ucapan dari Backend
async function renderLetters() {
    var g = document.getElementById('lettersMasonry'), b = document.getElementById('letterCountBadge');
    try {
        var backendLetters = await DS.getUcapan();
        if (backendLetters && backendLetters.length) {
            letters = backendLetters.map(function(l) {
                return {
                    name: esc(l.name || l.nama || ''),
                    social: esc(l.social || ''),
                    message: esc(l.message || l.pesan || ''),
                    time: l.time || l.timestamp || new Date().toISOString()
                };
            });
        }
    } catch(e) { console.error('Load letters error:', e); }
    
    b.textContent = letters.length;
    if (!letters.length) {
        g.innerHTML = '<div class="letters-empty"><div class="letters-empty-icon">✉️</div><div class="letters-empty-text"><span>Belum ada surat.</span><span class="letters-empty-highlight">Jadilah yang pertama! 🍃</span></div></div>';
        return;
    }
    var ini = function (n) { return n.charAt(0).toUpperCase(); };
    var rots = [-1.8, 1.2, -0.6, 1.6, -1.3, 0.9, -0.8, 1.4, 0.4, -1.1];
    var pinRots = [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5, 0.5, -1];
    g.innerHTML = letters.map(function (l, i) {
        var t = String(l.time).substring(11, 16); 
        var soc = l.social ? '<span class="letter-social">' + (l.social.startsWith('@') ? l.social : '@' + l.social) + '</span>' : '';
        var rot = rots[i % rots.length]; var pinRot = pinRots[i % pinRots.length];
        return '<div class="letter-card" style="--note-rot:' + rot + 'deg;--pin-rot:' + pinRot + 'deg;animation-delay:' + (i * 0.06) + 's"><div class="letter-card-accent"></div><div class="letter-card-header"><div class="letter-avatar">' + ini(l.name) + '</div><div class="letter-meta"><div class="letter-name">' + l.name + '</div>' + soc + '</div><div class="letter-card-time">' + t + '</div></div><div class="letter-msg">' + l.message + '</div></div>';
    }).join('');
}

function renderFanbasePage() {
    var D = FANBASE_DATA;
    var descEl = document.getElementById('fbDescText');
    if (descEl) descEl.textContent = D.description;
    var mcEl = document.getElementById('fbMemberCount');
    if (mcEl) mcEl.textContent = D.members.length > 0 ? D.members.length : '—';
    var fd = new Date(D.foundedDate);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var fShort = fd.getDate() + ' ' + months[fd.getMonth()] + ' ' + fd.getFullYear();
    var fsEl = document.getElementById('fbFoundedShort');
    if (fsEl) fsEl.textContent = fShort;

    var faqEl = document.getElementById('fbFaqList');
    if (faqEl) {
        if (!D.faq.length) {
            faqEl.innerHTML = '<div class="empty-state" style="padding:32px 20px"><div style="font-size:1.8rem;margin-bottom:10px;opacity:.4">💬</div><div>Belum ada FAQ yang tersedia saat ini.</div><div style="font-size:0.7rem;margin-top:6px;opacity:.4">Nanti akan diisi melalui web admin.</div></div>';
        } else {
            faqEl.innerHTML = D.faq.map(function (item) {
                return '<div class="fb-faq-item"><button class="fb-faq-question" onclick="toggleFaq(this)">' + esc(item.q) + '<svg class="fb-faq-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button><div class="fb-faq-answer"><p>' + esc(item.a) + '</p></div></div>';
            }).join('');
        }
    }

    var regStatusEl = document.querySelector('.fb-reg-status');
    var regBtnEl = document.querySelector('.fb-reg-btn');
    var regNoteEl = document.querySelector('.fb-reg-note');

    if (regStatusEl && regBtnEl) {
        if (D.registrationOpen) {
            regStatusEl.className = 'fb-reg-status open';
            regStatusEl.innerHTML = '<span class="fb-reg-dot"></span>Open';
            regBtnEl.className = 'fb-reg-btn open';
            regBtnEl.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Daftar Sekarang';
            regBtnEl.disabled = false;
            // FIX: Cek link pendaftaran
            if (D.registrationLink) {
                regBtnEl.onclick = function() { window.open(D.registrationLink, '_blank'); };
            } else {
                regBtnEl.onclick = openRegModal;
            }
            if (regNoteEl) regNoteEl.textContent = 'Data akan diverifikasi oleh admin fanbase.';
        } else {
            regStatusEl.className = 'fb-reg-status closed';
            regStatusEl.innerHTML = '<span class="fb-reg-dot"></span>Belum Dibuka';
            regBtnEl.className = 'fb-reg-btn closed';
            regBtnEl.innerHTML = 'Belum Dibuka';
            regBtnEl.disabled = true;
            regBtnEl.onclick = null;
            if (regNoteEl) regNoteEl.textContent = 'Pendaftaran akan dibuka melalui web admin.';
        }
    }

    document.querySelectorAll('#view-fanbase .rv').forEach(function (el) {
        el.classList.remove('show'); void el.offsetWidth; rvObs.observe(el);
    });
}

document.getElementById('regModal').addEventListener('click', function (e) { if (e.target === this) closeRegModal(); });

function updateRegCharCount() {
    var m = document.getElementById('regReason'), c = document.getElementById('regCharCount');
    c.textContent = m.value.length;
    c.style.color = m.value.length >= 180 ? '#eab308' : 'rgba(255,255,255,0.2)';
}

// FIX: POST Pendaftaran Member ke Backend
async function submitRegistration() {
    var n = document.getElementById('regName').value.trim();
    var s = document.getElementById('regSocial').value.trim();
    var r = document.getElementById('regReason').value.trim();
    if (!n) { showToast('⚠️ Nama harus diisi!'); return; }
    if (!s) { showToast('⚠️ Akun sosial media harus diisi!'); return; }
    
    var result = await DS.post({ action: 'addMember', nama: n, social: s, alasan: r });
    
    if (result.success) {
        var now = new Date();
        var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        FANBASE_DATA.members.push({ name: n, social: s, date: dateStr });
        document.getElementById('regName').value = '';
        document.getElementById('regSocial').value = '';
        document.getElementById('regReason').value = '';
        document.getElementById('regCharCount').textContent = '0';
        closeRegModal();
        showToast('✅ Pendaftaran berhasil! Selamat bergabung 💚');
        var mcEl = document.getElementById('fbMemberCount');
        if (mcEl) mcEl.textContent = FANBASE_DATA.members.length;
    } else {
        showToast('⚠️ Gagal mendaftar. Coba lagi.');
    }
}

renderFanbasePage();