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
let score = 0;
let shuffledOptions = []; 
let correctIndex = null;

fetch("../backend/jogos.json")
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

    shuffledOptions = q.options.map((opt, index) => ({
        text: opt,
        isCorrect: index === q.correct
    }));

    shuffledOptions = shuffleArray(shuffledOptions);

    correctIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

    optionButtons.forEach((btn, index) => {
        btn.textContent = shuffledOptions[index].text;
        btn.onclick = () => checkAnswer(index);
    });

    startTimer();
}

function checkAnswer(selected) {
    clearInterval(timer);

    if (selected === correctIndex) {
        optionButtons[selected].classList.add("correct");
        feedback.textContent = "✅ Resposta correta!";
        score++;
    } else {
        optionButtons[selected].classList.add("wrong");
        optionButtons[correctIndex].classList.add("correct");
        feedback.textContent = "❌ Resposta errada!";
    }

    blockOptions();
    autoNextTimeout = setTimeout(nextQuestion, 4000);
}

function nextQuestion() {
    currentQuestion++;

    if (currentQuestion >= questions.length) {
        endGame();
        return;
    }

    showQuestion();
}

function endGame() {
    questionElement.textContent = "Fim do jogo!";
    feedback.textContent = `🎉 Você acertou ${score} de ${questions.length} perguntas!`;
    
    timerElement.textContent = "";
    
    optionButtons.forEach(btn => (btn.style.display = "none"));
    nextButton.style.display = "none";
    document.getElementById("clock-emoji").style.display = "none";
}

const audio = new Audio("audio/musica.mp4");

document.getElementById("playBtn").addEventListener("click", () => {
    audio.play();
});


nextButton.onclick = nextQuestion;
