Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
} = require("./runtime/index-browser");

const Prisma = {};

exports.Prisma = Prisma;

/**
 * Prisma Client JS version: 4.14.1
 * Query Engine version: d9a4c5988f480fa576d43970d5a23641aa77bc9c
 */
Prisma.prismaVersion = {
  client: "4.14.1",
  engine: "d9a4c5988f480fa576d43970d5a23641aa77bc9c",
};

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.validator = () => (val) => val;

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */

exports.Prisma.CommentScalarFieldEnum = {
  id: "id",
  body: "body",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId",
  postId: "postId",
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: "id",
  body: "body",
  userId: "userId",
  createdAt: "createdAt",
};

exports.Prisma.PostScalarFieldEnum = {
  id: "id",
  body: "body",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId",
  likedIds: "likedIds",
  image: "image",
};

exports.Prisma.QueryMode = {
  default: "default",
  insensitive: "insensitive",
};

exports.Prisma.SortOrder = {
  asc: "asc",
  desc: "desc",
};

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable",
});

exports.Prisma.UserScalarFieldEnum = {
  id: "id",
  name: "name",
  username: "username",
  bio: "bio",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  coverImage: "coverImage",
  profileImage: "profileImage",
  hashedPassword: "hashedPassword",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  followingIds: "followingIds",
  hasNotification: "hasNotification",
};

exports.Prisma.ModelName = {
  User: "User",
  Post: "Post",
  Comment: "Comment",
  Notification: "Notification",
};

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`
    );
  }
}
exports.PrismaClient = PrismaClient;

Object.assign(exports, Prisma);
