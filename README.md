<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/icarusgk/nova-font/assets/38413630/1fea755a-a0f7-49e2-a73b-5a061a8b0181">
    <img src="https://github.com/icarusgk/nova-font/assets/38413630/45773af3-6a4d-4e7a-88db-f86b20580830">
  </picture>
</div>

# Nova Font 💫

**Nova** is a custom build of Iosevka, licensed under the SIL Open Font License, Version 1.1

## 🚀 Installation

To use Nova, follow these steps:

1. Head over to the [Releases](https://github.com/icarusgk/nova-font/releases) section of this repo
2. **Download** the font of your choice, with or without ligatures, my recommendation `nova-lig.zip`

## 👀 Usage

When using Visual Studio Code you can reference it with the font name of "Nova" for both versions (lig or no ligs).

Example in `settings.json`
```json
{
  "editor.fontFamily": "Nova"
}
```

## 🤓 Nerd Fonts usage

You can reference it with the font name of "Nova Nerd Font" for both versions (lig or no ligs).

Example in `settings.json`
```json
{
  "editor.fontFamily": "Nova Nerd Font"
}
```

## 🏗️ Building Nova

In `private-build-plans.toml`, you can find the customizations made to this font.

If you prefer to build Nova for further customization instead of downloading one of the releases, you can do so by:

1. Install the dependencies

```bash
npm install
```

You will also need to install [`ttfautohint`](https://freetype.org/ttfautohint/index.html#download):


2. Run the command to build the set of fonts you want

```bash
# To build everything: 
npm run build -- contents::nova
# To build unhinted TTF only: 
npm run build -- ttf-unhinted::nova
# To build TTF only (RECOMMENDED): 
npm run build -- ttf::nova
```

This is a very intensive task, be sure to pass a `--jCmd=<number of concurrent jobs>` flag to the command.

3. Once your fonts are built you can find them at `nova/dist`
