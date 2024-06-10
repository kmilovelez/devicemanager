// Lista de dispositivos en tu LAN privada


const ping = require('ping');
const traceroute = require('traceroute');

const devices = [
    '192.168.1.1',
    '192.168.1.2',
    '192.168.1.3',
    '192.168.1.4',
    '192.168.1.5',
    '192.168.1.6',
    '192.168.1.7',
    '192.168.1.8',
    '192.168.1.9',
    '192.168.1.10',
    '192.168.1.11',
    '192.168.1.12',
    '192.168.1.13',
    '192.168.1.14',
    '192.168.1.15'
];

const numPackets = 10;

const pingDevice = async (host) => {
    let sent = 0;
    let received = 0;
    let times = [];

    for (let i = 0; i < numPackets; i++) {
        sent++;
        const res = await ping.promise.probe(host);
        if (res.alive) {
            received++;
            times.push(res.time);
        }
    }

    const packetLoss = ((sent - received) / sent) * 100;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const avgTime = times.reduce((acc, curr) => acc + curr, 0) / times.length;

    return {
        host,
        sent,
        received,
        packetLoss,
        minTime,
        maxTime,
        avgTime
    };
};

const tracerouteDevice = (host) => {
    return new Promise((resolve, reject) => {
        traceroute.trace(host, (err, hops) => {
            if (err) {
                reject(err);
            } else {
                resolve({ host, hops });
            }
        });
    });
};

const monitorDevices = async () => {
    try {
        const pingPromises = devices.map(device => pingDevice(device));
        const traceroutePromises = devices.map(device => tracerouteDevice(device));

        const pingResults = await Promise.all(pingPromises);
        const tracerouteResults = await Promise.all(traceroutePromises);

        console.log('Ping Results:');
        pingResults.forEach(result => {
            console.log(`${result.host} - Packets sent: ${result.sent}, received: ${result.received}, packet loss: ${result.packetLoss.toFixed(2)}%`);
            console.log(`    Min time: ${result.minTime.toFixed(2)} ms, Max time: ${result.maxTime.toFixed(2)} ms, Avg time: ${result.avgTime.toFixed(2)} ms`);
        });

        console.log('\nTraceroute Results:');
        tracerouteResults.forEach(result => {
            console.log(`Traceroute to ${result.host}:`);
            result.hops.forEach((hop, index) => {
                console.log(`${index + 1}: ${hop.hostname || 'Unknown'} (${hop.ip || 'No IP'}) - ${hop.rtt1 || ''} ms`);
            });
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
};

monitorDevices();