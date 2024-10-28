// Wait for both DOM and face-api.js to load
document.addEventListener('DOMContentLoaded', () => {
    // Add loading indicator
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.style.cssText = `
        text-align: center;
        padding: 12px;
        margin: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    loadingMessage.textContent = 'Loading face detection models...';
    container.insertBefore(loadingMessage, container.firstChild);

    // Check if face-api is loaded
    const waitForFaceApi = setInterval(async () => {
        if (window.faceapi) {
            clearInterval(waitForFaceApi);
            try {
                await initializeApp();
                // Remove loading message once everything is loaded
                loadingMessage.remove();
            } catch (error) {
                console.error('Error during initialization:', error);
                loadingMessage.textContent = 'Error loading face detection models. Please refresh the page.';
                loadingMessage.style.color = 'red';
            }
        }
    }, 100);
});

async function initializeApp() {
    // Load face-api models first
    await loadModels();

    // Get DOM elements
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const resultCanvas = document.getElementById('resultCanvas');
    const downloadButton = document.getElementById('downloadButton');
    const previewContainer = document.querySelector('.preview-container');

    // Log which elements are missing for debugging
    if (!photoInput) console.error('photoInput not found');
    if (!photoPreview) console.error('photoPreview not found');
    if (!resultCanvas) console.error('resultCanvas not found');
    if (!downloadButton) console.error('downloadButton not found');

    // Verify all elements exist
    if (!photoInput || !photoPreview || !resultCanvas || !downloadButton) {
        throw new Error('Required DOM elements not found. Please ensure all HTML elements are present.');
    }

    const ctx = resultCanvas.getContext('2d');

    // Create and load the overlay image
    const overlayImage = new Image();
    
    // Wait for overlay image to load before allowing processing
    await new Promise((resolve, reject) => {
        overlayImage.onload = resolve;
        overlayImage.onerror = () => reject(new Error('Failed to load overlay image'));
        overlayImage.src = 'https://docudublin.github.io/overlay-face.png';
    }).catch(error => {
        console.error('Error loading overlay image:', error);
        showMessage('Error loading overlay image. Please try again.', true);
    });

    // Add drag and drop support for desktop
    if (previewContainer) {
        previewContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            previewContainer.style.borderColor = '#4CAF50';
        });

        previewContainer.addEventListener('dragleave', () => {
            previewContainer.style.borderColor = '#ccc';
        });

        previewContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            previewContainer.style.borderColor = '#ccc';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                photoInput.files = e.dataTransfer.files;
                await handleFileUpload({ target: { files: [file] } }, photoPreview);
                await processImage(photoPreview, resultCanvas, ctx, overlayImage, downloadButton);
            }
        });
    }

    // Handle main photo upload and preview
    if (photoInput) {
        photoInput.addEventListener('change', async (e) => {
            try {
                if (photoPreview) {
                    await handleFileUpload(e, photoPreview);
                    // Automatically process the image after upload
                    if (photoPreview.src) {
                        await processImage(photoPreview, resultCanvas, ctx, overlayImage, downloadButton);
                    }
                }
            } catch (error) {
                console.error('Error handling file upload:', error);
                showMessage('Error processing the image. Please try again.', true);
            }
        });
    }

    // Handle download button click with better mobile support
    downloadButton.addEventListener('click', () => {
        try {
            const link = document.createElement('a');
            const now = new Date();
            const dateString = now.toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .replace('Z', '');
            const filename = `mick-me_${dateString}.png`;
            
            // For mobile devices, create a blob and use different approach
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                resultCanvas.toBlob((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    link.href = url;
                    link.download = filename;
                    link.click();
                    setTimeout(() => window.URL.revokeObjectURL(url), 100);
                });
            } else {
                link.download = filename;
                link.href = resultCanvas.toDataURL('image/png');
                link.click();
            }
        } catch (error) {
            console.error('Error downloading image:', error);
            showMessage('Error downloading image. Please try again.', true);
        }
    });
}

// Helper function to show messages
function showMessage(text, isError = false) {
    const container = document.querySelector('.container');
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.style.cssText = `
        text-align: center;
        padding: 12px;
        margin: 10px;
        border-radius: 8px;
        background: ${isError ? '#ffebee' : '#f8f9fa'};
        color: ${isError ? '#c62828' : '#333'};
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        max-width: 90%;
        width: auto;
    `;
    messageElement.textContent = text;
    container.appendChild(messageElement);

    setTimeout(() => messageElement.remove(), 3000);
}

// Handle file upload and preview with image optimization
function handleFileUpload(event, previewElement) {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showMessage('File size too large. Please choose a smaller image.', true);
                reject(new Error('File too large'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Create an image to get dimensions
                const img = new Image();
                img.onload = () => {
                    // Calculate new dimensions while maintaining aspect ratio
                    const maxDimension = 1920; // Max dimension for mobile
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    // Create canvas for resizing
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Update preview with optimized image
                    previewElement.src = canvas.toDataURL('image/jpeg', 0.9);
                    previewElement.onload = () => resolve();
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                showMessage('Error reading file. Please try again.', true);
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        } else {
            resolve();
        }
    });
}

// Process image with face detection and overlay
async function processImage(photoPreview, resultCanvas, ctx, overlayImage, downloadButton) {
    try {
        // Show processing message
        showMessage('Processing image...');

        // Hide download button while processing
        downloadButton.style.display = 'none';

        // Detect faces in main image
        const mainDetections = await faceapi.detectAllFaces(photoPreview, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }));

        if (mainDetections.length === 0) {
            showMessage('No faces detected in the image', true);
            return;
        }

        // Set main canvas dimensions
        resultCanvas.width = photoPreview.naturalWidth;
        resultCanvas.height = photoPreview.naturalHeight;

        // Draw original image to canvas
        ctx.drawImage(photoPreview, 0, 0);

        // For each detected face in the main image
        for (const detection of mainDetections) {
            const { box } = detection;

            // Adjust overlay size and position
            const overlayWidth = box.width * 1.2; // Make overlay slightly wider than face
            const overlayHeight = box.height * 1.4; // Make overlay taller to account for hat
            const overlayX = box.x - (overlayWidth - box.width) / 2; // Center horizontally
            const overlayY = box.y - (overlayHeight - box.height) * 0.6; // Move up to account for hat

            // Draw overlay image with adjusted dimensions
            ctx.drawImage(
                overlayImage,
                overlayX,
                overlayY,
                overlayWidth,
                overlayHeight
            );
        }

        // Show the result canvas
        resultCanvas.style.display = 'block';

        // Show download button for additional downloads
        downloadButton.style.display = 'inline-block';
        showMessage('Image processed successfully!');
    } catch (error) {
        console.error('Error processing image:', error);
        showMessage('Error processing image. Please try again.', true);
    }
}

// Load required face-api models
async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log('Models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
        throw new Error('Error loading face detection models. Please refresh the page.');
    }
}
