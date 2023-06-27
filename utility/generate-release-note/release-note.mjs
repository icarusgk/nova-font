import fs from "fs";
import path from "path";
import url from "url";

import SemVer from "semver";

import { Output } from "./shared/index.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const ChangeFileDir = path.join(__dirname, "../../changes");
///////////////////////////////////////////////////////////////////////////////////////////////////
// CHANGE LIST
async function GenerateChangeList(argv, out) {
	const changeFiles = await fs.promises.readdir(ChangeFileDir);
	const fragments = new Map();
	for (const file of changeFiles) {
		const filePath = path.join(ChangeFileDir, file);
		const fileParts = path.parse(filePath);
		if (fileParts.ext !== ".md") continue;
		if (!SemVer.valid(fileParts.name) || SemVer.lt(argv.version, fileParts.name)) continue;
		fragments.set(fileParts.name, await fs.promises.readFile(filePath, "utf8"));
	}
	const sortedFragments = Array.from(fragments).sort((a, b) => SemVer.compare(b[0], a[0]));
	const latestMajor = SemVer.major(sortedFragments[0][0]);
	const latestMinor = SemVer.minor(sortedFragments[0][0]);
	for (const [version, notes] of sortedFragments) {
		const currentMajor = SemVer.major(version);
		const currentMinor = SemVer.minor(version);
		if (latestMajor !== currentMajor || latestMinor !== currentMinor) continue;
		out.log(``);
		out.log(`## Changes of version ${version}`);
		out.log(notes.trimEnd() + "\n");
	}
}
export default (async function main(argv) {
	const out = new Output();
	let baseUrl = `https://github.com/be5invis/Iosevka/blob/v${argv.version}/doc`;
	await GenerateChangeList(argv, out);
	out.log(
		`<table>` +
			`<tr><td align="center"><h1>` +
			`<a href="${baseUrl}/PACKAGE-LIST.md">View package list</a>` +
			`</h1></td></tr>` +
			`<tr><td align="center">` +
			`<a href="${baseUrl}/packages-sha.txt">Package hashes (SHA-256)</a>` +
			`</td></tr>` +
			`</table>`
	);
	await fs.promises.writeFile(argv.outputPath, out.buffer);
});
