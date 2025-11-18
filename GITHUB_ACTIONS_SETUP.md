# GitHub Actions CI/CD Setup

## Automatic Builds on Push

The repository is now configured to automatically build your app when you push code to GitHub.

## Setup Required

### 1. Get Your Expo Access Token

Run this command to generate a token:
```bash
eas credentials
```

Or create one at: https://expo.dev/accounts/anddsdsdsnn5810/settings/access-tokens

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/AndrewD50/SnapTallyMobile
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo access token
6. Click **Add secret**

## Workflows Configured

### 1. Automatic Build (`eas-build.yml`)

**Triggers:**
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main`

**What it does:**
- Installs dependencies
- Runs EAS build for Android (development profile)
- Posts build link in PR comments

### 2. Manual Build (`eas-preview.yml`)

**Triggers:**
- Manual workflow dispatch from GitHub Actions tab

**Options:**
- Choose platform: Android, iOS, or both
- Choose profile: development, preview, or production

**How to use:**
1. Go to: https://github.com/AndrewD50/SnapTallyMobile/actions
2. Click "EAS Preview Build"
3. Click "Run workflow"
4. Select your options
5. Click "Run workflow" button

## Build Profiles

As configured in `eas.json`:

- **development**: Includes dev client, APK format, for testing
- **preview**: Internal distribution, APK format, for testing
- **production**: Release build, APK format, for app stores

## Monitoring Builds

After pushing code or triggering a workflow:

1. **GitHub Actions**: https://github.com/AndrewD50/SnapTallyMobile/actions
2. **EAS Dashboard**: https://expo.dev/accounts/anddsdsdsnn5810/projects/snaptallymobile/builds

## Example Workflow

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# GitHub Actions automatically:
# 1. Detects the push
# 2. Runs tests (if configured)
# 3. Starts EAS build
# 4. You get notified when build completes
```

## Customization

### Change when builds trigger

Edit `.github/workflows/eas-build.yml`:

```yaml
on:
  push:
    branches:
      - main        # Add or remove branches
      - develop
      - feature/*   # Can use wildcards
```

### Build different platforms

Edit the `eas build` command:

```yaml
# For iOS:
- run: eas build --platform ios --profile development --non-interactive

# For both:
- run: eas build --platform all --profile development --non-interactive
```

### Add notifications

Add a step to notify Slack, Discord, email, etc.:

```yaml
- name: Notify on completion
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build completed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### "EXPO_TOKEN is required"
- Make sure you added the token to GitHub Secrets
- Token name must be exactly `EXPO_TOKEN`

### Build fails with "git not clean"
- Make sure all changes are committed
- GitHub Actions checks out a clean copy

### Build takes too long
- EAS builds typically take 10-20 minutes
- The workflow uses `--no-wait` to not block the GitHub Action
- Check build status on EAS dashboard

## Cost Considerations

**Free Tier Limits:**
- 30 builds per month on free plan
- Consider using `--no-wait` to not block CI minutes
- Only build on important branches

## Security Best Practices

✅ **Do:**
- Store EXPO_TOKEN as a GitHub Secret
- Use workflow dispatch for manual builds
- Limit builds to specific branches

❌ **Don't:**
- Commit tokens in code
- Build on every commit (use branch filters)
- Share your EXPO_TOKEN

## Next Steps

1. ✅ Created GitHub Actions workflows
2. ⏳ Add EXPO_TOKEN to GitHub Secrets
3. ⏳ Push code to test automatic build
4. ⏳ Check build status on EAS Dashboard

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions for Expo](https://docs.expo.dev/build/building-on-ci/)
- [Expo Access Tokens](https://docs.expo.dev/accounts/programmatic-access/)
