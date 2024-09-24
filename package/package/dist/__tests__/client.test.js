"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stl_1 = require("../stl");
describe('client', () => {
    it('should test something', () => {
        expect(123).toBe('123');
    });
    it('createClient', () => {
        const client = (0, stl_1.createClient)('/api');
    });
});
//# sourceMappingURL=client.test.js.map