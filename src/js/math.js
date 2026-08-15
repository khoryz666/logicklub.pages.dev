$(document).ready(function () {
    // Initialize Desmos Calculator
    var elt = document.getElementById('calculator');
    var calculator = Desmos.GraphingCalculator(elt, {
        expressions: false, // Hide the expressions list 
        settingsMenu: false, // Hide the wrench menu
        zoomButtons: true,   // Allow zooming
    });

    // Define the state in Desmos
    calculator.setExpressions([
        // The transformation matrix variables
        { id: 'var-a', latex: 'a=1' },
        { id: 'var-b', latex: 'b=0' },
        { id: 'var-c', latex: 'c=0' },
        { id: 'var-d', latex: 'd=1' },

        // Draggable points representing the transformed basis vectors
        // Desmos automatically makes a point like (a,b) draggable, and dragging it will update variables a and b
        { id: 'p1', latex: '(a,b)', color: Desmos.Colors.RED, dragMode: Desmos.DragModes.XY, label: 'i-hat', showLabel: true },
        { id: 'p2', latex: '(c,d)', color: Desmos.Colors.BLUE, dragMode: Desmos.DragModes.XY, label: 'j-hat', showLabel: true },

        // fill the transformed matrix
        { id: 'poly', latex: '\\operatorname{polygon}((0,0), (a,b), (a+c,b+d), (c,d))', color: Desmos.Colors.BLACK, fillOpacity: 0.1, lines: true, lineWidth: 1 }
    ]);

    // Setup observers for Desmos variables to update HTML sliders
    // dragging in Desmos updates HTML
    const helperA = calculator.HelperExpression({ latex: 'a' });
    const helperB = calculator.HelperExpression({ latex: 'b' });
    const helperC = calculator.HelperExpression({ latex: 'c' });
    const helperD = calculator.HelperExpression({ latex: 'd' });

    function updateHTMLFromDesmos() {
        if (isNaN(helperA.numericValue)) return; // Wait until loaded

        $('#mat-a').val(helperA.numericValue);
        $('#val-a').text(helperA.numericValue.toFixed(2));
        $('#disp-a').text(helperA.numericValue.toFixed(1));

        $('#mat-b').val(helperB.numericValue);
        $('#val-b').text(helperB.numericValue.toFixed(2));
        $('#disp-b').text(helperB.numericValue.toFixed(1));

        $('#mat-c').val(helperC.numericValue);
        $('#val-c').text(helperC.numericValue.toFixed(2));
        $('#disp-c').text(helperC.numericValue.toFixed(1));

        $('#mat-d').val(helperD.numericValue);
        $('#val-d').text(helperD.numericValue.toFixed(2));
        $('#disp-d').text(helperD.numericValue.toFixed(1));

        saveMatrixState();
    }

    helperA.observe('numericValue', updateHTMLFromDesmos);
    helperB.observe('numericValue', updateHTMLFromDesmos);
    helperC.observe('numericValue', updateHTMLFromDesmos);
    helperD.observe('numericValue', updateHTMLFromDesmos);

    // Syncing HTML sliders to Desmos variables
    $('#mat-a, #mat-b, #mat-c, #mat-d').on('input', function () {
        const a = parseFloat($('#mat-a').val());
        const b = parseFloat($('#mat-b').val());
        const c = parseFloat($('#mat-c').val());
        const d = parseFloat($('#mat-d').val());

        calculator.setExpressions([
            { id: 'var-a', latex: `a=${a}` },
            { id: 'var-b', latex: `b=${b}` },
            { id: 'var-c', latex: `c=${c}` },
            { id: 'var-d', latex: `d=${d}` }
        ]);
        // The HTML text spans will update automatically via the observer above
    });

    $('#reset-btn').on('click', function () {
        // Reset to Identity Matrix
        calculator.setExpressions([
            { id: 'var-a', latex: 'a=1' },
            { id: 'var-b', latex: 'b=0' },
            { id: 'var-c', latex: 'c=0' },
            { id: 'var-d', latex: 'd=1' }
        ]);
    });

    // LocalStorage
    function saveMatrixState() {
        if (isNaN(helperA.numericValue)) return;

        const matrixState = {
            a: helperA.numericValue,
            b: helperB.numericValue,
            c: helperC.numericValue,
            d: helperD.numericValue
        };
        localStorage.setItem('logicklub_matrix', JSON.stringify(matrixState));
    }

    function loadSavedMatrix() {
        const saved = localStorage.getItem('logicklub_matrix');
        if (saved) {
            try {
                const matrix = JSON.parse(saved);
                calculator.setExpressions([
                    { id: 'var-a', latex: `a=${matrix.a}` },
                    { id: 'var-b', latex: `b=${matrix.b}` },
                    { id: 'var-c', latex: `c=${matrix.c}` },
                    { id: 'var-d', latex: `d=${matrix.d}` }
                ]);
            } catch (e) {
                console.error('Error loading saved matrix state', e);
            }
        }
    }

    // Initial load
    loadSavedMatrix();
});
