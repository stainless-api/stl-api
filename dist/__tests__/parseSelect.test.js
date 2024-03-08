"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseSelect_1 = require("../parseSelect");
describe(`parseSelect`, function () {
    for (const select of [
        "a,b,c.d{g.j.y,e,f.k,g{h,i}}",
        "a,  b, c . d {   g.j. y,e,f.k,g   {h, i }   }",
        "    a,  b, c . d {   g.j. y,e,f.k,g   {h, i }   }",
    ]) {
        it(select, function () {
            expect((0, parseSelect_1.parseSelect)(select)).toEqual({
                select: {
                    a: {},
                    b: {},
                    c: {
                        select: {
                            d: {
                                select: {
                                    g: {
                                        select: {
                                            j: { select: { y: {} } },
                                            h: {},
                                            i: {},
                                        },
                                    },
                                    e: {},
                                    f: { select: { k: {} } },
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    it(`capital letters`, function () {
        expect((0, parseSelect_1.parseSelect)("A.B{C}")).toEqual({
            select: { A: { select: { B: { select: { C: {} } } } } },
        });
    });
    for (const select of [
        "a{b,c}}",
        "a,",
        "a-",
        "-",
        "{a,b}",
        "a{",
        "a{b",
        "",
        "a{}",
        "a.",
        ".b",
        "a,,b",
        "a..b",
        "a b",
    ]) {
        it(`throws: ${select}`, function () {
            expect(() => (0, parseSelect_1.parseSelect)(select)).toThrowError();
        });
    }
});
//# sourceMappingURL=parseSelect.test.js.map