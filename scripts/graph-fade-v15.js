// v15 sub-target
(function() {
    console.log('SVG Styler: Initializing...');
    
    const originalStyles = new Map();
    let isMouseInChart = false;
    let activeLineGraph = null;
    let compositeChart = null;
    
    // Debug: visual indicator for hover areas
    let debugCircle = null;
    
    function init() {
        compositeChart = document.getElementById('composite-chart');
        
        if (!compositeChart) {
            setTimeout(init, 500);
            return;
        }
        
        console.log('composite-chart found');
        
        // Create debug visual (optional)
        createDebugVisual();
        
        // Track mouse position
        document.addEventListener('mousemove', function(e) {
            handleMouseMove(e);
        });
    }
    
    function createDebugVisual() {
        debugCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        debugCircle.setAttribute('r', '3');
        debugCircle.setAttribute('fill', 'red');
        debugCircle.setAttribute('opacity', '0.5');
        debugCircle.style.pointerEvents = 'none';
        compositeChart.appendChild(debugCircle);
    }
    
    function handleMouseMove(e) {
        // Get chart bounds
        const chartRect = compositeChart.getBoundingClientRect();
        const inChart = e.clientX >= chartRect.left && 
                       e.clientX <= chartRect.right && 
                       e.clientY >= chartRect.top && 
                       e.clientY <= chartRect.bottom;
        
        // Update debug circle
        if (debugCircle) {
            const svg = compositeChart.closest('svg');
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const ctm = svg.getScreenCTM();
            if (ctm) {
                const transformed = point.matrixTransform(ctm.inverse());
                debugCircle.setAttribute('cx', transformed.x);
                debugCircle.setAttribute('cy', transformed.y);
            }
        }
        
        // Handle chart state
        if (inChart && !isMouseInChart) {
            isMouseInChart = true;
            console.log('Mouse entered composite-chart');
            applyRestStyles();
        } else if (!inChart && isMouseInChart) {
            isMouseInChart = false;
            console.log('Mouse left composite-chart');
            revertAllStyles();
        }
        
        // Check line proximity
        if (inChart) {
            const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
            let foundNear = false;
            
            for (const lineGraph of lineGraphs) {
                const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
                if (!polylineGroup) continue;
                
                // Get all path/lines in polyline
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                
                for (const element of lineElements) {
                    if (isNearElement(element, e, 3)) {
                        foundNear = true;
                        
                        if (lineGraph !== activeLineGraph) {
                            // Revert previous
                            if (activeLineGraph) {
                                revertLineGraphStyles(activeLineGraph);
                            }
                            
                            // Set new active
                            activeLineGraph = lineGraph;
                            console.log('Mouse near line-graph:', lineGraph.id);
                            applyActiveStyle(lineGraph);
                        }
                        break;
                    }
                }
                if (foundNear) break;
            }
            
            // No longer near any line
            if (!foundNear && activeLineGraph) {
                console.log('Mouse away from line-graph');
                revertLineGraphStyles(activeLineGraph);
                activeLineGraph = null;
                applyRestStyles();
            }
        }
    }
    
    function isNearElement(element, mouseEvent, radius) {
        // Simple bounding box check first
        const rect = element.getBoundingClientRect();
        const padding = radius;
        
        const inBoundingBox = mouseEvent.clientX >= rect.left - padding &&
                            mouseEvent.clientX <= rect.right + padding &&
                            mouseEvent.clientY >= rect.top - padding &&
                            mouseEvent.clientY <= rect.bottom + padding;
        
        if (!inBoundingBox) return false;
        
        // For lines, check distance more accurately
        const svg = compositeChart.closest('svg');
        const point = svg.createSVGPoint();
        point.x = mouseEvent.clientX;
        point.y = mouseEvent.clientY;
        
        try {
            const ctm = svg.getScreenCTM();
            if (!ctm) return false;
            
            const svgPoint = point.matrixTransform(ctm.inverse());
            
            if (element.tagName === 'LINE') {
                const x1 = parseFloat(element.getAttribute('x1'));
                const y1 = parseFloat(element.getAttribute('y1'));
                const x2 = parseFloat(element.getAttribute('x2'));
                const y2 = parseFloat(element.getAttribute('y2'));
                
                return distanceToLine(svgPoint.x, svgPoint.y, x1, y1, x2, y2) <= radius;
            }
            
            // For paths and polylines, use simpler bounding box for now
            return true;
            
        } catch (e) {
            console.log('Error checking proximity:', e);
            return false;
        }
    }
    
    function distanceToLine(px, py, x1, y1, x2, y2) {
        // Distance from point to line segment
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function applyRestStyles() {
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            if (lineGraph === activeLineGraph) return;
            
            // Markers
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
            
            // Polylines
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            if (polylineGroup) {
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                lineElements.forEach(function(element) {
                    if (!originalStyles.has(element)) {
                        originalStyles.set(element, {
                            stroke: element.style.stroke || getComputedStyle(element).stroke
                        });
                    }
                    element.style.stroke = '#4d4d4d';
                });
            }
        });
    }
    
    function applyActiveStyle(lineGraph) {
        const textElement = lineGraph.querySelector('text');
        
        if (textElement) {
            if (!originalStyles.has(textElement)) {
                const computedStyle = getComputedStyle(textElement);
                originalStyles.set(textElement, {
                    fontSize: textElement.style.fontSize || computedStyle.fontSize,
                    fill: textElement.style.fill || computedStyle.fill
                });
            }
            
            const originalSize = parseFloat(originalStyles.get(textElement).fontSize) || 
                                parseFloat(getComputedStyle(textElement).fontSize) || 12;
            textElement.style.fontSize = (originalSize * 1.25) + 'px';
            textElement.style.fill = '#000000';
        }
    }
    
    function revertLineGraphStyles(lineGraph) {
        // Markers
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
        
        // Polylines
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
        
        // Text
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
        
        activeLineGraph = null;
    }
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

