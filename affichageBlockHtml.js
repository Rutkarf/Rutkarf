document.addEventListener('DOMContentLoaded', () => {
    const blockchainInfo = document.getElementById('blockchain-info');
    const mineBlockBtn = document.getElementById('mine-block-btn');
    const peersList = document.getElementById('peers-list');

    const displayBlockchainInfo = () => {
        fetch('/blocks')
            .then(response => response.json())
            .then(data => {
                const blocks = data.map(block => `
                    <div class="block">
                        <p>Index: ${block.index}</p>
                        <p>Previous Hash: ${block.previousHash}</p>
                        <p>Timestamp: ${block.timestamp}</p>
                        <p>Data: ${block.data}</p>
                        <p>Hash: ${block.hash}</p>
                    </div>
                `).join('');

                blockchainInfo.innerHTML = blocks;
            });
    };

    const displayPeers = () => {
        fetch('/peers')
            .then(response => response.json())
            .then(data => {
                const peers = data.map(peer => `<li>${peer}</li>`).join('');
                peersList.innerHTML = peers;
            });
    };

    mineBlockBtn.addEventListener('click', () => {
        fetch('/mineBlock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: 'Vos données pour le bloc ici' }),
        })
        .then(() => {
            console.log('Bloc miné avec succès');
            displayBlockchainInfo();
        })
        .catch(error => console.error('Erreur lors du minage du bloc:', error));
    });

    displayBlockchainInfo();
    displayPeers();
});