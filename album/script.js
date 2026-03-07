// GANTI DENGAN API KEY LAST.FM ANDA
const LASTFM_API_KEY = 'eea65068f43803c9ebf5e09e4c7422c5'; 

let currentBoxIndex = null;
let searchTimeout = null;

// Elemen DOM
const boxes = document.querySelectorAll('.box');
const modal = document.getElementById('search-modal');
const closeBtn = document.querySelector('.close-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const btnDownload = document.getElementById('btn-download');
const btnShare = document.getElementById('btn-share');
const btnHome = document.getElementById('btn-home');
const userNameInput = document.getElementById('user-name');
const dynamicTitle = document.getElementById('dynamic-title');

// 1. Logika Input Nama
if(userNameInput) {
    userNameInput.addEventListener('input', function() {
        const name = this.value.trim();
        dynamicTitle.textContent = name === '' ? "My Favorite Nine" : `${name}'s Favorite Nine`;
    });
}

// 2. Logika Klik Kotak
boxes.forEach(box => {
    box.addEventListener('click', function() {
        currentBoxIndex = this.getAttribute('data-index');
        modal.classList.remove('hidden');
        searchInput.value = ''; 
        searchResults.innerHTML = '<p style="text-align:center; color:#888;">Type to search albums...</p>';
        searchInput.focus();
    });
});

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

// 3. Logika Pencarian ke API Last.fm
searchInput.addEventListener('input', function() {
    const keyword = this.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (keyword.length < 2) {
        searchResults.innerHTML = '<p style="text-align:center; color:#888;">Type to search albums...</p>';
        return;
    }

    searchResults.innerHTML = '<p style="text-align:center; color:#888;">Searching...</p>';

    searchTimeout = setTimeout(() => {
        const url = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(keyword)}&api_key=${LASTFM_API_KEY}&format=json`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const albums = data.results.albummatches.album;
                renderResults(albums);
            })
            .catch(err => {
                console.error("Last.fm API Error:", err);
                searchResults.innerHTML = '<p style="text-align:center; color:red;">Failed to fetch data.</p>';
            });
    }, 500); 
});

// 4. Fungsi Merender Hasil dari Last.fm
function renderResults(albums) {
    searchResults.innerHTML = '';
    
    if (albums.length === 0) {
        searchResults.innerHTML = '<p style="text-align:center; color:#888;">No albums found.</p>';
        return;
    }

    albums.forEach(album => {
        const thumbUrl = album.image[1]['#text'] || album.image[0]['#text'];
        const hdUrl = album.image[3]['#text'] || album.image[2]['#text'] || thumbUrl;

        if (!hdUrl) return; 

        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <img src="${thumbUrl}" alt="${album.name} cover">
            <div>
                <strong style="display:block;">${album.name}</strong>
                <span style="font-size:0.85em; color:#666;">${album.artist}</span>
            </div>
        `;
        
        div.addEventListener('click', () => {
            const targetBox = document.querySelector(`.box[data-index="${currentBoxIndex}"]`);
            
            const boxImage = targetBox.querySelector('.box-image');
            boxImage.innerHTML = `<img src="${hdUrl}" alt="${album.name}">`;
            
            const boxInfo = targetBox.querySelector('.box-info');
            boxInfo.classList.remove('hidden');
            boxInfo.querySelector('.album-title').textContent = album.name;
            boxInfo.querySelector('.album-artist').textContent = album.artist;
            
            targetBox.classList.add('filled'); 
            modal.classList.add('hidden'); 
        });

        searchResults.appendChild(div);
    });
}

// 5. Logika Unduh Sebagai Gambar (TEKNIK KLONING)
btnDownload.addEventListener('click', () => {
    // Tombol diubah jadi teks loading sebentar biar user tahu proses sedang berjalan
    const originalText = btnDownload.textContent;
    btnDownload.textContent = "Downloading...";
    btnDownload.disabled = true;

    // Ambil target asli
    const captureArea = document.getElementById('capture-area');
    
    // Buat kloningan dari kanvas
    const clone = captureArea.cloneNode(true);
    
    // Beri gaya khusus untuk hasil unduhan
    clone.classList.add('export-mode');
    
    // Masukkan ke body (tapi dia bersembunyi di luar layar berkat CSS left: -9999px)
    document.body.appendChild(clone);

    // Render kloningannya!
    html2canvas(clone, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff' // Kunci warna background jadi putih murni
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-9fav.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Hapus kloningan dari layar
        document.body.removeChild(clone);

        // Kembalikan tombol seperti semula
        btnDownload.textContent = originalText;
        btnDownload.disabled = false;
    }).catch(err => {
        console.error("Gagal merender:", err);
        document.body.removeChild(clone);
        btnDownload.textContent = "Error!";
    });
});

// 6. Logika Share
if (btnShare) {
    btnShare.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => alert("Website link has been copied to clipboard!"));
    });
}

// 7. Logika Tombol Home
if (btnHome) {
    btnHome.addEventListener('click', () => {
        window.location.href = '../index.html'; 
    });
}