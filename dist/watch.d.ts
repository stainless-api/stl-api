import * as tm from "ts-morph";
import { SchemaGenContext } from "ts-to-zod/dist/convertType";
export type Event = {
    path: string;
    type: string;
};
export declare class Watcher {
    private watcher;
    private gitignore;
    private ready;
    private fileCount;
    private tsConfigFilePath;
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
    eventQueue: Event[];
    resolvers: ((value: Event) => void)[];
    private createProject;
    private pushEvent;
    constructor(rootPath: string, genFolderPath: string);
    getEvents(): AsyncGenerator<Event, never, unknown>;
}
//# sourceMappingURL=watch.d.ts.map