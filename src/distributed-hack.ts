import { NS } from "@ns";
import { bestTarget, copyAll, getRoot, scanAll } from "./lib/helpers";

export async function main(ns: NS): Promise<void> {
    const runningActions: Record<string, number | null> = {};

    // eslint-disable-next-line no-constant-condition
    while (true) {
        getRoot(ns);
        copyAll(ns);

        const serversWithRoot = scanAll(ns, "home").filter(server => ns.hasRootAccess(server));
        let actionLog = "";

        if (serversWithRoot.length === 0) {
            ns.tprint("No servers with root access found. Please run setup first.");
            return;
        }

        for (const server of serversWithRoot) {
            if (runningActions[server] && ns.isRunning(runningActions[server]!, server)) {
                continue;
            }

            const target = bestTarget(ns);
            const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
            const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
            const maxThreads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam("grow.js"));

            if (maxThreads < 1) {
                continue;
            }

            let finishedAt = 0;
            let action = "";
            let pid = 0;
            if (ns.getServerSecurityLevel(target) > securityThreshold) {
                action = "Weakening";
                finishedAt = Date.now() + ns.getWeakenTime(target);
                pid = ns.exec("weaken.js", server, maxThreads, target, maxThreads, server);
            } else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
                action = "Growing";
                finishedAt = Date.now() + ns.getGrowTime(target);
                pid = ns.exec("grow.js", server, maxThreads, target, maxThreads, server);
            } else {
                action = "Hacking";
                finishedAt = Date.now() + ns.getHackTime(target);
                pid = ns.exec("hack.js", server, maxThreads, target, maxThreads, server);
            }
            if (pid !== 0) {
                runningActions[server] = pid;
                const progress = {
                    finishedAt: finishedAt,
                    startedAt: Date.now(),
                    isRunning: true,
                    action: `${action} ${target}`
                };
                actionLog += `${action} on ${target} started at ${new Date(progress.startedAt).toLocaleTimeString()} and will finish at ${new Date(progress.finishedAt).toLocaleTimeString()}\n`;
                ns.write("/progress.txt", JSON.stringify(progress) + "\n", "w");
            } else {
                runningActions[server] = null;
            }
        }

        ns.tprint(`${actionLog}`);

        await ns.sleep(1000);
    }
}