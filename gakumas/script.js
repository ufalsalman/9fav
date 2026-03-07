let operatorsData = [];
let currentBoxIndex = null;

// Mengambil data dari JSON
fetch('list.json')
    .then(response => response.json())
    .then(data => {
        operatorsData = data;
    })
    .catch(error => console.error("Error loading JSON:", error));

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

// 1. Logika Input Nama (Mengubah Judul)
userNameInput.addEventListener('input', function() {
    const name = this.value.trim();
    if (name === '') {
        dynamicTitle.textContent = "My Favorite Nine";
    } else {
        dynamicTitle.textContent = `${name}'s Favorite Nine`;
    }
});

// 2. Logika Klik Kotak untuk Buka Modal
boxes.forEach(box => {
    box.addEventListener('click', function() {
        currentBoxIndex = this.getAttribute('data-index');
        modal.classList.remove('hidden');
        searchInput.value = ''; 
        renderResults(operatorsData); 
        searchInput.focus();
    });
});

// 3. Logika Menutup Modal (Bisa dengan tombol X atau klik di luar kotak putih)
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// 4. Logika Pencarian
searchInput.addEventListener('input', function() {
    const keyword = this.value.toLowerCase();
    const filtered = operatorsData.filter(op => 
        op.name.toLowerCase().includes(keyword)
    );
    renderResults(filtered);
});

// 5. Fungsi Merender Daftar Pencarian
function renderResults(data) {
    searchResults.innerHTML = '';
    
    // Tentukan path folder gambar di sini
    const imageBasePath = 'images/'; 
    
    data.forEach(op => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        div.innerHTML = `
            <img src="${imageBasePath}${op.image}" alt="${op.name}">
            <span>${op.name}</span>
        `;
        
        // Logika Memilih Operator
        div.addEventListener('click', () => {
            const targetBox = document.querySelector(`.box[data-index="${currentBoxIndex}"]`);
            
            // Masukkan gambar dan timpa placeholder
            targetBox.innerHTML = `<img src="${imageBasePath}${op.image}" alt="${op.name}" title="${op.name}">`;
            
            // Tambahkan class agar garis putus-putus hilang
            targetBox.classList.add('filled'); 
            
            modal.classList.add('hidden'); 
        });

        searchResults.appendChild(div);
    });
}

// 6. Logika Unduh Sebagai Gambar (dengan tambahan "scale" agar lebih jernih)
btnDownload.addEventListener('click', () => {
    const captureArea = document.getElementById('capture-area');
    const urlText = document.getElementById('website-url');

    // 1. Munculkan sementara sebelum dijepret
    urlText.style.display = 'block';

    html2canvas(captureArea, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-9fav.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 2. Sembunyikan lagi setelah selesai render
        urlText.style.display = 'none';
    });
});

// 7. Logika Bagikan Tautan
btnShare.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Website link has been copied to clipboard!");
    });
});

// Logika untuk kembali ke halaman utama (root)
if (btnHome) {
    btnHome.addEventListener('click', () => {
        // '../' berarti naik satu level folder ke root
        window.location.href = '../index.html'; 
    });
}