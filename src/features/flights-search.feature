@smoke @flights
Feature: Kayak Flight Search
  As a traveler
  I want to search for round-trip flights on Kayak
  So that I can find the best option in terms of time and cost

  Background:
    Given I am on the Kayak home page

  Scenario Outline: Search, select and verify the best round-trip flight
    # Page 1: Search form
    When I select "<tripType>" as the trip type
    And I set the origin to "<origin>"
    And I set the destination to "<destination>"
    And I select the departure date
    And I select the return date
    And I confirm passengers and cabin class are <adults> adult in "<cabinClass>"
    And I click the search button
    Then I should be redirected to the search results page
    # Page 2: Results - Filter and select best flight
    When I filter by the cheapest flights
    And I filter by direct flights or 1 stop if unavailable
    And I select the first result
    Then I should be redirected to the flight details page
    # Page 3: Flight details — Route & airports
    Then the route header should show "<origin>" to "<destination>"
    And the airport codes "<originCode>" and "<destinationCode>" should be displayed
    # Page 3: Flight details — Dates & schedule
    And the departure date should be displayed
    And the return date should be displayed
    # Page 3: Flight details — Price & tariff
    And the total price should be displayed in COP
    And the tariff class should be displayed
    And the tariff inclusions should list luggage details
    # Page 3: Flight details — Booking providers
    And at least one booking provider should be listed with a price

    Examples:
      | tripType      | origin   | destination | originCode | destinationCode | adults | cabinClass |
      | Ida y vuelta  | Medellín | Miami       | MDE        | MIA             | 1      | Económica  |

  @smoke
  Scenario: Verify search form elements are present
    Then the trip type selector should be visible
    And the origin field should be visible
    And the destination field should be visible
    And the departure date selector should be visible
    And the search button should be visible

  @edge
  Scenario: Search with same origin and destination shows no valid results
    When I set the origin to "Medellín"
    And I set the destination to "Medellín"
    Then the search button should not trigger a valid flight search
