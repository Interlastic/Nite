const songs = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', color: '#e91e63' },
    { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', color: '#9c27b0' },
    { id: 3, title: 'Dance Monkey', artist: 'Tones and I', duration: '3:29', color: '#2196f3' },
    { id: 4, title: 'Watermelon Sugar', artist: 'Harry Styles', duration: '2:54', color: '#4caf50' },
    { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', color: '#ff9800' },
    { id: 6, title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', color: '#f44336' },
    { id: 7, title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', color: '#00bcd4' },
    { id: 8, title: 'Stay', artist: 'The Kid LAROI', duration: '2:21', color: '#607d8b' }
];

let currentSong = null;
let isPlaying = false;
let currentIndex = 0;
let progress = 0;
let progressInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSongs();
    setupTabs();
});

function loadSongs() {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    
    songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.onclick = () => playSong(index);
        item.innerHTML = `
            <div class="song-art" style="background: ${song.color}">
                <svg viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>
            </div>
            <div class="song-details">
                <div class="song-name">${song.title}</div>
                <div class="song-artist-name">${song.artist}</div>
            </div>
            <div class="song-duration">${song.duration}</div>
        `;
        songList.appendChild(item);
    });
}

function setupTabs() {
    document.querySelectorAll('.music-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.music-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

function playSong(index) {
    currentIndex = index;
    currentSong = songs[index];
    isPlaying = true;
    progress = 0;
    
    document.getElementById('song-title').textContent = currentSong.title;
    document.getElementById('song-artist').textContent = currentSong.artist;
    document.getElementById('album-art').style.background = currentSong.color;
    document.getElementById('total-time').textContent = currentSong.duration;
    
    updatePlayButton();
    startProgress();
    highlightCurrentSong();
}

function togglePlay() {
    if (!currentSong && songs.length > 0) {
        playSong(0);
        return;
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
    
    if (isPlaying) {
        startProgress();
    } else {
        stopProgress();
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (isPlaying) {
        playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
        playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    }
}

function startProgress() {
    stopProgress();
    progressInterval = setInterval(() => {
        progress += 0.5;
        if (progress >= 100) {
            nextSong();
        } else {
            updateProgress();
        }
    }, 100);
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgress() {
    document.getElementById('progress-fill').style.width = progress + '%';
    const currentSeconds = Math.floor((progress / 100) * getDurationSeconds(currentSong.duration));
    document.getElementById('current-time').textContent = formatTime(currentSeconds);
}

function getDurationSeconds(duration) {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function nextSong() {
    currentIndex = (currentIndex + 1) % songs.length;
    playSong(currentIndex);
}

function prevSong() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(currentIndex);
}

function highlightCurrentSong() {
    const items = document.querySelectorAll('.song-item');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.style.background = 'rgba(255, 255, 255, 0.1)';
        } else {
            item.style.background = 'transparent';
        }
    });
}

function closeApp() {
    stopProgress();
    window.location.href = 'index.html';
}