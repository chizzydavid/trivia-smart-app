
const category = $('#category'),
  difficulty = $('#difficulty'),
  form = $('#form'),
  loader = $('#loader'),
  startBtn = $('#startBtn'),
  triviaBtn = $('#trivia-btn'),
  resultCont = $('#result-container'),
  triviaCont = $('#trivia-container'),
  wrongBtn = $('#wrong-btn'),
  wrongAnswerCont = $('#wrong-container'),
  submitBtn = $('#submitBtn'),
  retakeBtn = $('#restart'),
  wrapper = $('#slide-wrapper');

displayError = (domElement, errorMsg) =>  domElement.find('.error').text(errorMsg);

function requestTrivia(request) {
    let count = 1, allQuestions = [];
    $.ajax({
        type: 'GET',
        url: 'server/request.php',
        dataType: 'json',
        data: request,
        contentType: 'application/json',
        success: (data) => {
            form.hide(() => startBtn.hide());
            loader.hide(300, () => {
                console.log(data);
                if (data.response_code == 1) {
                    let msg = '<p>Sorry there are no questions currently available for this category, Please select another category.</p>';
                    triviaCont.html(msg);
                    return;
                }
                questions = data.results;
                allQuestions = questions.map((el, idx) => {
                    let newQuestion = formatQuestion(el, count, idx);
                    count++;
                    return newQuestion;
                })
                triviaCont.html(allQuestions.join(' '));                
                submitBtn.toggleClass('hide');
            });
        }
    });
}

function formatQuestion(questions, count, idx) {
    let answers = [...questions.incorrect_answers, questions.correct_answer];
    let shuffledAnswers = shuffleAnswers(answers);

    let options = shuffledAnswers.map((el) => {
        return `
          <input type="radio" name="question-${idx}" value="${el}">
          <label class="trivia-label" for="${el}"> ${el}</label></br> `;
    });

    return `
        <div class="question">
          <p>${count}. ${questions.question}</p>
          ${options.join(' ')}
        </div> `;

    function shuffleAnswers(array) {
        function randomIndex(max) {
            let randomArr = [];
            let randomNum = () => Math.floor(Math.random() * max);
            while (randomArr.length < 4) {
                let rand = randomNum();
                if (randomArr.includes(rand)) continue;
                randomArr.push(rand);
            }
            return randomArr;
        }

        let randomNums = randomIndex(4);
        let shuffledAnswers = [];
        answers.forEach((el, idx) => {
            shuffledAnswers[randomNums[idx]] = el;
        })

        return shuffledAnswers;
    }
}

function startTrivia(e) {
    let req;
    if (category.val() != '') {
        loader.show(500).removeClass('hide');
        displayError(form, '');
        req = form.serialize();
        difficulty.val() === 'easy' ? req = `${req}&amount=10&type=multiple` : 
        difficulty.val() === 'medium' ? req = `${req}&amount=15&type=multiple` : req = `${req}&amount=20&type=multiple`;

        requestTrivia(req);
    }
    else displayError(form, 'Please select a category first.');
}

function processExam(e) {
    e.preventDefault();
    $('input[type=radio]').attr('disabled', true);
    triviaBtn.removeClass('hide');
    wrongBtn.removeClass('hide');
    retakeBtn.toggleClass('hide');    
    submitBtn.toggleClass('hide');    
    let counter = 0, answer, wrongAnswers = [];

    for (i = 0; i < questions.length; i++) {

        let options = $(`input[name=question-${i}`);
        $(options).each(function() {
            (this.checked === true) ? answer = this.value : '';
        })
        if (questions[i].correct_answer === answer) counter ++;
        else  wrongAnswers.push(options.eq(0).parent());
    }
    displayWrongAnswers(wrongAnswers);
    displayResult(counter);
}

function displayResult(score) {
    let finalScore = score * 100 / questions.length;
    let result = `
        <p class="trivia-results">You answered ${score} questions correctly. </br>
        Your score is <strong>${finalScore}%</strong> </p>  `;
    triviaCont.prepend(result);
    $('html, body').animate({'scrollTop': 0}, 1000);
}

function displayWrongAnswers(arr) {
    if (arr.length !== 0) {
        for (i = 0; i < arr.length; i++) {
            let id = arr[i].children().eq(1).attr('name').substr(9);

            let correctAnswer = $('<p></p>').html(`Correct Answer: <strong>${questions[id].correct_answer}</strong>`);
            correctAnswer.attr('class', 'correct');
            let clone = arr[i].clone(true);
            clone.append(correctAnswer);
            wrongAnswerCont.append(clone);
        };
    }
    else {
        let message = `You answered all questions correctly. congratulations!`;
        wrongAnswerCont.text(message);
    }
}

function switchTabs(e, el) {
    switch (el.attr('id')) {

        case "trivia-btn":
            if (triviaCont.hasClass('curr-display')) return;
            $('.nav-item').removeClass('active');
            $(e.target).addClass('active');

            triviaCont.removeClass('hide');
            wrongAnswerCont.addClass('hide');
        break;

        case "wrong-btn":
            if (wrongAnswerCont.hasClass('curr-display')) return;
            $('.nav-item').removeClass('active');
            $(e.target).addClass('active');

            triviaCont.addClass('hide');
            wrongAnswerCont.removeClass('hide');
        break;
    }
}

function restart(e) {
    e.preventDefault();
    var currentUrl = window.location.href;
    window.location.href = currentUrl;
}



loader.hide();
form.fadeIn(1000).removeClass('hide');
startBtn.fadeIn(1000).removeClass('hide');
startBtn.on('click', startTrivia);
triviaBtn.on('click', (e) => switchTabs(e, triviaBtn));
wrongBtn.on('click', (e) => switchTabs(e, wrongBtn));
submitBtn.on('click', processExam);
retakeBtn.on('click', restart);

