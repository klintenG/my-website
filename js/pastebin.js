/* ============================================
   PASTEBIN / TEXT SHARE FUNCTIONALITY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputMode = document.getElementById('inputMode');
    const linkMode = document.getElementById('linkMode');
    const viewMode = document.getElementById('viewMode');
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const viewCharCount = document.getElementById('viewCharCount');
    const textDisplay = document.getElementById('textDisplay');
    const generatedLink = document.getElementById('generatedLink');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Buttons
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const newPasteBtn = document.getElementById('newPasteBtn');
    const viewTextBtn = document.getElementById('viewTextBtn');
    const createNewBtn = document.getElementById('createNewBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // ========== INITIALIZE ==========
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedText = urlParams.get('text');

        if (encodedText) {
            // View mode: Display shared text
            try {
                const decodedText = decodeText(encodedText);
                showViewMode(decodedText);
            } catch (error) {
                console.error('Error decoding text:', error);
                showToast('Error: Invalid or corrupted link', 'error');
                showInputMode();
            }
        } else {
            // Input mode: Create new paste
            showInputMode();
        }
    }

    // ========== MODE SWITCHING ==========
    function showInputMode() {
        inputMode.classList.remove('hidden');
        linkMode.classList.add('hidden');
        viewMode.classList.add('hidden');
        textInput.value = '';
        updateCharCount();
    }

    function showLinkMode(link) {
        inputMode.classList.add('hidden');
        linkMode.classList.remove('hidden');
        viewMode.classList.add('hidden');
        generatedLink.value = link;
    }

    function showViewMode(text) {
        inputMode.classList.add('hidden');
        linkMode.classList.add('hidden');
        viewMode.classList.remove('hidden');
        textDisplay.textContent = text;
        viewCharCount.textContent = text.length.toLocaleString();
    }

    // ========== TEXT ENCODING/DECODING ==========
    function encodeText(text) {
        // Use base64 encoding for URL safety
        try {
            return btoa(encodeURIComponent(text));
        } catch (error) {
            console.error('Encoding error:', error);
            throw new Error('Failed to encode text');
        }
    }

    function decodeText(encodedText) {
        try {
            return decodeURIComponent(atob(encodedText));
        } catch (error) {
            console.error('Decoding error:', error);
            throw new Error('Failed to decode text');
        }
    }

    // ========== LINK GENERATION ==========
    function generateShareableLink() {
        const text = textInput.value.trim();
        
        if (!text) {
            showToast('Please enter some text to share', 'warning');
            textInput.focus();
            return;
        }

        if (text.length > 50000) {
            showToast('Text is too long. Maximum 50,000 characters allowed.', 'error');
            return;
        }

        try {
            const encoded = encodeText(text);
            const baseUrl = window.location.origin + window.location.pathname;
            const shareableLink = `${baseUrl}?text=${encoded}`;
            
            // Check if URL is too long (most browsers support up to ~2000 chars)
            if (shareableLink.length > 2000) {
                showToast('Text is too long for URL encoding. Please use shorter text.', 'error');
                return;
            }

            showLinkMode(shareableLink);
            
            // Update browser history without triggering reload
            window.history.pushState({}, '', shareableLink);
        } catch (error) {
            console.error('Link generation error:', error);
            showToast('Error generating link. Please try again.', 'error');
        }
    }

    // ========== CLIPBOARD OPERATIONS ==========
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('Clipboard error:', error);
            return false;
        }
    }

    async function handleCopyLink() {
        const success = await copyToClipboard(generatedLink.value);
        if (success) {
            showToast('Link copied to clipboard!');
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } else {
            showToast('Failed to copy link', 'error');
        }
    }

    async function handleCopyText() {
        const success = await copyToClipboard(textDisplay.textContent);
        if (success) {
            showToast('Text copied to clipboard!');
            copyTextBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => {
                copyTextBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
            }, 2000);
        } else {
            showToast('Failed to copy text', 'error');
        }
    }

    // ========== DOWNLOAD ==========
    function downloadText() {
        const text = textDisplay.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `textshare-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Text downloaded successfully!');
    }

    // ========== CHARACTER COUNTER ==========
    function updateCharCount() {
        const count = textInput.value.length;
        charCount.textContent = count.toLocaleString();
        
        // Visual feedback for length
        if (count > 45000) {
            charCount.style.color = '#dc3545'; // Red
        } else if (count > 40000) {
            charCount.style.color = '#ffc107'; // Yellow
        } else {
            charCount.style.color = 'var(--accent-primary)';
        }
    }

    // ========== TOAST NOTIFICATION ==========
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        // Change icon based on type
        const icon = toast.querySelector('i');
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            toast.style.background = '#dc3545';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
            toast.style.background = '#ffc107';
        } else {
            icon.className = 'fas fa-check-circle';
            toast.style.background = 'var(--accent-primary)';
        }
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // ========== EVENT LISTENERS ==========
    if (textInput) {
        textInput.addEventListener('input', updateCharCount);
    }

    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', generateShareableLink);
        
        // Allow Enter key with Ctrl/Cmd to generate link
        textInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                generateShareableLink();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the text?')) {
                textInput.value = '';
                updateCharCount();
                textInput.focus();
            }
        });
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', handleCopyLink);
    }

    if (newPasteBtn) {
        newPasteBtn.addEventListener('click', () => {
            window.history.pushState({}, '', window.location.pathname);
            showInputMode();
        });
    }

    if (viewTextBtn) {
        viewTextBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedText = urlParams.get('text');
            if (encodedText) {
                const decodedText = decodeText(encodedText);
                showViewMode(decodedText);
            }
        });
    }

    if (createNewBtn) {
        createNewBtn.addEventListener('click', () => {
            window.history.pushState({}, '', window.location.pathname);
            showInputMode();
        });
    }

    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', handleCopyText);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadText);
    }

    // ========== INITIALIZE APP ==========
    init();
});
