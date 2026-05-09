# Exhibit F

Single-page Next.js app: upload a photo, get a deliberately cursed **viral courtroom sketch** via **Grok Imagine** (`grok-imagine-image-quality`) on the server. The xAI API key never ships to the browser.

## Prerequisites

- Node.js 18.18+ (or 20+ recommended)
- An [xAI API key](https://console.x.ai/) with Imagine access

## Local setup

1. Clone and install:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root (never commit this file):

   ```bash
   XAI_API_KEY=xai-your-key-here
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Where | Required |
|------|--------|----------|
| `XAI_API_KEY` | Server (`app/api/sketch/route.ts`) | Yes |
| `NEXT_PUBLIC_MAX_UPLOAD_BYTES` | Client (multipart prep target, optional) | No |

## Deploy on Vercel

1. Push this repo to GitHub/GitLab/Bitbucket (or use `vercel link` with the CLI).
2. In the Vercel project **Settings → Environment Variables**, add:
   - `XAI_API_KEY` for **Production** and **Preview** (and **Development** if you use `vercel dev`).
3. Deploy. No extra build command is needed; default `npm run build` / Output `.next` works.

Optional: [`vercel.json`](vercel.json) bumps **`maxDuration`** for `/api/sketch`; actual limits depend on your Vercel plan.

**Upload budget on Vercel:** When `VERCEL=1` at build time, the browser targets roughly **4.5 MiB** per multipart upload unless you set **`NEXT_PUBLIC_MAX_UPLOAD_BYTES`** (never above xAI’s **20 MiB** cap). Local builds default to **20 MiB**. Raise **`NEXT_PUBLIC_MAX_UPLOAD_BYTES`** (e.g. **20971520**) on tiers that permit larger POST bodies so optimization rarely runs.

## Upload limits and serverless behavior

- **Formats:** JPEG/PNG only (matches xAI).
- **Server cap:** uploads are validated at **≤ 20 MiB** before calling xAI.
- **Client prep:** originals that violate the configurable **multipart budget** (see env above) or exceed a **8192 px long edge** decode path are canvased-down and JPEG-recompressed (`lib/prepare-image-client.ts`) until they fit **`getMaxUploadPayloadBytes()`** — so users can drop huge DSLR frames without crashing the tab whenever possible.
- **Next.js:** `experimental.serverActions.bodySizeLimit` is raised to **`22mb`** (`next.config.ts`) for headroom versus xAI-sized payloads wherever the deployment allows.
- **No disk persistence.** Ephemeral sketch URLs returned by Imagine are mirrored into base64 in the Route Handler response.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `Server missing XAI_API_KEY` | Env var not set on Vercel or locally in `.env.local`. |
| `413` / body errors | Request larger than platform allows—even after optimizer—lower source resolution or shrink **`NEXT_PUBLIC_MAX_UPLOAD_BYTES`**, or upgrade the hosting tier / self-host Next. |
| Timeout / 504 | Increase `maxDuration` and use a plan that supports it; retry with a smaller image. |
| Moderation or API error message | xAI rejected or failed the request; try a different photo or check console status. |

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — run production build locally
- `npm run lint` — ESLint

## Stack

Next.js (App Router), TypeScript, Tailwind CSS. Image edits call `POST https://api.x.ai/v1/images/edits` with `Content-Type: application/json` per xAI requirements (not `multipart` to xAI).
