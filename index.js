const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const port = 3000;


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));


const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });
  
  app.use(express.json());
  
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_URL TEXT,
      short_URL TEXT
    )`);
  });

  
app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

app.get('/:shortURL', (req, res) => {
    res.render("shortURL");
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});