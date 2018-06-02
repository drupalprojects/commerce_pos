<?php

namespace Drupal\commerce_pos_customer_display\Controller;

use Drupal\commerce_store\Entity\Store;
use Drupal\Core\Controller\ControllerBase;

/**
 * This exists primarily as a placeholder for close functionality.
 *
 * If you don't have reports install. It is assumed most users will use the EOD
 * report.
 *
 * @package Drupal\commerce_pos\Controller
 */
class Display extends ControllerBase {

  /**
   * Frontend of the customer display.
   *
   * This pairs with the web socket server to supply real time information.
   */
  public function content() {
    /* @var \Drupal\commerce_pos\Entity\Register $register */
    $register = \Drupal::service('commerce_pos.current_register')->get();

    if (empty($register)) {
      return $this->formBuilder()->getForm('\Drupal\commerce_pos_customer_display\Form\RegisterSelectForm');
    }

    $store_id = $register->getStoreId();
    $store = Store::Load($store_id);

    /** @var \Drupal\address\Plugin\Field\FieldType\AddressItem $address */
    $address = $store->getAddress();

    $page = [
      '#type' => 'page',
      '#theme' => 'commerce_pos_customer_display_display',
      '#register' => [
        'name' => $register->getName(),
      ],
      '#store' => [
        'name' => $store->getName(),
        'address' => $address,
      ],
      'content' => [
        '#markup' => 'Store: ' . $store->getName(),
      ],
    ];

    $page['#attached']['library'][] = 'commerce_pos_customer_display/display';
    $page['#attached']['drupalSettings']['commercePOSCustomerDisplayRegisterId'] = $register->id();

    $config = $this->config('commerce_pos_customer_display.settings');

    $url = 'wss://' . $config->get('websocket_host') . ':' . $config->get('websocket_external_port') . '/display';
    $page['#attached']['drupalSettings']['commercePOSCustomerDisplayURL'] = $url;

    return $page;
  }

}
