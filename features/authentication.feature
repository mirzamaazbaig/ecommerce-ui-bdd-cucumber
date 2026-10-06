@auth
Feature: Customer accounts
  As a shopper
  I want to create an account and sign in
  So that my cart, orders and wishlist belong to me

  @smoke
  Scenario: A new visitor registers and is signed in
    Given I am on the registration page
    When I register with a new email and a valid password
    Then I am signed in
    And I am on the home page

  Scenario: Registering with mismatching passwords is refused
    Given I am on the registration page
    When I register with a new email but confirm a different password
    Then I see the error "Passwords do not match"
    And I am not signed in

  Scenario: Registering with an email that is already taken is refused
    Given a customer account exists
    And I am on the registration page
    When I register with that same email
    Then I see the error "User already exists"

  @smoke
  Scenario: A customer signs in with correct credentials
    Given a customer account exists
    And I am on the login page
    When I sign in with that account
    Then I am signed in

  Scenario Outline: Signing in with wrong credentials is refused
    Given a customer account exists
    And I am on the login page
    When I sign in with that email and the password "<password>"
    Then I see the error "Invalid credentials"
    And I am not signed in

    Examples:
      | password       |
      | WrongPass123!  |
      | testpass123!   |

  Scenario: A signed-in customer signs out
    Given I am signed in as a customer
    When I sign out
    Then I am not signed in
