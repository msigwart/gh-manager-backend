-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE IF NOT EXISTS registered_user (
  id                        SERIAL PRIMARY KEY,
  username                  VARCHAR(255) NOT NULL UNIQUE,
  created_on                TIMESTAMP    NOT NULL,
  updated_on                TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS user_session (
  id                        BIGSERIAL PRIMARY KEY,
  session_id                VARCHAR(255) NOT NULL UNIQUE,
  created_on                TIMESTAMP   NOT NULL,
  last_accessed_on          TIMESTAMP   NOT NULL,
  user_id                   INTEGER     NOT NULL REFERENCES registered_user (id)
);

CREATE UNIQUE INDEX user_session_ix1 ON user_session (session_id);
CREATE UNIQUE INDEX registered_user_ix1 ON registered_user (username);
