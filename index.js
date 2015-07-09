//
// A [Scribe](https://github.com/guardian/scribe) plugin for link tooltip UI.
// Some code copied from The Guardian's link prompt pugin:
// https://github.com/guardian/scribe-plugin-link-prompt-command
//
(function() {

  // Create the tooltip and append on doc load, then hide/show it when necessary
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

  // The main plugin function
  var scribePluginLinkTooltip = function () {
    return function (scribe) {
      var linkTooltipCommand = new scribe.api.Command('createLink');
      linkTooltipCommand.nodeName = 'A';

      // Show the tooltip when adding a link to unlinked text.
      linkTooltipCommand.execute = function () {
        var selection = new scribe.api.Selection(),
            that = this;
        showTooltip(selection, '', function() {
          getSelection().removeAllRanges();
          getSelection().addRange(selection.range);
          scribe.api.SimpleCommand.prototype.execute.call(that, $input.val());
          // The above execute causes a click on the link which activates the
          // queryState callback below. This causes the tooltip to re-appear
          // after adding the link and clicking off. Not the biggest deal
          // but TODO: fix this.
        });
        $input.focus();
      };

      // Show the tooltip when clicking on a link.
      linkTooltipCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          if ($(node).is('a')) {
            showTooltip(selection, $(node).attr('href'), function() {
              if ($input.val()) $(node).attr('href', $input.val());
            });
          }
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      // Function to show the tooltip based on your current selection.
      //
      // @param {Object} selection The Scribe selection object
      // @param {String} href The link value (empty string when new link)
      // @param {Function} submitCallback Callback after adding the link
      var showTooltip = function(selection, href, submitCallback) {

        // Wrap the callback with common behavior and make sure it only happens
        // once.
        var submitted;
        var submit = function() {
          if (submitted) return;
          $tooltip.hide();
          submitted = true;
          submitCallback();
        }

        // Position the tooltip next to the cursor
        var rects = selection.range.getClientRects();
        $input.val(href || '');
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
        }).one('submit', function(e) {
          e.preventDefault();
          submit();
        });

        // If there's an existing value then show the remove option instead
        // of the apply button
        if (href && selection.selection.anchorNode) {
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
        // Deferred to avoid event clashing.
        setTimeout(function() {
          $(document).on('click.hidetooltip', function(e) {
            if ($tooltip.is(':visible') &&
                !$(e.target).closest('.scribe-plugin-link-tooltip').length &&
                !$(e.target).is('a') &&
                !$(e.target).is('.scribe-plugin-link-tooltip [type=submit]')) {
              submit();
              $(document).off('click.hidetooltip');
            }
          });
        }, 0);
      }

      // Set this as the linking plugin
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