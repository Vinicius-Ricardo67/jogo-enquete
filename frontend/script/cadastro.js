document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastro-form");
  const linkLogin = document.querySelector("a[href='#']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Erro ao cadastrar.");
        return;
      }

      const data = await response.json();
      alert(`Bem-vindo, ${data.usuario.nome}! Cadastro realizado com sucesso.`);
      window.location.href = "main.html";
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
  });

  linkLogin.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/frontend/login.html";
  });
});
