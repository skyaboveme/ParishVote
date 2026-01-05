# Parish Council Election 2026

A simple, secure voting app for the Parish Council election.

## Features

- 🗳️ Clean, mobile-friendly voting interface
- ✅ One vote per device (cookie-based)
- 📊 Real-time results display
- 🔒 Secure vote storage with Cloudflare KV

## Candidates

- Sharon Forester
- Neil Dusek
- Tina Seidel
- Brian Waneck
- Jodi Pruitt
- Deana Seidel
- Micheal Goertz

## Deployment

### Quick Deploy via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create** → **Create Worker**
3. Name it `parish-voting`
4. Click **Edit Code** and paste the contents of `src/index.js`
5. Go to **Settings** → **Bindings** → **Add** → **KV Namespace**
   - Variable name: `VOTING_KV`
   - Select or create a KV namespace
6. Click **Deploy**

### Deploy via CLI

```bash
npm install
npx wrangler login
npx wrangler deploy
```

## Live URL

After deployment, your voting app will be available at:
`https://parish-voting.<your-subdomain>.workers.dev`

## Admin: Reset Votes

To reset all votes, delete all keys in the KV namespace via the Cloudflare dashboard.
