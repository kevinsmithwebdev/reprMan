"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/router.ts
var router_exports = {};
__export(router_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(router_exports);

// src/lib/http.ts
var jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify(body)
});

// src/lib/auth.ts
var UnauthorizedError = class extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
};
var getUserId = (event) => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId || typeof userId !== "string") {
    throw new UnauthorizedError();
  }
  return userId;
};

// src/lib/analytics.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var usageTableName = process.env.DAILY_USAGE_TABLE_NAME ?? "";
var usageTtlDays = 120;
var client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var getDayKey = (date) => date.toISOString().slice(0, 10);
var toEpochSeconds = (date) => Math.floor(date.getTime() / 1e3);
var trackMetric = (metricName, value, dimensions) => {
  console.log(
    JSON.stringify({
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: "ReprMan/Product",
            Dimensions: [Object.keys(dimensions)],
            Metrics: [{ Name: metricName, Unit: "Count" }]
          }
        ]
      },
      ...dimensions,
      [metricName]: value
    })
  );
};
var trackAction = (action) => {
  trackMetric("ActionCount", 1, {
    Action: action,
    Environment: "prod"
  });
};
var trackDailyUniqueUser = async (userId) => {
  if (!usageTableName) {
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const day = getDayKey(now);
  const ttl = toEpochSeconds(new Date(now.getTime() + usageTtlDays * 24 * 60 * 60 * 1e3));
  try {
    await client.send(
      new import_lib_dynamodb.PutCommand({
        TableName: usageTableName,
        Item: {
          pk: `DAY#${day}`,
          sk: `USER#${userId}`,
          expiresAt: ttl
        },
        ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
      })
    );
    trackMetric("DailyUniqueVisitors", 1, { Environment: "prod" });
  } catch (error) {
    if (error instanceof import_client_dynamodb.ConditionalCheckFailedException) {
      return;
    }
    console.warn("[analytics] failed to write daily unique user", error);
  }
};

// src/lib/reprStore.ts
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// ../../libs/shared/repr-rules/src/index.ts
var MAX_PRACTICED_DATES = 100;
var prependPracticeDate = (datesPracticed, at = Date.now()) => [at, ...datesPracticed].slice(0, MAX_PRACTICED_DATES);
var withPracticeApplied = (repr, at) => ({
  ...repr,
  datesPracticed: prependPracticeDate(repr.datesPracticed, at)
});

// ../../libs/shared/quota/src/index.ts
var rawDefault = typeof process !== "undefined" && process.env?.DEFAULT_MAX_REPRS_ALLOWED || "25";
var parsedDefault = Number(rawDefault);
var DEFAULT_MAX_REPRS_ALLOWED = Number.isFinite(parsedDefault) && parsedDefault >= 0 ? parsedDefault : 25;
function resolveMaxReprsAllowed(item) {
  if (!item || !Object.prototype.hasOwnProperty.call(item, "maxReprsAllowed")) {
    return DEFAULT_MAX_REPRS_ALLOWED;
  }
  if (item.maxReprsAllowed === null) {
    return null;
  }
  return item.maxReprsAllowed;
}

// src/lib/userConfig.ts
var USER_CONFIG_SORT_KEY = "CONFIG";
var keyForUserConfig = (userId) => ({
  pk: `USER#${userId}`,
  sk: USER_CONFIG_SORT_KEY
});

// src/lib/reprStore.ts
var TABLE_NAME = process.env.REPRS_TABLE_NAME ?? "";
if (!TABLE_NAME) {
  throw new Error("REPRS_TABLE_NAME is required");
}
var client2 = import_lib_dynamodb2.DynamoDBDocumentClient.from(new import_client_dynamodb2.DynamoDBClient({}));
var keyFor = (userId, reprId) => ({
  pk: `USER#${userId}`,
  sk: `REPR#${reprId}`
});
var toDbItem = (userId, repr) => ({
  ...keyFor(userId, repr.id),
  repr
});
var listReprs = async (userId) => {
  const result = await client2.send(
    new import_lib_dynamodb2.QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :reprPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":reprPrefix": "REPR#"
      }
    })
  );
  const reprs = (result.Items ?? []).map((item) => item.repr).filter(Boolean);
  return reprs;
};
var getUserConfig = async (userId) => {
  const key = keyForUserConfig(userId);
  const result = await client2.send(
    new import_lib_dynamodb2.GetCommand({
      TableName: TABLE_NAME,
      Key: key
    })
  );
  if (result.Item) {
    return result.Item;
  }
  const newItem = { ...key };
  try {
    await client2.send(
      new import_lib_dynamodb2.PutCommand({
        TableName: TABLE_NAME,
        Item: newItem,
        ConditionExpression: "attribute_not_exists(pk)"
      })
    );
    return newItem;
  } catch (error) {
    if (error instanceof import_client_dynamodb2.ConditionalCheckFailedException) {
      const again = await client2.send(
        new import_lib_dynamodb2.GetCommand({
          TableName: TABLE_NAME,
          Key: key
        })
      );
      if (again.Item) {
        return again.Item;
      }
    }
    throw error;
  }
};
var countReprsForUser = async (userId) => {
  const result = await client2.send(
    new import_lib_dynamodb2.QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :reprPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":reprPrefix": "REPR#"
      },
      Select: "COUNT"
    })
  );
  return result.Count ?? 0;
};
var reprExists = async (userId, reprId) => {
  const result = await client2.send(
    new import_lib_dynamodb2.GetCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId),
      ProjectionExpression: "pk"
    })
  );
  return Boolean(result.Item);
};
var upsertRepr = async (userId, repr) => {
  const key = keyFor(userId, repr.id);
  const existing = await client2.send(
    new import_lib_dynamodb2.GetCommand({
      TableName: TABLE_NAME,
      Key: key,
      ProjectionExpression: "pk"
    })
  );
  await client2.send(
    new import_lib_dynamodb2.PutCommand({
      TableName: TABLE_NAME,
      Item: toDbItem(userId, repr)
    })
  );
  return existing.Item ? "updated" : "created";
};
var markPracticed = async (userId, reprId) => {
  const reprs = await listReprs(userId);
  const repr = reprs.find((item) => item.id === reprId);
  if (!repr) {
    return null;
  }
  const next = withPracticeApplied(repr);
  await upsertRepr(userId, next);
  return next;
};
var deleteRepr = async (userId, reprId) => {
  await client2.send(
    new import_lib_dynamodb2.DeleteCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId)
    })
  );
};

// ../../libs/shared/repr-validation/src/index.ts
var assertString = (value, field) => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};
var assertNumber = (value, field) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};
var assertStringArray = (value, field) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};
var assertNumberArray = (value, field) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "number")) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};
var parseRepr = (value) => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid repr payload");
  }
  const input = value;
  return {
    id: assertString(input.id, "id"),
    title: assertString(input.title, "title"),
    categories: assertStringArray(input.categories, "categories"),
    dateCreated: assertNumber(input.dateCreated, "dateCreated"),
    datesPracticed: assertNumberArray(input.datesPracticed, "datesPracticed"),
    comment: assertString(input.comment, "comment")
  };
};

// src/handlers/reprs.ts
var reprLimitExceededResponse = (maxReprsAllowed) => jsonResponse(403, {
  code: "REPR_LIMIT_EXCEEDED",
  message: `You cannot create more than ${maxReprsAllowed} reprs.`,
  maxReprsAllowed
});
var handleError = (error, options) => {
  if (error instanceof UnauthorizedError) {
    return jsonResponse(401, { message: "Unauthorized" });
  }
  return jsonResponse(options.defaultStatus, {
    message: options.defaultMessage
  });
};
var getReprsHandler = async (event) => {
  try {
    const userId = getUserId(event);
    await trackDailyUniqueUser(userId);
    const [reprs] = await Promise.all([
      listReprs(userId),
      getUserConfig(userId)
    ]);
    return jsonResponse(200, { reprs });
  } catch (error) {
    return handleError(error, {
      defaultStatus: 500,
      defaultMessage: "Internal server error"
    });
  }
};
var putReprHandler = async (event) => {
  try {
    const userId = getUserId(event);
    await trackDailyUniqueUser(userId);
    const payload = JSON.parse(event.body ?? "{}");
    const repr = parseRepr(payload);
    const pathReprId = event.pathParameters?.id;
    if (!pathReprId || pathReprId !== repr.id) {
      return jsonResponse(400, { message: "Path id and repr id must match" });
    }
    const [alreadyExists, config] = await Promise.all([
      reprExists(userId, repr.id),
      getUserConfig(userId)
    ]);
    const maxReprsAllowed = resolveMaxReprsAllowed(config);
    if (!alreadyExists && maxReprsAllowed !== null) {
      const count = await countReprsForUser(userId);
      if (count >= maxReprsAllowed) {
        return reprLimitExceededResponse(maxReprsAllowed);
      }
    }
    const result = await upsertRepr(userId, repr);
    trackAction(result === "created" ? "create" : "edit");
    return jsonResponse(200, { repr });
  } catch (error) {
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: "Bad request"
    });
  }
};
var markReprPracticedHandler = async (event) => {
  try {
    const userId = getUserId(event);
    await trackDailyUniqueUser(userId);
    const reprId = event.pathParameters?.id;
    if (!reprId) {
      return jsonResponse(400, { message: "Missing repr id" });
    }
    const repr = await markPracticed(userId, reprId);
    if (!repr) {
      return jsonResponse(404, { message: "Not found" });
    }
    trackAction("practice");
    return jsonResponse(200, { repr });
  } catch (error) {
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: "Bad request"
    });
  }
};
var deleteReprHandler = async (event) => {
  try {
    const userId = getUserId(event);
    await trackDailyUniqueUser(userId);
    const reprId = event.pathParameters?.id;
    if (!reprId) {
      return jsonResponse(400, { message: "Missing repr id" });
    }
    await deleteRepr(userId, reprId);
    trackAction("delete");
    return jsonResponse(200, { ok: true });
  } catch (error) {
    return handleError(error, {
      defaultStatus: 400,
      defaultMessage: "Bad request"
    });
  }
};

// src/handlers/userConfig.ts
var getUserConfigHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const config = await getUserConfig(userId);
    const maxReprsAllowed = resolveMaxReprsAllowed(config);
    return jsonResponse(200, { maxReprsAllowed });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse(401, { message: "Unauthorized" });
    }
    return jsonResponse(500, { message: "Internal server error" });
  }
};

// src/handlers/router.ts
var serverBuildInfo = {
  version: process.env.APP_VERSION ?? "unknown",
  buildNumber: process.env.APP_BUILD_NUMBER ?? "local",
  buildTimeUtc: process.env.APP_BUILD_TIME_UTC ?? "unknown",
  gitSha: process.env.APP_GIT_SHA ?? "unknown"
};
console.info("[server-build]", serverBuildInfo);
var handler = async (event) => {
  if (event.requestContext.http.method === "GET" && event.rawPath === "/user/config") {
    return getUserConfigHandler(event);
  }
  if (event.requestContext.http.method === "GET" && event.rawPath === "/reprs") {
    return getReprsHandler(event);
  }
  if (event.requestContext.http.method === "PUT" && event.rawPath.startsWith("/reprs/")) {
    return putReprHandler(event);
  }
  if (event.requestContext.http.method === "POST" && event.rawPath.startsWith("/reprs/") && event.rawPath.endsWith("/practice")) {
    return markReprPracticedHandler(event);
  }
  if (event.requestContext.http.method === "DELETE" && event.rawPath.startsWith("/reprs/")) {
    return deleteReprHandler(event);
  }
  return jsonResponse(404, { message: "Not found" });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=router.js.map
