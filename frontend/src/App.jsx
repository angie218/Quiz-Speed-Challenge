import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api";

function App() {
  const [introScreen, setIntroScreen] = useState("todo");

  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/questions`)
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => {
        console.error("Failed to load questions:", error);
      });
  }, []);

  useEffect(() => {
    if (introScreen !== "joke") {
      return;
    }

    const timer = setTimeout(() => {
      setIntroScreen("quiz");
    }, 4000);

    return () => clearTimeout(timer);
  }, [introScreen]);

  useEffect(() => {
    if (!gameStarted || gameFinished) {
      return;
    }

    if (timeLeft === 0) {
      goToNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameFinished, timeLeft]);

  const startGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    setGameStarted(true);
    setGameFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(30);
  };

  const answerQuestion = (selectedAnswerIndex) => {
    const currentQuestion = questions[currentQuestionIndex];

    const isCorrect =
      selectedAnswerIndex === currentQuestion.correctAnswer;

    const earnedScore = isCorrect ? 100 + timeLeft : 0;
    const updatedScore = score + earnedScore;
    const updatedCorrectAnswers =
      correctAnswers + (isCorrect ? 1 : 0);

    if (isCorrect) {
      setScore(updatedScore);
      setCorrectAnswers(updatedCorrectAnswers);
    }

    goToNextQuestion(
      updatedScore,
      updatedCorrectAnswers
    );
  };

  const goToNextQuestion = (
    finalScore = score,
    finalCorrectAnswers = correctAnswers
  ) => {
    const isLastQuestion =
      currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      finishGame(finalScore, finalCorrectAnswers);
      return;
    }

    setCurrentQuestionIndex((previous) => previous + 1);
    setTimeLeft(30);
  };

  const finishGame = async (
    finalScore = score,
    finalCorrectAnswers = correctAnswers
  ) => {
    setScore(finalScore);
    setCorrectAnswers(finalCorrectAnswers);
    setGameFinished(true);
    setGameStarted(false);

    try {
      await fetch(`${API_URL}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          score: finalScore,
          correctAnswers: finalCorrectAnswers,
          totalQuestions: questions.length,
        }),
      });

      const leaderboardResponse = await fetch(
        `${API_URL}/leaderboard`
      );

      const leaderboardData =
        await leaderboardResponse.json();

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  const restartGame = () => {
    setPlayerName("");
    setGameFinished(false);
    setGameStarted(false);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentQuestionIndex(0);
    setTimeLeft(30);
  };

  if (introScreen === "todo") {
    return (
      <main className="intro-page">
        <section className="fake-todo-card">
          <div className="todo-header">
            <span className="todo-icon">✓</span>

            <div>
              <p className="todo-label">
                Cloud Final Project
              </p>

              <h1>My Todo List</h1>
            </div>
          </div>

          <p className="todo-subtitle">
            A revolutionary productivity application
            that definitely took months to build.
          </p>

          <div className="todo-list">
            <label className="todo-item completed">
              <input type="checkbox" checked readOnly />
              Create a Todo List
            </label>

            <label className="todo-item completed">
              <input type="checkbox" checked readOnly />
              Add unnecessary checkboxes
            </label>

            <label className="todo-item completed">
              <input type="checkbox" checked readOnly />
              Impress the lecturer
            </label>

            <label className="todo-item">
              <input type="checkbox" readOnly />
              Build something actually interesting
            </label>
          </div>

          <button
            className="start-intro-button"
            onClick={() => setIntroScreen("joke")}
          >
            Let&apos;s Start
            <span>→</span>
          </button>
        </section>
      </main>
    );
  }

  if (introScreen === "joke") {
    return (
      <main className="joke-page">
        <section className="joke-content">
          <div className="joke-emoji">😏</div>

          <p className="joke-small-text">
            Relax, professor...
          </p>

          <h1>We are just kidding.</h1>

          <p>This is not another Todo List.</p>

          <div className="loading-container">
            <div className="loading-bar" />
          </div>

          <span className="loading-text">
            Loading the real project...
          </span>
        </section>
      </main>
    );
  }

  if (!gameStarted && !gameFinished) {
    return (
      <main className="container">
        <section className="card">
          <h1>Quiz Speed Challenge</h1>

          <p>
            Answer correctly and quickly. You have 30
            seconds per question.
          </p>

          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(event) =>
              setPlayerName(event.target.value)
            }
          />

          <button onClick={startGame}>
            Start Game
          </button>
        </section>
      </main>
    );
  }

  if (gameFinished) {
    return (
      <main className="container">
        <section className="card">
          <h1>Game Finished</h1>

          <h2>{playerName}</h2>

          <p className="final-score">
            Score: {score}
          </p>

          <p>
            Correct answers: {correctAnswers}/
            {questions.length}
          </p>

          <h2>Leaderboard</h2>

          <div className="leaderboard">
            {leaderboard.length === 0 && (
              <p>No scores yet.</p>
            )}

            {leaderboard.map((player, index) => (
              <div
                className="leaderboard-row"
                key={`${player.playerName}-${index}`}
              >
                <span>
                  {index + 1}. {player.playerName}
                  <span className="player-code">
                    {player.playerCode}
                  </span>
                </span>

                <strong>{player.score}</strong>
              </div>
            ))}
          </div>

          <button onClick={restartGame}>
            Play Again
          </button>
        </section>
      </main>
    );
  }

  const currentQuestion =
    questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <main className="container">
        <section className="card">
          <p>Loading questions...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <div className="quiz-header">
          <span>
            Question {currentQuestionIndex + 1}/
            {questions.length}
          </span>

          <span className="timer">
            {timeLeft}s
          </span>
        </div>

        <h2>{currentQuestion.question}</h2>

        <div className="answers">
          {currentQuestion.options.map(
            (option, index) => (
              <button
                className="answer-button"
                key={option}
                onClick={() =>
                  answerQuestion(index)
                }
              >
                {option}
              </button>
            )
          )}
        </div>

        <p>Current score: {score}</p>
      </section>
    </main>
  );
}

export default App;