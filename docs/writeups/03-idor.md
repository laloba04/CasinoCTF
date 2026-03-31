# Challenge 3: Peeping Cards (IDOR)

**Category**: A01:2021-Broken Access Control
**Difficulty**: ⭐

## Description
The endpoint `/api/ctf/hints` fetches hints based on the challenge ID without verifying if the requested hint belongs to a challenge the user has actually started or if they have permission to view high-level hints immediately.

## Exploitation
Simply request the hints endpoint with an incremented ID directly:
`curl -H "Authorization: Bearer <token>" http://localhost:5000/api/ctf/hints/1/level/3`
Even if you haven't unlocked level 1, you can fetch level 3 directly.

## Patch
Ensure the database verifies ownership/state before returning the hint.
