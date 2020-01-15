## Install

```
yarn
```

I too lazy to properly configure this so if you want to refresh the CSS and use tailwind, you have to run the command:
`npx tailwind build app/styles/tailwind.css -o app/styles/app.global.css`

## Starting Development

Start the app in the dev environment. This starts the renderer process in hot-module-replacement mode and starts a webpack dev server that sends hot updates to the renderer process:

```
$ yarn dev
```

## Packaging for Production

To package apps for the local platform:

```
$ yarn package
```
