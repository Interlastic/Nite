// ============================================
// COLOR PALETTE GENERATOR
// ============================================

class ColorPaletteGenerator {
    constructor() {
        this.currentPalette = [];
        this.lockedColors = new Set();
        this.history = [];
        this.uploadedImage = null;
        this.colorBlindnessMode = null;
        this.maxColors = 6;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadHistory();
        this.createSVGFilters();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    initializeElements() {
        // Upload elements
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeImgBtn = document.getElementById('removeImg');
        this.hiddenCanvas = document.getElementById('hiddenCanvas');

        // Control buttons
        this.generateBtn = document.getElementById('generateBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.clearBtn = document.getElementById('clearBtn');

        // Harmony buttons
        this.harmonyButtons = document.querySelectorAll('.harmony-btn');

        // Palette elements
        this.palette = document.getElementById('palette');
        this.lockAllBtn = document.getElementById('lockAllBtn');
        this.unlockAllBtn = document.getElementById('unlockAllBtn');

        // Export elements
        this.exportButtons = document.querySelectorAll('.export-btn');
        this.exportOutput = document.getElementById('exportOutput');
        this.exportLabel = document.getElementById('exportLabel');
        this.exportContent = document.getElementById('exportContent');
        this.copyExportBtn = document.getElementById('copyExport');

        // History elements
        this.history = document.getElementById('history');

        // Accessibility elements
        this.contrastChecker = document.getElementById('contrastChecker');
        this.colorBlindToggle = document.getElementById('colorBlindToggle');
        this.contrastResults = document.getElementById('contrastResults');
        this.contrastList = document.getElementById('contrastList');

        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.querySelector('.toast-message');
    }

    attachEventListeners() {
        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Image removal
        this.removeImgBtn.addEventListener('click', () => this.removeImage());

        // Control buttons
        this.generateBtn.addEventListener('click', () => this.generatePaletteFromImage());
        this.randomBtn.addEventListener('click', () => this.generateRandomPalette());
        this.clearBtn.addEventListener('click', () => this.clearPalette());

        // Harmony schemes
        this.harmonyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.generateHarmony(btn.dataset.scheme));
        });

        // Lock controls
        this.lockAllBtn.addEventListener('click', () => this.lockAllColors());
        this.unlockAllBtn.addEventListener('click', () => this.unlockAllColors());

        // Export buttons
        this.exportButtons.forEach(btn => {
            btn.addEventListener('click', () => this.exportPalette(btn.dataset.format));
        });
        this.copyExportBtn.addEventListener('click', () => this.copyExport());

        // Accessibility
        this.contrastChecker.addEventListener('click', () => this.checkContrast());
        this.colorBlindToggle.addEventListener('change', (e) => this.toggleColorBlindness(e.target.checked));

        // Click outside to close export
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-section')) {
                this.exportOutput.classList.add('hidden');
                this.exportButtons.forEach(btn => btn.classList.remove('active'));
            }
        });
    }

    // ============================================
    // DRAG AND DROP HANDLING
    // ============================================

    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.previewImg.src = this.uploadedImage;
            this.dropZone.classList.add('hidden');
            this.imagePreview.classList.remove('hidden');
            this.showToast('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.uploadedImage = null;
        this.previewImg.src = '';
        this.fileInput.value = '';
        this.dropZone.classList.remove('hidden');
        this.imagePreview.classList.add('hidden');
    }

    // ============================================
    // COLOR EXTRACTION
    // ============================================

    generatePaletteFromImage() {
        if (!this.uploadedImage) {
            this.showToast('Please upload an image first', 'error');
            return;
        }

        const img = new Image();
        img.onload = () => {
            const colors = this.extractColors(img);
            this.updatePalette(colors);
            this.saveToHistory(colors);
            this.showToast('Palette generated!', 'success');
        };
        img.src = this.uploadedImage;
    }

    extractColors(img) {
        const ctx = this.hiddenCanvas.getContext('2d');
        const maxSize = 100;
        let width = img.width;
        let height = img.height;

        // Scale down for performance
        if (width > maxSize || height > maxSize) {
            if (width > height) {
                height = (height / width) * maxSize;
                width = maxSize;
            } else {
                width = (width / height) * maxSize;
                height = maxSize;
            }
        }

        this.hiddenCanvas.width = width;
        this.hiddenCanvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = [];

        // Sample every 5th pixel for performance
        for (let i = 0; i < imageData.data.length; i += 20) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            
            if (a > 128) { // Skip transparent pixels
                pixels.push({ r, g, b });
            }
        }

        // Use k-means clustering for better color extraction
        return this.kMeansClustering(pixels, this.maxColors);
    }

    // ============================================
    // K-MEANS CLUSTERING ALGORITHM
    // ============================================

    kMeansClustering(pixels, k) {
        if (pixels.length < k) {
            return pixels.map(p => this.rgbToHex(p.r, p.g, p.b));
        }

        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
        }

        const maxIterations = 20;
        for (let iter = 0; iter < maxIterations; iter++) {
            const clusters = Array(k).fill().map(() => []);

            // Assign pixels to nearest centroid
            for (const pixel of pixels) {
                let minDist = Infinity;
                let clusterIndex = 0;

                for (let i = 0; i < centroids.length; i++) {
                    const dist = this.colorDistance(pixel, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        clusterIndex = i;
                    }
                }

                clusters[clusterIndex].push(pixel);
            }

            // Recalculate centroids
            const newCentroids = [];
            for (const cluster of clusters) {
                if (cluster.length === 0) {
                    newCentroids.push(centroids[centroids.indexOf(cluster)]);
                    continue;
                }

                const sumR = cluster.reduce((sum, p) => sum + p.r, 0);
                const sumG = cluster.reduce((sum, p) => sum + p.g, 0);
                const sumB = cluster.reduce((sum, p) => sum + p.b, 0);

                newCentroids.push({
                    r: Math.round(sumR / cluster.length),
                    g: Math.round(sumG / cluster.length),
                    b: Math.round(sumB / cluster.length)
                });
            }

            // Check for convergence
            if (JSON.stringify(centroids) === JSON.stringify(newCentroids)) {
                break;
            }
            centroids = newCentroids;
        }

        // Convert centroids to hex and sort by luminance
        const colors = centroids.map(c => this.rgbToHex(c.r, c.g, c.b));
        colors.sort((a, b) => {
            const lumA = this.calculateLuminance(a);
            const lumB = this.calculateLuminance(b);
            return lumB - lumA;
        });

        return colors;
    }

    colorDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2)
        );
    }

    // ============================================
    // RANDOM PALETTE GENERATION
    // ============================================

    generateRandomPalette() {
        const colors = [];
        for (let i = 0; i < this.maxColors; i++) {
            if (this.lockedColors.has(i) && this.currentPalette[i]) {
                colors.push(this.currentPalette[i]);
            } else {
                colors.push(this.generateRandomColor());
            }
        }
        this.updatePalette(colors);
        this.saveToHistory(colors);
        this.showToast('Random palette generated!', 'success');
    }

    generateRandomColor() {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 40) + 50; // 50-90% saturation
        const l = Math.floor(Math.random() * 40) + 30; // 30-70% lightness
        return this.hslToHex(h, s, l);
    }

    // ============================================
    // COLOR HARMONY GENERATION
    // ============================================

    generateHarmony(scheme) {
        if (this.currentPalette.length === 0) {
            this.showToast('Generate a palette first', 'error');
            return;
        }

        const baseColor = this.currentPalette[0];
        const hsl = this.hexToHSL(baseColor);
        let harmonyColors = [];

        switch (scheme) {
            case 'complementary':
                harmonyColors = [
                    baseColor,
                    this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
                    this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
                    this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
                    this.hslToHex((hsl.h + 180) % 360, hsl.s, Math.min(100, hsl.l + 10)),
                    this.hslToHex((hsl.h + 180) % 360, hsl.s, Math.max(0, hsl.l - 10))
                ];
                break;
            case 'analogous':
                harmonyColors = [
                    baseColor,
                    this.hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 300) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l)
                ];
                break;
            case 'triadic':
                harmonyColors = [
                    baseColor,
                    this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
                    this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
                    this.hslToHex((hsl.h + 120) % 360, hsl.s, Math.min(100, hsl.l + 20)),
                    this.hslToHex((hsl.h + 240) % 360, hsl.s, Math.min(100, hsl.l + 20))
                ];
                break;
            case 'split-complementary':
                harmonyColors = [
                    baseColor,
                    this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
                    this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
                    this.hslToHex((hsl.h + 150) % 360, hsl.s, Math.max(0, hsl.l - 10)),
                    this.hslToHex((hsl.h + 210) % 360, hsl.s, Math.max(0, hsl.l - 10))
                ];
                break;
            case 'tetradic':
                harmonyColors = [
                    baseColor,
                    this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
                    this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
                    this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
                    this.hslToHex((hsl.h + 180) % 360, hsl.s, Math.max(0, hsl.l - 10))
                ];
                break;
        }

        this.updatePalette(harmonyColors);
        this.saveToHistory(harmonyColors);
        this.showToast(`${scheme} harmony generated!`, 'success');
    }

    // ============================================
    // PALETTE DISPLAY & MANAGEMENT
    // ============================================

    updatePalette(colors) {
        this.currentPalette = colors;
        this.renderPalette();
    }

    renderPalette() {
        this.palette.innerHTML = '';

        this.currentPalette.forEach((color, index) => {
            const isLocked = this.lockedColors.has(index);
            const swatch = document.createElement('div');
            swatch.className = `color-swatch ${isLocked ? 'locked' : ''}`;
            swatch.innerHTML = `
                <div class="color-display" style="background-color: ${color}">
                    <button class="lock-btn ${isLocked ? 'locked' : ''}" data-index="${index}">
                        ${isLocked ? '\u{1F512}' : '\u{1F513}'}
                    </button>
                </div>
                <div class="color-info">
                    <div class="color-name">${this.getNearestColorName(color)}</div>
                    <div class="color-values">
                        <div class="color-value">
                            <span>HEX</span>
                            <span>${color}</span>
                        </div>
                        <div class="color-value">
                            <span>RGB</span>
                            <span>${this.hexToRGB(color)}</span>
                        </div>
                        <div class="color-value">
                            <span>HSL</span>
                            <span>${this.hexToHSLString(color)}</span>
                        </div>
                    </div>
                </div>
            `;

            // Click to copy
            swatch.addEventListener('click', (e) => {
                if (!e.target.classList.contains('lock-btn')) {
                    this.copyToClipboard(color);
                }
            });

            // Lock button
            const lockBtn = swatch.querySelector('.lock-btn');
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLock(index);
            });

            this.palette.appendChild(swatch);
        });
    }

    toggleLock(index) {
        if (this.lockedColors.has(index)) {
            this.lockedColors.delete(index);
        } else {
            this.lockedColors.add(index);
        }
        this.renderPalette();
    }

    lockAllColors() {
        for (let i = 0; i < this.currentPalette.length; i++) {
            this.lockedColors.add(i);
        }
        this.renderPalette();
        this.showToast('All colors locked', 'success');
    }

    unlockAllColors() {
        this.lockedColors.clear();
        this.renderPalette();
        this.showToast('All colors unlocked', 'success');
    }

    clearPalette() {
        this.currentPalette = [];
        this.lockedColors.clear();
        this.palette.innerHTML = '<div class="empty-state"><p>No colors yet</p><p>Upload an image or generate random colors</p></div>';
        this.exportOutput.classList.add('hidden');
        this.exportButtons.forEach(btn => btn.classList.remove('active'));
        this.contrastResults.classList.add('hidden');
        this.showToast('Palette cleared', 'success');
    }

    // ============================================
    // COLOR CONVERSION UTILITIES
    // ============================================

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;

        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };

        const r = Math.round(f(0) * 255);
        const g = Math.round(f(8) * 255);
        const b = Math.round(f(4) * 255);

        return this.rgbToHex(r, g, b);
    }

    hexToHSLString(hex) {
        const hsl = this.hexToHSL(hex);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    // ============================================
    // LUMINANCE & CONTRAST CALCULATIONS
    // ============================================

    calculateLuminance(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    calculateContrastRatio(color1, color2) {
        const lum1 = this.calculateLuminance(color1);
        const lum2 = this.calculateLuminance(color2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    getContrastGrade(ratio) {
        if (ratio >= 7) return { grade: 'AAA', class: 'grade-aaa' };
        if (ratio >= 4.5) return { grade: 'AA', class: 'grade-aa' };
        return { grade: 'Fail', class: 'grade-fail' };
    }

    // ============================================
    // ACCESSIBILITY FEATURES
    // ============================================

    checkContrast() {
        if (this.currentPalette.length < 2) {
            this.showToast('Need at least 2 colors', 'error');
            return;
        }

        this.contrastList.innerHTML = '';

        for (let i = 0; i < this.currentPalette.length; i++) {
            for (let j = i + 1; j < this.currentPalette.length; j++) {
                const color1 = this.currentPalette[i];
                const color2 = this.currentPalette[j];
                const ratio = this.calculateContrastRatio(color1, color2);
                const { grade, class: gradeClass } = this.getContrastGrade(ratio);

                const item = document.createElement('div');
                item.className = 'contrast-item';
                item.innerHTML = `
                    <div class="contrast-swatch" style="background-color: ${color1}"></div>
                    <div class="contrast-info">
                        <div class="contrast-ratio">${ratio.toFixed(2)}:1</div>
                        <div class="contrast-grade ${gradeClass}">${grade}</div>
                    </div>
                    <div class="contrast-swatch" style="background-color: ${color2}"></div>
                `;
                this.contrastList.appendChild(item);
            }
        }

        this.contrastResults.classList.remove('hidden');
    }

    createSVGFilters() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('svg-filters');
        svg.innerHTML = `
            <defs>
                <filter id="protanopia-filter">
                    <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"/>
                </filter>
                <filter id="deuteranopia-filter">
                    <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"/>
                </filter>
                <filter id="tritanopia-filter">
                    <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"/>
                </filter>
            </defs>
        `;
        document.body.appendChild(svg);
    }

    toggleColorBlindness(enabled) {
        if (enabled) {
            this.colorBlindnessMode = 'protanopia';
            document.body.classList.add('protanopia');
        } else {
            this.colorBlindnessMode = null;
            document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
        }
    }

    // ============================================
    // NEAREST COLOR NAME
    // ============================================

    getNearestColorName(hex) {
        const namedColors = [
            { name: 'Red', hex: '#FF0000' },
            { name: 'Orange', hex: '#FFA500' },
            { name: 'Yellow', hex: '#FFFF00' },
            { name: 'Green', hex: '#008000' },
            { name: 'Cyan', hex: '#00FFFF' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Purple', hex: '#800080' },
            { name: 'Pink', hex: '#FFC0CB' },
            { name: 'Brown', hex: '#A52A2A' },
            { name: 'Black', hex: '#000000' },
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Gray', hex: '#808080' },
            { name: 'Lime', hex: '#00FF00' },
            { name: 'Navy', hex: '#000080' },
            { name: 'Teal', hex: '#008080' },
            { name: 'Olive', hex: '#808000' },
            { name: 'Maroon', hex: '#800000' },
            { name: 'Aqua', hex: '#00FFFF' },
            { name: 'Fuchsia', hex: '#FF00FF' },
            { name: 'Silver', hex: '#C0C0C0' },
            { name: 'Coral', hex: '#FF7F50' },
            { name: 'Salmon', hex: '#FA8072' },
            { name: 'Tomato', hex: '#FF6347' },
            { name: 'Gold', hex: '#FFD700' },
            { name: 'Khaki', hex: '#F0E68C' },
            { name: 'Plum', hex: '#DDA0DD' },
            { name: 'Orchid', hex: '#DA70D6' },
            { name: 'Violet', hex: '#EE82EE' },
            { name: 'Indigo', hex: '#4B0082' },
            { name: 'Turquoise', hex: '#40E0D0' }
        ];

        let minDistance = Infinity;
        let nearestColor = 'Custom';

        const hsl1 = this.hexToHSL(hex);

        for (const color of namedColors) {
            const hsl2 = this.hexToHSL(color.hex);
            const distance = Math.sqrt(
                Math.pow(hsl1.h - hsl2.h, 2) * 0.5 +
                Math.pow(hsl1.s - hsl2.s, 2) +
                Math.pow(hsl1.l - hsl2.l, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestColor = color.name;
            }
        }

        return nearestColor;
    }

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    exportPalette(format) {
        if (this.currentPalette.length === 0) {
            this.showToast('No palette to export', 'error');
            return;
        }

        let content = '';
        let label = '';

        switch (format) {
            case 'json':
                content = JSON.stringify(this.currentPalette, null, 2);
                label = 'JSON';
                break;
            case 'css':
                content = this.currentPalette.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
                label = 'CSS Variables';
                break;
            case 'tailwind':
                content = `module.exports = {
  theme: {
    extend: {
      colors: {
${this.currentPalette.map((color, i) => `        '${i + 1}': '${color}',`).join('\n')}
      }
    }
  }
}`;
                label = 'Tailwind Config';
                break;
            case 'array':
                content = `['${this.currentPalette.join("', '")}']`;
                label = 'Array';
                break;
        }

        this.exportContent.textContent = content;
        this.exportLabel.textContent = label;
        this.exportOutput.classList.remove('hidden');
        this.exportButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
    }

    copyExport() {
        const content = this.exportContent.textContent;
        this.copyToClipboard(content, 'Export copied!');
    }

    // ============================================
    // HISTORY MANAGEMENT
    // ============================================

    saveToHistory(colors) {
        const entry = {
            colors: [...colors],
            timestamp: Date.now()
        };
        this.history.unshift(entry);
        
        // Keep only last 20 palettes
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistoryToStorage();
        this.renderHistory();
    }

    saveHistoryToStorage() {
        try {
            localStorage.setItem('paletteHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('paletteHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.renderHistory();
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }

    renderHistory() {
        const historyContainer = document.getElementById('history');
        
        if (this.history.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state"><p>No saved palettes</p></div>';
            return;
        }

        historyContainer.innerHTML = '';
        this.history.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const colorsHTML = entry.colors.map(color => 
                `<div style="background-color: ${color}"></div>`
            ).join('');
            
            const date = new Date(entry.timestamp).toLocaleDateString();
            
            item.innerHTML = `
                <div class="history-colors">${colorsHTML}</div>
                <div class="history-info">
                    <div class="history-date">${date}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.updatePalette(entry.colors);
                this.showToast('Palette loaded from history', 'success');
            });
            
            historyContainer.appendChild(item);
        });
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    copyToClipboard(text, message = 'Copied to clipboard!') {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(message, 'success');
        }).catch(() => {
            this.showToast('Failed to copy', 'error');
        });
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteGenerator();
});