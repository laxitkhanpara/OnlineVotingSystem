var image = document.getElementById("Symbole-input");
var previewSymboleImage = document.getElementById("previewSymbole")
image.addEventListener('change', function (event) {
    if (event.target.files.length == 0) {
        return;
    }
    var tempURL = URL.createObjectURL(event.target.files[0]);
    previewSymboleImage.setAttribute('src', tempURL)
});