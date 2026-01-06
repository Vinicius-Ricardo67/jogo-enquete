const estado = {
  dados: {},
  categoria: "",
  subcategoria: "",
  pool: [],
  vencedor: null,
  tempo: 10,
  intervalo: null,
  duelo: null,
  totalDuelos: 0,
  duelosJogados: 0
};

const ui = {
  telaCategorias: document.getElementById("tela-categorias"),
  telaJogo: document.getElementById("tela-jogo"),
  telaFim: document.getElementById("fim"),
  pergunta: document.getElementById("perguntas"),
  label1: document.getElementById("label1"),
  label2: document.getElementById("label2"),
  img1: document.getElementById("img1"),
  img2: document.getElementById("img2"),
  opcao1: document.getElementById("opcao1"),
  opcao2: document.getElementById("opcao2"),
  timer: document.getElementById("timer"),
  barraProgresso: document.getElementById("progresso-barra")
};


async function carregarDados() {
  const res = await fetch("../backend/isso_ou_aquilo.json");
  estado.dados = await res.json();
  console.log("Dados carregados:", estado.dados);
}

carregarDados();


function escolherCategoria(cat) {
  estado.categoria = cat;

  const subcategorias = Object.keys(estado.dados.categorias[cat]);
  estado.subcategoria = subcategorias[Math.floor(Math.random() * subcategorias.length)];

  const lista = estado.dados.categorias[cat][estado.subcategoria];
  estado.pool = selecionarPergunta(lista, 15);
  estado.vencedor = null;

  estado.totalDuelos = estado.pool.length - 1;
  estado.duelosJogados = 0;

  console.log("Categoria:", cat);
  console.log("Subcategoria:", estado.subcategoria);
  console.log("Pool:", estado.pool);

  ui.telaCategorias.classList.add("hidden");
  ui.telaJogo.classList.remove("hidden");

  proximaRodada();
}


function atualizarProgresso() {
  const pct = (estado.duelosJogados / estado.totalDuelos) * 100;

  ui.barraProgresso.style.width = `${pct}%`;
}


function proximaRodada() {
  estado.duelosJogados++;
  atualizarProgresso();
  clearInterval(estado.intervalo);

  if (estado.pool.length === 0 && estado.vencedor) {
    finalizarJogo();
    return;
  }

  let a, b;

  if (!estado.vencedor) {
    a = estado.pool.shift();
    b = estado.pool.shift();
  } else {
    a = estado.vencedor;
    b = estado.pool.shift();
  }

  if (!a || !b) {
    estado.vencedor = a || b;
    finalizarJogo();
    return;
  }

  estado.duelo = { a, b };

  ui.pergunta.textContent = `${a.texto} ou ${b.texto}?`;
  ui.label1.textContent = a.texto;
  ui.label2.textContent = b.texto;
  ui.img1.src = a.imagem || "";
  ui.img2.src = b.imagem || "";

  iniciarTimer();
}


ui.opcao1.onclick = () => escolher(estado.duelo.a);
ui.opcao2.onclick = () => escolher(estado.duelo.b);

function escolher(opcao) {
  estado.vencedor = opcao;
  proximaRodada();
}


function iniciarTimer() {
  estado.tempo = 1000;
  ui.timer.textContent = estado.tempo;

  estado.intervalo = setInterval(() => {
    estado.tempo--;
    ui.timer.textContent = estado.tempo;

    if (estado.tempo <= 0) {
      escolher(estado.duelo.a);
    }
  }, 1000);
}


function finalizarJogo() {
  clearInterval(estado.intervalo);

  ui.telaJogo.classList.add("hidden");
  ui.telaFim.classList.remove("hidden");

  console.log("Resultado final:", estado.vencedor);
}


function reiniciarJogo() {
  ui.telaFim.classList.add("hidden");
  ui.telaCategorias.classList.remove("hidden");
}

function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia
}

function selecionarPergunta(opcoes, quantidade = 15) {
  return embaralhar(opcoes).slice(0, quantidade);
}
