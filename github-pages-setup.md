# GitHub Pages Deployment Guide

## 🚀 Quick Setup for GitHub Pages

Your Custom Calendar app is now optimized for GitHub Pages! Here's what I've done:

### ✅ Changes Made:

1. **Static Version Created**: `StaticCustomCalendar.jsx` - works without backend
2. **App Router Updated**: Automatically uses static version in production
3. **Package.json Configured**: Added GitHub Pages homepage and deploy scripts
4. **Local Storage**: Events and current date persist in browser storage
5. **Performance Optimized**: Fast loading for static hosting

### 📋 Deployment Steps:

1. **Build the App**:
   ```bash
   cd frontend
   yarn build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   yarn deploy
   ```

3. **GitHub Repository Settings**:
   - Go to your repo: `jontygart-eng/DnD-Calendar`
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / root
   - Save

### 🛠 Local Development vs Production:

- **Development** (`yarn start`): Uses full backend version with API
- **Production** (GitHub Pages): Uses static version with local storage

### 📱 Features in Static Version:

✅ All 10 custom day names working  
✅ All 10 custom months working  
✅ Set custom current date (saves in browser)  
✅ Add/edit/delete events (saves in browser)  
✅ Month navigation  
✅ Beautiful UI with all animations  
✅ Fast loading optimized for GitHub Pages  

### 🔧 Files to Copy to Your GitHub Repo:

1. Copy entire `frontend/build/` folder contents to your repo root
2. Or use the deploy script which does this automatically

Your calendar will work perfectly on GitHub Pages with full functionality!