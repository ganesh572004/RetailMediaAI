# Deployment Guide for RetailMediaAI 🚀

This guide will walk you through deploying your **RetailMediaAI** application to the web using **Vercel**, the creators of Next.js. This is the easiest and most recommended way to deploy Next.js apps.

## Prerequisites

1.  A [GitHub](https://github.com/) account.
2.  A [Vercel](https://vercel.com/) account (you can sign up using GitHub).
3.  Your project code pushed to a GitHub repository.

## Step 1: Push Your Code to GitHub

If you haven't already, push your local code to a new GitHub repository:

1.  Create a new repository on GitHub (e.g., `retail-media-ai`).
2.  Run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/retail-media-ai.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `retail-media-ai` repository you just created.
4.  In the **Configure Project** screen:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Output Directory**: `.next` (default).

## Step 3: Configure Environment Variables

**Crucial Step:** You must add your environment variables in the "Environment Variables" section before clicking Deploy.

Add the following variables:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXTAUTH_URL` | Your production URL | `https://retail-media-ai.vercel.app` |
| `NEXTAUTH_SECRET` | A random string used to encrypt sessions | `generate-a-long-random-string` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-...` |
| `FACEBOOK_CLIENT_ID` | From Meta Developers | `123456789` |
| `FACEBOOK_CLIENT_SECRET`| From Meta Developers | `a1b2c3...` |
| `SMTP_USER` | Email address for sending notifications | `retailmediaai@gmail.com` |
| `SMTP_PASS` | App Password for the email account | `abcd efgh ijkl mnop` |
| `SMTP_HOST` | SMTP Server Host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP Server Port | `587` |

> **Note:** For `NEXTAUTH_SECRET`, you can generate one by running `openssl rand -base64 32` in your terminal.

## Step 4: Finalize Deployment

1.  Click **"Deploy"**.
2.  Wait for the build to complete. Vercel will install dependencies, build the app, and deploy it.
3.  Once done, you will get a live URL (e.g., `https://retail-media-ai.vercel.app`).

## Step 5: Post-Deployment Configuration

After your site is live, you need to update your OAuth providers (Google/Facebook) with the new domain.

### Google Cloud Console
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services** -> **Credentials**.
3.  Edit your OAuth 2.0 Client ID.
4.  Add your Vercel URL to **Authorized JavaScript origins**:
    *   `https://retail-media-ai.vercel.app`
5.  Add the callback URL to **Authorized redirect URIs**:
    *   `https://retail-media-ai.vercel.app/api/auth/callback/google`
6.  Save changes.

### Facebook Developers
1.  Go to [Meta for Developers](https://developers.facebook.com/).
2.  Select your app -> **Facebook Login** -> **Settings**.
3.  Add `https://retail-media-ai.vercel.app/api/auth/callback/facebook` to **Valid OAuth Redirect URIs**.
4.  Save changes.

## Troubleshooting

*   **Build Failed?** Check the "Logs" tab in Vercel to see the error. Common issues include missing dependencies or TypeScript errors.
*   **Login Not Working?** Double-check your `NEXTAUTH_URL` and Redirect URIs in Google/Facebook consoles.
*   **Images Not Loading?** Ensure your domain is allowed in `next.config.ts` if you are using `next/image` with external domains (though this project mainly uses standard `<img>` tags).

## Alternative: Docker Deployment

If you prefer to host it on your own server (VPS, DigitalOcean, AWS EC2), you can use Docker.

1.  Build the image:
    ```bash
    docker build -t retail-media-ai .
    ```
2.  Run the container:
    ```bash
    docker run -p 3000:3000 \
      -e NEXTAUTH_SECRET=your_secret \
      -e NEXTAUTH_URL=http://your-domain.com \
      retail-media-ai
    ```
