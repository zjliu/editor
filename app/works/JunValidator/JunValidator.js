var JunValidator = (function () {

    "use strict";

    var defaultOption = {
        Regs: {
            email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            username: /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/,
            fixedTelephone_cn: /^\d{3}-\d{8}|\d{4}-\d{7}$/,
            qq: /^[1-9][0-9]{4,}$/,
            zipcode_cn: /^[1-9]\d{5}(?!\d)$/,
            idcard: /(^\d{15}$)|(\d{17}(?:\d|x|X)$)/,
            ip: /^\d+\.\d+\.\d+\.\d+$/
        },
        elements: [],
        blurAfter: function () { },
        formid: "",
        checkAllObj: {},
        firstCheck: true
    }
    var Validator = function (option) {
        this.option = this.extend(true, {}, defaultOption, option);
        this.init();
    }
    Validator.prototype = {
        init: function () {
            if (!String.prototype.trim) String.prototype.trim = function () { return this.replace(/(^\s*)|(\s*$)/g, ""); };
            this.createCheckObject();
            this.addBlurEvent();
            this.initCheck();
        },
        createCheckObject: function () {
            var elements = this.option.elements;
            var checkAllObj = this.option.checkAllObj;
            for (var i = 0; elements[i]; i++) {
                var item = elements[i];
                if (!checkAllObj[item.id]) {
                    checkAllObj[item.id] = item.getAttribute("empty") != "false";
                }
            }
        },
        checkAllByCheckObject: function () {
            var checkAllObj = this.option.checkAllObj;
            for (var item in checkAllObj) {
                if (!checkAllObj[item]) return false;
            }
            return true;
        },
        error_log: function (msg, id) {
            var m = "";
            if (id) {
                m = "#" + id;
            }
            console.log("error_" + m + " " + msg);
        },
        basecheck: function (element) {
            var self = this;
            function attr(name) {
                return element.getAttribute(name);
            }

            var canEmpty = attr("empty"),
                reg = attr("reg"),
                emptyMsg = attr("emptyMsg"),
                illLeagle = attr("illLeagle"),
                value = element.value,
                checkOk = false,
                Regs = self.option.Regs,
                Reg,
                msg,
                id = element.id,
                isNotEmpty = false,
                type = element.type.toLowerCase();

            //没有empty属性，或属性值为非 "false" 的都默认为true
            canEmpty = canEmpty ? !(canEmpty === "false") : true;
            type = type || element.tagName.toLowerCase();
            if (value)
                value = value.trim();

            switch (type) {
                case "text":
                case "textarea":
                    text_check();
                    break;
                case "checkbox":
                    checkbox_check();
                    break;
                case "password":
                    password_check();
                    break;
                case "select-one":
                case "select-multiple":
                    select_check();
                    break;
            }

            function text_check() {
                if (reg) {
                    var tmepReg = Regs[reg];
                    try {
                        Reg = (tmepReg instanceof RegExp) ? tmepReg : new RegExp(tmepReg);
                    }
                    catch (e) {
                        self.error_log("RegExp error=>" + e.message, id);
                    }
                }
                if (!reg || !Reg)
                    self.error_log("lose reg.", id);
                if (!emptyMsg && !canEmpty)
                    self.error_log("lose emptyMsg.", id);

                if (canEmpty) {
                    if (value.trim() != "" && Reg) {
                        checkOk = Reg.test(value);
                        if (!checkOk && !illLeagle)
                            self.error_log("lose illLeagle.", id);
                        msg = checkOk ? "" : illLeagle;
                    }
                    else {
                        checkOk = true;
                        msg = "";
                    }
                }
                else {
                    if (value.trim() != "" && Reg) {
                        checkOk = Reg.test(value);
                        msg = checkOk ? "" : illLeagle;
                    } else {
                        checkOk = false;
                        msg = emptyMsg;
                    }
                }
                isNotEmpty = value.trim() != "";
            }

            function checkbox_check() {
                if (!emptyMsg && !canEmpty)
                    self.error_log("lose emptyMsg.", id);
                if (!canEmpty) {
                    checkOk = element.checked;
                    msg = checkOk ? "" : emptyMsg;
                }
                else {
                    checkOk = true;
                    msg = "";
                }
                isNotEmpty = element.checked;
            }

            function password_check() {
                text_check();
                if (checkOk) {
                    var isFor = attr("for"),
                        unmatchmsg = attr("unmatchmsg"),
                        forel = document.getElementById(isFor);

                    if (isFor && forel && forel.type.toLowerCase() === "password") {
                        checkOk = value === forel.value;
                        msg = checkOk ? "" : unmatchmsg;
                        if (!unmatchmsg)
                            self.error_log("lose unmatchmsg", id);
                    }
                    if (isFor && !forel)
                        self.error_log("for target undefined", id)
                }
            }

            function select_check() {
                var defaultvalue = attr("defaultvalue");
                if (!emptyMsg && !canEmpty)
                    self.error_log("lose emptyMsg.", id);
                if (defaultvalue === null && !canEmpty)
                    self.error_log("lose defaultvalue.", id)
                checkOk = element.value != "" && element.value !== defaultvalue;
                isNotEmpty = checkOk;
                if (!canEmpty) {
                    msg = checkOk ? "" : emptyMsg;
                }
                else {
                    checkOk = true;
                    msg = "";
                }
            }

            return { "checkOk": checkOk, "msg": msg, "isNotEmpty": isNotEmpty };

        },
        addBlurEvent: function () {
            var self = this;
            var elements = self.option.elements,
                checkAllObj = self.option.checkAllObj,
                blurAfter = self.option.blurAfter,
                changeorblur = self.option.changeOrBlur;
            for (var i = 0; elements[i]; i++) {
                var element = elements[i];
                var type = self.getEventType(element.type);
                element.addEventListener(type, function (event) {
                    var returnObj = self.basecheck(this);
                    checkAllObj[this.id] = returnObj.checkOk;
                    blurAfter(this, returnObj);
                });
            }
        },
        initCheck: function () {
            this.checkAll(this.option.firstCheck);
        },
        checkAll: function (check) {
            var self = this;
            var elements = self.option.elements,
                blurAfter = self.option.blurAfter,
                checkAllObj = self.option.checkAllObj;
            for (var i = 0; elements[i]; i++) {
                var element = elements[i];
                var returnObj = self.basecheck(element);
                if (check && returnObj.isNotEmpty) {
                    blurAfter(element, returnObj);
                }
                checkAllObj[element.id] = returnObj.checkOk;
            }
            return this.checkAllByCheckObject();
        },
        getEventType: function (inputType) {
            var type = "blur";
            switch (inputType) {
                case "text":
                    break;
                case "checkbox":
                    type = "click"
                    break;
                case "password":
                    break;
                case "select-one":
                case "select-multiple":
                    type = "change"
                    break;
            }
            return type;
        },
        check: function () {
            return this.checkAllByCheckObject();
        },
        serialize: function () {
            var id = this.option.formid,
                formEl = document.getElementById(id);
            if (formEl && window.this) {
                return this(formEl).serialize();
            }
            else {
                if (!formEl)
                    this.error_log("param formid is needed.", id);
                if (!window.this)
                    this.error_log("this.js is needed.")
            }
        },
        extend: function () {

            function isPlainObject(obj) {
                var class2type = {},
                    core_toString = class2type.toString,
                    core_hasOwn = class2type.hasOwnProperty;

                function type(obj) {
                    if (obj == null) {
                        return String(obj);
                    }
                    return typeof obj === "object" || typeof obj === "function" ?
                        class2type[core_toString.call(obj)] || "object" :
                        typeof obj;
                }

                function isWindow(obj) {
                    return obj != null && obj === obj.window;
                }

                if (type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
                    return false;
                }
                try {
                    if (obj.constructor &&
                            !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                        return false;
                    }
                } catch (e) {
                    return false;
                }
                return true;
            }

            var options, name, src, copy, copyIsArray, clone,
		        target = arguments[0] || {},
		        i = 1,
		        length = arguments.length,
		        deep = false;

            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && !this.isFunction(target)) {
                target = {};
            }
            if (length === i) {
                target = this;
                --i;
            }
            for (; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && this.isArray(src) ? src : [];

                            } else {
                                clone = src && isPlainObject(src) ? src : {};
                            }
                            target[name] = this.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        }
    }
    return Validator;
})();