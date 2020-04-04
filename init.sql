CREATE TABLE tweets (
  ID SERIAL PRIMARY KEY,
  created_at timestamp with time zone,
  id_str VARCHAR(255) NOT NULL,
  screen_name VARCHAR(255) NOT NULL,
  user_location VARCHAR(255),
  user_followers_count integer,
  tweet_text VARCHAR(512) NOT NULL,
  truncated boolean
);