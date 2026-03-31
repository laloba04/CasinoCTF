# Challenge 9: Double Down (Race Condition)

**Category**: A04:2021-Insecure Design
**Difficulty**: ⭐⭐⭐

## Description
The function handling payouts does not use a database lock or threading lock. If two requests hit the endpoint simultaneously, they might both read the same initial balance, add the payout, and save it, resulting in double crediting.

## Exploitation
Using Burp Suite's Turbo Intruder, send 10 concurrent requests to the "cashout" or "collect reward" endpoint. The balance will increase exponentially due to the lack of transaction isolation.

## Patch
Wrap critical balance-modifying operations in an atomic database transaction or use Python's `threading.Lock()`.
