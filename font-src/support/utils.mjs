export function mix(a, b, p) {
	return a + (b - a) * p;
}
export function barMixL(l, r, b, p) {
	return l > r ? barMixL(r, l, b, p) : l + b + p * (r - l - b * 3);
}
export function linreg(x0, y0, x1, y1, x) {
	return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}
export function clamp(l, h, x) {
	return x < l ? l : x > h ? h : x;
}
export function fallback(...args) {
	for (const item of args) if (item !== void 0) return item;
	return void 0;
}
export function bez2(a, b, c, t) {
	return (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
}
export function bez3(a, b, c, d, t) {
	return (
		(1 - t) * (1 - t) * (1 - t) * a +
		3 * (1 - t) * (1 - t) * t * b +
		3 * t * t * (1 - t) * c +
		t * t * t * d
	);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

export function joinCamel(a, b) {
	if (!a) return b;
	if (!b) return a;
	return a + b[0].toUpperCase() + b.slice(1);
}

function joinSuffixListImpl(sink, k, v, telescope, configs) {
	if (!configs.length) {
		sink[k] = v;
		return;
	}

	let [item, ...rest] = configs;
	if (item instanceof Function) item = item(...telescope);
	if (!item) return;

	for (const [keySuffix, valueSuffix] of Object.entries(item)) {
		const k1 = joinCamel(k, keySuffix);
		const v1 = [...v, valueSuffix];
		const telescope1 = [...telescope, keySuffix];
		joinSuffixListImpl(sink, k1, v1, telescope1, rest);
	}
}

export const SuffixCfg = {
	weave: function (...configs) {
		let ans = {};
		joinSuffixListImpl(ans, "", [], [], configs);
		return ans;
	},
	combine: function (...configs) {
		let ans = {};
		for (const item of configs) for (const [k, v] of Object.entries(item)) ans[k] = v;
		return ans;
	},
	collect: function (pairs) {
		let ans = {};
		for (const pair of pairs) {
			if (pair) ans[pair.left] = pair.right;
		}
		return ans;
	}
};

///////////////////////////////////////////////////////////////////////////////////////////////////

export class $NamedParameterPair$ {
	constructor(l, r) {
		this.left = l;
		this.right = r;
	}
}
