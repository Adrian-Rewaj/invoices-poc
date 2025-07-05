-- Tworzenie tabel
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    nip VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER REFERENCES users(id),
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB NOT NULL
);

-- Dodanie domyślnego użytkownika: dev/dev (hasło: dev, hash bcrypt)
INSERT INTO users (username, password_hash) VALUES ('dev', '$2a$10$iPn0tr3Mlv8SV3dl.4Vg6eOaxqybJtew0gslKOWi/ZU0C4lSFD8d2');
-- Hasło: dev

-- Dodanie przykładowego klienta
INSERT INTO clients (name, email, nip) VALUES ('Jan Kowalski', 'jan.kowalski@example.com', '1234567890');
