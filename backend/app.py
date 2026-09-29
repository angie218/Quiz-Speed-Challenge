import os
import random
import string

import pymysql
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_db_connection():
    """Create and return a new MySQL database connection."""
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )


def generate_player_code(player_name):
    """
    Create a unique player code such as Angel#4821.

    The function checks the database to make sure that the
    generated code does not already exist.
    """
    connection = None

    try:
        connection = get_db_connection()

        while True:
            random_number = "".join(
                random.choices(string.digits, k=4)
            )

            player_code = (
                f"{player_name.strip()}#{random_number}"
            )

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id
                    FROM players
                    WHERE player_code = %s
                    """,
                    (player_code,)
                )

                existing_player = cursor.fetchone()

            if not existing_player:
                return player_code

    finally:
        if connection:
            connection.close()


@app.get("/api/health")
def health():
    """
    Check that both the backend and database are available.
    """
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS database_status")
            cursor.fetchone()

        return jsonify({
            "status": "ok",
            "message": "Quiz backend is running",
            "database": "connected"
        })

    except Exception as error:
        print("Health check database error:", error)

        return jsonify({
            "status": "error",
            "message": "Backend is running",
            "database": "disconnected"
        }), 500

    finally:
        if connection:
            connection.close()


# =========================================================
# QUESTIONS
# =========================================================

@app.get("/api/questions")
def get_questions():
    """
    Read all quiz questions from the database.
    """
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    question_text,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer
                FROM questions
                ORDER BY id
                """
            )

            rows = cursor.fetchall()

        questions = [
            {
                "id": row["id"],
                "question": row["question_text"],
                "options": [
                    row["option_a"],
                    row["option_b"],
                    row["option_c"],
                    row["option_d"]
                ],
                "correctAnswer": row["correct_answer"]
            }
            for row in rows
        ]

        return jsonify(questions)

    except Exception as error:
        print("Failed to load questions:", error)

        return jsonify({
            "error": "Failed to load questions"
        }), 500

    finally:
        if connection:
            connection.close()


@app.post("/api/questions")
def create_question():
    """
    Create a new quiz question.
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    question_text = data.get("question")
    options = data.get("options")
    correct_answer = data.get("correctAnswer")

    if not question_text:
        return jsonify({
            "error": "question is required"
        }), 400

    if not isinstance(options, list) or len(options) != 4:
        return jsonify({
            "error": "options must contain exactly 4 answers"
        }), 400

    if not isinstance(correct_answer, int):
        return jsonify({
            "error": "correctAnswer must be an integer"
        }), 400

    if correct_answer < 0 or correct_answer > 3:
        return jsonify({
            "error": "correctAnswer must be between 0 and 3"
        }), 400

    if any(not str(option).strip() for option in options):
        return jsonify({
            "error": "All answer options are required"
        }), 400

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO questions
                (
                    question_text,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    question_text.strip(),
                    str(options[0]).strip(),
                    str(options[1]).strip(),
                    str(options[2]).strip(),
                    str(options[3]).strip(),
                    correct_answer
                )
            )

            question_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "message": "Question created successfully",
            "question": {
                "id": question_id,
                "question": question_text.strip(),
                "options": [
                    str(options[0]).strip(),
                    str(options[1]).strip(),
                    str(options[2]).strip(),
                    str(options[3]).strip()
                ],
                "correctAnswer": correct_answer
            }
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to create question:", error)

        return jsonify({
            "error": "Failed to create question"
        }), 500

    finally:
        if connection:
            connection.close()


@app.put("/api/questions/<int:question_id>")
def update_question(question_id):
    """
    Update an existing quiz question.
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    question_text = data.get("question")
    options = data.get("options")
    correct_answer = data.get("correctAnswer")

    if not question_text:
        return jsonify({
            "error": "question is required"
        }), 400

    if not isinstance(options, list) or len(options) != 4:
        return jsonify({
            "error": "options must contain exactly 4 answers"
        }), 400

    if not isinstance(correct_answer, int):
        return jsonify({
            "error": "correctAnswer must be an integer"
        }), 400

    if correct_answer < 0 or correct_answer > 3:
        return jsonify({
            "error": "correctAnswer must be between 0 and 3"
        }), 400

    if any(not str(option).strip() for option in options):
        return jsonify({
            "error": "All answer options are required"
        }), 400

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE questions
                SET
                    question_text = %s,
                    option_a = %s,
                    option_b = %s,
                    option_c = %s,
                    option_d = %s,
                    correct_answer = %s
                WHERE id = %s
                """,
                (
                    question_text.strip(),
                    str(options[0]).strip(),
                    str(options[1]).strip(),
                    str(options[2]).strip(),
                    str(options[3]).strip(),
                    correct_answer,
                    question_id
                )
            )

            if cursor.rowcount == 0:
                connection.rollback()

                return jsonify({
                    "error": "Question not found"
                }), 404

        connection.commit()

        return jsonify({
            "message": "Question updated successfully"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to update question:", error)

        return jsonify({
            "error": "Failed to update question"
        }), 500

    finally:
        if connection:
            connection.close()


@app.delete("/api/questions/<int:question_id>")
def delete_question(question_id):
    """
    Delete a quiz question.
    """
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM questions
                WHERE id = %s
                """,
                (question_id,)
            )

            if cursor.rowcount == 0:
                connection.rollback()

                return jsonify({
                    "error": "Question not found"
                }), 404

        connection.commit()

        return jsonify({
            "message": "Question deleted successfully"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to delete question:", error)

        return jsonify({
            "error": "Failed to delete question"
        }), 500

    finally:
        if connection:
            connection.close()


# =========================================================
# GAME RESULTS
# =========================================================

@app.post("/api/scores")
def save_score():
    """
    Create a player and save one game result.
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    player_name = data.get("playerName")
    score = data.get("score")
    correct_answers = data.get("correctAnswers", 0)
    total_questions = data.get("totalQuestions", 0)

    if not player_name or not player_name.strip():
        return jsonify({
            "error": "playerName is required"
        }), 400

    if not isinstance(score, int):
        return jsonify({
            "error": "score must be an integer"
        }), 400

    if not isinstance(correct_answers, int):
        return jsonify({
            "error": "correctAnswers must be an integer"
        }), 400

    if not isinstance(total_questions, int):
        return jsonify({
            "error": "totalQuestions must be an integer"
        }), 400

    if score < 0:
        return jsonify({
            "error": "score cannot be negative"
        }), 400

    if correct_answers < 0:
        return jsonify({
            "error": "correctAnswers cannot be negative"
        }), 400

    if total_questions < 0:
        return jsonify({
            "error": "totalQuestions cannot be negative"
        }), 400

    if correct_answers > total_questions:
        return jsonify({
            "error": (
                "correctAnswers cannot be greater than "
                "totalQuestions"
            )
        }), 400

    clean_player_name = player_name.strip()
    player_code = generate_player_code(clean_player_name)

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO players
                (
                    player_name,
                    player_code
                )
                VALUES (%s, %s)
                """,
                (
                    clean_player_name,
                    player_code
                )
            )

            player_id = cursor.lastrowid

            cursor.execute(
                """
                INSERT INTO game_results
                (
                    player_id,
                    score,
                    correct_answers,
                    total_questions
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    player_id,
                    score,
                    correct_answers,
                    total_questions
                )
            )

            result_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "message": "Score saved successfully",
            "result": {
                "id": result_id,
                "playerId": player_id,
                "playerName": clean_player_name,
                "playerCode": player_code,
                "score": score,
                "correctAnswers": correct_answers,
                "totalQuestions": total_questions
            }
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to save score:", error)

        return jsonify({
            "error": "Failed to save score"
        }), 500

    finally:
        if connection:
            connection.close()


@app.get("/api/leaderboard")
def leaderboard():
    """
    Return the ten highest game results.
    """
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    p.player_name AS playerName,
                    p.player_code AS playerCode,
                    gr.score,
                    gr.correct_answers AS correctAnswers,
                    gr.total_questions AS totalQuestions,
                    gr.played_at AS playedAt
                FROM game_results gr
                INNER JOIN players p
                    ON gr.player_id = p.id
                ORDER BY
                    gr.score DESC,
                    gr.correct_answers DESC,
                    gr.played_at ASC
                LIMIT 10
                """
            )

            results = cursor.fetchall()

        return jsonify(results)

    except Exception as error:
        print("Failed to load leaderboard:", error)

        return jsonify({
            "error": "Failed to load leaderboard"
        }), 500

    finally:
        if connection:
            connection.close()


@app.get("/api/results")
def get_results():
    """
    Return all game results.

    This endpoint is useful for testing and demonstrating
    database reading during the project presentation.
    """
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    gr.id,
                    p.player_name AS playerName,
                    p.player_code AS playerCode,
                    gr.score,
                    gr.correct_answers AS correctAnswers,
                    gr.total_questions AS totalQuestions,
                    gr.played_at AS playedAt
                FROM game_results gr
                INNER JOIN players p
                    ON gr.player_id = p.id
                ORDER BY gr.played_at DESC
                """
            )

            results = cursor.fetchall()

        return jsonify(results)

    except Exception as error:
        print("Failed to load results:", error)

        return jsonify({
            "error": "Failed to load results"
        }), 500

    finally:
        if connection:
            connection.close()



@app.get("/api/admin/stats")
def admin_stats():
    """Return summary data for the admin dashboard."""
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total_questions FROM questions")
            question_stats = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) AS total_players FROM players")
            player_stats = cursor.fetchone()

            cursor.execute(
                """
                SELECT
                    COUNT(*) AS total_games,
                    COALESCE(MAX(score), 0) AS highest_score
                FROM game_results
                """
            )
            game_stats = cursor.fetchone()

        return jsonify({
            "totalQuestions": question_stats["total_questions"],
            "totalPlayers": player_stats["total_players"],
            "totalGames": game_stats["total_games"],
            "highestScore": game_stats["highest_score"]
        })

    except Exception as error:
        print("Failed to load admin stats:", error)

        return jsonify({
            "error": "Failed to load dashboard statistics"
        }), 500

    finally:
        if connection:
            connection.close()


@app.delete("/api/results/<int:result_id>")
def delete_result(result_id):
    """Delete one game result and remove its player if unused."""
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT player_id
                FROM game_results
                WHERE id = %s
                """,
                (result_id,)
            )

            result = cursor.fetchone()

            if not result:
                return jsonify({
                    "error": "Game result not found"
                }), 404

            player_id = result["player_id"]

            cursor.execute(
                """
                DELETE FROM game_results
                WHERE id = %s
                """,
                (result_id,)
            )

            cursor.execute(
                """
                SELECT COUNT(*) AS result_count
                FROM game_results
                WHERE player_id = %s
                """,
                (player_id,)
            )

            remaining_results = cursor.fetchone()

            if remaining_results["result_count"] == 0:
                cursor.execute(
                    """
                    DELETE FROM players
                    WHERE id = %s
                    """,
                    (player_id,)
                )

        connection.commit()

        return jsonify({
            "message": "Game result deleted successfully"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to delete game result:", error)

        return jsonify({
            "error": "Failed to delete game result"
        }), 500

    finally:
        if connection:
            connection.close()


@app.delete("/api/results")
def delete_all_results():
    """Delete all game results and all player records."""
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM game_results")
            deleted_results = cursor.rowcount

            cursor.execute("DELETE FROM players")
            deleted_players = cursor.rowcount

        connection.commit()

        return jsonify({
            "message": "All game results deleted successfully",
            "deletedResults": deleted_results,
            "deletedPlayers": deleted_players
        })

    except Exception as error:
        if connection:
            connection.rollback()

        print("Failed to delete all results:", error)

        return jsonify({
            "error": "Failed to delete all results"
        }), 500

    finally:
        if connection:
            connection.close()



if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3010,
        debug=False
    )
