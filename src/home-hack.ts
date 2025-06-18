import { NS } from "@ns";
import { bestTarget } from "lib/helpers";

export async function main(ns: NS): Promise<void> {
    const target = bestTarget(ns);
    const server = "home";
    const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
    const maxThreads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam("home-hack.js")) - 20;


    if (ns.getServerSecurityLevel(target) > securityThreshold) {
        await ns.weaken(target, { threads: maxThreads });
    } else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
        await ns.grow(target, { threads: maxThreads });
    } else {
        await ns.hack(target, { threads: maxThreads });
    }

    await ns.sleep(500);
}