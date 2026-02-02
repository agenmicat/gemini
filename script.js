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
            
            // Perbaikan Thumbnail: Ambil dari detik ke-2 agar tidak blank hitam
            // Format: https://customer-<ID>.cloudflarestream.com/<VIDEO_UID>/thumbnails/thumbnail.jpg?time=2s
            const thumbUrl = `https://customer-${v.uid.split('/')[0]}.cloudflarestream.com/${v.uid}/thumbnails/thumbnail.jpg`;

            const autoDesc = `Video arsip momen ${cleanTitle.toLowerCase()} asli.`;

            const cardHTML = `
                <div class="card" onclick="playVideo('${v.uid}', '${cleanTitle}', '${autoDesc}', ${isShorts})">
                    <div class="thumb-box ${isShorts ? 'ratio-shorts' : 'ratio-regular'}">
                        <img src="${thumbUrl}" alt="${cleanTitle}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x225?text=Loading+Thumb...'">
                    </div>
                    <div class="info">
                        <h3>${cleanTitle}</h3>
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

function playVideo(uid, title, desc, isShorts) {
    document.title = `${title} | My Gallery`;
    document.getElementById('meta-desc').setAttribute('content', desc);

    const modal = document.getElementById('player-modal');
    const wrapper = document.getElementById('video-wrapper');
    
    // Atur lebar modal khusus untuk shorts agar tidak terlalu lebar kesamping
    const modalContent = document.querySelector('.modal-content');
    if (isShorts) {
        modalContent.style.maxWidth = "450px";
        modalContent.style.height = "90vh";
    } else {
        modalContent.style.maxWidth = "1100px";
        modalContent.style.height = "auto";
        modalContent.style.aspectRatio = "16/9";
    }

    wrapper.innerHTML = `
        <iframe src="https://iframe.videodelivery.net/${uid}?autoplay=true" 
            allow="autoplay; encrypted-media; fullscreen;" 
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
