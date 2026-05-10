"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('reprValidation', () => {
    it('parses a valid repr', () => {
        const parsed = (0, index_1.parseRepr)({
            id: 'r1',
            title: 'Title',
            categories: ['a'],
            dateCreated: 123,
            datesPracticed: [456],
            comment: 'ok',
        });
        expect(parsed.id).toBe('r1');
        expect(parsed.categories).toEqual(['a']);
    });
    it('throws on invalid repr', () => {
        expect(() => (0, index_1.parseRepr)({ id: 'r1' })).toThrow();
    });
    it('parses repr arrays', () => {
        const reprs = (0, index_1.parseReprs)([
            {
                id: 'r1',
                title: 'Title',
                categories: ['a'],
                dateCreated: 123,
                datesPracticed: [456],
                comment: 'ok',
            },
        ]);
        expect(reprs).toHaveLength(1);
    });
});
