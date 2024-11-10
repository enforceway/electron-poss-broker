import { UtilityProcess, utilityProcess } from "electron";
import path from "path";

export function createUtilityProcessFromProcessCWD(modulePath): UtilityProcess {
    const pwdPath = process.cwd();
    const moduleJSPath = path.join(pwdPath, modulePath);
    const utility = utilityProcess.fork(moduleJSPath);
    return utility;
}