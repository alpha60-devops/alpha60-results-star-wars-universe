(function() {
    console.log('SVG Styler: Initializing...');
    
    const originalStyles = new Map();
    let isMouseInChart = false;
    let activeLineGraph = null;
    let compositeChart = null;
    
    // Store all polyline points for distance calculation
    const lineGraphPoints = new Map();
    
    function init() {
        compositeChart = document.getElementById('composite-chart');
        
        if (!compositeChart) {
            console.log('composite-chart not found, retrying...');
            setTimeout(init, 500);
            return;
        }
        
        console.log('composite-chart found');
        
        // Pre-calculate all polyline points for distance checking
        cachePolylinePoints();
        
        // Track mouse position
        document.addEventListener('mousemove', function(e) {
            const bounds = compositeChart.getBoundingClientRect();
            const nowInChart = e.clientX >= bounds.left && 
                              e.clientX <= bounds.right && 
                              e.clientY >= bounds.top && 
                              e.clientY <= bounds.bottom;
            
            // Handle chart enter/exit
            if (nowInChart && !isMouseInChart) {
                isMouseInChart = true;
                console.log('Mouse entered composite-chart');
                applyRestStyles();
            } else if (!nowInChart && isMouseInChart) {
                isMouseInChart = false;
                console.log('Mouse left composite-chart');
                revertAllStyles();
            }
            
            // Check line-graph proximity if in chart
            if (nowInChart) {
                checkLineProximity(e.clientX, e.clientY);
            }
        });
    }
    
    function cachePolylinePoints() {
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            if (!polylineGroup) return;
            
            const points = [];
            
            // Get all path/lines in polyline group
            const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
            lineElements.forEach(function(element) {
                if (element.tagName === 'PATH') {
                    // Extract points from path data (simplified - for straight line segments)
                    const pathData = element.getAttribute('d') || '';
                    // Parse path commands to extract points
                    const pathPoints = parsePathData(pathData);
                    points.push(...pathPoints);
                } else if (element.tagName === 'LINE') {
                    // Get line endpoints
                    const x1 = parseFloat(element.getAttribute('x1'));
                    const y1 = parseFloat(element.getAttribute('y1'));
                    const x2 = parseFloat(element.getAttribute('x2'));
                    const y2 = parseFloat(element.getAttribute('y2'));
                    points.push({x: x1, y: y1});
                    points.push({x: x2, y: y2});
                } else if (element.tagName === 'POLYLINE') {
                    // Parse polyline points
                    const pointsAttr = element.getAttribute('points') || '';
                    const polyPoints = pointsAttr.trim().split(/\s+/);
                    polyPoints.forEach(function(pointStr) {
                        const [x, y] = pointStr.split(',').map(parseFloat);
                        points.push({x, y});
                    });
                }
            });
            
            lineGraphPoints.set(lineGraph, points);
        });
        
        console.log('Cached polyline points for', lineGraphs.length, 'line-graphs');
    }
    
    function parsePathData(pathData) {
        // Simplified path parser - extracts M and L commands
        const points = [];
        const commands = pathData.match(/[ML]\s*[\d\.]+\s*[\d\.]+/g) || [];
        
        commands.forEach(function(cmd) {
            const coords = cmd.match(/[\d\.]+/g);
            if (coords && coords.length >= 2) {
                points.push({
                    x: parseFloat(coords[0]),
                    y: parseFloat(coords[1])
                });
            }
        });
        
        return points;
    }
    
    function checkLineProximity(mouseX, mouseY) {
        const svg = compositeChart.closest('svg');
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = mouseX;
        svgPoint.y = mouseY;
        
        // Convert to SVG coordinate system
        const ctm = svg.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(ctm);
        
        let closestLineGraph = null;
        let minDistance = Infinity;
        
        // Check distance to each line-graph's polyline points
        lineGraphPoints.forEach(function(points, lineGraph) {
            // Find closest point in this line-graph
            for (const point of points) {
                const distance = Math.sqrt(
                    Math.pow(svgCoords.x - point.x, 2) + 
                    Math.pow(svgCoords.y - point.y, 2)
                );
                
                if (distance < minDistance && distance <= 3) { // 3 pixel radius
                    minDistance = distance;
                    closestLineGraph = lineGraph;
                }
            }
        });
        
        // Handle line-graph proximity changes
        if (closestLineGraph && closestLineGraph !== activeLineGraph) {
            // New line-graph is near mouse
            if (activeLineGraph) {
                // Revert previously active line-graph
                revertLineGraphStyles(activeLineGraph);
            }
            activeLineGraph = closestLineGraph;
            console.log('Mouse near line-graph:', activeLineGraph.id);
            applyActiveStyle(activeLineGraph);
        } else if (!closestLineGraph && activeLineGraph) {
            // Mouse moved away from active line-graph
            console.log('Mouse away from line-graph');
            revertLineGraphStyles(activeLineGraph);
            activeLineGraph = null;
            
            // Re-apply rest styles to all
            applyRestStyles();
        }
    }
    
    function applyRestStyles() {
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            // Skip if this is the active line-graph
            if (lineGraph === activeLineGraph) return;
            
            // Make markers invisible
            const markersGroup = lineGraph.querySelector('[id^="markers-"]');
            if (markersGroup) {
                const markerElements = markersGroup.querySelectorAll('circle, rect, ellipse, polygon, path');
                markerElements.forEach(function(element) {
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            fillOpacity: element.style.fillOpacity || getComputedStyle(element).fillOpacity
                        });
                    }
                    element.style.fillOpacity = '0';
                });
            }
            
            // Style polyline - gray 30%
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            if (polylineGroup) {
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                lineElements.forEach(function(element) {
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
    }
    
    function applyActiveStyle(lineGraph) {
        // Find text element within this line-graph
        const textElement = lineGraph.querySelector('text');
        
        if (textElement) {
            // Save original text styles
            if (!originalStyles.has(textElement)) {
                const computedStyle = getComputedStyle(textElement);
                originalStyles.set(textElement, {
                    fontSize: textElement.style.fontSize || computedStyle.fontSize,
                    fill: textElement.style.fill || computedStyle.fill
                });
            }
            
            // Apply active styling
            const originalSize = parseFloat(originalStyles.get(textElement).fontSize) || 12;
            textElement.style.fontSize = (originalSize * 1.25) + 'px';
            textElement.style.fill = '#000000'; // Black
            
            console.log('Applied active style to text in:', lineGraph.id);
        }
    }
    
    function revertLineGraphStyles(lineGraph) {
        // Revert markers visibility
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
        
        // Revert polyline color
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
        
        // Revert text styling
        const textElement = lineGraph.querySelector('text');
        if (textElement) {
            const originalStyle = originalStyles.get(textElement);
            if (originalStyle) {
                textElement.style.fontSize = originalStyle.fontSize || '';
                textElement.style.fill = originalStyle.fill || '';
            }
        }
    }
    
    function revertAllStyles() {
        originalStyles.forEach(function(originalStyle, element) {
            if (originalStyle.fillOpacity !== undefined) {
                element.style.fillOpacity = originalStyle.fillOpacity || '';
            }
            if (originalStyle.stroke !== undefined) {
                element.style.stroke = originalStyle.stroke || '';
            }
            if (originalStyle.fontSize !== undefined) {
                element.style.fontSize = originalStyle.fontSize || '';
            }
            if (originalStyle.fill !== undefined) {
                element.style.fill = originalStyle.fill || '';
            }
        });
        
        console.log('Reverted all styles');
        activeLineGraph = null;
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
