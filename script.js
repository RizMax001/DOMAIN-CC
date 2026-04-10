async function fetchMedia() {
  const url = document.getElementById('tiktok-url').value;
  if (!url) {
    alert("Silakan masukkan URL.");
    return;
  }

  // Menampilkan indikator loading
  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').style.display = 'none';

  // Menentukan endpoint berdasarkan platform
  let apiUrl = '';
  let allowMusicDownload = false; // Variabel untuk mengecek apakah musik bisa diunduh

  if (url.includes('tiktok.com')) {
    apiUrl = `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`;
    allowMusicDownload = true; // TikTok mengizinkan audio
  }
  // Platform lain yang hanya mengizinkan pengunduhan video
  else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    apiUrl = `https://fgsi.dpdns.org/api/downloader/youtube/v2?apikey=fgsiapi-7f1e321-6d&url=${encodeURIComponent(url)}&type=`;
  } else if (url.includes('instagram.com')) {
    apiUrl = `https://fgsi.dpdns.org/api/downloader/instagram?apikey=fgsiapi-7f1e321-6d&url=${encodeURIComponent(url)}`;
  } else if (url.includes('terabox.com')) {
    apiUrl = `https://fgsi.dpdns.org/api/downloader/terabox?apikey=fgsiapi-7f1e321-6d&url=${encodeURIComponent(url)}`;
  } else if (url.includes('capcut.com')) {
    apiUrl = `https://fgsi.dpdns.org/api/downloader/capcut?apikey=fgsiapi-7f1e321-6d&url=${encodeURIComponent(url)}`;
  } else {
    alert("Platform tidak dikenali. Harap masukkan URL yang valid.");
    return;
  }

  // Pengaturan timeout untuk fetch request (misal 10 detik)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);  // Timeout setelah 10 detik

  try {
    const response = await fetch(apiUrl, { signal: controller.signal });
    const data = await response.json();
    clearTimeout(timeoutId); // Bersihkan timeout jika berhasil

    if (data.status) {
      let videoLink, musicLink;

      // Cek apakah hasilnya berasal dari TikTok atau platform lain
      if (url.includes('tiktok.com') && data.result) {
        // TikTok - Dapatkan video dan musik
        videoLink = data.result.download;
        if (allowMusicDownload && data.result.music) {
          musicLink = data.result.music;
        }
      } else if (!url.includes('tiktok.com') && data.data) {
        // Platform lain - Dapatkan hanya video
        videoLink = data.data.url[0].url;
      }

      const resultDiv = document.getElementById('result');
      resultDiv.style.display = 'block';
      document.getElementById('loading').style.display = 'none';

      const videoElement = document.getElementById('video-preview');
      const videoSource = document.getElementById('video-source');
      
      if (videoLink) {
        videoSource.src = videoLink;
        videoElement.load();
      }

      // Tombol unduh hanya aktif jika link video atau musik ada
      document.getElementById('download-video-btn').disabled = !videoLink;
      document.getElementById('download-music-btn').disabled = !musicLink;

      // Menyimpan link download secara global
      window.videoDownloadLink = videoLink;
      window.musicDownloadLink = musicLink;
    } else {
      document.getElementById('loading').style.display = 'none';
      alert("Error: Tidak dapat mengambil media. Periksa URL dan coba lagi.");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    document.getElementById('loading').style.display = 'none';
    console.error('Error:', error);
    alert("Terjadi kesalahan. Mungkin waktu tunggu terlalu lama atau API tidak responsif. Silakan coba lagi.");
  }
}

// Fungsi untuk memulai download otomatis
function autoDownload(type) {
  let downloadLink = type === 'video' ? window.videoDownloadLink : window.musicDownloadLink;

  if (downloadLink) {
    const fileName = generateRandomFilename(type);
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", downloadLink, true);
    xhr.responseType = "blob";
    
    xhr.onload = function() {
      const blob = xhr.response;
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    xhr.send();
  }
}

// Fungsi untuk menghasilkan nama file acak
function generateRandomFilename(type) {
  const randomString = Math.random().toString(36).substring(2, 15); // Membuat string acak
  const extension = type === 'video' ? 'mp4' : 'mp3'; // Menentukan ekstensi berdasarkan jenis media
  return `${randomString}.${extension}`; // Mengembalikan nama file yang diacak
}
