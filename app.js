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
    const overlayInput = document.getElementById('overlayInput');
    const photoPreview = document.getElementById('photoPreview');
    const overlayPreview = document.getElementById('overlayPreview');
    const processButton = document.getElementById('processButton');
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = resultCanvas.getContext('2d');

    // Handle main photo upload and preview
    photoInput.addEventListener('change', (e) => {
        handleFileUpload(e, photoPreview);
    });

    // Handle overlay photo upload and preview
    overlayInput.addEventListener('change', (e) => {
        handleFileUpload(e, overlayPreview);
    });

    // Process button click handler
    processButton.addEventListener('click', async () => {
        if (!photoPreview.src || !overlayPreview.src) {
            alert('Please upload both photos first');
            return;
        }

        try {
            // Detect faces in both images
            const mainDetections = await faceapi.detectAllFaces(photoPreview, 
                new faceapi.TinyFaceDetectorOptions());
            const overlayDetections = await faceapi.detectAllFaces(overlayPreview,
                new faceapi.TinyFaceDetectorOptions());

            if (mainDetections.length === 0) {
                alert('No faces detected in the main image');
                return;
            }
            if (overlayDetections.length === 0) {
                alert('No faces detected in the overlay image');
                return;
            }

            // Create temporary canvas for face cropping
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const overlayFace = overlayDetections[0].box; // Use first detected face

            // Set temp canvas size to match the detected face
            tempCanvas.width = overlayFace.width;
            tempCanvas.height = overlayFace.height;

            // Draw only the face portion to the temp canvas
            tempCtx.drawImage(
                overlayPreview,
                overlayFace.x, overlayFace.y,
                overlayFace.width, overlayFace.height,
                0, 0,
                overlayFace.width, overlayFace.height
            );

            // Set main canvas dimensions
            resultCanvas.width = photoPreview.naturalWidth;
            resultCanvas.height = photoPreview.naturalHeight;

            // Draw original image to canvas
            ctx.drawImage(photoPreview, 0, 0);

            // For each detected face in the main image
            for (const detection of mainDetections) {
                const { box } = detection;

                // Draw cropped face from overlay image
                ctx.drawImage(
                    tempCanvas,
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
    });
}

// Handle file upload and preview
function handleFileUpload(event, previewElement) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
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
