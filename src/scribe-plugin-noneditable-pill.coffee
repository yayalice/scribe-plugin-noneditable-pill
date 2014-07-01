`module DomHelpers from "dom_helpers"`


main = -> (scribe) ->

  ############################################################################
  # Helpers
  ############################################################################

  getCurrentRange = ->
    selection = new scribe.api.Selection()
    selection.range

  moveSelection = ->
    # Move the cursor (selection) to a non editable caret if a pill has just
    # been inserted, remove non editable carets as needed, and expand selection
    # to the entire pill if selected.
    hasSideContent = (range, element, left) ->
      container = range.startContainer
      offset = range.startOffset

      if container.nodeType == Node.TEXT_NODE
        len = container.nodeValue.length
        if (offset > 0 && offset < len) || (if left then offset == len else offset == 0)
          return
      return element

    DomHelpers.removeCaretContainers(scribe)
    selection = new scribe.api.Selection()
    return unless currentRange = selection.range

    isCollapsed = currentRange.collapsed
    nonEditableStart = DomHelpers.getNonEditableParent(currentRange.startContainer)
    nonEditableEnd = DomHelpers.getNonEditableParent(currentRange.endContainer)
    parentCaret = DomHelpers.getCurrentCaretContainer(currentRange)

    if nonEditableStart || nonEditableEnd
      if currentRange.collapsed
        if (element = hasSideContent(currentRange, nonEditableStart || nonEditableEnd, true))
          caretContainer = DomHelpers.insertCaretContainer(element, true)
        else if (element = hasSideContent(currentRange, nonEditableStart || nonEditableEnd, false))
          caretContainer = DomHelpers.insertCaretContainer(element, false)

        if caretContainer
          # place cursor at end of caret unless the caret is the first child
          collapse = if caretContainer.previousElementSibling is null then "beginning" else "end"
          DomHelpers.selectElement(caretContainer, collapse)
          return

      # We are in the middle of a non editable (either collapsed or not). Select the entire non-
      # editable if part is selected. This includes the case where multiple non-editables and
      # parts are selected.
      if nonEditableStart
        currentRange.setStartBefore(nonEditableStart)
      if nonEditableEnd
        currentRange.setEndAfter(nonEditableEnd)
      activateRange(currentRange)
    else if parentCaret?.length > 0 and !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, true)) and
    !DomHelpers.isNonEditable(DomHelpers.getNonEmptySideNode(currentRange, false))
      @_removeCaretContainer(parentCaret[0])

  ##########################################################################
  # Add COMMAND to make text non-editable
  ##########################################################################
  noneditablePillCommand = new scribe.api.SimpleCommand("noneditablePill", "SPAN")
  noneditablePillCommand.execute = ->
    scribe.transactionManager.run ->
      selection = new scribe.api.Selection()
      range = selection.range

      # Do not support collapsed ranges for now
      if range.collapsed then return

      selectedHtmlDocumentFragment = range.extractContents()
      noneditablePillElement = document.createElement("span")
      noneditablePillElement.appendChild selectedHtmlDocumentFragment

      # Non-editable pill is defined by non-editable class
      DomHelpers.addClass(noneditablePillElement, 'non-editable')
      range.insertNode noneditablePillElement
      range.selectNode noneditablePillElement

      # Re-apply the range
      selection.selection.removeAllRanges()
      selection.selection.addRange range

  # Always enabled because we need to check state all the time
  noneditablePillCommand.queryEnabled = -> true

  noneditablePillCommand.queryState = ->
    selection = new scribe.api.Selection()
    !!selection.getContaining(((element) ->
      element.nodeName is "SPAN" and DomHelpers.hasClass(element, 'non-editable')
    ).bind(this))

  scribe.commands.noneditablePill = noneditablePillCommand

  ##########################################################################
  # Handle key events when interacting with a non-editable element
  ##########################################################################
  scribe.el.addEventListener "keydown", (event) ->
    handleLeftNodeCase = =>
      if leftNode
        if keyCode == DomHelpers.KEY_CODES.LEFT and isCollapsed
          DomHelpers.selectElement(leftNode, "none")
          event.preventDefault()
        else if keyCode == DomHelpers.KEY_CODES.BACKSPACE
          DomHelpers.selectElement(leftNode, "none")
      else if leftNodeDeep and keyCode == DomHelpers.KEY_CODES.BACKSPACE
        # This happens when the last node on the previous line is a non-editable
        DomHelpers.insertCaretContainer(leftNodeDeep, false)

    handleRightNodeCase = =>
      if rightNode
        if keyCode == DomHelpers.KEY_CODES.DELETE
          DomHelpers.selectElement(rightNode, "none")
        else if keyCode == DomHelpers.KEY_CODES.RIGHT and isCollapsed
          DomHelpers.selectElement(rightNode, "none")
          event.preventDefault()
      else if rightNodeDeep and keyCode == DomHelpers.KEY_CODES.DELETE and not rightNode
        # This happens when the first node on the next line is a non-editable
        DomHelpers.insertCaretContainer(rightNodeDeep, true)

    isCharacter = (keyCode) ->
      return keyCode >= 48 && keyCode <= 90 or   # [0-9a-z]
             keyCode >= 96 && keyCode <= 111 or  # num pad characters
             keyCode >= 186 && keyCode <= 222    # punctuation

    keyCode = event.keyCode

    if @showConfigPopover
      insertSelect = @getInsertSelectController()
      if keyCode == @KEY_CODES.DOWN
        return insertSelect.downArrowPressed(event)
      else if keyCode == @KEY_CODES.UP
        return insertSelect.upArrowPressed(event)
      else if keyCode in [@KEY_CODES.ENTER, @KEY_CODES.TAB] and insertSelect.get('filteredContent').length > 0
        return insertSelect.enterPressed(event)
      else if keyCode == @KEY_CODES.ESCAPE
        return insertSelect.escapePressed(event)

    moveSelection(scribe)
    range = getCurrentRange()
    isCollapsed = range.collapsed

    startElement = range.startContainer
    endElement = range.endContainer
    nonEditableParent = DomHelpers.isNonEditable(startElement) || DomHelpers.isNonEditable(endElement)
    leftNode = DomHelpers.getNonEditableOnLeft(scribe)
    rightNode = DomHelpers.getNonEditableOnRight(scribe)
    leftNodeDeep = DomHelpers.getNonEditableOnLeft(scribe, true)
    rightNodeDeep =DomHelpers.getNonEditableOnRight(scribe, true)

    if (event.metaKey || event.ctrlKey) && keyCode not in [DomHelpers.KEY_CODES.DELETE, DomHelpers.KEY_CODES.BACKSPACE]
      return

    if isCharacter(keyCode) or keyCode == DomHelpers.KEY_CODES.BACKSPACE or keyCode == DomHelpers.KEY_CODES.DELETE
      if (leftNode || rightNode) and !isCollapsed
        caret = DomHelpers.insertCaretContainer(leftNode || rightNode, if leftNode then false else true)
        DomHelpers.deleteRange(range)
        DomHelpers.selectElement(caret)
      else if nonEditableParent
        DomHelpers.deleteRange(range)  # special delete in case a non-editable is selected

      if (keyCode == DomHelpers.KEY_CODES.BACKSPACE || keyCode == DomHelpers.KEY_CODES.DELETE) && !isCollapsed && nonEditableParent
        # We already performed the delete action
        return event.preventDefault()

    handleLeftNodeCase()
    handleRightNodeCase()

`export default = main`
