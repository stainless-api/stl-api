"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const tm = __importStar(require("ts-morph"));
const path_1 = __importDefault(require("path"));
const convertType_1 = require("ts-to-zod/dist/convertType");
class Watcher {
    createProject() {
        this.project = new tm.Project({
            tsConfigFilePath: this.tsConfigFilePath,
        });
    }
    pushEvent(event) {
        const resolver = this.resolvers.shift();
        if (resolver) {
            resolver(event);
        }
        else {
            this.eventQueue.push(event);
        }
    }
    constructor(rootPath, genFolderPath) {
        this.ready = false;
        this.eventQueue = [];
        this.resolvers = [];
        this.tsConfigFilePath = path_1.default.join(rootPath, "tsconfig.json");
        this.project = new tm.Project({
            tsConfigFilePath: this.tsConfigFilePath,
        });
        this.baseCtx = new convertType_1.SchemaGenContext(this.project);
        this.watcher = chokidar_1.default.watch(path_1.default.join(rootPath, "**"), {
            ignored: path_1.default.join(genFolderPath, "**")
        });
        this.watcher.on("ready", () => {
            console.log("Watching for file changes...");
            this.ready = true;
        });
        // handle a new file added
        this.watcher.on("add", (path) => {
            if (!this.ready)
                return;
            if (path === this.tsConfigFilePath) {
                this.createProject();
            }
            else {
                const sourceFile = this.project.addSourceFileAtPath(path);
            }
            this.pushEvent({ path: path, type: "add" });
        });
        // handle a file changing
        this.watcher.on("change", (path) => __awaiter(this, void 0, void 0, function* () {
            if (!this.ready)
                return;
            if (path === this.tsConfigFilePath) {
                this.createProject();
                this.baseCtx = new convertType_1.SchemaGenContext(this.project);
                updateCtx(this.baseCtx);
            }
            else {
                const sourceFile = this.project.getSourceFile(path);
                if (sourceFile) {
                    const result = yield sourceFile.refreshFromFileSystem();
                    if (result == tm.FileSystemRefreshResult.NoChange)
                        return;
                }
                else {
                    this.project.addSourceFileAtPath(path);
                }
            }
            this.pushEvent({ path, type: "change" });
        }));
        // handle a file being removed
        this.watcher.on("unlink", (path) => {
            const sourceFile = this.project.getSourceFile(path);
            if (sourceFile) {
                this.project.removeSourceFile(sourceFile);
            }
            this.pushEvent({ path, type: "unlink" });
        });
        // handle an error occuring during the file watching process
        this.watcher.on("error", (err) => {
            // TODO: do something else here?
            console.error(err);
        });
    }
    getEvents() {
        return __asyncGenerator(this, arguments, function* getEvents_1() {
            while (true) {
                const event = this.eventQueue.shift();
                if (event) {
                    yield yield __await(event);
                }
                else {
                    yield yield __await(new Promise((resolve) => {
                        this.resolvers.push(resolve);
                    }));
                }
            }
        });
    }
}
exports.Watcher = Watcher;
function updateCtx(ctx) {
    // TODO: more fine-grained update code
    ctx.files.clear();
    ctx.diagnostics.clear();
    ctx.symbols.clear();
    return;
    // delete a generated schema based on whether symbol is updated
    // need to add two new fields: generation updated, and dependencies
    // ctx.getFileInfo("file").generatedSchemas[0].symbol;
    // how do we update these? todo: go to file and see how this is
    // being used. perhaps just invalidate every time the file changes?
    ctx.getFileInfo("file").importTypeNameMap;
    // this can probably just be invalidated on every file change
    ctx.getFileInfo("file").imports;
    // for now, maybe keep it simple: just drop the entire fileinfo whenever
    // the file changes!
    // except, that doesn't actually help with generated schemas. we need a way
    // to find out whether a generated schema depends on other types
    //
    // how do we structure this kind of dependency information?
    // think: when processing an object, we iterate over all its
    // properties. each type processed after that is a dependency
    // of top
    // maybe some sort of scheme similar to what I did in my avalacnhe lib
    // do an array of arrays
    // last entry is the current type
    // so in convertSymbol, we can just get all of the array elements after the current one
    // then once we're done we pop from
}
//# sourceMappingURL=watch.js.map