# PlanMyNord VPN

Windows desktop client for PlanMyNord VPN.

## Current state

- Branded Norwegian, Russian and English interface.
- Shared PlanMyNord website login, stored with Electron `safeStorage`.
- Registers the Windows device in the website account and reads its VPN entitlement.
- Reads VPN pricing and payment provider availability from the website API.
- Bundled Xray 26.9.9 and Wintun.
- The Windows TUN path is gated until the website can issue an individual server profile.
- VPN payment actions stay disabled until profile delivery is configured on the server.

## Development

Node.js is already installed. After dependencies are installed:

```powershell
npm.cmd install
npm.cmd start
```

Build the portable executable with `npm run build:portable`. Windows asks for administrator rights because creating the Wintun adapter and system routes requires elevation once the profile service is connected.

## Security rules

- Never embed server secrets or Cloudflare tokens in the client.
- Never log UUIDs, private keys, subscription URLs or authentication headers.
- Pin and verify the core version and checksum.
- Administrative 3x-ui access remains separate from client access.
