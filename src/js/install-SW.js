if('serviceWorker' in navigator){
    navigator.serviceWorker.register('serviceWorker.js')
        .then(() => console.log('Service worker funcionando'))
        .catch(() => console.log('Erro ao instalar service worker'));
}