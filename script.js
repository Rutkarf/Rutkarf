document.addEventListener('DOMContentLoaded', () => {
    const blockchainInfo = document.getElementById('blockchain-info');
    const mineBlockBtn = document.getElementById('mine-block-btn');
    const miningAnimation = document.getElementById('mining-animation');

    // Fonction pour afficher les informations sur la blockchain
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

    // Ajoutez un écouteur d'événement pour le bouton "Mine New Block"
    mineBlockBtn.addEventListener('click', () => {
        miningAnimation.style.display = 'block'; // Affiche l'animation de minage
        fetch('/mineBlock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: 'Vos données pour le bloc ici' }),
        })
        .then(response => response.json())
        .then(() => {
            console.log('Bloc miné avec succès');
            miningAnimation.style.display = 'none'; // Masque l'animation de minage
            displayBlockchainInfo();
        })
        .catch(error => {
            console.error('Erreur lors du minage du bloc:', error);
            miningAnimation.style.display = 'none'; // Masque l'animation de minage en cas d'erreur
        });
    });

    // Affichez les informations sur la blockchain au chargement de la page
    displayBlockchainInfo();
});
