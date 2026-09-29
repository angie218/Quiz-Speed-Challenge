import { useCallback, useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "/api";

const EMPTY_FORM = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

function AdminDashboard() {
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalPlayers: 0,
    totalGames: 0,
    highestScore: 0,
  });

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingQuestionId, setEditingQuestionId] =
    useState(null);

  const [activeSection, setActiveSection] =
    useState("questions");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    window.setTimeout(() => {
      setError("");
    }, 4000);
  };

  const loadQuestions = useCallback(async () => {
    const response = await fetch(`${API_URL}/questions`);

    if (!response.ok) {
      throw new Error("Failed to load questions");
    }

    const data = await response.json();
    setQuestions(data);
  }, []);

  const loadResults = useCallback(async () => {
    const response = await fetch(`${API_URL}/results`);

    if (!response.ok) {
      throw new Error("Failed to load game results");
    }

    const data = await response.json();
    setResults(data);
  }, []);

  const loadStats = useCallback(async () => {
    const response = await fetch(`${API_URL}/admin/stats`);

    if (!response.ok) {
      throw new Error("Failed to load dashboard statistics");
    }

    const data = await response.json();
    setStats(data);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadQuestions(),
        loadResults(),
        loadStats(),
      ]);
    } catch (loadError) {
      console.error(loadError);
      showError("Could not load the dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [loadQuestions, loadResults, loadStats]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleQuestionChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      question: event.target.value,
    }));
  };

  const handleOptionChange = (optionIndex, value) => {
    setFormData((previous) => {
      const updatedOptions = [...previous.options];
      updatedOptions[optionIndex] = value;

      return {
        ...previous,
        options: updatedOptions,
      };
    });
  };

  const handleCorrectAnswerChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      correctAnswer: Number(event.target.value),
    }));
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });

    setEditingQuestionId(null);
  };

  const validateForm = () => {
    if (!formData.question.trim()) {
      showError("Please enter the question.");
      return false;
    }

    const hasEmptyOption = formData.options.some(
      (option) => !option.trim()
    );

    if (hasEmptyOption) {
      showError("Please fill in all four answer options.");
      return false;
    }

    return true;
  };

  const saveQuestion = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const isEditing = editingQuestionId !== null;

    const url = isEditing
      ? `${API_URL}/questions/${editingQuestionId}`
      : `${API_URL}/questions`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: formData.question.trim(),
          options: formData.options.map((option) =>
            option.trim()
          ),
          correctAnswer: formData.correctAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save question"
        );
      }

      resetForm();

      await Promise.all([
        loadQuestions(),
        loadStats(),
      ]);

      showMessage(
        isEditing
          ? "Question updated successfully."
          : "Question added successfully."
      );
    } catch (saveError) {
      console.error(saveError);
      showError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditingQuestion = (question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });

    setEditingQuestionId(question.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteQuestion = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete question"
        );
      }

      if (editingQuestionId === questionId) {
        resetForm();
      }

      await Promise.all([
        loadQuestions(),
        loadStats(),
      ]);

      showMessage("Question deleted successfully.");
    } catch (deleteError) {
      console.error(deleteError);
      showError(deleteError.message);
    }
  };

  const deleteResult = async (resultId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game result?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/results/${resultId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete result"
        );
      }

      await Promise.all([
        loadResults(),
        loadStats(),
      ]);

      showMessage("Game result deleted successfully.");
    } catch (deleteError) {
      console.error(deleteError);
      showError(deleteError.message);
    }
  };

  const clearAllResults = async () => {
    const confirmed = window.confirm(
      "Delete all game results? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/results`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to clear results"
        );
      }

      await Promise.all([
        loadResults(),
        loadStats(),
      ]);

      showMessage("All game results were deleted.");
    } catch (deleteError) {
      console.error(deleteError);
      showError(deleteError.message);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown";
    }

    return new Date(dateValue).toLocaleString();
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">Q</div>

          <div>
            <h1>Quiz Admin</h1>
            <p>Cloud Control Center</p>
          </div>
        </div>

        <nav className="admin-navigation">
          <button
            className={
              activeSection === "questions"
                ? "admin-nav-button active"
                : "admin-nav-button"
            }
            onClick={() =>
              setActiveSection("questions")
            }
          >
            <span>?</span>
            Questions
          </button>

          <button
            className={
              activeSection === "results"
                ? "admin-nav-button active"
                : "admin-nav-button"
            }
            onClick={() => setActiveSection("results")}
          >
            <span>🏆</span>
            Game Results
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="back-to-game-link">
            ← Back to Quiz
          </a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">
              AWS Cloud Project
            </p>

            <h2>Admin Dashboard</h2>

            <p>
              Manage quiz questions and inspect data
              stored in the database.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </header>

        {message && (
          <div className="admin-alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-alert error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">
              Questions
            </span>

            <strong>{stats.totalQuestions}</strong>

            <small>Stored in MySQL</small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Players
            </span>

            <strong>{stats.totalPlayers}</strong>

            <small>Unique player records</small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Games Played
            </span>

            <strong>{stats.totalGames}</strong>

            <small>Saved game results</small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Highest Score
            </span>

            <strong>{stats.highestScore}</strong>

            <small>Current leaderboard peak</small>
          </article>
        </section>

        {loading ? (
          <section className="admin-panel loading-panel">
            <div className="admin-loader" />
            <p>Loading data from the database...</p>
          </section>
        ) : (
          <>
            {activeSection === "questions" && (
              <section className="questions-section">
                <form
                  className="admin-panel question-form"
                  onSubmit={saveQuestion}
                >
                  <div className="panel-heading">
                    <div>
                      <p className="panel-label">
                        Question Editor
                      </p>

                      <h3>
                        {editingQuestionId
                          ? `Edit Question #${editingQuestionId}`
                          : "Add New Question"}
                      </h3>
                    </div>

                    {editingQuestionId && (
                      <button
                        type="button"
                        className="cancel-edit-button"
                        onClick={resetForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <label className="admin-field">
                    <span>Question</span>

                    <textarea
                      value={formData.question}
                      onChange={handleQuestionChange}
                      placeholder="Enter the quiz question"
                      rows="3"
                    />
                  </label>

                  <div className="options-grid">
                    {formData.options.map(
                      (option, index) => (
                        <label
                          className="admin-field"
                          key={index}
                        >
                          <span>
                            Option{" "}
                            {String.fromCharCode(65 + index)}
                          </span>

                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              handleOptionChange(
                                index,
                                event.target.value
                              )
                            }
                            placeholder={`Answer option ${String.fromCharCode(
                              65 + index
                            )}`}
                          />
                        </label>
                      )
                    )}
                  </div>

                  <label className="admin-field">
                    <span>Correct Answer</span>

                    <select
                      value={formData.correctAnswer}
                      onChange={handleCorrectAnswerChange}
                    >
                      {formData.options.map(
                        (option, index) => (
                          <option
                            value={index}
                            key={index}
                          >
                            Option{" "}
                            {String.fromCharCode(65 + index)}
                            {option
                              ? `: ${option}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="save-question-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingQuestionId
                        ? "Update Question"
                        : "Add Question"}
                  </button>
                </form>

                <section className="admin-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="panel-label">
                        Database Records
                      </p>

                      <h3>
                        Questions ({questions.length})
                      </h3>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="empty-state">
                      <h4>No questions found</h4>
                      <p>
                        Add the first question using the
                        form above.
                      </p>
                    </div>
                  ) : (
                    <div className="questions-list">
                      {questions.map((question) => (
                        <article
                          className="question-row"
                          key={question.id}
                        >
                          <div className="question-number">
                            {question.id}
                          </div>

                          <div className="question-information">
                            <h4>{question.question}</h4>

                            <div className="question-options">
                              {question.options.map(
                                (option, index) => (
                                  <span
                                    className={
                                      index ===
                                      question.correctAnswer
                                        ? "question-option correct"
                                        : "question-option"
                                    }
                                    key={`${question.id}-${index}`}
                                  >
                                    {String.fromCharCode(
                                      65 + index
                                    )}
                                    . {option}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="row-actions">
                            <button
                              className="edit-button"
                              onClick={() =>
                                startEditingQuestion(
                                  question
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteQuestion(
                                  question.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </section>
            )}

            {activeSection === "results" && (
              <section className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-label">
                      Database Records
                    </p>

                    <h3>
                      Game Results ({results.length})
                    </h3>
                  </div>

                  {results.length > 0 && (
                    <button
                      className="clear-results-button"
                      onClick={clearAllResults}
                    >
                      Clear All Results
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="empty-state">
                    <h4>No game results yet</h4>

                    <p>
                      Results will appear after players
                      complete the quiz.
                    </p>
                  </div>
                ) : (
                  <div className="results-table-wrapper">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Player</th>
                          <th>Code</th>
                          <th>Score</th>
                          <th>Correct</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {results.map((result) => (
                          <tr key={result.id}>
                            <td>{result.id}</td>

                            <td>{result.playerName}</td>

                            <td>
                              <span className="player-code">
                                {result.playerCode}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {result.score}
                              </strong>
                            </td>

                            <td>
                              {result.correctAnswers}/
                              {result.totalQuestions}
                            </td>

                            <td>
                              {formatDate(
                                result.playedAt
                              )}
                            </td>

                            <td>
                              <button
                                className="delete-button compact"
                                onClick={() =>
                                  deleteResult(
                                    result.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;