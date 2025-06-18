import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await ns.share()
        await ns.asleep(200);
    }

}