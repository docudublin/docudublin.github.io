// Wait for both DOM and face-api.js to load
document.addEventListener('DOMContentLoaded', () => {
    // Check if face-api is loaded
    const waitForFaceApi = setInterval(async () => {
        if (window.faceapi) {
            clearInterval(waitForFaceApi);
            await initializeApp();
        }
    }, 100);
});

async function initializeApp() {
    // Load face-api models
    await loadModels();

    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = resultCanvas.getContext('2d');

    // Create and load the overlay image
    const overlayImage = new Image();
    overlayImage.crossOrigin = "anonymous";  // Enable CORS
    overlayImage.src = "https://docudublin.github.io/overlay-face.svg";

    // Handle main photo upload and preview
    photoInput.addEventListener('change', async (e) => {
        await handleFileUpload(e, photoPreview);
        // Automatically process the image after upload
        if (photoPreview.src) {
            await processImage(photoPreview, resultCanvas, ctx, overlayImage);
            downloadButton.style.display = 'block';
        }
    });

    // Download button click handler
    downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'processed-image.png';
        link.href = resultCanvas.toDataURL('image/png');
        link.click();
    });
}

// Handle file upload and preview
function handleFileUpload(event, previewElement) {
    return new Promise((resolve) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.onload = () => resolve();
            };
            reader.readAsDataURL(file);
        } else {
            resolve();
        }
    });
}

// Process image with face detection and overlay
async function processImage(photoPreview, resultCanvas, ctx, overlayImage) {
    try {
        // Detect faces in main image
        const mainDetections = await faceapi.detectAllFaces(photoPreview, 
            new faceapi.TinyFaceDetectorOptions());

        if (mainDetections.length === 0) {
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
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    }
}

// Load required face-api models
async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
    } catch (error) {
        console.error('Error loading models:', error);
        alert('Error loading face detection models. Please refresh the page.');
    }
}
