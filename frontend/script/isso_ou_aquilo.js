let dados = {};
let categoriaAtual = "";
let perguntas = [];
let indiceAtual = 0;
let tempo = 10;
let intervalo;

const telaCategorias = document.getElementById("tela-categorias");
const telaJogo = document.getElementById("tela-jogo");

const perguntaEl = document.getElementById("perguntas");
const img1 = document.getElementById("img1");
const img2 = document.getElementById("img2");
const label1 = document.getElementById("label1");
const label2 = document.getElementById("label2");
const timerEl = document.getElementById("timer");

async function carregarDados() {
  try {
    const res = await fetch("../backend/isso_ou_aquilo.json");
    if (!res.ok) throw new Error("Arquivo JSON não encontrado");

    dados = await res.json();
    console.log("Dados carregados:", dados);
  } catch (e) {
    console.error("Erro ao carregar JSON:", e);
  }
}

carregarDados();

function escolherCategoria(cat) {
  if (!dados.categorias || !dados.categorias[cat]) {
    alert("Categoria não encontrada");
    return;
  }

  categoriaAtual = cat;
  perguntas = dados.categorias[cat];
  indiceAtual = 0;

  telaCategorias.classList.add("hidden");
  telaJogo.classList.remove("hidden");

  mostrarPergunta();
}

function mostrarPergunta() {
  const q = perguntas[indiceAtual];

  perguntaEl.textContent = q.pergunta;
  label1.textContent = q.opcao1.texto;
  label2.textContent = q.opcao2.texto;

  img1.src = q.opcao1.imagem || "";
  img2.src = q.opcao2.imagem || "";

  tempo = 10;
  timerEl.textContent = tempo;

  clearInterval(intervalo);
  intervalo = setInterval(() => {
    tempo--;
    timerEl.textContent = tempo;

    if (tempo <= 0) proximaPergunta();
  }, 1000);
}

function proximaPergunta() {
  indiceAtual++;

  if (indiceAtual >= perguntas.length) {
    clearInterval(intervalo);
    
    telaJogo.classList.add("hidden");
    document.getElementById("fim").classList.remove("hidden");

    return;
  }
  mostrarPergunta();
}

function reiniciarJogo() {
  indiceAtual = 0;
  telaCategorias.classList.remove("hidden");
  document.getElementById("fim").classList.add("hidden");
}

document.getElementById("opcao1").onclick = proximaPergunta;
document.getElementById("opcao2").onclick = proximaPergunta;