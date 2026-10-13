# PlanMyNord VPN

Windows desktop client for PlanMyNord VPN.

## Current state

- Branded Norwegian, Russian and English interface.
- Shared PlanMyNord website login, stored with Electron `safeStorage`.
- Registers the Windows device in the website account and reads its VPN entitlement.
- Reads VPN pricing and payment provider availability from the website API.
- Bundled sing-box 1.14.0 and Wintun for system-wide TUN connections.
- Add HTTPS subscriptions, VLESS/VMess/Trojan/Shadowsocks/Hysteria2/TUIC links, or compatible sing-box JSON from any provider. Profiles are stored in Electron `safeStorage` and work without a PlanMyNord account.
- The shared PlanMyNord account and its optional payment screen are separate from imported provider profiles.

## Development

Node.js is already installed. After dependencies are installed:

```powershell
npm.cmd install
npm.cmd start
```

Build the portable executable with `npm run build:portable`. Windows asks for administrator rights because creating the Wintun adapter and system routes requires elevation.

## Security rules

- Never embed server secrets or Cloudflare tokens in the client.
- Never log UUIDs, private keys, subscription URLs or authentication headers.
- Pin and verify the core version and checksum.
- Administrative 3x-ui access remains separate from client access.
- sing-box is GPL-3.0-or-later; see `vendor/sing-box/LICENSE`, `vendor/sing-box/GPL-3.0.txt`, and the matching source revision at https://github.com/SagerNet/sing-box/tree/0b8995879f29a9b98ee027bc17b75e101445b238.
