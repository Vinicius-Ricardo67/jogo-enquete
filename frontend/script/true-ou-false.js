fetch ("../backend/true-ou-false.json")
 .then(response => response.json())
    .then(data => {
        questions = shuffleArray(data.enquetes).slice(0, 10);
        showQuestion();
    });


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

let questions = shuffle("../backend/true-ou-false.json");

function startGame(){
    index = 0;
    score = 0;
    questions = shuffle("../backend/true-ou-false.json");
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
        showMessage("Sua resposta está Correta! ✅");
    } else {
        showMessage("Sua resposta está Errada! ❌");
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
