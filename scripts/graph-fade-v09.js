(function() {
    console.log('SVG Styler: Initializing...');
    
    const originalStyles = new Map();
    let isMouseInChart = false;
    let compositeChart = null;
    
    function init() {
        compositeChart = document.getElementById('composite-chart');
        
        if (!compositeChart) {
            console.log('composite-chart not found, retrying...');
            setTimeout(init, 500);
            return;
        }
        
        console.log('composite-chart found');
        
        // Track mouse position relative to chart bounds
        document.addEventListener('mousemove', function(e) {
            const bounds = compositeChart.getBoundingClientRect();
            const nowInBounds = e.clientX >= bounds.left && 
                               e.clientX <= bounds.right && 
                               e.clientY >= bounds.top && 
                               e.clientY <= bounds.bottom;
            
            if (nowInBounds && !isMouseInChart) {
                // Mouse entered chart
                isMouseInChart = true;
                console.log('Mouse entered composite-chart');
                applyGrayStyles();
            } else if (!nowInBounds && isMouseInChart) {
                // Mouse left chart
                isMouseInChart = false;
                console.log('Mouse left composite-chart');
                revertStyles();
            }
        });
    }
    
    function applyGrayStyles() {
        // Find all line-graph-* elements
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            // Style markers group
            const markers = lineGraph.querySelector('[id^="markers-"]');
            if (markers) {
                // Save original fill before changing
                if (!originalStyles.has(markers)) {
                    originalStyles.set(markers, {
                        fill: markers.style.fill || getComputedStyle(markers).fill
                    });
                }
                markers.style.fill = '#4d4d4d'; // Gray 30%
            }
            
            // Style polyline group
            const polyline = lineGraph.querySelector('[id^="polyline-"]');
            if (polyline) {
                // Save original stroke before changing
                if (!originalStyles.has(polyline)) {
                    originalStyles.set(polyline, {
                        stroke: polyline.style.stroke || getComputedStyle(polyline).stroke
                    });
                }
                polyline.style.stroke = '#4d4d4d'; // Gray 30%
            }
        });
        
        console.log(`Styled ${lineGraphs.length} line-graph elements`);
    }
    
    function revertStyles() {
        originalStyles.forEach(function(originalStyle, element) {
            if (originalStyle.fill !== undefined) {
                element.style.fill = originalStyle.fill || '';
            }
            if (originalStyle.stroke !== undefined) {
                element.style.stroke = originalStyle.stroke || '';
            }
        });
        
        console.log('Reverted to original styles');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
