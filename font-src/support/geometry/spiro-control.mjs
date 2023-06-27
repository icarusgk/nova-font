import * as Format from "../util/formatter.mjs";

///////////////////////////////////////////////////////////////////////////////////////////////////

export class BiKnotCollector {
	constructor(contrast) {
		this.contrast = contrast; // stroke contrast
		this.defaultD1 = 0; // default LHS
		this.defaultD2 = 0; // default RHS sw
		this.lastKnot = null; // last knot in the processed items

		this.controls = []; // all the control items
		this.closed = false; // whether the shape is closed
		this.needsUnwrap = false; // whether there are interpolators
		this.afterPreFunction = false; // whether we are really processing knots
	}
	add(c) {
		if (c instanceof Function) {
			if (this.afterPreFunction) throw new Error("Invalid spiro control sequence");
			c.call(this);
		} else if (Array.isArray(c)) {
			for (const item of c) this.add(item);
		} else if (c instanceof ControlKnot) {
			this.afterPreFunction = true;
			this.pushKnot(c);
		} else if (c instanceof TerminateInstruction) {
			this.afterPreFunction = true;
			if (c.type === "close") this.closed = true;
			c.applyTo(this);
		} else if (c instanceof InterpolatorBase) {
			this.afterPreFunction = true;
			this.controls.push(c);
			this.needsUnwrap = true;
		} else {
			throw new Error("Invalid spiro control type");
		}
	}
	unwrap() {
		while (this.needsUnwrap) {
			const cs = [...this.controls];
			this.controls.length = 0;
			this.needsUnwrap = false;
			this.lastKnot = null;
			this.unwrapImpl(cs);
		}
		for (const item of this.controls) {
			if (!(item instanceof BiKnot)) throw new Error("Invalid control sequence");
			item.originalKnot = null;
		}
	}
	unwrapImpl(cs) {
		let tmp = [];
		for (let j = 0; j < cs.length; j++) {
			if (cs[j] instanceof InterpolatorBase) {
				const kBefore = cs[nCyclic(j - 1, cs.length)];
				const kAfter = cs[nCyclic(j + 1, cs.length)];
				const blended = cs[j].blender(kBefore.originalKnot, kAfter.originalKnot, cs[j]);
				tmp.push(blended);
			} else {
				tmp.push(cs[j].originalKnot);
			}
		}

		this.add(tmp);
	}

	pushKnot(c) {
		let k;
		if (this.lastKnot) {
			k = new BiKnot(c.type, c.x, c.y, this.lastKnot.d1, this.lastKnot.d2);
		} else {
			k = new BiKnot(c.type, c.x, c.y, this.defaultD1, this.defaultD2);
		}
		k.originalKnot = c;

		this.controls.push(k);
		this.lastKnot = k;

		c.applyTo(this);
	}
	setWidth(l, r) {
		if (this.lastKnot) {
			this.lastKnot.d1 = l;
			this.lastKnot.d2 = r;
		} else {
			this.defaultD1 = l;
			this.defaultD2 = r;
		}
	}
	headsTo(direction) {
		if (this.lastKnot) {
			this.lastKnot.proposedNormal = direction;
		}
	}
	setUnimportant() {
		if (this.lastKnot) {
			this.lastKnot.unimportant = 1;
		}
	}
	setContrast(c) {
		this.contrast = c;
	}
}

class BiKnot {
	constructor(type, x, y, d1, d2) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.d1 = d1;
		this.d2 = d2;
		this.origTangent = null;
		this.proposedNormal = null;
		this.unimportant = 0;
		this.originalKnot = null;
	}
	clone() {
		const k1 = new BiKnot(this.type, this.x, this.y, this.d1, this.d2);
		k1.origTangent = this.origTangent;
		k1.proposedNormal = this.proposedNormal;
		k1.unimportant = this.unimportant;
		return k1;
	}
	withGizmo(gizmo) {
		const tfZ = gizmo.applyXY(this.x, this.y);
		const k1 = new BiKnot(this.type, tfZ.x, tfZ.y, this.d1, this.d2);
		k1.origTangent = this.origTangent ? gizmo.applyOffset(this.origTangent) : null;
		k1.proposedNormal = this.proposedNormal ? gizmo.applyOffset(this.proposedNormal) : null;
		k1.unimportant = this.unimportant;
		return k1;
	}
	toShapeString() {
		return Format.tuple(
			this.type,
			Format.n(this.x),
			Format.n(this.y),
			this.d1 == null ? "" : Format.n(this.d1),
			this.d2 == null ? "" : Format.n(this.d2),
			this.origTangent
				? Format.tuple(Format.n(this.origTangent.x), Format.n(this.origTangent.y))
				: "",
			this.proposedNormal
				? Format.tuple(Format.n(this.proposedNormal.x), Format.n(this.proposedNormal.y))
				: "",
			this.unimportant
		);
	}
}

function nCyclic(p, n) {
	return (p + n + n) % n;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

export class ControlKnot {
	constructor(type, x, y, af) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.af = af;
	}
	applyTo(ctx) {
		if (this.af) this.af.call(ctx);
	}
}
export class TerminateInstruction {
	constructor(type, af) {
		this.type = type;
		this.af = af;
	}
	applyTo(ctx) {
		if (this.af) throw new Error("Unreachable");
		// if (this.af) this.af.call(ctx);
	}
}
export class InterpolatorBase {
	constructor(blender) {
		this.type = "interpolate";
		this.blender = blender;
	}
}
export function Interpolator(blender, restParameters) {
	const base = new InterpolatorBase(blender);
	const interpolator = Object.create(base);
	for (const prop in restParameters) interpolator[prop] = restParameters[prop];
	return interpolator;
}

export class ImportanceControlKnot extends ControlKnot {
	constructor(type, x, y, unimportant) {
		super(type, x, y, null);
		this.unimportant = unimportant;
	}
}
