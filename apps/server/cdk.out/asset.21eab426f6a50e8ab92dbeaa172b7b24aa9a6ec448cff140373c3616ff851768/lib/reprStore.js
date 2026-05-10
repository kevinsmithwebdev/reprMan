"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAllReprs = exports.deleteRepr = exports.markPracticed = exports.upsertRepr = exports.reprExists = exports.countReprsForUser = exports.getUserConfig = exports.listReprs = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const userConfig_1 = require("./userConfig");
const TABLE_NAME = process.env.REPRS_TABLE_NAME ?? '';
const MAX_PRACTICED_DATES = 100;
if (!TABLE_NAME) {
    throw new Error('REPRS_TABLE_NAME is required');
}
const client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
const keyFor = (userId, reprId) => ({
    pk: `USER#${userId}`,
    sk: `REPR#${reprId}`,
});
const toDbItem = (userId, repr) => ({
    ...keyFor(userId, repr.id),
    repr,
});
const listReprs = async (userId) => {
    const result = await client.send(new lib_dynamodb_1.QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :reprPrefix)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':reprPrefix': 'REPR#',
        },
    }));
    const reprs = (result.Items ?? [])
        .map((item) => item.repr)
        .filter(Boolean);
    return reprs;
};
exports.listReprs = listReprs;
/**
 * Loads user config, creating a minimal CONFIG row (pk + sk only) when missing
 * so existing users and new signups have a durable row in DynamoDB.
 */
const getUserConfig = async (userId) => {
    const key = (0, userConfig_1.keyForUserConfig)(userId);
    const result = await client.send(new lib_dynamodb_1.GetCommand({
        TableName: TABLE_NAME,
        Key: key,
    }));
    if (result.Item) {
        return result.Item;
    }
    const newItem = { ...key };
    try {
        await client.send(new lib_dynamodb_1.PutCommand({
            TableName: TABLE_NAME,
            Item: newItem,
            ConditionExpression: 'attribute_not_exists(pk)',
        }));
        return newItem;
    }
    catch (error) {
        if (error instanceof client_dynamodb_1.ConditionalCheckFailedException) {
            const again = await client.send(new lib_dynamodb_1.GetCommand({
                TableName: TABLE_NAME,
                Key: key,
            }));
            if (again.Item) {
                return again.Item;
            }
        }
        throw error;
    }
};
exports.getUserConfig = getUserConfig;
const countReprsForUser = async (userId) => {
    const result = await client.send(new lib_dynamodb_1.QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :reprPrefix)',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':reprPrefix': 'REPR#',
        },
        Select: 'COUNT',
    }));
    return result.Count ?? 0;
};
exports.countReprsForUser = countReprsForUser;
const reprExists = async (userId, reprId) => {
    const result = await client.send(new lib_dynamodb_1.GetCommand({
        TableName: TABLE_NAME,
        Key: keyFor(userId, reprId),
        ProjectionExpression: 'pk',
    }));
    return Boolean(result.Item);
};
exports.reprExists = reprExists;
const upsertRepr = async (userId, repr) => {
    const key = keyFor(userId, repr.id);
    const existing = await client.send(new lib_dynamodb_1.GetCommand({
        TableName: TABLE_NAME,
        Key: key,
        ProjectionExpression: 'pk',
    }));
    await client.send(new lib_dynamodb_1.PutCommand({
        TableName: TABLE_NAME,
        Item: toDbItem(userId, repr),
    }));
    return existing.Item ? 'updated' : 'created';
};
exports.upsertRepr = upsertRepr;
const markPracticed = async (userId, reprId) => {
    const reprs = await (0, exports.listReprs)(userId);
    const repr = reprs.find((item) => item.id === reprId);
    if (!repr) {
        return null;
    }
    const next = {
        ...repr,
        datesPracticed: [Date.now(), ...repr.datesPracticed].slice(0, MAX_PRACTICED_DATES),
    };
    await (0, exports.upsertRepr)(userId, next);
    return next;
};
exports.markPracticed = markPracticed;
const deleteRepr = async (userId, reprId) => {
    await client.send(new lib_dynamodb_1.DeleteCommand({
        TableName: TABLE_NAME,
        Key: keyFor(userId, reprId),
    }));
};
exports.deleteRepr = deleteRepr;
const replaceAllReprs = async (userId, reprs) => {
    const chunks = [];
    for (let i = 0; i < reprs.length; i += 25) {
        chunks.push(reprs.slice(i, i + 25));
    }
    if (chunks.length === 0) {
        return;
    }
    await Promise.all(chunks.map((chunk) => client.send(new lib_dynamodb_1.BatchWriteCommand({
        RequestItems: {
            [TABLE_NAME]: chunk.map((repr) => ({
                PutRequest: {
                    Item: toDbItem(userId, repr),
                },
            })),
        },
    }))));
};
exports.replaceAllReprs = replaceAllReprs;
//# sourceMappingURL=reprStore.js.map