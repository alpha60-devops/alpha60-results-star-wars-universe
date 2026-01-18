// v13
(function() {
    console.log('SVG Styler: Initializing...');
    
    const originalStyles = new Map();
    let isMouseInChart = false;
    let isMouseInLineGraph = false;
    let activeLineGraph = null;
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
            const nowInChart = e.clientX >= bounds.left && 
                              e.clientX <= bounds.right && 
                              e.clientY >= bounds.top && 
                              e.clientY <= bounds.bottom;
            
            // Check if mouse is over any line-graph element
            let hoveredLineGraph = null;
            if (nowInChart) {
                const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
                for (const lineGraph of lineGraphs) {
                    const lineGraphBounds = lineGraph.getBoundingClientRect();
                    if (e.clientX >= lineGraphBounds.left && 
                        e.clientX <= lineGraphBounds.right && 
                        e.clientY >= lineGraphBounds.top && 
                        e.clientY <= lineGraphBounds.bottom) {
                        hoveredLineGraph = lineGraph;
                        break;
                    }
                }
            }
            
            // Handle chart enter/exit
            if (nowInChart && !isMouseInChart) {
                // Mouse entered chart
                isMouseInChart = true;
                console.log('Mouse entered composite-chart');
                applyRestStyles();
            } else if (!nowInChart && isMouseInChart) {
                // Mouse left chart
                isMouseInChart = false;
                console.log('Mouse left composite-chart');
                revertStyles();
            }
            
            // Handle line-graph hover
            if (hoveredLineGraph && !isMouseInLineGraph) {
                // Mouse entered a line-graph
                isMouseInLineGraph = true;
                activeLineGraph = hoveredLineGraph;
                console.log('Mouse entered line-graph:', activeLineGraph.id);
                revertLineGraphStyles(activeLineGraph);
            } else if (!hoveredLineGraph && isMouseInLineGraph) {
                // Mouse left the line-graph
                isMouseInLineGraph = false;
                console.log('Mouse left line-graph');
                
                // Only re-apply rest styles if we're still in the chart
                if (isMouseInChart) {
                    applyRestStyles();
                }
                activeLineGraph = null;
            }
        });
    }
    
    function applyRestStyles() {
        // Find all line-graph-* elements
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            // Skip if this is the active line-graph being hovered
            if (lineGraph === activeLineGraph) return;
            
            // Make markers invisible via fill opacity
            const markersGroup = lineGraph.querySelector('[id^="markers-"]');
            if (markersGroup) {
                const markerElements = markersGroup.querySelectorAll('circle, rect, ellipse, polygon, path');
                markerElements.forEach(function(element) {
                    // Save original fill opacity before changing
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            fillOpacity: element.style.fillOpacity || getComputedStyle(element).fillOpacity
                        });
                    }
                    element.style.fillOpacity = '0';
                });
            }
            
            // Style polyline group - gray 30%
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            if (polylineGroup) {
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                lineElements.forEach(function(element) {
                    // Save original stroke before changing
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            stroke: element.style.stroke || getComputedStyle(element).stroke,
                            ...originalStyles.get(element)
                        });
                    }
                    element.style.stroke = '#4d4d4d';
                });
            }
        });
        
        console.log(`Applied rest styles to ${lineGraphs.length} line-graph elements`);
    }
    
    function revertLineGraphStyles(lineGraph) {
        // Revert only the styles for this specific line-graph
        const markersGroup = lineGraph.querySelector('[id^="markers-"]');
        if (markersGroup) {
            const markerElements = markersGroup.querySelectorAll('circle, rect, ellipse, polygon, path');
            markerElements.forEach(function(element) {
                const originalStyle = originalStyles.get(element);
                if (originalStyle && originalStyle.fillOpacity !== undefined) {
                    element.style.fillOpacity = originalStyle.fillOpacity || '';
                }
            });
        }
        
        const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
        if (polylineGroup) {
            const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
            lineElements.forEach(function(element) {
                const originalStyle = originalStyles.get(element);
                if (originalStyle && originalStyle.stroke !== undefined) {
                    element.style.stroke = originalStyle.stroke || '';
                }
            });
        }
        
        console.log('Reverted styles for:', lineGraph.id);
    }
    
    function revertStyles() {
        originalStyles.forEach(function(originalStyle, element) {
            if (originalStyle.fillOpacity !== undefined) {
                element.style.fillOpacity = originalStyle.fillOpacity || '';
            }
            if (originalStyle.stroke !== undefined) {
                element.style.stroke = originalStyle.stroke || '';
            }
        });
        
        console.log('Reverted all styles');
        isMouseInLineGraph = false;
        activeLineGraph = null;
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

