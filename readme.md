# Predix UI Menubar app

Searches through useful Predix UI info like colors and icons to help you design and develop faster and with more confidence.

### Download the app

The app is distributed for recent Mac OS X platforms. Download the latest version by opening the latest [release](https://github.com/davidrleonard/pxtools-menubar/releases/) page and downloading the file pxtools-menubar-darwin-x64-[VERSION].zip.

### Developing

You'll need node and bower to develop.

1. Clone this repo
2. Run `yarn` from inside the repo to install all dependencies
3. Run `npm run-script dev` to serve the app and develop it in the browser
4. Run `npm run-script start` to serve the app in the menubar and test how it works

#### Adding Icons
To add icons, you just need to run a script which will extract all icons from px-icon-set and create the icons.json data file.

1. Have node modules and bower components installed.
2. Make sure you have Node.js 7.6+
  * If you're on 7.x run with the flag node --harmony-async-await
  * If you're on 8.x no flag
3. If px-icon-set has a new group (e.g. Feature, Object, etc), you must add it to scripts/extract-icons.js `dirs` object.
4. Provide optional keywords in scripts/keywords.json for each new icon.
5. `node scripts/extract-icons.js`

### Distributing

1. Run `npm run-script build` to build the app.
2. Zip the new build up and delete the source folder (don't check the source folder or zip into the repo)
3. Add release notes to `HISTORY.md`
4. Run `npm version [NEW_VERSION_HERE]` to bump the version number - this command will automatically bump package.json and commit the result
5. Run `npm publish` to publish the new version to the npm registry
6. Run `git push origin master && git push origin --tags` to push the new code and release tag to github
7. Create a new release on Github and upload the distribution zip you created so users can download the new version.
