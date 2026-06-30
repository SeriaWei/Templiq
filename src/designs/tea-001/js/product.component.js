(function () {
  var optionButtons = document.querySelectorAll('.gt-product__options button');
  var price = document.getElementById('productPrice');
  var cups = document.getElementById('productCups');
  var size = document.getElementById('productSize');

  function selectOption(button) {
    for (var index = 0; index < optionButtons.length; index += 1) {
      optionButtons[index].classList.remove('is-active');
    }

    button.classList.add('is-active');
    price.textContent = button.getAttribute('data-price');
    cups.textContent = button.getAttribute('data-cups');
    size.textContent = button.getAttribute('data-size');
  }

  for (var index = 0; index < optionButtons.length; index += 1) {
    optionButtons[index].addEventListener('click', function (event) {
      selectOption(event.currentTarget);
    });
  }
}());
