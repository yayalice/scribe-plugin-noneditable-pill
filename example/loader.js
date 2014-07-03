require({
  paths: {
    "scribe": "./../bower_components/scribe/scribe",
    "scribe-plugin-noneditable-pill": "./../dist/scribe-plugin-noneditable-pill",
    "scribe-plugin-toolbar": "./../bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar"
  }
}, ["scribe", "scribe-plugin-noneditable-pill", "scribe-plugin-toolbar"], function(Scribe, scribePluginNoneditablePill, scribePluginToolbar) {
  var commandsToKeyboardShortcutsMap, ctrlKey, scribe, updateHTML;
  updateHTML = function() {
    return document.querySelector(".scribe-html").textContent = scribe.getHTML();
  };
  "use strict";
  window.scribe = scribe = new Scribe(document.querySelector(".scribe"), {
    allowBlockElements: true
  });
  scribe.on("content-changed", updateHTML);

  /*
  Keyboard shortcuts
   */
  ctrlKey = function(event) {
    return event.metaKey || event.ctrlKey;
  };
  commandsToKeyboardShortcutsMap = Object.freeze({
    bold: function(event) {
      return event.metaKey && event.keyCode === 66;
    },
    italic: function(event) {
      return event.metaKey && event.keyCode === 73;
    },
    strikeThrough: function(event) {
      return event.altKey && event.shiftKey && event.keyCode === 83;
    },
    removeFormat: function(event) {
      return event.altKey && event.shiftKey && event.keyCode === 65;
    },
    linkPrompt: function(event) {
      return event.metaKey && !event.shiftKey && event.keyCode === 75;
    },
    unlink: function(event) {
      return event.metaKey && event.shiftKey && event.keyCode === 75;
    },
    insertUnorderedList: function(event) {
      return event.altKey && event.shiftKey && event.keyCode === 66;
    },
    insertOrderedList: function(event) {
      return event.altKey && event.shiftKey && event.keyCode === 78;
    },
    blockquote: function(event) {
      return event.altKey && event.shiftKey && event.keyCode === 87;
    },
    h2: function(event) {
      return ctrlKey(event) && event.keyCode === 50;
    }
  });

  /*
  Plugins
   */
  scribe.use(scribePluginNoneditablePill());
  scribe.use(scribePluginToolbar(document.querySelector(".toolbar")));
  if (scribe.allowsBlockElements()) {
    return scribe.setContent('<p>Hello, <nep class="non-editable">World</nep>!</p>');
  } else {
    return scribe.setContent("Hello, World!");
  }
});
