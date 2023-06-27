import { Radical, VS01 } from "../../support/gr.mjs";

export function gcFont(glyphStore, excludedChars, otl, cfg) {
	markSweepOtlLookups(otl.GSUB);
	markSweepOtlLookups(otl.GPOS);
	const sink = markGlyphs(glyphStore, excludedChars, otl, cfg);
	return sweepGlyphs(glyphStore, sink);
}

function markSweepOtlLookups(table) {
	if (!table || !table.features || !table.lookups) return;
	const accessibleLookupsIds = new Set();
	markLookups(table, accessibleLookupsIds);
	sweepLookups(table, accessibleLookupsIds);
	sweepFeatures(table, accessibleLookupsIds);
}
function markLookups(table, sink) {
	if (!table || !table.features) return;
	markLookupsStart(table, sink);
	let loop = 0,
		lookupSetChanged = false;
	do {
		lookupSetChanged = false;
		let sizeBefore = sink.size;
		for (const l of Array.from(sink)) {
			const lookup = table.lookups[l];
			if (!lookup) continue;
			if (lookup.type === "gsub_chaining" || lookup.type === "gpos_chaining") {
				for (let st of lookup.rules) {
					if (!st || !st.apply) continue;
					for (const app of st.apply) sink.add(app.lookup);
				}
			}
		}
		loop++;
		lookupSetChanged = sizeBefore !== sink.size;
	} while (loop < 0xff && lookupSetChanged);
}
function markLookupsStart(table, sink) {
	for (let f in table.features) {
		const feature = table.features[f];
		if (!feature) continue;
		for (const l of feature) sink.add(l);
	}
}
function sweepLookups(table, accessibleLookupsIds) {
	let lookups1 = {};
	for (const l in table.lookups) {
		if (accessibleLookupsIds.has(l)) lookups1[l] = table.lookups[l];
	}
	table.lookups = lookups1;
	return accessibleLookupsIds;
}
function sweepFeatures(table, accessibleLookupsIds) {
	let features1 = {};
	for (let f in table.features) {
		const feature = table.features[f];
		if (!feature) continue;
		const featureFiltered = [];
		for (const l of feature) if (accessibleLookupsIds.has(l)) featureFiltered.push(l);
		if (!featureFiltered.length) continue;
		features1[f] = featureFiltered;
	}
	table.features = features1;
}

function markGlyphs(glyphStore, excludedChars, otl, cfg) {
	const sink = markGlyphsInitial(glyphStore, excludedChars);
	while (markGlyphsStep(glyphStore, sink, otl, cfg));
	return sink;
}
function markGlyphsInitial(glyphStore, excludedChars) {
	let sink = new Set();
	for (const [gName, g] of glyphStore.namedEntries()) {
		if (!g) continue;
		if (g.glyphRank > 0) sink.add(gName);
		if (Radical.get(g)) sink.add(gName);
		const unicodeSet = glyphStore.queryUnicodeOf(g);
		if (unicodeSet) {
			for (const u of unicodeSet) {
				if (!excludedChars.has(u)) sink.add(gName);
			}
		}
	}
	return sink;
}
function markGlyphsStep(glyphStore, sink, otl, cfg) {
	const glyphCount = sink.size;
	for (const g of glyphStore.glyphs()) {
		markLinkedGlyph(sink, g, VS01);
	}
	if (otl.GSUB) {
		for (const l in otl.GSUB.lookups) {
			const lookup = otl.GSUB.lookups[l];
			if (!lookup) continue;
			markGlyphsLookupImpl(sink, lookup, cfg);
		}
	}
	const glyphCount1 = sink.size;
	return glyphCount1 > glyphCount;
}
function markLinkedGlyph(sink, g, gr) {
	const linked = gr.get(g);
	if (linked) sink.add(linked);
}
function markGlyphsLookupImpl(sink, lookup, cfg) {
	switch (lookup.type) {
		case "gsub_single":
			return markGlyphsGsubSingle(sink, lookup, cfg);
		case "gsub_multiple":
			return markGlyphsGsubMultiple(sink, lookup, cfg);
		case "gsub_alternate":
			return markGlyphsGsubAlternate(sink, lookup, cfg);
		case "gsub_ligature":
			return markGlyphsGsubLigature(sink, lookup, cfg);
		case "gsub_chaining":
			break;
		case "gsub_reverse":
			return markGlyphsGsubReverse(sink, lookup, cfg);
	}
}
function markGlyphsGsubSingle(sink, lookup, cfg) {
	const st = lookup.substitutions;
	for (const k in st) if (sink.has(k) && st[k]) sink.add(st[k]);
}
function markGlyphsGsubMultiple(sink, lookup, cfg) {
	const st = lookup.substitutions;
	for (const k in st) if (sink.has(k) && st[k]) for (const g of st[k]) sink.add(g);
}
function markGlyphsGsubAlternate(sink, lookup, cfg) {
	const st = lookup.substitutions;
	if (!cfg || !cfg.ignoreAltSub) {
		for (const k in st) if (sink.has(k) && st[k]) for (const g of st[k]) sink.add(g);
	}
}
function markGlyphsGsubLigature(sink, lookup, cfg) {
	const st = lookup.substitutions;
	for (const sub of st) {
		let check = true;
		for (const g of sub.from) if (!sink.has(g)) check = false;
		if (check && sub.to) sink.add(sub.to);
	}
}
function markGlyphsGsubReverse(sink, lookup, cfg) {
	for (const rule of lookup.rules) {
		if (rule.match && rule.to) {
			const matchCoverage = rule.match[rule.inputIndex];
			for (let j = 0; j < matchCoverage.length; j++) {
				if (sink.has(matchCoverage[j]) && rule.to[j]) sink.add(rule.to[j]);
			}
		}
	}
}

function sweepGlyphs(glyphStore, gnSet) {
	return glyphStore.filterByName(gnSet);
}
