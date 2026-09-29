CREATE DATABASE IF NOT EXISTS quiz_app;

USE quiz_app;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(500) NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CHECK (correct_answer BETWEEN 0 AND 3)
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    player_code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_game_results_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON DELETE CASCADE
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_results_score
    ON game_results(score DESC);

CREATE INDEX idx_game_results_player
    ON game_results(player_id);





INSERT INTO questions (
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer
)
VALUES
(
    'What does EC2 stand for?',
    'Elastic Compute Cloud',
    'Elastic Container Cloud',
    'External Compute Cloud',
    'Elastic Computer Cluster',
    0
),
(
    'Which AWS service is used for object storage?',
    'RDS',
    'S3',
    'EC2',
    'IAM',
    1
),
(
    'What is the main role of a Load Balancer?',
    'Store files',
    'Create users',
    'Distribute traffic between servers',
    'Create databases',
    2
),
(
    'Which AWS service provides managed relational databases?',
    'Lambda',
    'RDS',
    'CloudFront',
    'S3',
    1
),
(
    'Which AWS feature automatically changes the number of EC2 instances?',
    'Auto Scaling Group',
    'IAM',
    'CloudTrail',
    'S3',
    0
),
(
    'What is Terraform mainly used for?',
    'Writing frontend code',
    'Infrastructure as Code',
    'Managing databases only',
    'Creating quiz questions',
    1
),
(
    'Which AWS service manages users, roles, and permissions?',
    'IAM',
    'EC2',
    'VPC',
    'RDS',
    0
),
(
    'What is the purpose of a VPC?',
    'Store files',
    'Create an isolated virtual network',
    'Create React components',
    'Monitor application logs',
    1
),
(
    'Which protocol is commonly used for secure web traffic?',
    'FTP',
    'HTTP',
    'HTTPS',
    'SMTP',
    2
),
(
    'Which HTTP method is commonly used to create a resource?',
    'GET',
    'POST',
    'DELETE',
    'HEAD',
    1
),
(
    'Which React hook is used to manage component state?',
    'useFetch',
    'useState',
    'useServer',
    'useHTML',
    1
),
(
    'Which Git command sends local commits to GitHub?',
    'git clone',
    'git status',
    'git push',
    'git init',
    2
),
(
    'Which database engine is used in this quiz project?',
    'MongoDB',
    'MySQL',
    'Redis',
    'DynamoDB',
    1
),
(
    'What is the role of an API?',
    'Connect software components',
    'Create virtual machines',
    'Design CSS',
    'Store images locally',
    0
),
(
    'Which AWS component sends traffic to healthy EC2 instances?',
    'IAM Role',
    'Application Load Balancer',
    'S3 Bucket',
    'Route Table',
    1
);


-- Sample players
INSERT INTO players (player_name, player_code)
VALUES
('Alice', 'Alice#1001'),
('Bob', 'Bob#1002'),
('Charlie', 'Charlie#1003');

-- Sample game results
INSERT INTO game_results (
    player_id,
    score,
    correct_answers,
    total_questions
)
VALUES
(1, 1450, 15, 15),
(2, 1210, 13, 15),
(3, 980, 10, 15);