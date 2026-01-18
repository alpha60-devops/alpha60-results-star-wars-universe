// v17
(function() {
    console.log('SVG Styler: Initializing...');
    
    // Configuration
    const use_visual_debug = true;
    const radius_check_size = 10;
    
    const originalStyles = new Map();
    let isMouseInChart = false;
    let activeLineGraph = null;
    let compositeChart = null;
    
    // Debug visual
    let debugCircle = null;
    
    // Store polyline points for accurate distance checking
    const polylinePoints = new Map();
    
    function init() {
        compositeChart = document.getElementById('composite-chart');
        
        if (!compositeChart) {
            setTimeout(init, 500);
            return;
        }
        
        console.log('composite-chart found, radius:', radius_check_size, 'px');
        
        // Extract all polyline points for accurate proximity checking
        extractPolylinePoints();
        
        // Create debug visual if enabled
        if (use_visual_debug) {
            createDebugVisual();
        }
        
        // Track mouse position
        document.addEventListener('mousemove', function(e) {
            handleMouseMove(e);
        });
    }
    
    function extractPolylinePoints() {
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            const points = [];
            const polylineGroup = lineGraph.querySelector('[id^="polyline-"]');
            
            if (polylineGroup) {
                const lineElements = polylineGroup.querySelectorAll('path, line, polyline');
                
                lineElements.forEach(function(element) {
                    if (element.tagName === 'PATH') {
                        const pathPoints = extractPathPoints(element);
                        points.push(...pathPoints);
                    } else if (element.tagName === 'LINE') {
                        const x1 = parseFloat(element.getAttribute('x1'));
                        const y1 = parseFloat(element.getAttribute('y1'));
                        const x2 = parseFloat(element.getAttribute('x2'));
                        const y2 = parseFloat(element.getAttribute('y2'));
                        points.push({x: x1, y: y1, element: element});
                        points.push({x: x2, y: y2, element: element});
                    } else if (element.tagName === 'POLYLINE') {
                        const pointsAttr = element.getAttribute('points');
                        if (pointsAttr) {
                            const pointStrings = pointsAttr.trim().split(/\s+/);
                            pointStrings.forEach(function(pointStr) {
                                const [x, y] = pointStr.split(',').map(parseFloat);
                                points.push({x, y, element: element});
                            });
                        }
                    }
                });
            }
            
            polylinePoints.set(lineGraph, points);
        });
        
        console.log(`Extracted points for ${lineGraphs.length} line-graphs`);
    }
    
    function extractPathPoints(pathElement) {
        const points = [];
        const d = pathElement.getAttribute('d');
        if (!d) return points;
        
        const commands = d.match(/[ML]\s*[-\d\.]+\s*[-\d\.]+/g) || [];
        
        commands.forEach(function(cmd) {
            const coords = cmd.match(/[-\d\.]+/g);
            if (coords && coords.length >= 2) {
                points.push({
                    x: parseFloat(coords[0]),
                    y: parseFloat(coords[1]),
                    element: pathElement
                });
            }
        });
        
        return points;
    }
    
    function createDebugVisual() {
        debugCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        debugCircle.setAttribute('r', radius_check_size);
        debugCircle.setAttribute('fill', 'red');
        debugCircle.setAttribute('opacity', '0.3');
        debugCircle.style.pointerEvents = 'none';
        compositeChart.appendChild(debugCircle);
    }
    
    function handleMouseMove(e) {
        // Update debug visual if enabled
        if (use_visual_debug && debugCircle) {
            updateDebugVisual(e);
        }
        
        // Get chart bounds
        const chartRect = compositeChart.getBoundingClientRect();
        const inChart = e.clientX >= chartRect.left && 
                       e.clientX <= chartRect.right && 
                       e.clientY >= chartRect.top && 
                       e.clientY <= chartRect.bottom;
        
        // Handle chart enter/exit
        if (inChart && !isMouseInChart) {
            isMouseInChart = true;
            console.log('Mouse entered composite-chart');
            applyRestStyles(); // Apply rest styles to ALL line-graphs
        } else if (!inChart && isMouseInChart) {
            isMouseInChart = false;
            console.log('Mouse left composite-chart');
            revertAllStyles();
            activeLineGraph = null;
            return; // Exit early - nothing more to do outside chart
        }
        
        // Only check proximity if we're in the chart
        if (inChart) {
            checkLineProximity(e.clientX, e.clientY);
        }
    }
    
    function updateDebugVisual(e) {
        try {
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
        } catch (error) {
            console.log('Debug visual update error:', error);
        }
    }
    
    function checkLineProximity(mouseX, mouseY) {
        // Convert screen coordinates to SVG coordinates
        let svgCoords;
        try {
            const svg = compositeChart.closest('svg');
            const point = svg.createSVGPoint();
            point.x = mouseX;
            point.y = mouseY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return;
            
            svgCoords = point.matrixTransform(ctm.inverse());
        } catch (error) {
            console.log('Coordinate conversion error:', error);
            return;
        }
        
        // Check distance to each line-graph's polyline points
        let hoveredLineGraph = null;
        let minDistance = Infinity;
        
        polylinePoints.forEach(function(points, lineGraph) {
            for (const point of points) {
                const distance = Math.sqrt(
                    Math.pow(svgCoords.x - point.x, 2) + 
                    Math.pow(svgCoords.y - point.y, 2)
                );
                
                if (distance < minDistance && distance <= radius_check_size) {
                    minDistance = distance;
                    hoveredLineGraph = lineGraph;
                }
            }
        });
        
        // Handle state changes
        if (hoveredLineGraph && hoveredLineGraph !== activeLineGraph) {
            // Mouse entered a new line-graph's proximity
            console.log('Mouse near line-graph:', hoveredLineGraph.id, 'distance:', minDistance.toFixed(2));
            
            if (activeLineGraph) {
                // Revert the previously active line-graph to rest style
                revertLineGraphStyles(activeLineGraph);
                // Apply rest style to the previously active line-graph
                applyRestStyleToLineGraph(activeLineGraph);
            }
            
            // Set new active line-graph
            activeLineGraph = hoveredLineGraph;
            // Apply active style to the new line-graph
            applyActiveStyle(activeLineGraph);
            
        } else if (!hoveredLineGraph && activeLineGraph) {
            // Mouse moved away from active line-graph (but still in chart)
            console.log('Mouse away from line-graph');
            
            // Revert the active line-graph to its original state
            revertLineGraphStyles(activeLineGraph);
            // Apply rest style to it
            applyRestStyleToLineGraph(activeLineGraph);
            
            activeLineGraph = null;
        }
    }
    
    function applyRestStyles() {
        // Apply rest style to ALL line-graphs
        const lineGraphs = compositeChart.querySelectorAll('[id^="line-graph-"]');
        
        lineGraphs.forEach(function(lineGraph) {
            applyRestStyleToLineGraph(lineGraph);
        });
        
        console.log('Applied rest styles to all line-graphs');
    }
    
    function applyRestStyleToLineGraph(lineGraph) {
        // Skip if this line-graph is currently active
        if (lineGraph === activeLineGraph) return;
        
        // Markers - make invisible
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
        
        // Polylines - gray 30%
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
        // Revert markers
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
        
        // Revert polylines
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
        
        // Revert text
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
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
