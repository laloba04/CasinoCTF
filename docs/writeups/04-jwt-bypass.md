# Challenge 4: Token Trick (JWT Bypass)

**Category**: A02:2021-Cryptographic Failures
**Difficulty**: ⭐⭐⭐

## Description
The JWT verification endpoint accepts algorithms specified by the token header, including `alg: "none"`. This allows attackers to forge tokens without needing the server's secret key.

## Exploitation
1. Take your current JWT token.
2. Decode the header and change `"alg": "HS256"` to `"alg": "none"`.
3. Modify the payload to set `"username": "admin"`.
4. Remove the signature part of the token but keep the trailing period.
5. Submit the forged token to gain admin access.

## Patch
```python
# VULNERABLE
jwt.decode(token, options={"verify_signature": False})

# PATCHED
jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```
