/**
 * ============================================================================
 * LOGICKlub - In-Browser AI Digit Recognition Engine (game.js)
 * ============================================================================
 * 
 * Overview:
 *   Runs a pre-trained MNIST Convolutional Neural Network directly in the
 *   client's browser using ONNX Runtime Web (WASM / WebGL).
 * 
 * Pipeline:
 *   1. Canvas Drawing Engine: Captures mouse/touch gestures on a 320x320 canvas.
 *   2. Image Preprocessing: Downsamples 320x320 -> 28x28, extracts grayscale
 *      intensities, and normalizes pixels to Float32 range [0.0, 1.0].
 *   3. Tensor Construction: Packs normalized data into a 4D NCHW Tensor [1, 1, 28, 28].
 *   4. Client-Side WASM Inference: Executes the neural network locally with zero latency.
 *   5. Softmax Activation: Converts raw model output scores (logits) into a
 *      normalized probability distribution (0% to 100%).
 *   6. Dynamic UI Visualization: Renders confidence progress bars for digits 0-9.
 * 
 * References:
 *   - ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
 *   - WebAssembly:      https://developer.mozilla.org/en-US/docs/WebAssembly
 *   - MNIST Dataset:    http://yann.lecun.com/exdb/mnist/
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

    // ========================================================================
    // SECTION 1: DOM ELEMENT SELECTORS & APPLICATION STATE
    // ========================================================================
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const clearBtn = document.getElementById('clearBtn');
    const predictBtn = document.getElementById('predictBtn');
    const barChart = document.getElementById('barChart');
    const loadingText = document.getElementById('loading-text');

    let session;              // Holds the active ONNX InferenceSession instance
    let provider = "wasm";    // Active execution provider ('wasm' or 'webgl')
    let isDrawing = false;    // Tracks active pen/mouse down state
    let lastX = 0;            // Previous pointer X coordinate for line interpolation
    let lastY = 0;            // Previous pointer Y coordinate for line interpolation

    // ========================================================================
    // SECTION 2: CANVAS INITIALIZATION FOR MNIST FORMAT
    // ========================================================================
    // MNIST neural network training data uses black background (0) with white strokes (1).
    // Initialize the canvas with a solid black fill and smooth white brush strokes.
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;          // Generous stroke width matching downsampled digit thickness
    ctx.lineCap = 'round';       // Smooth rounded brush tips
    ctx.lineJoin = 'round';      // Smooth brush joints
    ctx.strokeStyle = 'white';   // White ink on black background

    // ========================================================================
    // SECTION 3: ONNX RUNTIME WEB INITIALIZATION (WASM / WEBGL)
    // ========================================================================
    try {
        // --- WebAssembly Engine Configuration ---
        // Single thread and disabled SIMD ensure broad compatibility and minimal memory footprint
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = false;

        const loadStart = performance.now();
        provider = "wasm";

        // Primary Attempt: Load pre-trained model using WebAssembly backend
        try {
            session = await ort.InferenceSession.create('mnist-8.onnx', { executionProviders: ['wasm'] });
        } catch (wasmError) {
            // Fallback Attempt: If WASM fails (e.g. restrictive iframe or memory cap), fallback to WebGL GPU acceleration
            console.warn("WASM failed to initialize. Falling back to WebGL...", wasmError);
            provider = "webgl";
            session = await ort.InferenceSession.create('mnist-8.onnx', { executionProviders: ['webgl'] });
        }

        const loadEnd = performance.now();
        let loadTime = loadEnd - loadStart;
        let displayLoadTime = loadTime < 1 ? "< 1.00" : loadTime.toFixed(2);

        // Update UI upon successful model initialization
        console.log(`ONNX ${provider.toUpperCase()} model loaded successfully in ${displayLoadTime} ms!`);
        loadingText.innerText = `Model loaded in ${displayLoadTime} ms`;
        loadingText.style.color = 'var(--success, #34d399)';
        predictBtn.disabled = false; // Enable inference button once model is ready
    } catch (e) {
        console.error("Failed to load ONNX model:", e);
        loadingText.innerText = "Error loading ONNX WASM model.";
    }

    // ========================================================================
    // SECTION 4: DRAWING ENGINE & TOUCH / POINTER HANDLERS
    // ========================================================================

    /**
     * Translates viewport screen coordinates (mouse or touch) into internal
     * canvas coordinates, adjusting for responsive CSS scaling.
     * 
     * @param {MouseEvent|TouchEvent} e - Pointer or touch input event
     * @returns {{x: number, y: number}} Normalized coordinates on the 320x320 canvas
     */
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Support mobile touch events
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        // Account for responsive scaling between displayed size and canvas pixel dimensions
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    /** Begins a new stroke path when mouse is pressed or finger touches screen. */
    function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPointerPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    /** Continues stroke interpolation as the pointer moves across canvas. */
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPointerPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
    }

    /** Concludes active stroke path. */
    function stopDraw() {
        isDrawing = false;
    }

    // Mouse event listeners
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    // Touch event listeners (for mobile & tablet drawing)
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
    canvas.addEventListener('touchcancel', stopDraw);

    // ========================================================================
    // SECTION 5: CANVAS RESET / CLEAR HANDLER
    // ========================================================================
    clearBtn.addEventListener('click', () => {
        // Reset canvas to full black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Clear previous prediction results from the UI
        barChart.innerHTML = '';
    });

    // ========================================================================
    // SECTION 6: MATHEMATICAL UTILITY (SOFTMAX ACTIVATION)
    // ========================================================================

    /**
     * Converts an array of unconstrained real-valued logits (raw model scores)
     * into a probability distribution where all values are between 0 and 1,
     * and their sum equals exactly 1.
     * 
     * Uses numerically stable softmax formula:
     *   softmax(x_i) = exp(x_i - max(x)) / sum(exp(x_j - max(x)))
     * 
     * @param {number[]} arr - Array of 10 raw output logits from neural network
     * @returns {number[]} Array of 10 probability values summing to 1.0
     */
    function softmax(arr) {
        const max = Math.max(...arr); // Subtract max to prevent numerical overflow in exp()
        const exp = arr.map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b);
        return exp.map(x => x / sum);
    }

    // ========================================================================
    // SECTION 7: INFERENCE PIPELINE (PREDICTION & VISUALIZATION)
    // ========================================================================
    predictBtn.addEventListener('click', async () => {
        if (!session) return; // Guard clause: model must be loaded before running inference

        // --------------------------------------------------------------------
        // Step 7.1: Image Downsampling (320x320 -> 28x28)
        // --------------------------------------------------------------------
        // The MNIST model expects exactly 28x28 input resolution.
        // We use an off-screen helper canvas to downscale our 320x320 user drawing.
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0, 28, 28);
        const imgData = tempCtx.getImageData(0, 0, 28, 28);

        // --------------------------------------------------------------------
        // Step 7.2: Pixel Extraction & Normalization
        // --------------------------------------------------------------------
        // Convert the 28x28 RGBA image into a flat Float32Array of 784 numbers (28 * 28).
        // Grayscale intensity is extracted from the Red channel (since black/white ink gives R=G=B).
        // Pixel range [0, 255] is normalized to floating-point range [0.0, 1.0]:
        //   - Black background = 0.0
        //   - White stroke     = 1.0
        const inputData = new Float32Array(28 * 28);
        for (let i = 0; i < inputData.length; i++) {
            inputData[i] = imgData.data[i * 4] / 255.0;
        }

        try {
            // ----------------------------------------------------------------
            // Step 7.3: Tensor Construction (NCHW Layout)
            // ----------------------------------------------------------------
            // Pack the normalized 1D array into an ONNX 4D Tensor.
            // Dimensions: [BatchSize=1, Channels=1, Height=28, Width=28]
            const tensor = new ort.Tensor('float32', inputData, [1, 1, 28, 28]);

            // Bind input tensor to the model's named input layer
            const inputName = session.inputNames[0];
            const outputName = session.outputNames[0];

            const feeds = {};
            feeds[inputName] = tensor;

            // ----------------------------------------------------------------
            // Step 7.4: Neural Network Inference Execution
            // ----------------------------------------------------------------
            // The WebAssembly / WebGL engine executes forward propagation through
            // all convolutional, pooling, and dense layers.
            const inferenceStart = performance.now();
            const output = await session.run(feeds);
            const inferenceEnd = performance.now();
            let inferenceTime = inferenceEnd - inferenceStart;
            let displayInfTime = inferenceTime < 1 ? "< 1.00" : inferenceTime.toFixed(2);

            // Raw output logits (Float32Array containing 10 scores for digits 0-9)
            const rawScores = output[outputName].data;

            // ----------------------------------------------------------------
            // Step 7.5: Post-Processing via Softmax
            // ----------------------------------------------------------------
            // Transform raw logits into normalized probability percentages
            const probabilities = softmax(Array.from(rawScores));

            // ----------------------------------------------------------------
            // Step 7.6: Dynamic UI Visualization (Bar Chart & Timing)
            // ----------------------------------------------------------------
            barChart.innerHTML = `<div style="margin-bottom: 15px; font-size: 0.9em; color: var(--muted, #97a6bd);">${provider.toUpperCase()} Inference Time: <strong>${displayInfTime} ms</strong></div>`;
            
            probabilities.forEach((prob, digit) => {
                const percentage = Math.round(prob * 100);
                const item = document.createElement('div');
                item.innerHTML = `
                    <span style="display:inline-block; width: 20px;"><strong>${digit}</strong></span>
                    <progress value="${percentage}" max="100"></progress>
                    <span>${percentage}%</span>
                `;
                barChart.appendChild(item);
            });

        } catch (error) {
            console.error("ONNX Inference Error:", error);
            alert(`Error running ${provider.toUpperCase()} inference!`);
        }
    });
});
