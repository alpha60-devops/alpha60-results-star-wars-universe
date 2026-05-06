/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:  sortable-table.js
 *   Desc:  Adds sorting to a HTML data table that implements ARIA Authoring Practices
 *   URL:   https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/
 *   ver:   20260506:10
 */

'use strict';

const VERBOSE = true; // Set to true to enable console logging for debugging

class SortableTable {
  constructor(tableNode) {
    this.tableNode = tableNode;

    // Get ALL header cells in the thead (including all rows)
    this.allHeaders = tableNode.querySelectorAll('thead th');
    
    // Find which header cells actually contain buttons (these are the sortable columns)
    this.columnHeaders = [];

    for (var i = 0; i < this.allHeaders.length; i++) {
      var ch = this.allHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (buttonNode) {
        // Store the actual DOM element and its logical column index
        this.columnHeaders.push({
          element: ch,
          button: buttonNode,
          columnIndex: this.getActualColumnIndex(ch)
        });
        
        buttonNode.setAttribute('data-column-index', this.columnHeaders[this.columnHeaders.length - 1].columnIndex);
        buttonNode.addEventListener('click', this.handleClick.bind(this));
      }
    }
  }

  // Helper to find the actual data column index for a header cell (handles colspan)
  getActualColumnIndex(headerCell) {
    // Get the table body rows to determine column count
    var firstDataRow = this.tableNode.querySelector('tbody tr');
    if (!firstDataRow) return 0;
    
    // Find which column in the data row aligns with this header
    var headerRow = headerCell.parentElement;
    var headerCellsInRow = headerRow.querySelectorAll('th, td');
    
    var colSpanOffset = 0;
    for (var i = 0; i < headerCellsInRow.length; i++) {
      if (headerCellsInRow[i] === headerCell) {
        return colSpanOffset;
      }
      // Account for colspan in previous header cells
      var colspan = parseInt(headerCellsInRow[i].getAttribute('colspan'));
      if (!isNaN(colspan)) {
        colSpanOffset += colspan;
      } else {
        colSpanOffset += 1;
      }
    }
    
    return colSpanOffset;
  }

  parseNumber(str) {
    if (!str) return null;

    // Remove commas and trim whitespace
    var cleaned = str.replace(/,/g, '').trim();

    // Check if it's a valid number
    if (cleaned === '') return null;
    
    var num = Number(cleaned);
    if (isNaN(num)) return null;
    
    return num;
  }

  setColumnHeaderSort(columnIndex) {
    if (typeof columnIndex === 'string') {
      columnIndex = parseInt(columnIndex);
    }

    // Find the header element that corresponds to this column index
    var targetHeader = null;
    for (var i = 0; i < this.columnHeaders.length; i++) {
      if (this.columnHeaders[i].columnIndex === columnIndex) {
        targetHeader = this.columnHeaders[i].element;
        break;
      }
    }
    
    if (!targetHeader) return;

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i].element;
      var buttonNode = this.columnHeaders[i].button;
      
      if (ch === targetHeader) {
        var value = ch.getAttribute('aria-sort');
        if (value === 'descending') {
          ch.setAttribute('aria-sort', 'ascending');
          this.sortColumn(columnIndex, 'ascending');
        } else {
          ch.setAttribute('aria-sort', 'descending');
          this.sortColumn(columnIndex, 'descending');
        }
      } else {
        if (ch.hasAttribute('aria-sort') && buttonNode) {
          ch.removeAttribute('aria-sort');
        }
      }
    }
  }

  sortColumn(columnIndex, sortValue) {
    // Get the main tbody
    var tbodyNode = this.tableNode.querySelector('tbody');
    if (!tbodyNode) return;
    
    // Get all rows in the tbody
    var rows = Array.from(tbodyNode.querySelectorAll('tr'));
    
    if (rows.length === 0) return;
    
    var asc = (sortValue === 'ascending');
    var self = this;
    
    // Create array of objects with row and its value
    var rowsWithValues = rows.map(function(row, idx) {
      var cell = row.cells[columnIndex];
      var rawValue = cell ? cell.innerText.trim() : '';
      var numericValue = self.parseNumber(rawValue);
      var sortValue = numericValue !== null ? numericValue : rawValue;
      
      if (VERBOSE) {
        var mediaObject = row.cells[0] ? row.cells[0].innerText.trim() : '';
        if (mediaObject === 'andor-112') {
          console.log(`Row ${idx}: ${mediaObject}, weeks: ${row.cells[1].innerText.trim()}, value: ${rawValue}, parsed: ${numericValue}, sortValue: ${sortValue}`);
        }
      }
      
      return {
        row: row,
        originalIndex: idx,
        rawValue: rawValue,
        sortValue: sortValue,
        isNumeric: numericValue !== null,
        numericValue: numericValue
      };
    });
    
    // Sort the array
    rowsWithValues.sort(function(a, b) {
      var result = 0;
      
      if (a.isNumeric && b.isNumeric) {
        // Both are numbers
        result = a.numericValue - b.numericValue;
      } else if (!a.isNumeric && !b.isNumeric) {
        // Both are strings
        result = a.sortValue.localeCompare(b.sortValue);
      } else {
        // Mixed type - numbers come before strings
        if (a.isNumeric) result = -1;
        else result = 1;
      }
      
      if (VERBOSE) {
        console.log(`Comparing ${a.numericValue} (${a.isNumeric}) vs ${b.numericValue} (${b.isNumeric}) = ${result}`);
      }
      
      // Reverse for descending
      return asc ? result : -result;
    });
    
    if (VERBOSE) {
      console.log('Sorted values:');
      rowsWithValues.forEach(function(item, idx) {
        var mediaObject = item.row.cells[0] ? item.row.cells[0].innerText.trim() : '';
        console.log(`${idx}: ${mediaObject} - ${item.rawValue}`);
      });
    }
    
    // Reorder the DOM
    rowsWithValues.forEach(function(item) {
      tbodyNode.appendChild(item.row);
    });
  }

  /* EVENT HANDLERS */

  handleClick(event) {
    var tgt = event.currentTarget;
    var columnIndex = parseInt(tgt.getAttribute('data-column-index'));
    this.setColumnHeaderSort(columnIndex);
  }
}

// Initialize sortable table buttons
window.addEventListener('load', function () {
  var sortableTables = document.querySelectorAll('table.sortable');
  for (var i = 0; i < sortableTables.length; i++) {
    new SortableTable(sortableTables[i]);
  }
});
