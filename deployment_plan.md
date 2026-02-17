# Deployment Plan: AWS EC2 Update

## Objective
Manually update the Governance Builder application on the AWS EC2 instance (`18.224.180.152`) to reflect the latest changes (Reset Fields button, CID Control).

## Step 1: Prepare SSH Access
- [ ] Verify existence and permissions of the provided PEM key: `/Users/buentipo/Documents/GitHub/governance-builder/governance.pem`.
- [ ] Set strict permissions (`chmod 400`) on the key to satisfy SSH security requirements.
- [ ] Test connectivity to the server.

## Step 2: Site Reconnaissance
- [ ] Identify the deployment directory on the remote server (typically `~/governance-builder` or `/var/www/governance-builder`).
- [ ] Identify the process manager in use (e.g., `pm2`, `systemd`, or a raw `screen`/`nohup` session).

## Step 3: Execution (Deployment)
- [ ] **Pull Code**: `git pull origin main`
- [ ] **Dependencies**: `npm install` (to ensure any new packages are available).
- [ ] **Build**: `npm run build` (vite build).
- [ ] **Restart**: Reload the application process to serve the new build.

## Step 4: Verification
- [ ] Check output logs for build success.
- [ ] Confirm the application is running.
