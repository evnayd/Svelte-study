
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let input;
    	let t4;
    	let button0;
    	let t6;
    	let ul;
    	let li0;
    	let t8;
    	let li1;
    	let t10;
    	let li2;
    	let t12;
    	let li3;
    	let t14;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Change password";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Please enter a new password to complete the password recovery process.";
    			t3 = space();
    			div0 = element("div");
    			input = element("input");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "HIDE";
    			t6 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "8-64 characters";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "1 Lowercase";
    			t10 = space();
    			li2 = element("li");
    			li2.textContent = "1 Uppercase";
    			t12 = space();
    			li3 = element("li");
    			li3.textContent = "1 Number";
    			t14 = space();
    			button1 = element("button");
    			button1.textContent = "Confirm";
    			attr_dev(h1, "class", "font-black text-xl sm:text-4xl mb-2 sm:mb-8");
    			add_location(h1, file, 61, 0, 1197);
    			add_location(p, file, 62, 0, 1274);
    			attr_dev(input, "class", "text-gray-500 text-lg w-full border-b-2 mb-2 p-1 outline-none overflow-hidden");
    			attr_dev(input, "type", /*inputType*/ ctx[5]);
    			attr_dev(input, "id", "password");
    			add_location(input, file, 64, 0, 1375);
    			attr_dev(button0, "class", "absolute bottom-3 right-1 text-gray-300 hover:text-gray-400 focus: outline-none focus: border-none");
    			add_location(button0, file, 65, 0, 1548);
    			attr_dev(div0, "class", "relative");
    			add_location(div0, file, 63, 0, 1352);
    			attr_dev(li0, "class", "w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto");
    			toggle_class(li0, "active", !/*lengthError*/ ctx[1]);
    			add_location(li0, file, 68, 1, 1786);
    			attr_dev(li1, "class", "w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto");
    			toggle_class(li1, "active", !/*lowerCaseError*/ ctx[2]);
    			add_location(li1, file, 69, 1, 1971);
    			attr_dev(li2, "class", "w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto");
    			toggle_class(li2, "active", !/*upperCaseError*/ ctx[3]);
    			add_location(li2, file, 70, 1, 2155);
    			attr_dev(li3, "class", "w-3/5 sm:w-auto bg-gray-300  rounded-lg px-3.5  py-2 text-gray-500  m-1  text-left sm:text-center break-normal flex-auto");
    			toggle_class(li3, "active", !/*numberError*/ ctx[4]);
    			add_location(li3, file, 71, 1, 2339);
    			attr_dev(ul, "class", "flex flex-col sm:flex-row justify-between text-sm mb-6 flex-nowrap");
    			add_location(ul, file, 67, 0, 1705);
    			attr_dev(button1, "class", "w-full bg-purple-700 hover:bg-purple-900 rounded-md p-4 text-white shadow-md font-semibold text-sm  sm:text-xl overflow-hidden");
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file, 74, 0, 2524);
    			attr_dev(div1, "class", "bg-white w-full  lg:w-1/2 mx-auto shadow-md p-6 xl:p-14 text-left sm:text-center my-16 lg:my-32");
    			add_location(div1, file, 60, 2, 1087);
    			attr_dev(div2, "class", "container mx-auto");
    			add_location(div2, file, 59, 1, 1053);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			append_dev(div0, t4);
    			append_dev(div0, button0);
    			append_dev(div1, t6);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(ul, t12);
    			append_dev(ul, li3);
    			append_dev(div1, t14);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler*/ ctx[7], false, false, false),
    					listen_dev(button0, "click", hideValue, false, false, false),
    					listen_dev(button1, "click", /*handleOnSubmit*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lengthError*/ 2) {
    				toggle_class(li0, "active", !/*lengthError*/ ctx[1]);
    			}

    			if (dirty & /*lowerCaseError*/ 4) {
    				toggle_class(li1, "active", !/*lowerCaseError*/ ctx[2]);
    			}

    			if (dirty & /*upperCaseError*/ 8) {
    				toggle_class(li2, "active", !/*upperCaseError*/ ctx[3]);
    			}

    			if (dirty & /*numberError*/ 16) {
    				toggle_class(li3, "active", !/*numberError*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isValid(password, requirement) {
    	let upperCaseArr = password.replace(/[^A-Z]+/g, "").split("");
    	let lowerCaseArr = password.replace(/[^a-z]+/g, "").split("");
    	let num = password.slice();
    	let numbers = num.replace(/[^0-9]+/g, "");

    	switch (requirement) {
    		case "length":
    			return password.length > 7 & password.length < 65;
    		case "lowercase":
    			return lowerCaseArr.length > 0;
    		case "uppercase":
    			return upperCaseArr.length > 0;
    		case "numbers":
    			return numbers.length > 0;
    	}
    }

    function hideValue() {
    	if (password.type === "text") {
    		password.type = "password";
    	} else {
    		password.type = "text";
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let lengthError;
    	let lowerCaseError;
    	let upperCaseError;
    	let numberError;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let value = "";
    	let inputType = "text";

    	function handleOnSubmit() {
    		if (lowerCaseError || lengthError || upperCaseError || numberError) {
    			alert("Try another password");
    		} else {
    			alert("Ok");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const input_handler = e => $$invalidate(0, value = e.target.value);

    	$$self.$capture_state = () => ({
    		value,
    		inputType,
    		isValid,
    		hideValue,
    		handleOnSubmit,
    		lengthError,
    		lowerCaseError,
    		upperCaseError,
    		numberError
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("inputType" in $$props) $$invalidate(5, inputType = $$props.inputType);
    		if ("lengthError" in $$props) $$invalidate(1, lengthError = $$props.lengthError);
    		if ("lowerCaseError" in $$props) $$invalidate(2, lowerCaseError = $$props.lowerCaseError);
    		if ("upperCaseError" in $$props) $$invalidate(3, upperCaseError = $$props.upperCaseError);
    		if ("numberError" in $$props) $$invalidate(4, numberError = $$props.numberError);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(1, lengthError = !isValid(value, "length"));
    		}

    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(2, lowerCaseError = !isValid(value, "lowercase"));
    		}

    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(3, upperCaseError = !isValid(value, "uppercase"));
    		}

    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(4, numberError = !isValid(value, "numbers"));
    		}
    	};

    	return [
    		value,
    		lengthError,
    		lowerCaseError,
    		upperCaseError,
    		numberError,
    		inputType,
    		handleOnSubmit,
    		input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
