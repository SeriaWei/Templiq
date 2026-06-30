(function () {
  var options = document.querySelectorAll('.lw-config__option');
  var editionName = document.getElementById('editionName');
  var editionPrice = document.getElementById('editionPrice');
  var editionNote = document.getElementById('editionNote');

  function selectEdition(option) {
    for (var index = 0; index < options.length; index += 1) {
      options[index].classList.remove('is-active');
    }

    option.classList.add('is-active');
    editionName.textContent = option.querySelector('span').textContent + ' Edition';
    editionPrice.textContent = option.getAttribute('data-price');
    editionNote.textContent = option.getAttribute('data-note');
  }

  for (var index = 0; index < options.length; index += 1) {
    options[index].addEventListener('click', function (event) {
      selectEdition(event.currentTarget);
    });
  }
}());
