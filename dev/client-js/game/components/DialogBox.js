function DialogBox($interface){

    this.alert = (title, text, callback) => {

        let $modal = $interface.querySelector('.modal');

        let $alert = document.createElement('div');
        $alert.classList.add('dialog-box', 'alert');

        $alert.innerHTML = `<h1>${title}</h1>
                           <p>${text}</p>
                           <button>Ok</button>`;

        let $buttonOk = $alert.querySelector('button');

        $interface.insertBefore($alert, $modal);

        $buttonOk.focus();
        $buttonOk.addEventListener('click', () => {
            $buttonOk.parentNode.remove();
            typeof callback == 'function' && callback();
        });

    }

}