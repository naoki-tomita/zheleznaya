"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zheleznaya_1 = require("zheleznaya");
console.log(zheleznaya_1.h);
var MyComponent = function (props) {
    console.log(zheleznaya_1.h);
    return (zheleznaya_1.h("div", null, props.key));
};
var App = function () {
    console.log(zheleznaya_1.h);
    return (zheleznaya_1.h("div", { class: "my-class" },
        zheleznaya_1.h("input", { checked: true }),
        zheleznaya_1.h("div", null, "fuga"),
        zheleznaya_1.h("div", null, "poyo"),
        zheleznaya_1.h(MyComponent, { key: "hello" })));
};
App();
zheleznaya_1.render(App);
