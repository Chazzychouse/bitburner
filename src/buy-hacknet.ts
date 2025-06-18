import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    const MAX_NODES = 22;
    const MAX_LEVEL = 140;
    const MAX_RAM = 64;
    const MAX_CORES = 1;

    while (ns.hacknet.numNodes() < MAX_NODES) {
        if (ns.hacknet.getPurchaseNodeCost() <= ns.getServerMoneyAvailable("home")) {
            ns.hacknet.purchaseNode();
        }

        await ns.sleep(1000);
    }

    for (let nodeIndex = 1; nodeIndex <= ns.hacknet.numNodes(); nodeIndex++) {
        if (nodeIndex > MAX_NODES) {
            break;
        }

        while (ns.hacknet.getNodeStats(nodeIndex).level < MAX_LEVEL) {
            const levelCost = ns.hacknet.getLevelUpgradeCost(nodeIndex, 1);
            if (levelCost <= ns.getServerMoneyAvailable("home")) {
                ns.hacknet.upgradeLevel(nodeIndex, 1);
            } else {
                break;
            }

            await ns.sleep(1000);
        }

        while (ns.hacknet.getNodeStats(nodeIndex).ram < MAX_RAM) {
            const ramCost = ns.hacknet.getRamUpgradeCost(nodeIndex, 1);
            if (ramCost <= ns.getServerMoneyAvailable("home")) {
                ns.hacknet.upgradeRam(nodeIndex, 1);
            } else {
                break;
            }

            await ns.sleep(1000);
        }

        while (ns.hacknet.getNodeStats(nodeIndex).cores < MAX_CORES) {
            const coreCost = ns.hacknet.getCoreUpgradeCost(nodeIndex, 1);
            if (coreCost <= ns.getServerMoneyAvailable("home")) {
                ns.hacknet.upgradeCore(nodeIndex, 1);
            } else {
                ns.tprint(`Insufficient funds to upgrade Node ${nodeIndex} Core. Current cost: ${coreCost}`);
            }

            await ns.sleep(1000);
        }
    }
        
    ns.tprint(`All Hacknet Nodes (${MAX_NODES}) have been upgraded to maximum levels.`);
}

