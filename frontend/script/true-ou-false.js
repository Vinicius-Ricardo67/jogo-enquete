const questionEl = document.getElementById("question");
const btnTrue = document.getElementById("btn-true");
const btnFalse = document.getElementById("btn-false");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restart");

let questions = [];
let currentIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 10;
let answered = false;


function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}


fetch("../backend/true-ou-false.json")
    .then(res => res.json())
    .then(data => {
        questions = shuffleArray(data.enquetes).slice(0, 10);
        startGame();
    });


function startGame() {
    currentIndex = 0;
    score = 0;
    restartBtn.textContent = "Próxima";
    resultEl.style.display = "none";
    btnTrue.disabled = false;
    btnFalse.disabled = false;
    loadQuestion();
}

function loadQuestion() {
    answered = false;
    clearInterval(timer);

    const q = questions[currentIndex];
    questionEl.textContent = q.question;

    timeLeft = 10;
    timerEl.textContent = timeLeft;

    timer = setInterval(countdown, 1000);
}

function countdown() {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(timer);
        showResult(false, true);
        autoNext();
    }
}

function checkAnswer(answerIndex) {
    if (answered) return;
    answered = true;

    clearInterval(timer);

    const correct = questions[currentIndex].correct === answerIndex;
    if (correct) score++;

    showResult(correct);
    autoNext();
}

function showResult(correct, timeout = false) {
    resultEl.style.display = "block";

    if (timeout) {
        resultEl.textContent = "⏰ Tempo esgotado!";
    } else if (correct) {
        resultEl.textContent = "✅ Resposta correta!";
    } else {
        resultEl.textContent = "❌ Resposta errada!";
    }
}

function autoNext() {
    btnTrue.disabled = true;
    btnFalse.disabled = true;

    setTimeout(() => {
        nextQuestion();
    }, 3000);
}

function nextQuestion() {
    resultEl.style.display = "none";
    btnTrue.disabled = false;
    btnFalse.disabled = false;

    currentIndex++;

    if (currentIndex >= questions.length) {
        finishGame();
    } else {
        loadQuestion();
    }
}

function finishGame() {
    clearInterval(timer);
    questionEl.textContent = "🎉 Fim do jogo!";
    timerEl.textContent = "";

    resultEl.style.display = "block";
    resultEl.textContent = `Você acertou ${score} de ${questions.length}`;

    btnTrue.disabled = true;
    btnFalse.disabled = true;

    restartBtn.textContent = "Jogar novamente";
}


btnTrue.addEventListener("click", () => checkAnswer(0));
btnFalse.addEventListener("click", () => checkAnswer(1));

restartBtn.addEventListener("click", () => {
    if (restartBtn.textContent === "Jogar novamente") {
        questions = shuffleArray(questions);
        startGame();
    } else {
        nextQuestion();
    }
});
