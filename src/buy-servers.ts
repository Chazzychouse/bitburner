import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const ram = ns.getPurchasedServerMaxRam();

    let i = 0;

    while(i < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            ns.purchaseServer("pserv-" + i, ram);
            ++i;
        }
        await ns.sleep(1000);
    }

}