import { fork } from 'child_process'


function roundRoubin(array, index = 0) {
    return function () {
        if (index >= array.length) index = 0

        return array[index++]
    }
}

// Function to start child processes
function initializeCluster({ backgroundTaskFile, clusterSize, onMessage }) {
    const processes = new Map()
    for (let index = 0; index < clusterSize; index++) {

        const child = fork(backgroundTaskFile)
        child.on('exit', () => {
            // console.log(`process ${child.pid} exited`)
            processes.delete(child.pid)
        })

        child.on('error', error => {
            // console.log(`process ${child.pid} has an error`, error)
            process.exit(1)
        })

        child.on('message', (message) => {
            if (message !== 'item-done') return
            onMessage(message)
        })

        processes.set(child.pid, child)
    }

    return {
        getProcess: roundRoubin([...processes.values()]),
        killAll: () => {
            processes.forEach((child) => child.kill())
        }
    }

}

export function initialize({ backgroundTaskFile, clusterSize, onMessage }) {

    const { getProcess, killAll } = initializeCluster({ backgroundTaskFile, clusterSize, onMessage })
    // console.log(`starting with ${clusterSize} processes`)

    function sendToChild(message) {
        const child = getProcess()
        // send only if channel is open
        // if (child.killed) return;
        child.send(message)
    }


    return {
        sendToChild: sendToChild.bind(this),
        killAll: killAll.bind(this)
    }
}


