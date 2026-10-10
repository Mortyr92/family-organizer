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
var x = globalThis, re = (e) => e, S = x.trustedTypes, ie = S ? S.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ae = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, oe = "?" + C, se = `<${oe}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, ce = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", O = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, A = />/g, j = RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, de = /"/g, fe = /^(?:script|style|textarea|title)$/i, M = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), N = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), pe = /* @__PURE__ */ new WeakMap(), F = w.createTreeWalker(w, 129);
function me(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ie === void 0 ? t : ie.createHTML(t);
}
var he = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (fe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = A : o === j ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? de : ue) : o === de || o === ue ? o = j : o === le || o === A ? o = k : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + ae + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
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
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ae)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? _e : r[1] === "?" ? ve : r[1] === "@" ? ye : z
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (fe.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = S ? S.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), F.nextNode(), c.push({
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
function L(e, t, n = e, r) {
	if (t === N) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		F.currentNode = r;
		let i = F.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new R(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new be(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = F.nextNode(), a++);
		}
		return F.currentNode = w, r;
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
		e = L(this, e, t), E(e) ? e === P || e == null || e === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : e !== this._$AH && e !== N && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== P && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
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
		D(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
		if (i === void 0) e = L(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== N, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = L(this, r[n + o], t, o), s === N && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === P ? e = P : e !== P && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
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
		r._$litPart$ = i = new R(t.insertBefore(T(), e), e, void 0, n ?? {});
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
	if (t !== "month") return G(e, n * (t === "week" ? 7 : t === "list" ? 14 : 1));
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
	if (t === "list") return Array.from({ length: 14 }, (t, n) => G(e, n));
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
	return e === "parent_admin" || e === "parent" || e === "child" && [
		"manage_calendar_own",
		"manage_groceries",
		"manage_todos",
		"manage_meal_plan",
		"complete_own_chores",
		"manage_recipes",
		"manage_journal"
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
		"shared",
		"reminder_minutes"
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
function Re(e, t) {
	let n = String(e || "").match(/^(?:(\d{4})-)?(\d{2})-(\d{2})$/);
	if (!n) return;
	let [, r, i, a] = n, o = `${t.slice(0, 4)}-${i}-${a}`;
	o < t && (o = `${Number(t.slice(0, 4)) + 1}-${i}-${a}`);
	let s = Math.round((W(o).getTime() - W(t).getTime()) / 864e5);
	return {
		date: o,
		days: s,
		age: r ? Number(o.slice(0, 4)) - Number(r) : void 0
	};
}
function ze(e) {
	let t = e.match(/^#fo\/(today|calendar|groceries|todos|chores|recipes|journal|birthdays|settings)(?:\/(.+))?$/);
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
function Be(e, t, n = !1) {
	let r = String(e.created || e.due_date || t).slice(0, 10);
	if (t < r) return !1;
	let i = W(t);
	if (!e.schedule || e.schedule === "once") return t === (e.due_date || r);
	if (n) return !1;
	if (e.schedule === "daily") return !0;
	if (e.schedule === "weekly") return (e.weekdays || []).map(Number).includes((i.getDay() + 6) % 7);
	if (String(e.schedule).startsWith("weekly:")) return String(e.schedule).split(":")[1].split(",").includes(i.toLocaleDateString("en", { weekday: "long" }).toLowerCase());
	if (e.schedule === "monthly") return i.getDate() === Number(e.month_day || W(r).getDate());
	let a = Math.max(1, Number(e.interval_days || String(e.schedule).split(":")[1]) || 1);
	return Math.round((Date.UTC(i.getFullYear(), i.getMonth(), i.getDate()) - Date.UTC(W(r).getFullYear(), W(r).getMonth(), W(r).getDate())) / 864e5) % a === 0;
}
var Ve = {
	morning: {
		start: "07:00",
		end: "11:59"
	},
	afternoon: {
		start: "12:00",
		end: "17:59"
	},
	evening: {
		start: "18:00",
		end: "23:59"
	}
};
function He(e, t, n = /* @__PURE__ */ new Date(), r = Ve, i = !1) {
	if (i) return "done";
	let a = U(n), o = n.toTimeString().slice(0, 5), s = !!e.is_free;
	if (s && e.expires_at && a > String(e.expires_at).slice(0, 10)) return "expired";
	let c = r[e.daypart || "custom"], l = c?.start || void 0, u = c?.end || void 0, d = e.due_time || u;
	if (t > a || t === a && l && o < l) return "upcoming";
	if (t < a || d && o > d) {
		if (e.retry_allowed) {
			let r = Number(e.retry_minutes || 60), i = /* @__PURE__ */ new Date(`${t}T${d || "23:59"}:00`);
			if (n <= new Date(i.getTime() + r * 6e4)) return "retry";
		}
		return s ? "expired" : "late";
	}
	return "active";
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
function Ue(e) {
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
function We(e, t, n) {
	let r = /* @__PURE__ */ new Date(`${t}T00:00:00`), i = /* @__PURE__ */ new Date(`${G(n, 1)}T00:00:00`), a = [];
	for (let t of e) {
		let e = new Date(t.start?.length === 10 ? `${t.start}T00:00:00` : t.start), n = new Date(t.end?.length === 10 ? `${t.end}T00:00:00` : t.end || t.start);
		if (!Number.isFinite(e.getTime())) continue;
		let o = Math.max(0, n.getTime() - e.getTime()) || (t.all_day ? 864e5 : 0), s = Object.fromEntries(String(t.recurrence || "").replace(/^RRULE:/, "").split(";").filter(Boolean).map((e) => e.split("="))), c = !Ue(t.recurrence), l = (s) => {
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
function Ge(e) {
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
var Ke = o`
  :host { display:block; min-height:100vh; font:14px/1.5 Inter, "Segoe UI", system-ui, -apple-system, sans-serif; color:var(--primary-text-color,#2f2a24); }
  * { box-sizing:border-box; }
  .app { --bg:var(--primary-background-color,#f6f0e8); --surface:var(--card-background-color,#fffaf4); --text:var(--primary-text-color,#2f2a24); --muted:var(--secondary-text-color,#71665d); --line:var(--divider-color,#e8ddd1); --soft:var(--secondary-background-color,#f4e9dd); --orange:#c85a23; --orange-soft:color-mix(in srgb,var(--orange) 12%,var(--surface)); --green:#3f7654; --shadow:0 16px 48px rgba(45, 28, 12, .08); display:flex; position:relative; min-height:100vh; background:radial-gradient(circle at top left, rgba(255,255,255,.72), transparent 34%), radial-gradient(circle at top right, rgba(232, 187, 146, .2), transparent 28%), var(--bg); color:var(--text); }
  .app::before { content:""; position:fixed; inset:0; pointer-events:none; background:linear-gradient(180deg, rgba(255,255,255,.34), transparent 24%); }
  .app[data-theme=light] { --bg:#f6f0e8; --surface:#fffaf4; --text:#2f2a24; --muted:#74695f; --line:#e7dbcf; --soft:#f3e8da; }
  .app[data-theme=dark] { --bg:#161412; --surface:#201c18; --text:#f4eee7; --muted:#c5b8ab; --line:#42372f; --soft:#2c241e; --orange:#f0a15e; --orange-soft:#39271b; --green:#95d0ad; --shadow:0 16px 48px rgba(0, 0, 0, .28); }
  button,input,select,textarea { font:inherit; color:inherit; }
  button,a,input,select,textarea,summary { -webkit-tap-highlight-color:transparent; }
  button,.button-link { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:40px; padding:9px 14px; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--text); cursor:pointer; font-weight:650; text-decoration:none; transition:background .15s,border-color .15s,transform .15s,box-shadow .15s; box-shadow:0 1px 0 rgba(255,255,255,.45) inset; }
  button:hover:not(:disabled),.button-link:hover { background:var(--soft); border-color:color-mix(in srgb,var(--text) 20%,var(--line)); transform:translateY(-1px); }
  button:disabled { opacity:.5; cursor:not-allowed; }
  button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible { outline:3px solid var(--orange); outline-offset:3px; }
  input,select,textarea { width:100%; min-height:42px; padding:10px 12px; background:var(--surface); border:1px solid var(--line); border-radius:14px; box-shadow:0 1px 0 rgba(255,255,255,.45) inset; }
  input[type=checkbox] { width:19px; height:19px; min-height:19px; padding:0; accent-color:var(--orange); flex-shrink:0; }
  input[type=color] { padding:4px; }
  input[type=date] { min-width:140px; width:auto; color-scheme:light dark; }
  [data-theme=light] input { color-scheme:light; }
  [data-theme=dark] input { color-scheme:dark; }
  textarea { resize:vertical; }
  label { display:flex; flex-direction:column; gap:6px; font-weight:600; font-size:13px; }
  h1,h2,h3,p { margin:0; }
  h1 { font-size:34px; letter-spacing:-1.3px; font-weight:760; line-height:1.15; }
  h2 { font-size:24px; letter-spacing:-.55px; line-height:1.28; }
  h3 { font-size:18px; letter-spacing:-.25px; }
  p { margin:8px 0; }
  small { font-size:12px; }
  hr { border:0; border-top:1px solid var(--line); margin:28px 0; }
  .muted { color:var(--muted); font-weight:400; }
  .eyebrow { font-size:10px; letter-spacing:2.1px; color:var(--muted); font-weight:760; text-transform:uppercase; }
  .primary,.quick-add { background:linear-gradient(135deg,#c85a23,#a33b18); color:#fff; border-color:#a33b18; box-shadow:0 10px 24px rgba(200,90,35,.18); }
  .primary:hover:not(:disabled),.quick-add:hover:not(:disabled) { background:linear-gradient(135deg,#b84d1d,#922f11); border-color:#922f11; }
  .danger { color:var(--error-color,#bb342f); }
  [data-theme=dark] .danger { color:#ffb4ab; }
  .danger-primary { color:#fff; background:#af302c; border-color:#af302c; }
  .icon-button { min-width:40px; padding:5px 10px; font-size:21px; line-height:1; }
  .text-button { padding:0; min-height:28px; background:none; border:0; font-size:12px; justify-content:flex-start; box-shadow:none; }
  .subtle { border:0; background:none; color:var(--muted); box-shadow:none; }
  .wide { width:100%; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .skip-link { position:fixed; top:-80px; left:16px; background:var(--surface); color:var(--text); padding:12px 14px; z-index:100; border-radius:999px; border:1px solid var(--line); box-shadow:var(--shadow); }
  .skip-link:focus { top:12px; }
  .sidebar { width:280px; min-width:280px; padding:24px 18px 18px; background:color-mix(in srgb,var(--surface) 90%,transparent); border-right:1px solid var(--line); position:sticky; height:100vh; top:0; display:flex; flex-direction:column; overflow-y:auto; backdrop-filter:blur(18px); box-shadow:12px 0 40px rgba(33, 23, 13, .05); }
  .sidebar nav button .nav-icon { font-size:20px; width:25px; text-align:center; }
  .brand { display:flex; align-items:center; gap:11px; text-decoration:none; color:var(--text); font-size:18px; line-height:1.15; letter-spacing:-.4px; padding:10px 12px; border-radius:22px; background:var(--surface); border:1px solid var(--line); box-shadow:var(--shadow); }
  .brand-symbol { width:46px; height:46px; border-radius:16px; background:linear-gradient(135deg,#d96f2d,#aa4217); color:#fff; display:grid; place-items:center; font-size:30px; box-shadow:0 8px 18px rgba(170,66,23,.22); }
  .sidebar>.eyebrow { margin:10px 12px 4px; font-size:9px; }
  .sidebar nav { display:flex; flex-direction:column; gap:8px; margin-top:8px; flex:0 0 auto; }
  .sidebar nav button { display:flex; width:100%; justify-content:flex-start; gap:11px; padding:13px 14px; border:1px solid transparent; background:transparent; border-radius:18px; font-size:13px; color:var(--muted); text-align:left; }
  .sidebar nav button.active { color:var(--orange); background:var(--orange-soft); border-color:color-mix(in srgb,var(--orange) 18%,var(--line)); box-shadow:0 10px 20px rgba(200,90,35,.08); }
  .sidebar nav button:hover:not(.active) { background:color-mix(in srgb,var(--surface) 80%,var(--soft)); color:var(--text); }
  .nav-icon { font-size:22px; width:25px; text-align:center; }
  .sidebar-family { margin-top:10px; padding:18px 14px; border:1px solid var(--line); border-radius:20px; background:var(--surface); box-shadow:var(--shadow); }
  .avatar-stack { display:flex; margin-top:15px; padding-left:3px; flex-wrap:wrap; }
  .avatar-stack .avatar { border:2px solid var(--surface); margin-left:-3px; width:33px; height:33px; }
  .sidebar-family p { font-size:11px; color:var(--muted); margin-top:10px; }
  .sidebar-feature-links { display:flex; flex-direction:column; gap:10px; margin-top:14px; }
  .sidebar-feature-links strong { display:block; }
  .sidebar-feature-links small { display:block; margin-top:4px; }
  .sidebar-note { color:var(--muted); padding:16px 12px 0; font-size:10px; }
  .sidebar-ha-menu { margin:12px 0 0; min-height:44px; justify-content:flex-start; font-size:12px; color:var(--muted); border:1px solid var(--line); background:var(--surface); border-radius:16px; box-shadow:var(--shadow); }
  .ha-menu-icon { display:inline-block; position:relative; width:20px; height:16px; border-top:2px solid currentColor; border-bottom:2px solid currentColor; }
  .ha-menu-icon:after { content:""; position:absolute; left:0; right:0; top:5px; height:2px; background:currentColor; }
  .workspace { width:calc(100% - 280px); min-width:0; overflow-x:hidden; position:relative; }
  .app[data-bottom-nav=true] .sidebar { display:none; }
  .app[data-bottom-nav=true] .workspace { width:100%; }
  .topbar { padding:28px 32px 18px; display:flex; align-items:center; justify-content:space-between; gap:20px; max-width:1400px; margin:0 auto; }
  .topbar h1 { margin-top:4px; }
  .topbar p { color:var(--muted); margin-bottom:0; font-size:13px; }
  .quick-add { position:sticky; top:10px; left:auto; width:100%; z-index:3; flex-shrink:0; border-radius:999px; padding:10px 17px; margin:10px 8px 14px; }
  .quick-add>span { font-size:24px; font-weight:400; line-height:1; }
  main { padding:0 32px 40px; outline:none; max-width:1400px; margin:auto; }
  .app[data-bottom-nav=true] main { padding-bottom:132px; }
  .floating-nav { position:fixed; left:50%; bottom:18px; transform:translateX(-50%); z-index:50; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; width:fit-content; max-width:min(calc(100vw - 32px), 920px); overflow-x:auto; scrollbar-width:none; border:1px solid color-mix(in srgb,var(--line) 75%,transparent); border-radius:999px; background:color-mix(in srgb,var(--surface) 92%,transparent); box-shadow:0 18px 42px rgba(33,23,13,.18); backdrop-filter:blur(18px); -webkit-overflow-scrolling:touch; }
  .floating-nav::-webkit-scrollbar { display:none; }
  .floating-nav button { border-radius:999px; min-height:54px; padding:10px 14px; gap:4px; flex-direction:column; font-size:11px; line-height:1.05; white-space:nowrap; background:transparent; border-color:transparent; box-shadow:none; }
  .floating-nav button>span:first-child { font-size:24px; line-height:1; }
  .floating-nav button.active { color:var(--orange); background:var(--orange-soft); border-color:color-mix(in srgb,var(--orange) 18%,var(--line)); box-shadow:0 10px 20px rgba(200,90,35,.12); }
  .floating-nav .ha-shell-menu { gap:5px; }
  .floating-nav .ha-shell-menu>span:last-child { font-size:11px; line-height:1.05; }
  .mobile-nav { display:none; }
  .banner { display:flex; justify-content:space-between; align-items:center; gap:14px; padding:14px 18px; border-radius:18px; margin-bottom:18px; background:var(--surface); border:1px solid var(--line); box-shadow:var(--shadow); }
  .banner.error { color:var(--error-color,#bc302b); background:color-mix(in srgb,var(--error-color,#bc302b) 10%,var(--surface)); overflow-wrap:anywhere; }
  [data-theme=dark] .banner.error { color:#ffb4ab; }
  .banner.success { color:var(--green); }
  .saving { color:var(--muted); }
  .surface,.calendar-surface,.agenda { background:var(--surface); border:1px solid var(--line); border-radius:24px; box-shadow:var(--shadow); }
  .surface { padding:26px; }
  .surface-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:20px; }
  .surface-heading h2 { margin-top:5px; }
  .section-toolbar { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin:0 0 20px; padding:18px 20px; border:1px solid var(--line); border-radius:24px; background:linear-gradient(180deg,var(--surface),color-mix(in srgb,var(--soft) 52%,var(--surface))); box-shadow:var(--shadow); }
  .date-navigation,.toolbar-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .date-navigation h2 { margin-left:9px; font-size:21px; }
  .segmented { display:inline-flex; background:var(--soft); border:1px solid var(--line); border-radius:999px; padding:4px; }
  .segmented button { min-height:32px; border:0; background:transparent; color:var(--muted); padding:5px 13px; font-size:12px; box-shadow:none; }
  .segmented button.active { background:var(--surface); color:var(--text); box-shadow:0 4px 12px rgba(0,0,0,.05); }
  .family-filters { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:18px; }
  .chip { border-radius:999px; font-size:12px; min-height:36px; padding:4px 12px 4px 5px; font-weight:550; }
  .chip:first-child { padding-left:13px; }
  .chip.active { color:var(--orange); border-color:var(--orange); background:var(--orange-soft); }
  .avatar { display:inline-grid; place-items:center; width:29px; height:29px; min-width:29px; border-radius:50%; object-fit:cover; vertical-align:middle; box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--person-color,#64748b); }
  .avatar-stack .avatar,.agenda-event .avatar,.chip .avatar { box-shadow:0 0 0 1.5px var(--surface), 0 0 0 3px var(--person-color,#64748b); }
  .calendar-header { display:grid; grid-template-columns:minmax(160px,1.2fr) minmax(0,1fr) auto; gap:12px; align-items:center; margin:0 0 16px; padding:16px 18px; border:0; border-radius:24px; color:#fff; background:linear-gradient(135deg,#5e7fc6 0%,#8ca5d6 100%); box-shadow:var(--shadow); }
  .calendar-header-day { display:flex; flex-direction:column; align-items:flex-start; gap:2px; border:0; background:none; padding:0; color:inherit; text-align:left; box-shadow:none; }
  .calendar-header-day strong { font-size:19px; line-height:1.2; }
  .calendar-header-day small { color:inherit; opacity:.85; font-size:12px; font-weight:500; }
  .calendar-header-kicker { font-size:10px; text-transform:uppercase; letter-spacing:1.9px; color:inherit; opacity:.75; font-weight:760; }
  .calendar-header-people { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .calendar-person { width:38px; height:38px; min-width:38px; padding:0; border-radius:50%; border:2px solid transparent; box-shadow:none; background:none; }
  .calendar-person.active { border-color:#fff; }
  .calendar-header-actions { display:flex; flex-direction:column; align-items:flex-end; gap:8px; justify-self:end; }
  .calendar-header-filter { display:inline-flex; align-items:center; gap:6px; padding:9px 14px; border:1px solid rgba(255,255,255,.55); border-radius:999px; background:rgba(255,255,255,.18); color:#fff; font-weight:600; cursor:pointer; box-shadow:none; }
  .calendar-header-add { display:inline-flex; align-items:center; gap:6px; padding:9px 14px; border:1px solid rgba(255,255,255,.55); border-radius:999px; background:rgba(255,255,255,.18); color:#fff; font-weight:600; cursor:pointer; box-shadow:none; }
  .calendar-header-add:disabled { opacity:.5; cursor:not-allowed; }
  .calendar-header-nav { display:flex; align-items:center; gap:8px; justify-self:end; }
  .calendar-header-nav button { background:rgba(255,255,255,.18); color:#fff; border:1px solid rgba(255,255,255,.4); }
  .calendar-header-nav button.icon-button { background:rgba(255,255,255,.18); }
  .calendar-popup-backdrop { position:fixed; inset:0; z-index:120; display:grid; place-items:center; padding:18px; background:rgba(23,18,14,.32); backdrop-filter:blur(5px); }
  .calendar-popup { width:min(920px,100%); max-height:min(88vh,920px); overflow:auto; background:var(--surface); border:1px solid var(--line); border-radius:28px; box-shadow:var(--shadow); padding:18px; }
  .calendar-popup-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
  .calendar-popup-header p { margin-top:4px; color:var(--muted); }
  .popup-tabs { width:100%; margin-bottom:14px; }
  .popup-section { display:flex; flex-direction:column; gap:16px; }
  .popup-section .full-search input { margin-top:6px; }
  .popup-columns { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
  .popup-columns section { display:flex; flex-direction:column; gap:10px; }
  .popup-columns h4 { margin:0 0 2px; font-size:13px; }
  .toggle-row { width:100%; justify-content:space-between; gap:10px; border-radius:18px; padding:10px 12px; text-align:left; box-shadow:none; }
  .toggle-row.hidden { opacity:.55; }
  .toggle-row span:first-child { display:flex; flex-direction:column; gap:2px; min-width:0; text-align:left; }
  .toggle-row strong { display:flex; align-items:center; gap:8px; }
  .toggle-row small { color:var(--muted); font-size:11px; }
  .calendar-search { display:flex; align-items:center; gap:8px; }
  .calendar-search input { min-width:180px; border-radius:999px; padding:8px 14px; }
  .list-view { display:flex; flex-direction:column; gap:0; padding:0; border:1px solid var(--line); border-radius:24px; overflow:hidden; background:var(--surface); }
  .list-hero { display:grid; grid-template-columns:auto 1fr auto; grid-template-areas:"date people actions" "weather weather weather"; gap:12px 20px; align-items:center; padding:22px 22px 18px; color:#fff; background:linear-gradient(135deg,#5e7fc6 0%,#8ca5d6 100%); }
  .list-hero-date { grid-area:date; display:flex; flex-direction:column; align-items:flex-start; gap:2px; border:0; background:none; padding:0; color:inherit; text-align:left; cursor:pointer; box-shadow:none; }
  .list-hero-date p { margin:0; font-size:18px; opacity:.95; text-transform:capitalize; }
  .list-hero-date strong { display:block; font-size:48px; line-height:1; font-weight:700; margin-top:2px; }
  .list-hero-date span { font-size:28px; text-transform:capitalize; }
  .list-hero-date:hover strong { text-decoration:underline; }
  .list-hero-people { grid-area:people; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .list-hero-person { display:inline-flex; padding:0; border:2px solid transparent; border-radius:50%; background:none; cursor:pointer; box-shadow:none; }
  .list-hero-person .avatar { width:44px; height:44px; min-width:44px; font-size:15px; }
  .list-hero-person.active { border-color:#fff; }
  .list-hero-actions { grid-area:actions; justify-self:end; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
  .list-hero-filter,.list-hero-add { display:inline-flex; align-items:center; gap:6px; padding:9px 14px; border:1px solid rgba(255,255,255,.55); border-radius:999px; background:rgba(255,255,255,.18); color:#fff; font-weight:600; cursor:pointer; box-shadow:none; width:100%; justify-content:center; }
  .list-hero-add:disabled { opacity:.5; cursor:not-allowed; }
  .list-hero-weather { grid-area:weather; display:flex; align-items:baseline; flex-wrap:wrap; gap:4px 12px; margin-top:4px; }
  .list-hero-weather strong { font-size:44px; line-height:1; margin:0; }
  .list-hero-weather span { font-size:22px; }
  .list-hero-weather small { font-size:16px; opacity:.9; }
  .list-day { background:var(--surface); }
  .list-day h3 { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:12px; margin:0; padding:12px 16px; background:color-mix(in srgb,var(--soft) 70%,var(--surface)); border-top:1px solid var(--line); font-size:28px; font-weight:650; text-transform:lowercase; }
  .list-day h3 small { font-size:22px; font-weight:550; color:var(--text); }
  .list-day-icon { color:#88a1cf; font-size:20px; }
  .list-day .muted.empty-day { font-size:16px; padding:10px 14px; }
  .list-event { display:grid; grid-template-columns:190px 48px minmax(0,1fr) auto; gap:14px; align-items:center; width:100%; text-align:left; border:0; border-top:1px solid var(--line); border-radius:0; padding:14px 14px; margin:0; background:var(--surface); font-size:34px; color:var(--text); }
  .list-event:hover:not(:disabled) { background:var(--soft); }
  .list-event .event-time { font-size:34px; color:var(--text); letter-spacing:.1px; }
  .list-event .event-type { display:inline-grid; place-items:center; width:38px; height:38px; border-radius:10px; background:var(--event-color); font-size:22px; }
  .list-event .event-category-icon,.event-chip-icon { display:inline-grid; place-items:center; }
  .event-chip-icon { font-size:11px; width:16px; height:16px; border-radius:50%; background:rgba(255,255,255,.34); }
  .list-event .event-copy strong { display:block; font-weight:650; line-height:1.15; }
  .list-event .event-copy .muted { display:block; font-size:24px; margin-top:2px; color:var(--muted); }
  .list-event .event-people { display:flex; justify-content:flex-end; gap:6px; }
  .list-event .event-people .avatar { width:34px; height:34px; min-width:34px; box-shadow:0 0 0 2px #fff, 0 0 0 4px var(--person-color,#64748b); }
  .fallback { background:var(--person-color,#64748b); color:#fff; font-size:10px; font-weight:750; text-shadow:0 1px 2px #0007; box-shadow:inset 0 0 0 1px #0001; }
  .calendar-shell { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:20px; align-items:start; }
  .calendar-shell.overview-left { grid-template-columns:250px minmax(0,1fr); }
  .calendar-shell.overview-bottom { grid-template-columns:minmax(0,1fr); }
  .overview-left .agenda { order:-1; }
  .overview-bottom .agenda { order:2; }
  .calendar-shell.overview-closed,.calendar-shell.overview-left.overview-closed,.calendar-shell.overview-bottom.overview-closed { grid-template-columns:minmax(0,1fr); }
  .overview-closed .agenda { order:2; padding:5px 14px; }
  .calendar-surface { overflow:hidden; }
  .weekday-row { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); background:var(--soft); border-bottom:1px solid var(--line); }  .weekday-row span { padding:13px 7px; text-align:center; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; font-weight:700; }
  .month-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); }
  .month-cell { position:relative; min-height:120px; padding:6px 6px 8px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); background:var(--surface); }
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
  .time-scroll { overflow:auto; max-height:calc(100vh - 190px); min-height:480px; }
  .time-calendar { min-width:calc(56px + var(--days) * 110px); }
  .time-header,.all-day-row { display:grid; grid-template-columns:56px repeat(var(--days),minmax(0,1fr)); }
  .time-header { background:var(--surface); position:sticky; top:0; z-index:30; border-bottom:1px solid var(--line); }
  .time-header button { border:0; border-right:1px solid var(--line); border-radius:0; flex-direction:column; padding:8px; font-weight:400; }
  .time-header button.active { background:var(--orange-soft); }
  .time-header button strong { font-size:18px; min-width:30px; }
  .all-day-row { min-height:45px; border-bottom:1px solid var(--line); background:var(--soft); }
  .all-day-row>span { font-size:9px; color:var(--muted); padding:9px 4px; }
  .all-day-row>div { padding:5px; border-left:1px solid var(--line); }
  .all-day-row .subtle { padding:0 6px; min-height:24px; }
  .time-body { display:grid; grid-template-columns:56px repeat(var(--days),minmax(0,1fr)); }
  .time-labels { position:sticky; left:0; z-index:20; background:var(--surface); }
  .time-labels span { display:block; height:60px; padding:0 8px 0 0; text-align:right; font-size:11px; color:var(--muted); transform:translateY(-7px); }
  .time-labels span:first-child { visibility:hidden; }
  .time-column { position:relative; border-left:1px solid var(--line); }
  .hour-slot { display:block; width:100%; height:60px; min-height:60px; border:0; border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent); border-radius:0; background:none; padding:0; }
  .hour-slot:hover:not(:disabled) { background:color-mix(in srgb,var(--orange) 8%,transparent); }
  .positioned-events { position:absolute; inset:0; pointer-events:none; }
  .positioned-events .event-chip { position:absolute; display:block; box-sizing:border-box; margin:0; padding:2px 6px; pointer-events:auto; font-size:12px; line-height:1.25; border:0; border-radius:5px; box-shadow:0 0 0 1px var(--surface); background:var(--event-color); color:#fff; overflow:hidden; }
  .positioned-events .event-chip:hover:not(:disabled) { filter:brightness(.92); background:var(--event-color); }
  .positioned-events .event-chip>span { display:block; overflow:hidden; text-overflow:ellipsis; }
  .positioned-events .event-chip .event-chip-icon { display:none; }
  .positioned-events .event-chip strong { display:block; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .positioned-events .event-chip .event-start { display:block; font-size:11px; font-weight:400; opacity:.9; }
  .time-header button strong.today { display:inline-grid; place-items:center; width:32px; height:32px; border-radius:50%; background:var(--orange); color:#fff; }
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
  .lists-toolbar { margin-bottom:14px; }
  .list-type-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; }
  .list-type-chips .chip { font-size:12px; padding:7px 14px; border-radius:999px; background:var(--soft); border:1px solid var(--line); color:var(--orange); }
  .lists-overview { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:18px; align-items:start; }
  .list-card { padding:18px; display:flex; flex-direction:column; gap:4px; }
  .list-card-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
  .list-card-heading h3 { color:var(--orange); font-size:16px; }
  .list-card-menu { display:flex; gap:2px; }
  .list-card-menu .icon-button { min-width:30px; min-height:30px; padding:2px; font-size:15px; border:0; background:transparent; }
  .list-card-items { display:flex; flex-direction:column; }
  .list-card-empty { padding:8px 0; font-size:12px; }
  .list-item-row { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; padding:9px 0; border-bottom:1px solid var(--line); }
  .list-item-row:last-child { border-bottom:0; }
  .list-item-row label.check { flex:1 1 140px; min-width:140px; font-weight:500; }
  .list-item-row label.check span { display:inline-block; white-space:normal; word-break:normal; overflow-wrap:break-word; }
  .list-item-row.checked label.check span { text-decoration:line-through; color:var(--muted); }
  .list-item-row>.icon-button { flex:0 0 auto; min-width:30px; min-height:30px; padding:2px; font-size:15px; border:0; background:transparent; }
  .qty-stepper { flex:0 0 auto; display:flex; align-items:center; gap:4px; border:1px solid var(--line); border-radius:999px; padding:2px; background:var(--surface); }
  .qty-stepper span { min-width:22px; text-align:center; font-size:12px; font-weight:650; }
  .qty-stepper .icon-button { min-width:26px; min-height:26px; padding:0; font-size:15px; border:0; background:transparent; line-height:1; }
  .list-card-done { margin-top:8px; font-size:12px; color:var(--muted); }
  .list-card-done summary { cursor:pointer; color:var(--orange); }
  .lists-footer { margin-top:22px; }
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
  .score-row { display:flex; align-items:center; gap:12px; margin:23px 0; }
  .score-row .avatar { flex:0 0 auto; }
  .rank { width:15px; flex:0 0 auto; color:var(--orange); }
  .score-row .row-copy { font-size:12px; }
  .score-row progress { width:100%; height:6px; accent-color:var(--orange); border:0; overflow:hidden; border-radius:5px; }
  .tasks-routines .toolbar-actions { display:flex; gap:10px; align-items:center; }
  .pause-toggle { font-size:16px; width:38px; height:38px; border-radius:50%; background:var(--soft); border:1px solid var(--line); }
  .paused-banner { background:color-mix(in srgb,var(--orange) 14%,var(--surface)); color:var(--orange); border:1px solid var(--orange); border-radius:10px; padding:10px 16px; margin:10px 0 18px; font-weight:600; text-align:center; }
  .person-task-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:18px; margin:18px 0 24px; }
  .person-task-card { display:flex; flex-direction:column; gap:14px; padding:18px; }
  .free-task-card { border:1px dashed var(--line); background:color-mix(in srgb,var(--surface) 92%,var(--muted) 4%); }
  .person-task-header { display:flex; align-items:center; gap:10px; }
  .person-task-header .avatar { width:36px; height:36px; min-width:36px; }
  .person-task-header .points-badge { margin-left:auto; }
  .free-icon { width:36px; height:36px; min-width:36px; border-radius:50%; background:var(--soft); display:grid; place-items:center; font-size:18px; }
  .task-group { display:flex; flex-direction:column; gap:8px; }
  .task-group > .eyebrow { font-size:10px; letter-spacing:.6px; color:var(--muted); }
  .task-list { display:flex; flex-direction:column; gap:8px; min-height:16px; }
  .task-empty { padding:8px 0; font-size:11px; }
  .task-tile { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:var(--soft); border:1px solid var(--line); }
  .task-tile .task-icon { width:28px; height:28px; min-width:28px; border-radius:9px; background:var(--orange-soft); color:var(--orange); display:grid; place-items:center; font-size:16px; }
  .task-tile .row-copy { min-width:0; flex:1; }
  .task-tile .row-copy strong { display:block; font-size:12px; overflow-wrap:anywhere; }
  .status-pill { display:inline-block; font-size:9px; padding:2px 7px; border-radius:20px; margin-top:2px; }
  .status-active .status-pill, .status-pill.status-active { background:color-mix(in srgb,var(--green) 16%,var(--surface)); color:var(--green); }
  .status-upcoming .status-pill, .status-pill.status-upcoming { background:color-mix(in srgb,#64748b 16%,var(--surface)); color:#64748b; }
  .status-late .status-pill, .status-pill.status-late, .status-expired .status-pill, .status-pill.status-expired { background:color-mix(in srgb,#b33930 14%,var(--surface)); color:#b33930; }
  .status-retry .status-pill, .status-pill.status-retry { background:color-mix(in srgb,var(--orange) 16%,var(--surface)); color:var(--orange); }
  .status-done .status-pill, .status-pill.status-done { background:color-mix(in srgb,var(--green) 22%,var(--surface)); color:var(--green); }
  .task-tile.status-done { opacity:.75; }
  .confetti-overlay { position:fixed; inset:0; display:grid; place-items:center; font-size:64px; pointer-events:none; z-index:999; animation:confetti-pop 1.4s ease-out; }
  @keyframes confetti-pop { 0% { opacity:0; transform:scale(.4); } 30% { opacity:1; transform:scale(1.2); } 100% { opacity:0; transform:scale(1.4); } }
  .target-dialog { max-width:320px; }
  .target-options { display:flex; flex-direction:column; gap:10px; }
  @media(max-width:950px) { .person-task-grid { grid-template-columns:minmax(0,1fr); } }
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
  .meal-title-field { position:relative; }
  .meal-title-suggestions { position:absolute; top:100%; left:0; right:0; z-index:5; margin:4px 0 0; padding:4px; list-style:none; background:var(--surface); border:1px solid var(--line); border-radius:10px; box-shadow:0 8px 20px rgba(0,0,0,.15); max-height:200px; overflow-y:auto; }
  .meal-title-suggestions li { margin:0; }
  .meal-title-suggestions button { width:100%; text-align:left; padding:8px 10px; border:0; background:none; border-radius:7px; font-size:13px; }
  .meal-title-suggestions button:hover, .meal-title-suggestions button:focus { background:var(--orange-soft); }
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
  .today-page.person-day-page { display:flex; flex-direction:column; gap:18px; }
  .today-member-strip.person-day-strip { display:flex; flex-direction:column; gap:12px; padding:16px 18px; border-radius:18px; border:1px solid var(--line); background:linear-gradient(180deg,var(--surface),color-mix(in srgb,var(--soft) 55%,var(--surface))); box-shadow:var(--shadow); }
  .person-day-head h3 { margin-top:4px; }
  .person-day-nav { display:flex; align-items:center; gap:10px; }
  .person-day-strip-avatars { display:flex; align-items:center; gap:8px; overflow:auto; padding:2px 2px 2px 0; scrollbar-width:none; }
  .person-day-strip-avatars::-webkit-scrollbar { display:none; }
  .person-day-strip-avatars .person-pick { min-width:auto; opacity:.65; flex:0 0 auto; }
  .person-day-strip-avatars .person-pick.active { opacity:1; }
  .person-day-strip-avatars .avatar { width:42px; height:42px; min-width:42px; }
  .person-day-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:18px; }
  .person-day-grid .surface { display:flex; flex-direction:column; gap:4px; }
  .person-day-grid .surface>.primary { margin-top:auto; align-self:flex-start; }
  .person-day-grid .agenda-event { width:100%; }
  .person-day-grid .compact-row { padding:9px 0; }
  .person-day-grid .compact-row.done { opacity:.55; text-decoration:line-through; }
  .person-day-grid .eyebrow { margin-top:12px; }
  .journal-excerpt { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .journal-feed { display:flex; flex-direction:column; gap:16px; margin-top:22px; }
  .journal-entry { display:flex; gap:20px; align-items:flex-start; --event-color:var(--orange); }
  .journal-body { flex:1; min-width:0; }
  .journal-body p { white-space:pre-wrap; }
  .journal-photos { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; margin:12px 0; }
  .journal-photos img { width:100%; height:140px; object-fit:cover; border-radius:10px; }
  .journal-actions { display:flex; gap:6px; }
  .contact-group { margin:22px 0 10px; font-size:.95rem; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); }
  .contact-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
  .contact-card { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; }
  .contact-card .row-copy { display:grid; gap:4px; flex:1; min-width:0; }
  .contact-card h3 { margin:0 0 2px; }
  .contact-card a { color:var(--accent); text-decoration:none; font-weight:600; overflow-wrap:anywhere; }
  .contact-card a:hover { text-decoration:underline; }
  .contact-avatar { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-weight:700; background:var(--accent-soft, rgba(240,120,40,.16)); color:var(--accent); flex-shrink:0; }
  .import-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:12px 0; }
  .import-row input { flex:1; min-width:220px; }
  .birthday-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .birthday-card { display:flex; align-items:center; gap:14px; border-left:5px solid var(--person-color); }
  .birthday-card .avatar { width:46px; height:46px; min-width:46px; font-size:15px; }
  .birthday-card.today { background:var(--orange-soft); }
  .countdown { white-space:nowrap; color:var(--orange); }
  .list-tools .check { flex-direction:row; align-items:center; }
  @media(min-width:1600px) { .month-cell { min-height:145px; } .calendar-shell { grid-template-columns:minmax(0,1fr) 280px; } .calendar-shell.overview-left { grid-template-columns:280px minmax(0,1fr); } .calendar-shell.overview-bottom { grid-template-columns:minmax(0,1fr); } }
  @media(max-width:1200px) { .sidebar { width:190px; min-width:190px; padding:25px 12px 15px; } .quick-add { width:100%; font-size:12px; margin:8px 4px 12px; } .workspace { width:calc(100% - 190px); } .topbar { padding:24px; } main { padding:0 24px 30px; } .calendar-shell,.calendar-shell.overview-left,.calendar-shell.overview-bottom { grid-template-columns:minmax(0,1fr); } .calendar-shell .agenda { order:2; } .agenda-events { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:15px 0; } .agenda-event { margin:0; } .agenda>.primary { width:auto; } .agenda .empty { grid-column:1/-1; } .month-cell { min-height:118px; } .shopping-layout { grid-template-columns:minmax(0,1fr) 220px; } .chore-layout { grid-template-columns:minmax(0,1fr) 285px; } .meal-grid { overflow-x:auto; grid-template-columns:repeat(7,minmax(140px,1fr)); padding-bottom:8px; } }
  @media(max-width:950px) { .sidebar { width:170px; min-width:170px; } .quick-add { width:100%; margin:8px 2px 12px; } .workspace { width:calc(100% - 170px); } .brand { font-size:15px; gap:7px; } .brand-symbol { width:34px; height:38px; font-size:26px; } .sidebar nav button { font-size:11px; gap:7px; } .sidebar>.eyebrow { font-size:8px; } .shopping-layout,.chore-layout,.settings-grid { grid-template-columns:minmax(0,1fr); } .shopping-list { padding:20px; } .chore-layout .leaderboard { order:2; } .leaderboard .score-row { margin:16px 0; } .recipe-detail-grid { grid-template-columns:minmax(0,1fr); } .recipe-hero { grid-template-columns:230px 1fr; gap:22px; } .recipe-hero>img,.recipe-hero-art { height:210px; } .recipe-hero h2 { font-size:28px; } .date-navigation h2 { font-size:19px; } .section-toolbar { gap:12px; } .recipe-toolbar { flex-wrap:wrap; } .search-label { min-width:220px; } }
  @media(max-width:700px) {
    .sidebar { display:none; } .quick-add { position:fixed; top:43px; left:auto; right:16px; width:auto; margin:0; z-index:45; } .app { max-width:100vw; overflow-x:hidden; } .workspace { width:100%; } .topbar { padding:23px 130px 21px 16px; align-items:flex-start; gap:10px; }
    .event-start { font-size:9px; }
    .mobile-nav { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(62px,1fr); overflow-x:auto; scrollbar-width:none; position:fixed; bottom:0; left:0; right:0; padding:6px 4px max(6px,env(safe-area-inset-bottom)); background:var(--surface); border-top:1px solid var(--line); z-index:40; box-shadow:0 -3px 15px #00000014; -webkit-overflow-scrolling:touch; }
    .mobile-nav::-webkit-scrollbar { display:none; }
    .mobile-nav button { background:none; border:0; border-radius:8px; padding:4px 2px; flex-direction:column; gap:1px; color:var(--muted); font-size:9px; font-weight:500; min-height:50px; white-space:nowrap; } .mobile-nav button>span { font-size:21px; line-height:1.2; } .mobile-nav button.active { color:var(--orange); background:var(--orange-soft); }
    main { padding:0 14px calc(132px + env(safe-area-inset-bottom)); }
    .today-grid,.person-day-grid,.contact-grid,.recipe-grid,.people-grid,.settings-grid { grid-template-columns:minmax(0,1fr); }
    .lock-screen { margin:0; }
    .surface,.section-toolbar,.toolbar-actions,.recipe-toolbar,.list-tools,.compact-row,.chore-card,.grocery-row { min-width:0; max-width:100%; }
    .section-toolbar,.toolbar-actions { flex-wrap:wrap; }
    .topbar h1,.topbar p,.surface h2,.surface h3,.row-copy,.row-copy * { overflow-wrap:anywhere; }
    img { max-width:100%; }
    .mobile-nav .ha-shell-menu { gap:6px; } .mobile-nav .ha-shell-menu>span:last-child { font-size:9px; line-height:1.2; }
    .time-scroll { max-height:calc(100dvh - 240px); } .time-calendar { min-width:calc(50px + var(--days) * 95px); }
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
    .app .qty-stepper .icon-button { min-width:36px; min-height:36px; }
    .app .check { min-height:44px; }
    .app input[type=checkbox] { appearance:none; position:relative; display:grid; place-items:center; width:44px; min-width:44px; height:44px; min-height:44px; border:0; padding:0; background:transparent; border-radius:6px; }
    .app input[type=checkbox]:before { content:""; width:20px; height:20px; border:1px solid var(--muted); border-radius:4px; background:var(--surface); }
    .app input[type=checkbox]:checked:before { background:#c45013; border-color:#c45013; }
    .app input[type=checkbox]:checked:after { content:"✓"; position:absolute; color:white; font-size:17px; font-weight:700; }
    .app input[type=checkbox]:disabled { opacity:.5; }
  }
  @media(max-width:700px) {
    .qudoo-list .list-hero { padding:14px; grid-template-columns:1fr auto; grid-template-areas:"date actions" "people people" "weather weather"; }
    .qudoo-list .list-hero-date p { font-size:14px; }
    .qudoo-list .list-hero-date strong { font-size:34px; }
    .qudoo-list .list-hero-date span { font-size:20px; }
    .qudoo-list .list-hero-people { justify-content:flex-start; }
    .qudoo-list .list-hero-person .avatar { width:38px; height:38px; min-width:38px; }
    .qudoo-list .list-hero-weather strong { font-size:30px; }
    .qudoo-list .list-hero-weather span { font-size:16px; }
    .qudoo-list .list-day h3 { font-size:22px; padding:8px 10px; }
    .qudoo-list .list-day h3 small { font-size:16px; }
    .qudoo-list .list-event { grid-template-columns:120px 32px minmax(0,1fr) auto; font-size:18px; padding:10px; }
    .qudoo-list .list-event .event-time { font-size:18px; }
    .qudoo-list .list-event .event-type { width:28px; height:28px; font-size:16px; }
    .qudoo-list .list-event .event-copy .muted { font-size:14px; }
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
function qe(e) {
	try {
		return new Set(JSON.parse(localStorage.getItem(e) || "[]"));
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function Je(e, t) {
	localStorage.setItem(e, JSON.stringify([...t]));
}
var Ye = [
	"people",
	"calendar",
	"groceries",
	"chores",
	"recipes",
	"contacts",
	"settings"
], Xe = [
	"manage_people",
	"manage_calendar_all",
	"manage_calendar_own",
	"manage_groceries",
	"manage_todos",
	"manage_meal_plan",
	"manage_chores",
	"complete_own_chores",
	"complete_any_chore",
	"manage_recipes",
	"manage_contacts",
	"manage_settings",
	"manage_calendar_sync"
], Q = [
	{
		id: "today",
		name: "Today",
		icon: "☀",
		subtitle: "Everything your family has going on, at a glance."
	},
	{
		id: "calendar",
		name: "Calendar",
		icon: "▦",
		subtitle: "A little less juggling. A little more together."
	},
	{
		id: "lists",
		name: "Lists",
		icon: "☑",
		subtitle: "To-do, shopping and grocery lists, all in one place."
	},
	{
		id: "recipes",
		name: "Meals",
		icon: "♧",
		subtitle: "Good food worth making again."
	},
	{
		id: "chores",
		name: "Tasks & Routines",
		icon: "✓",
		subtitle: "Small contributions. A happier home."
	},
	{
		id: "birthdays",
		name: "Birthdays",
		icon: "♡",
		subtitle: "Never miss a chance to celebrate."
	},
	{
		id: "settings",
		name: "Settings",
		icon: "⚙",
		subtitle: "Make your organizer feel like home."
	}
], Ze = {
	en: {
		settings: "Settings",
		shopping: "Shopping",
		lock: "Lock",
		unlock_title: "Unlock Family Organizer",
		unlock_text: "Choose your family profile and enter your PIN.",
		family_member: "Family member",
		pin: "PIN",
		unlock: "Unlock",
		retry: "Retry",
		try_again: "Try again",
		getting_together: "Getting your family together…",
		loading_copy: "Loading your calendar, lists and favorite recipes.",
		save: "Save",
		cancel: "Cancel",
		close_dialog: "Close dialog",
		delete: "Delete",
		saving: "Saving…",
		saving_changes: "Saving your changes…",
		yes: "Yes",
		no: "No",
		skip_content: "Skip to content",
		quick_add: "Quick add",
		family_sync: "YOUR FAMILY, IN SYNC",
		our_people: "OUR PEOPLE",
		family_starts: "Your family starts here.",
		made_together: "Made for everyday together.",
		could_not_load: "Couldn’t load your organizer",
		check_connection_permissions: "Check your connection and family permissions.",
		calendar_exported: "Calendar exported. Import the .ics file into any calendar app.",
		could_not_export_calendar: "Could not export the calendar",
		recipe_not_found: "Recipe not found",
		recipe_missing_access: "It may have been deleted or is no longer shared with you.",
		all_recipes: "All recipes",
		view_only: "You have a view-only account",
		ask_admin_permissions: "Ask a family administrator to adjust your permissions.",
		open_ha_navigation: "Open Home Assistant navigation",
		ha_menu: "HA menu",
		home_assistant: "Home Assistant",
		role_parent: "Parent",
		role_child: "Child",
		role_admin: "Family administrator",
		permission_overrides: "permission overrides",
		ha_linked: "HA account linked",
		ha_not_linked: "No HA account linked",
		unassigned: "Unassigned",
		unknown_error: "Unexpected error"
	},
	nl: {
		settings: "Instellingen",
		shopping: "Boodschappen",
		lock: "Vergrendel",
		unlock_title: "Ontgrendel Family Organizer",
		unlock_text: "Kies je familieprofiel en voer je pincode in.",
		family_member: "Familielid",
		pin: "Pincode",
		unlock: "Ontgrendelen",
		retry: "Opnieuw",
		try_again: "Probeer opnieuw",
		getting_together: "Familieoverzicht laden…",
		loading_copy: "Je agenda, lijsten en recepten worden geladen.",
		save: "Opslaan",
		cancel: "Annuleren",
		close_dialog: "Dialoog sluiten",
		delete: "Verwijderen",
		saving: "Opslaan…",
		saving_changes: "Wijzigingen worden opgeslagen…",
		yes: "Ja",
		no: "Nee",
		skip_content: "Ga naar inhoud",
		quick_add: "Snel toevoegen",
		family_sync: "JULLIE GEZIN, IN SYNC",
		our_people: "ONZE MENSEN",
		family_starts: "Jullie gezin begint hier.",
		made_together: "Gemaakt voor elke dag samen.",
		could_not_load: "Organizer kon niet worden geladen",
		check_connection_permissions: "Controleer je verbinding en gezinsrechten.",
		calendar_exported: "Agenda geëxporteerd. Importeer het .ics-bestand in je agenda-app.",
		could_not_export_calendar: "Kon de agenda niet exporteren",
		recipe_not_found: "Recept niet gevonden",
		recipe_missing_access: "Het recept is verwijderd of niet meer met je gedeeld.",
		all_recipes: "Alle recepten",
		view_only: "Je account heeft alleen-lezen toegang",
		ask_admin_permissions: "Vraag een gezinsbeheerder om je rechten aan te passen.",
		open_ha_navigation: "Open Home Assistant-navigatie",
		ha_menu: "HA-menu",
		home_assistant: "Home Assistant",
		role_parent: "Ouder",
		role_child: "Kind",
		role_admin: "Gezinsbeheerder",
		permission_overrides: "rechten aangepast",
		ha_linked: "HA-account gekoppeld",
		ha_not_linked: "Geen HA-account gekoppeld",
		unassigned: "Niet toegewezen",
		unknown_error: "Onverwachte fout"
	}
}, Qe = {
	en: {},
	nl: {
		"This recipe link is malformed. Showing your cookbook instead.": "Deze receptenlink is ongeldig. Je kookboek wordt getoond.",
		"Enter a 4 to 8 digit PIN.": "Voer een pincode van 4 tot 8 cijfers in.",
		"Incorrect PIN": "Onjuiste pincode",
		"This family member has no PIN yet": "Dit familielid heeft nog geen pincode",
		"User is not linked to a family person": "Gebruiker is niet gekoppeld aan een familielid",
		"Home Assistant user is already linked": "Deze Home Assistant-gebruiker is al gekoppeld",
		"The event must end after it starts.": "De afspraak moet eindigen na de start.",
		"Choose at least one weekday.": "Kies minimaal één weekdag.",
		"Choose a recipe or enter a meal name.": "Kies een recept of voer een maaltijdnaam in.",
		"That meal slot is already planned. Edit it from the planner instead.": "Dit maaltijdslot is al ingepland. Bewerk het vanuit de planner.",
		"Enter at least one meal slot.": "Kies minimaal één maaltijdslot.",
		"Enter a valid language code, such as en, de or fr.": "Kies een geldige taalcode, zoals en of nl.",
		"Could not download the page": "Kon de pagina niet downloaden",
		"No recipe data was found on that page. Try copying it in manually.": "Er is geen receptdata gevonden op die pagina. Voeg het recept handmatig toe."
	}
}, $e = {
	Saved: "Opgeslagen",
	Edit: "Bewerken",
	Delete: "Verwijderen",
	Remove: "Verwijderen",
	Anyone: "Iedereen",
	Everyone: "Iedereen",
	"Family member": "Familielid",
	"Family members": "Familieleden",
	Notes: "Notities",
	Name: "Naam",
	Date: "Datum",
	Title: "Titel",
	Description: "Omschrijving",
	"Assigned to": "Toegewezen aan",
	"Share with the family": "Delen met het gezin",
	"All day": "Hele dag",
	"Not planned": "Niet gepland",
	"Done ✓": "Klaar ✓",
	pts: "ptn",
	servings: "porties",
	more: "meer",
	"Main navigation": "Hoofdnavigatie",
	"Mobile navigation": "Mobiele navigatie",
	"Dismiss notification": "Melding sluiten",
	Household: "Huishouden",
	"Keep in touch": "Contact houden",
	Discover: "Ontdekken",
	"App only": "Alleen app",
	Premium: "Premium",
	"Help & contact": "Hulp & contact",
	"Daily planning made calm": "Rustig en overzichtelijk plannen",
	"A calm, editorial home for everything your family needs.": "Een rustige, redactionele start voor alles wat je gezin nodig heeft.",
	"Calendar, daily planning and meals.": "Agenda, dagplanning en maaltijden.",
	"Groceries, todos and chores.": "Boodschappen, taken en klussen.",
	"Journal, birthdays, contacts and settings.": "Dagboek, verjaardagen, contacten en instellingen.",
	"Use the organizer on your own tablet or phone.": "Gebruik de organizer op je eigen tablet of telefoon.",
	"Tidy extras and calmer defaults.": "Handige extra's en rustiger standaardinstellingen.",
	"Questions, manuals and support.": "Vragen, handleidingen en support.",
	"Our family in one calm place": "Ons gezin op één rustige plek",
	Home: "Home",
	Shop: "Winkel",
	Support: "Support",
	"people. One shared home.": "mensen. Eén gedeeld thuis.",
	Welcome: "Welkom",
	"Copy from Home Assistant user": "Kopiëren van Home Assistant-gebruiker",
	"Don’t link a Home Assistant user": "Geen Home Assistant-gebruiker koppelen",
	"Keep profile picture in sync with Home Assistant": "Profielfoto synchroon houden met Home Assistant",
	"Only users that aren’t linked to another family member are listed. The name and profile picture are copied over.": "Alleen gebruikers die nog niet aan een ander familielid zijn gekoppeld worden getoond. De naam en profielfoto worden overgenomen.",
	"SHOPPING LIST": "BOODSCHAPPENLIJST",
	Groceries: "Boodschappen",
	"to buy": "te kopen",
	"in the basket": "in de mand",
	"Add item": "Item toevoegen",
	"Grocery lists": "Boodschappenlijsten",
	"Group by store": "Groeperen op winkel",
	"Clear bought": "Gekochte wissen",
	"Bought items cleared": "Gekochte items gewist",
	"No store": "Geen winkel",
	"Moved back to your list": "Terug op je lijst gezet",
	"Added to the basket": "In de mand gelegd",
	"A fresh start": "Een frisse start",
	"No items assigned to this person.": "Geen items toegewezen aan deze persoon.",
	"Add an item or send ingredients from a recipe.": "Voeg een item toe of stuur ingrediënten vanuit een recept.",
	"Add your first item": "Voeg je eerste item toe",
	"A LITTLE ORGANIZATION": "EEN BEETJE ORDE",
	"One list for every stop": "Eén lijst voor elke winkel",
	"Keep the supermarket, farmers’ market and pantry runs separate. Matching items merge automatically.": "Houd supermarkt, markt en voorraadkast gescheiden. Gelijke items worden automatisch samengevoegd.",
	"New list": "Nieuwe lijst",
	"Edit list": "Lijst bewerken",
	"Delete list": "Lijst verwijderen",
	"Deleting a list also removes its grocery items. Keep at least one list.": "Als je een lijst verwijdert, verdwijnen ook de items. Houd minimaal één lijst.",
	"What’s cooking?": "Wat eten we?",
	"Plan the week and shop recipe ingredients straight into this list.": "Plan de week en zet receptingrediënten direct op deze lijst.",
	"Meal planner & recipes →": "Maaltijdplanner & recepten →",
	Mark: "Markeer",
	bought: "gekocht",
	"Created by": "Gemaakt door",
	"a family member": "een familielid",
	"LESS “WHAT’S FOR DINNER?”": "MINDER “WAT ETEN WE VANAVOND?”",
	"Your weekly meal plan": "Jullie weekmenu",
	"Previous meal week": "Vorige maaltijdweek",
	"Next meal week": "Volgende maaltijdweek",
	"This week": "Deze week",
	"Recipe →": "Recept →",
	"Plan meal": "Maaltijd plannen",
	on: "op",
	from: "van",
	breakfast: "ontbijt",
	lunch: "lunch",
	dinner: "diner",
	"TEAMWORK MAKES HOME WORK": "SAMENWERKEN LAAT HET THUIS WERKEN",
	"The chore board": "Het klussenbord",
	"New chore": "Nieuwe klus",
	"Chores for": "Klussen voor",
	scheduled: "gepland",
	completed: "afgerond",
	"Nice work!": "Goed gedaan!",
	Overdue: "Te laat",
	Due: "Uiterlijk",
	today: "vandaag",
	rotating: "roulerend",
	Complete: "Afronden",
	"Completions are recorded for today": "Afrondingen worden voor vandaag geregistreerd",
	"Chore completed. Thank you!": "Klus afgerond. Dankjewel!",
	"All clear for this day": "Alles gedaan voor deze dag",
	"Schedule a chore to share the load.": "Plan een klus om het werk te verdelen.",
	"Create a chore": "Klus maken",
	"You’re browsing another day. Chore completions are recorded for today only.": "Je bekijkt een andere dag. Klusafrondingen worden alleen voor vandaag geregistreerd.",
	"All scheduled chores": "Alle geplande klussen",
	"A FRIENDLY LITTLE COMPETITION": "EEN VRIENDELIJKE KLEINE COMPETITIE",
	"Family leaderboard": "Familieklassement",
	"Score period": "Scoreperiode",
	"This month": "Deze maand",
	points: "punten",
	"Meet your team": "Maak kennis met je team",
	"Add family members in Settings.": "Voeg familieleden toe in Instellingen.",
	"Last week’s star": "Ster van vorige week",
	"Last month’s star": "Ster van vorige maand",
	"A fresh start for everyone": "Een frisse start voor iedereen",
	"EVERY CONTRIBUTION COUNTS": "ELKE BIJDRAGE TELT",
	"Recent activity": "Recente activiteit",
	"Adjust points": "Punten aanpassen",
	"Manual adjustment": "Handmatige aanpassing",
	"Completed chore": "Afgeronde klus",
	"Your story starts here": "Jullie verhaal begint hier",
	"Completed chores and point adjustments will appear here.": "Afgeronde klussen en puntenaanpassingen verschijnen hier.",
	daily: "dagelijks",
	weekly: "wekelijks",
	monthly: "maandelijks",
	one_time: "eenmalig",
	interval: "interval",
	"THE FAMILY COOKBOOK": "HET GEZINSKOOKBOEK",
	"Favorites, all in one place": "Favorieten, allemaal op één plek",
	"Import from web": "Importeren van internet",
	"New recipe": "Nieuw recept",
	"Search recipes or tags": "Zoek recepten of tags",
	"Search recipes or tags…": "Zoek recepten of tags…",
	Category: "Categorie",
	"All categories": "Alle categorieën",
	"Manage categories": "Categorieën beheren",
	"FROM OUR KITCHEN": "UIT ONZE KEUKEN",
	"Family favorite": "Gezinsfavoriet",
	min: "min",
	"No recipes match": "Geen recepten gevonden",
	"Start your family cookbook": "Begin jullie gezinskookboek",
	"Save a favorite recipe, scale its servings and send ingredients to your lists.": "Bewaar een favoriet recept, pas de porties aan en stuur ingrediënten naar je lijsten.",
	"Add a recipe": "Recept toevoegen",
	"All recipes": "Alle recepten",
	"Edit recipe": "Recept bewerken",
	"FROM THE FAMILY COOKBOOK": "UIT HET GEZINSKOOKBOEK",
	Prep: "Voorbereiding",
	Cook: "Bereiding",
	"Plan this meal": "Deze maaltijd plannen",
	Ingredients: "Ingrediënten",
	"Decrease servings": "Minder porties",
	"Increase servings": "Meer porties",
	Servings: "Porties",
	"automatically scaled from": "automatisch omgerekend vanaf",
	"Check ingredients to send to your grocery lists.": "Vink ingrediënten aan om ze naar je boodschappenlijsten te sturen.",
	"List for": "Lijst voor",
	"ingredients sent to your grocery lists": "ingrediënten naar je boodschappenlijsten gestuurd",
	"Add selected to groceries": "Selectie aan boodschappen toevoegen",
	"LET’S MAKE SOMETHING GOOD": "LATEN WE IETS LEKKERS MAKEN",
	Method: "Bereidingswijze",
	"No instructions yet. Edit this recipe to add the method.": "Nog geen bereidingswijze. Bewerk dit recept om stappen toe te voegen.",
	"New category": "Nieuwe categorie",
	"Good morning": "Goedemorgen",
	"Good afternoon": "Goedemiddag",
	"Good evening": "Goedenavond",
	"A quiet calendar": "Een rustige agenda",
	event: "afspraak",
	events: "afspraken",
	chore: "klus",
	chores: "klussen",
	"to do": "te doen",
	turns: "wordt",
	"soon turns": "wordt binnenkort",
	"another year": "een jaar ouder",
	"today 🎉": "vandaag 🎉",
	in: "over",
	day: "dag",
	days: "dagen",
	"TODAY’S AGENDA": "AGENDA VAN VANDAAG",
	Calendar: "Agenda",
	"Open calendar →": "Agenda openen →",
	"Nothing scheduled today.": "Niets gepland vandaag.",
	"COMING UP": "BINNENKORT",
	"Add an event": "Afspraak toevoegen",
	"WHAT’S FOR DINNER?": "WAT ETEN WE VANAVOND?",
	Meals: "Maaltijden",
	"Meal planner →": "Maaltijdplanner →",
	SHOPPING: "BOODSCHAPPEN",
	"Shopping lists →": "Boodschappenlijsten →",
	"TO DO": "TAKEN",
	open: "open",
	"To-do lists →": "Takenlijsten →",
	"Nice, one less thing": "Mooi, weer één minder",
	"Add to-do": "Taak toevoegen",
	CHORES: "KLUSSEN",
	"Chore board →": "Klussenbord →",
	"No chores due today.": "Geen klussen voor vandaag.",
	"FAMILY JOURNAL": "GEZINSDAGBOEK",
	"Latest moment": "Laatste moment",
	"Journal →": "Dagboek →",
	"Write down something worth remembering.": "Schrijf iets op dat je wilt onthouden.",
	"New entry": "Nieuw item",
	"Need groceries instead?": "Toch boodschappen nodig?",
	"Record first words, big wins and ordinary days you don’t want to forget.": "Leg eerste woordjes, grote overwinningen en gewone dagen vast die je niet wilt vergeten.",
	"No entries for this family member yet.": "Nog geen items voor dit familielid.",
	"Write the first entry": "Schrijf het eerste item",
	Other: "Overig",
	"No matches": "Geen resultaten",
	"Keep everyone close": "Houd iedereen dichtbij",
	"Try a different search.": "Probeer een andere zoekopdracht.",
	"Babysitters, school, the dentist, grandparents: one shared place for every number.": "Oppas, school, de tandarts, opa en oma: één gedeelde plek voor elk nummer.",
	"Add the first contact": "Voeg het eerste contact toe",
	"CELEBRATE TOGETHER": "SAMEN VIEREN",
	"Upcoming birthdays": "Aankomende verjaardagen",
	"Add a person": "Persoon toevoegen",
	"Today 🎉": "Vandaag 🎉",
	Tomorrow: "Morgen",
	"No birthdays yet": "Nog geen verjaardagen",
	"Add a birthday to each family member in Settings and we’ll count down for you.": "Voeg bij Instellingen een verjaardag toe aan elk familielid en wij tellen af.",
	"Family members without a birthday": "Familieleden zonder verjaardag",
	"Add birthday": "Verjaardag toevoegen",
	"FAMILY ORGANIZER": "FAMILY ORGANIZER",
	"Calendar event": "Agenda-afspraak",
	"Make time for what matters": "Maak tijd voor wat belangrijk is",
	"Shopping item": "Boodschap",
	"Remember it before you forget it": "Noteer het voor je het vergeet",
	"To-do": "Taak",
	"Get it off your mind and onto the list": "Uit je hoofd, op de lijst",
	"Planned meal": "Geplande maaltijd",
	"Give dinner a little direction": "Geef het avondeten richting",
	"Family chore": "Gezinsklus",
	"Share the load, celebrate the effort": "Verdeel het werk, vier de inzet",
	"Favorite recipe": "Favoriet recept",
	"Keep a good thing close": "Bewaar wat lekker is",
	"Journal entry": "Dagboekitem",
	"Save a moment worth remembering": "Bewaar een moment om te onthouden",
	Contact: "Contact",
	"A number the whole family can find": "Een nummer dat het hele gezin kan vinden",
	"All to-dos on this list will also be removed.": "Alle taken op deze lijst worden ook verwijderd.",
	"All grocery items on this list will also be removed.": "Alle boodschappen op deze lijst worden ook verwijderd.",
	"Recipes are kept. Child categories move to the parent.": "Recepten blijven bewaard. Subcategorieën gaan naar de bovenliggende categorie.",
	"This removes the entire repeating event series.": "Hiermee verwijder je de hele herhalende reeks.",
	"This cannot be undone.": "Dit kan niet ongedaan worden gemaakt.",
	"this item": "dit item",
	"Does not repeat": "Herhaalt niet",
	"Every day": "Elke dag",
	"Every week": "Elke week",
	"Every month": "Elke maand",
	"Every year": "Elk jaar",
	"Keep existing:": "Huidige behouden:",
	"Event title": "Titel afspraak",
	Location: "Locatie",
	"Starts on": "Begint op",
	"Ends on (inclusive for all-day)": "Eindigt op (inclusief bij hele dag)",
	"Start time": "Starttijd",
	"End time": "Eindtijd",
	"All-day event (time fields are ignored)": "Hele dag (tijden worden genegeerd)",
	Repeat: "Herhalen",
	Reminder: "Herinnering",
	"Family default": "Gezinsstandaard",
	"No reminder": "Geen herinnering",
	"At start": "Bij aanvang",
	"5 minutes before": "5 minuten vooraf",
	"15 minutes before": "15 minuten vooraf",
	"30 minutes before": "30 minuten vooraf",
	"1 hour before": "1 uur vooraf",
	"2 hours before": "2 uur vooraf",
	"1 day before": "1 dag vooraf",
	"Item name": "Naam item",
	Quantity: "Aantal",
	Unit: "Eenheid",
	"cups, kg, packs…": "stuks, kg, pakken…",
	"Grocery list": "Boodschappenlijst",
	Store: "Winkel",
	"List name": "Naam lijst",
	"Default store": "Standaardwinkel",
	"What needs doing?": "Wat moet er gebeuren?",
	List: "Lijst",
	"Due date": "Deadline",
	"Recipe page URL": "URL van de receptpagina",
	"We read the recipe details most cooking sites publish, then let you review before saving.": "We lezen de receptgegevens die de meeste kooksites publiceren en laten je alles controleren voordat je opslaat.",
	Group: "Groep",
	"School, Doctors, Family, Friends…": "School, Artsen, Familie, Vrienden…",
	"Phone numbers (one per line)": "Telefoonnummers (één per regel)",
	"Email addresses (one per line)": "E-mailadressen (één per regel)",
	Address: "Adres",
	"Opening hours, who to ask for…": "Openingstijden, naar wie je vraagt…",
	"What happened?": "Wat is er gebeurd?",
	"First steps, a big win, a funny thing someone said…": "Eerste stapjes, een grote overwinning, iets grappigs dat iemand zei…",
	"Photo URLs (one per line)": "Foto-URL’s (één per regel)",
	"Points (negative to subtract)": "Punten (negatief om af te trekken)",
	Reason: "Reden",
	"Type to search your recipes…": "Zoek in recepten",
	"Recipe title": "Titel recept",
	"Tags (comma separated)": "Tags (gescheiden door komma’s)",
	"Image URL": "Afbeeldings-URL",
	"Base servings": "Basisporties",
	"Prep time (minutes)": "Voorbereidingstijd (minuten)",
	"Cook time (minutes)": "Bereidingstijd (minuten)",
	Categories: "Categorieën",
	"Ingredients (one per line: quantity, optional unit, name)": "Ingrediënten (één per regel: hoeveelheid, eventueel eenheid, naam)",
	"Method (one step per line)": "Bereidingswijze (één stap per regel)",
	"Category name": "Naam categorie",
	"Parent category": "Bovenliggende categorie",
	"Root category": "Hoofdcategorie",
	"Family color": "Gezinskleur",
	"Home Assistant user ID": "Home Assistant-gebruikers-ID",
	"Profile picture URL": "URL profielfoto",
	Birthday: "Verjaardag",
	"Role preset": "Rol",
	"Parent (all rights)": "Ouder (alle rechten)",
	"Child (limited rights)": "Kind (beperkte rechten)",
	"PIN code (4-8 digits)": "Pincode (4-8 cijfers)",
	"Enter new PIN to change": "Voer een nieuwe pincode in om te wijzigen",
	"Set a PIN": "Stel een pincode in",
	"Remove existing PIN for this family member": "Bestaande pincode van dit familielid verwijderen",
	"The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.": "Het gebruikers-ID koppelt het Home Assistant-account van deze persoon. Aangepaste rechten gaan vóór de rol.",
	"Permission overrides": "Aangepaste rechten",
	"Use role preset": "Volg rol",
	Allow: "Toestaan",
	Deny: "Weigeren",
	"Appearance default": "Standaarduiterlijk",
	"Follow Home Assistant": "Volg Home Assistant",
	Light: "Licht",
	Dark: "Donker",
	"Day overview position": "Positie dagoverzicht",
	Left: "Links",
	Right: "Rechts",
	"Collapse day overview by default": "Dagoverzicht standaard inklappen",
	"Week starts": "Week begint op",
	Monday: "Maandag",
	Sunday: "Zondag",
	"Time format": "Tijdnotatie",
	"24 hour": "24 uur",
	"12 hour": "12 uur",
	"Default calendar view": "Standaard agendaweergave",
	Month: "Maand",
	Week: "Week",
	Day: "Dag",
	"Grocery default": "Standaard boodschappenlijst",
	"Weekly groceries": "Wekelijkse boodschappen",
	"Daily groceries": "Dagelijkse boodschappen",
	"Random list": "Willekeurige lijst",
	"Meal slots": "Maaltijdvakken",
	Breakfast: "Ontbijt",
	Lunch: "Lunch",
	Dinner: "Diner",
	"Stores (comma separated)": "Winkels (gescheiden door komma’s)",
	"Competition default": "Standaard competitie",
	Language: "Taal",
	"Calendar sync interval (minutes)": "Synchronisatie-interval agenda (minuten)",
	"Send event reminders": "Herinneringen voor afspraken sturen",
	"Default reminder (minutes before)": "Standaardherinnering (minuten vooraf)",
	"Notify service (e.g. mobile_app_phone)": "Notificatiedienst (bijv. mobile_app_phone)",
	"Leave empty for Home Assistant notifications": "Laat leeg voor Home Assistant-meldingen",
	"Daily agenda time (optional)": "Tijd dagelijkse agenda (optioneel)",
	"manage people": "personen beheren",
	"manage calendar all": "hele agenda beheren",
	"manage calendar own": "eigen agenda beheren",
	"manage groceries": "boodschappen beheren",
	"manage todos": "taken beheren",
	"manage meal plan": "maaltijdplanning beheren",
	"manage chores": "klussen beheren",
	"complete own chores": "eigen klussen afronden",
	"complete any chore": "alle klussen afronden",
	"manage recipes": "recepten beheren",
	"manage journal": "dagboek beheren",
	"manage contacts": "contacten beheren",
	"manage settings": "instellingen beheren",
	"manage calendar sync": "agendasynchronisatie beheren"
}, et = {
	today: {
		en: ["Today", "Everything your family has going on, at a glance."],
		nl: ["Vandaag", "Alles wat je gezin gepland heeft, in één oogopslag."]
	},
	calendar: {
		en: ["Calendar", "A little less juggling. A little more together."],
		nl: ["Agenda", "Minder gedoe. Meer samen."]
	},
	groceries: {
		en: ["Shopping", "From the weekly plan to the shopping basket."],
		nl: ["Boodschappen", "Van weekplanning naar boodschappenmand."]
	},
	todos: {
		en: ["To Do", "Lists for everything that isn’t groceries."],
		nl: ["Taken", "Lijstjes voor alles behalve boodschappen."]
	},
	recipes: {
		en: ["Meals", "Good food worth making again."],
		nl: ["Maaltijden", "Lekkere recepten om vaker te maken."]
	},
	chores: {
		en: ["Tasks & Routines", "Small contributions. A happier home."],
		nl: ["Taakjes & Routines", "Kleine bijdragen, een fijner thuis."]
	},
	lists: {
		en: ["Lists", "To-do, shopping and grocery lists, all in one place."],
		nl: ["Lijstjes", "Taken, boodschappen en winkellijstjes, allemaal op één plek."]
	},
	birthdays: {
		en: ["Birthdays", "Never miss a chance to celebrate."],
		nl: ["Verjaardagen", "Mis nooit een moment om te vieren."]
	},
	contacts: {
		en: ["Contacts", "The people who keep your family running."],
		nl: ["Contacten", "De mensen die je gezin draaiende houden."]
	},
	settings: {
		en: ["Settings", "Make your organizer feel like home."],
		nl: ["Instellingen", "Maak je organizer helemaal van jullie."]
	}
}, $ = class extends V {
	constructor(...e) {
		super(...e), this.page = "today", this.data = {}, this.selectedDay = U(/* @__PURE__ */ new Date()), this.calendarView = "list", this.personFilter = /* @__PURE__ */ new Set(), this.listId = "default", this.contactQuery = "", this.groceryAssignee = "", this.groupStores = !1, this.mealWeek = 0, this.scorePeriod = "week", this.recipeSearch = "", this.recipeCategory = "", this.recipeId = "", this.servings = {}, this.selectedIngredients = {}, this.routes = {}, this.theme = localStorage.getItem("family-organizer-theme") || "auto", this.error = "", this.calendarOverlay = null, this.hiddenCalendarSources = qe("family-organizer-hidden-calendar-sources"), this.hiddenCalendarCategories = qe("family-organizer-hidden-calendar-categories"), this.notice = "", this.pinPersonId = localStorage.getItem("family-organizer-person-id") || "", this.todayPersonId = localStorage.getItem("family-organizer-today-person-id") || "", this.settingsPinPersonId = localStorage.getItem("family-organizer-settings-person-id") || "", this.settingsUnlocked = !1, this.loading = !0, this.saving = !1, this.mealTitleQuery = "", this.haUsers = [], this.calendarSearch = "", this.celebrate = !1, this.subscribing = !1, this.initialized = !1, this.loadSequence = 0, this.readRoute = () => {
			let e = ze(location.hash);
			e && (this.page = e.page, this.recipeId = e.recipeId, e.page === "settings" && (this.settingsUnlocked = !1, this.pinCapabilites = void 0), e.malformed && (this.notice = this.tm("This recipe link is malformed. Showing your cookbook instead.")));
		};
	}
	set hass(e) {
		let t = !this._hass;
		this._hass = e, t && this.load(), this.requestUpdate();
	}
	connectedCallback() {
		super.connectedCallback(), window.addEventListener("hashchange", this.readRoute), this.readRoute(), this._hass && this.load();
	}
	updated() {
		let e = this.renderRoot.querySelector(".time-scroll");
		e && !e.dataset.scrolled && (e.dataset.scrolled = "1", e.scrollTop = 420);
	}
	disconnectedCallback() {
		this.unsubscribe?.(), this.unsubscribe = void 0, window.removeEventListener("hashchange", this.readRoute), super.disconnectedCallback();
	}
	navigate(e, t = "") {
		this.page = e, this.recipeId = t, e === "settings" && (this.settingsUnlocked = !1, this.pinCapabilites = void 0), location.hash = `fo/${e}${t ? `/${encodeURIComponent(t)}` : ""}`;
	}
	get settingsData() {
		return this.data.settings || {};
	}
	get languageCode() {
		return this.settingsData.language === "nl" ? "nl" : "en";
	}
	t(e) {
		return Ze[this.languageCode][e] || Ze.en[e] || e;
	}
	s(e, t) {
		return this.languageCode === "nl" ? t : e;
	}
	x(e) {
		return this.languageCode === "nl" ? $e[e] ?? e : e;
	}
	tm(e) {
		if (!e) return e;
		let t = Qe[this.languageCode] || {};
		if (t[e]) return t[e];
		for (let [n, r] of Object.entries(t)) if (e.includes(n)) return e.replace(n, r);
		return e;
	}
	pageName(e, t) {
		return et[e]?.[this.languageCode]?.[0] || t;
	}
	pageSubtitle(e, t) {
		return et[e]?.[this.languageCode]?.[1] || t;
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
		if (this.pinPersonId) return this.people.find((e) => e.id === this.pinPersonId) || this.people.find((e) => e.id === this.settingsData.current_user?.person_id);
		if (this.settingsData.current_user) return this.people.find((e) => e.id === this.settingsData.current_user.person_id);
		let e = this._hass?.user?.id;
		return e ? this.people.find((t) => (t.user_id || t.ha_user_id) === e) : void 0;
	}
	can(e) {
		let t = this.pinCapabilites?.[e];
		if (typeof t == "boolean") return t;
		let n = this.me;
		if (n?.role === "parent" || n?.role === "parent_admin" || this._hass?.user?.is_admin) return !0;
		let r = this.settingsData.current_user?.capabilities?.[e];
		return typeof r == "boolean" ? r : n ? n.permissions?.[e] ?? Pe(n.role, e) : !1;
	}
	canEvent(e) {
		return this.can("manage_calendar_all") || this.can("manage_calendar_own") && (!e || (e.person_ids || []).includes(this.me?.id) || [this.me?.id, this._hass?.user?.id].includes(e.creator_id));
	}
	person(e) {
		return this.people.find((t) => t.id === e);
	}
	avatar(e) {
		let t = this.person(e), n = t?.profile_picture || t?.avatar_url;
		return n ? M`<img class="avatar" src=${n} alt=${t.name} style=${`--person-color:${this.color(t?.color)}`} loading="lazy" referrerpolicy="no-referrer">` : M`<span class="avatar fallback" style=${`--person-color:${this.color(t?.color)}`} aria-label=${t?.name || this.t("unassigned")}>${t?.initials || t?.name?.split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase() || "?"}</span>`;
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
	weatherHero() {
		let e = this._hass?.states || {}, t = Object.keys(e).find((e) => e.startsWith("weather.")), n = t ? e[t] : void 0, r = n?.attributes || {}, i = Number(r.temperature), a = String(r.temperature_unit || "°C"), o = String(r.friendly_name || n?.state || this.s("No weather data", "Geen weerdata")), s = String(r.forecast?.[0]?.condition || r.precipitation_probability ? `${r.forecast?.[0]?.condition || ""} ${r.precipitation_probability ? `· ${r.precipitation_probability}%` : ""}`.trim() : "");
		return {
			weekday: this.date(U(/* @__PURE__ */ new Date()), { weekday: "long" }),
			day: this.date(U(/* @__PURE__ */ new Date()), { day: "numeric" }),
			month: this.date(U(/* @__PURE__ */ new Date()), { month: "long" }),
			clock: (/* @__PURE__ */ new Date()).toLocaleTimeString(this.locale, {
				hour: "2-digit",
				minute: "2-digit",
				hour12: this.settingsData.time_format === "12"
			}),
			temperature: Number.isFinite(i) ? `${Math.round(i)}${a}` : "",
			condition: o,
			detail: s
		};
	}
	peopleOptions(e) {
		return this.people.map((t) => M`<option value=${t.id} ?selected=${t.id === e}>${t.name}</option>`);
	}
	groceryDefaultLabel(e) {
		return {
			weekly: this.s("Weekly groceries", "Wekelijkse boodschappen"),
			daily: this.s("Daily groceries", "Dagelijkse boodschappen"),
			random: this.s("Random list", "Willekeurige lijst")
		}[e || ""] || (this.data.groceries?.lists || []).find((t) => t.id === e)?.name || this.s("First list", "Eerste lijst");
	}
	async load() {
		if (!this._hass) return;
		let e = ++this.loadSequence;
		try {
			let t = await Promise.all(Ye.map((e) => this._hass.callWS({
				type: "family_organizer/list",
				resource: e
			})));
			if (e !== this.loadSequence) return;
			this.data = Object.fromEntries(Ye.map((e, n) => [e, t[n]]));
			let n = this.settingsData;
			this.listId = Le(this.data.groceries.lists || [], this.listId, n.default_grocery_list_id, !this.initialized), this.initialized ||= (this.calendarView = this.normalizedCalendarView(n.default_calendar_view || "list", n), this.scorePeriod = n.competition_default || "week", this.theme = localStorage.getItem("family-organizer-theme") || n.theme || "auto", !0), this.error = "", this.pinPersonId ||= this.settingsData.current_user?.person_id || "";
			let r = this.pinPersonId || this.me?.id || this.people[0]?.id || "";
			this.people.some((e) => e.id === this.todayPersonId) || (this.todayPersonId = r);
			let i = this.people.filter((e) => ["parent", "parent_admin"].includes(e.role));
			if (i.some((e) => e.id === this.settingsPinPersonId) || (this.settingsPinPersonId = i[0]?.id || ""), !this.unsubscribe && !this.subscribing && this.isConnected) {
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
		return this.tm(e?.message || String(e) || this.t("unknown_error"));
	}
	async verifySettingsPin(e) {
		if (e.preventDefault(), !this._hass || !this.settingsPinPersonId) return;
		let t = e.currentTarget, n = String(new FormData(t).get("pin") || "").trim();
		if (!/^\d{4,8}$/.test(n)) {
			this.error = this.tm("Enter a 4 to 8 digit PIN.");
			return;
		}
		this.error = "", this.saving = !0;
		try {
			let e = this.people.find((e) => e.id === this.settingsPinPersonId);
			if (!e || !["parent", "parent_admin"].includes(e.role)) {
				this.error = this.s("Choose a parent or family administrator.", "Kies een ouder of gezinsbeheerder.");
				return;
			}
			let t = await this._hass.callWS({
				type: "family_organizer/verify_pin",
				person_id: this.settingsPinPersonId,
				pin: n
			});
			this.pinCapabilites = t.capabilities || {}, this.settingsUnlocked = !0, localStorage.setItem("family-organizer-settings-person-id", this.settingsPinPersonId), this.notice = `${this.x("Welcome")} ${t.name || ""}`.trim();
		} catch (e) {
			this.error = this.message(e);
		} finally {
			this.saving = !1;
		}
	}
	switchSettingsPinPerson(e) {
		this.settingsPinPersonId = e, localStorage.setItem("family-organizer-settings-person-id", e || "");
	}
	selectTodayPerson(e) {
		this.todayPersonId = e, localStorage.setItem("family-organizer-today-person-id", e || "");
	}
	previousPersonId(e) {
		if (!this.people.length) return "";
		let t = Math.max(0, this.people.findIndex((t) => t.id === e));
		return this.people[(t - 1 + this.people.length) % this.people.length]?.id || "";
	}
	nextPersonId(e) {
		if (!this.people.length) return "";
		let t = Math.max(0, this.people.findIndex((t) => t.id === e));
		return this.people[(t + 1) % this.people.length]?.id || "";
	}
	async action(e, t = "Saved", n = !1) {
		if (this.saving) return !1;
		this.saving = !0, this.error = "", this.notice = "";
		try {
			return await e(), await this.load(), this.notice = this.x(t), n && this.closeEditor(!0), !0;
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
		}, this.mealTitleQuery = "", e === "person" && this.loadHaUsers(), this.updateComplete.then(() => {
			let e = this.renderRoot.querySelector("dialog");
			e.open || e.showModal(), (e.querySelector("[autofocus]") || e.querySelector("input,select,button"))?.focus();
		}));
	}
	closeEditor(e = !1) {
		(!this.saving || e) && (this.renderRoot.querySelector("dialog")?.close(), this.editor = void 0, this.mealTitleQuery = "", this.updateComplete.then(() => this.returnFocus?.isConnected ? this.returnFocus.focus() : this.renderRoot.querySelector(".quick-add")?.focus()));
	}
	async loadHaUsers() {
		try {
			this.haUsers = await this._hass.callWS({ type: "family_organizer/ha_users" });
		} catch {
			this.haUsers = [];
		}
	}
	applyHaUser(e) {
		if (!this.editor) return;
		let t = this.haUsers.find((t) => t.id === e), n = {
			...this.editor.item,
			user_id: e || null,
			sync_picture: !!t
		};
		t && (n.name ||= t.name, t.picture && (n.profile_picture = t.picture)), this.editor = {
			...this.editor,
			item: n
		};
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
			}), this.languageCode === "nl" ? "Verwijderd" : "Deleted", !0);
			return;
		}
		if (i === "recipe-import") {
			let e = u("url");
			this.saving = !0, this.error = "";
			try {
				let t = await this._hass.callWS({
					type: "family_organizer/import_recipe",
					url: e
				});
				this.saving = !1, this.notice = this.languageCode === "nl" ? "Recept gevonden. Controleer de details en sla op." : "Recipe found. Review the details and save.", this.openEditor("recipe", {
					title: t.title,
					image: t.image,
					servings: t.servings,
					prep_time: t.prep_time,
					cook_time: t.cook_time,
					tags: t.tags,
					steps: t.steps,
					ingredients: je((t.ingredient_lines || []).join("\n")),
					source_url: t.source_url
				});
			} catch (e) {
				this.saving = !1, this.error = this.message(e);
			}
			return;
		}
		if (i === "event") {
			o = "calendar";
			let e = d("all_day"), t = u("day"), i = u("end_day");
			if (c = {
				...c,
				title: u("title"),
				start: e ? t : `${t}T${u("start")}:00`,
				end: e ? G(i, 1) : `${i}T${u("end")}:00`,
				all_day: e,
				description: u("description"),
				location: u("location"),
				recurrence: u("recurrence") || null,
				category: u("category") || null,
				person_ids: n.getAll("person_ids"),
				shared: d("shared"),
				reminder_minutes: r.reminder === "" || r.reminder === void 0 ? null : Number(r.reminder)
			}, new Date(c.end) <= new Date(c.start)) {
				this.error = this.tm("The event must end after it starts.");
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
			deadline: u("deadline") || null,
			checked: !!a.checked,
			shared: d("shared")
		};
		else if (i === "list") o = "groceries", s = "lists", c = {
			...c,
			name: u("name"),
			list_type: u("list_type") || a.list_type || "groceries",
			store: u("store"),
			deadline: u("deadline") || null,
			shared: d("shared")
		};
		else if (i === "contact") {
			o = "contacts";
			let e = (e) => u(e).split(/\r?\n|,/).map((e) => e.trim()).filter(Boolean);
			c = {
				...c,
				name: u("name"),
				group: u("group"),
				phones: e("phones"),
				emails: e("emails"),
				address: u("address"),
				notes: u("notes"),
				shared: d("shared")
			};
		} else if (i === "meal") {
			o = "groceries", s = "meal_slots";
			let e = u("title"), t = (this.data.recipes.items || []).find((t) => t.title.toLowerCase() === e.trim().toLowerCase());
			if (c = {
				...c,
				day: u("day"),
				slot: u("slot"),
				recipe_id: t?.id || null,
				title: t?.title || e,
				servings: l("servings")
			}, !c.title) {
				this.error = this.tm("Choose a recipe or enter a meal name.");
				return;
			}
			let n = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).find((e) => e.day === c.day && (e.slot || e.meal) === c.slot);
			if (n && n.id !== a.id) {
				this.error = this.tm("That meal slot is already planned. Edit it from the planner instead.");
				return;
			}
		} else if (i === "chore") {
			o = "chores";
			let e = d("is_free");
			if (c = {
				...c,
				title: u("title"),
				description: u("description"),
				icon: u("icon"),
				points: l("points"),
				assignee_ids: e ? [] : n.getAll("assignee_ids"),
				rotate: d("rotate"),
				schedule: u("schedule"),
				weekdays: n.getAll("weekdays").map(Number),
				month_day: l("month_day"),
				interval_days: l("interval_days"),
				due_date: u("due_date") || null,
				due_time: u("due_time") || null,
				created: a.created || U(/* @__PURE__ */ new Date()),
				shared: d("shared"),
				is_free: e,
				retry_allowed: d("retry_allowed"),
				retry_minutes: l("retry_minutes") || 60,
				daypart: u("daypart") || "custom",
				expires_at: e && u("expires_at") || null
			}, c.schedule === "weekly" && !c.weekdays.length) {
				this.error = this.tm("Choose at least one weekday.");
				return;
			}
			if (!e && !c.assignee_ids.length) {
				this.error = this.tm("Choose at least one family member.");
				return;
			}
			c.schedule === "monthly" && [
				29,
				30,
				31
			].includes(c.month_day) && (this.notice = this.tm("Heads up: this routine will not appear in months without that day."));
		} else if (i === "points") {
			await this.action(() => this._hass.callWS({
				type: "family_organizer/adjust_points",
				person_id: u("person_id"),
				points: l("points"),
				note: u("note")
			}), this.languageCode === "nl" ? "Punten aangepast" : "Points adjusted", !0);
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
		else if (i === "calendar-category") o = "calendar", s = "categories", c = {
			...c,
			name: u("name"),
			icon: u("icon") || "🗒",
			color: u("color") || "#64748b"
		};
		else if (i === "person") {
			o = "people";
			let e = {}, t = u("role"), n = t === "parent" || t === "parent_admin";
			Xe.forEach((t) => {
				let n = u(t);
				n !== "default" && (e[t] = n === "allow");
			}), c = {
				...c,
				name: u("name"),
				initials: u("name").split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase(),
				color: u("color"),
				profile_picture: u("profile_picture") || null,
				user_id: u("user_id") || null,
				sync_picture: d("sync_picture"),
				birthday: u("birthday") || null,
				role: t,
				permissions: e,
				pin: n ? u("pin") : "",
				clear_pin: !n || d("clear_pin"),
				shared: !0
			};
		} else if (i === "preferences") {
			let e = {};
			if ([
				"overview_position",
				"week_start",
				"time_format",
				"default_calendar_view",
				"calendar_list_mode",
				"default_grocery_list_id",
				"competition_default",
				"language",
				"theme"
			].forEach((t) => e[t] = u(t)), e.overview_collapsed = d("overview_collapsed"), e.show_calendar_day_view = d("show_calendar_day_view"), e.show_calendar_week_view = d("show_calendar_week_view"), e.show_calendar_export = d("show_calendar_export"), e.sync_interval = l("sync_interval"), e.reminders_enabled = d("reminders_enabled"), e.default_reminder_minutes = l("default_reminder_minutes"), e.notify_service = u("notify_service"), e.daily_agenda_time = u("daily_agenda_time"), e.meal_slots = n.getAll("meal_slots").map((e) => String(e)), e.stores = u("stores").split(",").map((e) => e.trim()).filter(Boolean), e.chore_dayparts = {
				morning: {
					start: u("daypart_morning_start") || "07:00",
					end: u("daypart_morning_end") || "11:59"
				},
				afternoon: {
					start: u("daypart_afternoon_start") || "12:00",
					end: u("daypart_afternoon_end") || "17:59"
				},
				evening: {
					start: u("daypart_evening_start") || "18:00",
					end: u("daypart_evening_end") || "23:59"
				}
			}, !e.meal_slots.length) {
				this.error = this.tm("Enter at least one meal slot.");
				return;
			}
			e.default_calendar_view = this.normalizedCalendarView(e.default_calendar_view || "list", e);
			try {
				new Intl.DateTimeFormat(e.language);
			} catch {
				this.error = this.tm("Enter a valid language code, such as en, de or fr.");
				return;
			}
			await this.action(() => this._hass.callWS({
				type: "family_organizer/settings",
				settings: e
			}), this.languageCode === "nl" ? "Voorkeuren opgeslagen" : "Preferences saved", !0) && (this.localOverview = void 0, this.calendarView = this.normalizedCalendarView(e.default_calendar_view || this.calendarView, e), this.theme = e.theme, localStorage.setItem("family-organizer-theme", this.theme));
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
		}), await this.action(() => this.mutate(o, c, s), a.id ? this.languageCode === "nl" ? "Wijzigingen opgeslagen" : "Changes saved" : this.languageCode === "nl" ? "Toegevoegd aan je gezinsorganizer" : "Added to your family organizer", !0));
	}
	render() {
		let e = Q.find((e) => e.id === this.page), t = this.theme === "auto" ? this._hass?.themes?.darkMode ? "dark" : "auto" : this.theme, n = this.settingsData.overview_position === "bottom", r = Q.filter((e) => e.id !== "today"), i = [
			{
				label: this.x("Plan"),
				description: this.s("Calendar, daily planning and meals.", "Agenda, dagplanning en maaltijden."),
				pages: [
					"today",
					"calendar",
					"recipes"
				]
			},
			{
				label: this.x("Household"),
				description: this.s("Lists and chores.", "Lijstjes en klussen."),
				pages: ["lists", "chores"]
			},
			{
				label: this.x("Keep in touch"),
				description: this.s("Birthdays and settings.", "Verjaardagen en instellingen."),
				pages: ["birthdays", "settings"]
			}
		];
		return M`<div class="app" data-theme=${t} data-bottom-nav=${n}>
      <a class="skip-link" href="#main" @click=${(e) => {
			e.preventDefault(), this.renderRoot.querySelector("main").focus();
		}}>${this.t("skip_content")}</a>
      <aside class="sidebar"><a class="brand" href="#fo/today" @click=${() => this.navigate("today")}><span class="brand-symbol">⌂</span><span>Family<br><strong>Planner</strong></span></a><p class="eyebrow">${this.x("Daily planning made calm")}</p>
        <button class="quick-add" @click=${() => this.openEditor("quick")} ?disabled=${this.loading || this.saving || !this.data.people}><span aria-hidden="true">+</span> ${this.t("quick_add")}</button>
        ${i.map((e) => M`<div class="sidebar-family"><span class="eyebrow">${e.label}</span><nav aria-label=${e.label}>${e.pages.map((e) => {
			let t = Q.find((t) => t.id === e);
			return M`<button class=${this.page === t.id ? "active" : ""} aria-current=${this.page === t.id ? "page" : P} @click=${() => this.navigate(t.id)}><span class="nav-icon" aria-hidden="true">${t.icon}</span>${this.pageName(t.id, t.name)}</button>`;
		})}</nav><p>${e.description}</p></div>`)}
        ${this.haMenuButton()}
        <small class="sidebar-note">${this.t("made_together")}</small>
      </aside>
      <div class="workspace">${this.page === "calendar" || this.page === "today" ? P : M`<header class="topbar"><div><span class="eyebrow">${this.date(U(/* @__PURE__ */ new Date()), {
			weekday: "long",
			month: "short",
			day: "numeric"
		})}</span><h1>${this.pageName(e.id, e.name)}</h1><p>${this.pageSubtitle(e.id, e.subtitle)}</p></div></header>`}
        <main id="main" tabindex="-1" aria-busy=${this.loading || this.saving}>
          ${this.error && !this.editor ? M`<div class="banner error" role="alert"><span>${this.error}</span><button @click=${() => void this.load()}>${this.t("retry")}</button></div>` : P}
          ${this.loading ? M`<div class="empty loading" role="status"><span class="spinner"></span><h2>${this.t("getting_together")}</h2><p>${this.t("loading_copy")}</p></div>` : this.data.people ? this.renderPage() : M`<div class="empty"><h2>${this.t("could_not_load")}</h2><p>${this.t("check_connection_permissions")}</p><button class="primary" @click=${() => void this.load()}>${this.t("try_again")}</button></div>`}
        </main>
      </div>
      ${n ? this.floatingNavigationBar(r) : M`<nav class="mobile-nav" aria-label=${this.x("Mobile navigation")}>${Q.map((e) => M`<button class=${this.page === e.id ? "active" : ""} aria-current=${this.page === e.id ? "page" : P} @click=${() => this.navigate(e.id)}><span aria-hidden="true">${e.icon}</span>${this.pageName(e.id, e.name)}</button>`)}${this.haMenuButton(!0)}</nav>`}
      ${this.editor ? this.dialog() : P}
    </div>`;
	}
	async exportCalendar() {
		try {
			let e = await this._hass.fetchWithAuth("/api/family_organizer/calendar.ics");
			if (!e.ok) throw Error(await e.text());
			let t = URL.createObjectURL(await e.blob()), n = document.createElement("a");
			n.href = t, n.download = "family-organizer.ics", n.click(), setTimeout(() => URL.revokeObjectURL(t), 1e3), this.notice = this.t("calendar_exported");
		} catch (e) {
			this.error = `${this.t("could_not_export_calendar")}: ${e.message}`;
		}
	}
	haMenuButton(e = !1) {
		return M`<button type="button" class=${`ha-shell-menu ${e ? "" : "sidebar-ha-menu"}`} aria-label=${this.t("open_ha_navigation")} @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
			bubbles: !0,
			composed: !0,
			detail: {}
		}))}><span class="ha-menu-icon" aria-hidden="true"></span><span>${e ? this.t("ha_menu") : this.t("home_assistant")}</span></button>`;
	}
	floatingNavigationBar(e = Q) {
		return M`<nav class="floating-nav" aria-label=${this.x("Navigation")}>${e.map((e) => M`<button class=${this.page === e.id ? "active" : ""} aria-current=${this.page === e.id ? "page" : P} @click=${() => this.navigate(e.id)}><span aria-hidden="true">${e.icon}</span><span>${this.pageName(e.id, e.name)}</span></button>`)}${this.haMenuButton()}</nav>`;
	}
	settingsPinGate() {
		let e = this.people.filter((e) => ["parent", "parent_admin"].includes(e.role));
		return M`<section class="surface lock-screen"><h2>${this.s("Unlock settings", "Instellingen ontgrendelen")}</h2><p class="muted">${this.s("Enter a PIN from a parent or family administrator to open Settings.", "Voer een pincode van een ouder of gezinsbeheerder in om Instellingen te openen.")}</p>${e.length ? M`<form @submit=${(e) => void this.verifySettingsPin(e)}><label>${this.t("family_member")}<select name="person" @change=${(e) => this.switchSettingsPinPerson(e.target.value)}>${e.map((e) => M`<option value=${e.id} ?selected=${e.id === this.settingsPinPersonId}>${e.name}</option>`)}</select></label><label>${this.t("pin")}<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" minlength="4" maxlength="8" autofocus></label><div class="dialog-footer"><button class="primary" type="submit" ?disabled=${this.saving}>${this.t("unlock")}</button></div></form>` : M`<p class="muted">${this.s("No parent/admin profile is available yet.", "Er is nog geen ouder/beheerder-profiel beschikbaar.")}</p>`}</section>`;
	}
	renderPage() {
		switch (this.page) {
			case "today": return this.today();
			case "calendar": return this.calendar();
			case "lists": return this.lists();
			case "chores": return this.chores();
			case "recipes": return this.recipes();
			case "birthdays": return this.birthdays();
			default: return this.settingsUnlocked ? this.settings() : this.settingsPinGate();
		}
	}
	empty(e, t, n) {
		return M`<div class="empty"><span class="empty-icon" aria-hidden="true">✧</span><h3>${this.x(e)}</h3><p>${this.x(t)}</p>${n || P}</div>`;
	}
	addButton(e, t, n, r = {}) {
		return n ? M`<button class="primary" @click=${() => this.openEditor(t, r)}>+ ${this.x(e)}</button>` : P;
	}
	calendarCategories() {
		let e = this.data.calendar.categories || [];
		return e.length ? e.map((e) => ({
			id: e.id,
			label: e.name,
			icon: e.icon || "🗒",
			color: e.color || "#64748b"
		})) : [
			{
				id: "work",
				label: this.s("Work", "Werk"),
				icon: "💼",
				color: "#f59e0b"
			},
			{
				id: "school",
				label: this.s("School", "School"),
				icon: "🎒",
				color: "#3b82f6"
			},
			{
				id: "sport",
				label: this.s("Sport", "Sport"),
				icon: "🏋",
				color: "#10b981"
			},
			{
				id: "family",
				label: this.s("Family", "Gezin"),
				icon: "👪",
				color: "#ec4899"
			},
			{
				id: "home",
				label: this.s("Home", "Thuis"),
				icon: "🏠",
				color: "#8b5cf6"
			},
			{
				id: "other",
				label: this.s("Other", "Overig"),
				icon: "🗒",
				color: "#64748b"
			}
		];
	}
	calendarCategory(e) {
		return this.calendarCategories().find((t) => t.id === (e || "other")) || this.calendarCategories().at(-1);
	}
	calendarSourceSource(e) {
		return e?.source_type === "ics" ? "ics" : e?.source_type || "calendar";
	}
	toggleCalendarSource(e) {
		let t = new Set(this.hiddenCalendarSources);
		t.has(e) ? t.delete(e) : t.add(e), this.hiddenCalendarSources = t, Je("family-organizer-hidden-calendar-sources", t);
	}
	toggleCalendarCategory(e) {
		let t = new Set(this.hiddenCalendarCategories);
		t.has(e) ? t.delete(e) : t.add(e), this.hiddenCalendarCategories = t, Je("family-organizer-hidden-calendar-categories", t);
	}
	togglePersonFilter(e) {
		let t = new Set(this.personFilter);
		t.has(e) ? t.delete(e) : t.add(e), this.personFilter = t;
	}
	openDatePicker() {
		this.calendarOverlay = this.calendarOverlay === "date" ? null : "date";
	}
	openCalendarFilters() {
		this.calendarOverlay = this.calendarOverlay === "filters" ? null : "filters";
	}
	openCalendarViews() {
		this.calendarOverlay = this.calendarOverlay === "views" ? null : "views";
	}
	showCalendarDayView(e = this.settingsData) {
		return e.show_calendar_day_view !== !1;
	}
	showCalendarWeekView(e = this.settingsData) {
		return e.show_calendar_week_view !== !1;
	}
	showCalendarExport(e = this.settingsData) {
		return e.show_calendar_export !== !1;
	}
	availableCalendarViews(e = this.settingsData) {
		let t = [["list", this.s("List", "Lijst")], ["month", this.s("Month", "Maand")]];
		return this.showCalendarDayView(e) && t.splice(1, 0, ["day", this.s("Day", "Dag")]), this.showCalendarWeekView(e) && t.splice(this.showCalendarDayView(e) ? 2 : 1, 0, ["week", this.s("Week", "Week")]), t;
	}
	normalizedCalendarView(e, t = this.settingsData) {
		return new Set(this.availableCalendarViews(t).map(([e]) => e)).has(e) ? e : "list";
	}
	activeCalendarSources() {
		return (this.data.calendar.sources || []).filter((e) => !this.hiddenCalendarSources.has(e.id));
	}
	activeCalendarCategories() {
		return this.calendarCategories().filter((e) => !this.hiddenCalendarCategories.has(e.id));
	}
	filteredCalendarEvents(e) {
		return e.filter((e) => {
			let t = this.data.calendar.sources?.find((t) => t.id === e.source_id), n = this.calendarCategory(e.category);
			return (!this.personFilter.size || (e.person_ids || []).some((e) => this.personFilter.has(e))) && !this.hiddenCalendarSources.has(t?.id || "") && !this.hiddenCalendarCategories.has(n.id);
		});
	}
	calendarFilterSummary() {
		let e = [];
		for (let t of this.hiddenCalendarSources) e.push(`${this.s("Hidden", "Verborgen")} ${this.data.calendar.sources?.find((e) => e.id === t)?.name || t}`);
		for (let t of this.hiddenCalendarCategories) e.push(`${this.s("Hidden", "Verborgen")} ${this.calendarCategory(t).label}`);
		return this.personFilter.size && e.push(`${this.s("Members", "Leden")} ${[...this.personFilter].map((e) => this.person(e)?.name || e).join(", ")}`), e;
	}
	calendarHeader(e, t) {
		let n = this.date(this.selectedDay, {
			weekday: "long",
			month: "short",
			day: "numeric"
		}), r = this.personFilter.size === 1 ? this.person([...this.personFilter][0]) : void 0;
		return M`<div class="calendar-header"><button class="calendar-header-day" @click=${() => this.openDatePicker()}><span class="calendar-header-kicker">${this.s("Day", "Dag")}</span><strong>${n}</strong><small>${t}</small></button><div class="calendar-header-people">${this.people.map((e) => M`<button class=${this.personFilter.has(e.id) && r ? "calendar-person active" : "calendar-person"} style=${`--person-color:${this.color(e.color)}`} @click=${() => {
			this.selectTodayPerson(e.id), this.page = "today", this.navigate("today");
		}} title=${e.name}>${this.avatar(e.id)}</button>`)}</div><div class="calendar-header-actions"><button class="calendar-header-filter" @click=${() => this.openCalendarFilters()} aria-label=${this.s("Open filters", "Open filters")}><span aria-hidden="true">⚙</span><span>${this.s("Filters", "Filters")}</span></button><button class="calendar-header-add" ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", { day: this.selectedDay })} aria-label=${this.s("Add appointment", "Afspraak toevoegen")}><span aria-hidden="true">+</span><span>${this.s("Add appointment", "Afspraak toevoegen")}</span></button><div class="calendar-header-nav"><button class="icon-button" aria-label=${this.s("Previous period", "Vorige periode")} @click=${() => this.selectedDay = K(this.selectedDay, e, -1)}>‹</button><button @click=${() => this.selectedDay = U(/* @__PURE__ */ new Date())}>${this.s("Today", "Vandaag")}</button><button class="icon-button" aria-label=${this.s("Next period", "Volgende periode")} @click=${() => this.selectedDay = K(this.selectedDay, e, 1)}>›</button></div></div></div>`;
	}
	calendarFilterPanel(e) {
		let t = this.calendarFilterSummary(), n = (e) => this.togglePersonFilter(e);
		return this.calendarOverlay ? M`<div class="calendar-popup-backdrop" @click=${() => this.calendarOverlay = null}><section class="calendar-popup" role="dialog" aria-modal="true" @click=${(e) => e.stopPropagation()}><header class="calendar-popup-header"><div><span class="eyebrow">${this.s("Applied filters", "Toegepaste filters")}</span><p>${t.length ? t.join(" · ") : this.s("No filters applied", "Geen filters toegepast")}</p></div><button class="icon-button" @click=${() => this.calendarOverlay = null}>×</button></header><div class="segmented popup-tabs" role="tablist"><button class=${this.calendarOverlay === "filters" ? "active" : ""} aria-selected=${this.calendarOverlay === "filters"} @click=${() => this.openCalendarFilters()}>${this.s("Filters", "Filters")}</button><button class=${this.calendarOverlay === "views" ? "active" : ""} aria-selected=${this.calendarOverlay === "views"} @click=${() => this.openCalendarViews()}>${this.s("View options", "Weergave opties")}</button><button class=${this.calendarOverlay === "date" ? "active" : ""} aria-selected=${this.calendarOverlay === "date"} @click=${() => this.openDatePicker()}>${this.s("Date", "Datum")}</button></div>${this.calendarOverlay === "date" ? M`<div class="popup-section"><label>${this.s("Go to date", "Ga naar datum")}<input type="date" .value=${this.selectedDay} @change=${(e) => {
			let t = e.target.value;
			t && (this.selectedDay = t);
		}}></label></div>` : this.calendarOverlay === "views" ? M`<div class="popup-section"><div class="view-option-list">${this.availableCalendarViews().map(([t, n]) => M`<button class=${e === t ? "active" : ""} aria-pressed=${e === t} @click=${() => {
			this.calendarView = String(t), this.calendarOverlay = null;
		}}>${n}</button>`)}</div></div>` : M`<div class="popup-section"><label class="full-search">${this.s("Search events", "Zoek afspraken")}<input class="calendar-search" type="search" placeholder=${this.s("Search events…", "Zoek afspraken…")} .value=${this.calendarSearch} @input=${(e) => this.calendarSearch = e.target.value}></label><div class="popup-columns"><section><h4>${this.s("Agendas", "Agenda's")}</h4>${(this.data.calendar.sources || []).map((e) => M`<button class=${this.hiddenCalendarSources.has(e.id) ? "toggle-row hidden" : "toggle-row"} @click=${() => this.toggleCalendarSource(e.id)}><span><strong>${e.name}</strong><small>${this.calendarSourceSource(e)}</small></span><span aria-hidden="true">${this.hiddenCalendarSources.has(e.id) ? this.s("Hidden", "Verborgen") : this.s("Shown", "Zichtbaar")}</span></button>`)}<h4>${this.s("Categories", "Categorieën")}</h4>${this.calendarCategories().map((e) => M`<button class=${this.hiddenCalendarCategories.has(e.id) ? "toggle-row hidden" : "toggle-row"} @click=${() => this.toggleCalendarCategory(e.id)} style=${`--event-color:${e.color}`}><span><strong><span class="category-emoji" aria-hidden="true">${e.icon}</span>${e.label}</strong><small>${this.s("Use this color", "Gebruik deze kleur")}</small></span><span aria-hidden="true">${this.hiddenCalendarCategories.has(e.id) ? this.s("Hidden", "Verborgen") : this.s("Shown", "Zichtbaar")}</span></button>`)}${this.can("manage_calendar_all") ? M`<button class="text-button" @click=${() => this.openEditor("calendar-categories", {})}>${this.s("Manage categories", "Categorieën beheren")}</button>` : P}</section><section><h4>${this.s("Family members", "Gezinsleden")}</h4><button class=${this.personFilter.size ? "toggle-row" : "toggle-row active"} @click=${() => this.personFilter = /* @__PURE__ */ new Set()}><span><strong>${this.s("Everyone", "Iedereen")}</strong><small>${this.s("Show all appointments", "Toon alle afspraken")}</small></span><span aria-hidden="true">✓</span></button>${this.people.map((e) => M`<button class=${this.personFilter.has(e.id) ? "toggle-row active" : "toggle-row"} @click=${() => n(e.id)}><span><strong>${e.name}</strong><small>${this.personFilter.has(e.id) ? this.s("Visible", "Zichtbaar") : this.s("Hidden", "Verborgen")}</small></span>${this.avatar(e.id)}</button>`)}</section></div></div>`}</section></div>` : P;
	}
	calendar() {
		let e = this.normalizedCalendarView(this.calendarView), t = Ae(this.selectedDay, e, this.firstDay), n = We(this.data.calendar.items || [], t[0], t.at(-1)), r = this.calendarSearch.trim().toLowerCase(), i = this.filteredCalendarEvents(n).filter((e) => !r || [
			e.title,
			e.location,
			e.description
		].some((e) => String(e || "").toLowerCase().includes(r))), a = X(i, this.selectedDay), o = (this.data.calendar.items || []).filter((e) => Ue(e.recurrence) && (!this.personFilter.size || (e.person_ids || []).some((e) => this.personFilter.has(e)))), s = this.localOverview ?? this.settingsData.overview_collapsed, c = e === "month" ? this.date(this.selectedDay, {
			month: "long",
			year: "numeric"
		}) : e === "day" ? this.date(this.selectedDay) : `${this.date(t[0], {
			month: "short",
			day: "numeric"
		})} – ${this.date(t.at(-1), {
			month: "short",
			day: "numeric",
			year: "numeric"
		})}`;
		return M`<section aria-label=${this.s("Family calendar", "Gezinsagenda")}>${e === "list" ? P : this.calendarHeader(e, c)}${this.calendarFilterPanel(e)}<div class=${`calendar-shell overview-${this.settingsData.overview_position || "right"} ${s ? "overview-closed" : ""}`}><div class="calendar-surface">${this.calendarView === "month" ? M`<div class="weekday-row">${t.slice(0, 7).map((e) => M`<span>${this.date(e, { weekday: "short" })}</span>`)}</div><div class="month-grid">${t.map((e) => {
			let t = X(i, e);
			return M`<div class=${`month-cell ${e.slice(0, 7) === this.selectedDay.slice(0, 7) ? "" : "outside"} ${e === this.selectedDay ? "selected" : ""}`}>
            <div class="cell-heading"><button class=${e === U(/* @__PURE__ */ new Date()) ? "day-number today" : "day-number"} aria-label=${`${this.s("Agenda for", "Agenda voor")} ${this.date(e)}`} aria-pressed=${e === this.selectedDay} @click=${() => this.selectedDay = e}>${W(e).getDate()}</button>${this.canEvent() ? M`<button class="date-add" aria-label=${`${this.s("Add event on", "Afspraak toevoegen op")} ${this.date(e)}`} @click=${() => {
				this.selectedDay = e, this.openEditor("event", { day: e });
			}}>+</button>` : P}</div>
            <button class="cell-create" aria-label=${`${this.s("Create event on", "Afspraak maken op")} ${this.date(e)}`} ?disabled=${!this.canEvent()} @click=${() => {
				this.selectedDay = e, this.openEditor("event", { day: e });
			}}></button>
            <div class="cell-events">${t.slice(0, 3).map((e) => this.eventChip(e))}${t.length > 3 ? M`<button class="more-events" @click=${() => this.selectedDay = e}>+${t.length - 3} ${this.s("more", "meer")}</button>` : P}</div>
          </div>`;
		})}</div>` : e === "list" ? this.listView(t, i) : this.timeGrid(t, i)}
      </div><aside class="agenda"><button class="agenda-toggle" aria-expanded=${!s} @click=${() => {
			this.localOverview = !s, this.requestUpdate(), this.can("manage_settings") && this.action(() => this._hass.callWS({
				type: "family_organizer/settings",
				settings: { overview_collapsed: !s }
			}), this.s("Overview updated", "Overzicht bijgewerkt"));
		}}>${s ? this.s("Show", "Toon") : this.s("Hide", "Verberg")} ${this.s("day agenda", "dagagenda")} <span aria-hidden="true">${s ? "+" : "−"}</span></button>${s ? P : M`<span class="eyebrow">${this.s("THE DAY AT A GLANCE", "DE DAG IN ÉÉN OOGOPSLAG")}</span><h2>${this.date(this.selectedDay, { weekday: "long" })}</h2><p class="muted">${this.date(this.selectedDay, {
			month: "long",
			day: "numeric"
		})} · ${a.length} ${this.s("events", "afspraken")}</p><div class="agenda-events">${a.length ? a.map((e) => M`<button class="agenda-event" style=${`--event-color:${this.eventColor(e)}`} @click=${() => this.openEditor("event-detail", e)}><span class="event-time">${e.all_day ? this.s("All day", "Hele dag") : this.time(e.occurrence_start)}</span><strong>${e.title}</strong><span class="muted">${e.location || this.s("No location", "Geen locatie")}</span><span class="event-people">${(e.person_ids || []).map((e) => this.avatar(e))}</span></button>`) : this.empty(this.s("Room to breathe", "Even rust"), this.personFilter.size ? this.s("No events for the selected family members.", "Geen afspraken voor de geselecteerde familieleden.") : this.s("Nothing on the calendar for this day.", "Geen afspraken op deze dag."))}</div>${this.addButton(this.s("Add an event", "Afspraak toevoegen"), "event", this.canEvent(), { day: this.selectedDay })}`}</aside></div>
      <p class="calendar-hint">${this.s("Select a day number to see its agenda. Select an empty day or + to add an event.", "Selecteer een dagnummer om de agenda te zien. Kies een lege dag of + om een afspraak toe te voegen.")}</p>
      ${o.length ? M`<div class="banner recurrence-warning" role="status"><p>${this.s("These recurrence rules cannot be expanded in this calendar. Their original text is preserved; only the original event is shown when it falls in the displayed period.", "Deze herhaalregels kunnen in deze agenda niet worden uitgewerkt. De originele tekst blijft bewaard; alleen de originele afspraak wordt getoond als die binnen de periode valt.")}</p><ul>${o.map((e) => M`<li><strong>${e.title}</strong>: <code>${e.recurrence}</code></li>`)}</ul></div>` : P}
    </section>`;
	}
	listView(e, t) {
		let n = U(/* @__PURE__ */ new Date()), r = G(n, 1), i = this.weatherHero(), a = (e) => e === n ? this.s("Today", "Vandaag") : e === r ? this.s("Tomorrow", "Morgen") : this.date(e, { weekday: "long" }), o = this.settingsData.calendar_list_mode === "all", s = e.map((e) => ({
			day: e,
			items: X(t, e)
		})).filter(({ day: e, items: t }) => o || t.length || e === n), c = M`<header class="list-hero" aria-label=${this.s("Agenda overview", "Agenda-overzicht")}>
        <button class="list-hero-date" @click=${() => this.openDatePicker()} aria-label=${this.s("Select a date", "Kies een datum")}>
          <p>${this.date(this.selectedDay, { weekday: "long" })}</p><strong>${this.date(this.selectedDay, { day: "numeric" })}</strong><span>${this.date(this.selectedDay, { month: "long" })}</span>
        </button>
        <div class="list-hero-people">${this.people.map((e) => M`<button class="list-hero-person" style=${`--person-color:${this.color(e.color)}`} @click=${() => {
			this.selectTodayPerson(e.id), this.page = "today", this.navigate("today");
		}} title=${e.name}>${this.avatar(e.id)}</button>`)}</div>
        <div class="list-hero-actions">
          <button class="list-hero-filter" @click=${() => this.openCalendarFilters()} aria-label=${this.s("Open filters", "Open filters")}><span aria-hidden="true">⚙</span><span>${this.s("Filters", "Filters")}</span></button>
          <button class="list-hero-add" ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", { day: this.selectedDay })} aria-label=${this.s("Add appointment", "Afspraak toevoegen")}><span aria-hidden="true">+</span><span>${this.s("Add appointment", "Afspraak toevoegen")}</span></button>
        </div>
        <div class="list-hero-weather">${i.temperature ? M`<strong>${i.temperature}</strong>` : P}<span>${i.condition}</span>${i.detail ? M`<small>${i.detail}</small>` : P}</div>
      </header>`;
		return s.length ? M`<div class="list-view qudoo-list">
      ${c}
      ${s.map(({ day: e, items: t }) => M`<section class=${`list-day ${e === n ? "is-today" : ""}`}>
        <h3><span>${a(e)}</span><small>${this.date(e, {
			day: "numeric",
			month: "long"
		})}</small><span class="list-day-icon" aria-hidden="true">🗓</span></h3>
        ${t.length ? t.map((e) => this.listEvent(e)) : M`<p class="muted empty-day">${this.s("Nothing on the calendar for this day.", "Geen afspraken op deze dag.")}</p>`}
      </section>`)}</div>` : M`<div class="list-view qudoo-list">${c}${this.empty(this.s("Room to breathe", "Even rust"), this.calendarSearch ? this.s("No events match your search.", "Geen afspraken gevonden voor je zoekopdracht.") : this.s("Nothing planned in this period.", "Niets gepland in deze periode."))}</div>`;
	}
	listEvent(e) {
		let t = this.calendarCategory(e.category);
		return M`<button class="list-event" style=${`--event-color:${this.eventColor(e)}`} @click=${() => this.openEditor("event-detail", e)}>
      <span class="event-time">${e.all_day ? this.s("All day", "Hele dag") : `${this.time(e.occurrence_start)} - ${this.time(e.occurrence_end)}`}</span>
      <span class="event-type" aria-hidden="true">${M`<span class="event-category-icon">${t.icon}</span>`}</span>
      <span class="event-copy"><strong>${e.title}</strong>${e.location ? M`<small class="muted">${e.location}</small>` : P}</span>
      <span class="event-people">${(e.person_ids || []).map((e) => this.avatar(e))}</span>
    </button>`;
	}
	eventColor(e) {
		return this.calendarCategory(e.category).color || this.color(this.person(e.person_ids?.[0])?.color || (this.data.calendar.sources || []).find((t) => t.id === e.source_id)?.color);
	}
	eventChip(e, t = "") {
		let n = this.calendarCategory(e.category);
		return M`<button class=${`event-chip ${e.all_day ? "all-day-event" : ""}`} style=${`--event-color:${this.eventColor(e)};${t}`} @click=${() => this.openEditor("event-detail", e)} title=${`${e.all_day ? this.s("All day", "Hele dag") : this.time(e.occurrence_start)} · ${e.title}`}><span class="event-dot" aria-hidden="true"></span><span class="event-chip-icon" aria-hidden="true">${n.icon}</span><span>${e.all_day ? P : M`<time class="event-start" datetime=${e.occurrence_start}>${this.time(e.occurrence_start)}</time> `}<strong>${e.title}</strong></span>${e.recurrence ? M`<span aria-label=${this.s("Repeating event", "Herhalende afspraak")}>↻</span>` : P}</button>`;
	}
	timeGrid(e, t) {
		let n = Array.from({ length: 24 }, (e, t) => t), r = /* @__PURE__ */ new Date();
		return M`<div class="time-scroll"><div class="time-calendar" style=${`--days:${e.length}`}><div class="time-header"><span></span>${e.map((e) => M`<button class=${e === this.selectedDay ? "active" : ""} @click=${() => this.selectedDay = e}><small>${this.date(e, { weekday: "short" })}</small><strong class=${e === U(r) ? "today" : ""}>${W(e).getDate()}</strong></button>`)}</div><div class="all-day-row"><span>${this.x("All day")}</span>${e.map((e) => M`<div>${X(t, e).filter((e) => e.all_day).map((e) => this.eventChip(e))}</div>`)}</div>
      <div class="time-body"><div class="time-labels">${n.map((t) => M`<span>${this.time(`${e[0]}T${String(t).padStart(2, "0")}:00:00`)}</span>`)}</div>${e.map((e) => M`<div class="time-column">${n.map((t) => M`<button class="hour-slot" aria-label=${`${this.s("Add event", "Afspraak toevoegen")} ${this.date(e)} ${this.s("at", "om")} ${t}:00`} ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", {
			day: e,
			start_time: `${String(t).padStart(2, "0")}:00`,
			end_time: `${String(Math.min(t + 1, 23)).padStart(2, "0")}:${t === 23 ? "59" : "00"}`
		})}></button>`)}<div class="positioned-events">${Ge(X(t, e).filter((e) => !e.all_day)).map(({ event: t, lane: n, columns: r }, i) => {
			let a = new Date(t.occurrence_start), o = new Date(t.occurrence_end), s = U(a) < e ? 0 : a.getHours() * 60 + a.getMinutes(), c = U(o) > e ? 1440 : o.getHours() * 60 + o.getMinutes();
			return this.eventChip(t, `top:${s / 60 * 60}px;height:${Math.max(22, (c - s) / 60 * 60 - 2)}px;left:calc(${n / r * 100}% + 2px);width:calc(${100 / r}% - 4px);z-index:${i + 1}`);
		})}</div>${e === U(r) ? M`<div class="now-line" style=${`top:${(r.getHours() + r.getMinutes() / 60) * 60}px`} aria-label=${this.s("Current time", "Huidige tijd")}></div>` : P}</div>`)}</div></div></div>`;
	}
	step(e, t) {
		let n = Math.max(0, Number(e.quantity || 0) + t);
		this.action(() => this.mutate("groceries", {
			...e,
			quantity: n
		}));
	}
	lists() {
		let e = this.data.groceries, t = e.lists || [], n = this.can("manage_groceries"), r = (e) => e === "todo" ? this.s("To-Do", "Taken") : e === "shopping" ? this.s("Shopping", "Winkelen") : this.s("Groceries", "Boodschappen"), i = (t) => (e.items || []).filter((e) => e.list_id === t && (!this.groceryAssignee || e.assignee_id === this.groceryAssignee));
		return M`<section><div class="section-toolbar lists-toolbar"><div><span class="eyebrow">${this.x("LISTS")}</span><h2>${this.s("Lists", "Lijstjes")}</h2></div><div class="toolbar-actions"><label>${this.x("Assigned to")}<select .value=${this.groceryAssignee} @change=${(e) => this.groceryAssignee = e.target.value}><option value="">${this.x("Everyone")}</option>${this.peopleOptions()}</select></label></div></div>
      <div class="list-type-chips" role="group" aria-label=${this.s("Create a list", "Maak een lijst")}>${[
			"groceries",
			"shopping",
			"todo"
		].map((e) => M`<button class="chip" ?disabled=${!n} @click=${() => this.openEditor("list", { list_type: e })}>+ ${r(e)}</button>`)}</div>
      <div class="lists-overview">${t.map((e) => {
			let t = e.list_type || "groceries", r = t !== "todo", a = i(e.id);
			a = [...a].sort((e, t) => this.groupStores && r ? (e.store || "").localeCompare(t.store || "") : 0);
			let o = a.filter((e) => !e.checked), s = a.filter((e) => e.checked), c = (e) => M`<div class=${`list-item-row ${e.checked ? "checked" : ""}`}><label class="check"><input type="checkbox" aria-label=${`${this.x("Mark")} ${e.name} ${this.x(e.checked ? "to buy" : "bought")}`} .checked=${!!e.checked} ?disabled=${!n || this.saving} @change=${() => void this.action(() => this.mutate("groceries", {
				...e,
				checked: !e.checked
			}), e.checked ? "Moved back to your list" : "Added to the basket")}><span>${e.name}</span></label>${r ? M`<div class="qty-stepper"><button class="icon-button" ?disabled=${!n || this.saving} aria-label=${`${this.x("Decrease")} ${e.name}`} @click=${() => this.step(e, -1)}>−</button><span>${J(Number(e.quantity))}</span><button class="icon-button" ?disabled=${!n || this.saving} aria-label=${`${this.x("Increase")} ${e.name}`} @click=${() => this.step(e, 1)}>+</button></div>` : P}${n ? M`<button class="icon-button" aria-label=${`${this.x("Edit")} ${e.name}`} @click=${() => this.openEditor("grocery", e)}>⋮</button>` : P}</div>`;
			return M`<article class="surface list-card"><div class="list-card-heading"><h3>${e.name}</h3>${n ? M`<div class="list-card-menu"><button class="icon-button" aria-label=${`${this.x("Edit list")} ${e.name}`} @click=${() => this.openEditor("list", e)}>✎</button><button class="icon-button" ?disabled=${e.id === "default"} aria-label=${`${this.x("Delete list")} ${e.name}`} @click=${() => this.confirmDelete("groceries", e, "lists")}>×</button></div>` : P}</div>
          <div class="list-card-items">${o.length ? o.map(c) : M`<p class="muted list-card-empty">${this.x("Nothing here yet.")}</p>`}</div>
          ${n ? M`<button class="text-button" @click=${() => this.openEditor("grocery", {
				list_id: e.id,
				list_type: t
			})}>+ ${this.s("Add", "Toevoegen")}</button>` : P}
          ${s.length ? M`<details class="list-card-done"><summary>${this.s("Done", "Voltooid")} (${s.length})</summary>${s.map(c)}</details>` : P}
        </article>`;
		})}</div>
      <div class="lists-footer"><button @click=${() => this.navigate("recipes")}>${this.x("Meal planner & recipes →")}</button></div></section>`;
	}
	mealPlanner() {
		let e = this.data.groceries, t = G(q(U(/* @__PURE__ */ new Date()), this.firstDay), this.mealWeek * 7), n = e.meal_slots || e.meal_plans || [];
		return M`<div class="section-toolbar meal-heading"><div><span class="eyebrow">${this.x("LESS “WHAT’S FOR DINNER?”")}</span><h2>${this.x("Your weekly meal plan")}</h2></div><div class="date-navigation"><button class="icon-button" aria-label=${this.x("Previous meal week")} @click=${() => this.mealWeek--}>‹</button><button @click=${() => this.mealWeek = 0}>${this.x("This week")}</button><button class="icon-button" aria-label=${this.x("Next meal week")} @click=${() => this.mealWeek++}>›</button></div></div>
      <div class="meal-grid">${Array.from({ length: 7 }, (e, r) => {
			let i = G(t, r);
			return M`<article class=${`meal-day ${i === U(/* @__PURE__ */ new Date()) ? "meal-today" : ""}`}><header><span>${this.date(i, { weekday: "short" })}</span><strong>${W(i).getDate()}</strong></header>${(this.settingsData.meal_slots || [
				"breakfast",
				"lunch",
				"dinner"
			]).map((e) => {
				let t = n.find((t) => t.day === i && (t.slot || t.meal) === e);
				return M`<div class="meal-slot"><span class="eyebrow">${this.x(e)}</span>${t ? M`<button class="meal-title" @click=${() => this.can("manage_meal_plan") ? this.openEditor("meal", t) : t.recipe_id ? this.navigate("recipes", t.recipe_id) : void 0}>${t.title}<small>${J(Number(t.servings || 1))} ${this.x("servings")}</small></button>${t.recipe_id ? M`<button class="text-button" @click=${() => this.navigate("recipes", t.recipe_id)}>${this.x("Recipe →")}</button>` : P}${this.can("manage_meal_plan") ? M`<button class="text-button danger" aria-label=${`${this.x("Remove")} ${t.title} · ${i} ${this.x(e)}`} @click=${() => this.confirmDelete("groceries", t, "meal_slots")}>${this.x("Remove")}</button>` : P}` : this.can("manage_meal_plan") ? M`<button class="meal-empty" aria-label=${`${this.x("Plan")} ${this.x(e)} ${this.x("on")} ${this.date(i)}`} @click=${() => this.openEditor("meal", {
					day: i,
					slot: e,
					servings: 4
				})}>+ ${this.x("Plan meal")}</button>` : M`<span class="muted">${this.x("Not planned")}</span>`}</div>`;
			})}</article>`;
		})}</div>`;
	}
	choreIcon(e) {
		return M`<ha-icon .icon=${e.icon || "mdi:check-circle-outline"} aria-hidden="true"></ha-icon><span class="chore-icon-fallback" aria-hidden="true">✓</span>`;
	}
	choreCompleted(e, t, n) {
		return n.find((n) => n.chore_id === e.id && !n.adjustment && U(new Date(n.completed_at)) === t);
	}
	choreOwn(e, t) {
		return this.me && (t.includes(this.me.id) || [this.me.id, this._hass?.user?.id].includes(e.creator_id));
	}
	choreCanComplete(e, t) {
		return this.can("complete_any_chore") || this.can("complete_own_chores") && this.choreOwn(e, t);
	}
	statusLabel(e) {
		let t = {
			active: ["Active", "Actief"],
			upcoming: ["Coming up", "Binnenkort"],
			late: ["Late", "Te laat"],
			retry: ["You're late, but you get another shot", "Je bent te laat, maar je mag nog een keertje"],
			expired: ["Expired", "Vervallen"],
			done: ["Done ✓", "Afgevinkt"]
		};
		return this.s(...t[e] || t.active);
	}
	completeChore(e, t) {
		this.pendingCompletion = {
			chore: e,
			personId: t
		};
	}
	async confirmCompletion(e) {
		let t = this.pendingCompletion;
		if (t && (this.pendingCompletion = void 0, await this.action(() => this._hass.callWS({
			type: "family_organizer/complete_chore",
			chore_id: t.chore.id,
			...t.personId ? { person_id: t.personId } : {},
			target: e
		}), this.x("Chore completed. Thank you!")))) {
			this.celebrate = !0, setTimeout(() => {
				this.celebrate = !1;
			}, 1600);
			try {
				new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play().catch(() => {});
			} catch {}
		}
	}
	async undoChore(e, t) {
		await this.action(() => this._hass.callWS({
			type: "family_organizer/uncomplete_chore",
			chore_id: e.id,
			day: t
		}), this.s("Undone", "Ongedaan gemaakt"));
	}
	choresPaused() {
		return !!this.settingsData.chores_paused;
	}
	async toggleChoresPaused() {
		await this.action(() => this._hass.callWS({
			type: "family_organizer/settings",
			settings: { chores_paused: !this.choresPaused() }
		}), this.s("Updated", "Bijgewerkt"));
	}
	choreTile(e, t, n, r, i) {
		let a = e.assignee_ids || (e.assignee_id ? [e.assignee_id] : []), o = this.choreCompleted(e, r, n), s = He(e, r, /* @__PURE__ */ new Date(), this.settingsData.chore_dayparts || Ve, !!o), c = i ? this.can("manage_chores") || this.can("complete_own_chores") || this.can("complete_any_chore") : this.choreCanComplete(e, a);
		return e.schedule && e.schedule, M`<article class=${`task-tile status-${s}`}>
      <span class="task-icon" aria-hidden="true">${this.choreIcon(e)}</span>
      <div class="row-copy"><strong>${e.title}</strong>
        <span class="muted status-pill status-${s}">${this.statusLabel(s)}</span>
      </div>
      <span class="points-badge">${e.points} ${this.x("pts")}</span>
      ${s === "done" ? M`<button class="icon-button" title=${this.s("Undo", "Ongedaan maken")} @click=${() => void this.undoChore(e, r)}>↺</button>` : M`<button class="primary" ?disabled=${!c || this.saving || ["upcoming", "expired"].includes(s)} @click=${() => this.completeChore(e, t || this.me?.id || "")}>${this.s("Check off!", "Afvinken maar!")}</button>`}
      ${this.can("manage_chores") ? M`<button class="icon-button" aria-label=${`${this.x("Edit")} ${e.title}`} @click=${() => this.openEditor("chore", e)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${e.title}`} @click=${() => this.confirmDelete("chores", e)}>×</button>` : P}
    </article>`;
	}
	personChoreCard(e, t, n, r) {
		let i = t.filter((t) => !t.is_free && (t.assignee_ids || (t.assignee_id ? [t.assignee_id] : [])).includes(e.id)), a = i.filter((e) => !e.schedule || e.schedule === "once"), o = i.filter((e) => e.schedule && e.schedule !== "once"), s = (this.data.chores.completions || []).filter((t) => t.person_id === e.id).reduce((e, t) => e + Number(t.points || 0), 0);
		return M`<article class="surface person-task-card">
      <header class="person-task-header">${this.avatar(e.id)}<div class="row-copy"><strong>${e.name}</strong></div><span class="points-badge">🏆 ${s}</span></header>
      <div class="task-group"><span class="eyebrow">${this.x("Chores")} (${a.length})</span>
        <div class="task-list">${a.length ? a.map((t) => this.choreTile(t, e.id, n, r, !1)) : M`<p class="muted task-empty">${this.s("No active chores", "Geen actieve taakjes")}</p>`}</div>
      </div>
      <div class="task-group"><span class="eyebrow">${this.x("Routines")} (${o.length})</span>
        <div class="task-list">${o.length ? o.map((t) => this.choreTile(t, e.id, n, r, !1)) : M`<p class="muted task-empty">${this.s("No active routines", "Geen actieve routines")}</p>`}</div>
      </div>
    </article>`;
	}
	freeChoreCard(e, t, n) {
		let r = e.filter((e) => e.is_free), i = r.filter((e) => !e.schedule || e.schedule === "once"), a = r.filter((e) => e.schedule && e.schedule !== "once");
		return M`<article class="surface person-task-card free-task-card">
      <header class="person-task-header"><span class="free-icon" aria-hidden="true">✋</span><div class="row-copy"><strong>${this.s("Free to pick up", "Vrij op te pakken taakjes")}</strong></div></header>
      <div class="task-group"><span class="eyebrow">${this.x("Chores")} (${i.length})</span>
        <div class="task-list">${i.length ? i.map((e) => this.choreTile(e, void 0, t, n, !0)) : M`<p class="muted task-empty">${this.s("No free chores", "Geen vrije taakjes")}</p>`}</div>
      </div>
      <div class="task-group"><span class="eyebrow">${this.x("Routines")} (${a.length})</span>
        <div class="task-list">${a.length ? a.map((e) => this.choreTile(e, void 0, t, n, !0)) : M`<p class="muted task-empty">${this.s("No free routines", "Geen vrije routines")}</p>`}</div>
      </div>
    </article>`;
	}
	chores() {
		let e = this.data.chores.items || [], t = this.data.chores.completions || [], n = U(/* @__PURE__ */ new Date()), r = e.filter((e) => Be(e, n, this.choresPaused()));
		return M`<section class="tasks-routines">
      <div class="section-toolbar"><div><span class="eyebrow">${this.x("TAAKJES & ROUTINES")}</span><h2>${this.s("Tasks & Routines", "Taakjes & Routines")}</h2></div>
        <div class="toolbar-actions">
          <button class="icon-button pause-toggle" title=${this.choresPaused() ? this.s("Resume routines", "Routines hervatten") : this.s("Pause routines", "Routines pauzeren")} ?disabled=${!this.can("manage_chores")} @click=${() => void this.toggleChoresPaused()}>${this.choresPaused() ? "▶" : "⏸"}</button>
          ${this.addButton("New chore", "chore", this.can("manage_chores"))}
        </div>
      </div>
      ${this.choresPaused() ? M`<div class="banner paused-banner">${this.s("All routines paused", "Alle routines gepauzeerd")}</div>` : P}
      <div class="person-task-grid">
        ${this.people.map((e) => this.personChoreCard(e, r, t, n))}
        ${this.freeChoreCard(r, t, n)}
      </div>
      <div class="surface history"><div class="surface-heading"><div><span class="eyebrow">${this.x("EVERY CONTRIBUTION COUNTS")}</span><h2>${this.x("Recent activity")}</h2></div>${this.addButton("Adjust points", "points", this.can("manage_chores") && this.people.length > 0)}</div>${t.length ? [...t].sort((e, t) => t.completed_at.localeCompare(e.completed_at)).slice(0, 30).map((t) => M`<div class="compact-row">${this.avatar(t.person_id)}<span class="row-copy"><strong>${this.person(t.person_id)?.name || this.x("Family member")}</strong><span class="muted">${t.note || e.find((e) => e.id === t.chore_id)?.title || (t.adjustment ? this.x("Manual adjustment") : this.x("Completed chore"))}</span></span></div>`) : this.empty("Nothing yet", "Completions will show up here.")}</div>
      ${this.celebrate ? M`<div class="confetti-overlay" aria-hidden="true">🎉</div>` : P}
      ${this.pendingCompletion ? M`<dialog open class="editor-dialog target-dialog"><header class="dialog-heading"><h2>${this.s("Where should the points go?", "Waar moeten de punten heen?")}</h2></header><div class="dialog-content target-options"><button class="primary" @click=${() => void this.confirmCompletion("savings")}>${this.s("Savings jar", "Spaarpot")}</button><button @click=${() => void this.confirmCompletion("goal")}>${this.s("A goal", "Een doel")}</button><button @click=${() => {
			this.pendingCompletion = void 0;
		}}>${this.t("cancel")}</button></div></dialog>` : P}
    </section>`;
	}
	recipes() {
		let e = this.data.recipes.items || [], t = this.data.recipes.categories || [];
		if (this.recipeId) {
			let t = e.find((e) => e.id === this.recipeId);
			return t ? this.recipeDetail(t) : M`<button @click=${() => this.navigate("recipes")}>← ${this.t("all_recipes")}</button>${this.empty(this.t("recipe_not_found"), this.t("recipe_missing_access"))}`;
		}
		let n = e.filter((e) => (!this.recipeCategory || (e.category_ids || []).includes(this.recipeCategory)) && `${e.title} ${(e.tags || []).join(" ")}`.toLowerCase().includes(this.recipeSearch.toLowerCase()));
		return M`<section>${this.mealPlanner()}<hr><div class="section-toolbar"><div><span class="eyebrow">${this.x("THE FAMILY COOKBOOK")}</span><h2>${this.x("Favorites, all in one place")}</h2></div><div class="toolbar-actions">${this.can("manage_recipes") ? M`<button @click=${() => this.openEditor("recipe-import")}>${this.x("Import from web")}</button>` : P}${this.addButton("New recipe", "recipe", this.can("manage_recipes"))}</div></div><div class="recipe-toolbar"><label class="search-label"><span class="sr-only">${this.x("Search recipes or tags")}</span><input type="search" placeholder=${this.x("Search recipes or tags…")} .value=${this.recipeSearch} @input=${(e) => this.recipeSearch = e.target.value}></label><label>${this.x("Category")}<select .value=${this.recipeCategory} @change=${(e) => this.recipeCategory = e.target.value}><option value="">${this.x("All categories")}</option>${t.map((e) => M`<option value=${e.id}>${this.categoryPath(e)}</option>`)}</select></label>${this.can("manage_recipes") ? M`<button @click=${() => this.openEditor("categories")}>${this.x("Manage categories")}</button>` : P}</div>
      <div class="recipe-grid">${n.length ? n.map((e) => M`<button class="recipe-card" @click=${() => this.navigate("recipes", e.id)}>${e.image ? M`<img src=${e.image} alt="" loading="lazy" referrerpolicy="no-referrer">` : M`<div class="recipe-placeholder" aria-hidden="true">♧<span>${this.x("FROM OUR KITCHEN")}</span></div>`}<div class="recipe-card-copy"><span class="eyebrow">${(e.category_ids || []).map((e) => t.find((t) => t.id === e)?.name).filter(Boolean).join(" · ") || this.x("Family favorite")}</span><h3>${e.title}</h3><p class="muted">${Number(e.prep_time || 0) + Number(e.cook_time || 0)} min · ${J(Number(e.servings || 4))} ${this.x("servings")}</p><div class="tags">${(e.tags || []).slice(0, 3).map((e) => M`<span>${e}</span>`)}</div></div></button>`) : this.empty(this.recipeSearch || this.recipeCategory ? "No recipes match" : "Start your family cookbook", "Save a favorite recipe, scale its servings and send ingredients to your lists.", this.addButton("Add a recipe", "recipe", this.can("manage_recipes")))}</div></section>`;
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
		return M`<section><div class="section-toolbar"><button @click=${() => this.navigate("recipes")}>← ${this.t("all_recipes")}</button><div class="toolbar-actions">${this.can("manage_recipes") ? M`<button @click=${() => this.openEditor("recipe", e)}>${this.x("Edit recipe")}</button><button class="danger" @click=${() => this.confirmDelete("recipes", e)}>${this.t("delete")}</button>` : P}</div></div>
      <div class="recipe-hero">${e.image ? M`<img src=${e.image} alt=${e.title} referrerpolicy="no-referrer">` : M`<div class="recipe-hero-art" aria-hidden="true">♧</div>`}<div><span class="eyebrow">${this.x("FROM THE FAMILY COOKBOOK")}</span><h2>${e.title}</h2><div class="tags">${(e.tags || []).map((e) => M`<span>${e}</span>`)}</div><p class="muted">${this.x("Prep")} ${e.prep_time || 0} min · ${this.x("Cook")} ${e.cook_time || 0} min</p>${this.addButton("Plan this meal", "meal", this.can("manage_meal_plan"), {
			day: this.selectedDay,
			slot: (this.settingsData.meal_slots || ["dinner"])[0],
			recipe_id: e.id,
			title: e.title,
			servings: t
		})}</div></div>
      <div class="recipe-detail-grid"><div class="surface ingredient-panel"><div class="surface-heading"><h3>${this.x("Ingredients")}</h3><div class="serving-control"><button aria-label=${this.x("Decrease servings")} ?disabled=${t <= 1} @click=${() => this.servings = {
			...this.servings,
			[e.id]: Math.max(1, t - 1)
		}}>−</button><label><span class="sr-only">${this.x("Servings")}</span><input type="number" min="1" step="1" .value=${String(t)} @change=${(t) => {
			let n = Number(t.target.value);
			n > 0 && (this.servings = {
				...this.servings,
				[e.id]: n
			});
		}}></label><button aria-label=${this.x("Increase servings")} @click=${() => this.servings = {
			...this.servings,
			[e.id]: t + 1
		}}>+</button></div></div><p class="muted">${J(t)} ${this.x("servings")} · ${this.x("automatically scaled from")} ${n}</p><p class="muted">${this.x("Check ingredients to send to your grocery lists.")}</p>
        ${r.map((r, o) => M`<div class="ingredient-row"><label class="check"><input type="checkbox" .checked=${i.has(o)} @change=${() => {
			let t = new Set(i);
			t.has(o) ? t.delete(o) : t.add(o), this.selectedIngredients = {
				...this.selectedIngredients,
				[e.id]: t
			};
		}}><span><strong>${J(Number(r.amount || 0) * t / n)} ${r.unit || ""}</strong> ${r.name}</span></label><label><span class="sr-only">${this.x("List for")} ${r.name}</span><select .value=${this.routes[e.id]?.[String(o)] || this.listId} @change=${(t) => this.routes = {
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
		}), `${i.size} ${this.x("ingredients sent to your grocery lists")}`)}>+ ${this.x("Add selected to groceries")}</button>
      </div><div class="surface method-panel"><span class="eyebrow">${this.x("LET’S MAKE SOMETHING GOOD")}</span><h3>${this.x("Method")}</h3><ol>${(e.steps || e.instructions || []).map((e) => M`<li>${e}</li>`)}</ol>${(e.steps || e.instructions || []).length ? P : M`<p class="muted">${this.x("No instructions yet. Edit this recipe to add the method.")}</p>`}</div></div></section>`;
	}
	today() {
		let e = this.selectedDay || U(/* @__PURE__ */ new Date()), t = this.people.some((e) => e.id === this.todayPersonId) ? this.todayPersonId : this.pinPersonId || this.me?.id || this.people[0]?.id || "", n = this.person(t), r = (e = []) => !t || !e.length || e.includes(t), i = this.previousPersonId(t), a = this.nextPersonId(t), o = X(We(this.data.calendar.items || [], e, e), e).filter((e) => r(e.person_ids || []));
		(this.data.groceries.items || []).filter((e) => !e.checked && (!t || !e.assignee_id || e.assignee_id === t));
		let s = new Set((this.data.groceries.lists || []).filter((e) => e.list_type === "todo").map((e) => e.id)), c = (this.data.groceries.items || []).filter((e) => s.has(e.list_id) && !e.checked && (!t || !e.assignee_id || e.assignee_id === t)), l = (this.data.chores.items || []).filter((t) => Be(t, e) && r(t.assignee_ids || [])), u = this.data.chores.completions || [], d = n?.name || this.s("Family overview", "Gezinsoverzicht");
		return M`<section class="today-page person-day-page">
      <div class="today-member-strip person-day-strip">
        <div class="person-day-head"><span class="eyebrow">${this.s("Day for", "Dag voor")}</span><h3>${d}</h3></div>
        <div class="person-day-nav" role="group" aria-label=${this.s("Choose family member", "Kies familielid")}>
          <button class="icon-button" ?disabled=${!i} aria-label=${this.s("Previous family member", "Vorige familielid")} @click=${() => this.selectTodayPerson(i)}>‹</button>
          <div class="person-day-strip-avatars">${this.people.map((n) => M`<button class=${t === n.id ? "person-pick active" : "person-pick"} style=${`--person-color:${this.color(n.color)}`} aria-pressed=${t === n.id} title=${n.name} @click=${() => {
			this.selectTodayPerson(n.id), this.selectedDay = e;
		}}>${this.avatar(n.id)}</button>`)}</div>
          <button class="icon-button" ?disabled=${!a} aria-label=${this.s("Next family member", "Volgend familielid")} @click=${() => this.selectTodayPerson(a)}>›</button>
        </div>
      </div>
      <div class="today-grid person-day-grid">
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("TODAY’S AGENDA")}</span><h3>${this.x("Calendar")}</h3></div><button @click=${() => this.navigate("calendar")}>${this.x("Open calendar →")}</button></div>${o.length ? o.map((e) => M`<button class="agenda-event" style=${`--event-color:${this.eventColor(e)}`} @click=${() => this.openEditor("event-detail", e)}><span class="event-time">${e.all_day ? this.x("All day") : this.time(e.occurrence_start)}</span><strong>${e.title}</strong><span class="event-people">${(e.person_ids || []).map((e) => this.avatar(e))}</span></button>`) : M`<p class="muted">${this.x("Nothing scheduled today.")}</p>`}${this.addButton("Add an event", "event", this.canEvent(), { day: e })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("TO DO")}</span><h3>${c.length} ${this.x("open")}</h3></div><button @click=${() => this.navigate("lists")}>${this.s("Lists →", "Lijstjes →")}</button></div>${c.slice(0, 6).map((e) => M`<label class="check compact-row"><input type="checkbox" ?disabled=${!this.can("manage_groceries") || this.saving} @change=${() => void this.action(() => this.mutate("groceries", {
			...e,
			checked: !0
		}), "Nice, one less thing")}><span class="row-copy"><strong>${e.name}</strong>${e.deadline ? M`<span class="muted">${this.x("Due")} ${this.date(e.deadline, {
			month: "short",
			day: "numeric"
		})}</span>` : P}</span>${e.assignee_id ? this.avatar(e.assignee_id) : P}</label>`)}${this.addButton("Add to-do", "grocery", this.can("manage_groceries"), {
			list_id: [...s][0] || this.listId,
			list_type: "todo"
		})}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">${this.x("CHORES")}</span><h3>${l.length} ${this.x("today")}</h3></div><button @click=${() => {
			this.selectedDay = e, this.navigate("chores");
		}}>${this.x("Chore board →")}</button></div>${l.map((t) => {
			let n = t.assignee_ids || [], r = n[(Number(t.rotation_index) || 0) % Math.max(1, n.length)], i = u.some((n) => n.chore_id === t.id && U(new Date(n.completed_at)) === e);
			return M`<div class=${`compact-row ${i ? "done" : ""}`}>${this.avatar(r)}<span class="row-copy"><strong>${t.title}</strong><span class="muted">${i ? this.x("Done ✓") : `${t.points} ${this.x("pts")}`}</span></span></div>`;
		})}${l.length ? P : M`<p class="muted">${this.x("No chores due today.")}</p>`}</article>
      </div></section>`;
	}
	contacts() {
		let e = this.can("manage_contacts"), t = this.contactQuery.trim().toLowerCase(), n = [...this.data.contacts?.items || []].sort((e, t) => `${e.name}`.localeCompare(t.name)).filter((e) => !t || [
			e.name,
			e.group,
			e.address,
			e.notes,
			...e.phones || [],
			...e.emails || []
		].some((e) => `${e || ""}`.toLowerCase().includes(t))), r = [...new Set(n.map((e) => e.group || this.x("Other")))].sort((e, t) => e === this.x("Other") ? 1 : t === this.x("Other") ? -1 : e.localeCompare(t));
		return M`<section><div class="section-toolbar"><div><span class="eyebrow">${this.s("FAMILY ADDRESS BOOK", "GEZINSADRESBOEK")}</span><h2>${this.s("Who to call", "Wie moet je bellen")}</h2></div><div class="toolbar-actions"><label>${this.s("Search", "Zoeken")}<input type="search" placeholder=${this.s("Name, school, doctor…", "Naam, school, dokter…")} .value=${this.contactQuery} @input=${(e) => this.contactQuery = e.target.value}></label>${this.addButton(this.s("New contact", "Nieuw contact"), "contact", e)}</div></div>
      ${n.length ? r.map((t) => M`<h3 class="contact-group">${t}</h3><div class="contact-grid">${n.filter((e) => (e.group || this.x("Other")) === t).map((t) => M`<article class="surface contact-card"><div class="contact-avatar" aria-hidden="true">${`${t.name || "?"}`.split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase()}</div><div class="row-copy"><h3>${t.name}</h3>${(t.phones || []).map((e) => M`<a href=${`tel:${e.replace(/[^\d+]/g, "")}`}>☎ ${e}</a>`)}${(t.emails || []).map((e) => M`<a href=${`mailto:${e}`}>✉ ${e}</a>`)}${t.address ? M`<p class="muted">${t.address}</p>` : P}${t.notes ? M`<small class="muted">${t.notes}</small>` : P}</div>${e ? M`<div class="journal-actions"><button class="icon-button" aria-label=${`${this.x("Edit")} ${t.name}`} @click=${() => this.openEditor("contact", t)}>✎</button><button class="icon-button" aria-label=${`${this.x("Delete")} ${t.name}`} @click=${() => this.confirmDelete("contacts", t)}>×</button></div>` : P}</article>`)}</div>`) : this.empty(t ? "No matches" : "Keep everyone close", t ? "Try a different search." : "Babysitters, school, the dentist, grandparents: one shared place for every number.", this.addButton("Add the first contact", "contact", e))}</section>`;
	}
	birthdays() {
		let e = U(/* @__PURE__ */ new Date()), t = this.people.map((t) => ({
			person: t,
			next: Re(t.birthday, e)
		})).sort((e, t) => (e.next?.days ?? 9999) - (t.next?.days ?? 9999)), n = t.filter((e) => e.next), r = t.filter((e) => !e.next);
		return M`<section><div class="section-toolbar"><div><span class="eyebrow">${this.x("CELEBRATE TOGETHER")}</span><h2>${this.x("Upcoming birthdays")}</h2></div>${this.addButton("Add a person", "person", this.can("manage_people"))}</div>
      <div class="birthday-grid">${n.length ? n.map(({ person: e, next: t }) => M`<article class=${`surface birthday-card ${t.days === 0 ? "today" : ""}`} style=${`--person-color:${this.color(e.color)}`}>${this.avatar(e.id)}<div class="row-copy"><h3>${e.name}</h3><p class="muted">${this.date(t.date, {
			weekday: "long",
			month: "long",
			day: "numeric"
		})}${t.age === void 0 ? "" : ` · ${this.x("turns")} ${t.age}`}</p></div><strong class="countdown">${t.days === 0 ? this.x("Today 🎉") : t.days === 1 ? this.x("Tomorrow") : `${t.days} ${this.x("days")}`}</strong>${this.can("manage_people") ? M`<button class="icon-button" aria-label=${`${this.x("Edit")} ${e.name}`} @click=${() => this.openEditor("person", e)}>✎</button>` : P}</article>`) : this.empty("No birthdays yet", "Add a birthday to each family member in Settings and we’ll count down for you.", this.addButton("Add a person", "person", this.can("manage_people")))}</div>
      ${r.length ? M`<details class="all-chores"><summary>${this.x("Family members without a birthday")} (${r.length})</summary>${r.map(({ person: e }) => M`<div class="compact-row">${this.avatar(e.id)}<span>${e.name}</span>${this.can("manage_people") ? M`<button @click=${() => this.openEditor("person", e)}>${this.x("Add birthday")}</button>` : P}</div>`)}</details>` : P}</section>`;
	}
	settings() {
		let e = this.settingsData;
		return M`<section><div class="settings-intro"><span class="eyebrow">${this.languageCode === "nl" ? "JULLIE THUIS, JULLIE MANIER" : "YOUR HOME, YOUR WAY"}</span><h2>${this.languageCode === "nl" ? "Een plek voor iedereen" : "A place for everyone"}</h2><p class="muted">${this.languageCode === "nl" ? "Koppel familieleden aan Home Assistant-gebruikers, kies kleuren en bepaal wie wat mag beheren." : "Link family members to Home Assistant users, choose their colors and set what they can manage."}</p></div><div class="section-toolbar"><h3>${this.t("family_member")}${this.languageCode === "nl" ? "en" : "s"}</h3>${this.addButton(this.languageCode === "nl" ? "Persoon toevoegen" : "Add a person", "person", this.can("manage_people"))}</div><div class="people-grid">${this.people.length ? this.people.map((e) => M`<article class="surface person-card">${this.avatar(e.id)}<div class="row-copy"><h3>${e.name}</h3><p class="muted">${e.role === "parent_admin" ? this.t("role_admin") : e.role === "parent" ? this.t("role_parent") : this.t("role_child")} · ${e.user_id || e.ha_user_id ? this.t("ha_linked") : this.t("ha_not_linked")}</p><small class="muted">${Object.keys(e.permissions || {}).length} ${this.t("permission_overrides")}</small></div>${this.can("manage_people") ? M`<button @click=${() => this.openEditor("person", e)}>${this.languageCode === "nl" ? "Bewerken" : "Edit"}</button><button class="icon-button danger" aria-label=${`${this.languageCode === "nl" ? "Verwijder" : "Remove"} ${e.name}`} @click=${() => this.confirmDelete("people", e)}>×</button>` : P}</article>`) : this.empty(this.languageCode === "nl" ? "Welkom in je gezinsomgeving" : "Welcome to your family space", this.languageCode === "nl" ? "Voeg je eerste familielid toe en koppel het Home Assistant-account." : "Add your first family member and link their Home Assistant user ID.", this.addButton(this.languageCode === "nl" ? "Persoon toevoegen" : "Add a person", "person", this.can("manage_people")))}</div>
      <div class="settings-grid"><article class="surface"><span class="eyebrow">${this.languageCode === "nl" ? "WEERGAVE & STANDAARDEN" : "DISPLAY & DEFAULTS"}</span><h3>${this.languageCode === "nl" ? "Stel jullie dagritme in" : "Set your everyday rhythm"}</h3><dl><div><dt>${this.languageCode === "nl" ? "Agenda" : "Calendar"}</dt><dd>${e.default_calendar_view || "list"} ${this.languageCode === "nl" ? "weergave" : "view"} · ${this.languageCode === "nl" ? "week start" : "week starts"} ${e.week_start || (this.languageCode === "nl" ? "volgens taal" : "by locale")}</dd></div><div><dt>${this.languageCode === "nl" ? "Dagoverzicht" : "Day overview"}</dt><dd>${e.overview_position || "right"} · ${e.overview_collapsed ? this.languageCode === "nl" ? "ingeklapt" : "collapsed" : this.languageCode === "nl" ? "uitgeklapt" : "expanded"}</dd></div><div><dt>${this.languageCode === "nl" ? "Tijd & taal" : "Time & language"}</dt><dd>${e.time_format || "24"} ${this.languageCode === "nl" ? "uur" : "hour"} · ${e.language || this.locale}</dd></div><div><dt>${this.languageCode === "nl" ? "Maaltijdvakken" : "Meal slots"}</dt><dd>${(e.meal_slots || []).join(", ")}</dd></div><div><dt>${this.languageCode === "nl" ? "Winkels" : "Stores"}</dt><dd>${(e.stores || []).join(", ") || (this.languageCode === "nl" ? "Nog geen winkels" : "No stores yet")}</dd></div><div><dt>${this.languageCode === "nl" ? "Boodschappen standaard" : "Grocery default"}</dt><dd>${this.groceryDefaultLabel(e.default_grocery_list_id)}</dd></div><div><dt>${this.languageCode === "nl" ? "Competitie" : "Competition"}</dt><dd>${e.competition_default || "week"}</dd></div><div><dt>${this.languageCode === "nl" ? "Sync-interval" : "Sync interval"}</dt><dd>${e.sync_interval || 30} ${this.languageCode === "nl" ? "minuten" : "minutes"}</dd></div><div><dt>${this.languageCode === "nl" ? "Herinneringen" : "Reminders"}</dt><dd>${e.reminders_enabled === !1 ? this.languageCode === "nl" ? "Uit" : "Off" : `${e.default_reminder_minutes ?? 15} min ${this.languageCode === "nl" ? "vooraf" : "before"} · ${e.notify_service ? `notify.${e.notify_service}` : this.languageCode === "nl" ? "HA-meldingen" : "HA notifications"}${e.daily_agenda_time ? ` · ${this.languageCode === "nl" ? "agenda om" : "agenda at"} ${e.daily_agenda_time}` : ""}`}</dd></div></dl>${this.addButton(this.languageCode === "nl" ? "Voorkeuren bewerken" : "Edit preferences", "preferences", this.can("manage_settings"), {
			...e,
			theme: this.theme
		})}</article>
      <article class="surface"><span class="eyebrow">${this.languageCode === "nl" ? "MAAK HET EIGEN" : "MAKE YOURSELF AT HOME"}</span><h3>${this.languageCode === "nl" ? "Uiterlijk" : "Appearance"}</h3><p class="muted">${this.languageCode === "nl" ? "Kies een uiterlijk voor dit apparaat. Auto volgt je Home Assistant-thema." : "Choose a look for this device. Auto follows your Home Assistant theme."}</p><div class="theme-options" role="group" aria-label=${this.languageCode === "nl" ? "Uiterlijk" : "Appearance"}>${[
			"auto",
			"light",
			"dark"
		].map((e) => M`<button class=${this.theme === e ? "active" : ""} aria-pressed=${this.theme === e} @click=${() => {
			this.theme = e, localStorage.setItem("family-organizer-theme", e);
		}}><span aria-hidden="true">${e === "auto" ? "◐" : e === "light" ? "☼" : "☾"}</span>${e === "auto" ? (this.languageCode, "Auto") : e === "light" ? this.languageCode === "nl" ? "Licht" : "Light" : this.languageCode === "nl" ? "Donker" : "Dark"}</button>`)}</div><hr><span class="eyebrow">${this.languageCode === "nl" ? "AGENDA-KOPPELINGEN" : "CALENDAR CONNECTIONS"}</span><h3>${this.languageCode === "nl" ? "Houd agenda’s in sync" : "Keep calendars in sync"}</h3><p class="muted">${this.languageCode === "nl" ? "Bronnen en inloggegevens worden veilig in Home Assistant beheerd, nooit in dit paneel." : "Sources and credentials are managed securely in Home Assistant, never in this panel."}</p><a class="button-link" href="/config/integrations/integration/family_organizer">${this.languageCode === "nl" ? "Open integratie-instellingen" : "Open integration settings"} →</a><p class="muted">${this.languageCode === "nl" ? "Instellingen → Apparaten & diensten → Family Organizer → Configureren." : "Settings → Devices & services → Family Organizer → Configure."}</p>${(this.data.calendar.sources || []).map((e) => M`<div class="compact-row"><span class="event-dot" style=${`background:${this.color(e.color)}`}></span><strong>${e.name}</strong><span class="muted">${e.enabled === !1 ? this.languageCode === "nl" ? "Uitgeschakeld" : "Disabled" : this.languageCode === "nl" ? "Verbonden" : "Connected"}</span></div>`)}</article></div></section>`;
	}
	field(e, t, n = "", r = "text", i = !1, a = {}) {
		return M`<label>${this.x(e)}<input name=${t} type=${r} .value=${String(n ?? "")} ?required=${i} min=${a.min ?? P} max=${a.max ?? P} step=${a.step ?? P} placeholder=${a.placeholder ? this.x(a.placeholder) : P} list=${a.list ?? P} ?autofocus=${a.autofocus || !1}></label>`;
	}
	select(e, t, n, r) {
		let i = `editor-${t}`;
		return M`<div class="form-field"><label for=${i}>${this.x(e)}</label><select id=${i} name=${t}>${r.map(([e, t]) => M`<option value=${e} ?selected=${e === n}>${this.x(t)}</option>`)}</select></div>`;
	}
	textarea(e, t, n = "", r = "") {
		return M`<label class="full">${this.x(e)}<textarea name=${t} rows="4" .value=${n} placeholder=${this.x(r)}></textarea></label>`;
	}
	personChecks(e, t = [], n = !1) {
		return M`<fieldset class="full"><legend>${this.x("Family members")}</legend><div class="checkbox-group">${this.people.filter((e) => !n || e.id === this.me?.id).map((n) => M`<label class="check"><input type="checkbox" name=${e} value=${n.id} ?checked=${t.includes(n.id)}>${this.avatar(n.id)}${n.name}</label>`)}</div></fieldset>`;
	}
	shared(e) {
		return M`<label class="check full"><input name="shared" type="checkbox" ?checked=${e.shared !== !1}>${this.x("Share with the family")}</label>`;
	}
	haUserPicker(e) {
		let t = e.user_id || e.ha_user_id || "", n = this.haUsers.filter((t) => !t.person_id || t.person_id === e.id);
		return M`<div class="form-field full"><label for="editor-ha-user">${this.x("Copy from Home Assistant user")}</label>
      <select id="editor-ha-user" @change=${(e) => this.applyHaUser(e.target.value)}>
        <option value="" ?selected=${!t}>${this.x("Don’t link a Home Assistant user")}</option>
        ${n.map((e) => M`<option value=${e.id} ?selected=${e.id === t}>${e.name}</option>`)}
      </select>
      <label class="check"><input name="sync_picture" type="checkbox" ?checked=${!!e.sync_picture} ?disabled=${!t}>${this.x("Keep profile picture in sync with Home Assistant")}</label>
      <p class="muted">${this.x("Only users that aren’t linked to another family member are listed. The name and profile picture are copied over.")}</p></div>`;
	}
	dialog() {
		let { kind: e, item: t } = this.editor, n = this.languageCode === "nl" ? {
			quick: "Wat wil je toevoegen?",
			"event-detail": t.title,
			event: t.id ? "Afspraakreeks bewerken" : "Afspraak toevoegen",
			grocery: t.id ? "Item bewerken" : "Item toevoegen",
			list: t.id ? "Lijst bewerken" : "Lijst maken",
			contact: t.id ? "Contact bewerken" : "Contact toevoegen",
			"recipe-import": "Recept van internet importeren",
			meal: t.id ? "Geplande maaltijd bewerken" : "Maaltijd plannen",
			chore: t.id ? "Klus bewerken" : "Klus inplannen",
			points: "Gezinspunten aanpassen",
			recipe: t.id ? "Recept bewerken" : "Favoriet recept opslaan",
			categories: "Receptcategorieën",
			category: t.id ? "Categorie bewerken" : "Categorie maken",
			"calendar-categories": "Agendacategorieën",
			"calendar-category": t.id ? "Agendacategorie bewerken" : "Agendacategorie maken",
			person: t.id ? "Familielid bewerken" : "Familielid toevoegen",
			preferences: "Weergave & standaarden",
			delete: "Dit item verwijderen?"
		} : {
			quick: "What would you like to add?",
			"event-detail": t.title,
			event: t.id ? "Edit event series" : "Add an event",
			grocery: t.id ? "Edit item" : "Add item",
			list: t.id ? "Edit list" : "Create a list",
			contact: t.id ? "Edit contact" : "Add a contact",
			"recipe-import": "Import a recipe from the web",
			meal: t.id ? "Edit planned meal" : "Plan a meal",
			chore: t.id ? "Edit chore" : "Schedule a chore",
			points: "Adjust family points",
			recipe: t.id ? "Edit recipe" : "Save a favorite recipe",
			categories: "Recipe categories",
			category: t.id ? "Edit category" : "Create a category",
			"calendar-categories": "Calendar categories",
			"calendar-category": t.id ? "Edit calendar category" : "Create a calendar category",
			person: t.id ? "Edit family member" : "Add a family member",
			preferences: "Display & defaults",
			delete: "Delete this item?"
		}, r = ![
			"quick",
			"event-detail",
			"categories",
			"calendar-categories"
		].includes(e);
		return M`<dialog class=${`editor-dialog ${e === "event-detail" ? "detail-dialog" : ""}`} aria-labelledby="dialog-title" @cancel=${(e) => {
			e.preventDefault(), this.closeEditor();
		}} @click=${(e) => {
			if (e.target === e.currentTarget) {
				let t = e.currentTarget.getBoundingClientRect();
				(e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom) && this.closeEditor();
			}
		}}>
      <header class="dialog-heading"><div><span class="eyebrow">FAMILY ORGANIZER</span><h2 id="dialog-title">${n[e]}</h2></div><button type="button" class="icon-button" aria-label=${this.t("close_dialog")} ?disabled=${this.saving} @click=${() => this.closeEditor()}>×</button></header>
      ${this.error ? M`<div class="banner error" role="alert">${this.error}</div>` : P}
      ${r ? M`<form @submit=${(e) => void this.saveEditor(e)}><fieldset class="form-fields" ?disabled=${this.saving}>${this.editorFields(e, t)}</fieldset><footer class="dialog-footer"><span class="muted" role="status">${this.saving ? this.t("saving") : e === "event" && t.recurrence ? this.languageCode === "nl" ? "Wijzigingen gelden voor de hele reeks." : "Changes apply to the entire series." : ""}</span><button type="button" ?disabled=${this.saving} @click=${() => this.closeEditor()}>${this.t("cancel")}</button><button class=${e === "delete" ? "danger-primary" : "primary"} ?disabled=${this.saving}>${this.saving ? this.t("saving") : e === "delete" ? this.t("delete") : this.t("save")}</button></footer></form>` : M`<div class="dialog-content">${e === "quick" ? this.quickMenu() : e === "event-detail" ? this.eventDetail(t) : e === "calendar-categories" ? this.calendarCategoryManager() : this.categoryManager()}</div>`}
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
				title: "Shopping item",
				description: "Remember it before you forget it",
				icon: "▤",
				enabled: this.can("manage_groceries"),
				item: { list_id: this.listId }
			},
			{
				kind: "grocery",
				title: "To-do",
				description: "Get it off your mind and onto the list",
				icon: "☑",
				enabled: this.can("manage_groceries"),
				item: { list_type: "todo" }
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
			},
			{
				kind: "contact",
				title: "Contact",
				description: "A number the whole family can find",
				icon: "☎",
				enabled: this.can("manage_contacts"),
				item: {}
			}
		];
		return M`<div class="quick-menu">${e.filter((e) => e.enabled).map((e) => M`<button @click=${() => this.openEditor(e.kind, e.item)}><span class="quick-icon" aria-hidden="true">${e.icon}</span><span><strong>${this.x(e.title)}</strong><small>${this.x(e.description)}</small></span><span aria-hidden="true">→</span></button>`)}</div>
      ${e.every((e) => !e.enabled) ? this.empty(this.t("view_only"), this.t("ask_admin_permissions")) : P}`;
	}
	eventDetail(e) {
		return M`<div class="event-detail"><div class="detail-date" style=${`--event-color:${this.eventColor(e)}`}><span>${this.date(U(new Date(e.occurrence_start)), { month: "short" })}</span><strong>${new Date(e.occurrence_start).getDate()}</strong></div><div><h3>${this.date(U(new Date(e.occurrence_start)))}</h3><p>${e.all_day ? this.s("All day", "Hele dag") : `${this.time(e.occurrence_start)} – ${this.time(e.occurrence_end)}`}</p>${U(new Date(e.occurrence_start)) === U(new Date(e.occurrence_end)) ? P : M`<p class="muted">${this.s("Ends", "Eindigt")} ${this.date(U(new Date(e.all_day ? new Date(e.occurrence_end).getTime() - 1 : e.occurrence_end)))}</p>`}</div></div><dl class="event-metadata"><div><dt>${this.s("Where", "Waar")}</dt><dd>${e.location || this.s("No location", "Geen locatie")}</dd></div><div><dt>${this.s("Who", "Wie")}</dt><dd class="event-people">${(e.person_ids || []).map((e) => M`<span class="check">${this.avatar(e)}${this.person(e)?.name || this.s("Family member", "Familielid")}</span>`)}</dd></div><div><dt>${this.s("Repeats", "Herhaalt")}</dt><dd>${e.recurrence || this.s("Does not repeat", "Herhaalt niet")}</dd></div><div><dt>${this.s("Visibility", "Zichtbaarheid")}</dt><dd>${e.shared === !1 ? this.s("Private", "Privé") : this.s("Shared with family", "Gedeeld met gezin")}</dd></div></dl>${e.description ? M`<p class="event-description">${e.description}</p>` : P}${e.source_id ? M`<p class="muted">${this.s("Imported calendar event. Local edits may be replaced on the next source sync.", "Geïmporteerde agenda-afspraak. Lokale wijzigingen kunnen bij de volgende sync worden vervangen.")}</p>` : P}<div class="detail-actions">${this.canEvent(e) ? M`<button class="primary" @click=${() => this.openEditor("event", e)}>${this.s("Edit", "Bewerken")} ${e.recurrence ? this.s("series", "reeks") : this.s("event", "afspraak")}</button>` : P}${this.canEvent() ? M`<button @click=${() => {
			let t = Ie(e);
			this.can("manage_calendar_all") || (t.person_ids = [this.me?.id].filter(Boolean)), this.openEditor("event", t);
		}}>${this.s("Duplicate", "Dupliceren")}</button>` : P}${this.canEvent(e) ? M`<button class="danger" @click=${() => this.confirmDelete("calendar", e)}>${this.s("Delete", "Verwijderen")} ${e.recurrence ? this.s("series", "reeks") : this.s("event", "afspraak")}</button>` : P}</div>`;
	}
	categoryManager() {
		return M`${this.addButton("New category", "category", this.can("manage_recipes"))}<div class="category-list">${(this.data.recipes.categories || []).map((e) => M`<div class="compact-row"><strong class="row-copy">${this.categoryPath(e)}</strong><button @click=${() => this.openEditor("category", e)}>${this.x("Edit")}</button><button class="danger" @click=${() => this.confirmDelete("recipes", e, "categories")}>${this.t("delete")}</button></div>`)}</div>`;
	}
	calendarCategoryManager() {
		return M`${this.addButton(this.s("New category", "Nieuwe categorie"), "calendar-category", this.can("manage_calendar_all"))}<div class="category-list">${this.calendarCategories().map((e) => M`<div class="compact-row" style=${`--event-color:${e.color}`}><span class="event-dot" aria-hidden="true"></span><strong class="row-copy">${e.icon} ${e.label}</strong><button @click=${() => this.openEditor("calendar-category", {
			id: e.id,
			name: e.label,
			icon: e.icon,
			color: e.color
		})}>${this.x("Edit")}</button><button class="danger" @click=${() => this.confirmDelete("calendar", {
			id: e.id,
			title: e.label
		}, "categories")}>${this.t("delete")}</button></div>`)}</div>`;
	}
	editorFields(e, t) {
		if (e === "delete") {
			let e = this.editor?.collection === "lists" ? this.x("All items on this list will also be removed.") : this.editor?.collection === "categories" ? this.x("Recipes are kept. Child categories move to the parent.") : t.recurrence ? this.x("This removes the entire repeating event series.") : this.x("This cannot be undone.");
			return M`<div class="full"><p>${this.t("delete")} <strong>${t.title || t.name || this.x("this item")}</strong>?</p><p class="muted">${e}</p></div>`;
		}
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
			return t.recurrence && !a.some(([e]) => e === t.recurrence) && a.push([t.recurrence, `${this.x("Keep existing:")} ${t.recurrence}`]), M`${this.field("Event title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Location", "location", t.location)}${this.field("Starts on", "day", i, "date", !0)}${this.field("Ends on (inclusive for all-day)", "end_day", t.all_day && r ? G(r.slice(0, 10), -1) : r.slice(0, 10) || i, "date", !0)}${this.field("Start time", "start", t.start_time || n.slice(11, 16) || "18:00", "time", !0)}${this.field("End time", "end", t.end_time || r.slice(11, 16) || "19:00", "time", !0)}<label class="check full"><input name="all_day" type="checkbox" ?checked=${!!t.all_day}>${this.x("All-day event (time fields are ignored)")}</label>${this.select("Category", "category", t.category || "other", this.calendarCategories().map((e) => [e.id, e.label]))}${this.select("Repeat", "recurrence", t.recurrence || "", a)}${this.select("Reminder", "reminder", t.reminder_minutes === null || t.reminder_minutes === void 0 ? "" : String(t.reminder_minutes), [
				["", `${this.x("Family default")} (${this.settingsData.default_reminder_minutes ?? 15} min)`],
				["-1", "No reminder"],
				["0", "At start"],
				["5", "5 minutes before"],
				["15", "15 minutes before"],
				["30", "30 minutes before"],
				["60", "1 hour before"],
				["120", "2 hours before"],
				["1440", "1 day before"]
			])}${this.personChecks("person_ids", t.person_ids || (this.can("manage_calendar_all") ? [] : [this.me?.id]), !this.can("manage_calendar_all"))}${this.textarea("Notes", "description", t.description)}${this.shared(t)}`;
		}
		if (e === "grocery") {
			let e = (this.data.groceries.lists || []).find((e) => e.id === (t.list_id || this.listId)), n = (t.list_type || e?.list_type || "groceries") !== "todo";
			return M`${this.field(n ? "Item name" : "What needs doing?", "name", t.name, "text", !0, { autofocus: !0 })}${n ? M`${this.field("Quantity", "quantity", t.quantity ?? 1, "number", !0, {
				min: .001,
				step: "any"
			})}${this.field("Unit", "unit", t.unit, "text", !1, { placeholder: "cups, kg, packs" })}` : P}${this.select("List", "list_id", t.list_id || this.listId, (this.data.groceries.lists || []).map((e) => [e.id, e.name]))}${n ? M`<label>${this.x("Store")}<input name="store" list="store-options" .value=${t.store || ""}></label><datalist id="store-options">${(this.settingsData.stores || []).map((e) => M`<option value=${e}></option>`)}</datalist>` : P}${this.field("Deadline", "deadline", t.deadline, "date")}<label>${this.x("Assigned to")}<select name="assignee_id"><option value="">${this.x("Anyone")}</option>${this.peopleOptions(t.assignee_id)}</select></label>${this.textarea("Notes", "notes", t.notes)}${this.shared(t)}`;
		}
		if (e === "list") {
			let e = (e) => e === "todo" ? this.s("To-Do", "Taken") : e === "shopping" ? this.s("Winkelen", "Winkelen") : this.s("Boodschappen", "Boodschappen");
			return M`${this.field("List name", "name", t.name, "text", !0, { autofocus: !0 })}${t.id ? P : this.select("Type", "list_type", t.list_type || "groceries", [
				"todo",
				"shopping",
				"groceries"
			].map((t) => [t, e(t)]))}${(t.list_type || "groceries") === "todo" ? P : this.field("Default store", "store", t.store)}${this.shared(t)}`;
		}
		if (e === "recipe-import") return M`${this.field("Recipe page URL", "url", t.url, "url", !0, {
			autofocus: !0,
			placeholder: "https://â€¦"
		})}<p class="muted full">${this.x("We read the recipe details most cooking sites publish, then let you review before saving.")}</p>`;
		if (e === "contact") return M`${this.field("Name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Group", "group", t.group, "text", !1, {
			list: "contact-groups",
			placeholder: "School, Doctors, Family, Friends…"
		})}<datalist id="contact-groups">${[...new Set((this.data.contacts?.items || []).map((e) => e.group).filter(Boolean))].map((e) => M`<option value=${e}></option>`)}</datalist>${this.textarea("Phone numbers (one per line)", "phones", (t.phones || []).join("\n"), "+31 6 1234 5678")}${this.textarea("Email addresses (one per line)", "emails", (t.emails || []).join("\n"), "name@example.com")}${this.field("Address", "address", t.address)}${this.textarea("Notes", "notes", t.notes, "Opening hours, who to ask for…")}${this.shared(t)}`;
		if (e === "meal") {
			let e = this.data.recipes.items || [], n = e.find((e) => e.id === t.recipe_id), r = this.mealTitleQuery || n?.title || t.title || "", i = r.trim() ? e.filter((e) => e.title.toLowerCase().includes(r.trim().toLowerCase())).slice(0, 8) : [];
			return M`${this.field("Date", "day", t.day || this.selectedDay, "date", !0)}${this.select("Meal slot", "slot", t.slot || t.meal || (this.settingsData.meal_slots || ["dinner"])[0], (this.settingsData.meal_slots || [
				"breakfast",
				"lunch",
				"dinner"
			]).map((e) => [e, e]))}<div class="form-field full meal-title-field"><label for="editor-title">${this.x("Meal or recipe name")}</label><input id="editor-title" name="title" type="text" .value=${r} required autocomplete="off" placeholder=${this.x("Type to search your recipes…")} @input=${(e) => {
				this.mealTitleQuery = e.target.value;
			}}>${i.length ? M`<ul class="meal-title-suggestions">${i.map((e) => M`<li><button type="button" @click=${(t) => {
				let n = t.currentTarget.closest(".meal-title-field")?.querySelector("input");
				n && (n.value = e.title), this.mealTitleQuery = e.title;
			}}>${e.title}</button></li>`)}</ul>` : P}</div>${this.field("Servings", "servings", t.servings || 4, "number", !0, {
				min: 1,
				step: 1
			})}`;
		}
		if (e === "chore") return M`${this.field("Chore title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Points", "points", t.points ?? 5, "number", !0, {
			min: 0,
			step: 1
		})}${this.field("Icon (MDI name)", "icon", t.icon || "mdi:check-circle-outline")}
      <label class="check full"><input name="is_free" type="checkbox" ?checked=${!!t.is_free}>${this.s("Free to pick up by anyone", "Vrij, door iedereen op te pakken")}</label>
      ${this.select("Schedule", "schedule", t.schedule || "once", [
			["once", "One time"],
			["daily", "Daily"],
			["weekly", "Weekly"],
			["monthly", "Monthly"],
			["custom", "Custom interval"],
			...t.schedule?.startsWith("weekly:") ? [[t.schedule, "Keep existing weekdays"]] : []
		])}
      ${t.is_free ? P : this.personChecks("assignee_ids", t.assignee_ids || (t.assignee_id ? [t.assignee_id] : []))}
      <label class="check full"><input name="rotate" type="checkbox" ?checked=${!!t.rotate}>${this.x("Rotate between assignees after each completion")}</label>
      <fieldset class="full"><legend>${this.x("Weekdays (weekly schedule)")}</legend><div class="checkbox-group">${Array.from({ length: 7 }, (e, n) => M`<label class="check"><input name="weekdays" type="checkbox" value=${n} ?checked=${(t.weekdays || []).includes(n)}>${this.date(G("2026-06-01", n), { weekday: "long" })}</label>`)}</div></fieldset>
      ${this.field("Day of month (monthly)", "month_day", t.month_day || 1, "number", !0, {
			min: 1,
			max: 31
		})}${this.field("Every N days (custom)", "interval_days", t.interval_days || 2, "number", !0, {
			min: 1,
			max: 365
		})}
      ${this.select("Time of day (routine)", "daypart", t.daypart || "custom", [
			["morning", this.s("Morning (07:00–11:59)", "Ochtend (07:00–11:59)")],
			["afternoon", this.s("Afternoon (12:00–17:59)", "Middag (12:00–17:59)")],
			["evening", this.s("Evening (18:00–23:59)", "Avond (18:00–23:59)")],
			["custom", this.s("Custom", "Aangepast")]
		])}
      ${this.field(t.is_free ? this.s("Expires on (free task)", "Vervalt op (vrij taakje)") : this.s("Due date (one time)", "Vervaldatum (eenmalig)"), t.is_free ? "expires_at" : "due_date", (t.is_free ? t.expires_at : t.due_date) || this.selectedDay, "date")}
      ${this.field("Due time", "due_time", t.due_time, "time")}
      <label class="check full"><input name="retry_allowed" type="checkbox" ?checked=${!!t.retry_allowed}>${this.s("Allow a retry window after the deadline", "Herkansing toegestaan na de deadline")}</label>
      ${this.field(this.s("Retry window (minutes)", "Herkansingsvenster (minuten)"), "retry_minutes", t.retry_minutes || 60, "number", !0, {
			min: 1,
			step: 1
		})}
      ${this.textarea("Description", "description", t.description)}${this.shared(t)}`;
		if (e === "points") return M`<label>${this.x("Family member")}<select name="person_id">${this.peopleOptions()}</select></label>${this.field("Points (negative to subtract)", "points", "", "number", !0, { step: 1 })}${this.field("Reason", "note", "", "text", !0)}`;
		if (e === "recipe") return M`${this.field("Recipe title", "title", t.title, "text", !0, { autofocus: !0 })}${this.field("Tags (comma separated)", "tags", (t.tags || []).join(", "))}${this.field("Image URL", "image", t.image, "url")}${this.field("Base servings", "servings", t.servings || 4, "number", !0, {
			min: 1,
			step: 1
		})}${this.field("Prep time (minutes)", "prep_time", t.prep_time || 0, "number", !0, {
			min: 0,
			step: 1
		})}${this.field("Cook time (minutes)", "cook_time", t.cook_time || 0, "number", !0, {
			min: 0,
			step: 1
		})}<fieldset class="full"><legend>${this.x("Categories")}</legend><div class="checkbox-group">${(this.data.recipes.categories || []).map((e) => M`<label class="check"><input name="category_ids" type="checkbox" value=${e.id} ?checked=${(t.category_ids || []).includes(e.id)}>${this.categoryPath(e)}</label>`)}</div></fieldset>${this.textarea("Ingredients (one per line: quantity, optional unit, name)", "ingredients", Me(t.ingredients || []), "1 cup flour\n2  eggs\n1/2 tsp salt")}${this.textarea("Method (one step per line)", "steps", (t.steps || t.instructions || []).join("\n"))}${this.shared(t)}`;
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
		return e === "calendar-category" ? M`${this.field("Category name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Icon (emoji)", "icon", t.icon || "🗒")}<label>${this.x("Color")}<input name="color" type="color" .value=${t.color || "#64748b"}></label>` : e === "person" ? M`${this.haUserPicker(t)}${this.field("Name", "name", t.name, "text", !0, { autofocus: !0 })}${this.field("Family color", "color", this.color(t.color), "color")}${this.field("Home Assistant user ID", "user_id", t.user_id || t.ha_user_id)}
      ${this.field("Profile picture URL", "profile_picture", t.profile_picture || t.avatar_url, "url")}${this.field("Birthday", "birthday", t.birthday, "date")}
      ${this.select("Role preset", "role", t.role || "child", [["parent", "Parent (all rights)"], ["child", "Child (limited rights)"]])}
      ${t.role === "parent" ? M`${this.field("PIN code (4-8 digits)", "pin", "", "password", !t.id, {
			inputmode: "numeric",
			minlength: 4,
			maxlength: 8,
			pattern: "[0-9]*",
			placeholder: t.has_pin ? "Enter new PIN to change" : "Set a PIN"
		})}
      ${t.id && t.has_pin ? M`<label class="check full"><input name="clear_pin" type="checkbox">${this.x("Remove existing PIN for this family member")}</label>` : P}` : P}
      <p class="muted full">${this.x("The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.")}</p>
      <fieldset class="full permissions"><legend>${this.x("Permission overrides")}</legend>${Xe.map((e) => this.select(this.x(e.replaceAll("_", " ")), e, typeof t.permissions?.[e] == "boolean" ? t.permissions[e] ? "allow" : "deny" : "default", [
			["default", "Use role preset"],
			["allow", "Allow"],
			["deny", "Deny"]
		]))}</fieldset>` : e === "preferences" ? M`${this.select("Appearance default", "theme", t.theme || "auto", [
			["auto", "Follow Home Assistant"],
			["light", "Light"],
			["dark", "Dark"]
		])}
      ${this.select("Day overview position", "overview_position", t.overview_position || "right", [
			["left", "Left"],
			["right", "Right"],
			["bottom", this.languageCode === "nl" ? "Onderin" : "Bottom"]
		])}
      <label class="check full"><input name="overview_collapsed" type="checkbox" ?checked=${!!t.overview_collapsed}>${this.x("Collapse day overview by default")}</label>
      <label class="check full"><input name="show_calendar_day_view" type="checkbox" ?checked=${t.show_calendar_day_view !== !1}>${this.s("Show day view option in Calendar", "Toon dagweergave-optie in agenda")}</label>
      <label class="check full"><input name="show_calendar_week_view" type="checkbox" ?checked=${t.show_calendar_week_view !== !1}>${this.s("Show week view option in Calendar", "Toon weekweergave-optie in agenda")}</label>
      <label class="check full"><input name="show_calendar_export" type="checkbox" ?checked=${t.show_calendar_export !== !1}>${this.s("Show Export .ics button", "Toon Exporteer .ics-knop")}</label>
      ${this.select("Week starts", "week_start", t.week_start || (this.firstDay === 0 ? "sunday" : "monday"), [["monday", "Monday"], ["sunday", "Sunday"]])}
      ${this.select("Time format", "time_format", t.time_format || "24", [["24", "24 hour"], ["12", "12 hour"]])}
      ${this.select("List view days", "calendar_list_mode", t.calendar_list_mode || "planned", [["planned", "Only days with planned events"], ["all", "Every day (also empty days)"]])}
      ${this.select("Default calendar view", "default_calendar_view", this.normalizedCalendarView(t.default_calendar_view || "list", t), this.availableCalendarViews(t))}
      ${this.select("Grocery default", "default_grocery_list_id", t.default_grocery_list_id || this.listId, [
			["weekly", "Weekly groceries"],
			["daily", "Daily groceries"],
			["random", "Random list"],
			...(this.data.groceries.lists || []).map((e) => [e.id, e.name])
		])}
      <fieldset class="full permissions"><legend>${this.x("Meal slots")}</legend>${[
			"breakfast",
			"lunch",
			"dinner"
		].map((e) => M`<label class="check"><input name="meal_slots" type="checkbox" value=${e} ?checked=${(t.meal_slots || [
			"breakfast",
			"lunch",
			"dinner"
		]).includes(e)}>${this.x(e[0].toUpperCase() + e.slice(1))}</label>`)}</fieldset>
      ${this.field("Stores (comma separated)", "stores", (t.stores || []).join(", "))}
      ${this.select("Competition default", "competition_default", t.competition_default || "week", [["week", "Weekly"], ["month", "Monthly"]])}
      ${this.select("Language", "language", t.language || this.locale, [["en", "English"], ["nl", "Nederlands"]])}
      ${this.field("Calendar sync interval (minutes)", "sync_interval", t.sync_interval || 30, "number", !0, {
			min: 5,
			max: 1440,
			step: 1
		})}
      <label class="check full"><input name="reminders_enabled" type="checkbox" ?checked=${t.reminders_enabled !== !1}>${this.x("Send event reminders")}</label>
      ${this.field("Default reminder (minutes before)", "default_reminder_minutes", t.default_reminder_minutes ?? 15, "number", !0, {
			min: 0,
			max: 10080,
			step: 1
		})}
      ${this.field("Notify service (e.g. mobile_app_phone)", "notify_service", t.notify_service || "", "text", !1, { placeholder: "Leave empty for Home Assistant notifications" })}
      ${this.field("Daily agenda time (optional)", "daily_agenda_time", t.daily_agenda_time || "", "time")}
      <fieldset class="full permissions"><legend>${this.s("Tasks & Routines dayparts", "Taakjes & Routines dagdelen")}</legend>
        <label>${this.s("Morning start", "Ochtend begin")}<input name="daypart_morning_start" type="time" .value=${this.settingsData.chore_dayparts?.morning?.start || "07:00"}></label>
        <label>${this.s("Morning end", "Ochtend einde")}<input name="daypart_morning_end" type="time" .value=${this.settingsData.chore_dayparts?.morning?.end || "11:59"}></label>
        <label>${this.s("Afternoon start", "Middag begin")}<input name="daypart_afternoon_start" type="time" .value=${this.settingsData.chore_dayparts?.afternoon?.start || "12:00"}></label>
        <label>${this.s("Afternoon end", "Middag einde")}<input name="daypart_afternoon_end" type="time" .value=${this.settingsData.chore_dayparts?.afternoon?.end || "17:59"}></label>
        <label>${this.s("Evening start", "Avond begin")}<input name="daypart_evening_start" type="time" .value=${this.settingsData.chore_dayparts?.evening?.start || "18:00"}></label>
        <label>${this.s("Evening end", "Avond einde")}<input name="daypart_evening_end" type="time" .value=${this.settingsData.chore_dayparts?.evening?.end || "23:59"}></label>
      </fieldset>` : P;
	}
	static {
		this.styles = Ke;
	}
};
Z([H()], $.prototype, "page", void 0), Z([H()], $.prototype, "data", void 0), Z([H()], $.prototype, "selectedDay", void 0), Z([H()], $.prototype, "calendarView", void 0), Z([H()], $.prototype, "personFilter", void 0), Z([H()], $.prototype, "listId", void 0), Z([H()], $.prototype, "contactQuery", void 0), Z([H()], $.prototype, "groceryAssignee", void 0), Z([H()], $.prototype, "groupStores", void 0), Z([H()], $.prototype, "mealWeek", void 0), Z([H()], $.prototype, "scorePeriod", void 0), Z([H()], $.prototype, "recipeSearch", void 0), Z([H()], $.prototype, "recipeCategory", void 0), Z([H()], $.prototype, "recipeId", void 0), Z([H()], $.prototype, "servings", void 0), Z([H()], $.prototype, "selectedIngredients", void 0), Z([H()], $.prototype, "routes", void 0), Z([H()], $.prototype, "theme", void 0), Z([H()], $.prototype, "error", void 0), Z([H()], $.prototype, "calendarOverlay", void 0), Z([H()], $.prototype, "hiddenCalendarSources", void 0), Z([H()], $.prototype, "hiddenCalendarCategories", void 0), Z([H()], $.prototype, "notice", void 0), Z([H()], $.prototype, "pinPersonId", void 0), Z([H()], $.prototype, "todayPersonId", void 0), Z([H()], $.prototype, "settingsPinPersonId", void 0), Z([H()], $.prototype, "settingsUnlocked", void 0), Z([H()], $.prototype, "pinCapabilites", void 0), Z([H()], $.prototype, "loading", void 0), Z([H()], $.prototype, "saving", void 0), Z([H()], $.prototype, "editor", void 0), Z([H()], $.prototype, "mealTitleQuery", void 0), Z([H()], $.prototype, "haUsers", void 0), Z([H()], $.prototype, "calendarSearch", void 0), Z([H()], $.prototype, "celebrate", void 0), Z([H()], $.prototype, "pendingCompletion", void 0), $ = Z([we("family-organizer-panel")], $);
//#endregion
export { $ as FamilyOrganizerPanel };
