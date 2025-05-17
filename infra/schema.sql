CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  preferences JSON
);

CREATE TABLE menus (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  menu_date DATE,
  content JSON
);
