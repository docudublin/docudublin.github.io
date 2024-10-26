// Wait for both DOM and face-api.js to load
document.addEventListener('DOMContentLoaded', () => {
    // Add loading indicator
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.style.textAlign = 'center';
    loadingMessage.style.padding = '10px';
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
        // Use GitHub Pages URL
        overlayImage.src = 'https://docudublin.github.io/overlay-face.svg';
    }).catch(error => {
        console.error('Error loading overlay image:', error);
        alert('Error loading overlay image. Please check the console for details.');
    });

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
                alert('Error processing the image. Please try again.');
            }
        });
    }

    // Handle download button click
    downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        const now = new Date();
        const dateString = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .replace('Z', '');
        link.download = `processed-image_${dateString}.png`;
        link.href = resultCanvas.toDataURL('image/png');
        link.click();
    });
}

// Handle file upload and preview
function handleFileUpload(event, previewElement) {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.onload = () => resolve();
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
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
        const container = document.querySelector('.container');
        const processingMessage = document.createElement('div');
        processingMessage.style.textAlign = 'center';
        processingMessage.style.padding = '10px';
        processingMessage.textContent = 'Processing image...';
        container.insertBefore(processingMessage, resultCanvas);

        // Hide download button while processing
        downloadButton.style.display = 'none';

        // Detect faces in main image
        const mainDetections = await faceapi.detectAllFaces(photoPreview, 
            new faceapi.TinyFaceDetectorOptions());

        if (mainDetections.length === 0) {
            processingMessage.remove();
            alert('No faces detected in the image');
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

            // Draw overlay image directly (no face detection needed)
            ctx.drawImage(
                overlayImage,
                box.x,
                box.y,
                box.width,
                box.height
            );
        }

        // Generate unique datetime string for filename
        const now = new Date();
        const dateString = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .replace('Z', '');
        
        // Automatically trigger download
        const link = document.createElement('a');
        link.download = `processed-image_${dateString}.png`;
        link.href = resultCanvas.toDataURL('image/png');
        link.click();

        // Show download button for additional downloads
        downloadButton.style.display = 'inline-block';

        // Remove processing message
        processingMessage.remove();
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Error processing image. Please try again.');
    }
}

// Load required face-api models
async function loadModels() {
    try {
        // Use the correct model URL from the CDN
        const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json';
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log('Models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
        throw new Error('Error loading face detection models. Please refresh the page.');
    }
}
