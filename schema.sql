-- Kingdom Crew Fellowship — database schema (TiDB Cloud / MySQL-compatible)
-- Run this once in the TiDB Cloud "SQL Editor" (or any MySQL client).

CREATE DATABASE IF NOT EXISTS kingdom_crew;
USE kingdom_crew;

-- Messages sent from the Contact page.
-- Beginner note: every row is one message. "status" lets leaders track replies.
CREATE TABLE IF NOT EXISTS inquiries (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  category    VARCHAR(40)   NOT NULL DEFAULT 'general',
  subject     VARCHAR(150)  NOT NULL,
  message     TEXT          NOT NULL,
  consent     TINYINT(1)    NOT NULL DEFAULT 0,
  status      ENUM('new','answered','archived') NOT NULL DEFAULT 'new',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inquiries_status (status, created_at)
);

-- Events published by fellowship leaders.
CREATE TABLE IF NOT EXISTS events (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  starts_at   DATETIME     NOT NULL,
  ends_at     DATETIME     NULL,
  venue       VARCHAR(150),
  category    VARCHAR(40)  DEFAULT 'fellowship',
  poster_url  VARCHAR(300),
  is_published TINYINT(1)  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_start (is_published, starts_at)
);

-- DEMO DATA (clearly marked, safe to delete). Real events: add your own rows.
INSERT INTO events (title, description, starts_at, ends_at, venue, category, is_published)
SELECT 'DEMO: Sunday Fellowship Gathering',
       'Sample row showing how events appear on the website. Replace or delete it.',
       '2030-01-06 16:30:00', '2030-01-06 19:00:00',
       'Former Exam Hall, UNILAK Rwamagana Campus', 'fellowship', 1
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title LIKE 'DEMO:%');
