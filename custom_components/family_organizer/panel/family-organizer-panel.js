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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, re = f.trustedTypes, ie = re ? re.emptyScript : "", ae = f.reactiveElementPolyfillSupport, p = (e, t) => e, m = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
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
}, h = (e, t) => !l(e, t), g = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: h
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = g) {
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
		return this.elementProperties.get(e) ?? g;
	}
	static _$Ei() {
		if (this.hasOwnProperty(p("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(p("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(p("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? m : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? m : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? h)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[p("elementProperties")] = /* @__PURE__ */ new Map(), _[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: _ }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var v = globalThis, y = (e) => e, b = v.trustedTypes, x = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, S = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, oe = "?" + C, se = `<${oe}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, ce = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", O = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, A = /-->/g, j = />/g, M = RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), N = /'/g, P = /"/g, F = /^(?:script|style|textarea|title)$/i, I = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), L = Symbol.for("lit-noChange"), R = Symbol.for("lit-nothing"), z = /* @__PURE__ */ new WeakMap(), B = w.createTreeWalker(w, 129);
function V(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return x === void 0 ? t : x.createHTML(t);
}
var le = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = A : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = M) : (F.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = M) : o = j : o === M ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? M : c[3] === "\"" ? P : N) : o === P || o === N ? o = M : o === A || o === j ? o = k : (o = M, i = void 0);
		let d = o === M && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + S + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [V(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, H = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = le(t, n);
		if (this.el = e.createElement(l, r), B.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = B.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(S)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? de : r[1] === "?" ? fe : r[1] === "@" ? pe : G
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (F.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), B.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], T());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === oe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function U(e, t, n = e, r) {
	if (t === L) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = U(e, i._$AS(e, t.values), i, r)), t;
}
var ue = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		B.currentNode = r;
		let i = B.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new W(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new me(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = B.nextNode(), a++);
		}
		return B.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, W = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = R, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = U(this, e, t), E(e) ? e === R || e == null || e === "" ? (this._$AH !== R && this._$AR(), this._$AH = R) : e !== this._$AH && e !== L && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== R && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = H.createElement(V(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ue(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = z.get(e.strings);
		return t === void 0 && z.set(e.strings, t = new H(e)), t;
	}
	k(t) {
		D(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = y(e).nextSibling;
			y(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, G = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = R, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = R;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = U(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== L, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = U(this, r[n + o], t, o), s === L && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === R ? e = R : e !== R && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === R ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, de = class extends G {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === R ? void 0 : e;
	}
}, fe = class extends G {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== R);
	}
}, pe = class extends G {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = U(this, e, t, 0) ?? R) === L) return;
		let n = this._$AH, r = e === R && n !== R || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== R && (n === R || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, me = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		U(this, e);
	}
}, he = v.litHtmlPolyfillSupport;
he?.(H, W), (v.litHtmlVersions ??= []).push("3.3.3");
var ge = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new W(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, K = globalThis, q = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ge(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return L;
	}
};
q._$litElement$ = !0, q.finalized = !0, K.litElementHydrateSupport?.({ LitElement: q });
var _e = K.litElementPolyfillSupport;
_e?.({ LitElement: q }), (K.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/custom-element.js
var ve = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, ye = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	hasChanged: h
}, be = (e = ye, t, n) => {
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
function xe(e) {
	return (t, n) => typeof n == "object" ? be(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function J(e) {
	return xe({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region \0@oxc-project+runtime@0.152.0/helpers/esm/decorate.js
function Y(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/family-organizer-panel.ts
var Se = [
	"people",
	"calendar",
	"groceries",
	"chores",
	"recipes",
	"settings"
], Ce = [
	"manage_people",
	"manage_calendar_all",
	"manage_calendar_own",
	"manage_groceries",
	"manage_meal_plan",
	"manage_chores",
	"complete_own_chores",
	"complete_any_chore",
	"manage_recipes",
	"manage_settings",
	"manage_calendar_sync"
], X = (e) => `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`, Z = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00:00`);
	return n.setDate(n.getDate() + t), X(n);
}, Q = (e, t = !1) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00:00`), r = t ? n.getDay() : (n.getDay() + 6) % 7;
	return n.setDate(n.getDate() - r), X(n);
}, we = (e) => {
	let t = Math.floor(e), n = e - t, r = [
		[.25, "¼"],
		[.333, "⅓"],
		[.5, "½"],
		[.667, "⅔"],
		[.75, "¾"]
	].find(([e]) => Math.abs(n - e) < .03);
	return `${t || ""}${r?.[1] || (t ? "" : Math.round(e * 100) / 100)}` || "0";
}, $ = class extends q {
	constructor(...e) {
		super(...e), this.page = "calendar", this.data = {}, this.selectedDay = X(/* @__PURE__ */ new Date()), this.calendarView = "month", this.personFilter = /* @__PURE__ */ new Set(), this.listId = "default", this.groceryAssignee = "", this.groupStores = !1, this.mealWeek = 0, this.scorePeriod = "week", this.servings = {}, this.selectedIngredients = {}, this.theme = localStorage.getItem("family-organizer-theme") || "auto", this.error = "";
	}
	set hass(e) {
		let t = !this._hass;
		this._hass = e, t && this.load();
	}
	disconnectedCallback() {
		this.unsubscribe?.(), super.disconnectedCallback();
	}
	form(e) {
		return e.preventDefault(), Object.fromEntries(new FormData(e.currentTarget));
	}
	async action(e) {
		try {
			await e, this.error = "";
		} catch (e) {
			this.error = String(e);
		}
	}
	async load() {
		try {
			let e = await Promise.all(Se.map((e) => this._hass.callWS({
				type: "family_organizer/list",
				resource: e
			})));
			this.data = Object.fromEntries(Se.map((t, n) => [t, e[n]]));
			let t = this.data.settings || {};
			this.calendarView = t.default_calendar_view || this.calendarView, this.scorePeriod = t.competition_default || this.scorePeriod, this.listId = (this.data.groceries?.lists || []).some((e) => e.id === this.listId) ? this.listId : t.default_grocery_list_id || "default", this.theme = localStorage.getItem("family-organizer-theme") || t.theme || "auto", this.unsubscribe ||= await this._hass.connection.subscribeMessage(() => void this.load(), { type: "family_organizer/subscribe" }), this.error = "";
		} catch (e) {
			this.error = String(e);
		}
	}
	create(e, t, n = "items") {
		return this.action(this._hass.callWS({
			type: "family_organizer/create",
			resource: e,
			collection: n,
			item: t
		}));
	}
	updateItem(e, t, n, r = "items") {
		return this.action(this._hass.callWS({
			type: "family_organizer/update",
			resource: e,
			collection: r,
			item_id: t.id,
			item: n
		}));
	}
	removeItem(e, t, n = "items") {
		return this.action(this._hass.callWS({
			type: "family_organizer/delete",
			resource: e,
			collection: n,
			item_id: t.id
		}));
	}
	person(e) {
		return (this.data.people?.items || []).find((t) => t.id === e);
	}
	avatar(e) {
		let t = this.person(e), n = t?.profile_picture || t?.avatar_url;
		return n ? I`<img class="avatar" src=${n} alt=${t.name}>` : I`<span class="avatar fallback" style=${`background:${t?.color || "#64748b"}`}>${t?.initials || t?.name?.[0] || "?"}</span>`;
	}
	peopleOptions(e) {
		return (this.data.people.items || []).map((t) => I`<option value=${t.id} ?selected=${t.id === e}>${t.name}</option>`);
	}
	render() {
		return I`<div data-theme=${this.theme}><header><h1>Family Organizer</h1><nav>${Object.entries({
			calendar: "Calendar",
			groceries: "Groceries & meals",
			chores: "Chores",
			recipes: "Recipes",
			settings: "Settings"
		}).map(([e, t]) => I`<button class=${this.page === e ? "active" : ""} @click=${() => this.page = e}>${t}</button>`)}</nav></header>
      <main>${this.error ? I`<p class="error">${this.error}</p>` : R}${this.data.people ? this.renderPage() : I`Loading…`}</main></div>`;
	}
	renderPage() {
		return this.page === "calendar" ? this.calendar() : this.page === "groceries" ? this.groceries() : this.page === "chores" ? this.chores() : this.page === "recipes" ? this.recipes() : this.settings();
	}
	calendarDates() {
		if (this.calendarView === "day") return [this.selectedDay];
		let e = this.calendarView === "week" ? Q(this.selectedDay, this.data.settings.week_start === "sunday") : (() => {
			let e = /* @__PURE__ */ new Date(`${this.selectedDay}T12:00:00`);
			return e.setDate(1), Q(X(e), this.data.settings.week_start === "sunday");
		})();
		return Array.from({ length: this.calendarView === "week" ? 7 : 42 }, (t, n) => Z(e, n));
	}
	calendar() {
		let e = this.data.calendar.items || [], t = this.data.people.items || [], n = e.filter((e) => !this.personFilter.size || (e.person_ids || []).some((e) => this.personFilter.has(e))), r = this.calendarDates(), i = n.filter((e) => String(e.start).startsWith(this.selectedDay)), a = this.calendarView === "month" ? 31 : this.calendarView === "week" ? 7 : 1, o = I`<div class=${`calendar-grid ${this.calendarView}`}>
      ${this.calendarView === "month" ? R : I`<div class="all-day"><b>All day</b>${n.filter((e) => e.all_day && r.some((t) => String(e.start).startsWith(t))).map((e) => I`<span>${e.title}</span>`)}</div>`}
      ${r.map((e) => I`<div class=${`calendar-day ${e === X(/* @__PURE__ */ new Date()) ? "today" : ""}`} @click=${() => this.selectedDay = e}><b>${e.slice(5)}</b>
        ${n.filter((t) => String(t.start).startsWith(e) && (!t.all_day || this.calendarView === "month")).map((e) => I`<span class="event">${e.title}</span>`)}
        ${this.calendarView === "month" ? R : Array.from({ length: 24 }, (e, t) => I`<i class="hour">${t}:00</i>`)}
        ${e === X(/* @__PURE__ */ new Date()) && this.calendarView !== "month" ? I`<em class="now" style=${`top:${54 + (/* @__PURE__ */ new Date()).getHours() * 32 + (/* @__PURE__ */ new Date()).getMinutes() * 32 / 60}px`}></em>` : R}
      </div>`)}</div>`, s = I`<aside class=${this.data.settings.overview_collapsed ? "collapsed" : ""}><button @click=${() => this.saveSettings({ overview_collapsed: !this.data.settings.overview_collapsed })}>${this.data.settings.overview_collapsed ? "›" : "‹"} Day overview</button>
      ${this.data.settings.overview_collapsed ? R : I`<h3>${this.selectedDay}</h3>${i.map((e) => I`<article><b>${e.title}</b><small>${e.all_day ? "All day" : String(e.start).slice(11, 16)} · ${(e.person_ids || []).map((e) => this.person(e)?.name).join(", ")}</small><button @click=${() => this.removeItem("calendar", e)}>×</button></article>`)}`}</aside>`;
		return I`<section><div class="toolbar"><h2>Calendar</h2><button @click=${() => this.selectedDay = Z(this.selectedDay, -a)}>←</button><button @click=${() => this.selectedDay = X(/* @__PURE__ */ new Date())}>Today</button><button @click=${() => this.selectedDay = Z(this.selectedDay, a)}>→</button>
      ${[
			"month",
			"week",
			"day"
		].map((e) => I`<button class=${e === this.calendarView ? "active" : ""} @click=${() => this.calendarView = e}>${e}</button>`)}
      <input type="date" .value=${this.selectedDay} @change=${(e) => this.selectedDay = e.target.value}></div>
      <div class="chips">${t.map((e) => I`<button class=${this.personFilter.has(e.id) ? "active" : ""} @click=${() => {
			let t = new Set(this.personFilter);
			t.has(e.id) ? t.delete(e.id) : t.add(e.id), this.personFilter = t;
		}}>${e.name}</button>`)}</div>
      <div class=${`calendar-shell overview-${this.data.settings.overview_position}`}>${s}${o}</div>
      <form @submit=${(e) => {
			let t = e.currentTarget, n = this.form(e);
			this.create("calendar", {
				title: n.title,
				start: `${this.selectedDay}T${n.start}:00`,
				end: `${this.selectedDay}T${n.end}:00`,
				all_day: n.all_day === "on",
				person_ids: [...new FormData(t).getAll("person_ids")],
				recurrence: n.recurrence || null,
				shared: !0
			});
		}}>
        <input name="title" placeholder="Event" required><input name="start" type="time" value="18:00"><input name="end" type="time" value="19:00"><label><input name="all_day" type="checkbox">All day</label>
        ${t.map((e) => I`<label><input name="person_ids" type="checkbox" value=${e.id}>${e.name}</label>`)}
        <select name="recurrence"><option value="">Once</option><option value="FREQ=DAILY">Daily</option><option value="FREQ=WEEKLY">Weekly</option><option value="FREQ=MONTHLY">Monthly</option></select><button>Add event</button></form></section>`;
	}
	groceries() {
		let e = this.data.groceries, t = e.lists || [], n = this.data.settings.stores || [], r = (e.items || []).filter((e) => e.list_id === this.listId && (!this.groceryAssignee || e.assignee_id === this.groceryAssignee));
		this.groupStores && (r = [...r].sort((e, t) => (e.store || "").localeCompare(t.store || "")));
		let i = t.find((e) => e.id === this.listId), a = e.meal_slots || e.meal_plans || [], o = Z(Q(X(/* @__PURE__ */ new Date())), this.mealWeek * 7);
		return I`<section><div class="toolbar"><h2>Groceries</h2><select .value=${this.listId} @change=${(e) => this.listId = e.target.value}>${t.map((e) => I`<option value=${e.id}>${e.name}</option>`)}</select>
      ${i ? I`<button @click=${() => {
			let e = prompt("List name", i.name);
			e && this.updateItem("groceries", i, { name: e }, "lists");
		}}>Rename</button><button ?disabled=${t.length < 2} @click=${() => void this.removeItem("groceries", i, "lists")}>Delete list</button>` : R}
      <select .value=${this.groceryAssignee} @change=${(e) => this.groceryAssignee = e.target.value}><option value="">All assignees</option>${this.peopleOptions()}</select>
      <label><input type="checkbox" .checked=${this.groupStores} @change=${() => this.groupStores = !this.groupStores}>Group by store</label>
      <button @click=${() => r.filter((e) => e.checked).forEach((e) => void this.removeItem("groceries", e))}>Clear bought</button></div>
      <form @submit=${(e) => {
			let t = this.form(e);
			this.create("groceries", {
				name: t.name,
				store: t.store,
				shared: !0
			}, "lists");
		}}><input name="name" placeholder="New list" required><input name="store" list="stores" placeholder="Default store"><button>Create list</button></form>
      <datalist id="stores">${n.map((e) => I`<option value=${e}>`)}</datalist>
      <form @submit=${(e) => {
			let t = this.form(e);
			this.create("groceries", {
				name: t.name,
				quantity: Number(t.quantity),
				unit: t.unit,
				notes: t.notes,
				list_id: this.listId,
				store: t.store,
				assignee_id: t.assignee_id || null,
				checked: !1,
				shared: !0
			});
		}}>
        <input name="name" placeholder="Item" required><input name="quantity" type="number" value="1" step="any"><input name="unit" placeholder="Unit"><input name="notes" placeholder="Notes"><input name="store" list="stores" placeholder="Store"><select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions()}</select><button>Add / merge</button></form>
      <div class="cards">${r.map((e, t) => I`${this.groupStores && (t === 0 || r[t - 1].store !== e.store) ? I`<h3>${e.store || "No store"}</h3>` : R}<article><input type="checkbox" .checked=${!!e.checked} @change=${() => this.updateItem("groceries", e, { checked: !e.checked })}><b>${e.quantity} ${e.unit} ${e.name}</b><small>${e.notes || ""}${e.store ? ` · ${e.store}` : ""}</small><span title="Created by">${this.avatar(e.creator_id)}</span>${e.assignee_id ? I`<span title="Assigned to">${this.avatar(e.assignee_id)}</span>` : R}<button @click=${() => this.removeItem("groceries", e)}>×</button></article>`)}</div>
      <div class="toolbar"><h2>Meal plan</h2><button @click=${() => this.mealWeek--}>←</button><button @click=${() => this.mealWeek = 0}>This week</button><button @click=${() => this.mealWeek++}>→</button></div>
      <div class="horizontal meals">${Array.from({ length: 7 }, (e, t) => {
			let n = Z(o, t);
			return I`<article><b>${n}</b>${(this.data.settings.meal_slots || [
				"breakfast",
				"lunch",
				"dinner"
			]).map((e) => {
				let t = a.find((t) => t.day === n && (t.slot || t.meal) === e);
				return t ? I`<div><small>${e}</small> ${t.title}<button @click=${() => this.removeItem("groceries", t, "meal_slots")}>×</button></div>` : I`<form @submit=${(t) => {
					let r = this.form(t), i = (this.data.recipes.items || []).find((e) => e.id === r.recipe_id);
					this.create("groceries", {
						day: n,
						slot: e,
						recipe_id: r.recipe_id || null,
						title: i?.title || r.title,
						servings: i?.servings || 1
					}, "meal_slots");
				}}><small>${e}</small><select name="recipe_id"><option value="">Free text</option>${(this.data.recipes.items || []).map((e) => I`<option value=${e.id}>${e.title}</option>`)}</select><input name="title" placeholder="Meal"><button>+</button></form>`;
			})}</article>`;
		})}</div></section>`;
	}
	choreDue(e, t) {
		let n = e.created?.slice(0, 10) || t;
		if (t < n) return !1;
		if (!e.schedule || e.schedule === "once") return t === (e.due_date || n);
		if (e.schedule === "daily") return !0;
		let r = /* @__PURE__ */ new Date(`${t}T12:00:00`);
		if (e.schedule === "weekly") return (e.weekdays || []).map(Number).includes((r.getDay() + 6) % 7);
		if (String(e.schedule).startsWith("weekly:")) return String(e.schedule).split(":")[1].includes(r.toLocaleDateString("en", { weekday: "long" }).toLowerCase());
		if (e.schedule === "monthly") return r.getDate() === Number(e.month_day || (/* @__PURE__ */ new Date(`${n}T12:00:00`)).getDate());
		let i = Number(e.interval_days || String(e.schedule).split(":")[1] || 1);
		return Math.floor((r.getTime() - (/* @__PURE__ */ new Date(`${n}T12:00:00`)).getTime()) / 864e5) % i === 0;
	}
	chores() {
		let e = this.data.chores.items || [], t = this.data.chores.completions || [], n = e.filter((e) => this.choreDue(e, this.selectedDay)), r = /* @__PURE__ */ new Date(), i = this.scorePeriod === "week" ? /* @__PURE__ */ new Date(`${Q(X(r))}T00:00:00`) : new Date(r.getFullYear(), r.getMonth(), 1), a = /* @__PURE__ */ new Date(i.getTime() - 1), o = this.scorePeriod === "week" ? /* @__PURE__ */ new Date(a.getTime() - 5184e5) : new Date(a.getFullYear(), a.getMonth(), 1), s = (this.data.people.items || []).map((e) => ({
			person: e,
			points: t.filter((t) => t.person_id === e.id && new Date(t.completed_at) >= i).reduce((e, t) => e + Number(t.points), 0)
		})).sort((e, t) => t.points - e.points), c = (this.data.people.items || []).map((e) => ({
			person: e,
			points: t.filter((t) => t.person_id === e.id && new Date(t.completed_at) >= o && new Date(t.completed_at) <= a).reduce((e, t) => e + Number(t.points), 0)
		})).sort((e, t) => t.points - e.points), l = Math.max(1, ...s.map((e) => e.points));
		return I`<section><div class="toolbar"><h2>Chores</h2><input type="date" .value=${this.selectedDay} @change=${(e) => this.selectedDay = e.target.value}><select .value=${this.scorePeriod} @change=${(e) => this.scorePeriod = e.target.value}><option value="week">Week</option><option value="month">Month</option></select></div>
      <div class="leaderboard">${s.map((e, t) => I`<article>${t === 0 ? "👑" : R}${this.avatar(e.person.id)}<b>${e.person.name}</b><progress max=${l} value=${e.points}></progress><strong>${e.points} pts</strong></article>`)}</div><p>Prior winner: ${c[0]?.points ? `${c[0].person.name} (${c[0].points})` : "—"}</p>
      <form @submit=${(e) => {
			let t = e.currentTarget, n = this.form(e);
			this.create("chores", {
				title: n.title,
				assignee_ids: [...new FormData(t).getAll("assignee_ids")],
				rotate: n.rotate === "on",
				points: Number(n.points),
				schedule: n.schedule,
				weekdays: [...new FormData(t).getAll("weekdays")].map(Number),
				month_day: Number(n.month_day),
				interval_days: Number(n.interval_days),
				due_date: n.due_date || null,
				due_time: n.due_time || null,
				icon: n.icon,
				created: X(/* @__PURE__ */ new Date()),
				shared: !0
			});
		}}>
        <input name="title" placeholder="Chore" required><input name="icon" value="mdi:check-circle-outline" placeholder="Icon"><input name="points" type="number" value="5">
        ${this.data.people.items.map((e) => I`<label><input name="assignee_ids" type="checkbox" value=${e.id}>${e.name}</label>`)}<label><input name="rotate" type="checkbox">Rotate</label>
        <select name="schedule"><option value="once">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom interval</option></select>
        ${[
			"M",
			"T",
			"W",
			"T",
			"F",
			"S",
			"S"
		].map((e, t) => I`<label><input name="weekdays" type="checkbox" value=${t}>${e}</label>`)}
        <input name="month_day" type="number" min="1" max="31" value="1"><input name="interval_days" type="number" min="1" value="2"><input name="due_date" type="date"><input name="due_time" type="time"><button>Schedule</button></form>
      <div class="cards">${n.map((e) => {
			let n = e.assignee_ids || [e.assignee_id], i = n[e.rotation_index % n.length], a = t.some((t) => t.chore_id === e.id && t.completed_at.startsWith(this.selectedDay)), o = !a && this.selectedDay < X(/* @__PURE__ */ new Date()) || !a && this.selectedDay === X(/* @__PURE__ */ new Date()) && e.due_time && e.due_time < r.toTimeString().slice(0, 5);
			return I`<article class=${o ? "overdue" : ""}>${this.avatar(i)}<b>${e.icon} ${e.title}</b><small>${a ? "Completed" : o ? "Overdue" : `Due ${e.due_time || "today"}`} · ${e.points} pts</small><button ?disabled=${a} @click=${() => this.action(this._hass.callWS({
				type: "family_organizer/complete_chore",
				chore_id: e.id,
				person_id: i
			}))}>Complete</button><button @click=${() => this.removeItem("chores", e)}>×</button></article>`;
		})}</div>
      <details><summary>History & manual points</summary><form @submit=${(e) => {
			let t = this.form(e);
			this.action(this._hass.callWS({
				type: "family_organizer/adjust_points",
				person_id: t.person_id,
				points: Number(t.points),
				note: t.note
			}));
		}}><select name="person_id">${this.peopleOptions()}</select><input name="points" type="number" required><input name="note" placeholder="Reason"><button>Adjust</button></form>${t.slice().reverse().slice(0, 30).map((e) => I`<p>${e.completed_at.slice(0, 16)} · ${this.person(e.person_id)?.name || "Unknown"} · ${e.points} pts ${e.note || ""}</p>`)}</details></section>`;
	}
	categoryTree(e = null, t = 0) {
		return I`${(this.data.recipes.categories || []).filter((t) => (t.parent_id || null) === e).map((e) => I`<div style=${`margin-left:${t * 16}px`}><b>${e.name}</b><button @click=${() => {
			let t = prompt("Category name", e.name);
			t && this.updateItem("recipes", e, { name: t }, "categories");
		}}>Rename</button><select @change=${(t) => this.updateItem("recipes", e, { parent_id: t.target.value || null }, "categories")}><option value="">Root</option>${(this.data.recipes.categories || []).filter((t) => t.id !== e.id).map((t) => I`<option value=${t.id} ?selected=${t.id === e.parent_id}>${t.name}</option>`)}</select><button @click=${() => this.removeItem("recipes", e, "categories")}>×</button>${this.categoryTree(e.id, t + 1)}</div>`)}`;
	}
	recipes() {
		let e = this.data.recipes.items || [], t = this.data.recipes.categories || [], n = this.data.groceries.lists || [];
		return I`<section><h2>Recipe categories</h2><form @submit=${(e) => {
			let t = this.form(e);
			this.create("recipes", {
				name: t.name,
				parent_id: t.parent_id || null
			}, "categories");
		}}><input name="name" required placeholder="Category"><select name="parent_id"><option value="">Root</option>${t.map((e) => I`<option value=${e.id}>${e.name}</option>`)}</select><button>Add</button></form>${this.categoryTree()}
      <h2>Recipes</h2><form @submit=${(e) => {
			let t = e.currentTarget, n = this.form(e);
			this.create("recipes", {
				title: n.title,
				category_ids: [...new FormData(t).getAll("category_ids")],
				tags: String(n.tags).split(",").map((e) => e.trim()).filter(Boolean),
				image: n.image || null,
				prep_time: Number(n.prep_time),
				cook_time: Number(n.cook_time),
				servings: Number(n.servings),
				ingredients: String(n.ingredients).split("\\n").filter(Boolean).map((e) => {
					let [t, n, ...r] = e.trim().split(/\\s+/);
					return {
						amount: Number(t) || 1,
						unit: Number(t) ? n : "",
						name: Number(t) ? r.join(" ") : e.trim()
					};
				}),
				steps: String(n.steps).split("\\n").filter(Boolean),
				shared: !0
			});
		}}>
        <input name="title" placeholder="Recipe" required><input name="tags" placeholder="tags, comma separated"><input name="image" placeholder="Image URL"><input name="prep_time" type="number" placeholder="Prep min"><input name="cook_time" type="number" placeholder="Cook min"><input name="servings" type="number" value="4" step=".25">
        ${t.map((e) => I`<label><input name="category_ids" type="checkbox" value=${e.id}>${e.name}</label>`)}<textarea name="ingredients" placeholder="1 cup flour&#10;2 x eggs"></textarea><textarea name="steps" placeholder="One instruction per line"></textarea><button>Add recipe</button></form>
      <div class="cards">${e.map((e) => {
			let t = this.servings[e.id] || e.servings, r = this.selectedIngredients[e.id] || new Set(e.ingredients.map((e, t) => t));
			return I`<article class="recipe">${e.image ? I`<img class="recipe-image" src=${e.image}>` : R}<h3>${e.title}</h3><small>${e.tags?.join(" · ")} · ${e.prep_time || 0}+${e.cook_time || 0} min</small><div><button @click=${() => this.servings = {
				...this.servings,
				[e.id]: Math.max(.25, t - .25)
			}}>−</button> ${we(t)} servings <button @click=${() => this.servings = {
				...this.servings,
				[e.id]: t + .25
			}}>+</button></div>
        ${(e.ingredients || []).map((i, a) => I`<label><input type="checkbox" .checked=${r.has(a)} @change=${() => {
				let t = new Set(r);
				t.has(a) ? t.delete(a) : t.add(a), this.selectedIngredients = {
					...this.selectedIngredients,
					[e.id]: t
				};
			}}>${we(Number(i.amount) * t / e.servings)} ${i.unit} ${i.name} → <select id=${`route-${e.id}-${a}`}>${n.map((e) => I`<option value=${e.id}>${e.name}</option>`)}</select></label>`)}
        <ol>${(e.steps || e.instructions || []).map((e) => I`<li>${e}</li>`)}</ol><button @click=${() => {
				let i = Object.fromEntries((e.ingredients || []).map((t, n) => [String(n), this.renderRoot.querySelector(`#route-${e.id}-${n}`).value]));
				this.action(this._hass.callWS({
					type: "family_organizer/recipe_to_groceries",
					recipe_id: e.id,
					servings: t,
					list_id: n[0]?.id,
					selected: [...r],
					routes: i
				}));
			}}>Add selected to groceries</button>
        <button @click=${() => this.create("groceries", {
				day: this.selectedDay,
				slot: (this.data.settings.meal_slots || ["dinner"])[0],
				recipe_id: e.id,
				title: e.title,
				servings: t
			}, "meal_slots")}>Add to meal plan</button><button @click=${() => this.removeItem("recipes", e)}>Delete</button></article>`;
		})}</div></section>`;
	}
	saveSettings(e) {
		return this.data = {
			...this.data,
			settings: {
				...this.data.settings,
				...e
			}
		}, this.action(this._hass.callWS({
			type: "family_organizer/settings",
			settings: e
		}));
	}
	settings() {
		let e = this.data.settings;
		return I`<section><h2>Settings</h2><h3>People and permissions</h3><form @submit=${(e) => {
			let t = this.form(e);
			this.create("people", {
				name: t.name,
				color: t.color,
				user_id: t.user_id || null,
				profile_picture: t.profile_picture || null,
				role: t.role,
				permissions: {},
				shared: !0
			});
		}}><input name="name" required placeholder="Name"><input name="color" type="color" value="#3b82f6"><input name="user_id" placeholder="Home Assistant user ID"><input name="profile_picture" placeholder="Profile picture URL"><select name="role"><option value="parent_admin">parent_admin</option><option value="parent">parent</option><option value="child">child</option></select><button>Add person</button></form>
      <div class="permission-table">${(this.data.people.items || []).map((e) => I`<article>${this.avatar(e.id)}<input .value=${e.name} @change=${(t) => this.updateItem("people", e, { name: t.target.value })}><select .value=${e.role} @change=${(t) => this.updateItem("people", e, { role: t.target.value })}><option>parent_admin</option><option>parent</option><option>child</option></select><input .value=${e.user_id || ""} placeholder="HA user ID" @change=${(t) => this.updateItem("people", e, { user_id: t.target.value || null })}><div>${Ce.map((t) => I`<label><input type="checkbox" .checked=${e.permissions?.[t] ?? (e.role === "parent_admin" || e.role === "parent" && ![
			"manage_people",
			"manage_settings",
			"manage_calendar_sync"
		].includes(t) || e.role === "child" && [
			"manage_calendar_own",
			"manage_groceries",
			"manage_meal_plan",
			"complete_own_chores",
			"manage_recipes"
		].includes(t))} @change=${(n) => this.updateItem("people", e, { permissions: {
			...e.permissions || {},
			[t]: n.target.checked
		} })}>${t}</label>`)}</div><button @click=${() => this.removeItem("people", e)}>Delete</button></article>`)}</div>
      <h3>Display and defaults</h3><form @change=${(e) => {
			let t = e.currentTarget, n = Object.fromEntries(new FormData(t));
			this.saveSettings({
				overview_position: n.overview_position,
				week_start: n.week_start,
				time_format: n.time_format,
				default_calendar_view: n.default_calendar_view,
				default_grocery_list_id: n.default_grocery_list_id,
				competition_default: n.competition_default,
				language: n.language,
				meal_slots: String(n.meal_slots).split(",").map((e) => e.trim()).filter(Boolean),
				stores: String(n.stores).split(",").map((e) => e.trim()).filter(Boolean)
			});
		}}>
        <label>Day overview <select name="overview_position" .value=${e.overview_position}><option>left</option><option>right</option></select></label><label>Week starts <select name="week_start" .value=${e.week_start}><option>monday</option><option>sunday</option></select></label><label>Time <select name="time_format" .value=${e.time_format}><option value="24">24-hour</option><option value="12">12-hour</option></select></label><label>Calendar default <select name="default_calendar_view" .value=${e.default_calendar_view}><option>month</option><option>week</option><option>day</option></select></label><label>Grocery default <select name="default_grocery_list_id" .value=${e.default_grocery_list_id}>${(this.data.groceries.lists || []).map((e) => I`<option value=${e.id}>${e.name}</option>`)}</select></label><label>Meal slots <input name="meal_slots" .value=${(e.meal_slots || []).join(", ")}></label><label>Stores <input name="stores" .value=${(e.stores || []).join(", ")}></label><label>Competition <select name="competition_default" .value=${e.competition_default}><option>week</option><option>month</option></select></label><label>Language <input name="language" .value=${e.language || "en"}></label></form>
      <h3>Appearance</h3><select .value=${this.theme} @change=${(e) => {
			this.theme = e.target.value, localStorage.setItem("family-organizer-theme", this.theme), this.saveSettings({ theme: this.theme });
		}}><option value="auto">Follow Home Assistant</option><option value="light">Light</option><option value="dark">Dark</option></select><p>Calendar sync sources and credentials are configured under Settings → Devices & services → Family Organizer → Configure.</p></section>`;
	}
	static {
		this.styles = o`
    :host{display:block;min-height:100vh;color:var(--primary-text-color);background:var(--primary-background-color);font:14px system-ui}[data-theme=dark]{color:#eee;background:#111;--card-background-color:#242424}[data-theme=light]{color:#222;background:#f5f5f5;--card-background-color:#fff}
    header{position:sticky;top:0;z-index:4;padding:12px 24px;background:var(--card-background-color,#fff);box-shadow:0 1px 5px #0002}h1{margin:0 0 8px}nav,.toolbar,form,.chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center}nav{overflow-x:auto;flex-wrap:nowrap}main{max-width:1300px;margin:auto;padding:20px}
    button,input,select,textarea{border:1px solid var(--divider-color,#bbb);border-radius:7px;padding:7px;background:var(--card-background-color,#fff);color:inherit}button{cursor:pointer}button.active{background:var(--primary-color,#03a9f4);color:white}.error,.overdue{color:var(--error-color,#d32f2f)}
    .cards article,aside article,.leaderboard article,.permission-table article{margin:8px 0;background:var(--card-background-color,#fff);border-radius:10px;padding:10px;display:flex;gap:9px;align-items:center}.cards article small,aside article small{flex:1}.avatar{width:32px;height:32px;border-radius:50%;object-fit:cover}.fallback{display:inline-grid;place-items:center;color:white}
    .calendar-shell{display:grid;grid-template-columns:220px 1fr;gap:10px}.calendar-shell.overview-right{grid-template-columns:1fr 220px}.overview-right aside{order:2}aside.collapsed{width:36px}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));overflow:auto}.calendar-grid.day{grid-template-columns:1fr}.calendar-day{min-height:110px;border:1px solid var(--divider-color,#ddd);padding:5px;position:relative}.calendar-grid.week .calendar-day,.calendar-grid.day .calendar-day{min-height:822px;padding-top:48px}.calendar-day.today{box-shadow:inset 0 0 0 2px var(--primary-color,#03a9f4)}.event,.all-day span{display:block;background:#03a9f433;padding:3px;margin:2px}.hour{display:block;height:30px;border-top:1px solid #8883;font-style:normal}.now{position:absolute;left:0;right:0;border-top:2px solid #e53935}.all-day{grid-column:1/-1;display:flex;gap:5px;padding:7px}
    .horizontal{display:flex;gap:8px;overflow-x:auto;padding:8px 0}.horizontal>article{min-width:240px;background:var(--card-background-color,#fff);padding:10px;border-radius:9px}.meals article{display:block}.leaderboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.leaderboard article{margin:0}.leaderboard progress{min-width:40px;flex:1}.recipe{align-items:flex-start!important;flex-wrap:wrap}.recipe-image{width:100px;height:70px;object-fit:cover;border-radius:6px}.permission-table article{align-items:flex-start}.permission-table article>div{display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));flex:1}textarea{min-height:65px}
    @media(max-width:700px){main{padding:10px}header{padding:10px}.calendar-shell,.calendar-shell.overview-right{display:block}.calendar-grid{grid-template-columns:repeat(7,minmax(90px,1fr))}.permission-table article{flex-wrap:wrap}.permission-table article>div{grid-template-columns:1fr}.cards article{overflow:auto}}
  `;
	}
};
Y([J()], $.prototype, "page", void 0), Y([J()], $.prototype, "data", void 0), Y([J()], $.prototype, "selectedDay", void 0), Y([J()], $.prototype, "calendarView", void 0), Y([J()], $.prototype, "personFilter", void 0), Y([J()], $.prototype, "listId", void 0), Y([J()], $.prototype, "groceryAssignee", void 0), Y([J()], $.prototype, "groupStores", void 0), Y([J()], $.prototype, "mealWeek", void 0), Y([J()], $.prototype, "scorePeriod", void 0), Y([J()], $.prototype, "servings", void 0), Y([J()], $.prototype, "selectedIngredients", void 0), Y([J()], $.prototype, "theme", void 0), Y([J()], $.prototype, "error", void 0), $ = Y([ve("family-organizer-panel")], $);
//#endregion
export { $ as FamilyOrganizerPanel };
