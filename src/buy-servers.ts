import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const ram = 32;

    let i = 0;

    while(i < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            ns.purchaseServer("pserv-" + i, ram);
            ++i;
            ns.tprint(`Purchased server pserv-${i} with ${ram}GB RAM`);
        }

        await ns.sleep(1000);
    }

}