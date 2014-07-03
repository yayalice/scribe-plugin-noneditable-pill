var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var initializeScribe = helpers.initializeScribe.bind(null, 'scribe');
var seleniumBugs = helpers.seleniumBugs;
var browserName = helpers.browserName;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});


describe('non editable pill plugin', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['../../dist/scribe-plugin-noneditable-pill'], function (nonEditablePlugin) {
        window.scribe.use(nonEditablePlugin());
        done();
      });
    });
  });

  given('the text editor contains a non-editable pill', function () {

    beforeEach(function () {
      return driver.executeScript(function () {
        window.scribe.setContent('Hello, <nep class="non-editable">World</nep>!');
        // TODO: fix this via formatter
        // window.scribe.insertHTML('<p>Hello, <span class="non-editable">World</span>!</p>');
      });
    });

    when('the user moves the cursor to the end of the pill via left arrow', function () {

      beforeEach(function () {
        return new webdriver.ActionSequence(driver)
          .click(scribeNode)
          .sendKeys(webdriver.Key.LEFT)
          .perform()
      });

      it('the contents should not change', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>Hello, <nep class="non-editable">World</nep>!</p>');
        });
      });
    });
  });
});
