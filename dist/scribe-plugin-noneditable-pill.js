define("dom_helpers", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var EDITOR_CLASS, INVISIBLE_CHAR, KEY_CODES, activateRange, addClass, createElementsFromString, deleteRange, getClosestElementWithClass, getCurrentCaretContainer, getCurrentRange, getNonEditableOnLeft, getNonEditableOnRight, getNonEditableParent, getNonEmptySideNode, hasClass, insertCaretContainer, insertElementAtRange, insertHTMLAtRange, isEmpty, isNonEditable, isObjEmpty, removeCaretContainer, removeCaretContainers, removeElementKeepingChildren, selectElement;

    INVISIBLE_CHAR = '\uFEFF';

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

    EDITOR_CLASS = 'text-editor';

    removeElementKeepingChildren = function(node) {
      while (node.firstChild) {
        node.parentNode.insertBefore(node.firstChild, node);
      }
      return node.parentNode.removeChild(node);
    };

    isObjEmpty = function(obj) {
      return obj === null || obj === undefined || (obj.length === 0 && typeof obj !== "function") || (typeof obj === "object" && obj.get("length") === 0);
    };

    getCurrentRange = function(scribe) {
      var selection;
      selection = new scribe.api.Selection();
      return selection.range;
    };

    addClass = function(element, cls) {
      var currentClass;
      currentClass = element.className;
      if (currentClass.length > 0) {
        currentClass = currentClass + " ";
      }
      return element.className = currentClass + 'non-editable';
    };

    hasClass = function(element, cls) {
      if (element.nodeType === Node.ELEMENT_NODE) {
        return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
      }
      return false;
    };

    selectElement = function(element, collapseMode) {
      var collapseBoolean, range;
      if (collapseMode == null) {
        collapseMode = "end";
      }
      collapseBoolean = collapseMode === "beginning" ? true : false;
      if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(element);
        if (collapseMode !== "none") {
          range.collapse(collapseBoolean);
        }
        return this.activateRange(range);
      } else if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        if (collapseMode !== "none") {
          range.collapse(collapseBoolean);
        }
        return range.select();
      }
    };

    activateRange = function(range) {
      var selection;
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return range;
    };

    isEmpty = function(element) {
      var _ref;
      return element.children.length === 0 && element.childNodes.length <= 1 && ((_ref = element.childNodes[0]) != null ? _ref.length : void 0) === 0;
    };

    deleteRange = function(range, shouldDeleteContainer) {
      var endParent, startParent;
      if (shouldDeleteContainer == null) {
        shouldDeleteContainer = true;
      }
      startParent = range.startContainer.parentNode;
      endParent = range.endContainer.parentNode;
      range.deleteContents();
      if (isEmpty(startParent) && shouldDeleteContainer) {
        $(startParent).remove();
      }
      if (isEmpty(endParent) && shouldDeleteContainer) {
        return $(endParent).remove();
      }
    };

    insertHTMLAtRange = function(range, html) {
      return insertElementAtRange(range, createElementsFromString(html)[0]);
    };

    insertElementAtRange = function(range, node) {
      deleteRange(range, false);
      range.insertNode(node);
      return node;
    };

    selectElement = function(element, collapseMode) {
      var range;
      if (collapseMode == null) {
        collapseMode = "end";
      }
      if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(element);
        if (collapseMode !== "none") {
          range.collapse(collapseMode === "beginning" ? true : false);
        }
        return activateRange(range);
      }
    };

    createElementsFromString = function(string) {
      var div;
      div = document.createElement('div');
      div.innerHTML = string;
      return div.childNodes;
    };

    getClosestElementWithClass = function(el, cls) {
      while (el && !hasClass(el, cls)) {
        el = el.parentNode;
      }
      return el;
    };

    getNonEditableParent = function(node) {
      while (node) {
        if (hasClass(node, 'non-editable')) {
          return node;
        }
        node = node.parentElement;
      }
    };

    isNonEditable = function(node) {
      return !getClosestElementWithClass(node, 'non-editable');
    };

    insertCaretContainer = function(target, before) {
      var caretContainer;
      caretContainer = createElementsFromString('<span class="non-editable-caret">' + INVISIBLE_CHAR + '</span>')[0];
      if (before) {
        target.parentElement.insertBefore(caretContainer, target);
      } else {
        target.parentElement.insertBefore(caretContainer, target.nextSibling);
      }
      return caretContainer;
    };

    getCurrentCaretContainer = function(range) {
      var containingElement;
      containingElement = range != null ? range.startContainer.parentElement : void 0;
      return getClosestElementWithClass(containingElement, 'non-editable-caret');
    };

    removeCaretContainer = function(caretContainer) {
      var child, contents, savedSelection;
      if (caretContainer.parentElement.innerHTML === '<span class="non-editable-caret">' + INVISIBLE_CHAR + '</span>') {
        return $(caretContainer.parentElement).html('<br>');
      }
      if ((child = caretContainer.childNodes[0]) && child.nodeValue.charAt(0) === INVISIBLE_CHAR) {
        child = child.deleteData(0, 1);
      }
      savedSelection = rangy.saveSelection(this.$('iframe.text-editor-frame')[0].contentWindow);
      contents = $(caretContainer).contents();
      $(caretContainer).replaceWith(contents);
      return rangy.restoreSelection(savedSelection);
    };

    removeCaretContainers = function(scribe) {
      var caretContainer, caretContainers, child, currentCaretContainer, range, selection, _ref;
      selection = new scribe.api.Selection();
      range = selection.range;
      currentCaretContainer = getCurrentCaretContainer(range);
      while ((caretContainers = scribe.el.querySelectorAll('.non-editable-caret'))) {
        caretContainer = caretContainers[0];
        if (caretContainers.length === 0 || caretContainer === currentCaretContainer && caretContainers.length === 1) {
          return;
        }
        if (caretContainer.parentElement.innerHTML === '<span class="non-editable-caret">' + this.INVISIBLE_CHAR + '</span>') {
          $(caretContainer.parentElement).html('<br>');
          continue;
        }
        child = caretContainer.childNodes[0];
        if (child && ((_ref = child.nodeValue) != null ? _ref.charAt(0) : void 0) === this.INVISIBLE_CHAR) {
          child = child.deleteData(0, 1);
        }
        removeElementKeepingChildren(caretContainer);
      }
    };

    getNonEditableOnLeft = function(scribe, deep) {
      var currentRange, leftNode, _ref;
      if (deep == null) {
        deep = false;
      }
      if (!((currentRange = getCurrentRange(scribe)) && (leftNode = getNonEmptySideNode(currentRange, true, deep)))) {
        return;
      }
      if (currentRange.startOffset === 0 && isNonEditable(leftNode)) {
        return leftNode;
      } else if (currentRange.startOffset === 1 && isNonEditable(leftNode) && ((_ref = currentRange.startContainer.nodeValue) != null ? _ref.charAt(0) : void 0) === this.INVISIBLE_CHAR) {
        return leftNode;
      }
    };

    getNonEditableOnRight = function(scribe, deep) {
      var currentRange, endContainer, rightNode;
      if (deep == null) {
        deep = false;
      }
      if (!((currentRange = getCurrentRange(scribe)) && (rightNode = getNonEmptySideNode(currentRange, false, deep)))) {
        return;
      }
      endContainer = currentRange.endContainer;
      if (currentRange.endOffset === endContainer.length && isNonEditable(rightNode)) {
        return rightNode;
      } else if (currentRange.endOffset === endContainer.length - 1 && endContainer.nodeValue.charAt(endContainer.nodeValue.length - 1) === this.INVISIBLE_CHAR && isNonEditable(rightNode)) {
        return rightNode;
      }
    };

    getNonEmptySideNode = function(range, left, deep) {
      var index, node, nodeIsEmpty, sideNode, _ref, _ref1;
      if (left == null) {
        left = true;
      }
      nodeIsEmpty = function(node) {
        var _ref;
        return (node != null ? (_ref = node.nodeValue) != null ? _ref.trim().length : void 0 : void 0) === 0;
      };
      node = range[left ? 'startContainer' : 'endContainer'];
      while (((sideNode = node[left ? 'previousSibling' : 'nextSibling']) === null || nodeIsEmpty(sideNode)) && !((_ref = node.classList) != null ? _ref.contains(EDITOR_CLASS) : void 0)) {
        if (nodeIsEmpty(sideNode)) {
          node = node[left ? 'previousSibling' : 'nextSibling'];
        } else {
          node = node.parentNode;
        }
      }
      if (deep) {
        while ((sideNode != null ? (_ref1 = sideNode.children) != null ? _ref1.length : void 0 : void 0) > 0) {
          index = left ? sideNode.children.length - 1 : 0;
          sideNode = sideNode.children[index];
        }
      }
      return sideNode;
    };

    __exports__.KEY_CODES = KEY_CODES;
    __exports__.addClass = addClass;
    __exports__.deleteRange = deleteRange;
    __exports__.selectElement = selectElement;
    __exports__.insertCaretContainer = insertCaretContainer;
    __exports__.hasClass = hasClass;
    __exports__.getCurrentCaretContainer = getCurrentCaretContainer;
    __exports__.getNonEditableParent = getNonEditableParent;
    __exports__.getNonEditableOnLeft = getNonEditableOnLeft;
    __exports__.getNonEditableOnRight = getNonEditableOnRight;
    __exports__.getNonEditableParent = getNonEditableParent;
    __exports__.getNonEmptySideNode = getNonEmptySideNode;
    __exports__.isNonEditable = isNonEditable;
    __exports__.removeCaretContainers = removeCaretContainers;
  });
define("scribe-plugin-noneditable-pill", 
  ["dom_helpers","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var DomHelpers = __dependency1__;
    var main;

    main = function() {
      return function(scribe) {
        var getCurrentRange, moveSelection, noneditablePillCommand;
        getCurrentRange = function() {
          var selection;
          selection = new scribe.api.Selection();
          return selection.range;
        };
        moveSelection = function() {
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
            return activateRange(currentRange);
          } else if ((parentCaret != null ? parentCaret.length : void 0) > 0 && !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, true)) && !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, false))) {
            return this._removeCaretContainer(parentCaret[0]);
          }
        };
        noneditablePillCommand = new scribe.api.SimpleCommand("noneditablePill", "SPAN");
        noneditablePillCommand.execute = function() {
          return scribe.transactionManager.run(function() {
            var noneditablePillElement, range, selectedHtmlDocumentFragment, selection;
            selection = new scribe.api.Selection();
            range = selection.range;
            if (range.collapsed) {
              return;
            }
            selectedHtmlDocumentFragment = range.extractContents();
            noneditablePillElement = document.createElement("span");
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
            return element.nodeName === "SPAN" && DomHelpers.hasClass(element, 'non-editable');
          }).bind(this));
        };
        scribe.commands.noneditablePill = noneditablePillCommand;
        return scribe.el.addEventListener("keydown", function(event) {
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

    __exports__["default"] = main;
  });