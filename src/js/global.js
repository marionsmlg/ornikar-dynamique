window.addEventListener("DOMContentLoaded", () => {
  console.log("hello");
  let menuIsOpen = false;

  document.getElementById("burgerButton").addEventListener("click", () => {
    if (menuIsOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  function closeMenu() {
    document.getElementById("smallMenu").style.display = "none";
    document.getElementById("burger").style.display = "flex";
    document.getElementById("burgerButton").style.backgroundColor = "#4c34e0";
    document.getElementById("cross").style.display = "none";
    menuIsOpen = false;
  }

  function openMenu() {
    document.getElementById("smallMenu").style.display = "flex";
    document.getElementById("burger").style.display = "none";
    document.getElementById("burgerButton").style.backgroundColor = "#f2e1da";
    document.getElementById("cross").style.display = "flex";
    menuIsOpen = true;
  }
});
