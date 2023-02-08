window.addEventListener("DOMContentLoaded", () => {
  const burgerButton = document.getElementById("burgerButton");
  burgerButton.addEventListener("click", () => {
    if (burgerButton.dataset.menuIsOpen === "false") {
      openMenu();
    } else {
      closeMenu();
    }
  });

  function closeMenu() {
    document.getElementById("smallMenu").style.display = "none";
    document.getElementById("burger").style.display = "flex";
    document.getElementById("burgerButton").style.backgroundColor = "#4c34e0";
    document.getElementById("cross").style.display = "none";
    burgerButton.dataset.menuIsOpen = "false";
  }

  function openMenu() {
    document.getElementById("smallMenu").style.display = "flex";
    document.getElementById("burger").style.display = "none";
    document.getElementById("burgerButton").style.backgroundColor = "#f2e1da";
    document.getElementById("cross").style.display = "flex";
    burgerButton.dataset.menuIsOpen = "true";
  }
});
