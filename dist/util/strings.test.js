"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const strings_1 = require("./strings");
(0, vitest_1.describe)("kebabCase", () => {
    (0, vitest_1.test)("Basic", () => {
        (0, vitest_1.expect)((0, strings_1.kebabCase)("myPathName")).toBe("my-path-name");
    });
    (0, vitest_1.test)("Numbers", () => {
        (0, vitest_1.expect)((0, strings_1.kebabCase)("v0")).toBe("v0");
        (0, vitest_1.expect)((0, strings_1.kebabCase)("version123Path")).toBe("version123-path");
    });
});
//# sourceMappingURL=strings.test.js.map