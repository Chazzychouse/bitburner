import { NS } from "@ns";
import { getRoot, copyAll } from "lib/helpers";

export async function main(ns: NS): Promise<void> {
    getRoot(ns);
    copyAll(ns);
}