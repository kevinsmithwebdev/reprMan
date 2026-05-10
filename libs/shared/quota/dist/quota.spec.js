"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('resolveMaxReprsAllowed', () => {
    it('uses DEFAULT_MAX_REPRS_ALLOWED when config is missing', () => {
        expect((0, index_1.resolveMaxReprsAllowed)(null)).toBe(index_1.DEFAULT_MAX_REPRS_ALLOWED);
        expect((0, index_1.resolveMaxReprsAllowed)(undefined)).toBe(index_1.DEFAULT_MAX_REPRS_ALLOWED);
    });
    it('uses default when item has no maxReprsAllowed attribute', () => {
        const item = { pk: 'USER#x', sk: 'CONFIG' };
        expect((0, index_1.resolveMaxReprsAllowed)(item)).toBe(index_1.DEFAULT_MAX_REPRS_ALLOWED);
    });
    it('returns null for explicit unlimited', () => {
        const item = {
            pk: 'USER#x',
            sk: 'CONFIG',
            maxReprsAllowed: null,
        };
        expect((0, index_1.resolveMaxReprsAllowed)(item)).toBeNull();
    });
    it('returns stored numeric cap', () => {
        const item = {
            pk: 'USER#x',
            sk: 'CONFIG',
            maxReprsAllowed: 100,
        };
        expect((0, index_1.resolveMaxReprsAllowed)(item)).toBe(100);
    });
});
describe('parseMaxReprsAllowed', () => {
    it('returns null for explicit null', () => {
        expect((0, index_1.parseMaxReprsAllowed)(null)).toBeNull();
    });
    it('returns the number for numeric input', () => {
        expect((0, index_1.parseMaxReprsAllowed)(42)).toBe(42);
    });
    it('returns undefined for everything else', () => {
        expect((0, index_1.parseMaxReprsAllowed)(undefined)).toBeUndefined();
        expect((0, index_1.parseMaxReprsAllowed)('100')).toBeUndefined();
        expect((0, index_1.parseMaxReprsAllowed)({})).toBeUndefined();
    });
});
