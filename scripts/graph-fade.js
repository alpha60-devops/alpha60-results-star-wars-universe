(function() {
    console.log('SVG Styler script loading (with revert functionality)...');
    
    // Store original styles for each element
    const originalStyles = new Map();
    
    function handleSvgMouseover() {
        let targetElement = null;
        
        // Try to find target element
        targetElement = document.querySelector('[id$="-downloads-by-week-cumulative-normalized-start"]');
        
        if (!targetElement) {
            // Fallback: look for elements with similar patterns
            const possibleSelectors = [
                '[id*="downloads"]',
                '[id*="cumulative"]',
                '[id*="normalized"]',
                'svg g',
                'svg'
            ];
            
            for (const selector of possibleSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    if (el.id && (el.id.includes('download') || el.id.includes('cumulative'))) {
                        targetElement = el;
                        break;
                    }
                }
                if (targetElement) break;
            }
        }
        
        if (!targetElement) {
            // Last resort: use first SVG element
            const svgElements = document.querySelectorAll('svg, svg g');
            targetElement = svgElements[0];
            if (!targetElement) {
                console.log('No SVG elements found');
                return;
            }
        }
        
        console.log('Target element:', targetElement.tagName, targetElement.id || 'no-id');
        
        // Function to save original styles
        function saveOriginalStyles(elements) {
            originalStyles.clear(); // Clear previous saves
            
            elements.forEach(function(element) {
                const tagName = element.tagName.toLowerCase();
                const id = element.id || '';
                
                // Only save for elements we might style
                if (tagName === 'path' || tagName === 'line' || tagName === 'polyline' || id.includes('line')) {
                    const styles = {
                        stroke: element.style.stroke || getComputedStyle(element).stroke,
                        strokeOpacity: element.style.strokeOpacity || getComputedStyle(element).strokeOpacity,
                        strokeWidth: element.style.strokeWidth || getComputedStyle(element).strokeWidth,
                        fill: element.style.fill || getComputedStyle(element).fill,
                        fillOpacity: element.style.fillOpacity || getComputedStyle(element).fillOpacity
                    };
                    
                    // Store using a unique identifier
                    const elementKey = `${tagName}_${id || element.className || 'unnamed'}_${Math.random().toString(36).substr(2, 9)}`;
                    originalStyles.set(element, styles);
                    
                    // Also store the key on the element for easy retrieval
                    element.dataset.styleKey = elementKey;
                }
            });
            
            console.log(`Saved original styles for ${originalStyles.size} elements`);
        }
        
        // Function to apply gray styling
        function applyGrayStyles(elements) {
            elements.forEach(function(element) {
                const tagName = element.tagName.toLowerCase();
                const id = element.id || '';
                
                if (tagName === 'path' || tagName === 'line' || tagName === 'polyline' || id.includes('line')) {
                    element.style.stroke = '#808080';
                    element.style.strokeOpacity = '1';
                    element.style.strokeWidth = '2';
                    
                    if (tagName === 'path' && !id.includes('stroke')) {
                        element.style.fill = '#808080';
                        element.style.fillOpacity = '0.3';
                    }
                }
            });
        }
        
        // Function to revert to original styles
        function revertToOriginalStyles() {
            let revertedCount = 0;
            
            originalStyles.forEach(function(styles, element) {
                if (element && element.style) {
                    // Revert each property
                    if (styles.stroke !== undefined) {
                        element.style.stroke = styles.stroke;
                    } else {
                        element.style.removeProperty('stroke');
                    }
                    
                    if (styles.strokeOpacity !== undefined) {
                        element.style.strokeOpacity = styles.strokeOpacity;
                    } else {
                        element.style.removeProperty('stroke-opacity');
                    }
                    
                    if (styles.strokeWidth !== undefined) {
                        element.style.strokeWidth = styles.strokeWidth;
                    } else {
                        element.style.removeProperty('stroke-width');
                    }
                    
                    if (styles.fill !== undefined) {
                        element.style.fill = styles.fill;
                    } else {
                        element.style.removeProperty('fill');
                    }
                    
                    if (styles.fillOpacity !== undefined) {
                        element.style.fillOpacity = styles.fillOpacity;
                    } else {
                        element.style.removeProperty('fill-opacity');
                    }
                    
                    revertedCount++;
                }
            });
            
            console.log(`Reverted styles for ${revertedCount} elements`);
            return revertedCount;
        }
        
        // Get bounding rect for mouseout detection
        function getBoundingRect(element) {
            const rect = element.getBoundingClientRect();
            // Add some padding to the rect for easier mouse tracking
            return {
                left: rect.left - 10,
                top: rect.top - 10,
                right: rect.right + 10,
                bottom: rect.bottom + 10,
                width: rect.width + 20,
                height: rect.height + 20
            };
        }
        
        // Track mouse position for bounding rect check
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Check if mouse is within bounding rect
        function isMouseInBounds(bounds) {
            return mouseX >= bounds.left && 
                   mouseX <= bounds.right && 
                   mouseY >= bounds.top && 
                   mouseY <= bounds.bottom;
        }
        
        let currentBounds = null;
        let revertTimeout = null;
        let isMouseOver = false;
        
        // Mouseover event
        targetElement.addEventListener('mouseover', function(event) {
            if (isMouseOver) return; // Already handling mouseover
            
            isMouseOver = true;
            console.log('Mouse entered target element');
            
            // Get current bounds
            currentBounds = getBoundingRect(targetElement);
            
            // Clear any pending revert timeout
            if (revertTimeout) {
                clearTimeout(revertTimeout);
                revertTimeout = null;
            }
            
            // Find elements to style
            let compositeChart = document.getElementById('composite-chart') || 
                               document.querySelector('[id*="composite"], [id*="chart"]');
            
            let elementsToStyle = [];
            
            if (compositeChart) {
                elementsToStyle = compositeChart.querySelectorAll('[id*="line"], path, line, polyline');
            } else {
                // Fallback to all line-like elements
                elementsToStyle = document.querySelectorAll('svg path, svg line, svg polyline');
            }
            
            if (elementsToStyle.length > 0) {
                // Save original styles first
                saveOriginalStyles(elementsToStyle);
                // Apply gray styles
                applyGrayStyles(elementsToStyle);
                console.log(`Applied gray styles to ${elementsToStyle.length} elements`);
            }
        });
        
        // Mouseout event - check bounding rect
        targetElement.addEventListener('mouseout', function(event) {
            if (!isMouseOver) return;
            
            console.log('Mouse left target element, checking bounds...');
            
            // Check bounds periodically
            function checkBoundsAndRevert() {
                if (currentBounds && !isMouseInBounds(currentBounds)) {
                    console.log('Mouse outside bounds, reverting styles');
                    revertToOriginalStyles();
                    isMouseOver = false;
                    revertTimeout = null;
                } else if (isMouseOver) {
                    // Still in bounds, check again in 100ms
                    revertTimeout = setTimeout(checkBoundsAndRevert, 100);
                }
            }
            
            // Start checking bounds
            checkBoundsAndRevert();
        });
        
        // Also handle mouse leaving the entire document
        document.addEventListener('mouseleave', function() {
            if (isMouseOver) {
                console.log('Mouse left document, reverting styles');
                revertToOriginalStyles();
                isMouseOver = false;
                if (revertTimeout) {
                    clearTimeout(revertTimeout);
                    revertTimeout = null;
                }
            }
        });
        
        // Add visual indicator of bounds (for debugging, optional)
        if (window.location.href.includes('debug')) {
            const style = document.createElement('style');
            style.textContent = `
                [id$="-downloads-by-week-cumulative-normalized-start"]:hover::after {
                    content: '';
                    position: absolute;
                    border: 2px dashed red;
                    pointer-events: none;
                    z-index: 9999;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(handleSvgMouseover, 1000);
            });
        } else {
            setTimeout(handleSvgMouseover, 1000);
        }
        
        // Additional attempt for dynamic content
        setTimeout(handleSvgMouseover, 3000);
    }
    
    init();
})();
