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
var INVISIBLE_CHAR = '\uFEFF';

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
      // Focus it before-hand
      scribeNode.click();
      return driver.executeScript(function () {
        // Place a non-editable pill in the text box
        window.scribe.insertHTML('<p>Hello, <pill class="non-editable">World</pill>!</p>');
      });
    });

    when('the user clicks on the pill', function(){
      beforeEach(function () {
        // Focus it before-hand
        var pillELement = driver.findElement(webdriver.By.className('non-editable'));
        pillELement.click();
      });

      it('the pill should be entirely selected', function(){
        driver.executeScript(function () {
          return document.getSelection().getRangeAt(0).toString();
        }).then(function(selectedText){
          expect(selectedText).to.equal('World');
        });
      });
    });

    // when('the user backspaces to delete the pill', function () {
    //   beforeEach(function () {
    //     return new webdriver.ActionSequence(driver)
    //       .sendKeys(webdriver.Key.BACK_SPACE)
    //       .sendKeys(webdriver.Key.BACK_SPACE)
    //       .perform();
    //   });

    //   it('then the entire pill should be deleted', function () {
    //     return scribeNode.getInnerHTML().then(function (innerHTML) {
    //       expect(innerHTML).to.have.html('<p>Hello, </p>');
    //     });
    //   });
    // });

    when('the user types a character', function () {
      beforeEach(function () {
        return scribeNode.sendKeys("a");
      });

      it('the text should be appended to the end of the existing text', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>Hello, <pill class="non-editable">World</pill>!a</p>');
        });
      });
    });

    when('the user moves the cursor to the end of the pill via left arrow', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.LEFT);
      });

      it('a caret container should be added to the end of the pill', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>Hello, <pill class="non-editable">World</pill><caret class="non-editable-caret">' + INVISIBLE_CHAR + '</caret>!</p>');
        });
      });

      when('the user types a character to the right of the non-editable', function(){
        beforeEach(function () {
          return scribeNode.sendKeys("foo");
        });

        it('the text should appear outside the non-editable pill in a "caret" element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>Hello, <pill class="non-editable">World</pill><caret class="non-editable-caret">' + INVISIBLE_CHAR + 'foo</caret>!</p>');
          });
        });

        when('the user then types outside the caret container', function(){
          beforeEach(function () {
            return new webdriver.ActionSequence(driver)
              .click(scribeNode)
              .sendKeys(webdriver.Key.RIGHT)
              .sendKeys("bar")
              .perform();
          });

          it('the caret container and invisible character should be removed', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>Hello, <pill class="non-editable">World</pill>foo!bar</p>');
            });
          });
        });

      });
    });
  });

  given('the text editor contains two non-editable pills with text in between them', function(){
    beforeEach(function () {
      // Focus it before-hand
      scribeNode.click();
      return driver.executeScript(function () {
        // Place a non-editable pill in the text box
        window.scribe.insertHTML('<p><pill class="non-editable">Pill 1</pill>Regular text<pill class="non-editable">Pill 2</pill></p>');
      });
    });

    when('the user then types outside the caret container', function(){
      beforeEach(function() {
        var firstNonEditableElement = driver.findElement(webdriver.By.className('non-editable'));
        return new webdriver.ActionSequence(driver)
          .click(firstNonEditableElement)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys("a")
          .perform();
      });

      it('the text should appear in the correct place', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p><pill class="non-editable">Pill 1</pill>Raegular text<pill class="non-editable">Pill 2</pill></p>');
        });
      });
    });

    when('the user arrows right to the 2nd pill element', function(){
      beforeEach(function() {
        var firstNonEditableElement = driver.findElement(webdriver.By.className('non-editable'));
        return new webdriver.ActionSequence(driver)
          .click(firstNonEditableElement)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .sendKeys(webdriver.Key.RIGHT)
          .perform();
      });

      it('the text should not change', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p><pill class="non-editable">Pill 1</pill>Regular text<pill class="non-editable">Pill 2</pill></p>');
        });
      });

      it('and the 2nd pill element should be selected', function () {
        driver.executeScript(function () {
          return document.getSelection().getRangeAt(0).toString();
        }).then(function(selectedText){
          expect(selectedText).to.equal('Pill 2');
        });
      });
    });
  });

});
