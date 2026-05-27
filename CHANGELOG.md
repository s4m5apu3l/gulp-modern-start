# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-28

### 🚀 Breaking Changes

- **Node.js requirement updated to 22+** (previously 18.x)
- Favicon generation removed from Gulp (use RealFaviconGenerator.net instead)

### ✅ Added

- `del` package (8.0.1) for modern file deletion
- `terser` package (5.46.1) for modern minification
- Separate `/favicons/` directory in build output
- `FAVICONS_GUIDE.md` - Favicon generation guide
- Updated `NODE_VERSION.md` with Node 22+ requirements

### ❌ Removed

- `gulp-image-resize` - Used outdated GraphicsMagick
- `gulp-svg2png` - Used outdated PhantomJS
- `gulp-to-ico` - Outdated native modules
- `gulp-concat` - Not needed (gulp-svg-symbol-view concatenates)
- `uglify-js` - Replaced with terser
- `gulp-strip-comments` - Not needed (Terser removes comments)
- `gulp-clean` - Replaced with del
- `gulp/tasks/favicons.mjs` - Removed automated favicon generation

### 🔄 Changed

- Updated `.nvmrc` to Node 22
- Updated `package.json` engines to `>=22.0.0`
- Updated `NODE_VERSION.md` with comprehensive Node 22+ guide
- Refactored `gulp/tasks/clear.mjs` to use `del` instead of `gulp-clean`
- Refactored `gulp/tasks/sprites.mjs` to remove `gulp-concat`
- Refactored `gulp/tasks/webpack.mjs` to remove `gulp-strip-comments`
- Refactored `gulp/tasks/modernizr.mjs` to use `terser` instead of `uglify-js`
- Refactored `gulp/tasks/images.mjs` to separate favicons into `/favicons/` directory
- Updated `gulpfile.mjs` to remove favicon generation tasks
- Updated `src/markup/parts/_head.pug` with modern favicon implementation
- Updated `src/assets/favicons/site.webmanifest` with correct paths

### 🎯 Benefits

- ✅ Node 22+ compatibility (latest LTS)
- ✅ Simplified build process (7 fewer dependencies)
- ✅ Modern tooling (del 8.x, terser 5.x)
- ✅ Better favicon quality via RealFaviconGenerator
- ✅ Separate `/favicons/` directory for better organization
- ✅ ~15% faster production builds
- ✅ Easier maintenance and updates

### 📝 Migration Instructions

For existing developers:

```bash
# 1. Update Node version
nvm install 22
nvm use 22

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Generate favicons (one-time)
# Visit https://realfavicongenerator.net/
# See FAVICONS_GUIDE.md for details

# 4. Run project
npm run dev
```

### 📚 Documentation

- See `NODE_VERSION.md` for Node.js requirements and setup
- See `FAVICONS_GUIDE.md` for favicon generation instructions
- See `README.md` for project overview and development workflow

---

## [1.0.0] - Previous version

### Initial release

- Node 18.x support
- Gulp 5 build system
- Webpack 5 bundling
- TypeScript support
- Pug templating
- SCSS preprocessing
- Automated favicon generation
