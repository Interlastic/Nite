// Presentation Rater AI - Main Application

// State management
const state = {
    file: null,
    extractedText: '',
    modelType: 'local',
    webLLMEngine: null,
    isProcessing: false
};

// DOM Elements
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFile: document.getElementById('removeFile'),
    modelSection: document.getElementById('modelSection'),
    analyzeSection: document.getElementById('analyzeSection'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    progressSection: document.getElementById('progressSection'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    resultsSection: document.getElementById('resultsSection'),
    ratingValue: document.getElementById('ratingValue'),
    analysisContent: document.getElementById('analysisContent'),
    resetBtn: document.getElementById('resetBtn'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    webgpuWarning: document.getElementById('webgpuWarning')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkWebGPUSupport();
});

function initEventListeners() {
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFile.addEventListener('click', removeFile);
    document.querySelectorAll('input[name="model"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.modelType = e.target.value;
        });
    });
    elements.analyzeBtn.addEventListener('click', startAnalysis);
    elements.resetBtn.addEventListener('click', resetApp);
    elements.retryBtn.addEventListener('click', () => {
        hideError();
        startAnalysis();
    });
}

function handleDragOver(e) {
    e.preventDefault();
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) processFile(files[0]);
}

function processFile(file) {
    if (!file.name.endsWith('.pptx')) {
        showError('Please upload a valid PowerPoint (.pptx) file.');
        return;
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File size exceeds 50MB limit. Please compress your presentation.');
        return;
    }
    state.file = file;
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    showSection(elements.fileInfo);
    showSection(elements.modelSection);
    showSection(elements.analyzeSection);
    elements.analyzeBtn.disabled = false;
    extractPPTXText(file);
}

function removeFile() {
    state.file = null;
    state.extractedText = '';
    elements.fileInput.value = '';
    hideSection(elements.fileInfo);
    hideSection(elements.modelSection);
    hideSection(elements.analyzeSection);
    hideSection(elements.resultsSection);
    hideSection(elements.errorSection);
    elements.analyzeBtn.disabled = true;
}

async function extractPPTXText(file) {
    try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        let text = '';
        const slideFiles = [];
        zip.forEach((relativePath, zipEntry) => {
            if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
                slideFiles.push(zipEntry);
            }
        });
        slideFiles.sort((a, b) => {
            const numA = parseInt(a.name.match(/slide(\d+)\.xml/)[1]);
            const numB = parseInt(b.name.match(/slide(\d+)\.xml/)[1]);
            return numA - numB;
        });
        for (const slideFile of slideFiles) {
            const content = await slideFile.async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('a:t');
            let slideText = '';
            for (let i = 0; i < textElements.length; i++) {
                slideText += textElements[i].textContent + ' ';
            }
            if (slideText.trim()) {
                text += `--- Slide ${slideFiles.indexOf(slideFile) + 1} ---\n${slideText.trim()}\n\n`;
            }
        }
        state.extractedText = text.trim();
    } catch (error) {
        console.error('Error extracting PPTX text:', error);
        state.extractedText = '';
    }
}

async function checkWebGPUSupport() {
    if (!navigator.gpu) {
        elements.webgpuWarning.classList.remove('hidden');
        const localModelRadio = document.querySelector('input[value="local"]');
        if (localModelRadio) {
            localModelRadio.disabled = true;
            localModelRadio.parentElement.style.opacity = '0.5';
        }
        const apiModelRadio = document.querySelector('input[value="api"]');
        if (apiModelRadio) {
            apiModelRadio.checked = true;
            state.modelType = 'api';
        }
    }
}

async function startAnalysis() {
    if (state.isProcessing) return;
    state.isProcessing = true;
    hideSection(elements.resultsSection);
    hideSection(elements.errorSection);
    showSection(elements.progressSection);
    try {
        if (state.modelType === 'local') {
            await analyzeWithLocalModel();
        } else {
            await analyzeWithAPI();
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'An error occurred during analysis.');
    } finally {
        state.isProcessing = false;
    }
}

async function analyzeWithLocalModel() {
    updateProgress(0, 'Initializing WebLLM engine...');
    const webllm = await import('@mlc-ai/web-llm');
    const selectedModel = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
    const initProgressCallback = (report) => {
        const progress = report.progress;
        updateProgress(
            progress * 100,
            `Loading model: ${report.text} (${Math.round(progress * 100)}%)`
        );
    };
    try {
        if (!state.webLLMEngine) {
            updateProgress(0, 'Creating MLCEngine...');
            state.webLLMEngine = await webllm.CreateMLCEngine(
                selectedModel,
                { initProgressCallback: initProgressCallback }
            );
        }
        updateProgress(80, 'Analyzing presentation...');
        const prompt = buildAnalysisPrompt();
        const messages = [
            { role: 'system', content: 'You are an expert presentation evaluator. Rate presentations on a scale of 1-10 based on clarity, structure, content quality, and visual appeal.' },
            { role: 'user', content: prompt }
        ];
        const reply = await state.webLLMEngine.chat.completions.create({ messages });
        updateProgress(100, 'Analysis complete!');
        const analysis = parseAnalysisResult(reply.choices[0].message.content);
        displayResults(analysis);
    } catch (error) {
        console.error('WebLLM error:', error);
        throw new Error(`Local model error: ${error.message}. Please try the Cloud API option.`);
    }
}

async function analyzeWithAPI() {
    updateProgress(10, 'Connecting to AI API...');
    const prompt = buildAnalysisPrompt();
    const apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';
    try {
        updateProgress(30, 'Sending presentation to AI...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: `<s>[INST] You are an expert presentation evaluator. Rate the following PowerPoint presentation on a scale of 1-10. Consider clarity, structure, content quality, and engagement. Provide a rating followed by a brief explanation.

Presentation content:
${prompt}

Respond in this format:
Rating: X/10
Analysis: [Your detailed analysis] [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });
        updateProgress(70, 'Processing AI response...');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        const data = await response.json();
        updateProgress(100, 'Analysis complete!');
        let analysisText = '';
        if (Array.isArray(data) && data.length > 0) {
            analysisText = data[0].generated_text || '';
        } else if (data.generated_text) {
            analysisText = data.generated_text;
        } else {
            throw new Error('Unexpected API response format');
        }
        const analysis = parseAnalysisResult(analysisText);
        displayResults(analysis);
    } catch (error) {
        console.error('API error:', error);
        throw new Error(`API error: ${error.message}. The free API may be rate-limited. Please try again later or use the local model.`);
    }
}

function buildAnalysisPrompt() {
    const maxLength = 8000;
    let text = state.extractedText || '[No text content found in presentation]';
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '... [content truncated]';
    }
    return `Please analyze this PowerPoint presentation and provide:
1. A rating from 1-10 (where 10 is excellent)
2. Brief analysis covering:
   - Content clarity and organization
   - Visual structure potential
   - Key topics covered
   - Areas for improvement

Presentation Content:
${text}`;
}

function parseAnalysisResult(text) {
    let rating = 5;
    let analysis = text;
    const ratingPatterns = [
        /rating[:\s]*(\d+(?:\.\d+)?)/i,
        /score[:\s]*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*\/\s*10/i,
        /^rating:\s*(\d+(?:\.\d+)?)/mi
    ];
    for (const pattern of ratingPatterns) {
        const match = text.match(pattern);
        if (match) {
            rating = parseFloat(match[1]);
            rating = Math.max(1, Math.min(10, rating));
            break;
        }
    }
    analysis = text
        .replace(/rating[:\s]*\d+(?:\.\d+)?/gi, '')
        .replace(/score[:\s]*\d+(?:\.\d+)?/gi, '')
        .replace(/\[\/INST\]/gi, '')
        .replace(/\[INST\]/gi, '')
        .replace(/<s>/gi, '')
        .replace(/<\/s>/gi, '')
        .trim();
    if (analysis.length < 50) {
        analysis = text;
    }
    return { rating, analysis };
}

function displayResults({ rating, analysis }) {
    animateRating(rating);
    elements.analysisContent.textContent = analysis || 'Analysis completed successfully.';
    setTimeout(() => {
        hideSection(elements.progressSection);
        showSection(elements.resultsSection);
    }, 500);
}

function animateRating(targetRating) {
    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = targetRating / steps;
    const stepDuration = duration / steps;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetRating) {
            current = targetRating;
            clearInterval(timer);
        }
        elements.ratingValue.textContent = current.toFixed(1);
    }, stepDuration);
}

function showSection(section) {
    if (section) section.classList.remove('hidden');
}

function hideSection(section) {
    if (section) section.classList.add('hidden');
}

function updateProgress(percent, text) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressText.textContent = text;
}

function showError(message) {
    elements.errorMessage.textContent = message;
    showSection(elements.errorSection);
    hideSection(elements.progressSection);
    hideSection(elements.resultsSection);
}

function hideError() {
    hideSection(elements.errorSection);
}

function resetApp() {
    removeFile();
    hideSection(elements.resultsSection);
    hideSection(elements.errorSection);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
