if('serviceWorker' in navigator && !isElectron){
    navigator.serviceWorker.register('serviceWorker.js')
        .then(() => console.log('Service worker funcionando'))
        .catch(() => console.log('Erro ao instalar service worker'));
}