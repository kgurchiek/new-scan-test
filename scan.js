const { MinecraftServerListPing } = require("minecraft-status");
const fs = require("fs");
const ipList = require("./masscan.json");
var file = require("./serverList.json");
const pingChunkSize = 5000;
const pingTimeout = 3000;
const chunkCap = Math.floor(ipList.length / pingChunkSize);
console.log("chunkCap: " + chunkCap + "(" + ipList.length + "/" + pingChunkSize + ")");
var chunksScanned = 0;
var successes = [];

function ping(ip, port) {
    MinecraftServerListPing.ping(0, ip, port, pingTimeout)
        .then(response => {
            //console.log("success: " + ip);
            successes.push({
                ip: ip,
                port: port
            });
        })
        .catch(error => {
        //console.log(error);
        });
}

function saveData() {
    for (var i = 0; i < successes.length; i++) {
        if (!file.successIPs.includes(successes[i].ip)) {
            file.successIPs.push(successes[i].ip);
            file.successPorts.push(successes[i].port);
        }
    }

    file.totalServers = file.successIPs.length;
  
    fs.writeFile("./serverList.json", JSON.stringify(file), 'utf8', function (err) {
        if (err) {
            console.log("error while saving data:");
            return console.log(err);
        }
 
        console.log("data saved");
    });
}

function pingChunk(start) {
    console.log(start + " (chunk " + chunksScanned + ")");

    for (var i = 0; i < pingChunkSize; i++) {
        ping(ipList[start + i].ip, ipList[start + i].ports[0].port);
    }

    setTimeout(function() {
        chunksScanned++;

        if (chunksScanned <= chunkCap) {
            if (chunksScanned % 20 == 0) {
            saveData();
            }
            
            pingChunk(start + pingChunkSize);
        } else {
            saveData();
        }
    }, pingTimeout)
}

pingChunk(0);
