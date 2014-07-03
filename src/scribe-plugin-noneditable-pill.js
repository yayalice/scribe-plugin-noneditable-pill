define([
  'dom_helpers'
], function(
  DomHelpers
) {

  /**
   * Adds a command for non-editable blocks of text.
   */

  'use strict';

  return function() {

    var getCurrentRange = function() {
      var selection;
      selection = new scribe.api.Selection();
      return selection.range;
    };
    var moveSelection = function() {
      var caretContainer, collapse, currentRange, element, hasSideContent, isCollapsed, nonEditableEnd, nonEditableStart, parentCaret, selection;
      hasSideContent = function(range, element, left) {
        var container, len, offset;
        container = range.startContainer;
        offset = range.startOffset;
        if (container.nodeType === Node.TEXT_NODE) {
          len = container.nodeValue.length;
          if ((offset > 0 && offset < len) || (left ? offset === len : offset === 0)) {
            return;
          }
        }
        return element;
      };
      DomHelpers.removeCaretContainers(scribe);
      selection = new scribe.api.Selection();
      if (!(currentRange = selection.range)) {
        return;
      }
      isCollapsed = currentRange.collapsed;
      nonEditableStart = DomHelpers.getNonEditableParent(currentRange.startContainer);
      nonEditableEnd = DomHelpers.getNonEditableParent(currentRange.endContainer);
      parentCaret = DomHelpers.getCurrentCaretContainer(currentRange);
      if (nonEditableStart || nonEditableEnd) {
        if (currentRange.collapsed) {
          if ((element = hasSideContent(currentRange, nonEditableStart || nonEditableEnd, true))) {
            caretContainer = DomHelpers.insertCaretContainer(element, true);
          } else if ((element = hasSideContent(currentRange, nonEditableStart || nonEditableEnd, false))) {
            caretContainer = DomHelpers.insertCaretContainer(element, false);
          }
          if (caretContainer) {
            collapse = caretContainer.previousElementSibling === null ? "beginning" : "end";
            DomHelpers.selectElement(caretContainer, collapse);
            return;
          }
        }
        if (nonEditableStart) {
          currentRange.setStartBefore(nonEditableStart);
        }
        if (nonEditableEnd) {
          currentRange.setEndAfter(nonEditableEnd);
        }
        return DomHelpers.activateRange(currentRange);
      } else if ((parentCaret != null ? parentCaret.length : void 0) > 0 && !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, true)) && !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, false))) {
        return this._removeCaretContainer(parentCaret[0]);
      }
    };

    return function(scribe) {
      var noneditablePillCommand;
      noneditablePillCommand = new scribe.api.SimpleCommand("noneditablePill", "NONEDITABLE");
      noneditablePillCommand.execute = function() {
        return scribe.transactionManager.run(function() {
          var noneditablePillElement, range, selectedHtmlDocumentFragment, selection;
          selection = new scribe.api.Selection();
          range = selection.range;
          if (range.collapsed) {
            return;
          }
          selectedHtmlDocumentFragment = range.extractContents();
          noneditablePillElement = document.createElement("nep");
          noneditablePillElement.appendChild(selectedHtmlDocumentFragment);
          DomHelpers.addClass(noneditablePillElement, 'non-editable');
          range.insertNode(noneditablePillElement);
          range.selectNode(noneditablePillElement);
          selection.selection.removeAllRanges();
          return selection.selection.addRange(range);
        });
      };
      noneditablePillCommand.queryEnabled = function() {
        return true;
      };
      noneditablePillCommand.queryState = function() {
        var selection;
        selection = new scribe.api.Selection();
        return !!selection.getContaining((function(element) {
          return element.nodeName === "NEP" && DomHelpers.hasClass(element, 'non-editable');
        }).bind(this));
      };
      scribe.commands.noneditablePill = noneditablePillCommand;
      scribe.el.addEventListener("keydown", function(event) {
        var caret, endElement, handleLeftNodeCase, handleRightNodeCase, insertSelect, isCharacter, isCollapsed, keyCode, leftNode, leftNodeDeep, nonEditableParent, range, rightNode, rightNodeDeep, startElement;
        handleLeftNodeCase = (function(_this) {
          return function() {
            if (leftNode) {
              if (keyCode === DomHelpers.KEY_CODES.LEFT && isCollapsed) {
                DomHelpers.selectElement(leftNode, "none");
                return event.preventDefault();
              } else if (keyCode === DomHelpers.KEY_CODES.BACKSPACE) {
                return DomHelpers.selectElement(leftNode, "none");
              }
            } else if (leftNodeDeep && keyCode === DomHelpers.KEY_CODES.BACKSPACE) {
              return DomHelpers.insertCaretContainer(leftNodeDeep, false);
            }
          };
        })(this);
        handleRightNodeCase = (function(_this) {
          return function() {
            if (rightNode) {
              if (keyCode === DomHelpers.KEY_CODES.DELETE) {
                return DomHelpers.selectElement(rightNode, "none");
              } else if (keyCode === DomHelpers.KEY_CODES.RIGHT && isCollapsed) {
                DomHelpers.selectElement(rightNode, "none");
                return event.preventDefault();
              }
            } else if (rightNodeDeep && keyCode === DomHelpers.KEY_CODES.DELETE && !rightNode) {
              return DomHelpers.insertCaretContainer(rightNodeDeep, true);
            }
          };
        })(this);
        isCharacter = function(keyCode) {
          return keyCode >= 48 && keyCode <= 90 || keyCode >= 96 && keyCode <= 111 || keyCode >= 186 && keyCode <= 222;
        };
        keyCode = event.keyCode;
        if (this.showConfigPopover) {
          insertSelect = this.getInsertSelectController();
          if (keyCode === this.KEY_CODES.DOWN) {
            return insertSelect.downArrowPressed(event);
          } else if (keyCode === this.KEY_CODES.UP) {
            return insertSelect.upArrowPressed(event);
          } else if ((keyCode === this.KEY_CODES.ENTER || keyCode === this.KEY_CODES.TAB) && insertSelect.get('filteredContent').length > 0) {
            return insertSelect.enterPressed(event);
          } else if (keyCode === this.KEY_CODES.ESCAPE) {
            return insertSelect.escapePressed(event);
          }
        }
        moveSelection(scribe);
        range = getCurrentRange();
        isCollapsed = range.collapsed;
        startElement = range.startContainer;
        endElement = range.endContainer;
        nonEditableParent = DomHelpers.isNonEditable(startElement) || DomHelpers.isNonEditable(endElement);
        leftNode = DomHelpers.getNonEditableOnLeft(scribe);
        rightNode = DomHelpers.getNonEditableOnRight(scribe);
        leftNodeDeep = DomHelpers.getNonEditableOnLeft(scribe, true);
        rightNodeDeep = DomHelpers.getNonEditableOnRight(scribe, true);
        if ((event.metaKey || event.ctrlKey) && (keyCode !== DomHelpers.KEY_CODES.DELETE && keyCode !== DomHelpers.KEY_CODES.BACKSPACE)) {
          return;
        }
        if (isCharacter(keyCode) || keyCode === DomHelpers.KEY_CODES.BACKSPACE || keyCode === DomHelpers.KEY_CODES.DELETE) {
          if ((leftNode || rightNode) && !isCollapsed) {
            caret = DomHelpers.insertCaretContainer(leftNode || rightNode, leftNode ? false : true);
            DomHelpers.deleteRange(range);
            DomHelpers.selectElement(caret);
          } else if (nonEditableParent) {
            DomHelpers.deleteRange(range);
          }
          if ((keyCode === DomHelpers.KEY_CODES.BACKSPACE || keyCode === DomHelpers.KEY_CODES.DELETE) && !isCollapsed && nonEditableParent) {
            return event.preventDefault();
          }
        }
        handleLeftNodeCase();
        return handleRightNodeCase();
      });
    };
  };

});
