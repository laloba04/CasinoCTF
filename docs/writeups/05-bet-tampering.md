# Challenge 5: High Roller (Bet Tampering)

**Category**: A04:2021-Insecure Design
**Difficulty**: ⭐⭐

## Description
The Game WebSocket doesn't validate if the bet size in the event payload actually matches the wallet restrictions or table limits on the server side.

## Exploitation
1. Enter a table with a $100 max bet.
2. Open Browser DevTools/Console.
3. Emit a manual WebSocket event overriding the amount:
   `socket.emit('roulette_bet', { type: 'red', amount: 9999999 })`
4. The server accepts the bet, allowing massive payouts.

## Patch
Validate the bet amount against the user's `balance` and the `room.max_bet` directly in the WebSocket handler before processing the game round.
