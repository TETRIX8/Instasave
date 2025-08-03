class InstagramDownloader {
    constructor() {
        this.form = document.getElementById('download-form');
        this.urlInput = document.getElementById('video-url');
        this.downloadBtn = document.querySelector('.download-btn');
        this.btnText = document.querySelector('.btn-text');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.resultContainer = document.getElementById('result');
        this.resultContent = document.getElementById('result-content');
        this.copyBtn = document.getElementById('copy-btn');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Add input validation
        this.urlInput.addEventListener('input', () => this.validateUrl());
        
        // Add smooth animations
        this.addAnimations();
    }

    addAnimations() {
        // Add entrance animations for features
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                feature.style.transition = 'all 0.6s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateY(0)';
            }, 300 + index * 100);
        });
    }

    validateUrl() {
        const url = this.urlInput.value;
        const isValid = url.includes('instagram.com') || url.includes('fb.watch');
        
        if (url && !isValid) {
            this.urlInput.classList.add('error');
        } else {
            this.urlInput.classList.remove('error');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Пожалуйста, введите ссылку на видео');
            return;
        }

        if (!url.includes('instagram.com') && !url.includes('fb.watch')) {
            this.showError('Пожалуйста, введите корректную ссылку на Instagram или Facebook видео');
            return;
        }

        this.setLoading(true);
        this.hideResult();

        try {
            const downloadUrl = await this.processDownload(url);
            
            if (downloadUrl) {
                this.showSuccess(downloadUrl);
            } else {
                this.showError('Не удалось получить ссылку для скачивания. Попробуйте другую ссылку.');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Произошла ошибка при обработке ссылки. Попробуйте позже.');
        } finally {
            this.setLoading(false);
        }
    }

    async processDownload(url) {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                return result.downloadUrl;
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    setLoading(loading) {
        if (loading) {
            this.downloadBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.loadingSpinner.style.display = 'flex';
            this.downloadBtn.classList.add('loading');
        } else {
            this.downloadBtn.disabled = false;
            this.btnText.style.display = 'block';
            this.loadingSpinner.style.display = 'none';
            this.downloadBtn.classList.remove('loading');
        }
    }

    showSuccess(downloadUrl) {
        this.resultContent.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <div class="success-text">
                    <strong>Ссылка для скачивания готова!</strong><br>
                    <a href="${downloadUrl}" target="_blank" class="download-link">
                        ${downloadUrl}
                    </a>
                </div>
            </div>
        `;
        
        this.resultContainer.style.display = 'block';
        this.resultContainer.classList.remove('error');
        this.resultContainer.classList.add('success');
        this.copyBtn.style.display = 'block';
        
        // Store URL for copy function
        this.currentDownloadUrl = downloadUrl;
        
        // Add success animation
        this.resultContainer.style.animation = 'none';
        setTimeout(() => {
            this.resultContainer.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);
    }

    showError(message) {
        this.resultContent.innerHTML = `
            <div class="error-message">
                <div class="error-icon">❌</div>
                <div class="error-text">${message}</div>
            </div>
        `;
        
        this.resultContainer.style.display = 'block';
        this.resultContainer.classList.remove('success');
        this.resultContainer.classList.add('error');
        this.copyBtn.style.display = 'none';
        
        // Add error animation
        this.resultContainer.style.animation = 'none';
        setTimeout(() => {
            this.resultContainer.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);
    }

    hideResult() {
        this.resultContainer.style.display = 'none';
        this.copyBtn.style.display = 'none';
    }

    async copyToClipboard() {
        if (!this.currentDownloadUrl) return;
        
        try {
            await navigator.clipboard.writeText(this.currentDownloadUrl);
            
            // Show success feedback
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Скопировано!';
            this.copyBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy:', err);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentDownloadUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Show feedback
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Скопировано!';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramDownloader();
});

// Add some additional CSS for the new elements
const additionalStyles = `
    .success-message, .error-message {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .success-icon, .error-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .success-text, .error-text {
        flex: 1;
    }
    
    .download-link {
        color: #4ecdc4;
        text-decoration: none;
        word-break: break-all;
        display: block;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(78, 205, 196, 0.1);
        border-radius: 4px;
        border: 1px solid rgba(78, 205, 196, 0.3);
    }
    
    .download-link:hover {
        background: rgba(78, 205, 196, 0.2);
    }
    
    .download-btn.loading {
        background: linear-gradient(45deg, #666, #999);
    }
    
    .url-input.error {
        border: 2px solid #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 