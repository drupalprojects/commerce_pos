(function ($, Drupal, drupalSettings) {
  'use strict';

  // If we hit enter on the order item input, it will add the first result if
  // possible.
  Drupal.behaviors.commercePosOrderItemQuickAdd = {
    attach: function (context, settings) {
      $('input.form-autocomplete').keypress(function (event) {
        if (event.which == 13) {
          $(this).trigger("autocompleteclose");
        }

      });
    }
  };

  // Auto highlight quantity field when clicked.
  Drupal.behaviors.commercePosOrderItemQuantity = {
    attach: function (context) {
      $(context).find('input.commerce-pos-order-item-quantity').once('addOnClick').each(function () {
        var _this = $(this);
        _this.on('click', function () {
          _this.select();
        });
      });
    }
  };
}(jQuery, Drupal, drupalSettings));