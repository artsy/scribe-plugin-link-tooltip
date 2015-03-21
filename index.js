//
// A [Scribe](https://github.com/guardian/scribe) plugin for link tooltip UI.
// Some code copied from The Guardian's link prompt pugin:
// https://github.com/guardian/scribe-plugin-link-prompt-command
//
(function() {

  // Create the tooltip and append on doc laod, then hide/show it when necessary
  var $tooltip = $(
    '<form class="scribe-plugin-link-tooltip" style="display: none">' +
      '<input placeholder="Paste or type a link"></input>' +
      '<button class="scribe-plugin-link-tooltip-add" \
        type="submit">Apply</button>' +
      '<button class="scribe-plugin-link-tooltip-remove" \
        style="display: none">Remove</button>' +
    '</form>'
  );
  var $input = $tooltip.find('input'),
      $remove = $tooltip.find('.scribe-plugin-link-tooltip-remove')
      $apply = $tooltip.find('.scribe-plugin-link-tooltip-add');
  $(function() { $('body').append($tooltip) });

  var scribePluginLinkTooltip = function () {
    return function (scribe) {
      var linkTooltipCommand = new scribe.api.Command('createLink');
      linkTooltipCommand.nodeName = 'A';

      var showTooltip = function(selection, val, submitCallback) {
        var rects = selection.range.getClientRects();
        $input.val(val);
        var left = 0;
        var top = 0;
        Array.prototype.forEach.call(rects, function(rect) {
          left += rect.left + (rect.width / 2);
          top += rect.bottom;
        });
        left = left / rects.length;
        top = top / rects.length;
        $tooltip.show().css({
          position: 'absolute',
          left: left,
          top: $(window).scrollTop() + top + 10
        }).one('submit', submitCallback);
        // If there's an existing value then show the remove option instead
        // of the apply button
        if (val && selection.selection.anchorNode) {
          console.log($apply)
          $apply.hide();
          $remove.show().one('click', function(e) {
            var range = document.createRange();
            range.selectNodeContents(selection.selection.anchorNode);
            getSelection().removeAllRanges();
            getSelection().addRange(range);
            new scribe.api.Command('unlink').execute();
          });
        } else {
          $apply.show();
          $remove.hide();
        }
        // On clicking off the tooltip or an A, hide the tooltip.
        // (Defered to let events resolve).
        setTimeout(function() {
          $(document).one('click', function(e) {
            if ($tooltip.is(':visible') &&
                !$(e.target).closest('.scribe-plugin-link-tooltip').length &&
                !$(e.target).is('a') &&
                !$(e.target).is('.scribe-plugin-link-tooltip [type=submit]')) {
              $tooltip.hide();
            }
          });
        }, 0);
      }

      linkTooltipCommand.execute = function () {
        var selection = new scribe.api.Selection();
        showTooltip(selection, '', function(e) {
          e.preventDefault();
          $tooltip.hide();
          getSelection().removeAllRanges();
          getSelection().addRange(selection.range);
          scribe.api.SimpleCommand.prototype.execute.call(this, $input.val());
        }.bind(this));
        $input.focus();
      };

      linkTooltipCommand.queryState = function () {
        /**
         * We override the native `document.queryCommandState` for links because
         * the `createLink` and `unlink` commands are not supported.
         * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
         */
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          // Show the tooltip when clicking on a link.
          // When submitting change the link.
          if ($(node).is('a')) {
            showTooltip(selection, $(node).attr('href'), function(e) {
              e.preventDefault();
              $tooltip.hide();
              $(node).attr('href', $input.val());
            }.bind(this));
          }
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      scribe.commands.linkPrompt = linkTooltipCommand;
    };
  };

  // Export for CommonJS & window global. TODO: AMD
  if (typeof module != 'undefined') {
    module.exports = scribePluginLinkTooltip;
  } else {
    window.scribePluginLinkTooltip = scribePluginLinkTooltip;
  }
})();