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
    var KEY_CODES, getCurrentRange, moveSelection, moveSelectionToTarget;

    KEY_CODES = {
      BACKSPACE: 8,
      DELETE: 46,
      DOWN: 40,
      ENTER: 13,
      LEFT: 37,
      RIGHT: 39,
      SPACEBAR: 32,
      TAB: 9,
      UP: 38,
      ESCAPE: 27
    };

    getCurrentRange = function() {
      var selection;
      selection = new scribe.api.Selection();
      return selection.range;
    };

    moveSelectionToTarget = function(target) {
      var nonEditableTarget = DomHelpers.getNonEditableParent(target);
      if (nonEditableTarget){
        // Select the entire target
        var newRange = document.createRange();
        newRange.setStartBefore(nonEditableTarget);
        newRange.setEndAfter(nonEditableTarget);

        return DomHelpers.activateRange(newRange);
      }
      return moveSelection();
    };

    moveSelection = function() {
      var caretContainer, collapse, currentRange, element, hasSideContent, nonEditableEnd, nonEditableStart, parentCaret, selection;
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
        return DomHelpers.removeCaretContainer(parentCaret[0]);
      }
    };

    function cleanUpBrsFromCaret(parentNode) {
      // Instead of TreeWalker, which gets confused when the BR is added to the dom,
      // we recursively traverse the tree to look for an empty node that can have childNodes

      var node = parentNode.firstElementChild;

      while (node) {
        if (node.classList.contains('non-editable-caret')) {
          var child, _i, _len;
          for (_i = 0, _len = node.children.length; _i < _len; _i++) {
            child = node.children[_i];
            if (child.nodeName === "BR") {
              node.removeChild(child);
            }
          }
        } else {
          cleanUpBrsFromCaret(node);
        }
        node = node.nextElementSibling;
      }
    }

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
          noneditablePillElement = document.createElement("pill");
          noneditablePillElement.appendChild(selectedHtmlDocumentFragment);
          DomHelpers.addClass(noneditablePillElement, 'non-editable');
          range.insertNode(noneditablePillElement);
          range.selectNode(noneditablePillElement);
          // console.log('modifying range at execute ' + range.toString());
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
          return element.nodeName === "PILL" && DomHelpers.hasClass(element, 'non-editable');
        }).bind(this));
      };

      scribe.commands.noneditablePill = noneditablePillCommand;

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        cleanUpBrsFromCaret(bin);
        return bin.innerHTML;
      });

      scribe.el.addEventListener("mouseup", function(event){
        moveSelectionToTarget(event.target);
      });
      scribe.el.addEventListener("keyup", function(event){
        moveSelection();
      });
      scribe.el.addEventListener("keydown", function(event) {
        var caret, endElement, handleLeftNodeCase, handleRightNodeCase, insertSelect, isCharacter, isCollapsed, keyCode, leftNode, leftNodeDeep, nonEditableParent, range, rightNode, rightNodeDeep, startElement;
        handleLeftNodeCase = (function(_this) {
          return function() {
            if (leftNode) {
              if (keyCode === KEY_CODES.LEFT && isCollapsed) {
                DomHelpers.selectElement(leftNode, "none");
                DomHelpers.removeCaretContainers(scribe);
                return event.preventDefault();
              } else if (keyCode === KEY_CODES.BACKSPACE) {
                DomHelpers.selectElement(leftNode, "none");
                return DomHelpers.removeCaretContainers(scribe);
              }
            } else if (leftNodeDeep && keyCode === KEY_CODES.BACKSPACE) {
              return DomHelpers.insertCaretContainer(leftNodeDeep, false);
            }
          };
        })(this);
        handleRightNodeCase = (function(_this) {
          return function() {
            if (rightNode) {
              if (keyCode === KEY_CODES.DELETE) {
                DomHelpers.selectElement(rightNode, "none");
                return DomHelpers.removeCaretContainers(scribe);
              } else if (keyCode === KEY_CODES.RIGHT && isCollapsed) {
                DomHelpers.selectElement(rightNode, "none");
                DomHelpers.removeCaretContainers(scribe);
                return event.preventDefault();
              }
            } else if (rightNodeDeep && keyCode === KEY_CODES.DELETE && !rightNode) {
              return DomHelpers.insertCaretContainer(rightNodeDeep, true);
            }
          };
        })(this);
        isCharacter = function(keyCode) {
          return keyCode >= 48 && keyCode <= 90 || keyCode >= 96 && keyCode <= 111 || keyCode >= 186 && keyCode <= 222;
        };
        keyCode = event.keyCode;
        moveSelection();
        range = getCurrentRange();
        isCollapsed = range.collapsed;
        startElement = range.startContainer;
        endElement = range.endContainer;
        nonEditableParent = DomHelpers.isNonEditable(startElement) || DomHelpers.isNonEditable(endElement);
        leftNode = DomHelpers.getNonEditableOnLeft(scribe);
        rightNode = DomHelpers.getNonEditableOnRight(scribe);
        leftNodeDeep = DomHelpers.getNonEditableOnLeft(scribe, true);
        rightNodeDeep = DomHelpers.getNonEditableOnRight(scribe, true);
        if ((event.metaKey || event.ctrlKey) && (keyCode !== KEY_CODES.DELETE && keyCode !== KEY_CODES.BACKSPACE)) {
          return;
        }
        if (isCharacter(keyCode) || keyCode === KEY_CODES.BACKSPACE || keyCode === KEY_CODES.DELETE) {
          if ((leftNode || rightNode) && !isCollapsed) {
            caret = DomHelpers.insertCaretContainer(leftNode || rightNode, leftNode ? false : true);
            DomHelpers.deleteRange(range);
            DomHelpers.selectElement(caret);
          } else if (nonEditableParent) {
            DomHelpers.deleteRange(range);
          }
          if ((keyCode === KEY_CODES.BACKSPACE || keyCode === KEY_CODES.DELETE) && !isCollapsed && nonEditableParent) {
            return event.preventDefault();
          }
        }
        handleLeftNodeCase();
        return handleRightNodeCase();
      });
    };
  };

});
