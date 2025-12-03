document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    console.log("Enviando login:", { nome, senha });

    try {
        const response = await fetch("http://192.168.1.90:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, senha }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail || "Erro ao fazer login");
            return;
        }

        const data = await response.json();
        alert(`Bem-vindo, ${data.usuario.nome}!`);
        window.location.href = "/frontend/main.html";
    } catch (err) {
        console.error("Erro ao logar:", err);
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
});
