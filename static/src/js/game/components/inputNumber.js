var $inputsNumber = document.querySelectorAll('.input-number');

for (let i = $inputsNumber.length - 1; i >= 0; i--) {
    const $inputNumber = $inputsNumber[i];
    
    let $input = $inputNumber.querySelector('span'),
        $decrementButton = $inputNumber.querySelector('.decrement'),
        $incrementButton = $inputNumber.querySelector('.increment');

    $decrementButton.addEventListener('click', () => {

        let value = +$inputNumber.getAttribute('data-value'),
            min = $inputNumber.getAttribute('data-min') || -Infinity;

        if(value > min){
            value--;
            $input.innerHTML = (value == 0) ? 'o' : value;
            $inputNumber.setAttribute('data-value', value);
        }

    });

    $incrementButton.addEventListener('click', () => {

        let value = +$inputNumber.getAttribute('data-value'),
            max = $inputNumber.getAttribute('data-max') || Infinity;

        if(value < max){
            value++;
            $input.innerHTML = (value == 0) ? 'o' : value;
            $inputNumber.setAttribute('data-value', value);
        }

    });

}