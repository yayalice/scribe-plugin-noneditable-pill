require({
  paths: {
    "scribe": "./../bower_components/scribe/scribe",
    "scribe-plugin-noneditable-pill": "./../dist/scribe-plugin-noneditable-pill",
    "scribe-plugin-toolbar": "./../bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar"
  }
}, ["scribe", "scribe-plugin-noneditable-pill", "scribe-plugin-toolbar"], function(Scribe, scribePluginNoneditablePill, scribePluginToolbar) {
  "use strict";

  var scribe = new Scribe(document.querySelector(".scribe"), {
    allowBlockElements: true
  });
  scribe.on("content-changed", function() {
    return document.querySelector(".scribe-html").textContent = scribe.getHTML();
  });

  /*
  Plugins
   */
  scribe.use(scribePluginNoneditablePill());
  scribe.use(scribePluginToolbar(document.querySelector(".toolbar")));

  if (scribe.allowsBlockElements()) {
    scribe.setContent('<p>Hello, <pill class="non-editable">World</pill>!</p>');
  } else {
    scribe.setContent("Hello, World!");
  }
  return window.scribe = scribe;
});
