import { NS } from "@ns";
import { scanAll } from "./lib/helpers";

export async function main(ns: NS): Promise<void> {
    const serversWithRoot = scanAll(ns, "home").filter(server => ns.hasRootAccess(server));

    for (const server of serversWithRoot) {
        ns.killall(server);
        ns.tprint(`Killed all scripts on ${server}`);
    }
}