const questionElement = document.getElementById("question");
const optionButtons = document.querySelectorAll(".option");
const nextButton = document.getElementById("next-btn");
const feedback = document.getElementById("feedback");
const timerElement = document.getElementById("timer");

let questions = [];
let currentQuestion = 0;
let timer;
let timeLeft = 15;
let autoNextTimeout;

fetch("jogos.json")
    .then(response => response.json())
    .then(data => {

        questions = shuffleArray(data.enquetes).slice(0, 10);

        showQuestion();
    });

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startTimer() {
    timeLeft = 15;
    timerElement.textContent = `⏰ ${timeLeft}`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `⏰ ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            blockOptions();
            feedback.textContent = "⏳ Tempo esgotado!";

            autoNextTimeout = setTimeout(nextQuestion, 4000);
        }
    }, 1000);
}

function blockOptions() {
    optionButtons.forEach(btn => btn.disabled = true);
}

function unblockOptions() {
    optionButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("correct", "wrong");
    });
}

function showQuestion() {
    unblockOptions();
    feedback.textContent = "";
    clearInterval(timer);
    clearTimeout(autoNextTimeout);

    const q = questions[currentQuestion];
    questionElement.textContent = q.question;

    optionButtons.forEach((btn, index) => {
        btn.textContent = q.options[index];
        btn.onclick = () => checkAnswer(index);
    });

    startTimer();
}

function checkAnswer(selected) {
    clearInterval(timer);

    const correct = questions[currentQuestion].correct;

    if (selected === correct) {
        optionButtons[selected].classList.add("correct");
        feedback.textContent = "✅ Resposta correta!";
    } else {
        optionButtons[selected].classList.add("wrong");
        optionButtons[correct].classList.add("correct");
        feedback.textContent = "❌ Resposta errada!";
    }

    blockOptions();

    autoNextTimeout = setTimeout(nextQuestion, 4000);
}

function nextQuestion() {
    currentQuestion++;

    if (currentQuestion >= questions.length) {
        questionElement.textContent = "Fim do jogo!";
        timerElement.textContent = "";
        feedback.textContent = "";
        optionButtons.forEach(btn => (btn.style.display = "none"));
        nextButton.style.display = "none";
        document.getElementById("clock-emoji").style.display = "none";
        return;
    }

    showQuestion();
}

nextButton.onclick = nextQuestion;
