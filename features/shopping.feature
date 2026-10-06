@shopping
Feature: Cart and checkout
  As a signed-in customer
  I want to collect products in a cart and pay for them
  So that I receive my order

  Background:
    Given I am signed in as a customer
    And a product named "Orbit Mug" priced at 12.50 with 5 in stock exists

  @smoke
  Scenario: Adding a product to the cart
    When I add "Orbit Mug" to the cart from the home page
    Then the cart badge shows 1
    And the cart lists "Orbit Mug"

  Scenario: The cart total follows the quantity
    When I add 3 of "Orbit Mug" to the cart from its details page
    And I open the cart
    Then the cart total is 37.50

  Scenario: Removing a product empties the cart
    Given I have "Orbit Mug" in my cart
    When I remove "Orbit Mug" from the cart
    Then I see the empty cart message

  @smoke
  Scenario: Checking out creates an order and reduces the stock
    Given I have "Orbit Mug" in my cart
    When I check out
    Then my orders page shows an order containing "Orbit Mug"
    And "Orbit Mug" has 4 left in stock
