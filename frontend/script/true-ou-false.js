const QUESTIONS = [
    { q: "O Sol é uma estrela.", a: true },
    { q: "A água ferve a 50°C.", a: false },
    { q: "O Brasil já ganhou Copa do Mundo.", a: true },
    { q: "A lua é maior que a Terra.", a: false },
    { q: "Diamantes são feitos de carbono.", a: true },
    { "q": "A gravidade na Lua é menor do que na Terra.", "a": true },
    { "q": "O Oceano Atlântico é o maior oceano do mundo.", "a": false },
    { "q": "O ser humano possui 206 ossos na fase adulta.", "a": true },
    { "q": "A capital do Canadá é Toronto.", "a": false },
    { "q": "O primeiro computador eletrónico foi criado nos anos 40.", "a": true },
    { "q": "A água cobre mais de 70% da superfície da Terra.", "a": true },
    { "q": "A Antártida é o continente mais quente do planeta.", "a": false },
    { "q": "O Monte Everest é a montanha mais alta do mundo.", "a": true },
    { "q": "O diamante é o material mais duro encontrado na natureza.", "a": true },
    { "q": "Os morcegos são cegos.", "a": false },
    { "q": "A luz do Sol leva cerca de 8 minutos para chegar à Terra.", "a": true },
    { "q": "Um polvo possui três corações.", "a": true },
    { "q": "A Grande Muralha da China é visível do espaço a olho nu.", "a": false },
    { "q": "A Terra gira ao redor do Sol.", "a": true },
    { "q": "Os cães conseguem identificar cores exatamente como os humanos.", "a": false },
    { "q": "O sangue dentro das veias é azul.", "a": false },
    { "q": "O planeta mais próximo do Sol é Mercúrio.", "a": true },
    { "q": "O ser humano pode viver sem o fígado.", "a": false },
    { "q": "A língua é o músculo mais forte do corpo humano.", "a": false },
    { "q": "O oxigênio é o gás mais abundante na atmosfera da Terra.", "a": false },
    { "q": "Baratas conseguem sobreviver por semanas sem cabeça.", "a": true },
    { "q": "O coração humano possui quatro câmaras.", "a": true },
    { "q": "A eletricidade sempre flui do polo negativo para o positivo.", "a": true },
    { "q": "O Oceano Pacífico é maior que todos os continentes juntos.", "a": true },
    { "q": "A internet foi criada antes do Wi-Fi.", "a": true },
    { "q": "O chocolate é tóxico para cães.", "a": true },
    { "q": "A apple foi fundada depois da Microsoft.", "a": false },
    { "q": "O ser humano já pisou em Marte.", "a": false },
    { "q": "O golfinho é um mamífero.", "a": true },
    { "q": "O pinguim consegue voar.", "a": false }
];

const questionEl = document.getElementById("question");
const btnTrue = document.getElementById("btn-true");
const btnFalse = document.getElementById("btn-false");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restart");

let index = 0;
let score = 0;
let timer;
let timeLeft = 10;

function shuffle(arr){
    return arr.sort(() => Math.random() - 0.5);
}

let questions = shuffle([...QUESTIONS]);

function startGame(){
    index = 0;
    score = 0;
    questions = shuffle([...QUESTIONS]);
    resultEl.style.display = "none";
    loadQuestion();
}

function loadQuestion(){
    let q = questions[index];
    questionEl.textContent = q.q;

    timeLeft = 10;
    timerEl.textContent = timeLeft;

    clearInterval(timer);
    timer = setInterval(countdown, 1000);
}

function countdown(){
    timeLeft--;
    timerEl.textContent = timeLeft;

    if(timeLeft <= 0){
        clearInterval(timer);
        nextQuestion();
    }
}

function checkAnswer(userAnswer){
    if(userAnswer === questions[index].a){
        score++;
        showMessage("✔ Correto!");
    } else {
        showMessage("❌ Errado!");
    }
    nextQuestion();
}

function showMessage(msg){
    resultEl.style.display = "block";
    resultEl.textContent = msg;
    setTimeout(() => resultEl.style.display = "none", 1200);
}

function nextQuestion(){
    index++;
    if(index >= questions.length){
        finishGame();
    } else {
        loadQuestion();
    }
}

function finishGame(){
    clearInterval(timer);
    questionEl.textContent = "Fim do jogo!";
    resultEl.style.display = "block";
    resultEl.textContent = `Você acertou ${score} de ${questions.length}.`;
    btnTrue.disabled = true;
    btnFalse.disabled = true;
}

btnTrue.addEventListener("click", () => checkAnswer(true));
btnFalse.addEventListener("click", () => checkAnswer(false));
restartBtn.addEventListener("click", () => {
    btnTrue.disabled = false;
    btnFalse.disabled = false;
    startGame();
});

startGame();
