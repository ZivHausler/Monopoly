
//update slide
var slider = document.getElementById("myRange");
var output = document.getElementById("kesef");
var welcomediv = document.getElementById("welcome-page");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

