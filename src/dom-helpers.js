define("dom-helpers",
  ["exports"],
  function(__exports__) {
    "use strict";
    var EDITOR_CLASS, INVISIBLE_CHAR, KEY_CODES, activateRange, addClass, createElementsFromString, deleteRange, getClosestElementWithClass, getCurrentCaretContainer, getCurrentRange, getNonEditableOnLeft, getNonEditableOnRight, getNonEditableParent, getNonEmptySideNode, hasClass, insertCaretContainer, insertElementAtRange, insertHTMLAtRange, isEmpty, isNonEditable, isObjEmpty, removeCaretContainer, removeCaretContainers, removeElementKeepingChildren, selectElement;

    INVISIBLE_CHAR = '\uFEFF';

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
        return activateRange(range);
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
      var selection = new scribe.api.Selection();
      selection.selection.removeAllRanges();
      selection.selection.addRange(range);
      return range
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
      return getClosestElementWithClass(node, 'non-editable');
    };

    insertCaretContainer = function(target, before) {
      var caretContainer;
      caretContainer = createElementsFromString('<caret class="non-editable-caret">' + INVISIBLE_CHAR + '</caret>')[0];
      if (before) {
        target.parentElement.insertBefore(caretContainer, target);
      } else {
        target.parentElement.insertBefore(caretContainer, target.nextSibling);
      }
      return caretContainer;
    };

    getCurrentCaretContainer = function(node) {
      while (node) {
        if (node.classList && node.classList.contains('non-editable-caret')) {
          return node;
        }
        node = node.parentNode;
      }
    };

    removeCaretContainer = function(caretContainer) {
      var child, contents, savedSelection;
      if (caretContainer.parentElement.innerHTML === '<caret class="non-editable-caret">' + INVISIBLE_CHAR + '</caret>') {
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
      currentCaretContainer = getCurrentCaretContainer(range.startContainer);
      while ((caretContainers = scribe.el.querySelectorAll('.non-editable-caret'))) {
        caretContainer = caretContainers[0];
        if (caretContainers.length === 0 || caretContainer === currentCaretContainer && caretContainers.length === 1) {
          return;
        }
        if (caretContainer.parentElement.innerHTML === '<caret class="non-editable-caret">' + INVISIBLE_CHAR + '</caret>') {
          $(caretContainer.parentElement).html('<br>');
          continue;
        }
        child = caretContainer.childNodes[0];
        if (child && ((_ref = child.nodeValue) != null ? _ref.charAt(0) : void 0) === INVISIBLE_CHAR) {
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
      } else if (currentRange.startOffset === 1 && isNonEditable(leftNode) && currentRange.startContainer.textContent.charAt(0) === INVISIBLE_CHAR) {
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
      } else if (currentRange.endOffset === endContainer.length - 1 && endContainer.nodeValue.charAt(endContainer.nodeValue.length - 1) === INVISIBLE_CHAR && isNonEditable(rightNode)) {
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
    __exports__.activateRange = activateRange;
  });