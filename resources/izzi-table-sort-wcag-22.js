/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:  sortable-table.js
 *   Desc:  Adds sorting to a HTML data table that implements ARIA Authoring Practices
 *   URL:   https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/
 *   ver:   20260506:7
 */

'use strict';

class SortableTable {
  constructor(tableNode) {
    this.tableNode = tableNode;

    this.columnHeaders = tableNode.querySelectorAll('thead th');

    this.sortColumns = [];

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (buttonNode) {
        this.sortColumns.push(i);
        buttonNode.setAttribute('data-column-index', i);
        buttonNode.addEventListener('click', this.handleClick.bind(this));
      }
    }

    this.optionCheckbox = document.querySelector(
      'input[type="checkbox"][value="show-unsorted-icon"]'
    );

    if (this.optionCheckbox) {
      this.optionCheckbox.addEventListener(
        'change',
        this.handleOptionChange.bind(this)
      );
      if (this.optionCheckbox.checked) {
        this.tableNode.classList.add('show-unsorted-icon');
      }
    }
  }

  // Clean the text by removing any non-numeric characters that aren't needed for sorting
  cleanTextForComparison(rawText) {
    if (!rawText) return '';
    
    // Remove arrow characters (▲, ▼, ↓, ↑, ⇧, ⇩) and extra whitespace
    // Also remove any sort indicator icons that might be present as text
    var cleaned = rawText
      .replace(/[▲▼↓↑⇧⇩]/g, '')  // Remove sort arrow characters
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();
    
    return cleaned;
  }

  parseNumber(str) {
    if (!str) return null;

    // First clean the string of any UI artifacts (arrows, etc.)
    var cleaned = this.cleanTextForComparison(str);
    
    // Remove commas (thousand separators) and trim
    cleaned = cleaned.replace(/,/g, '').trim();

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

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var ch = this.columnHeaders[i];
      var buttonNode = ch.querySelector('button');
      if (i === columnIndex) {
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
      // Get raw cell text (may include arrows if they're in the DOM)
      var rawX = a.cells[columnIndex].innerText;
      var rawY = b.cells[columnIndex].innerText;
      
      // Clean the text for proper comparison
      var x = self.cleanTextForComparison(rawX);
      var y = self.cleanTextForComparison(rawY);

      // Try to parse as numbers
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
    this.setColumnHeaderSort(tgt.getAttribute('data-column-index'));
  }

  handleOptionChange(event) {
    var tgt = event.currentTarget;

    if (tgt.checked) {
      this.tableNode.classList.add('show-unsorted-icon');
    } else {
      this.tableNode.classList.remove('show-unsorted-icon');
    }
  }
}

// Initialize sortable table buttons
window.addEventListener('load', function () {
  var sortableTables = document.querySelectorAll('table.sortable');
  for (var i = 0; i < sortableTables.length; i++) {
    new SortableTable(sortableTables[i]);
  }
});
