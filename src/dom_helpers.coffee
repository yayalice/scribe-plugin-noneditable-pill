############################################################################
# CONSTANTS
############################################################################
INVISIBLE_CHAR = '\uFEFF'
KEY_CODES =
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
EDITOR_CLASS = 'text-editor'

############################################################################
# Helpers
############################################################################

removeElementKeepingChildren = (node) ->
  while node.firstChild
    node.parentNode.insertBefore node.firstChild, node
  node.parentNode.removeChild node

isObjEmpty = (obj) ->
  obj is null or
  obj is `undefined` or
  (obj.length is 0 and typeof obj isnt "function") or
  (typeof obj is "object" and obj.get("length") is 0)

getCurrentRange = (scribe) ->
  selection = new scribe.api.Selection()
  selection.range

addClass = (element, cls) ->
  currentClass = element.className
  if currentClass.length > 0
    currentClass = currentClass + " "
  element.className = currentClass + 'non-editable'

hasClass = (element, cls) ->
  if element.nodeType is Node.ELEMENT_NODE
    return (" " + element.className + " ").indexOf(" " + cls + " ") > -1
  return false

selectElement = (element, collapseMode="end") ->
  # How to collapse the range, if at all.  False means collapse to end
  collapseBoolean = if collapseMode == "beginning" then true else false
  # http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
  if(document.createRange)  # Firefox, Chrome, Opera, Safari, IE 9+
    range = document.createRange()
    # Select the entire contents of the element with the range
    range.selectNodeContents(element)
    if collapseMode != "none"
      # collapse the range to the end point. false means collapse to end rather than the start
      range.collapse(collapseBoolean)
    @activateRange(range)
  else if document.selection
    # Create a range (a range is a like the selection but invisible)
    range = document.body.createTextRange()
    # Select the entire contents of the element with the range
    range.moveToElementText element
    if collapseMode != "none"
      range.collapse collapseBoolean
    # Select the range (make it the visible selection)
    range.select()

activateRange = (range) ->
  selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  range

# Returns true if the element has no child elements and has either 0 child nodes or one child
# node with nothing in it. Different from jQuery's .is(':empty'), which thinks some empty nodes
# are not empty
isEmpty = (element) ->
  element.children.length == 0 &&
   element.childNodes.length <= 1 &&
   element.childNodes[0]?.length == 0

# Wrapper around range.deleteContents that also deletes empty containers in the range
deleteRange = (range, shouldDeleteContainer=true) ->
  startParent = range.startContainer.parentNode
  endParent = range.endContainer.parentNode
  range.deleteContents()
  if isEmpty(startParent) and shouldDeleteContainer
    $(startParent).remove()
  if isEmpty(endParent) and shouldDeleteContainer
    $(endParent).remove()

# Converts html string to node then inserts at range
insertHTMLAtRange = (range, html) ->
  insertElementAtRange(range, createElementsFromString(html)[0])

# Inserts node at range
insertElementAtRange = (range, node) ->
  deleteRange(range, false)
  range.insertNode(node)
  node

selectElement = (element, collapseMode="end") ->
  # http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
  if(document.createRange)  # Firefox, Chrome, Opera, Safari, IE 9+
    range = document.createRange()
    # Select the entire contents of the element with the range
    range.selectNodeContents(element)
    if collapseMode != "none"
      # collapse the range to the end point. false means collapse to end rather than the start
      range.collapse(if collapseMode == "beginning" then true else false)
    activateRange(range)

createElementsFromString = (string) ->
  div = document.createElement('div')
  div.innerHTML = string
  div.childNodes

getClosestElementWithClass = (el, cls) ->
  el = el.parentNode while el and not hasClass(el, cls)
  return el

getNonEditableParent = (node) ->
    while node
      if hasClass(node, 'non-editable')
        return node
      node = node.parentElement

isNonEditable = (node) ->
  !getClosestElementWithClass(node, 'non-editable')

# Inserts a "caret container" next to the target node
# Used to allow users to type next to a non-editable element (i.e. the
# noneditable pill). Otherwise when the user tries to type text preceding
# or following a non-editable element, the text will appear in the
# noneditable element. The caret container gives us a place to temporarily
# put the cursor.
insertCaretContainer = (target, before) ->
  caretContainer = createElementsFromString('<span class="non-editable-caret">' + INVISIBLE_CHAR + '</span>')[0]
  if (before)
    target.parentElement.insertBefore(caretContainer, target)
  else
    target.parentElement.insertBefore(caretContainer, target.nextSibling)
  return caretContainer

getCurrentCaretContainer = (range) ->
  containingElement = range?.startContainer.parentElement
  getClosestElementWithClass(containingElement, 'non-editable-caret')

removeCaretContainer = (caretContainer) ->
  if caretContainer.parentElement.innerHTML == '<span class="non-editable-caret">' + INVISIBLE_CHAR + '</span>'
    return $(caretContainer.parentElement).html('<br>')  # chrome specific
  if (child = caretContainer.childNodes[0]) && child.nodeValue.charAt(0) == INVISIBLE_CHAR
    child = child.deleteData(0, 1)
  savedSelection = rangy.saveSelection(@$('iframe.text-editor-frame')[0].contentWindow)
  contents = $(caretContainer).contents()
  $(caretContainer).replaceWith(contents)
  rangy.restoreSelection(savedSelection)

removeCaretContainers = (scribe) ->
  selection = new scribe.api.Selection()
  range = selection.range
  currentCaretContainer = getCurrentCaretContainer(range)
  while (caretContainers = scribe.el.querySelectorAll('.non-editable-caret'))
    caretContainer = caretContainers[0]
    if caretContainers.length is 0 or caretContainer is currentCaretContainer and caretContainers.length is 1
      return
    if caretContainer.parentElement.innerHTML == '<span class="non-editable-caret">' + @INVISIBLE_CHAR + '</span>'
      $(caretContainer.parentElement).html('<br>')  # chrome specific
      continue
    child = caretContainer.childNodes[0]
    if child && child.nodeValue?.charAt(0) == @INVISIBLE_CHAR
      child = child.deleteData(0, 1)
    # via http://stackoverflow.com/questions/170004/how-to-remove-only-the-parent-element-and-not-its-child-elements-in-javascript
    removeElementKeepingChildren(caretContainer)

# Get the non editable node, if any, to the left of the current range
# Node: https://developer.mozilla.org/en-US/docs/Web/API/Node
# Range: https://developer.mozilla.org/en-US/docs/Web/API/range
getNonEditableOnLeft = (scribe, deep=false) ->
  return unless (currentRange = getCurrentRange(scribe)) and leftNode = getNonEmptySideNode(currentRange, true, deep)

  if currentRange.startOffset == 0 && isNonEditable(leftNode)
    return leftNode
  else if currentRange.startOffset == 1 && isNonEditable(leftNode) and
  currentRange.startContainer.nodeValue?.charAt(0) == @INVISIBLE_CHAR
    # i.e. we are in a non-editable caret container
    return leftNode

# Get the non editable node, if any, to the right of the current range
# Node: https://developer.mozilla.org/en-US/docs/Web/API/Node
# Range: https://developer.mozilla.org/en-US/docs/Web/API/range
getNonEditableOnRight = (scribe, deep=false) ->
  return unless (currentRange = getCurrentRange(scribe)) and rightNode = getNonEmptySideNode(currentRange, false, deep)

  endContainer = currentRange.endContainer
  if currentRange.endOffset == endContainer.length && isNonEditable(rightNode)
    return rightNode
  else if currentRange.endOffset == endContainer.length - 1 and
  endContainer.nodeValue.charAt(endContainer.nodeValue.length - 1) == @INVISIBLE_CHAR and
  isNonEditable(rightNode)
    return rightNode

# get the node that is beside the current range on either the left or the right. Empty nodes,
# or nodes containing only whitespace are ignored
getNonEmptySideNode = (range, left=true, deep) ->
  nodeIsEmpty = (node) ->
    return node?.nodeValue?.trim().length == 0
  node = range[if left then 'startContainer' else 'endContainer']
  while ((sideNode = node[if left then 'previousSibling' else 'nextSibling']) is null or
  nodeIsEmpty(sideNode)) and !node.classList?.contains(EDITOR_CLASS)  # not the editor div
    if nodeIsEmpty(sideNode)
      # Ignore this sideNode because it's empty. Go to the next/previous sibling
      node = node[if left then 'previousSibling' else 'nextSibling']
    else
      # Go to the parent because this node doesn't have a side node
      node = node.parentNode
  if deep
    # Deep means go to the deepest element node
    while sideNode?.children?.length > 0
      index = if left then sideNode.children.length - 1 else 0
      sideNode = sideNode.children[index]
  return sideNode


`export { KEY_CODES, addClass, deleteRange, selectElement, insertCaretContainer, hasClass, getCurrentCaretContainer, getNonEditableParent, getNonEditableOnLeft, getNonEditableOnRight, getNonEditableParent, getNonEmptySideNode, isNonEditable, removeCaretContainers }`
