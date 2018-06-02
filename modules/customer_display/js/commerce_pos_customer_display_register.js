(function ($, Drupal, drupalSettings) {
    'use strict';

    var conn = new WebSocket(drupalSettings.commercePOSCustomerDisplayURL);

    conn.onopen = function (e) {
        var init = {
            "register_id": drupalSettings.commercePOSCustomerDisplayRegisterId,
            "type": "register",
            "display_type": "cashier",
            "cashier": drupalSettings.commercePOSCustomerDisplayCashierName
        };

        conn.send(JSON.stringify(init));
    };

    var observer = new MutationObserver(function (mutations) {
        var subtotals = [];
        var payments = [];
        var total_paid = {};
        var to_pay = {};
        var change = {};

        $('.commerce-pos--totals--totals tr').each(function () {
            var total = {
                'label': $(this).find('td:nth-child(1)').text(),
                'value': $(this).find('td:nth-child(2)').text()
            };
            subtotals.push(total);
        });

        $('.commerce-pos--totals--payments tr').each(function () {
            var total = {
                'label': $(this).find('td:nth-child(1)').text(),
                'value': $(this).find('td:nth-child(2)').text()
            };
            payments.push(total);
        });

        $('.commerce-pos--totals--total-paid').each(function () {
            total_paid = {
                'label': $(this).find('td:nth-child(1)').text(),
                'value': $(this).find('td:nth-child(2)').text()
            };
        });

        $('.commerce-pos--totals--to-pay').each(function () {
            to_pay = {
                'label': $(this).find('td:nth-child(1)').text(),
                'value': $(this).find('td:nth-child(2)').text()
            };
        });

        $('.commerce-pos--totals--change').each(function () {
            change = {
                'label': $(this).find('td:nth-child(1)').text(),
                'value': $(this).find('td:nth-child(2)').text()
            };
        });

        var display_totals = {
            'subtotals': subtotals,
            'payments': payments,
            'total_paid': total_paid,
            'to_pay': to_pay,
            'change': change
        };

        var message = {
            'register_id': drupalSettings.commercePOSCustomerDisplayRegisterId,
            'display_totals': display_totals
        };

        if(conn.readyState === conn.OPEN) {
            conn.send(JSON.stringify(message));
        }
        else if (conn.readyState === conn.CLOSED) {
            conn.connect();
        }

        var items = [];

        $('[data-drupal-selector="edit-order-items-target-id-order-items"] tr').each(function () {
            var return_item = false;

            if ($(this).find('td:nth-child(5) input:checked').length === 1) {
                return_item = true;
            }

            var item = {
                'product': $(this).find('td:nth-child(1)').html(),
                'unit_price': $(this).find('td:nth-child(2) .commerce-pos-customer-display-unit-price-hidden').val(),
                'total_price': $(this).find('td:nth-child(2) .commerce-pos-customer-display-item-total-price-hidden').val(),
                'quantity': $(this).find('td:nth-child(3) input:hidden').val(),
                'return': return_item
            };

            if(typeof item.quantity !== 'undefined') {
                items.push(item);
            }
        });

        message = {
            'register_id': drupalSettings.commercePOSCustomerDisplayRegisterId,
            'display_items': items
        };

        if (conn.readyState === conn.OPEN) {
            conn.send(JSON.stringify(message));
        }
        else if (conn.readyState === conn.CLOSED) {
            conn.connect();
        }


    });

    var config = {
        childList: true,
        characterData: true,
        subtree: true
    };

    Drupal.behaviors.CommercePosCustomerDisplayRegister = {
        attach: function (context, settings) {
            $('#commerce-pos-order-form-wrapper').once("commerce_pos_register_display_order").each(function () {
                observer.observe(this, config);
            });
            $('#commerce-pos-pay-form-wrapper').once("commerce_pos_register_display_payments").each(function () {
                observer.observe(this, config);
            });
        }
    };
}(jQuery, Drupal, drupalSettings));