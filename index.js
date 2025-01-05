const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const port = 3000;


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }))


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
      original_url TEXT,
      short_url TEXT
    )`);
  });


app.get('/', (req, res) => {
    res.render("index", { short_url:null });
  });


app.get('/urls', (req, res) => {
    db.all('SELECT * FROM urls', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Error fetching URLs' });
        console.error(err);
      } else {
        res.json(rows);
      }
    });
});  

app.get('/:short_url', (req, res) => {
    const { short_url } = req.params;
  
    db.get('SELECT * FROM urls WHERE short_url = ?', [short_url], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching URL');
        console.error(err);
      } else if (row) {
        res.redirect(row.original_url);
      } else {
        res.status(404).send('Short URL not found');
      }
    });
});


app.post('/shorten', (req, res) => {
    const { original_url } = req.body;

    if (!original_url || original_url.trim() === "") {
        return res.status(400).json({ error: 'Original URL is required' });
    }
    
    try {
        new URL(original_url);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const short_url = shortid.generate();
  
    const stmt = db.prepare('INSERT INTO urls (short_url, original_url) VALUES (?, ?)');
    stmt.run(short_url, original_url, function (err) {
      if (err) {
        res.status(500).send('Error inserting URL');
        console.error(err);
      } else {
  res.render('index', { short_url });
      }
    });
  
    stmt.finalize();
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});