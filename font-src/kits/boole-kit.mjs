import * as TypoGeom from "typo-geom";

import { BooleanGeometry, TransformedGeometry } from "../support/geometry/index.mjs";

///////////////////////////////////////////////////////////////////////////////////////////////////
class BooleImpl {
	constructor(bindings, operator, operands) {
		this.bindings = bindings;
		this.operator = operator;
		this.operands = operands;
	}
	applyToGlyph(glyph) {
		const operandGeometries = [];
		const forwardGizmo = glyph.gizmo || this.bindings.GlobalTransform;
		const backwardGizmo = forwardGizmo.inverse();
		for (const operand of this.operands) {
			const g1 = new this.bindings.Glyph();
			g1.gizmo = forwardGizmo;
			g1.include(operand);
			operandGeometries.push(new TransformedGeometry(g1.geometry, backwardGizmo));
		}
		return glyph.includeGeometry(
			new TransformedGeometry(
				new BooleanGeometry(this.operator, operandGeometries),
				forwardGizmo
			)
		);
	}
}
export function SetupBuilders(bindings) {
	const union = (...operands) =>
		new BooleImpl(bindings, TypoGeom.Boolean.ClipType.ctUnion, operands);
	const intersection = (...operands) =>
		new BooleImpl(bindings, TypoGeom.Boolean.ClipType.ctIntersection, operands);
	const difference = (...operands) =>
		new BooleImpl(bindings, TypoGeom.Boolean.ClipType.ctDifference, operands);
	return {
		union: union,
		intersection: intersection,
		difference: difference
	};
}
