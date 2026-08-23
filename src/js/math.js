/**
 * ============================================================================
 * LOGICKlub - Linear Algebra & Matrix Transformation Visualizer (math.js)
 * ============================================================================
 * 
 * Purpose:
 *   Binds an interactive Desmos Graphing Calculator to an HTML MathML display
 *   and range sliders. Demonstrates 2D linear transformations in real time
 *   by tracking basis vectors:
 *     - i-hat (red arrow / point at (a, b)) -> Column 1 of the matrix
 *     - j-hat (blue arrow / point at (c, d)) -> Column 2 of the matrix
 * 
 * Features:
 *   1. Full two-way data binding (Desmos graph drag <-> HTML sliders/text).
 *   2. Real-time visual transformation of the unit square polygon.
 *   3. Reset to identity matrix.
 *   4. State persistence via localStorage.
 * ============================================================================
 */

$(document).ready(function () {

	// ========================================================================
	// SECTION 1: INITIALIZE DESMOS GRAPHING CALCULATOR
	// ========================================================================
	// Embed a streamlined graphing calculator instance inside #calculator div.
	var elt = document.getElementById('calculator');
	var calculator = Desmos.GraphingCalculator(elt, {
		expressions: false, // Hide default left-hand expressions sidebar
		settingsMenu: false, // Hide wrench/settings menu for a cleaner UI
		zoomButtons: true,   // Enable interactive zoom in/out buttons
	});

	// ========================================================================
	// SECTION 2: DEFINE GRAPH EXPRESSIONS & BASIS VECTORS
	// ========================================================================
	// In linear algebra, any 2D linear transformation is completely defined by
	// where the standard basis vectors land:
	//   - Standard basis: i-hat = (1, 0), j-hat = (0, 1)
	//   - Transformed:    i-hat = (a, b), j-hat = (c, d)
	// The 2x2 matrix is:
	//   [ a  c ]  where Column 1 is transformed i-hat (a, b)
	//   [ b  d ]  where Column 2 is transformed j-hat (c, d)
	calculator.setExpressions([
		// 1. Matrix Scalar Variables (default: Identity Matrix [1 0; 0 1])
		{ id: 'var-a', latex: 'a=1' },
		{ id: 'var-b', latex: 'b=0' },
		{ id: 'var-c', latex: 'c=0' },
		{ id: 'var-d', latex: 'd=1' },

		// 2. Draggable Basis Vector Points
		// Desmos automatically makes parametric points like (a,b) draggable.
		// Dragging the red point directly modifies variables 'a' and 'b'.
		{ id: 'p1', latex: '(a,b)', color: Desmos.Colors.RED, dragMode: Desmos.DragModes.XY, label: 'i-hat', showLabel: true },
		// Dragging the blue point directly modifies variables 'c' and 'd'.
		{ id: 'p2', latex: '(c,d)', color: Desmos.Colors.BLUE, dragMode: Desmos.DragModes.XY, label: 'j-hat', showLabel: true },

		// 3. Transformed Unit Square Polygon
		// Renders the shaded area formed by (0,0) -> (a,b) -> (a+c,b+d) -> (c,d)
		// showing how the original unit area is warped/stretched by the transformation.
		{ id: 'poly', latex: '\\operatorname{polygon}((0,0), (a,b), (a+c,b+d), (c,d))', color: Desmos.Colors.BLACK, fillOpacity: 0.1, lines: true, lineWidth: 1 }
	]);

	// ========================================================================
	// SECTION 3: TWO-WAY DATA BINDING (DESMOS GRAPH -> HTML UI)
	// ========================================================================
	// Create Helper Expressions to observe changes to variables a, b, c, d.
	// When a user drags points on the Desmos canvas, these observers fire.
	const helperA = calculator.HelperExpression({ latex: 'a' });
	const helperB = calculator.HelperExpression({ latex: 'b' });
	const helperC = calculator.HelperExpression({ latex: 'c' });
	const helperD = calculator.HelperExpression({ latex: 'd' });

	/**
	 * Synchronizes the HTML sliders, slider labels, and MathML formula
	 * with the latest numeric values from the Desmos calculator.
	 */
	function updateHTMLFromDesmos() {
		// Guard clause: ensure Desmos has fully evaluated values before updating DOM
		if (isNaN(helperA.numericValue)) return;

		// Update variable 'a' (Width / Stretch X)
		$('#mat-a').val(helperA.numericValue);
		$('#val-a').text(helperA.numericValue.toFixed(2));
		$('#disp-a').text(helperA.numericValue.toFixed(1));

		// Update variable 'b' (Vertical Skew / Y of i-hat)
		$('#mat-b').val(helperB.numericValue);
		$('#val-b').text(helperB.numericValue.toFixed(2));
		$('#disp-b').text(helperB.numericValue.toFixed(1));

		// Update variable 'c' (Horizontal Skew / X of j-hat)
		$('#mat-c').val(helperC.numericValue);
		$('#val-c').text(helperC.numericValue.toFixed(2));
		$('#disp-c').text(helperC.numericValue.toFixed(1));

		// Update variable 'd' (Height / Stretch Y)
		$('#mat-d').val(helperD.numericValue);
		$('#val-d').text(helperD.numericValue.toFixed(2));
		$('#disp-d').text(helperD.numericValue.toFixed(1));

		// Persist the updated transformation state
		saveMatrixState();
	}

	// Register observers on all four matrix scalar values
	helperA.observe('numericValue', updateHTMLFromDesmos);
	helperB.observe('numericValue', updateHTMLFromDesmos);
	helperC.observe('numericValue', updateHTMLFromDesmos);
	helperD.observe('numericValue', updateHTMLFromDesmos);

	// ========================================================================
	// SECTION 4: TWO-WAY DATA BINDING (HTML UI -> DESMOS GRAPH)
	// ========================================================================
	// When the user adjusts any range slider, update the corresponding
	// LaTeX expressions in the Desmos calculator.
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
		// Note: The UI display text will automatically update via the observers above.
	});

	// ========================================================================
	// SECTION 5: IDENTITY MATRIX RESET HANDLER
	// ========================================================================
	// Resets the transformation matrix back to the default Identity Matrix:
	//   [ 1  0 ]
	//   [ 0  1 ]
	$('#reset-btn').on('click', function () {
		calculator.setExpressions([
			{ id: 'var-a', latex: 'a=1' },
			{ id: 'var-b', latex: 'b=0' },
			{ id: 'var-c', latex: 'c=0' },
			{ id: 'var-d', latex: 'd=1' }
		]);
	});

	// ========================================================================
	// SECTION 6: LOCAL STORAGE PERSISTENCE
	// ========================================================================

	/**
	 * Serializes current matrix parameters (a, b, c, d) and saves them
	 * to browser localStorage so the user's graph state survives page refreshes.
	 */
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

	/**
	 * Reads previously saved matrix parameters from localStorage
	 * and initializes the Desmos calculator state with those values.
	 */
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

	// ========================================================================
	// SECTION 7: INITIAL EXECUTION
	// ========================================================================
	// Restore any previously saved matrix configuration on page load
	loadSavedMatrix();
});
