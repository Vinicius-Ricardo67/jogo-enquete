const questionElement = document.getElementById("question");
const optionButtons = document.querySelectorAll(".option");
const nextButton = document.getElementById("next-btn");
const feedback = document.getElementById("feedback");
const timerElement = document.getElementById("timer");
const reloadButton = document.getElementById("reload");

const audioAbertura = document.getElementById("audioAbertura");
const audioErrou = document.getElementById("audioErrou");
const audioAcertou = document.getElementById("audioAcertou");

const VOLUME_NORMAL = 0.35;   
const VOLUME_BAIXO = 0.10;    

let questions = [];
let currentQuestion = 0;
let timer;
let timeLeft = 15;
let score = 0;
let shuffledOptions = [];
let correctIndex = null;

window.onload = () => {
    audioAbertura.volume = VOLUME_NORMAL;
    audioAbertura.play();
};

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

            optionButtons[correctIndex].classList.add("correct");
            feedback.textContent = "⏳ Tempo esgotado!";

            setTimeout(nextQuestion, 3000);
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
    blockOptions();

    audioAbertura.volume = VOLUME_BAIXO;

    if (selected === correctIndex) {
        optionButtons[selected].classList.add("correct");
        feedback.textContent = "✅ Resposta correta!";

        audioAcertou.currentTime = 0;
        audioAcertou.play();

        audioAcertou.onended = () => {
            audioAbertura.volume = VOLUME_NORMAL;
        };

        score++;

    } else {
        optionButtons[selected].classList.add("wrong");
        optionButtons[correctIndex].classList.add("correct");
        feedback.textContent = "❌ Resposta errada!";

        audioErrou.currentTime = 0;
        audioErrou.play();

        audioErrou.onended = () => {
            audioAbertura.volume = VOLUME_NORMAL;
        };
    }

}

nextButton.onclick = () => {
    nextQuestion();
};

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

    optionButtons.forEach(btn => btn.style.display = "none");
    nextButton.style.display = "none";

    reloadButton.style.display = "inline-block";
}

reloadButton.onclick = () => location.reload();
