document.addEventListener("DOMContentLoaded", function () {
  const pokeball = document.getElementById("pokeball");

  // Add event listeners for mouseenter and mouseleave
  pokeball.addEventListener("mouseenter", function () {
    pokeball.classList.add("rotate"); // Add the rotate class to trigger animation
  });

  pokeball.addEventListener("animationend", function () {
    pokeball.classList.remove("rotate"); // Remove the rotate class when animation ends
  });
});
