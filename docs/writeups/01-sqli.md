# Challenge 1: Jackpot Query (SQL Injection)

**Category**: A03:2021-Injection
**Difficulty**: ⭐⭐

## Description
The login endpoint concatenates user input directly into the SQL query without using prepared statements. This allows an attacker to manipulate the query logic.

## Exploitation
1. Intercept the login request.
2. For the username parameter, submit `' OR 1=1 --`.
3. The resulting query becomes `SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = '...'`.
4. This always evaluates to true, authenticating you as the first user in the database (usually an admin or wealthy user).

## Patch
```python
# VULNERABLE
cur.execute(f"SELECT * FROM users WHERE username = '{username}'")

# PATCHED
cur.execute("SELECT * FROM users WHERE username = ?", (username,))
```
