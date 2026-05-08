"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackDailyUniqueUser = exports.trackAction = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const usageTableName = process.env.DAILY_USAGE_TABLE_NAME ?? '';
const usageTtlDays = 120;
const client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
const getDayKey = (date) => date.toISOString().slice(0, 10);
const toEpochSeconds = (date) => Math.floor(date.getTime() / 1000);
const trackMetric = (metricName, value, dimensions) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
        _aws: {
            Timestamp: Date.now(),
            CloudWatchMetrics: [
                {
                    Namespace: 'ReprMan/Product',
                    Dimensions: [Object.keys(dimensions)],
                    Metrics: [{ Name: metricName, Unit: 'Count' }],
                },
            ],
        },
        ...dimensions,
        [metricName]: value,
    }));
};
const trackAction = (action) => {
    trackMetric('ActionCount', 1, {
        Action: action,
        Environment: 'prod',
    });
};
exports.trackAction = trackAction;
const trackDailyUniqueUser = async (userId) => {
    if (!usageTableName) {
        return;
    }
    const now = new Date();
    const day = getDayKey(now);
    const ttl = toEpochSeconds(new Date(now.getTime() + usageTtlDays * 24 * 60 * 60 * 1000));
    try {
        await client.send(new lib_dynamodb_1.PutCommand({
            TableName: usageTableName,
            Item: {
                pk: `DAY#${day}`,
                sk: `USER#${userId}`,
                expiresAt: ttl,
            },
            ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        }));
        trackMetric('DailyUniqueVisitors', 1, { Environment: 'prod' });
    }
    catch (error) {
        if (error instanceof client_dynamodb_1.ConditionalCheckFailedException) {
            return;
        }
        console.warn('[analytics] failed to write daily unique user', error);
    }
};
exports.trackDailyUniqueUser = trackDailyUniqueUser;
//# sourceMappingURL=analytics.js.map