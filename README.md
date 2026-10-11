# Duo Relay Lab — Standalone Edition

Recreated from the supplied Duo Relay Lab migration handoff. No Lovable package, authentication broker, editor integration, preview service, or build service is required.

## Start immediately: offline edition

Open `offline.html` in a modern browser. This single file includes all its code and styles and makes no network requests. It has no sign-in and no shared database. It is suitable for personal, local manual relay use, not as an access-controlled website.

1. Enter the owner objective and select Prepare Relay.
2. Copy the ChatGPT Lead Brief into your ChatGPT conversation.
3. Copy the Perplexity Advisory Prompt into Perplexity and obtain its answer.
4. Paste the answer, including sources, into Step 3.
5. Copy the Final ChatGPT Handoff back into the same ChatGPT conversation.

You still use ChatGPT and Perplexity manually; this tool does not provide or automate those services. Your existing service subscriptions, usage limits, and terms still apply.

Copy buttons use the browser clipboard API. If file permissions prevent copying, the tool selects the text so you can use your device's Copy command. Browser storage behavior for downloaded files varies. Keep a separate copy of important instructions.

## Full application with Supabase authentication

Stack: React 19, TypeScript, Vite, Tailwind CSS, Supabase JS, lucide-react, sonner. Native HTML form controls and a native modal replace the original generic component wrappers. No application server is required for the web UI.

### Requirements

- Node.js 22.12 or newer (a current supported Node 22 release is recommended).
- npm.
- A Supabase project you control, with its project URL and browser-safe publishable key. A legacy anon key is also accepted.
- Google OAuth configuration only if you want Google sign-in.

### Run locally

In the extracted project directory:

```sh
npm install
```

Copy `.env.example` to `.env.local` using your file manager, then edit these two values locally:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Never paste secrets into a chat. Never use `SUPABASE_SERVICE_ROLE_KEY`, an `sb_secret_` key, or a Google client secret in browser configuration. Vite embeds `VITE_` variables in the browser bundle. The client rejects recognized secret and service-role keys, but that check is not a substitute for correctly managing environment variables.

Start the app:

```sh
npm run dev
```

Open `http://localhost:5173`. If the port is already in use, use the actual origin displayed by Vite and configure that origin in Supabase as well. Restart Vite after editing environment variables.

If environment variables are missing or invalid, the app shows a configuration screen; it does not bypass sign-in.

### Supabase email/password

Enable email/password authentication in your own Supabase project. The app calls `signInWithPassword` and `signUp` directly. When confirmation is required, users must confirm their account through email before signing in. Set the correct Site URL and allowed redirect URLs in Authentication > URL Configuration. Add `http://localhost:5173` for local development and the exact origin of your approved production site.

### Supabase Google OAuth

1. Create/configure a Google OAuth web client in Google Cloud.
2. Add your app origin(s) as authorized JavaScript origins.
3. Add the Supabase callback URL shown in your Supabase Google provider settings as the Google authorized redirect URI. This callback is the Supabase endpoint, not the app URL.
4. Enable the Google provider in Supabase and enter the Google client ID and secret there, not in the frontend.
5. Add your app origin(s) to the Supabase redirect allow list.

The browser code uses:

```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
})
```

Supabase JS handles the browser PKCE redirect/session flow. No server callback route or Lovable wrapper is included. The app is designed to run at the site's root URL.

Using a new Supabase project does not automatically migrate old user accounts. Reuse an independently accessible existing project if appropriate, or plan a separate user migration. This package does not modify a database or migrate accounts.

### Test and build

```sh
npm test
npm run build
npm run preview
```

Tests use Node's built-in runner, not Bun. The package includes 20 automated tests covering local prompt generation, authority order, real newlines, custom instructions, evidence framing, mistaken prompt handling, and the offline edition's main event flow.

The production build goes into `dist`. `npm run preview` serves a local build preview; it is not a production hosting service.

### Optional static hosting

A Netlify configuration is included, but nothing has been deployed, published, purchased, or connected.

After owner approval, use your chosen static host with:

- Build command: `npm run build`
- Publish directory: `dist`
- Node: a supported Node 22 version, at least 22.12
- The two browser-safe environment variables above

Update Supabase Site URL, redirect allow list, and Google authorized origins to the final approved hostname. Hosting and authentication plans have their own quotas and terms; zero model API calls does not guarantee unlimited free third-party infrastructure.

After a successful dependency installation, commit the generated `package-lock.json` to GitHub so future builds can use `npm ci`. No lockfile is fabricated in this package.

## Behavior preserved

- Owner is final authority; ChatGPT coordinates; Perplexity provides research and verification advice.
- Owner Objective -> ChatGPT Lead Brief -> Perplexity Advisory Prompt -> pasted answer -> Final ChatGPT Handoff.
- Editable team instructions use the same browser localStorage keys as the handoff.
- Mobile-first dark interface and copy buttons.
- Direct Supabase email/password and Google sign-in in the full application.
- No model API keys, model API calls, payment system, telemetry service, server-side service-role key, or database writes.

## Improvements and limits

- Fixed the handoff's escaped newline joins so generated packets have real line breaks.
- Warns and blocks the final handoff when Step 3 appears to contain a prompt instead of an answer.
- Can remove an exact generated prompt prefix from a pasted conversation when a substantive remainder follows. This is a conservative heuristic, not semantic verification; review the remaining response before copying. Modified or ambiguous prompt blocks must be removed manually.
- Warns when the objective changes without regenerating the prompts.
- Changing the objective clears the previous research after confirmation.
- Handles denied clipboard permission and unavailable browser storage.
- Team instructions update the generated prompts immediately.
- Instructions persist only in the current browser origin, not across devices or hostnames. Moving away from a Lovable origin does not automatically migrate that origin's localStorage. Copy your custom instructions manually into the new app if needed.
- Objective and advisory are held in memory, not saved to localStorage or Supabase. Refreshing or signing out discards them. Supabase stores the auth session separately in its standard browser storage.
- Shared-browser users can see the same saved team instructions. The access gate protects the UI experience, not server resources. No product database is used. Preserve RLS and configure authorization separately before adding a database-backed feature.
- Prompt evidence markers are advisory framing, not a security sandbox or a guarantee against prompt injection. Review evidence and sources yourself.
- Original binary assets and complete CSS were not supplied. The dark UI and SVG favicon are recreated rather than a pixel-perfect screenshot copy.
- No service worker or installable PWA is claimed.

## Validation in the build environment

- Passed all 20 included Node tests.
- Checked syntax of the inline offline JavaScript.
- Verified no Lovable dependency exists in package.json.
- npm installation, TypeScript/Vite compilation, actual browser rendering, and live Supabase/Google authentication could not be tested here because dependencies and live project credentials were not available. Run the commands and sign-in checks above before production deployment.

## Source documentation

The supplied migration handoff is the product specification. Implementation/setup references:

- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/reference/javascript/auth-signinwithoauth
- https://supabase.com/docs/guides/auth/passwords
- https://vite.dev/guide/static-deploy.md

No credentials from the original project were copied.
