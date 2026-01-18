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
                applyRestStyles();
            } else if (!nowInBounds && isMouseInChart) {
                // Mouse left chart
                isMouseInChart = false;
                console.log('Mouse left composite-chart');
                revertStyles();
            }
        });
    }
    
    function applyRestStyles() {
        // Find all line-graph-* elements
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            // Make markers invisible via fill opacity
            const markersGroup = lineGraph.querySelector('[id^="markers-"]');
            if (markersGroup) {
                // Get all visual elements inside markers group
                const markerElements = markersGroup.querySelectorAll('circle, rect, ellipse, polygon, path');
                markerElements.forEach(function(element) {
                    // Save original fill opacity before changing
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            fillOpacity: element.style.fillOpacity || getComputedStyle(element).fillOpacity
                        });
                    }
                    element.style.fillOpacity = '0'; // Completely transparent
                });
            }
            
            // Style polyline group - gray 30%
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            if (polylineGroup) {
                // Get all line/path elements inside polyline group
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                lineElements.forEach(function(element) {
                    // Save original stroke before changing
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            stroke: element.style.stroke || getComputedStyle(element).stroke,
                            ...originalStyles.get(element) // Preserve existing saved properties
                        });
                    }
                    element.style.stroke = '#4d4d4d'; // Gray 30%
                });
            }
        });
        
        console.log(`Applied rest styles to ${lineGraphs.length} line-graph elements`);
    }
    
    function revertStyles() {
        originalStyles.forEach(function(originalStyle, element) {
            // Restore fill opacity for markers
            if (originalStyle.fillOpacity !== undefined) {
                element.style.fillOpacity = originalStyle.fillOpacity || '';
            }
            
            // Restore stroke color for polylines
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

