import chokidar, { FSWatcher } from "chokidar";
import * as tm from "ts-morph";
import path from "path";
import { SchemaGenContext } from "ts-to-zod/dist/convertType";

type Event = {
  path: string;
  type: string;
};

export class Watcher {
  private watcher: FSWatcher;
  private ready = false;
  private tsConfigFilePath: string;

  /**
   * Note that this may be invalidated on every file change.
   * WHen a file change occurs, always ensure you get the
   * variable anew.
   */
  project: tm.Project;

  /**
   * Note that this may be invalidated on every file change.
   * WHen a file change occurs, always ensure you get the
   * variable anew.
   */
  baseCtx: SchemaGenContext;

  eventQueue: Event[] = [];

  resolvers: ((value: Event) => void)[] = [];

  private createProject() {
    this.project = new tm.Project({
      tsConfigFilePath: this.tsConfigFilePath,
    });
  }

  private pushEvent(event: Event) {
    const resolver = this.resolvers.shift();
    if (resolver) {
      resolver(event);
    } else {
      this.eventQueue.push(event);
    }
  }

  constructor(rootPath: string, genFolderPath: string) {
    this.tsConfigFilePath = path.join(rootPath, "tsconfig.json");
    this.project = new tm.Project({
      tsConfigFilePath: this.tsConfigFilePath,
    });

    this.baseCtx = new SchemaGenContext(this.project);

    this.watcher = chokidar.watch(path.join(rootPath, "**"), {
      ignored: path.join(genFolderPath, "**") 
    });
    this.watcher.on("ready", () => {
      console.log("Watching for file changes...");
      this.ready = true;
    });

    // handle a new file added
    this.watcher.on("add", (path) => {
      if (!this.ready) return;
      if (path === this.tsConfigFilePath) {
        this.createProject();
      } else {
        const sourceFile = this.project.addSourceFileAtPath(path);
      }
      this.pushEvent({ path: path, type: "add" });
    });

    // handle a file changing
    this.watcher.on("change", async (path) => {
      if (!this.ready) return;
      if (path === this.tsConfigFilePath) {
        this.createProject();
        this.baseCtx = new SchemaGenContext(this.project);
        updateCtx(this.baseCtx);
      } else {
        const sourceFile = this.project.getSourceFile(path);
        if (sourceFile) {
          const result = await sourceFile.refreshFromFileSystem();
          if (result == tm.FileSystemRefreshResult.NoChange) return;
        } else {
          this.project.addSourceFileAtPath(path);
        }
      }
      this.pushEvent({ path, type: "change" });
    });

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
  async *getEvents(): AsyncGenerator<Event, never, unknown> {
    while (true) {
      const event = this.eventQueue.shift();
      if (event) {
        yield event;
      } else {
        yield new Promise<Event>((resolve) => {
          this.resolvers.push(resolve);
        });
      }
    }
  }
}

function updateCtx(ctx: SchemaGenContext) {
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
