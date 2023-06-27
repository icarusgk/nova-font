import fs from "fs";

const WebfontFormatMap = new Map([
	["woff2", "woff2"],
	["ttf", "truetype"]
]);
export default (function (output, family, hs, formats, unhinted) {
	if (!formats) {
		fs.writeFileSync(output, "");
		return;
	}
	let ans = ``;
	for (const ext of formats) {
		if (!WebfontFormatMap.get(ext)) throw new TypeError("Invalid webfont file format " + ext);
	}
	for (const term of hs) {
		const dirSuffix = unhinted ? "-unhinted" : "";
		const src = formats
			.map(
				ext =>
					`url('${ext}${dirSuffix}/${term.name}.${ext}') ` +
					`format('${WebfontFormatMap.get(ext)}')`
			)
			.join(", ");
		ans += `
@font-face {
	font-family: '${family + " Web"}';
	font-display: swap;
	font-weight: ${term.css.weight};
	font-stretch: ${term.css.stretch};
	font-style: ${term.css.style};
	src: ${src};
}
`;
		if (term.css.style === "oblique") {
			// CHROME hates a family with both Italic and Oblique
			ans += `
@font-face {
	font-family: '${family + " Web Oblique"}';
	font-display: swap;
	font-weight: ${term.css.weight};
	font-stretch: ${term.css.stretch};
	src: ${src};
}
`;
		}
	}
	fs.writeFileSync(output, ans);
});
