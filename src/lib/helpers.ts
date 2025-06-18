import { NS } from "@ns";

export function scanAll(ns: NS, start: string, visited = new Set<string>()): string[] {
    visited.add(start);
    for (const neighbor of ns.scan(start)) {
        if (!visited.has(neighbor)) {
            scanAll(ns, neighbor, visited);
        }
    }
    return Array.from(visited);
}

export interface IServerInfo {
    server: string;
    hackability: number;
    maxMoney: number;
    growTime: number;
    weakenTime: number;
    hackTime: number;
    minSecurity: number;
}

export function getServers(ns: NS): IServerInfo[] {
    const allServers = scanAll(ns, "home");
    const serversWithRoot = allServers.filter(server => ns.hasRootAccess(server));

    const hackability = serversWithRoot.map(server => determineHackability(ns, server));
    hackability.sort((a, b) => b.hackability - a.hackability);

    return hackability;
}

export function bestTarget(ns: NS): string {
    const allServers = scanAll(ns, "home");
    const serversWithRoot = allServers.filter(server => ns.hasRootAccess(server));

    const hackability = serversWithRoot.map(server => determineHackability(ns, server));
    hackability.sort((a, b) => b.hackability - a.hackability);
    const mostHackable = hackability[0].server;

    return mostHackable;
}

export function determineHackability(ns: NS, server: string) {
    const growTime = ns.getGrowTime(server);
    const weakenTime = ns.getWeakenTime(server);
    const hackTime = ns.getHackTime(server);
    const minSecurity = ns.getServerMinSecurityLevel(server);
    const time = growTime + weakenTime + hackTime;
    const maxMoney = ns.getServerMaxMoney(server);
    let hackNum = 0;
    if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
        hackNum = maxMoney / time;
    }

    return {
        server: server,
        hackability: hackNum,
        maxMoney: maxMoney,
        growTime: growTime,
        weakenTime: weakenTime,
        hackTime: hackTime,
        minSecurity: minSecurity,
    };
}

export function getRoot(ns: NS) {
    const allServers = scanAll(ns, "home");

    const requiredPrograms = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    const ownedPrograms = [];
    for (const program of requiredPrograms) {
        if (ns.fileExists(program, "home")) {
            ownedPrograms.push(program);
        }
    }

    for (const server of allServers) {
        if (server === "home") {
            continue;
        }
        getRootIfPossible(ns, server, ownedPrograms);
    }
}

function getRootIfPossible(ns: NS, server: string, ownedPrograms: string[]) {
    if (ns.hasRootAccess(server)) {
        return;
    }
    
    const portsRequired = ns.getServerNumPortsRequired(server);

    if (ownedPrograms.length < portsRequired) {
        return;
    }

    for (const program of ownedPrograms) {
        switch (program) {
            case "BruteSSH.exe":
                ns.brutessh(server);
                break;
            case "FTPCrack.exe":
                ns.ftpcrack(server);
                break;
            case "relaySMTP.exe":
                ns.relaysmtp(server);
                break;
            case "HTTPWorm.exe":
                ns.httpworm(server);
                break;
            case "SQLInject.exe":
                ns.sqlinject(server);
                break;
        }
    }

    ns.nuke(server);
    ns.tprint(`Root access granted to ${server}`);
}

export function copyAll(ns: NS) {
    const allServers = scanAll(ns, "home");
    const allScripts = ns.ls("home").filter(file => file.endsWith(".js"));
    for (const server of allServers) {
        ns.scp(allScripts, server);
    }
}

export function buyHacks(ns: NS) {
    const programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", "DeepscanV1.exe", "DeepscanV2.exe", "AutoLink.exe", "Formulas.exe"];
    if (ns.hasTorRouter()) {
        for (const program of programs) {
            if (!ns.fileExists(program, "home") && ns.getServerMoneyAvailable("home") >= ns.singularity.getDarkwebProgramCost(program)) {
                ns.singularity.purchaseProgram(program);
                ns.tprint(`Purchased ${program}`);
            }
        }
    }
}
