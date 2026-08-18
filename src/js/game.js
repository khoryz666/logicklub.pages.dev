document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const clearBtn = document.getElementById('clearBtn');
    const predictBtn = document.getElementById('predictBtn');
    const barChart = document.getElementById('barChart');
    const loadingText = document.getElementById('loading-text');

    let session;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Initialize Canvas for MNIST (Black Background & White Ink)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';

    try {
        // --- ONNX RUNTIME WEB API SETUP ---
        // 1. The Model (mnist-8.onnx)
        // Citation: ONNX Overview (https://onnx.ai/about.html)
        // Explanation: ONNX (Open Neural Network Exchange) is an open format. 'mnist-8.onnx' is a binary file
        // containing the entire "brain" (architecture and learned weights) of the neural network.

        // 2. The Engine (WebAssembly)
        // Citation: ONNX Runtime WebAssembly (https://onnxruntime.ai/docs/execution-providers/WebAssembly-ExecutionProvider.html)
        // Explanation: JavaScript is traditionally too slow for the heavy math required by Neural Networks.
        // Microsoft wrote the ONNX inference engine in C++ and compiled it into WebAssembly (.wasm).
        // By using `ort`, we boot up this precompiled C++ WASM binary inside the browser, allowing it to run at near-native speeds.
        ort.env.wasm.numThreads = 1; // Disable multi-threading
        ort.env.wasm.simd = false;   // Disable SIMD to force the basic WASM binary (uses much less memory)

        const loadStart = performance.now();
        // Try WASM first
        try {
            session = await ort.InferenceSession.create('mnist-8.onnx', { executionProviders: ['wasm'] });
        } catch (wasmError) {
            console.warn("WASM failed to initialize (likely a browser memory restriction). Falling back to WebGL...", wasmError);
            session = await ort.InferenceSession.create('mnist-8.onnx', { executionProviders: ['webgl'] });
        }
        const loadEnd = performance.now();
        let loadTime = loadEnd - loadStart;
        let displayLoadTime = loadTime < 1 ? "< 1.00" : loadTime.toFixed(2);

        console.log(`ONNX WASM model loaded successfully in ${displayLoadTime} ms!`);
        loadingText.innerText = `Model loaded in ${displayLoadTime} ms`;
        loadingText.style.animation = 'none';
        loadingText.style.color = 'var(--success, #34d399)';
        predictBtn.disabled = false;
    } catch (e) {
        console.error("Failed to load ONNX model:", e);
        loadingText.innerText = "Error loading ONNX WASM model.";
    }

    // Drawing Events
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPointerPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

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

    function stopDraw(e) {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
    canvas.addEventListener('touchcancel', stopDraw);

    // Clear Canvas
    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        barChart.innerHTML = '';
    });

    // Helper: Softmax function to convert raw model scores to percentages
    function softmax(arr) {
        const max = Math.max(...arr);
        const exp = arr.map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b);
        return exp.map(x => x / sum);
    }

    // Call ONNX WASM API to predict
    predictBtn.addEventListener('click', async () => {
        if (!session) return;

        // --- DATA PREPROCESSING FOR NEURAL NETWORK ---
        // 3. The Handshake (JavaScript -> WASM)
        // Citation: MDN Web Docs - Typed Arrays (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_Arrays)
        // Explanation: WASM runs in its own isolated memory space, JavaScript can't just hand it an HTML <canvas> element.
        // We have to manually extract the pixels and translate the image into a raw language WASM understands.

        // 1. Extract and scale canvas down to 28x28
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0, 28, 28);
        const imgData = tempCtx.getImageData(0, 0, 28, 28);

        // 2. Convert raw RGBA pixel data to a Float32Array
        // Explanation: loop through the pixels and create a flat Float32Array of exactly 784 numbers (28 * 28).
        // Normalize these numbers so that a black pixel is 0.0 and a white pixel is 1.0.
        const inputData = new Float32Array(28 * 28);
        for (let i = 0; i < inputData.length; i++) {
            inputData[i] = imgData.data[i * 4] / 255.0;
        }

        try {
            // --- ONNX WEBASSEMBLY INFERENCE ---
            // 4. The Execution (Inside WASM)
            // Citation: MDN Web Docs - WebAssembly (https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)

            // 3. Create an ONNX Tensor (Shape: [batch, channels, height, width] = [1, 1, 28, 28])
            // Explanation: wrap our flat array into an ort.Tensor object to pass it across the boundary into the WASM engine.
            const tensor = new ort.Tensor('float32', inputData, [1, 1, 28, 28]);

            // 4. Run the WASM model (API Call)
            const inputName = session.inputNames[0];
            const outputName = session.outputNames[0];

            const feeds = {};
            feeds[inputName] = tensor;

            // Explanation: Once session.run() is called, the C++ code inside WASM takes over completely.
            // It pushes our numbers through the layers defined in the .onnx file using CPU SIMD instructions to calculate
            // hidden layers and activation functions, finally producing an output array of 10 raw scores (logits).
            const inferenceStart = performance.now();
            const output = await session.run(feeds);
            const inferenceEnd = performance.now();
            let inferenceTime = inferenceEnd - inferenceStart;
            let displayInfTime = inferenceTime < 1 ? "< 1.00" : inferenceTime.toFixed(2);

            const rawScores = output[outputName].data; // Float32Array of 10 elements

            // 5. The Return (WASM -> JavaScript)
            // Citation: Softmax Function (https://en.wikipedia.org/wiki/Softmax_function)
            // Explanation: The WASM engine hands the final array of 10 raw scores back across the boundary to JavaScript.
            // Because neural networks output raw, unconstrained numbers (logits), we run them through a Softmax function
            // to force them into positive percentages that perfectly add up to 100%.
            const probabilities = softmax(Array.from(rawScores));

            // 6. Display results for 0-9
            barChart.innerHTML = `<div style="margin-bottom: 15px; font-size: 0.9em; color: var(--muted, #97a6bd);">WASM Inference Time: <strong>${displayInfTime} ms</strong></div>`;
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
            alert("Error running WASM inference!");
        }
    });
});
