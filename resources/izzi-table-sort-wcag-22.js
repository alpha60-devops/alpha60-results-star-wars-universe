/*
 *
 *   File:  izzi-table-sort-22.js
 *   Info:  Adds sorting to a HTML data table that implements ARIA Authoring Practices
 *   URL:   https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/
 *   Ver:   20260506:8
 *
 *   This content is derived from
 *   Sources licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

'use strict';

class SortableTable {
  constructor(tableNode) {
    this.tableNode = tableNode;

    // Get ALL header cells in the thead (including all rows)
    this.allHeaders = tableNode.querySelectorAll('thead th');

    // Find which header cells actually contain buttons (these are the sortable columns)
    this.columnHeaders = [];
    this.sortColumns = [];

    for (var i = 0; i < this.allHeaders.length; i++) {
      var ch = this.allHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (buttonNode) {
	// Store the actual DOM element and its logical column index
	this.columnHeaders.push({
	  element: ch,
	  button: buttonNode,
	  // Find the visual column position by looking at cellIndex or using getBoundingClientRect
	  // For tables with colspan, we need to calculate based on DOM structure
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
    // We'll use a simple approach: find the header's position in the header row
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
    var tbodyNode = this.tableNode.querySelector('tbody');
    var rows = Array.from(tbodyNode.rows);

    var asc = (sortValue === 'ascending');
    var self = this;

    rows.sort(function(a, b) {
      // Make sure the column index exists in the row
      if (columnIndex >= a.cells.length || columnIndex >= b.cells.length) {
	return 0;
      }

      // Get cell values as raw text
      var x = a.cells[columnIndex].innerText.trim();
      var y = b.cells[columnIndex].innerText.trim();

      // Try to parse as numbers (handles commas like "64,192,966")
      var xNum = self.parseNumber(x);
      var yNum = self.parseNumber(y);

      if (xNum !== null && yNum !== null) {
	// Both are numbers - sort numerically
	return asc ? xNum - yNum : yNum - xNum;
      } else {
	// At least one is text - sort as strings
	return asc ? x.localeCompare(y) : y.localeCompare(x);
      }
    });

    // Re-append sorted rows
    rows.forEach(function(row) {
      tbodyNode.appendChild(row);
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
