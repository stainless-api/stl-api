import { parseSelect } from "../parseSelect";
describe(`parseSelect`, function () {
    for (const select of [
        "a,b,c.d{g.j.y,e,f.k,g{h,i}}",
        "a,  b, c . d {   g.j. y,e,f.k,g   {h, i }   }",
        "    a,  b, c . d {   g.j. y,e,f.k,g   {h, i }   }",
    ]) {
        it(select, function () {
            expect(parseSelect(select)).toEqual({
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
        expect(parseSelect("A.B{C}")).toEqual({
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
            expect(() => parseSelect(select)).toThrowError();
        });
    }
});
//# sourceMappingURL=parseSelect.test.js.map