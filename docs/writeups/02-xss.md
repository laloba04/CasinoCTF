# Challenge 2: Script Dealer (XSS Stored)

**Category**: A03:2021-Injection (Cross-Site Scripting)
**Difficulty**: ⭐⭐

## Description
The Scoreboard displays user display names without properly sanitizing HTML input. The frontend uses React's `dangerouslySetInnerHTML`.

## Exploitation
1. In your Profile, change your Display Name to `<img src=x onerror="alert('XSS')">`.
2. When anyone visits the Scoreboard, the browser renders the raw HTML.
3. The image fails to load, triggering the `onerror` JavaScript payload.

## Patch
```javascript
// VULNERABLE
<span dangerouslySetInnerHTML={{ __html: p.display_name }} />

// PATCHED
<span>{p.display_name}</span>
```
