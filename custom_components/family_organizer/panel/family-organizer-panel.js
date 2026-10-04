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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: f, getPrototypeOf: p } = Object, m = globalThis, h = m.trustedTypes, g = h ? h.emptyScript : "", te = m.reactiveElementPolyfillSupport, _ = (e, t) => e, v = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? g : null;
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
}, y = (e, t) => !l(e, t), ne = {
	attribute: !0,
	type: String,
	converter: v,
	reflect: !1,
	useDefault: !1,
	hasChanged: y
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ne) {
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
		return this.elementProperties.get(e) ?? ne;
	}
	static _$Ei() {
		if (this.hasOwnProperty(_("elementProperties"))) return;
		let e = p(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(_("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(_("properties"))) {
			let e = this.properties, t = [...ee(e), ...f(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? v : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? v : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? y)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[_("elementProperties")] = /* @__PURE__ */ new Map(), b[_("finalized")] = /* @__PURE__ */ new Map(), te?.({ ReactiveElement: b }), (m.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var x = globalThis, re = (e) => e, S = x.trustedTypes, C = S ? S.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ie = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, ae = "?" + w, oe = `<${ae}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, se = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, le = />/g, j = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, de = /"/g, fe = /^(?:script|style|textarea|title)$/i, M = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), N = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), pe = /* @__PURE__ */ new WeakMap(), F = T.createTreeWalker(T, 129);
function me(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return C === void 0 ? t : C.createHTML(t);
}
var he = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (fe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = le : o === j ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? de : ue) : o === de || o === ue ? o = j : o === ce || o === le ? o = A : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + ie + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [me(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, I = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = he(t, n);
		if (this.el = e.createElement(l, r), F.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = F.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ie)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? _e : r[1] === "?" ? ve : r[1] === "@" ? ye : z
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (fe.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = S ? S.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), F.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ae) c.push({
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
		let n = T.createElement("template");
		return n.innerHTML = e, n;
	}
};
function L(e, t, n = e, r) {
	if (t === N) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = L(e, i._$AS(e, t.values), i, r)), t;
}
var ge = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? T).importNode(t, !0);
		F.currentNode = r;
		let i = F.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new R(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new be(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = F.nextNode(), a++);
		}
		return F.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, R = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = P, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = L(this, e, t), D(e) ? e === P || e == null || e === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : e !== this._$AH && e !== N && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== P && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = I.createElement(me(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new ge(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = pe.get(e.strings);
		return t === void 0 && pe.set(e.strings, t = new I(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = re(e).nextSibling;
			re(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, z = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = P, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = P;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = L(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== N, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = L(this, r[n + o], t, o), s === N && (s = this._$AH[o]), a ||= !D(s) || s !== this._$AH[o], s === P ? e = P : e !== P && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === P ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, _e = class extends z {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === P ? void 0 : e;
	}
}, ve = class extends z {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== P);
	}
}, ye = class extends z {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = L(this, e, t, 0) ?? P) === N) return;
		let n = this._$AH, r = e === P && n !== P || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== P && (n === P || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, be = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		L(this, e);
	}
}, xe = x.litHtmlPolyfillSupport;
xe?.(I, R), (x.litHtmlVersions ??= []).push("3.3.3");
var Se = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new R(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, B = globalThis, V = class extends b {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Se(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return N;
	}
};
V._$litElement$ = !0, V.finalized = !0, B.litElementHydrateSupport?.({ LitElement: V });
var Ce = B.litElementPolyfillSupport;
Ce?.({ LitElement: V }), (B.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/custom-element.js
var we = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Te = {
	attribute: !0,
	type: String,
	converter: v,
	reflect: !1,
	hasChanged: y
}, Ee = (e = Te, t, n) => {
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
function De(e) {
	return (t, n) => typeof n == "object" ? Ee(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function H(e) {
	return De({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region src/helpers.ts
var U = (e) => `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`, W = (e) => /* @__PURE__ */ new Date(`${e}T12:00:00`);
function G(e, t) {
	let n = W(e);
	return n.setDate(n.getDate() + t), U(n);
}
function K(e, t, n) {
	if (t !== "month") return G(e, n * (t === "week" ? 7 : 1));
	let r = W(e), i = r.getDate();
	r.setDate(1), r.setMonth(r.getMonth() + n);
	let a = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
	return r.setDate(Math.min(i, a)), U(r);
}
function Oe(e) {
	try {
		return new Intl.DateTimeFormat(e || navigator.language).resolvedOptions().locale;
	} catch {
		return "en";
	}
}
function ke(e, t = "en") {
	if (e === "sunday") return 0;
	if (e === "monday") return 1;
	try {
		let e = new Intl.Locale(t);
		return (e.getWeekInfo?.() || e.weekInfo)?.firstDay % 7 || 0;
	} catch {
		return 1;
	}
}
function q(e, t = 1) {
	return G(e, -((W(e).getDay() - t + 7) % 7));
}
function Ae(e, t, n = 1) {
	if (t === "day") return [e];
	let r = q(t === "month" ? `${e.slice(0, 7)}-01` : e, n);
	return Array.from({ length: t === "month" ? 42 : 7 }, (e, t) => G(r, t));
}
function J(e) {
	if (!Number.isFinite(e)) return "—";
	let t = Math.floor(e), n = e - t, r = [
		[.25, "¼"],
		[1 / 3, "⅓"],
		[.5, "½"],
		[2 / 3, "⅔"],
		[.75, "¾"]
	].find(([e]) => Math.abs(n - e) < .008);
	return r ? `${t || ""}${r[1]}` : String(Math.round(e * 1e3) / 1e3);
}
function je(e) {
	return e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean).map((e) => {
		let t = e.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s{2,}(.+)$/), n = e.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)(?:\s+)(\S+)(?:\s+)(.+)$/), r = t || n || e.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s+(.+)$/);
		if (!r) return {
			amount: 1,
			unit: "",
			name: e
		};
		let [i, a] = r[1].split("/").map(Number);
		return {
			amount: a ? i / a : i,
			unit: t || !n ? "" : n[2],
			name: t ? t[2] : n ? n[3] : r[2]
		};
	});
}
function Me(e) {
	return e.map((e) => `${e.amount ?? 1} ${e.unit || ""} ${e.name || ""}`).join("\n");
}
function Ne(e, t = []) {
	let n = je(e), r = /* @__PURE__ */ new Set();
	return n.map((e, i) => {
		let a = t.findIndex((t, n) => !r.has(n) && t.name === e.name && (t.unit || "") === e.unit && Number(t.amount) === e.amount);
		return a < 0 && (a = t.findIndex((t, n) => !r.has(n) && t.name === e.name && (t.unit || "") === e.unit)), a < 0 && (a = t.findIndex((t, n) => !r.has(n) && t.name === e.name)), a < 0 && n.length === t.length && !r.has(i) && (a = i), a >= 0 && r.add(a), {
			...a >= 0 ? t[a] : {},
			...e
		};
	});
}
function Pe(e, t) {
	return e === "parent_admin" || e === "parent" && ![
		"manage_people",
		"manage_settings",
		"manage_calendar_sync"
	].includes(t) || e === "child" && [
		"manage_calendar_own",
		"manage_groceries",
		"manage_meal_plan",
		"complete_own_chores",
		"manage_recipes"
	].includes(t);
}
function Fe(e) {
	return Object.fromEntries([
		"title",
		"start",
		"end",
		"all_day",
		"person_ids",
		"description",
		"location",
		"recurrence",
		"exdates",
		"source_id",
		"external_id",
		"shared"
	].filter((t) => e[t] !== void 0).map((t) => [t, e[t]]));
}
function Ie(e) {
	return {
		...Object.fromEntries([
			"all_day",
			"person_ids",
			"description",
			"location",
			"recurrence",
			"shared"
		].filter((t) => e[t] !== void 0).map((t) => [t, e[t]])),
		title: `${e.title} (copy)`,
		start: e.occurrence_start || e.start,
		end: e.occurrence_end || e.end
	};
}
function Le(e, t, n, r = !1) {
	let i = r && n ? n : t;
	return e.find((e) => e.id === i)?.id || e.find((e) => e.id === n)?.id || e[0]?.id || "default";
}
function Re(e) {
	let t = e.match(/^#fo\/(calendar|groceries|chores|recipes|settings)(?:\/(.+))?$/);
	if (t) try {
		return {
			page: t[1],
			recipeId: t[1] === "recipes" ? decodeURIComponent(t[2] || "") : "",
			malformed: !1
		};
	} catch {
		return {
			page: t[1],
			recipeId: "",
			malformed: !0
		};
	}
}
function ze(e, t) {
	let n = String(e.created || e.due_date || t).slice(0, 10);
	if (t < n) return !1;
	let r = W(t);
	if (!e.schedule || e.schedule === "once") return t === (e.due_date || n);
	if (e.schedule === "daily") return !0;
	if (e.schedule === "weekly") return (e.weekdays || []).map(Number).includes((r.getDay() + 6) % 7);
	if (String(e.schedule).startsWith("weekly:")) return String(e.schedule).split(":")[1].split(",").includes(r.toLocaleDateString("en", { weekday: "long" }).toLowerCase());
	if (e.schedule === "monthly") return r.getDate() === Number(e.month_day || W(n).getDate());
	let i = Math.max(1, Number(e.interval_days || String(e.schedule).split(":")[1]) || 1);
	return Math.round((Date.UTC(r.getFullYear(), r.getMonth(), r.getDate()) - Date.UTC(W(n).getFullYear(), W(n).getMonth(), W(n).getDate())) / 864e5) % i === 0;
}
var Y = [
	"SU",
	"MO",
	"TU",
	"WE",
	"TH",
	"FR",
	"SA"
];
function Be(e) {
	if (!e) return !1;
	let t = e.replace(/^RRULE:/, "").split(";").filter(Boolean);
	if (t.some((e) => !/^[A-Z]+=[^=]+$/.test(e))) return !0;
	let n = Object.fromEntries(t.map((e) => e.split("="))), r = [
		"FREQ",
		"INTERVAL",
		"COUNT",
		"UNTIL",
		"BYDAY",
		"BYMONTH",
		"BYMONTHDAY",
		"WKST"
	];
	return Object.keys(n).length !== t.length || Object.keys(n).some((e) => !r.includes(e)) || ![
		"DAILY",
		"WEEKLY",
		"MONTHLY",
		"YEARLY"
	].includes(n.FREQ) || ["INTERVAL", "COUNT"].some((e) => n[e] && !/^[1-9]\d*$/.test(n[e])) || n.UNTIL && !/^\d{8}(T\d{6}Z?)?$/.test(n.UNTIL) || n.WKST && !Y.includes(n.WKST) || n.BYMONTH && n.BYMONTH.split(",").some((e) => !/^\d+$/.test(e) || Number(e) < 1 || Number(e) > 12) || n.BYMONTHDAY && n.BYMONTHDAY.split(",").some((e) => !/^-?\d+$/.test(e) || Number(e) === 0 || Math.abs(Number(e)) > 31) || n.BYDAY && n.BYDAY.split(",").some((e) => !/^(-?[1-5])?(SU|MO|TU|WE|TH|FR|SA)$/.test(e) || /\d/.test(e) && !["MONTHLY", "YEARLY"].includes(n.FREQ)) ? !0 : n.FREQ === "YEARLY" && !!(n.BYDAY || n.BYMONTHDAY) && !n.BYMONTH;
}
function Ve(e, t, n) {
	let r = /* @__PURE__ */ new Date(`${t}T00:00:00`), i = /* @__PURE__ */ new Date(`${G(n, 1)}T00:00:00`), a = [];
	for (let t of e) {
		let e = new Date(t.start?.length === 10 ? `${t.start}T00:00:00` : t.start), n = new Date(t.end?.length === 10 ? `${t.end}T00:00:00` : t.end || t.start);
		if (!Number.isFinite(e.getTime())) continue;
		let o = Math.max(0, n.getTime() - e.getTime()) || (t.all_day ? 864e5 : 0), s = Object.fromEntries(String(t.recurrence || "").replace(/^RRULE:/, "").split(";").filter(Boolean).map((e) => e.split("="))), c = !Be(t.recurrence), l = (s) => {
			let l = new Date(s.getTime() + o);
			if (t.all_day) {
				let t = Math.max(1, Math.round((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())) / 864e5));
				l.setTime(s.getTime()), l.setDate(l.getDate() + t);
			}
			s < i && (l > r || s >= r) && ((t.exdates || []).some((e) => e === U(s) || new Date(e).getTime() === s.getTime()) || a.push({
				...t,
				occurrence_start: s.toISOString(),
				occurrence_end: l.toISOString(),
				unsupported_recurrence: !c
			}));
		};
		if (!s.FREQ || !c) {
			l(e);
			continue;
		}
		let u = Math.max(1, Number(s.INTERVAL) || 1), d = Number(s.COUNT) || Infinity, ee = s.UNTIL ? new Date(s.UNTIL.replace(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/, (e, t, n, r, i, a, o, s) => `${t}-${n}-${r}T${i || "23"}:${a || "59"}:${o || "59"}${s || ""}`)) : i, f = s.BYDAY?.split(",") || [], p = s.BYMONTH?.split(",").map(Number), m = s.BYMONTHDAY?.split(",").map(Number), h = 0, g = new Date(e);
		for (let t = 0; t < 5e4 && g < i && g <= ee && h < d; t++, g.setDate(g.getDate() + 1)) {
			let t = U(g), n = U(e), r = Math.round((Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()) - Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())) / 864e5), i = (g.getFullYear() - e.getFullYear()) * 12 + g.getMonth() - e.getMonth(), a = s.WKST ? Math.max(0, Y.indexOf(s.WKST)) : 1, o = Math.round((W(q(t, a)).getTime() - W(q(n, a)).getTime()) / 6048e5), c = s.FREQ === "DAILY" ? r % u === 0 : s.FREQ === "WEEKLY" ? o % u === 0 : s.FREQ === "MONTHLY" ? i % u === 0 : (g.getFullYear() - e.getFullYear()) % u === 0;
			p ? c &&= p.includes(g.getMonth() + 1) : s.FREQ === "YEARLY" && (c &&= g.getMonth() === e.getMonth());
			let d = new Date(g.getFullYear(), g.getMonth() + 1, 0).getDate();
			m && (c &&= m.some((e) => g.getDate() === (e > 0 ? e : d + e + 1))), f.length ? c &&= f.some((e) => {
				let t = e.match(/^(-?\d+)?([A-Z]{2})$/);
				if (!t || Y[g.getDay()] !== t[2]) return !1;
				if (!t[1]) return !0;
				let n = Number(t[1]);
				return n > 0 ? Math.ceil(g.getDate() / 7) === n : -Math.ceil((d - g.getDate() + 1) / 7) === n;
			}) : s.FREQ === "WEEKLY" && (c &&= g.getDay() === e.getDay()), !m && !f.length && ["MONTHLY", "YEARLY"].includes(s.FREQ) && (c &&= g.getDate() === e.getDate()), c && (h++, l(new Date(g)));
		}
	}
	return a.sort((e, t) => e.occurrence_start.localeCompare(t.occurrence_start));
}
function X(e, t) {
	let n = (/* @__PURE__ */ new Date(`${t}T00:00:00`)).getTime(), r = (/* @__PURE__ */ new Date(`${G(t, 1)}T00:00:00`)).getTime();
	return e.filter((e) => {
		let t = new Date(e.occurrence_start || e.start).getTime(), i = new Date(e.occurrence_end || e.end || e.start).getTime();
		return t < r && (i > n || t >= n && t === i);
	});
}
function He(e) {
	let t = [...e].sort((e, t) => e.occurrence_start.localeCompare(t.occurrence_start)), n = [], r = [], i = [], a = 0, o = () => {
		r.forEach((e) => e.columns = i.length), n.push(...r), r = [], i = [], a = 0;
	};
	for (let e of t) {
		let t = new Date(e.occurrence_start).getTime(), n = Math.max(t + 18e5, new Date(e.occurrence_end).getTime());
		r.length && t >= a && o();
		let s = i.findIndex((e) => e <= t);
		s < 0 && (s = i.length), i[s] = n, a = Math.max(a, n), r.push({
			event: e,
			lane: s,
			columns: 1
		});
	}
	return o(), n;
}
//#endregion
//#region src/styles.ts
var Ue = o`
  :host { display:block; min-height:100vh; font:14px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif; color:var(--primary-text-color,#30352e); }
  * { box-sizing:border-box; }
  .app { --bg:var(--primary-background-color,#f5f6f2); --surface:var(--card-background-color,#fff); --text:var(--primary-text-color,#30352e); --muted:var(--secondary-text-color,#6b7368); --line:var(--divider-color,#e4e7df); --soft:var(--secondary-background-color,#f2f4ee); --orange:#c45013; --orange-soft:color-mix(in srgb,var(--orange) 10%,var(--surface)); --green:#357451; --shadow:0 6px 28px #14261108; display:flex; position:relative; min-height:100vh; background:var(--bg); color:var(--text); }
  .app[data-theme=light] { --bg:#f6f7f3; --surface:#fff; --text:#30352e; --muted:#687165; --line:#e3e7dd; --soft:#f1f4ed; }
  .app[data-theme=dark] { --bg:#171c1b; --surface:#232b28; --text:#eff2ec; --muted:#bbc5bc; --line:#3c4740; --soft:#2e3832; --orange:#ffac75; --orange-soft:#3d3025; --green:#8dd4a6; --shadow:0 6px 28px #0002; }
  button,input,select,textarea { font:inherit; color:inherit; }
  button,a,input,select,textarea,summary { -webkit-tap-highlight-color:transparent; }
  button,.button-link { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 13px; border:1px solid var(--line); border-radius:9px; background:var(--surface); color:var(--text); cursor:pointer; font-weight:600; text-decoration:none; transition:background .15s,border-color .15s; }
  button:hover:not(:disabled),.button-link:hover { background:var(--soft); border-color:color-mix(in srgb,var(--text) 28%,var(--line)); }
  button:disabled { opacity:.5; cursor:not-allowed; }
  button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible { outline:3px solid var(--orange); outline-offset:3px; }
  input,select,textarea { width:100%; min-height:40px; padding:9px 11px; background:var(--surface); border:1px solid var(--line); border-radius:8px; }
  input[type=checkbox] { width:19px; height:19px; min-height:19px; padding:0; accent-color:var(--orange); flex-shrink:0; }
  input[type=color] { padding:4px; }
  input[type=date] { min-width:140px; width:auto; color-scheme:light dark; }
  [data-theme=light] input { color-scheme:light; }
  [data-theme=dark] input { color-scheme:dark; }
  textarea { resize:vertical; }
  label { display:flex; flex-direction:column; gap:6px; font-weight:600; font-size:13px; }
  h1,h2,h3,p { margin:0; }
  h1 { font-size:30px; letter-spacing:-1px; font-weight:750; line-height:1.25; }
  h2 { font-size:22px; letter-spacing:-.55px; line-height:1.35; }
  h3 { font-size:17px; letter-spacing:-.25px; }
  p { margin:8px 0; }
  small { font-size:12px; }
  hr { border:0; border-top:1px solid var(--line); margin:25px 0; }
  .muted { color:var(--muted); font-weight:400; }
  .eyebrow { font-size:10px; letter-spacing:1.7px; color:var(--muted); font-weight:750; text-transform:uppercase; }
  .primary,.quick-add { background:#c45013; color:#fff; border-color:#c45013; box-shadow:0 3px 8px #c4501318; }
  .primary:hover:not(:disabled),.quick-add:hover:not(:disabled) { background:#a83d08; border-color:#a83d08; }
  .danger { color:var(--error-color,#bb342f); }
  [data-theme=dark] .danger { color:#ffb4ab; }
  .danger-primary { color:#fff; background:#af302c; border-color:#af302c; }
  .icon-button { min-width:38px; padding:5px 10px; font-size:21px; line-height:1; }
  .text-button { padding:0; min-height:28px; background:none; border:0; font-size:12px; justify-content:flex-start; }
  .subtle { border:0; background:none; color:var(--muted); }
  .wide { width:100%; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .skip-link { position:fixed; top:-80px; left:220px; background:var(--surface); color:var(--text); padding:12px; z-index:100; }
  .skip-link:focus { top:10px; }
  .sidebar { width:220px; min-width:220px; padding:30px 18px 20px; background:var(--surface); border-right:1px solid var(--line); position:sticky; height:100vh; top:0; display:flex; flex-direction:column; }
  .brand { display:flex; align-items:center; gap:11px; text-decoration:none; color:var(--text); font-size:18px; line-height:1.2; letter-spacing:-.4px; padding:0 8px; }
  .brand-symbol { width:42px; height:44px; border-radius:13px; background:var(--orange-soft); color:var(--orange); display:grid; place-items:center; font-size:31px; }
  .sidebar>.eyebrow { margin:94px 11px 12px; font-size:9px; }
  .sidebar nav { display:flex; flex-direction:column; gap:7px; }
  .sidebar nav button { justify-content:flex-start; gap:11px; padding:12px; border:0; background:none; font-size:13px; color:var(--muted); }
  .sidebar nav button.active { color:var(--orange); background:var(--orange-soft); }
  .nav-icon { font-size:22px; width:25px; text-align:center; }
  .sidebar-family { margin-top:auto; padding:24px 10px 17px; border-bottom:1px solid var(--line); }
  .avatar-stack { display:flex; margin-top:15px; padding-left:3px; flex-wrap:wrap; }
  .avatar-stack .avatar { border:2px solid var(--surface); margin-left:-3px; width:33px; height:33px; }
  .sidebar-family p { font-size:11px; color:var(--muted); margin-top:10px; }
  .sidebar-note { color:var(--muted); padding:18px 10px 0; font-size:10px; }
  .sidebar-ha-menu { margin:14px 5px 0; min-height:44px; justify-content:flex-start; font-size:12px; color:var(--muted); border:0; background:none; }
  .ha-menu-icon { display:inline-block; position:relative; width:20px; height:16px; border-top:2px solid currentColor; border-bottom:2px solid currentColor; }
  .ha-menu-icon:after { content:""; position:absolute; left:0; right:0; top:5px; height:2px; background:currentColor; }
  .workspace { width:calc(100% - 220px); min-width:0; }
  .topbar { padding:30px 32px 22px; display:flex; align-items:center; justify-content:space-between; gap:20px; }
  .topbar h1 { margin-top:4px; }
  .topbar p { color:var(--muted); margin-bottom:0; font-size:13px; }
  .quick-add { position:absolute; top:104px; left:30px; width:160px; z-index:25; flex-shrink:0; border-radius:12px; padding:9px 17px; }
  .quick-add>span { font-size:26px; font-weight:400; line-height:1; }
  main { padding:0 32px 38px; outline:none; max-width:1800px; margin:auto; }
  .mobile-nav { display:none; }
  .banner { display:flex; justify-content:space-between; align-items:center; gap:14px; padding:12px 17px; border-radius:10px; margin-bottom:16px; background:var(--soft); border:1px solid var(--line); }
  .banner.error { color:var(--error-color,#bc302b); background:color-mix(in srgb,var(--error-color,#bc302b) 9%,var(--surface)); overflow-wrap:anywhere; }
  [data-theme=dark] .banner.error { color:#ffb4ab; }
  .banner.success { color:var(--green); }
  .saving { color:var(--muted); }
  .surface,.calendar-surface,.agenda { background:var(--surface); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); }
  .surface { padding:24px; }
  .surface-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:20px; }
  .surface-heading h2 { margin-top:5px; }
  .section-toolbar { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin:0 0 20px; }
  .date-navigation,.toolbar-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .date-navigation h2 { margin-left:9px; font-size:21px; }
  .segmented { display:inline-flex; background:var(--soft); border:1px solid var(--line); border-radius:10px; padding:3px; }
  .segmented button { min-height:32px; border:0; background:transparent; color:var(--muted); padding:5px 13px; font-size:12px; }
  .segmented button.active { background:var(--surface); color:var(--text); box-shadow:0 1px 4px #0001; }
  .family-filters { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:18px; }
  .chip { border-radius:24px; font-size:12px; min-height:36px; padding:4px 12px 4px 5px; font-weight:550; }
  .chip:first-child { padding-left:13px; }
  .chip.active { color:var(--orange); border-color:var(--orange); background:var(--orange-soft); }
  .avatar { display:inline-grid; place-items:center; width:29px; height:29px; min-width:29px; border-radius:50%; object-fit:cover; vertical-align:middle; }
  .fallback { background:var(--person-color,#64748b); color:#fff; font-size:10px; font-weight:750; text-shadow:0 1px 2px #0007; box-shadow:inset 0 0 0 1px #0001; }
  .calendar-shell { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:20px; align-items:start; }
  .calendar-shell.overview-left { grid-template-columns:250px minmax(0,1fr); }
  .overview-left .agenda { order:-1; }
  .calendar-shell.overview-closed,.calendar-shell.overview-left.overview-closed { grid-template-columns:minmax(0,1fr); }
  .overview-closed .agenda { order:2; padding:5px 14px; }
  .calendar-surface { overflow:hidden; }
  .weekday-row { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); background:var(--soft); border-bottom:1px solid var(--line); }
  .weekday-row span { padding:13px 7px; text-align:center; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; font-weight:700; }
  .month-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); }
  .month-cell { position:relative; min-height:120px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); padding:7px 5px; background:var(--surface); }
  .month-cell:nth-child(7n) { border-right:0; }
  .month-cell:nth-last-child(-n+7) { border-bottom:0; }
  .month-cell.outside { background:color-mix(in srgb,var(--soft) 70%,var(--surface)); }
  .outside .day-number { color:var(--muted); }
  .month-cell.selected { box-shadow:inset 0 0 0 2px var(--orange); background:color-mix(in srgb,var(--orange) 3%,var(--surface)); }
  .cell-heading { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; pointer-events:none; margin-bottom:6px; }
  .cell-heading button { pointer-events:auto; }
  .day-number { border:0; background:none; border-radius:50%; width:27px; min-height:27px; padding:0; font-size:11px; }
  .day-number.today,.time-header .today { background:#c45013; color:#fff; border-radius:50%; }
  .date-add { padding:0 5px; min-height:27px; font-size:16px; border:0; background:transparent; color:var(--muted); opacity:0; }
  .month-cell:hover .date-add,.date-add:focus-visible { opacity:1; }
  .cell-create { position:absolute; inset:0; border:0; border-radius:0; background:none; width:100%; opacity:1!important; }
  .cell-create:hover:not(:disabled) { background:color-mix(in srgb,var(--orange) 3%,transparent); }
  .cell-events { position:relative; z-index:2; pointer-events:none; }
  .cell-events>* { pointer-events:auto; }
  .event-chip { display:flex; justify-content:flex-start; align-items:flex-start; gap:4px; width:100%; min-height:22px; padding:3px 5px; margin:2px 0; font-size:10px; line-height:1.35; border:0; border-left:3px solid var(--event-color); border-radius:4px; background:color-mix(in srgb,var(--event-color) 12%,var(--surface)); overflow:hidden; text-align:left; font-weight:400; }
  .event-chip>span:nth-child(2) { overflow:hidden; text-overflow:ellipsis; }
  .event-chip strong { font-weight:600; }
  .event-chip:hover:not(:disabled) { background:color-mix(in srgb,var(--event-color) 22%,var(--surface)); }
  .event-dot { display:inline-block; background:var(--event-color,var(--orange)); height:6px; width:6px; min-width:6px; border-radius:50%; margin-top:4px; }
  .event-chip .event-dot { display:none; }
  .all-day-event { border-left:0; background:color-mix(in srgb,var(--event-color) 20%,var(--surface)); }
  .more-events { min-height:22px; padding:2px 5px; border:0; color:var(--muted); background:none; font-size:10px; }
  .agenda { padding:17px; }
  .agenda-toggle { border:0; padding:0 0 13px; margin-bottom:13px; border-bottom:1px solid var(--line); border-radius:0; justify-content:space-between; background:none; width:100%; color:var(--muted); font-size:11px; }
  .overview-closed .agenda-toggle { border:0; padding:5px 0; margin:0; }
  .agenda h2 { font-size:22px; margin-top:7px; }
  .agenda .muted { font-size:11px; }
  .agenda-events { margin:20px 0; }
  .agenda-event { width:100%; padding:10px 11px; margin:10px 0; align-items:flex-start; display:flex; flex-direction:column; gap:5px; border:1px solid var(--line); border-left:3px solid var(--event-color); text-align:left; font-size:12px; }
  .event-time { color:var(--muted); font-size:12px; font-weight:600; }
  .event-start { font-size:11px; font-weight:700; white-space:nowrap; }
  .event-people { display:flex; gap:5px; flex-wrap:wrap; }
  .agenda-event .avatar { width:23px; height:23px; min-width:23px; }
  .agenda>.primary { width:100%; font-size:12px; }
  .calendar-hint { color:var(--muted); font-size:11px; margin-top:16px; }
  .recurrence-warning { display:block; font-size:12px; }
  .recurrence-warning code { overflow-wrap:anywhere; white-space:normal; }
  .recurrence-warning ul { margin:10px 0 0; padding-left:20px; }
  .time-scroll { overflow:auto; max-height:740px; }
  .time-calendar { min-width:calc(55px + var(--days) * 100px); }
  .time-header,.all-day-row { display:grid; grid-template-columns:55px repeat(var(--days),minmax(0,1fr)); }
  .time-header { background:var(--surface); position:sticky; top:0; z-index:30; border-bottom:1px solid var(--line); }
  .time-header button { border:0; border-right:1px solid var(--line); border-radius:0; flex-direction:column; padding:8px; font-weight:400; }
  .time-header button.active { background:var(--orange-soft); }
  .time-header button strong { font-size:18px; min-width:30px; }
  .all-day-row { min-height:45px; border-bottom:1px solid var(--line); background:var(--soft); }
  .all-day-row>span { font-size:9px; color:var(--muted); padding:9px 4px; }
  .all-day-row>div { padding:5px; border-left:1px solid var(--line); }
  .all-day-row .subtle { padding:0 6px; min-height:24px; }
  .time-body { display:grid; grid-template-columns:55px repeat(var(--days),minmax(0,1fr)); }
  .time-labels span { display:block; height:52px; padding:0 4px; font-size:9px; color:var(--muted); }
  .time-column { position:relative; border-left:1px solid var(--line); }
  .hour-slot { display:block; width:100%; height:52px; min-height:52px; border:0; border-bottom:1px solid var(--line); border-radius:0; background:none; padding:0; }
  .positioned-events { position:absolute; inset:0; pointer-events:none; }
  .positioned-events .event-chip { position:absolute; margin:0; pointer-events:auto; font-size:10px; }
  .now-line { position:absolute; left:0; right:0; height:1px; background:#d64238; z-index:25; pointer-events:none; }
  .now-line:before { content:""; position:absolute; left:-3px; top:-3px; width:7px; height:7px; border-radius:50%; background:#d64238; }
  .empty { padding:35px 20px; text-align:center; color:var(--muted); }
  .empty h3,.empty h2 { color:var(--text); margin:7px 0; }
  .empty p { max-width:420px; margin:8px auto 18px; font-size:13px; }
  .empty-icon { display:inline-grid; place-items:center; width:46px; height:46px; font-size:27px; color:var(--orange); border-radius:50%; background:var(--orange-soft); }
  .agenda .empty { padding:16px 0; }
  .agenda .empty h3 { font-size:14px; }
  .agenda .empty p { font-size:11px; }
  .loading { padding:100px 20px; }
  .spinner { display:inline-block; width:32px; height:32px; border:3px solid var(--line); border-top-color:var(--orange); border-radius:50%; animation:spin 1s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .shopping-layout { display:grid; grid-template-columns:minmax(0,1fr) 260px; gap:22px; }
  .shopping-aside { display:flex; flex-direction:column; align-items:stretch; align-self:start; gap:10px; }
  .shopping-aside h3 { margin-top:6px; }
  .shopping-aside p { font-size:12px; }
  .list-tabs { display:flex; gap:6px; flex-wrap:wrap; border-bottom:1px solid var(--line); padding-bottom:15px; margin-bottom:16px; }
  .list-tabs button { font-size:12px; border:0; background:var(--soft); }
  .list-tabs button.active { color:var(--orange); background:var(--orange-soft); }
  .list-tools { display:flex; flex-wrap:wrap; gap:15px; align-items:center; margin-bottom:15px; }
  .list-tools label:not(.check) { min-width:140px; }
  .list-tools>button { margin-left:auto; font-size:11px; }
  .check { display:flex; flex-direction:row; align-items:center; gap:8px; font-weight:450; }
  .grocery-row { display:flex; gap:13px; align-items:center; padding:15px 0; border-bottom:1px solid var(--line); }
  .grocery-row:last-child { border-bottom:0; }
  .row-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:4px; overflow-wrap:anywhere; }
  .row-copy>.muted { font-size:12px; }
  .grocery-row.checked .row-copy strong { text-decoration:line-through; color:var(--muted); }
  .grocery-row>.icon-button { border:0; background:transparent; }
  .store-heading { background:var(--soft); padding:9px 12px; margin:12px -7px 0; border-radius:7px; font-size:12px; }
  .meal-heading { margin:32px 0 20px; }
  .meal-heading h2 { margin-top:5px; }
  .meal-heading .date-navigation>span { color:var(--muted); font-size:12px; margin-left:5px; }
  .meal-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:10px; }
  .meal-day { background:var(--surface); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .meal-day>header { background:var(--soft); padding:13px; display:flex; flex-direction:column; border-bottom:1px solid var(--line); }
  .meal-day>header>span { font-size:11px; text-transform:uppercase; color:var(--muted); }
  .meal-day>header>strong { font-size:21px; }
  .meal-today { border-color:var(--orange); }
  .meal-today>header { background:var(--orange-soft); color:var(--orange); }
  .meal-slot { min-height:128px; padding:12px 9px; border-bottom:1px solid var(--line); display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
  .meal-slot:last-child { border-bottom:0; }
  .meal-slot>.eyebrow { font-size:8px; letter-spacing:1px; }
  .meal-title { display:flex; flex-direction:column; align-items:flex-start; text-align:left; border:0; background:none; padding:0; border-radius:4px; font-size:12px; overflow-wrap:anywhere; }
  .meal-title small { font-size:10px; font-weight:400; color:var(--muted); }
  .meal-empty { margin-top:10px; padding:4px 7px; border:1px dashed var(--line); color:var(--muted); font-size:11px; font-weight:400; }
  .meal-slot .text-button { min-height:20px; font-size:10px; }
  .chore-layout { display:grid; grid-template-columns:minmax(0,1fr) 330px; gap:22px; }
  .chore-card { display:flex; flex-wrap:wrap; gap:12px; align-items:center; padding:17px 0; border-bottom:1px solid var(--line); }
  .chore-card>.row-copy { min-width:150px; }
  .chore-symbol { width:40px; height:40px; border-radius:12px; background:var(--orange-soft); color:var(--orange); display:grid; place-items:center; font-size:22px; }
  .chore-symbol ha-icon { --mdc-icon-size:22px; width:22px; height:22px; }
  .chore-symbol ha-icon:not(:defined) { display:none; }
  .chore-symbol ha-icon:defined+.chore-icon-fallback { display:none; }
  .chore-card.done .chore-symbol { background:color-mix(in srgb,var(--green) 15%,var(--surface)); color:var(--green); }
  .chore-card.overdue .chore-symbol { color:var(--error-color,#b33930); }
  .assignee { display:flex; align-items:center; gap:7px; color:var(--muted); font-size:11px; margin-top:4px; }
  .assignee .avatar { width:22px; height:22px; min-width:22px; font-size:8px; }
  .points-badge { color:var(--orange); background:var(--orange-soft); padding:4px 8px; border-radius:7px; font-size:11px; font-weight:650; }
  .chore-card button { font-size:11px; }
  .chore-card .icon-button { font-size:19px; padding:4px; min-width:25px; border:0; }
  .leaderboard { align-self:start; }
  .leaderboard h2 { margin:9px 0 20px; }
  .leaderboard>.segmented { display:flex; }
  .leaderboard>.segmented button { flex:1; }
  .leaderboard>.muted { font-size:11px; margin:14px 0; }
  .score-row { display:flex; align-items:center; gap:10px; margin:23px 0; }
  .rank { width:15px; color:var(--orange); }
  .score-row .row-copy { font-size:12px; }
  .score-row progress { width:100%; height:6px; accent-color:var(--orange); border:0; overflow:hidden; border-radius:5px; }
  progress::-webkit-progress-bar { background:var(--soft); }
  progress::-webkit-progress-value { background:var(--orange); border-radius:5px; }
  progress::-moz-progress-bar { background:var(--orange); }
  .score-row>strong { font-size:15px; }
  .score-row>strong>small { display:block; font-size:10px; color:var(--muted); font-weight:400; }
  .prior-winner { display:flex; align-items:center; gap:12px; padding:16px; border-radius:9px; background:var(--orange-soft); margin-top:24px; font-size:12px; }
  .prior-winner>span { font-size:25px; color:var(--orange); }
  .prior-winner p { margin:4px 0 0; color:var(--muted); font-size:11px; }
  .history { margin-top:23px; }
  .compact-row { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--line); }
  .compact-row:last-child { border-bottom:0; }
  .compact-row>time { font-size:11px; color:var(--muted); }
  .compact-row>strong { font-size:12px; }
  .compact-row button { font-size:11px; }
  .all-chores { margin-top:20px; }
  summary { cursor:pointer; font-weight:600; }
  .recipe-toolbar { display:flex; gap:15px; align-items:flex-end; margin:22px 0; }
  .search-label { flex:1; max-width:430px; }
  .recipe-toolbar>label:not(.search-label) { min-width:180px; }
  .recipe-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:22px; }
  .recipe-grid>.empty { grid-column:1/-1; }
  .recipe-card { display:block; padding:0; overflow:hidden; text-align:left; border-radius:14px; box-shadow:var(--shadow); }
  .recipe-card>img,.recipe-placeholder { width:100%; height:175px; object-fit:cover; background:var(--soft); }
  .recipe-placeholder { display:flex; align-items:center; justify-content:center; flex-direction:column; color:var(--green); font-size:62px; font-weight:400; }
  .recipe-placeholder span { font-size:9px; letter-spacing:2px; margin-top:4px; }
  .recipe-card:nth-child(3n+2) .recipe-placeholder { background:var(--orange-soft); color:var(--orange); }
  .recipe-card-copy { padding:20px; }
  .recipe-card h3 { margin:8px 0 7px; font-size:20px; }
  .recipe-card .muted { font-size:12px; }
  .tags { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 0; }
  .tags>span { background:var(--soft); color:var(--muted); padding:4px 8px; border-radius:5px; font-size:10px; font-weight:450; }
  .recipe-hero { display:grid; grid-template-columns:330px 1fr; align-items:center; gap:36px; margin:26px 0; }
  .recipe-hero>img,.recipe-hero-art { width:100%; height:250px; object-fit:cover; border-radius:15px; }
  .recipe-hero-art { display:grid; place-items:center; background:var(--orange-soft); color:var(--orange); font-size:100px; }
  .recipe-hero h2 { margin:10px 0; font-size:34px; letter-spacing:-1px; }
  .recipe-hero .primary { margin-top:15px; }
  .recipe-detail-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:25px; align-items:start; }
  .ingredient-panel>.muted { font-size:12px; }
  .serving-control { display:flex; align-items:center; gap:4px; }
  .serving-control input { width:65px; text-align:center; padding:7px 4px; }
  .serving-control button { padding:5px 10px; }
  .ingredient-row { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:15px 0; border-bottom:1px solid var(--line); font-size:12px; }
  .ingredient-row>.check { flex:1; }
  .ingredient-row select { width:120px; font-size:11px; padding:6px; }
  .ingredient-panel>.primary { margin-top:20px; }
  .method-panel h3 { margin:8px 0 20px; }
  .method-panel ol { counter-reset:steps; list-style:none; padding:0; margin:0; }
  .method-panel li { counter-increment:steps; display:flex; gap:15px; padding:17px 0; border-bottom:1px solid var(--line); white-space:pre-line; }
  .method-panel li:before { content:counter(steps); display:inline-grid; place-items:center; width:29px; height:29px; min-width:29px; border-radius:50%; background:var(--orange-soft); color:var(--orange); font-weight:700; font-size:12px; }
  .settings-intro { margin-bottom:26px; }
  .settings-intro h2 { margin:8px 0; }
  .people-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:15px; }
  .people-grid>.empty { grid-column:1/-1; }
  .person-card { display:flex; align-items:center; gap:13px; padding:18px; }
  .person-card>.avatar { width:43px; height:43px; min-width:43px; font-size:14px; }
  .person-card h3 { font-size:16px; }
  .person-card p { font-size:10px; margin:0; }
  .person-card small { font-size:10px; }
  .person-card button { font-size:11px; }
  .settings-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:23px; margin-top:28px; align-items:start; }
  .settings-grid h3 { margin:9px 0; }
  dl { margin:19px 0; }
  dl>div { display:flex; gap:15px; padding:10px 0; border-bottom:1px solid var(--line); font-size:12px; }
  dt { min-width:110px; font-weight:600; }
  dd { margin:0; color:var(--muted); overflow-wrap:anywhere; }
  .theme-options { display:flex; gap:10px; margin:20px 0; }
  .theme-options>button { flex:1; display:flex; flex-direction:column; padding:15px 8px; }
  .theme-options>button>span { font-size:25px; font-weight:400; }
  .theme-options>button.active { color:var(--orange); border-color:var(--orange); background:var(--orange-soft); }
  .editor-dialog { color:var(--text); background:var(--surface); border:1px solid var(--line); border-radius:18px; box-shadow:0 25px 100px #0004; width:620px; max-width:calc(100vw - 32px); max-height:calc(100dvh - 40px); padding:0; overflow:auto; }
  .editor-dialog::backdrop { background:#11231c80; backdrop-filter:blur(3px); }
  .dialog-heading { padding:23px 25px; display:flex; align-items:center; gap:20px; justify-content:space-between; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--surface); z-index:2; }
  .dialog-heading h2 { margin-top:5px; font-size:23px; overflow-wrap:anywhere; }
  .dialog-heading>.icon-button { border:0; color:var(--muted); font-size:28px; }
  .editor-dialog>.banner { margin:15px 24px 0; }
  .dialog-content { padding:24px; }
  .form-fields { padding:24px; border:0; margin:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; min-width:0; }
  .form-fields fieldset { border:1px solid var(--line); border-radius:10px; padding:15px; min-width:0; }
  .form-fields legend { font-size:12px; font-weight:600; padding:0 5px; }
  .form-field { display:flex; flex-direction:column; gap:6px; }
  .full { grid-column:1/-1; }
  .checkbox-group { display:flex; flex-wrap:wrap; gap:13px 20px; }
  .checkbox-group .check { font-size:12px; }
  .permissions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
  .permissions label { text-transform:capitalize; font-size:11px; }
  .dialog-footer { padding:17px 24px; border-top:1px solid var(--line); display:flex; align-items:center; gap:10px; position:sticky; bottom:0; background:var(--surface); z-index:2; }
  .dialog-footer>.muted { margin-right:auto; font-size:11px; }
  .quick-menu { display:flex; flex-direction:column; gap:10px; }
  .quick-menu button { justify-content:flex-start; border:1px solid var(--line); padding:16px; text-align:left; border-radius:12px; }
  .quick-menu button>span:nth-child(2) { flex:1; }
  .quick-menu strong { display:block; font-size:14px; }
  .quick-menu small { display:block; color:var(--muted); font-weight:400; font-size:11px; margin-top:3px; }
  .quick-icon { width:40px; height:40px; display:grid; place-items:center; color:var(--orange); background:var(--orange-soft); border-radius:11px; font-size:23px; }
  .event-detail { display:flex; align-items:center; gap:18px; }
  .detail-date { border:1px solid var(--event-color); background:color-mix(in srgb,var(--event-color) 12%,var(--surface)); border-radius:10px; display:flex; align-items:center; flex-direction:column; padding:8px 18px; }
  .detail-date>span { font-size:12px; text-transform:uppercase; color:var(--muted); }
  .detail-date>strong { font-size:29px; }
  .event-description { white-space:pre-wrap; margin:25px 0; }
  .detail-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; }
  .detail-actions .danger { margin-left:auto; }
  .category-list { margin-top:20px; }
  @media(min-width:1600px) { .month-cell { min-height:145px; } .calendar-shell { grid-template-columns:minmax(0,1fr) 280px; } .calendar-shell.overview-left { grid-template-columns:280px minmax(0,1fr); } }
  @media(max-width:1200px) { .sidebar { width:190px; min-width:190px; padding:25px 12px 15px; } .quick-add { left:24px; top:96px; width:142px; font-size:12px; } .workspace { width:calc(100% - 190px); } .topbar { padding:24px; } main { padding:0 24px 30px; } .calendar-shell,.calendar-shell.overview-left { grid-template-columns:minmax(0,1fr); } .calendar-shell .agenda { order:2; } .agenda-events { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:15px 0; } .agenda-event { margin:0; } .agenda>.primary { width:auto; } .agenda .empty { grid-column:1/-1; } .month-cell { min-height:118px; } .shopping-layout { grid-template-columns:minmax(0,1fr) 220px; } .chore-layout { grid-template-columns:minmax(0,1fr) 285px; } .meal-grid { overflow-x:auto; grid-template-columns:repeat(7,minmax(140px,1fr)); padding-bottom:8px; } }
  @media(max-width:950px) { .sidebar { width:170px; min-width:170px; } .quick-add { left:20px; width:130px; } .workspace { width:calc(100% - 170px); } .brand { font-size:15px; gap:7px; } .brand-symbol { width:34px; height:38px; font-size:26px; } .sidebar nav button { font-size:11px; gap:7px; } .sidebar>.eyebrow { font-size:8px; } .shopping-layout,.chore-layout,.settings-grid { grid-template-columns:minmax(0,1fr); } .shopping-list { padding:20px; } .chore-layout .leaderboard { order:2; } .leaderboard .score-row { margin:16px 0; } .recipe-detail-grid { grid-template-columns:minmax(0,1fr); } .recipe-hero { grid-template-columns:230px 1fr; gap:22px; } .recipe-hero>img,.recipe-hero-art { height:210px; } .recipe-hero h2 { font-size:28px; } .date-navigation h2 { font-size:19px; } .section-toolbar { gap:12px; } .recipe-toolbar { flex-wrap:wrap; } .search-label { min-width:220px; } }
  @media(max-width:700px) {
    .sidebar { display:none; } .workspace { width:100%; } .topbar { padding:23px 130px 21px 16px; align-items:flex-start; gap:10px; } .topbar h1 { font-size:26px; } .topbar p { font-size:11px; max-width:240px; } .topbar .eyebrow { font-size:9px; letter-spacing:1px; } .quick-add { top:43px; left:auto; right:16px; width:auto; padding:8px 11px; font-size:11px; min-height:39px; margin-top:0; } .quick-add>span { font-size:21px; }
    .event-start { font-size:9px; }
    main { padding:0 14px 100px; } .mobile-nav { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); position:fixed; bottom:0; left:0; right:0; padding:6px 4px max(6px,env(safe-area-inset-bottom)); background:var(--surface); border-top:1px solid var(--line); z-index:40; box-shadow:0 -3px 15px #00006; } .mobile-nav button { background:none; border:0; padding:4px 1px; flex-direction:column; gap:1px; color:var(--muted); font-size:9px; font-weight:500; min-height:50px; } .mobile-nav button>span { font-size:21px; line-height:1.2; } .mobile-nav button.active { color:var(--orange); background:var(--orange-soft); }
    .mobile-nav .ha-shell-menu { gap:6px; } .mobile-nav .ha-shell-menu>span:last-child { font-size:9px; line-height:1.2; }
    .skip-link { left:10px; } .family-filters { gap:6px; margin-bottom:14px; } .chip { font-size:11px; min-height:33px; padding-right:9px; } .chip .avatar { width:24px; height:24px; min-width:24px; font-size:9px; } .section-toolbar { margin-bottom:15px; } .date-navigation h2 { width:100%; margin:7px 0 0; font-size:22px; order:2; } .toolbar-actions { width:100%; justify-content:space-between; } .segmented button { padding:5px 11px; } .calendar-shell { gap:15px; } .calendar-surface { border-radius:11px; } .month-cell { min-height:101px; padding:4px 2px; } .weekday-row span { padding:10px 2px; font-size:9px; letter-spacing:0; } .day-number { width:25px; min-height:25px; font-size:10px; } .date-add { display:none; } .event-chip { padding:2px 3px; font-size:8px; min-height:21px; gap:2px; border-left-width:2px; } .event-chip>span:nth-child(2) { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-clamp:2; } .event-chip>span:last-child:not(:nth-child(2)) { display:none; } .more-events { font-size:8px; padding:1px 2px; } .agenda { padding:18px; } .agenda>.primary { width:100%; } .agenda .muted { font-size:12px; } .agenda-events { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); } .calendar-hint { font-size:10px; } .time-scroll { max-height:650px; } .time-calendar { min-width:calc(50px + var(--days) * 95px); }
    .surface { padding:18px; border-radius:12px; } .surface-heading { flex-wrap:wrap; margin-bottom:17px; } .surface-heading .primary { font-size:12px; } .surface-heading h2 { font-size:21px; } .list-tabs { gap:5px; } .list-tabs button { padding:7px 10px; font-size:11px; } .grocery-row { gap:8px; } .grocery-row .avatar { width:23px; height:23px; min-width:23px; font-size:8px; } .grocery-row .row-copy strong { font-size:13px; } .grocery-row .row-copy>.muted { font-size:10px; } .grocery-row .icon-button { min-width:28px; padding:4px; font-size:18px; } .list-tools { gap:12px; } .list-tools>.check { font-size:11px; } .list-tools>button { margin-left:0; } .meal-heading h2 { font-size:22px; } .meal-grid { gap:8px; grid-template-columns:repeat(7,145px); } .meal-slot { min-height:120px; }
    .chore-card { gap:9px; } .chore-card>.row-copy { min-width:140px; } .chore-symbol { width:34px; height:34px; } .chore-card>.primary { margin-left:43px; } .chore-card>.points-badge { margin-left:auto; } .compact-row { flex-wrap:wrap; } .compact-row>time { font-size:10px; } .history .compact-row>.row-copy { min-width:170px; } .recipe-grid { grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; } .recipe-card>img,.recipe-placeholder { height:130px; } .recipe-placeholder { font-size:45px; } .recipe-placeholder>span { font-size:7px; letter-spacing:1px; } .recipe-card-copy { padding:14px; } .recipe-card h3 { font-size:17px; } .recipe-card .eyebrow { font-size:8px; letter-spacing:1px; } .recipe-card .muted { font-size:10px; } .recipe-card .tags>span { font-size:9px; } .recipe-toolbar { gap:10px; } .recipe-toolbar>label:not(.search-label) { min-width:150px; } .recipe-toolbar>button { font-size:11px; } .search-label { width:100%; max-width:none; min-width:100%; } .recipe-hero { grid-template-columns:1fr; gap:18px; } .recipe-hero>img,.recipe-hero-art { height:230px; } .recipe-hero h2 { font-size:29px; } .ingredient-row { gap:10px; } .ingredient-row select { width:110px; } .people-grid { grid-template-columns:minmax(0,1fr); } .person-card { padding:15px; gap:10px; } .person-card>.avatar { width:37px; height:37px; min-width:37px; } .person-card>.icon-button { padding:2px; min-width:25px; } .settings-grid { gap:16px; } .theme-options { gap:8px; } dl>div { font-size:11px; } dt { min-width:90px; }
    .editor-dialog { max-width:100%; width:100%; max-height:92dvh; margin:auto 0 0; border-radius:20px 20px 0 0; border-bottom:0; } .dialog-heading { padding:21px 20px; } .dialog-heading h2 { font-size:21px; } .form-fields { padding:20px; grid-template-columns:1fr; gap:15px; } .form-fields .full { grid-column:auto; } .permissions { grid-template-columns:1fr; } .dialog-footer { padding:15px 20px max(15px,env(safe-area-inset-bottom)); flex-wrap:wrap; } .dialog-footer>.muted { max-width:170px; font-size:10px; } .dialog-content { padding:20px; } .event-detail h3 { font-size:15px; } .event-metadata dt { min-width:70px; } .quick-menu button { padding:15px 12px; } .quick-menu small { font-size:10px; } .detail-actions .danger { margin-left:0; }
  }
  @media(max-width:700px),(pointer:coarse) {
    .app button,.app input:not([type=checkbox]),.app select,.app textarea { min-height:44px; min-width:44px; }
    .app .event-chip { min-height:22px; min-width:0; }
    .app .mobile-nav button { min-height:50px; }
    .app .day-number { width:44px; min-width:44px; min-height:44px; position:relative; z-index:3; }
    .app .month-cell { padding-bottom:44px; }
    .app .cell-heading { position:static; justify-content:flex-start; }
    .app .date-add { display:inline-flex; position:absolute; right:0; bottom:0; width:44px; height:44px; opacity:1; z-index:3; padding:0; align-items:center; justify-content:center; font-size:20px; }
    .app .cell-events { z-index:4; }
    .app .month-grid,.app .weekday-row { min-width:322px; }
    .app .calendar-surface { overflow:auto; }
    .app .icon-button { min-width:44px; }
    .app .check { min-height:44px; }
    .app input[type=checkbox] { appearance:none; position:relative; display:grid; place-items:center; width:44px; min-width:44px; height:44px; min-height:44px; border:0; padding:0; background:transparent; border-radius:6px; }
    .app input[type=checkbox]:before { content:""; width:20px; height:20px; border:1px solid var(--muted); border-radius:4px; background:var(--surface); }
    .app input[type=checkbox]:checked:before { background:#c45013; border-color:#c45013; }
    .app input[type=checkbox]:checked:after { content:"✓"; position:absolute; color:white; font-size:17px; font-weight:700; }
    .app input[type=checkbox]:disabled { opacity:.5; }
  }
  @media(hover:none) { .date-add { opacity:1; } }
  @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
`;
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
var We = [
	"people",
	"calendar",
	"groceries",
	"chores",
	"recipes",
	"settings"
], Ge = [
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
], Q = [
	{
		id: "calendar",
		name: "Calendar",
		icon: "▦",
		subtitle: "A little less juggling. A little more together."
	},
	{
		id: "groceries",
		name: "Groceries & meals",
		icon: "▤",
		subtitle: "From the weekly plan to the shopping basket."
	},
	{
		id: "chores",
		name: "Chores",
		icon: "✓",
		subtitle: "Small contributions. A happier home."
	},
	{
		id: "recipes",
		name: "Recipes",
		icon: "♧",
		subtitle: "Good food worth making again."
	},
	{
		id: "settings",
		name: "Settings",
		icon: "⚙",
		subtitle: "Make your organizer feel like home."
	}
], $ = class extends V {
	constructor(...e) {
		super(...e), this.page = "calendar", this.data = {}, this.selectedDay = U(/* @__PURE__ */ new Date()), this.calendarView = "month", this.personFilter = /* @__PURE__ */ new Set(), this.listId = "default", this.groceryAssignee = "", this.groupStores = !1, this.mealWeek = 0, this.scorePeriod = "week", this.recipeSearch = "", this.recipeCategory = "", this.recipeId = "", this.servings = {}, this.selectedIngredients = {}, this.routes = {}, this.theme = localStorage.getItem("family-organizer-theme") || "auto", this.error = "", this.notice = "", this.loading = !0, this.saving = !1, this.subscribing = !1, this.initialized = !1, this.loadSequence = 0, this.readRoute = () => {
			let e = Re(location.hash);
			e && (this.page = e.page, this.recipeId = e.recipeId, e.malformed && (this.notice = "This recipe link is malformed. Showing your cookbook instead."));
		};
	}
	set hass(e) {
		let t = !this._hass;
		this._hass = e, t && this.load(), this.requestUpdate();
	}
	connectedCallback() {
		super.connectedCallback(), window.addEventListener("hashchange", this.readRoute), this.readRoute(), this._hass && this.load();
	}
	disconnectedCallback() {
		this.unsubscribe?.(), this.unsubscribe = void 0, window.removeEventListener("hashchange", this.readRoute), super.disconnectedCallback();
	}
	navigate(e, t = "") {
		this.page = e, this.recipeId = t, location.hash = `fo/${e}${t ? `/${encodeURIComponent(t)}` : ""}`;
	}
	get settingsData() {
		return this.data.settings || {};
	}
	get people() {
		return this.data.people?.items || [];
	}
	get locale() {
		return Oe(this.settingsData.language || this._hass?.locale?.language);
	}
	get firstDay() {
		return ke(this.settingsData.week_start, this.locale);
	}
	get me() {
		if (this.settingsData.current_user) return this.people.find((e) => e.id === this.settingsData.current_user.person_id);
		let e = this._hass?.user?.id;
		return e ? this.people.find((t) => (t.user_id || t.ha_user_id) === e) : void 0;
	}
	can(e) {
		let t = this.settingsData.current_user?.capabilities?.[e];
		if (typeof t == "boolean") return t;
		if (this._hass?.user?.is_admin) return !0;
		let n = this.me;
		return n ? n.permissions?.[e] ?? Pe(n.role, e) : !1;
	}
	canEvent(e) {
		return this.can("manage_calendar_all") || this.can("manage_calendar_own") && (!e || (e.person_ids || []).includes(this.me?.id) || [this.me?.id, this._hass?.user?.id].includes(e.creator_id));
	}
	person(e) {
		return this.people.find((t) => t.id === e);
	}
	avatar(e) {
		let t = this.person(e), n = t?.profile_picture || t?.avatar_url;
		return n ? M`<img class="avatar" src=${n} alt=${t.name} loading="lazy" referrerpolicy="no-referrer">` : M`<span class="avatar fallback" style=${`--person-color:${this.color(t?.color)}`} aria-label=${t?.name || "Unassigned"}>${t?.initials || t?.name?.split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase() || "?"}</span>`;
	}
	color(e) {
		return /^#[0-9a-f]{3,8}$/i.test(e || "") ? e : "#64748b";
	}
	date(e, t = {
		weekday: "long",
		month: "long",
		day: "numeric"
	}) {
		return W(e).toLocaleDateString(this.locale, t);
	}
	time(e) {
		return new Date(e).toLocaleTimeString(this.locale, {
			hour: "numeric",
			minute: "2-digit",
			hour12: this.settingsData.time_format === "12"
		});
	}
	peopleOptions(e) {
		return this.people.map((t) => M`<option value=${t.id} ?selected=${t.id === e}>${t.name}</option>`);
	}
	async load() {
		if (!this._hass) return;
		let e = ++this.loadSequence;
		try {
			let t = await Promise.all(We.map((e) => this._hass.callWS({
				type: "family_organizer/list",
				resource: e
			})));
			if (e !== this.loadSequence) return;
			this.data = Object.fromEntries(We.map((e, n) => [e, t[n]]));
			let n = this.settingsData;
			if (this.listId = Le(this.data.groceries.lists || [], this.listId, n.default_grocery_list_id, !this.initialized), this.initialized ||= (this.calendarView = n.default_calendar_view || "month", this.scorePeriod = n.competition_default || "week", this.theme = localStorage.getItem("family-organizer-theme") || n.theme || "auto", !0), this.error = "", !this.unsubscribe && !this.subscribing && this.isConnected) {
				this.subscribing = !0;
				try {
					let e = await this._hass.connection.subscribeMessage(() => void this.load(), { type: "family_organizer/subscribe" });
					this.isConnected ? this.unsubscribe = e : e();
				} finally {
					this.subscribing = !1;
				}
			}
		} catch (t) {
			e === this.loadSequence && (this.error = this.message(t));
		} finally {
			e === this.loadSequence && (this.loading = !1);
		}
	}
	message(e) {
		return e?.message || String(e);
	}
	async action(e, t = "Saved", n = !1) {
		if (this.saving) return !1;
		this.saving = !0, this.error = "", this.notice = "";
		try {
			return await e(), await this.load(), this.notice = t, n && this.closeEditor(!0), !0;
		} catch (e) {
			return this.error = this.message(e), !1;
		} finally {
			this.saving = !1;
		}
	}
	mutate(e, t, n = "items") {
		let r = e === "calendar" && n === "items" ? Fe(t) : t;
		return this._hass.callWS({
			type: `family_organizer/${t.id ? "update" : "create"}`,
			resource: e,
			collection: n,
			...t.id ? { item_id: t.id } : {},
			item: r
		});
	}
	confirmDelete(e, t, n = "items") {
		this.openEditor("delete", t, e, n);
	}
	openEditor(e, t = {}, n, r) {
		this.saving || (this.editor || (this.returnFocus = this.renderRoot.activeElement), this.error = "", this.editor = {
			kind: e,
			item: { ...t },
			resource: n,
			collection: r
		}, this.updateComplete.then(() => {
			let e = this.renderRoot.querySelector("dialog");
			e.open || e.showModal(), (e.querySelector("[autofocus]") || e.querySelector("input,select,button"))?.focus();
		}));
	}
	closeEditor(e = !1) {
		(!this.saving || e) && (this.renderRoot.querySelector("dialog")?.close(), this.editor = void 0, this.updateComplete.then(() => this.returnFocus?.isConnected ? this.returnFocus.focus() : this.renderRoot.querySelector(".quick-add")?.focus()));
	}
	async saveEditor(e) {
		if (e.preventDefault(), !this.editor || this.saving) return;
		let t = e.currentTarget, n = new FormData(t), r = Object.fromEntries(n), { kind: i, item: a } = this.editor, o = "", s = "items", c = { ...a }, l = (e) => Number(r[e]) || 0, u = (e) => String(r[e] || "").trim(), d = (e) => n.has(e);
		if (i === "delete") {
			let e = this.editor;
			await this.action(() => this._hass.callWS({
				type: "family_organizer/delete",
				resource: e.resource,
				collection: e.collection || "items",
				item_id: a.id
			}), "Deleted", !0);
			return;
		}
		if (i === "event") {
			o = "calendar";
			let e = d("all_day"), t = u("day"), r = u("end_day");
			if (c = {
				...c,
				title: u("title"),
				start: e ? t : `${t}T${u("start")}:00`,
				end: e ? G(r, 1) : `${r}T${u("end")}:00`,
				all_day: e,
				description: u("description"),
				location: u("location"),
				recurrence: u("recurrence") || null,
				person_ids: n.getAll("person_ids"),
				shared: d("shared")
			}, new Date(c.end) <= new Date(c.start)) {
				this.error = "The event must end after it starts.";
				return;
			}
		} else if (i === "grocery") o = "groceries", c = {
			...c,
			name: u("name"),
			quantity: l("quantity"),
			unit: u("unit"),
			notes: u("notes"),
			store: u("store"),
			list_id: u("list_id"),
			assignee_id: u("assignee_id") || null,
			checked: !!a.checked,
			shared: d("shared")
		};
		else if (i === "list") o = "groceries", s = "lists", c = {
			...c,
			name: u("name"),
			store: u("store"),
			shared: d("shared")
		};
		else if (i === "meal") {
			o = "groceries", s = "meal_slots";
			let e = (this.data.recipes.items || []).find((e) => e.id === u("recipe_id"));
			if (c = {
				...c,
				day: u("day"),
				slot: u("slot"),
				recipe_id: e?.id || null,
				title: e?.title || u("title"),
				servings: l("servings")
			}, !c.title) {
				this.error = "Choose a recipe or enter a meal name.";
				return;
			}
			let t = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).find((e) => e.day === c.day && (e.slot || e.meal) === c.slot);
			if (t && t.id !== a.id) {
				this.error = "That meal slot is already planned. Edit it from the planner instead.";
				return;
			}
		} else if (i === "chore") {
			if (o = "chores", c = {
				...c,
				title: u("title"),
				description: u("description"),
				icon: u("icon"),
				points: l("points"),
				assignee_ids: n.getAll("assignee_ids"),
				rotate: d("rotate"),
				schedule: u("schedule"),
				weekdays: n.getAll("weekdays").map(Number),
				month_day: l("month_day"),
				interval_days: l("interval_days"),
				due_date: u("due_date") || null,
				due_time: u("due_time") || null,
				created: a.created || U(/* @__PURE__ */ new Date()),
				shared: d("shared")
			}, c.schedule === "weekly" && !c.weekdays.length) {
				this.error = "Choose at least one weekday.";
				return;
			}
		} else if (i === "points") {
			await this.action(() => this._hass.callWS({
				type: "family_organizer/adjust_points",
				person_id: u("person_id"),
				points: l("points"),
				note: u("note")
			}), "Points adjusted", !0);
			return;
		} else if (i === "recipe") {
			o = "recipes";
			let e = Ne(u("ingredients"), a.ingredients || []);
			c = {
				...c,
				title: u("title"),
				tags: u("tags").split(",").map((e) => e.trim()).filter(Boolean),
				category_ids: n.getAll("category_ids"),
				image: u("image") || null,
				prep_time: l("prep_time"),
				cook_time: l("cook_time"),
				servings: l("servings"),
				ingredients: e,
				steps: u("steps").split(/\r?\n/).map((e) => e.trim()).filter(Boolean),
				shared: d("shared")
			};
		} else if (i === "category") o = "recipes", s = "categories", c = {
			...c,
			name: u("name"),
			parent_id: u("parent_id") || null
		};
		else if (i === "person") {
			o = "people";
			let e = {};
			Ge.forEach((t) => {
				let n = u(t);
				n !== "default" && (e[t] = n === "allow");
			}), c = {
				...c,
				name: u("name"),
				initials: u("name").split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase(),
				color: u("color"),
				profile_picture: u("profile_picture") || null,
				user_id: u("user_id") || null,
				role: u("role"),
				permissions: e,
				shared: !0
			};
		} else if (i === "preferences") {
			let e = {};
			if ([
				"overview_position",
				"week_start",
				"time_format",
				"default_calendar_view",
				"default_grocery_list_id",
				"competition_default",
				"language",
				"theme"
			].forEach((t) => e[t] = u(t)), e.overview_collapsed = d("overview_collapsed"), e.sync_interval = l("sync_interval"), e.meal_slots = u("meal_slots").split(",").map((e) => e.trim()).filter(Boolean), e.stores = u("stores").split(",").map((e) => e.trim()).filter(Boolean), !e.meal_slots.length) {
				this.error = "Enter at least one meal slot.";
				return;
			}
			try {
				new Intl.DateTimeFormat(e.language);
			} catch {
				this.error = "Enter a valid language code, such as en, de or fr.";
				return;
			}
			await this.action(() => this._hass.callWS({
				type: "family_organizer/settings",
				settings: e
			}), "Preferences saved", !0) && (this.localOverview = void 0, this.theme = e.theme, localStorage.setItem("family-organizer-theme", this.theme));
			return;
		}
		o && ([
			"occurrence_start",
			"occurrence_end",
			"unsupported_recurrence",
			"day",
			"start_time",
			"end_time"
		].forEach((e) => {
			o === "calendar" && delete c[e];
		}), await this.action(() => this.mutate(o, c, s), a.id ? "Changes saved" : "Added to your family organizer", !0));
	}
	render() {
		let e = Q.find((e) => e.id === this.page);
		return M`<div class="app" data-theme=${this.theme === "auto" ? this._hass?.themes?.darkMode ? "dark" : "auto" : this.theme}>
      <a class="skip-link" href="#main" @click=${(e) => {
			e.preventDefault(), this.renderRoot.querySelector("main").focus();
		}}>Skip to content</a>
      <button class="quick-add" @click=${() => this.openEditor("quick")} ?disabled=${this.loading || this.saving || !this.data.people}><span aria-hidden="true">+</span> Quick add</button>
      <aside class="sidebar"><a class="brand" href="#fo/calendar" @click=${() => this.navigate("calendar")}><span class="brand-symbol">⌂</span><span>Family<br><strong>Organizer</strong></span></a><p class="eyebrow">YOUR FAMILY, IN SYNC</p>
        <nav aria-label="Main navigation">${Q.map((e) => M`<button class=${this.page === e.id ? "active" : ""} aria-current=${this.page === e.id ? "page" : P} @click=${() => this.navigate(e.id)}><span class="nav-icon" aria-hidden="true">${e.icon}</span><span>${e.name}</span></button>`)}</nav>
        <div class="sidebar-family"><span class="eyebrow">OUR PEOPLE</span><div class="avatar-stack">${this.people.map((e) => this.avatar(e.id))}</div><p>${this.people.length ? `${this.people.length} people. One shared home.` : "Your family starts here."}</p></div>
        ${this.haMenuButton()}
        <small class="sidebar-note">Made for everyday together.</small>
      </aside>
      <div class="workspace"><header class="topbar"><div><span class="eyebrow">${this.date(U(/* @__PURE__ */ new Date()), {
			weekday: "long",
			month: "short",
			day: "numeric"
		})}</span><h1>${e.name}</h1><p>${e.subtitle}</p></div></header>
        <main id="main" tabindex="-1" aria-busy=${this.loading || this.saving}>
          ${this.error && !this.editor ? M`<div class="banner error" role="alert"><span>${this.error}</span><button @click=${() => void this.load()}>Retry</button></div>` : P}
          ${this.notice ? M`<div class="banner success" role="status">${this.notice}<button aria-label="Dismiss notification" @click=${() => this.notice = ""}>×</button></div>` : P}
          ${this.saving ? M`<p class="saving" role="status">Saving your changes…</p>` : P}
          ${this.loading ? M`<div class="empty loading" role="status"><span class="spinner"></span><h2>Getting your family together…</h2><p>Loading your calendar, lists and favorite recipes.</p></div>` : this.data.people ? this.renderPage() : M`<div class="empty"><h2>Couldn’t load your organizer</h2><p>Check your connection and family permissions.</p><button class="primary" @click=${() => void this.load()}>Try again</button></div>`}
        </main>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation">${Q.map((e) => M`<button class=${this.page === e.id ? "active" : ""} aria-current=${this.page === e.id ? "page" : P} @click=${() => this.navigate(e.id)}><span aria-hidden="true">${e.icon}</span>${e.id === "groceries" ? "Shopping" : e.name}</button>`)}${this.haMenuButton(!0)}</nav>
      ${this.editor ? this.dialog() : P}
    </div>`;
	}
	haMenuButton(e = !1) {
		return M`<button type="button" class=${`ha-shell-menu ${e ? "" : "sidebar-ha-menu"}`} aria-label="Open Home Assistant navigation" @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
			bubbles: !0,
			composed: !0,
			detail: {}
		}))}><span class="ha-menu-icon" aria-hidden="true"></span><span>${e ? "HA menu" : "Home Assistant"}</span></button>`;
	}
	renderPage() {
		return this.page === "calendar" ? this.calendar() : this.page === "groceries" ? this.groceries() : this.page === "chores" ? this.chores() : this.page === "recipes" ? this.recipes() : this.settings();
	}
	empty(e, t, n) {
		return M`<div class="empty"><span class="empty-icon" aria-hidden="true">✧</span><h3>${e}</h3><p>${t}</p>${n || P}</div>`;
	}
	addButton(e, t, n, r = {}) {
		return n ? M`<button class="primary" @click=${() => this.openEditor(t, r)}>+ ${e}</button>` : P;
	}
	filters() {
		return M`<div class="family-filters" aria-label="Filter calendar by family member"><button class=${this.personFilter.size ? "chip" : "chip active"} aria-pressed=${!this.personFilter.size} @click=${() => this.personFilter = /* @__PURE__ */ new Set()}>Everyone</button>${this.people.map((e) => M`<button class=${this.personFilter.has(e.id) ? "chip active" : "chip"} aria-pressed=${this.personFilter.has(e.id)} @click=${() => {
			let t = new Set(this.personFilter);
			t.has(e.id) ? t.delete(e.id) : t.add(e.id), this.personFilter = t;
		}}>${this.avatar(e.id)}${e.name}</button>`)}</div>`;
	}
	calendar() {
		let e = Ae(this.selectedDay, this.calendarView, this.firstDay), t = Ve(this.data.calendar.items || [], e[0], e.at(-1)).filter((e) => !this.personFilter.size || (e.person_ids || []).some((e) => this.personFilter.has(e))), n = X(t, this.selectedDay), r = (this.data.calendar.items || []).filter((e) => Be(e.recurrence) && (!this.personFilter.size || (e.person_ids || []).some((e) => this.personFilter.has(e)))), i = this.localOverview ?? this.settingsData.overview_collapsed;
		return M`<section aria-label="Family calendar"><div class="section-toolbar"><div class="date-navigation"><button class="icon-button" aria-label="Previous period" @click=${() => this.selectedDay = K(this.selectedDay, this.calendarView, -1)}>‹</button><button @click=${() => this.selectedDay = U(/* @__PURE__ */ new Date())}>Today</button><button class="icon-button" aria-label="Next period" @click=${() => this.selectedDay = K(this.selectedDay, this.calendarView, 1)}>›</button><h2>${this.calendarView === "month" ? this.date(this.selectedDay, {
			month: "long",
			year: "numeric"
		}) : this.calendarView === "day" ? this.date(this.selectedDay) : `${this.date(e[0], {
			month: "short",
			day: "numeric"
		})} – ${this.date(e[6], {
			month: "short",
			day: "numeric",
			year: "numeric"
		})}`}</h2></div><div class="toolbar-actions"><div class="segmented" role="group" aria-label="Calendar view">${[
			"month",
			"week",
			"day"
		].map((e) => M`<button class=${this.calendarView === e ? "active" : ""} aria-pressed=${this.calendarView === e} @click=${() => this.calendarView = e}>${e[0].toUpperCase() + e.slice(1)}</button>`)}</div><label class="sr-only" for="calendar-date">Go to date</label><input id="calendar-date" type="date" .value=${this.selectedDay} @change=${(e) => {
			let t = e.target.value;
			t && (this.selectedDay = t);
		}}></div></div>
      ${this.filters()}
      <div class=${`calendar-shell overview-${this.settingsData.overview_position || "right"} ${i ? "overview-closed" : ""}`}><div class="calendar-surface">
        ${this.calendarView === "month" ? M`<div class="weekday-row">${e.slice(0, 7).map((e) => M`<span>${this.date(e, { weekday: "short" })}</span>`)}</div><div class="month-grid">${e.map((e) => {
			let n = X(t, e);
			return M`<div class=${`month-cell ${e.slice(0, 7) === this.selectedDay.slice(0, 7) ? "" : "outside"} ${e === this.selectedDay ? "selected" : ""}`}>
            <div class="cell-heading"><button class=${e === U(/* @__PURE__ */ new Date()) ? "day-number today" : "day-number"} aria-label=${`Agenda for ${this.date(e)}`} aria-pressed=${e === this.selectedDay} @click=${() => this.selectedDay = e}>${W(e).getDate()}</button>${this.canEvent() ? M`<button class="date-add" aria-label=${`Add event on ${this.date(e)}`} @click=${() => {
				this.selectedDay = e, this.openEditor("event", { day: e });
			}}>+</button>` : P}</div>
            <button class="cell-create" aria-label=${`Create event on ${this.date(e)}`} ?disabled=${!this.canEvent()} @click=${() => {
				this.selectedDay = e, this.openEditor("event", { day: e });
			}}></button>
            <div class="cell-events">${n.slice(0, 3).map((e) => this.eventChip(e))}${n.length > 3 ? M`<button class="more-events" @click=${() => this.selectedDay = e}>+${n.length - 3} more</button>` : P}</div>
          </div>`;
		})}</div>` : this.timeGrid(e, t)}
      </div><aside class="agenda"><button class="agenda-toggle" aria-expanded=${!i} @click=${() => {
			this.localOverview = !i, this.requestUpdate(), this.can("manage_settings") && this.action(() => this._hass.callWS({
				type: "family_organizer/settings",
				settings: { overview_collapsed: !i }
			}), "Overview updated");
		}}>${i ? "Show" : "Hide"} day agenda <span aria-hidden="true">${i ? "+" : "−"}</span></button>${i ? P : M`<span class="eyebrow">THE DAY AT A GLANCE</span><h2>${this.date(this.selectedDay, { weekday: "long" })}</h2><p class="muted">${this.date(this.selectedDay, {
			month: "long",
			day: "numeric"
		})} · ${n.length} events</p><div class="agenda-events">${n.length ? n.map((e) => M`<button class="agenda-event" style=${`--event-color:${this.eventColor(e)}`} @click=${() => this.openEditor("event-detail", e)}><span class="event-time">${e.all_day ? "All day" : this.time(e.occurrence_start)}</span><strong>${e.title}</strong><span class="muted">${e.location || "No location"}</span><span class="event-people">${(e.person_ids || []).map((e) => this.avatar(e))}</span></button>`) : this.empty("Room to breathe", this.personFilter.size ? "No events for the selected family members." : "Nothing on the calendar for this day.")}</div>${this.addButton("Add an event", "event", this.canEvent(), { day: this.selectedDay })}`}</aside></div>
      <p class="calendar-hint">Select a day number to see its agenda. Select an empty day or + to add an event.</p>
      ${r.length ? M`<div class="banner recurrence-warning" role="status"><p>These recurrence rules cannot be expanded in this calendar. Their original text is preserved; only the original event is shown when it falls in the displayed period.</p><ul>${r.map((e) => M`<li><strong>${e.title}</strong>: <code>${e.recurrence}</code></li>`)}</ul></div>` : P}
    </section>`;
	}
	eventColor(e) {
		return this.color(this.person(e.person_ids?.[0])?.color || (this.data.calendar.sources || []).find((t) => t.id === e.source_id)?.color);
	}
	eventChip(e, t = "") {
		return M`<button class=${`event-chip ${e.all_day ? "all-day-event" : ""}`} style=${`--event-color:${this.eventColor(e)};${t}`} @click=${() => this.openEditor("event-detail", e)} title=${`${e.all_day ? "All day" : this.time(e.occurrence_start)} · ${e.title}`}><span class="event-dot" aria-hidden="true"></span><span>${e.all_day ? P : M`<time class="event-start" datetime=${e.occurrence_start}>${this.time(e.occurrence_start)}</time> `}<strong>${e.title}</strong></span>${e.recurrence ? M`<span aria-label="Repeating event">↻</span>` : P}</button>`;
	}
	timeGrid(e, t) {
		let n = Array.from({ length: 24 }, (e, t) => t), r = /* @__PURE__ */ new Date();
		return M`<div class="time-scroll"><div class="time-calendar" style=${`--days:${e.length}`}><div class="time-header"><span></span>${e.map((e) => M`<button class=${e === this.selectedDay ? "active" : ""} @click=${() => this.selectedDay = e}><small>${this.date(e, { weekday: "short" })}</small><strong class=${e === U(r) ? "today" : ""}>${W(e).getDate()}</strong></button>`)}</div><div class="all-day-row"><span>All day</span>${e.map((e) => M`<div>${X(t, e).filter((e) => e.all_day).map((e) => this.eventChip(e))}${this.canEvent() ? M`<button class="subtle" aria-label=${`Add all-day event on ${this.date(e)}`} @click=${() => this.openEditor("event", {
			day: e,
			all_day: !0
		})}>+</button>` : P}</div>`)}</div>
      <div class="time-body"><div class="time-labels">${n.map((t) => M`<span>${this.time(`${e[0]}T${String(t).padStart(2, "0")}:00:00`)}</span>`)}</div>${e.map((e) => M`<div class="time-column">${n.map((t) => M`<button class="hour-slot" aria-label=${`Add event ${this.date(e)} at ${t}:00`} ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", {
			day: e,
			start_time: `${String(t).padStart(2, "0")}:00`,
			end_time: `${String(Math.min(t + 1, 23)).padStart(2, "0")}:${t === 23 ? "59" : "00"}`
		})}></button>`)}<div class="positioned-events">${He(X(t, e).filter((e) => !e.all_day)).map(({ event: t, lane: n, columns: r }, i) => {
			let a = new Date(t.occurrence_start), o = new Date(t.occurrence_end), s = U(a) < e ? 0 : a.getHours() * 60 + a.getMinutes(), c = U(o) > e ? 1440 : o.getHours() * 60 + o.getMinutes();
			return this.eventChip(t, `top:${s / 60 * 52}px;height:${Math.max(26, (c - s) / 60 * 52)}px;left:${n / r * 100}%;width:${100 / r}%;z-index:${i + 1}`);
		})}</div>${e === U(r) ? M`<div class="now-line" style=${`top:${(r.getHours() + r.getMinutes() / 60) * 52}px`} aria-label="Current time"></div>` : P}</div>`)}</div></div></div>`;
	}
	groceries() {
		let e = this.data.groceries, t = e.lists || [], n = t.find((e) => e.id === this.listId), r = (e.items || []).filter((e) => e.list_id === this.listId && (!this.groceryAssignee || e.assignee_id === this.groceryAssignee));
		r = [...r].sort((e, t) => (this.groupStores ? (e.store || "").localeCompare(t.store || "") : 0) || Number(e.checked) - Number(t.checked));
		let i = r.filter((e) => e.checked).length, a = this.can("manage_groceries"), o = G(q(U(/* @__PURE__ */ new Date()), this.firstDay), this.mealWeek * 7), s = e.meal_slots || e.meal_plans || [];
		return M`<section><div class="shopping-layout"><div class="surface shopping-list"><div class="surface-heading"><div><span class="eyebrow">SHOPPING LIST</span><h2>${n?.name || "Groceries"}</h2><p class="muted">${r.length - i} to buy · ${i} in the basket</p></div>${this.addButton("Add item", "grocery", a, {
			list_id: this.listId,
			store: n?.store || ""
		})}</div>
      <div class="list-tabs" role="group" aria-label="Grocery lists">${t.map((e) => M`<button class=${e.id === this.listId ? "active" : ""} aria-pressed=${e.id === this.listId} @click=${() => this.listId = e.id}>${e.name}</button>`)}</div>
      <div class="list-tools"><label>Assigned to<select .value=${this.groceryAssignee} @change=${(e) => this.groceryAssignee = e.target.value}><option value="">Everyone</option>${this.peopleOptions()}</select></label><label class="check"><input type="checkbox" .checked=${this.groupStores} @change=${() => this.groupStores = !this.groupStores}>Group by store</label>${a ? M`<button ?disabled=${!i || this.saving} @click=${() => void this.action(async () => {
			for (let e of r.filter((e) => e.checked)) await this._hass.callWS({
				type: "family_organizer/delete",
				resource: "groceries",
				item_id: e.id
			});
		}, "Bought items cleared")}>Clear bought</button>` : P}</div>
      <div class="grocery-items">${r.length ? r.map((e, t) => M`${this.groupStores && (t === 0 || r[t - 1].store !== e.store) ? M`<h3 class="store-heading">${e.store || "No store"}</h3>` : P}<article class=${`grocery-row ${e.checked ? "checked" : ""}`}><input type="checkbox" aria-label=${`Mark ${e.name} ${e.checked ? "to buy" : "bought"}`} .checked=${!!e.checked} ?disabled=${!a || this.saving} @change=${() => void this.action(() => this.mutate("groceries", {
			...e,
			checked: !e.checked
		}), e.checked ? "Moved back to your list" : "Added to the basket")}><div class="row-copy"><strong>${e.name}</strong><span class="muted">${J(Number(e.quantity))} ${e.unit || ""}${e.notes ? ` · ${e.notes}` : ""}${e.store ? ` · ${e.store}` : ""}</span></div><span title=${`Created by ${this.person(e.creator_id)?.name || "a family member"}`}>${this.avatar(e.creator_id)}</span>${e.assignee_id ? M`<span title=${`Assigned to ${this.person(e.assignee_id)?.name || "a family member"}`}>${this.avatar(e.assignee_id)}</span>` : P}${a ? M`<button class="icon-button" aria-label=${`Edit ${e.name}`} @click=${() => this.openEditor("grocery", e)}>✎</button><button class="icon-button" aria-label=${`Delete ${e.name}`} @click=${() => this.confirmDelete("groceries", e)}>×</button>` : P}</article>`) : this.empty("A fresh start", this.groceryAssignee ? "No items assigned to this person." : "Add an item or send ingredients from a recipe.", this.addButton("Add your first item", "grocery", a, { list_id: this.listId }))}</div></div>
      <aside class="surface shopping-aside"><span class="eyebrow">A LITTLE ORGANIZATION</span><h3>One list for every stop</h3><p class="muted">Keep the supermarket, farmers’ market and pantry runs separate. Matching items merge automatically.</p>${this.addButton("New list", "list", a)}${a && n ? M`<button @click=${() => this.openEditor("list", n)}>Edit list</button><button class="danger" ?disabled=${t.length < 2} @click=${() => this.confirmDelete("groceries", n, "lists")}>Delete list</button><small class="muted">Deleting a list also removes its grocery items. Keep at least one list.</small>` : P}<hr><h3>What’s cooking?</h3><p class="muted">Choose a recipe below, then shop its ingredients from the recipe detail.</p><button @click=${() => this.navigate("recipes")}>Explore recipes →</button></aside></div>
      <div class="section-toolbar meal-heading"><div><span class="eyebrow">LESS “WHAT’S FOR DINNER?”</span><h2>Your weekly meal plan</h2></div><div class="date-navigation"><button class="icon-button" aria-label="Previous meal week" @click=${() => this.mealWeek--}>‹</button><button @click=${() => this.mealWeek = 0}>This week</button><button class="icon-button" aria-label="Next meal week" @click=${() => this.mealWeek++}>›</button><span>${this.date(o, {
			month: "short",
			day: "numeric"
		})} – ${this.date(G(o, 6), {
			month: "short",
			day: "numeric"
		})}</span></div></div>
      <div class="meal-grid">${Array.from({ length: 7 }, (e, t) => {
			let n = G(o, t);
			return M`<article class=${`meal-day ${n === U(/* @__PURE__ */ new Date()) ? "meal-today" : ""}`}><header><span>${this.date(n, { weekday: "short" })}</span><strong>${W(n).getDate()}</strong></header>${(this.settingsData.meal_slots || [
				"breakfast",
				"lunch",
				"dinner"
			]).map((e) => {
				let t = s.find((t) => t.day === n && (t.slot || t.meal) === e);
				return M`<div class="meal-slot"><span class="eyebrow">${e}</span>${t ? M`<button class="meal-title" @click=${() => this.can("manage_meal_plan") ? this.openEditor("meal", t) : t.recipe_id ? this.navigate("recipes", t.recipe_id) : void 0}>${t.title}<small>${J(Number(t.servings || 1))} servings</small></button>${t.recipe_id ? M`<button class="text-button" @click=${() => this.navigate("recipes", t.recipe_id)}>Recipe →</button>` : P}${this.can("manage_meal_plan") ? M`<button class="text-button danger" aria-label=${`Remove ${t.title} from ${n} ${e}`} @click=${() => this.confirmDelete("groceries", t, "meal_slots")}>Remove</button>` : P}` : this.can("manage_meal_plan") ? M`<button class="meal-empty" aria-label=${`Plan ${e} on ${this.date(n)}`} @click=${() => this.openEditor("meal", {
					day: n,
					slot: e,
					servings: 4
				})}>+ Plan meal</button>` : M`<span class="muted">Not planned</span>`}</div>`;
			})}</article>`;
		})}</div></section>`;
	}
	choreIcon(e) {
		return M`<ha-icon .icon=${e.icon || "mdi:check-circle-outline"} aria-hidden="true"></ha-icon><span class="chore-icon-fallback" aria-hidden="true">✓</span>`;
	}
	chores() {
		let e = this.data.chores.items || [], t = this.data.chores.completions || [], n = e.filter((e) => ze(e, this.selectedDay)), r = U(/* @__PURE__ */ new Date()), i = this.scorePeriod === "week" ? q(r, this.firstDay) : `${r.slice(0, 7)}-01`, a = this.scorePeriod === "week" ? G(i, 7) : K(i, "month", 1), o = this.scorePeriod === "week" ? G(i, -7) : K(i, "month", -1), s = (e, n) => this.people.map((r) => ({
			person: r,
			points: t.filter((t) => t.person_id === r.id && U(new Date(t.completed_at)) >= e && U(new Date(t.completed_at)) < n).reduce((e, t) => e + Number(t.points || 0), 0)
		})).sort((e, t) => t.points - e.points), c = s(i, a), l = s(o, i), u = Math.max(1, ...c.map((e) => e.points));
		return M`<section><div class="chore-layout"><div class="surface"><div class="surface-heading"><div><span class="eyebrow">TEAMWORK MAKES HOME WORK</span><h2>The chore board</h2></div>${this.addButton("New chore", "chore", this.can("manage_chores"))}</div><div class="section-toolbar"><label>Chores for<input type="date" .value=${this.selectedDay} @change=${(e) => {
			let t = e.target.value;
			t && (this.selectedDay = t);
		}}></label><span class="muted">${n.length} scheduled · ${n.filter((e) => t.some((t) => t.chore_id === e.id && U(new Date(t.completed_at)) === this.selectedDay)).length} completed</span></div>
      <div class="chore-list">${n.length ? n.map((e) => {
			let n = e.assignee_ids || (e.assignee_id ? [e.assignee_id] : []), i = n[(Number(e.rotation_index) || 0) % Math.max(1, n.length)], a = t.some((t) => t.chore_id === e.id && U(new Date(t.completed_at)) === this.selectedDay), o = !a && (this.selectedDay < r || this.selectedDay === r && e.due_time && e.due_time < (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5)), s = this.me && (n.includes(this.me.id) || [this.me.id, this._hass?.user?.id].includes(e.creator_id)), c = this.can("complete_any_chore") || this.can("complete_own_chores") && s;
			return M`<article class=${`chore-card ${a ? "done" : o ? "overdue" : ""}`}><div class="chore-symbol" aria-hidden="true">${this.choreIcon(e)}</div><div class="row-copy"><strong>${e.title}</strong><span class="muted">${e.description || (a ? "Nice work!" : o ? "Overdue" : `Due ${e.due_time || "today"}`)}</span><span class="assignee">${this.avatar(i)}${this.person(i)?.name || "Anyone"}${e.rotate ? " · rotating" : ""}</span></div><span class="points-badge">${e.points} pts</span><button class=${a ? "" : "primary"} ?disabled=${a || !c || this.saving || this.selectedDay !== r} title=${this.selectedDay === r ? "" : "Completions are recorded for today"} @click=${() => void this.action(() => this._hass.callWS({
				type: "family_organizer/complete_chore",
				chore_id: e.id,
				...this.can("complete_any_chore") ? i ? { person_id: i } : {} : { person_id: this.me.id }
			}), "Chore completed. Thank you!")}>${a ? "Done ✓" : "Complete"}</button>${this.can("manage_chores") ? M`<button class="icon-button" aria-label=${`Edit ${e.title}`} @click=${() => this.openEditor("chore", e)}>✎</button><button class="icon-button" aria-label=${`Delete ${e.title}`} @click=${() => this.confirmDelete("chores", e)}>×</button>` : P}</article>`;
		}) : this.empty("All clear for this day", "Schedule a chore to share the load.", this.addButton("Create a chore", "chore", this.can("manage_chores")))}</div>
      ${this.selectedDay === r ? P : M`<p class="muted">You’re browsing another day. Chore completions are recorded for today only.</p>`}
      <details class="all-chores"><summary>All scheduled chores (${e.length})</summary>${e.map((e) => M`<div class="compact-row"><span>${e.title} <small class="muted">· ${e.schedule}</small></span>${this.can("manage_chores") ? M`<button @click=${() => this.openEditor("chore", e)}>Edit</button>` : P}</div>`)}</details></div>
      <aside class="surface leaderboard"><span class="eyebrow">A FRIENDLY LITTLE COMPETITION</span><h2>Family leaderboard</h2><div class="segmented" role="group" aria-label="Score period">${["week", "month"].map((e) => M`<button class=${this.scorePeriod === e ? "active" : ""} aria-pressed=${this.scorePeriod === e} @click=${() => this.scorePeriod = e}>This ${e}</button>`)}</div><p class="muted">${this.date(i, {
			month: "short",
			day: "numeric"
		})} – ${this.date(G(a, -1), {
			month: "short",
			day: "numeric"
		})}</p>${c.length ? c.map((e, t) => M`<article class="score-row"><span class="rank">${t === 0 && e.points > 0 ? "♛" : t + 1}</span>${this.avatar(e.person.id)}<div class="row-copy"><strong>${e.person.name}</strong><progress max=${u} value=${Math.max(0, e.points)} aria-label=${`${e.person.name}: ${e.points} points`}></progress></div><strong>${e.points}<small> pts</small></strong></article>`) : this.empty("Meet your team", "Add family members in Settings.")}<div class="prior-winner"><span aria-hidden="true">★</span><div><strong>Last ${this.scorePeriod}’s star</strong><p>${l[0]?.points > 0 ? `${l[0].person.name} · ${l[0].points} points` : "A fresh start for everyone"}</p></div></div></aside></div>
      <div class="surface history"><div class="surface-heading"><div><span class="eyebrow">EVERY CONTRIBUTION COUNTS</span><h2>Recent activity</h2></div>${this.addButton("Adjust points", "points", this.can("manage_chores") && this.people.length > 0)}</div>${t.length ? [...t].sort((e, t) => t.completed_at.localeCompare(e.completed_at)).slice(0, 30).map((t) => M`<div class="compact-row">${this.avatar(t.person_id)}<span class="row-copy"><strong>${this.person(t.person_id)?.name || "Family member"}</strong><span class="muted">${t.note || e.find((e) => e.id === t.chore_id)?.title || (t.adjustment ? "Manual adjustment" : "Completed chore")}</span></span><time>${this.date(U(new Date(t.completed_at)), {
			month: "short",
			day: "numeric"
		})} · ${this.time(t.completed_at)}</time><strong>${t.points > 0 ? "+" : ""}${t.points} pts</strong></div>`) : this.empty("Your story starts here", "Completed chores and point adjustments will appear here.")}</div>
    </section>`;
	}
	recipes() {
		let e = this.data.recipes.items || [], t = this.data.recipes.categories || [];
		if (this.recipeId) {
			let t = e.find((e) => e.id === this.recipeId);
			return t ? this.recipeDetail(t) : M`<button @click=${() => this.navigate("recipes")}>← All recipes</button>${this.empty("Recipe not found", "It may have been deleted or is no longer shared with you.")}`;
		}
		let n = e.filter((e) => (!this.recipeCategory || (e.category_ids || []).includes(this.recipeCategory)) && `${e.title} ${(e.tags || []).join(" ")}`.toLowerCase().includes(this.recipeSearch.toLowerCase()));
		return M`<section><div class="section-toolbar"><div><span class="eyebrow">THE FAMILY COOKBOOK</span><h2>Favorites, all in one place</h2></div>${this.addButton("New recipe", "recipe", this.can("manage_recipes"))}</div><div class="recipe-toolbar"><label class="search-label"><span class="sr-only">Search recipes or tags</span><input type="search" placeholder="Search recipes or tags…" .value=${this.recipeSearch} @input=${(e) => this.recipeSearch = e.target.value}></label><label>Category<select .value=${this.recipeCategory} @change=${(e) => this.recipeCategory = e.target.value}><option value="">All categories</option>${t.map((e) => M`<option value=${e.id}>${this.categoryPath(e)}</option>`)}</select></label>${this.can("manage_recipes") ? M`<button @click=${() => this.openEditor("categories")}>Manage categories</button>` : P}</div>
      <div class="recipe-grid">${n.length ? n.map((e) => M`<button class="recipe-card" @click=${() => this.navigate("recipes", e.id)}>${e.image ? M`<img src=${e.image} alt="" loading="lazy" referrerpolicy="no-referrer">` : M`<div class="recipe-placeholder" aria-hidden="true">♧<span>FROM OUR KITCHEN</span></div>`}<div class="recipe-card-copy"><span class="eyebrow">${(e.category_ids || []).map((e) => t.find((t) => t.id === e)?.name).filter(Boolean).join(" · ") || "Family favorite"}</span><h3>${e.title}</h3><p class="muted">${Number(e.prep_time || 0) + Number(e.cook_time || 0)} min · ${J(Number(e.servings || 4))} servings</p><div class="tags">${(e.tags || []).slice(0, 3).map((e) => M`<span>${e}</span>`)}</div></div></button>`) : this.empty(this.recipeSearch || this.recipeCategory ? "No recipes match" : "Start your family cookbook", "Save a favorite recipe, scale its servings and send ingredients to your lists.", this.addButton("Add a recipe", "recipe", this.can("manage_recipes")))}</div></section>`;
	}
	categoryPath(e) {
		let t = [e.name], n = /* @__PURE__ */ new Set([e.id]), r = e.parent_id;
		for (; r && !n.has(r);) {
			n.add(r);
			let e = (this.data.recipes.categories || []).find((e) => e.id === r);
			if (!e) break;
			t.unshift(e.name), r = e.parent_id;
		}
		return t.join(" / ");
	}
	recipeDetail(e) {
		let t = this.servings[e.id] ?? (Number(e.servings) || 4), n = Number(e.servings) || 1, r = e.ingredients || [], i = this.selectedIngredients[e.id] || new Set(r.map((e, t) => t)), a = this.data.groceries.lists || [];
		return M`<section><div class="section-toolbar"><button @click=${() => this.navigate("recipes")}>← All recipes</button><div class="toolbar-actions">${this.can("manage_recipes") ? M`<button @click=${() => this.openEditor("recipe", e)}>Edit recipe</button><button class="danger" @click=${() => this.confirmDelete("recipes", e)}>Delete</button>` : P}</div></div>
      <div class="recipe-hero">${e.image ? M`<img src=${e.image} alt=${e.title} referrerpolicy="no-referrer">` : M`<div class="recipe-hero-art" aria-hidden="true">♧</div>`}<div><span class="eyebrow">FROM THE FAMILY COOKBOOK</span><h2>${e.title}</h2><div class="tags">${(e.tags || []).map((e) => M`<span>${e}</span>`)}</div><p class="muted">Prep ${e.prep_time || 0} min · Cook ${e.cook_time || 0} min</p>${this.addButton("Plan this meal", "meal", this.can("manage_meal_plan"), {
			day: this.selectedDay,
			slot: (this.settingsData.meal_slots || ["dinner"])[0],
			recipe_id: e.id,
			title: e.title,
			servings: t
		})}</div></div>
      <div class="recipe-detail-grid"><div class="surface ingredient-panel"><div class="surface-heading"><h3>Ingredients</h3><div class="serving-control"><button aria-label="Decrease servings" ?disabled=${t <= .25} @click=${() => this.servings = {
			...this.servings,
			[e.id]: Math.max(.25, t - .25)
		}}>−</button><label><span class="sr-only">Servings</span><input type="number" min=".25" step=".25" .value=${String(t)} @change=${(t) => {
			let n = Number(t.target.value);
			n > 0 && (this.servings = {
				...this.servings,
				[e.id]: n
			});
		}}></label><button aria-label="Increase servings" @click=${() => this.servings = {
			...this.servings,
			[e.id]: t + .25
		}}>+</button></div></div><p class="muted">${J(t)} servings · automatically scaled from ${n}</p><p class="muted">Check ingredients to send to your grocery lists.</p>
        ${r.map((r, o) => M`<div class="ingredient-row"><label class="check"><input type="checkbox" .checked=${i.has(o)} @change=${() => {
			let t = new Set(i);
			t.has(o) ? t.delete(o) : t.add(o), this.selectedIngredients = {
				...this.selectedIngredients,
				[e.id]: t
			};
		}}><span><strong>${J(Number(r.amount || 0) * t / n)} ${r.unit || ""}</strong> ${r.name}</span></label><label><span class="sr-only">List for ${r.name}</span><select .value=${this.routes[e.id]?.[String(o)] || this.listId} @change=${(t) => this.routes = {
			...this.routes,
			[e.id]: {
				...this.routes[e.id],
				[String(o)]: t.target.value
			}
		}}>${a.map((e) => M`<option value=${e.id}>${e.name}</option>`)}</select></label></div>`)}
        <button class="primary wide" ?disabled=${!this.can("manage_groceries") || !i.size || !a.length || this.saving} @click=${() => void this.action(() => this._hass.callWS({
			type: "family_organizer/recipe_to_groceries",
			recipe_id: e.id,
			servings: t,
			list_id: this.listId,
			selected: [...i].sort((e, t) => e - t),
			routes: this.routes[e.id] || {}
		}), `${i.size} ingredients sent to your grocery lists`)}>+ Add selected to groceries</button>
      </div><div class="surface method-panel"><span class="eyebrow">LET’S MAKE SOMETHING GOOD</span><h3>Method</h3><ol>${(e.steps || e.instructions || []).map((e) => M`<li>${e}</li>`)}</ol>${(e.steps || e.instructions || []).length ? P : M`<p class="muted">No instructions yet. Edit this recipe to add the method.</p>`}</div></div></section>`;
	}
	settings() {
		let e = this.settingsData;
		return M`<section><div class="settings-intro"><span class="eyebrow">YOUR HOME, YOUR WAY</span><h2>A place for everyone</h2><p class="muted">Link family members to Home Assistant users, choose their colors and set what they can manage.</p></div><div class="section-toolbar"><h3>Family members</h3>${this.addButton("Add a person", "person", this.can("manage_people"))}</div><div class="people-grid">${this.people.length ? this.people.map((e) => M`<article class="surface person-card">${this.avatar(e.id)}<div class="row-copy"><h3>${e.name}</h3><p class="muted">${e.role === "parent_admin" ? "Family administrator" : e.role === "parent" ? "Parent" : "Child"} · ${e.user_id || e.ha_user_id ? "HA account linked" : "No HA account linked"}</p><small class="muted">${Object.keys(e.permissions || {}).length} permission overrides</small></div>${this.can("manage_people") ? M`<button @click=${() => this.openEditor("person", e)}>Edit</button><button class="icon-button danger" aria-label=${`Remove ${e.name}`} @click=${() => this.confirmDelete("people", e)}>×</button>` : P}</article>`) : this.empty("Welcome to your family space", "Add your first family member and link their Home Assistant user ID.", this.addButton("Add a person", "person", this.can("manage_people")))}</div>
      <div class="settings-grid"><article class="surface"><span class="eyebrow">DISPLAY & DEFAULTS</span><h3>Set your everyday rhythm</h3><dl><div><dt>Calendar</dt><dd>${e.default_calendar_view || "month"} view · week starts ${e.week_start || "by locale"}</dd></div><div><dt>Day overview</dt><dd>${e.overview_position || "right"} · ${e.overview_collapsed ? "collapsed" : "expanded"}</dd></div><div><dt>Time & language</dt><dd>${e.time_format || "24"} hour · ${e.language || this.locale}</dd></div><div><dt>Meal slots</dt><dd>${(e.meal_slots || []).join(", ")}</dd></div><div><dt>Stores</dt><dd>${(e.stores || []).join(", ") || "No stores yet"}</dd></div><div><dt>Grocery default</dt><dd>${(this.data.groceries.lists || []).find((t) => t.id === e.default_grocery_list_id)?.name || "First list"}</dd></div><div><dt>Competition</dt><dd>${e.competition_default || "week"}</dd></div><div><dt>Sync interval</dt><dd>${e.sync_interval || 30} minutes</dd></div></dl>${this.addButton("Edit preferences", "preferences", this.can("manage_settings"), {
			...e,
			theme: this.theme
		})}</article>
      <article class="surface"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h3>Appearance</h3><p class="muted">Choose a look for this device. Auto follows your Home Assistant theme.</p><div class="theme-options" role="group" aria-label="Appearance">${[
			"auto",
			"light",
			"dark"
		].map((e) => M`<button class=${this.theme === e ? "active" : ""} aria-pressed=${this.theme === e} @click=${() => {
			this.theme = e, localStorage.setItem("family-organizer-theme", e);
		}}><span aria-hidden="true">${e === "auto" ? "◐" : e === "light" ? "☼" : "☾"}</span>${e[0].toUpperCase() + e.slice(1)}</button>`)}</div><hr><span class="eyebrow">CALENDAR CONNECTIONS</span><h3>Keep calendars in sync</h3><p class="muted">Sources and credentials are managed securely in Home Assistant, never in this panel.</p><a class="button-link" href="/config/integrations/integration/family_organizer">Open integration settings →</a><p class="muted">Settings → Devices & services → Family Organizer → Configure.</p>${(this.data.calendar.sources || []).map((e) => M`<div class="compact-row"><span class="event-dot" style=${`background:${this.color(e.color)}`}></span><strong>${e.name}</strong><span class="muted">${e.enabled === !1 ? "Disabled" : "Connected"}</span></div>`)}</article></div></section>`;
	}
	field(e, t, n = "", r = "text", i = !1, a = {}) {
		return M`<label>${e}<input name=${t} type=${r} .value=${String(n ?? "")} ?required=${i} min=${a.min ?? P} max=${a.max ?? P} step=${a.step ?? P} placeholder=${a.placeholder ?? P} ?autofocus=${a.autofocus || !1}></label>`;
	}
	select(e, t, n, r) {
		let i = `editor-${t}`;
		return M`<div class="form-field"><label for=${i}>${e}</label><select id=${i} name=${t}>${r.map(([e, t]) => M`<option value=${e} ?selected=${e === n}>${t}</option>`)}</select></div>`;
	}
	textarea(e, t, n = "", r = "") {
		return M`<label class="full">${e}<textarea name=${t} rows="4" .value=${n} placeholder=${r}></textarea></label>`;
	}
	personChecks(e, t = [], n = !1) {
		return M`<fieldset class="full"><legend>Family members</legend><div class="checkbox-group">${this.people.filter((e) => !n || e.id === this.me?.id).map((n) => M`<label class="check"><input type="checkbox" name=${e} value=${n.id} ?checked=${t.includes(n.id)}>${this.avatar(n.id)}${n.name}</label>`)}</div></fieldset>`;
	}
	shared(e) {
		return M`<label class="check full"><input name="shared" type="checkbox" ?checked=${e.shared !== !1}>Share with the family</label>`;
	}
	dialog() {
		let { kind: e, item: t } = this.editor, n = {
			quick: "What would you like to add?",
			"event-detail": t.title,
			event: t.id ? "Edit event series" : "Add an event",
			grocery: t.id ? "Edit grocery item" : "Add to your grocery list",
			list: t.id ? "Edit grocery list" : "Create a grocery list",
			meal: t.id ? "Edit planned meal" : "Plan a meal",
			chore: t.id ? "Edit chore" : "Schedule a chore",
			points: "Adjust family points",
			recipe: t.id ? "Edit recipe" : "Save a favorite recipe",
			categories: "Recipe categories",
			category: t.id ? "Edit category" : "Create a category",
			person: t.id ? "Edit family member" : "Add a family member",
			preferences: "Display & defaults",
			delete: "Delete this item?"
		}, r = ![
			"quick",
			"event-detail",
			"categories"
		].includes(e);
		return M`<dialog class=${`editor-dialog ${e === "event-detail" ? "detail-dialog" : ""}`} aria-labelledby="dialog-title" @cancel=${(e) => {
			e.preventDefault(), this.closeEditor();
		}} @click=${(e) => {
			if (e.target === e.currentTarget) {
				let t = e.currentTarget.getBoundingClientRect();
				(e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom) && this.closeEditor();
			}
		}}>
      <header class="dialog-heading"><div><span class="eyebrow">FAMILY ORGANIZER</span><h2 id="dialog-title">${n[e]}</h2></div><button type="button" class="icon-button" aria-label="Close dialog" ?disabled=${this.saving} @click=${() => this.closeEditor()}>×</button></header>
      ${this.error ? M`<div class="banner error" role="alert">${this.error}</div>` : P}
      ${r ? M`<form @submit=${(e) => void this.saveEditor(e)}><fieldset class="form-fields" ?disabled=${this.saving}>${this.editorFields(e, t)}</fieldset><footer class="dialog-footer"><span class="muted" role="status">${this.saving ? "Saving…" : e === "event" && t.recurrence ? "Changes apply to the entire series." : ""}</span><button type="button" ?disabled=${this.saving} @click=${() => this.closeEditor()}>Cancel</button><button class=${e === "delete" ? "danger-primary" : "primary"} ?disabled=${this.saving}>${this.saving ? "Saving…" : e === "delete" ? "Delete" : "Save"}</button></footer></form>` : M`<div class="dialog-content">${e === "quick" ? this.quickMenu() : e === "event-detail" ? this.eventDetail(t) : this.categoryManager()}</div>`}
    </dialog>`;
	}
	quickMenu() {
		let e = [
			{
				kind: "event",
				title: "Calendar event",
				description: "Make time for what matters",
				icon: "▦",
				enabled: this.canEvent(),
				item: { day: this.selectedDay }
			},
			{
				kind: "grocery",
				title: "Grocery item",
				description: "Remember it before you forget it",
				icon: "▤",
				enabled: this.can("manage_groceries"),
				item: { list_id: this.listId }
			},
			{
				kind: "meal",
				title: "Planned meal",
				description: "Give dinner a little direction",
				icon: "♧",
				enabled: this.can("manage_meal_plan"),
				item: {
					day: this.selectedDay,
					slot: (this.settingsData.meal_slots || ["dinner"])[0],
					servings: 4
				}
			},
			{
				kind: "chore",
				title: "Family chore",
				description: "Share the load, celebrate the effort",
				icon: "✓",
				enabled: this.can("manage_chores"),
				item: {}
			},
			{
				kind: "recipe",
				title: "Favorite recipe",
				description: "Keep a good thing close",
				icon: "♧",
				enabled: this.can("manage_recipes"),
				item: {}
			}
		];
		return M`<div class="quick-menu">${e.filter((e) => e.enabled).map((e) => M`<button @click=${() => this.openEditor(e.kind, e.item)}><span class="quick-icon" aria-hidden="true">${e.icon}</span><span><strong>${e.title}</strong><small>${e.description}</small></span><span aria-hidden="true">→</span></button>`)}</div>${e.every((e) => !e.enabled) ? this.empty("You have a view-only account", "Ask a family administrator to adjust your permissions.") : P}`;
	}
	eventDetail(e) {
		return M`<div class="event-detail"><div class="detail-date" style=${`--event-color:${this.eventColor(e)}`}><span>${this.date(U(new Date(e.occurrence_start)), { month: "short" })}</span><strong>${new Date(e.occurrence_start).getDate()}</strong></div><div><h3>${this.date(U(new Date(e.occurrence_start)))}</h3><p>${e.all_day ? "All day" : `${this.time(e.occurrence_start)} – ${this.time(e.occurrence_end)}`}</p>${U(new Date(e.occurrence_start)) === U(new Date(e.occurrence_end)) ? P : M`<p class="muted">Ends ${this.date(U(new Date(e.all_day ? new Date(e.occurrence_end).getTime() - 1 : e.occurrence_end)))}</p>`}</div></div><dl class="event-metadata"><div><dt>Where</dt><dd>${e.location || "No location"}</dd></div><div><dt>Who</dt><dd class="event-people">${(e.person_ids || []).map((e) => M`<span class="check">${this.avatar(e)}${this.person(e)?.name || "Family member"}</span>`)}</dd></div><div><dt>Repeats</dt><dd>${e.recurrence || "Does not repeat"}</dd></div><div><dt>Visibility</dt><dd>${e.shared === !1 ? "Private" : "Shared with family"}</dd></div></dl>${e.description ? M`<p class="event-description">${e.description}</p>` : P}${e.source_id ? M`<p class="muted">Imported calendar event. Local edits may be replaced on the next source sync.</p>` : P}<div class="detail-actions">${this.canEvent(e) ? M`<button class="primary" @click=${() => this.openEditor("event", e)}>Edit ${e.recurrence ? "series" : "event"}</button>` : P}${this.canEvent() ? M`<button @click=${() => {
			let t = Ie(e);
			this.can("manage_calendar_all") || (t.person_ids = [this.me?.id].filter(Boolean)), this.openEditor("event", t);
		}}>Duplicate</button>` : P}${this.canEvent(e) ? M`<button class="danger" @click=${() => this.confirmDelete("calendar", e)}>Delete ${e.recurrence ? "series" : "event"}</button>` : P}</div>`;
	}
	categoryManager() {
		return M`${this.addButton("New category", "category", this.can("manage_recipes"))}<div class="category-list">${(this.data.recipes.categories || []).map((e) => M`<div class="compact-row"><strong class="row-copy">${this.categoryPath(e)}</strong><button @click=${() => this.openEditor("category", e)}>Edit</button><button class="danger" @click=${() => this.confirmDelete("recipes", e, "categories")}>Delete</button></div>`)}</div>`;
	}
	editorFields(e, t) {
		if (e === "delete") return M`<div class="full"><p>Delete <strong>${t.title || t.name || "this item"}</strong>?</p><p class="muted">${this.editor?.collection === "lists" ? "All grocery items on this list will also be removed." : this.editor?.collection === "categories" ? "Recipes are kept. Child categories move to the parent." : t.recurrence ? "This removes the entire repeating event series." : "This cannot be undone."}</p></div>`;
		if (e === "event") {
			let e = (e) => {
				if (!e) return "";
				let t = new Date(e.length === 10 ? `${e}T00:00:00` : e);
				return `${U(t)}T${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
			}, n = e(t.start), r = e(t.end), i = t.day || n.slice(0, 10) || this.selectedDay, a = [
				["", "Does not repeat"],
				["FREQ=DAILY", "Every day"],
				["FREQ=WEEKLY", "Every week"],
				["FREQ=MONTHLY", "Every month"],
				["FREQ=YEARLY", "Every year"]
			];
			return t.recurrence && !a.some(([e]) => e === t.recurrence) && a.push([t.recurrence, `Keep existing: ${t.recurrence}`]), M`${this.field("Event title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Location", "location", t.location)}${this.field("Starts on", "day", i, "date", !0)}${this.field("Ends on (inclusive for all-day)", "end_day", t.all_day && r ? G(r.slice(0, 10), -1) : r.slice(0, 10) || i, "date", !0)}${this.field("Start time", "start", t.start_time || n.slice(11, 16) || "18:00", "time", !0)}${this.field("End time", "end", t.end_time || r.slice(11, 16) || "19:00", "time", !0)}<label class="check full"><input name="all_day" type="checkbox" ?checked=${!!t.all_day}>All-day event (time fields are ignored)</label>${this.select("Repeat", "recurrence", t.recurrence || "", a)}${this.personChecks("person_ids", t.person_ids || (this.can("manage_calendar_all") ? [] : [this.me?.id]), !this.can("manage_calendar_all"))}${this.textarea("Notes", "description", t.description)}${this.shared(t)}`;
		}
		if (e === "grocery") return M`${this.field("Item name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Quantity", "quantity", t.quantity ?? 1, "number", !0, {
			min: .001,
			step: "any"
		})}${this.field("Unit", "unit", t.unit, "text", !1, { placeholder: "cups, kg, packs…" })}${this.select("Grocery list", "list_id", t.list_id || this.listId, (this.data.groceries.lists || []).map((e) => [e.id, e.name]))}<label>Store<input name="store" list="store-options" .value=${t.store || ""}><datalist id="store-options">${(this.settingsData.stores || []).map((e) => M`<option value=${e}></option>`)}</datalist></label><label>Assigned to<select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions(t.assignee_id)}</select></label>${this.textarea("Notes", "notes", t.notes)}${this.shared(t)}`;
		if (e === "list") return M`${this.field("List name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Default store", "store", t.store)}${this.shared(t)}`;
		if (e === "meal") return M`${this.field("Date", "day", t.day || this.selectedDay, "date", !0)}${this.select("Meal slot", "slot", t.slot || t.meal || (this.settingsData.meal_slots || ["dinner"])[0], (this.settingsData.meal_slots || [
			"breakfast",
			"lunch",
			"dinner"
		]).map((e) => [e, e]))}${this.select("Choose a recipe", "recipe_id", t.recipe_id || "", [["", "Use a meal name instead"], ...(this.data.recipes.items || []).map((e) => [e.id, e.title])])}${this.field("Meal name (if not using a recipe)", "title", t.title)}${this.field("Servings", "servings", t.servings || 4, "number", !0, {
			min: .25,
			step: .25
		})}`;
		if (e === "chore") return M`${this.field("Chore title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Points", "points", t.points ?? 5, "number", !0, {
			min: 0,
			step: 1
		})}${this.field("Icon (MDI name)", "icon", t.icon || "mdi:check-circle-outline")}${this.select("Schedule", "schedule", t.schedule || "once", [
			["once", "One time"],
			["daily", "Daily"],
			["weekly", "Weekly"],
			["monthly", "Monthly"],
			["custom", "Custom interval"],
			...t.schedule?.startsWith("weekly:") ? [[t.schedule, "Keep existing weekdays"]] : []
		])}${this.personChecks("assignee_ids", t.assignee_ids || (t.assignee_id ? [t.assignee_id] : []))}<label class="check full"><input name="rotate" type="checkbox" ?checked=${!!t.rotate}>Rotate between assignees after each completion</label><fieldset class="full"><legend>Weekdays (weekly schedule)</legend><div class="checkbox-group">${Array.from({ length: 7 }, (e, n) => M`<label class="check"><input name="weekdays" type="checkbox" value=${n} ?checked=${(t.weekdays || []).includes(n)}>${this.date(G("2026-06-01", n), { weekday: "long" })}</label>`)}</div></fieldset>${this.field("Day of month (monthly)", "month_day", t.month_day || 1, "number", !0, {
			min: 1,
			max: 31
		})}${this.field("Every N days (custom)", "interval_days", t.interval_days || 2, "number", !0, {
			min: 1,
			max: 365
		})}${this.field("Due date (one time)", "due_date", t.due_date || this.selectedDay, "date")}${this.field("Due time", "due_time", t.due_time, "time")}${this.textarea("Description", "description", t.description)}${this.shared(t)}`;
		if (e === "points") return M`<label>Family member<select name="person_id">${this.peopleOptions()}</select></label>${this.field("Points (negative to subtract)", "points", "", "number", !0, { step: 1 })}${this.field("Reason", "note", "", "text", !0)}`;
		if (e === "recipe") return M`${this.field("Recipe title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Tags (comma separated)", "tags", (t.tags || []).join(", "))}${this.field("Image URL", "image", t.image, "url")}${this.field("Base servings", "servings", t.servings || 4, "number", !0, {
			min: .25,
			step: .25
		})}${this.field("Prep time (minutes)", "prep_time", t.prep_time || 0, "number", !0, {
			min: 0,
			step: 1
		})}${this.field("Cook time (minutes)", "cook_time", t.cook_time || 0, "number", !0, {
			min: 0,
			step: 1
		})}<fieldset class="full"><legend>Categories</legend><div class="checkbox-group">${(this.data.recipes.categories || []).map((e) => M`<label class="check"><input name="category_ids" type="checkbox" value=${e.id} ?checked=${(t.category_ids || []).includes(e.id)}>${this.categoryPath(e)}</label>`)}</div></fieldset>${this.textarea("Ingredients (one per line: quantity, optional unit, name)", "ingredients", Me(t.ingredients || []), "1 cup flour\n2  eggs\n1/2 tsp salt")}${this.textarea("Method (one step per line)", "steps", (t.steps || t.instructions || []).join("\n"))}${this.shared(t)}`;
		if (e === "category") {
			let e = (e) => {
				let n = /* @__PURE__ */ new Set(), r = e;
				for (; r;) {
					if (r.id === t.id || n.has(r.id)) return !0;
					n.add(r.id), r = (this.data.recipes.categories || []).find((e) => e.id === r.parent_id);
				}
				return !1;
			};
			return M`${this.field("Category name", "name", t.name, "text", !0, { autofocus: !0 })}${this.select("Parent category", "parent_id", t.parent_id || "", [["", "Root category"], ...(this.data.recipes.categories || []).filter((t) => !e(t)).map((e) => [e.id, this.categoryPath(e)])])}`;
		}
		return e === "person" ? M`${this.field("Name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Family color", "color", this.color(t.color), "color")}${this.field("Home Assistant user ID", "user_id", t.user_id || t.ha_user_id)}${this.field("Profile picture URL", "profile_picture", t.profile_picture || t.avatar_url, "url")}${this.select("Role preset", "role", t.role || "child", [
			["parent_admin", "Family administrator"],
			["parent", "Parent"],
			["child", "Child"]
		])}<p class="muted full">The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.</p><fieldset class="full permissions"><legend>Permission overrides</legend>${Ge.map((e) => this.select(e.replaceAll("_", " "), e, typeof t.permissions?.[e] == "boolean" ? t.permissions[e] ? "allow" : "deny" : "default", [
			["default", "Use role preset"],
			["allow", "Allow"],
			["deny", "Deny"]
		]))}</fieldset>` : e === "preferences" ? M`${this.select("Appearance default", "theme", t.theme || "auto", [
			["auto", "Follow Home Assistant"],
			["light", "Light"],
			["dark", "Dark"]
		])}${this.select("Day overview position", "overview_position", t.overview_position || "right", [["left", "Left"], ["right", "Right"]])}<label class="check full"><input name="overview_collapsed" type="checkbox" ?checked=${!!t.overview_collapsed}>Collapse day overview by default</label>${this.select("Week starts", "week_start", t.week_start || (this.firstDay === 0 ? "sunday" : "monday"), [["monday", "Monday"], ["sunday", "Sunday"]])}${this.select("Time format", "time_format", t.time_format || "24", [["24", "24 hour"], ["12", "12 hour"]])}${this.select("Default calendar view", "default_calendar_view", t.default_calendar_view || "month", [
			["month", "Month"],
			["week", "Week"],
			["day", "Day"]
		])}${this.select("Default grocery list", "default_grocery_list_id", t.default_grocery_list_id || this.listId, (this.data.groceries.lists || []).map((e) => [e.id, e.name]))}${this.field("Meal slots (comma separated)", "meal_slots", (t.meal_slots || [
			"breakfast",
			"lunch",
			"dinner"
		]).join(", "), "text", !0)}${this.field("Stores (comma separated)", "stores", (t.stores || []).join(", "))}${this.select("Competition default", "competition_default", t.competition_default || "week", [["week", "Weekly"], ["month", "Monthly"]])}${this.field("Language code", "language", t.language || this.locale, "text", !0, { placeholder: "en, de, fr…" })}${this.field("Calendar sync interval (minutes)", "sync_interval", t.sync_interval || 30, "number", !0, {
			min: 5,
			max: 1440,
			step: 1
		})}` : P;
	}
	static {
		this.styles = Ue;
	}
};
Z([H()], $.prototype, "page", void 0), Z([H()], $.prototype, "data", void 0), Z([H()], $.prototype, "selectedDay", void 0), Z([H()], $.prototype, "calendarView", void 0), Z([H()], $.prototype, "personFilter", void 0), Z([H()], $.prototype, "listId", void 0), Z([H()], $.prototype, "groceryAssignee", void 0), Z([H()], $.prototype, "groupStores", void 0), Z([H()], $.prototype, "mealWeek", void 0), Z([H()], $.prototype, "scorePeriod", void 0), Z([H()], $.prototype, "recipeSearch", void 0), Z([H()], $.prototype, "recipeCategory", void 0), Z([H()], $.prototype, "recipeId", void 0), Z([H()], $.prototype, "servings", void 0), Z([H()], $.prototype, "selectedIngredients", void 0), Z([H()], $.prototype, "routes", void 0), Z([H()], $.prototype, "theme", void 0), Z([H()], $.prototype, "error", void 0), Z([H()], $.prototype, "notice", void 0), Z([H()], $.prototype, "loading", void 0), Z([H()], $.prototype, "saving", void 0), Z([H()], $.prototype, "editor", void 0), $ = Z([we("family-organizer-panel")], $);
//#endregion
export { $ as FamilyOrganizerPanel };
