// 1. KONFIGURASI
const WORKER_URL = 'https://videos.agenmicat.workers.dev/'; // Ganti dengan URL Worker-mu

// 2. FUNGSI MEMBERSIHKAN JUDUL (Hapus .mp4 dkk)
function cleanMyTitle(rawName) {
    return rawName
        .replace(/\.(mp4|mov|mkv|webm|avi)$/i, '') // Hapus extension
        .replace(/[-_]/g, ' '); // Ganti - dan _ jadi spasi
}

// 3. FUNGSI AMBIL DATA DARI CLOUDFLARE
async function loadGallery() {
    try {
        const res = await fetch(WORKER_URL);
        const data = await res.json();
        const videos = data.result;

        const shortsCont = document.getElementById('container-shorts');
        const regulerCont = document.getElementById('container-reguler');

        videos.forEach(v => {
            const cleanTitle = cleanMyTitle(v.meta.name || "Untitled Video");
            const isShorts = v.input.width < v.input.height;
            
            // Auto generate deskripsi & tags
            const autoDesc = `Video arsip momen ${cleanTitle.toLowerCase()} asli.`;
            const autoTags = cleanTitle.split(' ')
                                .filter(word => word.length > 3)
                                .map(word => `#${word.toLowerCase()}`)
                                .join(' ');

            const cardHTML = `
                <div class="card" onclick="playVideo('${v.uid}', '${cleanTitle}', '${autoDesc}')">
                    <div class="thumb-box ${isShorts ? 'ratio-shorts' : 'ratio-regular'}">
                        <img src="${v.thumbnail}" alt="${cleanTitle}" loading="lazy">
                    </div>
                    <div class="info">
                        <h3>${cleanTitle}</h3>
                        <p class="desc">${autoDesc}</p>
                        <div class="tags">${autoTags}</div>
                    </div>
                </div>
            `;

            if (isShorts) {
                shortsCont.innerHTML += cardHTML;
            } else {
                regulerCont.innerHTML += cardHTML;
            }
        });
    } catch (e) {
        console.error("Gagal memuat video:", e);
    }
}

// 4. FUNGSI PUTAR VIDEO & UPDATE SEO
function playVideo(uid, title, desc) {
    // Update SEO Meta
    document.title = `${title} | My Gallery`;
    document.getElementById('meta-desc').setAttribute('content', desc);

    const modal = document.getElementById('player-modal');
    const wrapper = document.getElementById('video-wrapper');
    
    wrapper.innerHTML = `
        <iframe src="https://iframe.videodelivery.net/${uid}" 
            style="border:none; width:100%; height:100%; aspect-ratio: inherit;" 
            allowfullscreen></iframe>`;
    
    modal.style.display = 'flex';
}

// 5. TUTUP PLAYER
function closePlayer() {
    document.getElementById('player-modal').style.display = 'none';
    document.getElementById('video-wrapper').innerHTML = '';
}

// Jalankan fungsi saat halaman dibuka
loadGallery();
