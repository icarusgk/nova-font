# Nova Font

**Nova** is a custom build of Iosevka, licensed under the SIL Open Font License, Version 1.1

## Installation

To use Nova, follow these steps:

1. Head over to the Releases section of this repo
2. Download the font of your choice, with or without ligatures.

## Building Nova

In `private-build-plans.toml`, you can find the customizations made to this font.

If you prefer to build Nova for further customization instead of downloading one of the releases, you can do so by:

1. Install the dependencies

```bash
npm install
```

2. Run the command to build the set of fonts you want

```bash
# To build everything: 
npm run build -- contents::nova
# To build unhinted TTF only: 
npm run build -- ttf-unhinted::nova
# To build TTF only (RECOMMENDED): 
npm run build -- ttf::nova
```

3. Once your fonts are built you can find them at `nova/dist/`
