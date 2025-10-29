const form = document.getElementById("login-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();

  if(!username) {
    alert("Digite seu nome!");
    return;
  }

  localStorage.setItem("username", username);

  alert(`Bem-vindo, ${username}!`);
  document.querySelector(".wrapper").style.display = "none";
  document.getElementById("main-page").style.filter = "none";
});