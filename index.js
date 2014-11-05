(function() {
  var scribePluginLinkTooltip = function () {
    return function (scribe) {
      var linkPromptCommand = new scribe.api.Command('createLink');

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {
        var selection = new scribe.api.Selection();
        var range = selection.range;
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
        var initialLink = anchorNode ? anchorNode.href : 'http://';
        scribe.api.SimpleCommand.prototype.execute.call(this, 'http://google.com');
      };

      linkPromptCommand.queryState = function () {
        /**
         * We override the native `document.queryCommandState` for links because
         * the `createLink` and `unlink` commands are not supported.
         * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
         */
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      scribe.commands.linkPrompt = linkPromptCommand;
    };
  };

  // Export for CommonJS & window global. TODO: AMD
  if (typeof module != 'undefined') {
    module.exports = scribePluginLinkTooltip;
  } else {
    window.scribePluginLinkTooltip = scribePluginLinkTooltip;
  }
})();