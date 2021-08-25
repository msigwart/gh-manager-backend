-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE IF NOT EXISTS registered_user (
  id                        SERIAL PRIMARY KEY,
  username                  VARCHAR(255) NOT NULL UNIQUE,
  created_on                TIMESTAMP    NOT NULL,
  updated_on                TIMESTAMP    NOT NULL,
  data                      JSON         NOT NULL
);

CREATE TABLE IF NOT EXISTS user_session (
  id                        BIGSERIAL PRIMARY KEY,
  session_id                VARCHAR(255) NOT NULL UNIQUE,
  created_on                TIMESTAMP   NOT NULL,
  last_accessed_on          TIMESTAMP   NOT NULL,
  user_id                   INTEGER     NOT NULL REFERENCES registered_user (id)
);

CREATE TABLE IF NOT EXISTS repo (
  id                        SERIAL PRIMARY KEY,
  github_id                 BIGINT NOT NULL UNIQUE,
  full_name                 VARCHAR(255) NOT NULL UNIQUE,
  name                      VARCHAR(255) NOT NULL,
  data                      JSON NOT NULL,
  created_on                TIMESTAMP    NOT NULL,
  updated_on                TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS repo_user (
  repo_id     INTEGER NOT NULL REFERENCES repo(id),
  user_id     INTEGER NOT NULL REFERENCES registered_user(id),
  is_followed BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (repo_id, user_id)
);

CREATE TABLE IF NOT EXISTS issue (
  id         SERIAL PRIMARY KEY,
  github_id  BIGINT NOT NULL UNIQUE,
  created_on TIMESTAMP NOT NULL,
  updated_on TIMESTAMP NOT NULL,
  repo_id    INTEGER NOT NULL REFERENCES repo(id),
  data       JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS pull_request (
  id         SERIAL PRIMARY KEY,
  github_id  BIGINT NOT NULL UNIQUE,
  created_on TIMESTAMP NOT NULL,
  updated_on TIMESTAMP NOT NULL,
  repo_id    INTEGER NOT NULL REFERENCES repo(id),
  data       JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS review (
  id            SERIAL PRIMARY KEY,
  github_id     BIGINT NOT NULL UNIQUE,
  submitted_on  TIMESTAMP NOT NULL,
  pull_id       INTEGER NOT NULL REFERENCES pull_request(id),
  data          JSON NOT NULL
);


CREATE UNIQUE INDEX user_session_ix1 ON user_session (session_id);
CREATE UNIQUE INDEX registered_user_ix1 ON registered_user (username);
CREATE UNIQUE INDEX repo_ix1 ON repo (full_name);
CREATE UNIQUE INDEX repo_ix2 ON repo (github_id);
CREATE UNIQUE INDEX issue_ix1 ON issue (github_id);
CREATE UNIQUE INDEX pull_request_ix1 ON pull_request (github_id);
CREATE UNIQUE INDEX review_ix1 ON review (github_id);
