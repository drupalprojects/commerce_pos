<?php

namespace Drupal\commerce_pos_customer_display;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

/**
 * Handles pushing pos checkout updates to the customer display.
 *
 * @package Drupal\commerce_pos_customer_display
 */
class DisplayServer implements MessageComponentInterface {

  protected $clients;

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->clients = new \SplObjectStorage();
  }

  /**
   * {@inheritdoc}
   */
  public function onOpen(ConnectionInterface $conn) {
    $conn->{"register_id"} = 0;
    $conn->{"type"} = '';

    $this->clients->attach($conn);
  }

  /**
   * {@inheritdoc}
   */
  public function onMessage(ConnectionInterface $from, $msg) {
    $msg = json_decode($msg);

    if (isset($msg->type) && $msg->type == 'register') {
      if (isset($msg->cashier)) {
        $send_message = [
          'register_id' => $msg->register_id,
          'type' => 'cashier',
          'cashier' => $msg->cashier,
        ];
      }

      foreach ($this->clients as $key => $client) {
        if ($from === $client) {
          $client->{"register_id"} = $msg->register_id;
          $client->{"type"} = isset($msg->display_type) ? $msg->display_type : 'customer';

          if (isset($msg->cashier)) {
            $client->{"cashier"} = $msg->cashier;
          }
        }
        if (isset($msg->cashier) && $client->register_id == $msg->register_id && $client->type == 'customer') {
          $client->send(json_encode($send_message));
        }
      }
    }

    if (isset($msg->display_items)) {
      foreach ($this->clients as $client) {
        if ($client->register_id == $msg->register_id && $client->type == 'customer') {
          $send_message = [
            'register_id' => $client->register_id,
            'type' => 'display_items',
            'display_items' => $msg->display_items,
          ];

          $client->send(json_encode($send_message));
        }
      }
    }

    if (isset($msg->display_totals)) {
      foreach ($this->clients as $client) {
        if ($client->register_id == $msg->register_id && $client->type == 'customer') {
          $send_message = [
            'register_id' => $client->register_id,
            'type' => 'display_totals',
            'display_totals' => $msg->display_totals,
          ];

          $client->send(json_encode($send_message));
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function onClose(ConnectionInterface $conn) {
    $this->clients->detach($conn);
  }

  /**
   * {@inheritdoc}
   */
  public function onError(ConnectionInterface $conn, \Exception $e) {
    trigger_error("An error has occurred: {$e->getMessage()}\n", E_USER_WARNING);

    $conn->close();
  }

}
