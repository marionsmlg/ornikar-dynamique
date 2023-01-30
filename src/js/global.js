window.addEventListener("DOMContentLoaded", () => {
  console.log("hello");
  let menuIsOpen = true;
  document.getElementById("burgerButton").addEventListener("click", () => {
    if (menuIsOpen) {
      document.getElementById("smallMenu").style.display = "none";
      menuIsOpen = false;
    } else {
      document.getElementById("smallMenu").style.display = "flex";
      menuIsOpen = true;
    }
  });
});
