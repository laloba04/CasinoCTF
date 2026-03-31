# Challenge 6: Card Counter (Debug Leak)

**Category**: A05:2021-Security Misconfiguration
**Difficulty**: ⭐⭐

## Description
A debug endpoint `/api/debug/state` was left in the codebase without authentication. It exposes the raw internal state of game engines, including the dealer's face-down cards and upcoming deck sequence.

## Exploitation
1. Start a game of Blackjack.
2. Navigate to `http://localhost:5000/api/debug/state`.
3. Find your current `room_id` and look at the `dealer_hand` array to see the exact hole card.

## Patch
Remove the debug endpoint in production, or restrict it using an `@admin_required` decorator.
