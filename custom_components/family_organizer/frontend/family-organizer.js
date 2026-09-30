//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, p = f.trustedTypes, re = p ? p.emptyScript : "", ie = f.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, g = (e, t) => !l(e, t), _ = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = _) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? _;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? g)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[m("elementProperties")] = /* @__PURE__ */ new Map(), v[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: v }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, ae = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, oe = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", A = "[ 	\n\f\r]", j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, M = /-->/g, N = />/g, P = RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), F = /'/g, I = /"/g, L = /^(?:script|style|textarea|title)$/i, R = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), z = Symbol.for("lit-noChange"), B = Symbol.for("lit-nothing"), V = /* @__PURE__ */ new WeakMap(), H = E.createTreeWalker(E, 129);
function U(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var se = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === j ? c[1] === "!--" ? o = M : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (L.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = N : o === P ? c[0] === ">" ? (o = i ?? j, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? I : F) : o === I || o === F ? o = P : o === M || o === N ? o = j : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === j ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [U(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, W = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = se(t, n);
		if (this.el = e.createElement(l, r), H.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = H.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? le : r[1] === "?" ? ue : r[1] === "@" ? de : q
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (L.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), H.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function G(e, t, n = e, r) {
	if (t === z) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = G(e, i._$AS(e, t.values), i, r)), t;
}
var ce = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		H.currentNode = r;
		let i = H.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new K(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new fe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = H.nextNode(), a++);
		}
		return H.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, K = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = B, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = G(this, e, t), O(e) ? e === B || e == null || e === "" ? (this._$AH !== B && this._$AR(), this._$AH = B) : e !== this._$AH && e !== z && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== B && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = W.createElement(U(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ce(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = V.get(e.strings);
		return t === void 0 && V.set(e.strings, t = new W(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, q = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = B, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = B;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = G(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== z, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = G(this, r[n + o], t, o), s === z && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === B ? e = B : e !== B && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === B ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, le = class extends q {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === B ? void 0 : e;
	}
}, ue = class extends q {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== B);
	}
}, de = class extends q {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = G(this, e, t, 0) ?? B) === z) return;
		let n = this._$AH, r = e === B && n !== B || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== B && (n === B || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, fe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		G(this, e);
	}
}, pe = y.litHtmlPolyfillSupport;
pe?.(W, K), (y.litHtmlVersions ??= []).push("3.3.3");
var me = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new K(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, J = globalThis, Y = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = me(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return z;
	}
};
Y._$litElement$ = !0, Y.finalized = !0, J.litElementHydrateSupport?.({ LitElement: Y });
var he = J.litElementPolyfillSupport;
he?.({ LitElement: Y }), (J.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/custom-element.js
var ge = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, _e = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	hasChanged: g
}, ve = (e = _e, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function ye(e) {
	return (t, n) => typeof n == "object" ? ve(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function X(e) {
	return ye({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region \0@oxc-project+runtime@0.152.0/helpers/esm/decorate.js
function Z(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/family-organizer-panel.ts
var be = [
	"people",
	"calendar",
	"groceries",
	"chores",
	"recipes",
	"settings"
], Q = (e = 0) => {
	let t = /* @__PURE__ */ new Date();
	return t.setDate(t.getDate() + e), t.toISOString().slice(0, 10);
}, xe = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T${t}:00`);
	return n.setHours(n.getHours() + 1), `${e}T${n.toTimeString().slice(0, 8)}`;
}, $ = class extends Y {
	constructor(...e) {
		super(...e), this.page = "calendar", this.calendarView = "month", this.selectedDay = Q(), this.data = {}, this.error = "", this.recipeServings = {};
	}
	set hass(e) {
		let t = !this._hass;
		this._hass = e, t && this.load();
	}
	disconnectedCallback() {
		this.unsubscribe?.(), super.disconnectedCallback();
	}
	async load() {
		if (this._hass) try {
			let e = await Promise.all(be.map((e) => this._hass.callWS({
				type: "family_organizer/list",
				resource: e
			})));
			this.data = Object.fromEntries(be.map((t, n) => [t, e[n]])), this.unsubscribe ||= await this._hass.connection.subscribeMessage(() => void this.load(), { type: "family_organizer/subscribe" });
		} catch (e) {
			this.error = String(e);
		}
	}
	async create(e, t, n) {
		await this._hass.callWS({
			type: "family_organizer/create",
			resource: e,
			collection: n,
			item: {
				id: crypto.randomUUID(),
				...t
			}
		}), await this.load();
	}
	async updateItem(e, t, n, r) {
		await this._hass.callWS({
			type: "family_organizer/update",
			resource: e,
			collection: r,
			item_id: t.id,
			item: n
		}), await this.load();
	}
	async removeItem(e, t, n) {
		await this._hass.callWS({
			type: "family_organizer/delete",
			resource: e,
			collection: n,
			item_id: t.id
		}), await this.load();
	}
	form(e) {
		return e.preventDefault(), Object.fromEntries(new FormData(e.currentTarget));
	}
	render() {
		return R`
      <header><h1>Family Organizer</h1><nav>${Object.entries({
			calendar: "Calendar",
			groceries: "Groceries & meals",
			chores: "Chores",
			recipes: "Recipes",
			settings: "Settings"
		}).map(([e, t]) => R`<button class=${this.page === e ? "active" : ""} @click=${() => this.page = e}>${t}</button>`)}</nav></header>
      <main>${this.error ? R`<p class="error">${this.error}</p>` : B}
        ${this.data.people ? this.renderPage() : R`<p>Loading…</p>`}
      </main>`;
	}
	renderPage() {
		return this.page === "calendar" ? this.renderCalendar() : this.page === "groceries" ? this.renderGroceries() : this.page === "chores" ? this.renderChores() : this.page === "recipes" ? this.renderRecipes() : this.renderSettings();
	}
	renderCalendar() {
		let e = this.data.calendar.items ?? [], t = e.filter((e) => String(e.start).slice(0, 10) === this.selectedDay);
		return R`<section>
      <div class="toolbar"><h2>Calendar</h2>
        ${[
			"month",
			"week",
			"day"
		].map((e) => R`
          <button class=${this.calendarView === e ? "active" : ""} @click=${() => this.calendarView = e}>${e}</button>`)}
        <input type="date" .value=${this.selectedDay} @change=${(e) => this.selectedDay = e.target.value}>
      </div>
      <div class="calendar ${this.calendarView}">
        ${Array.from({ length: this.calendarView === "month" ? 35 : this.calendarView === "week" ? 7 : 1 }, (t, n) => {
			let r = this.calendarView === "day" ? this.selectedDay : Q(n);
			return R`<button class="day" @click=${() => this.selectedDay = r}><b>${r}</b>
            ${e.filter((e) => String(e.start).startsWith(r)).map((e) => R`<span>${e.title}</span>`)}
          </button>`;
		})}
      </div>
      <aside><h3>${this.selectedDay}</h3>${t.map((e) => R`
        <article><b>${e.title}</b><small>${e.start} – ${e.end}</small>
        <button @click=${() => this.removeItem("calendar", e)}>Delete</button></article>`)}
        <form @submit=${(e) => {
			let t = this.form(e);
			this.create("calendar", {
				title: t.title,
				start: `${this.selectedDay}T${t.time}:00`,
				end: xe(this.selectedDay, t.time),
				all_day: !1,
				person_ids: [],
				recurrence: t.recurrence || null
			}), e.target.reset();
		}}><input name="title" placeholder="New event" required><input name="time" type="time" value="18:00">
          <select name="recurrence"><option value="">Once</option><option value="FREQ=DAILY">Daily</option><option value="FREQ=WEEKLY">Weekly</option></select>
          <button>Add</button></form>
      </aside>
    </section>`;
	}
	renderGroceries() {
		let e = this.data.groceries.items ?? [], t = this.data.groceries.meal_plans ?? [];
		return R`<section><h2>Groceries</h2>
      <form @submit=${(e) => {
			let t = this.form(e);
			this.create("groceries", {
				name: t.name,
				quantity: Number(t.quantity),
				checked: !1,
				category: t.category
			}), e.target.reset();
		}}><input name="name" placeholder="Item" required><input name="quantity" type="number" value="1" min="0"><input name="category" placeholder="Category"><button>Add</button></form>
      <div class="cards">${e.map((e) => R`<article>
        <label><input type="checkbox" .checked=${!!e.checked} @change=${() => this.updateItem("groceries", e, { checked: !e.checked })}>
          ${e.quantity} ${e.name}</label><small>${e.category}</small><button @click=${() => this.removeItem("groceries", e)}>×</button>
      </article>`)}</div>
      <h2>7-day meal plan</h2><div class="week">${Array.from({ length: 7 }, (e, n) => {
			let r = Q(n), i = t.find((e) => e.day === r);
			return R`<article><b>${r}</b>${i ? R`<span>${i.title}</span><button @click=${() => this.removeItem("groceries", i, "meal_plans")}>Clear</button>` : R`<form @submit=${(e) => {
				let t = this.form(e);
				this.create("groceries", {
					day: r,
					meal: "dinner",
					title: t.title
				}, "meal_plans");
			}}>
            <input name="title" placeholder="Dinner"><button>Plan</button></form>`}</article>`;
		})}</div>
    </section>`;
	}
	renderChores() {
		let e = this.data.chores.items ?? [], t = this.data.people.items ?? [];
		return R`<section><h2>Chores competition</h2><div class="leaderboard">${t.map((t) => ({
			name: t.name,
			points: e.reduce((e, n) => e + (n.assignee_id === t.id ? (n.completed?.length ?? 0) * Number(n.points) : 0), 0)
		})).sort((e, t) => t.points - e.points).map((e, t) => R`<article><strong>#${t + 1} ${e.name}</strong><b>${e.points} pts</b></article>`)}</div>
      <form @submit=${(e) => {
			let t = this.form(e);
			this.create("chores", {
				title: t.title,
				assignee_id: t.person,
				points: Number(t.points),
				schedule: t.schedule,
				completed: []
			});
		}}><input name="title" placeholder="Chore" required><select name="person">${t.map((e) => R`<option value=${e.id}>${e.name}</option>`)}</select>
        <input name="points" type="number" value="5"><select name="schedule"><option>daily</option><option value="weekly:monday">Weekly</option></select><button>Add</button></form>
      <div class="cards">${e.map((e) => R`<article><b>${e.title}</b><span>${e.points} pts · ${e.schedule}</span>
        <button @click=${() => this.updateItem("chores", e, { completed: [...e.completed ?? [], (/* @__PURE__ */ new Date()).toISOString()] })}>Complete</button>
        <button @click=${() => this.removeItem("chores", e)}>×</button></article>`)}</div>
    </section>`;
	}
	renderRecipes() {
		let e = this.data.recipes.items ?? [];
		return R`<section><h2>Recipes</h2>
      <form @submit=${(e) => {
			let t = this.form(e);
			this.create("recipes", {
				title: t.title,
				category: t.category,
				servings: Number(t.servings),
				ingredients: String(t.ingredients).split(",").filter(Boolean).map((e) => ({
					name: e.trim(),
					amount: 1,
					unit: "x"
				})),
				instructions: []
			});
		}}><input name="title" placeholder="Recipe" required><input name="category" placeholder="Category"><input name="servings" type="number" value="4">
        <input name="ingredients" placeholder="Ingredients, comma separated"><button>Add</button></form>
      ${[...new Set(e.map((e) => e.category))].map((t) => R`<h3>${t}</h3><div class="cards">${e.filter((e) => e.category === t).map((e) => {
			let t = this.recipeServings[e.id] ?? e.servings;
			return R`<article><b>${e.title}</b><label>Servings <input type="number" min="1" .value=${String(t)}
          @input=${(t) => {
				this.recipeServings = {
					...this.recipeServings,
					[e.id]: Number(t.target.value)
				};
			}}></label>
          <ul>${e.ingredients.map((n) => R`<li>${Math.round(n.amount * t / e.servings * 100) / 100} ${n.unit} ${n.name}</li>`)}</ul>
          <button @click=${() => this.removeItem("recipes", e)}>Delete</button></article>`;
		})}</div>`)}</section>`;
	}
	renderSettings() {
		let e = this.data.people.items ?? [], t = this.data.settings;
		return R`<section><h2>Settings</h2>
      <h3>People</h3><form @submit=${(e) => {
			let t = this.form(e);
			this.create("people", {
				name: t.name,
				color: t.color,
				ha_user_id: t.ha_user_id
			});
		}}>
        <input name="name" placeholder="Name" required><input name="color" type="color" value="#3b82f6"><input name="ha_user_id" placeholder="Home Assistant user ID"><button>Add</button></form>
      <div class="cards">${e.map((e) => R`<article style="border-left-color:${e.color}"><b>${e.name}</b><small>${e.ha_user_id || "Not linked"}</small>
        <select @change=${(n) => {
			let r = {
				...t.permissions ?? {},
				[e.ha_user_id]: { "*": n.target.value }
			};
			this.saveSettings({ permissions: r });
		}}><option>view</option><option>edit</option><option>admin</option></select><button @click=${() => this.removeItem("people", e)}>×</button></article>`)}</div>
      <h3>Sync & appearance</h3><form @submit=${(e) => {
			let t = this.form(e);
			this.saveSettings({
				theme: t.theme,
				sync_interval: Number(t.sync_interval)
			});
		}}>
        <select name="theme"><option ?selected=${t.theme === "auto"}>auto</option><option ?selected=${t.theme === "light"}>light</option><option ?selected=${t.theme === "dark"}>dark</option></select>
        <label>Sync interval <input name="sync_interval" type="number" min="5" .value=${String(t.sync_interval ?? 30)}> minutes</label><button>Save</button>
      </form>
    </section>`;
	}
	async saveSettings(e) {
		await this._hass.callWS({
			type: "family_organizer/settings",
			settings: e
		}), await this.load();
	}
	static {
		this.styles = o`
    :host { display:block; min-height:100vh; color:var(--primary-text-color); background:var(--primary-background-color); font:14px system-ui; }
    header { position:sticky; top:0; z-index:2; padding:12px 24px; background:var(--card-background-color,#fff); box-shadow:0 1px 5px #0002; }
    h1 { margin:0 0 10px; } nav,.toolbar,form { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    button,input,select { border:1px solid var(--divider-color,#ccc); border-radius:8px; padding:8px; background:var(--card-background-color,#fff); color:inherit; }
    button { cursor:pointer; } button.active { background:var(--primary-color,#03a9f4); color:#fff; }
    main { max-width:1200px; margin:auto; padding:20px; } section { position:relative; }
    .calendar { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin:15px 320px 15px 0; }
    .calendar.day { grid-template-columns:1fr; } .day { min-height:85px; text-align:left; display:flex; flex-direction:column; gap:3px; }
    .day span { background:color-mix(in srgb,var(--primary-color,#03a9f4) 20%,transparent); border-radius:4px; padding:3px; }
    aside { position:absolute; top:55px; right:0; width:290px; } article { background:var(--card-background-color,#fff); border-radius:10px; padding:12px; display:flex; gap:10px; align-items:center; }
    aside article,.cards article { margin:8px 0; } article small,article span { flex:1; display:block; }
    .week,.leaderboard { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; } .week article { flex-direction:column; align-items:stretch; }
    .leaderboard { grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); margin-bottom:18px; } .cards article { border-left:4px solid var(--primary-color,#03a9f4); }
    .error { color:var(--error-color,#d32f2f); } ul { flex:1; } @media(max-width:800px) { .calendar { margin-right:0; } aside { position:static; width:auto; } .week { grid-template-columns:1fr; } }
  `;
	}
};
Z([X()], $.prototype, "page", void 0), Z([X()], $.prototype, "calendarView", void 0), Z([X()], $.prototype, "selectedDay", void 0), Z([X()], $.prototype, "data", void 0), Z([X()], $.prototype, "error", void 0), Z([X()], $.prototype, "recipeServings", void 0), $ = Z([ge("family-organizer-panel")], $);
//#endregion
export { $ as FamilyOrganizerPanel };

//# sourceMappingURL=family-organizer.js.map