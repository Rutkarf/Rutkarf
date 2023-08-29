const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const CryptoJS = require('crypto-js');

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

function calculateHash(index, previousHash, timestamp, data) {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
}

var getGenesisBlock = () => {
    return new Block(0, "0", 26051995,  "Fraktur & Sw8tPuff", "korp01c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var blockchain = [getGenesisBlock()];

var getLatestBlock = () => blockchain[blockchain.length - 1];

var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('Index invalide');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('PreviousHash invalide');
        return false;
    } else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        console.log('Hash invalide');
        return false;
    }
    return true;
};

var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        console.log('Genesis Block invalide');
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Remplacement de la blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('La blockchain reçue est invalide');
    }
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('Échec de la connexion au pair');
        });
    });
};

var initConnection = (ws) => {
    // ... (code pour gérer les connexions WebSocket)
};

// Initialisation du serveur HTTP
var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    // Renvoyer la liste des blocs
    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));

    // Miner un nouveau bloc
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        blockchain.push(newBlock); // Ajouter le nouveau bloc à la blockchain
        console.log('Bloc ajouté à la blockchain : ' + JSON.stringify(newBlock));
        broadcast(responseLatestMsg()); // Diffuser le nouveau bloc aux pairs
        res.send();
    });

    // Renvoyer la liste des pairs
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    // Ajouter un nouveau pair
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });

    // Écouter sur le port HTTP
    app.listen(http_port, () => console.log('Écoute HTTP sur le port : ' + http_port));
};

// Lancer le serveur HTTP
initHttpServer();
