"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReprs = exports.parseRepr = void 0;
const assertString = (value, field) => {
    if (typeof value !== 'string') {
        throw new Error(`Invalid ${field}`);
    }
    return value;
};
const assertNumber = (value, field) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`Invalid ${field}`);
    }
    return value;
};
const assertStringArray = (value, field) => {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        throw new Error(`Invalid ${field}`);
    }
    return value;
};
const assertNumberArray = (value, field) => {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'number')) {
        throw new Error(`Invalid ${field}`);
    }
    return value;
};
const parseRepr = (value) => {
    if (!value || typeof value !== 'object') {
        throw new Error('Invalid repr payload');
    }
    const input = value;
    return {
        id: assertString(input.id, 'id'),
        title: assertString(input.title, 'title'),
        categories: assertStringArray(input.categories, 'categories'),
        dateCreated: assertNumber(input.dateCreated, 'dateCreated'),
        datesPracticed: assertNumberArray(input.datesPracticed, 'datesPracticed'),
        comment: assertString(input.comment, 'comment'),
    };
};
exports.parseRepr = parseRepr;
const parseReprs = (value) => {
    if (!Array.isArray(value)) {
        throw new Error('Payload must be an array');
    }
    return value.map(exports.parseRepr);
};
exports.parseReprs = parseReprs;
//# sourceMappingURL=reprValidation.js.map