let shuffled = [...questions].sort(() => Math.random() - 0.5);
    let current = 0;
    let score = 0;
    let timer;
    let timeLeft = 10;

    const questionEl = document.getElementById("question");
    const optionsEl = document.querySelectorAll(".option");
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("next");
    const timerEl = document.getElementById("timer");

    function startTimer() {
        timeLeft = 10;
        timerEl.textContent = "⏳ " + timeLeft;

        timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = "⏳ " + timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                timeRanOut();
            }
        }, 1000);
    }

    function loadQuestion() {
        clearInterval(timer);
        startTimer();

        const q = shuffled[current];

        questionEl.textContent = q.q;
        feedback.textContent = "";
        nextBtn.style.display = "none";

        optionsEl.forEach((btn, i) => {
            btn.textContent = q.options[i];
            btn.classList.remove("correct", "wrong");
            btn.disabled = false;
            btn.onclick = () => selectOption(i);
        });
    }

    function selectOption(index) {
        clearInterval(timer);

        const correct = shuffled[current].correct;

        optionsEl.forEach(btn => btn.disabled = true);

        if (index === correct) {
            score++;
            optionsEl[index].classList.add("correct");
            feedback.textContent = "✔ ACERTOU!";
            feedback.style.color = "#0fc244";
        } else {
            optionsEl[index].classList.add("wrong");
            optionsEl[correct].classList.add("correct");
            feedback.textContent = "✘ ERROU!";
            feedback.style.color = "#c22727";
        }

        nextBtn.style.display = "block";
        goToNextWithDelay();
    }

    function timeRanOut() {
        const correct = shuffled[current].correct;

        optionsEl.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove("correct", "wrong");
        });

        optionsEl[correct].classList.add("correct");

        feedback.textContent = "⏰ Tempo esgotado!";
        feedback.style.color = "#ffd000";

        nextBtn.style.display = "block";
        goToNextWithDelay();
    }

    function goToNextWithDelay() {
        setTimeout(() => {
            current++;
            if (current < shuffled.length) {
                loadQuestion();
            } else {
                endGame();
            }
        }, 5000);
    }

    nextBtn.onclick = () => {
        current++;
        if (current < shuffled.length) loadQuestion();
        else endGame();
    };

    function endGame() {
        questionEl.textContent = "FIM DE JOGO!";
        feedback.textContent = `Você acertou ${score} de ${shuffled.length} perguntas!`;

        optionsEl.forEach(btn => {
            btn.style.display = "none";
        });

        nextBtn.style.display = "none";
        timerEl.style.display = "none";
    }

    loadQuestion();