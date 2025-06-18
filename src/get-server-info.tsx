import { NS } from "@ns";
import React from "lib/react";
import { getServers, IServerInfo } from "/lib/helpers";

export function Info({ ns }: { ns: NS }) {
    const [serverInfo, setServerInfo] = React.useState<IServerInfo[]>([]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            try {
                const data = getServers(ns).slice(0, 5);
                if (data) {
                    setServerInfo(data);
                }
            } catch (e) {
                setServerInfo([]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [ns, serverInfo]);

    return (
        <ServerList servers={serverInfo} />
    );

}

function ServerList({ servers }: { servers: IServerInfo[] }) {
    return (
        <div>
            <h2>Top 5 Servers</h2>
            <ul>
                {servers.map((server, index) => (
                    <li key={index}>
                        {server.server} - Hackability: {server.hackability.toFixed(2)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

//
export async function main(ns: NS) {
    ns.ui.openTail();
    ns.printRaw(
        <>
            <Info ns={ns} />
        </>
    );
    ns.disableLog("ALL");
    await ns.asleep(10000000000);
}
