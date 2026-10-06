@catalogue
Feature: Browsing the catalogue
  As a shopper
  I want to find products quickly
  So that I can buy what I came for

  @smoke
  Scenario: The home page lists products with a name and a price
    When I open the home page
    Then I see at least 1 product
    And every product shows a price

  Scenario: Searching finds a product by name
    Given a product named "Zephyr Lamp" exists
    When I search for "zephyr lamp"
    Then the results include "Zephyr Lamp"
    And every result contains "Zephyr" in its name

  Scenario: Searching for something that does not exist
    When I search for "zzz-no-such-product-zzz"
    Then I see the message "No products found."

  Scenario: Sorting by price, lowest first
    When I open the home page
    And I sort the products by "Price: Low to High"
    Then the prices are in ascending order

  Scenario: Opening a product shows its details
    Given a product named "Atlas Backpack" priced at 49.50 exists
    When I open the details of "Atlas Backpack"
    Then the product page shows the name "Atlas Backpack" and the price 49.50
