const express = require("express");
require("dotenv").config;
const connection = require("./connection");

const app = express();
app.use(express.json());

app.get("/musics", (req, res) => {
  const id = req.query.id;
  const existsOnVinyl = req.query.existsOnVinyl;
  const created_time = req.query.created_time;
  const bpm = req.query.bpm;
  let sql = "SELECT * FROM track";
  const sqlValues = [];
  if (id && existsOnVinyl && created_time && bpm) {
    sql += " WHERE id = ?";
    sqlValues.push(id);
    sql += " AND existsOnVinyl = ?";
    sqlValues.push(existsOnVinyl);
    sql += " AND created_time = ?";
    sqlValues.push(created_time);
    sql += " AND bpm = ?";
    sqlValues.push(bpm);
  } else if (id) {
    sql += " WHERE id = ?";
    sqlValues.push(id);
  } else if (existsOnVinyl) {
    sql += " WHERE existsOnVinyl = ?";
    sqlValues.push(existsOnVinyl);
  } else if (created_time) {
    sql += " WHERE bpm = created_time";
    sqlValues.push(bpm);
  } else if (bpm) {
    sql += " WHERE bpm = ?";
    sqlValues.push(bpm);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      return res.status(500).json({ err: err.message, sql: err.sql });
    } else if (results.length === 0) {
      res.status(200).send("No tracks match");
    }
    return res.status(200).json(results);
  });
});

app.get("/musics/filteredBy/titleContains", (req, res) => {
  const letters = `%${req.query.letters}%`;
  connection.query(
    "SELECT * FROM track WHERE title LIKE ?",
    letters,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        res.status(200).send("No tracks match");
      }
      return res.status(200).json(results);
    }
  );
});

app.get("/musics/filteredBy/titleBeginsBy", (req, res) => {
  const letters = `${req.query.letters}%`;
  connection.query(
    "SELECT * FROM track WHERE title LIKE ?",
    letters,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        res.status(200).send("No tracks match");
      }
      return res.status(200).json(results);
    }
  );
});

app.get("/musics/filteredBy/titleEndsBy", (req, res) => {
  const letters = `%${req.query.letters}`;
  connection.query(
    "SELECT * FROM track WHERE title LIKE ?",
    letters,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        res.status(200).send("No tracks match");
      }
      return res.status(200).json(results);
    }
  );
});

app.get("/musics/filteredBy/bpm", (req, res) => {
  connection.query(
    "SELECT * FROM track WHERE bpm > ?",
    req.query.upTo,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        res.status(200).send("No tracks match");
      }
      return res.status(200).json(results);
    }
  );
});

app.get("/musics/filteredByTitle", (req, res) => {
  let sql = "";
  if (req.query.direction === "increasing") {
    sql += "SELECT * FROM track ORDER BY bpm ASC";
  } else if (req.query.direction === "decreasing") {
    sql += "SELECT * FROM track ORDER BY bpm DESC";
  } else {
    return res.status(404).send("wrong url");
  }
  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ err: err.message, sql: err.sql });
    } else if (results.length === 0) {
      res.status(200).send("No tracks match");
    }
    return res.status(200).json(results);
  });
});

app.post("/musics", (req, res) => {
  connection.query(
    "SELECT * FROM track WHERE title = ?",
    req.body.title,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length !== 0) {
        return res.status(422).send("This track is already in the DBB");
      }
      connection.query("INSERT INTO track SET ?", req.body, (err, results) => {
        if (err2) {
          return res.status(500).json({ err: err2.message, sql: err2.sql });
        }
        connection.query(
          "SELECT * FROM track WHERE id = ?",
          results2.insertId,
          (err3, results3) => {
            if (err3) {
              return res.status(500).json({ err: err3.message, sql: err3.sql });
            }
            res.status(201).json(results3[0]);
          }
        );
      });
    }
  );
});

app.put("/musics", (req, res) => {
  const id = req.body.id;
  connection.query(
    "UPDATE track SET ? WHERE id = ?",
    [req.body, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      }
      connection.query(
        "SELECT * FROM track WHERE id = ?",
        id,
        (err2, results2) => {
          if (err) {
            return res.status(500).json({ err: err.message, sql: err.sql });
          } else if (results2.length === 0) {
            return res.status(404).send("cannot find the track");
          }
          return res.status(200).json(results2);
        }
      );
    }
  );
});

app.put("/musics/:id/toggleExistsOnVinyl", (req, res) => {
  connection.query(
    "SELECT * FROM track WHERE id = ?",
    req.params.id,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        return res.status(404).send("cannot find the track");
      }
      let updatedExistsOnVinyl = results[0].existsOnVinyl;
      if (results[0].existsOnVinyl === 0) {
        updatedExistsOnVinyl += 1;
      } else {
        updatedExistsOnVinyl -= 1;
      }
      connection.query(
        "UPDATE track SET existsOnVinyl = ? WHERE id = ? ",
        [updatedExistsOnVinyl, req.params.id],
        (err2, results2) => {
          if (err2) {
            return res.status(500).json({ err: err2.message, sql: err2.sql });
          }
          connection.query(
            "SELECT * FROM track WHERE id = ?",
            req.params.id,
            (err3, results3) => {
              if (err3) {
                return res
                  .status(500)
                  .json({ err: err3.message, sql: err3.sql });
              }
              res.status(201).json(results3[0]);
            }
          );
        }
      );
    }
  );
});

app.delete("/musics/delete/:id", (req, res) => {
  connection.query(
    "SELECT * FROM track WHERE id = ?",
    req.params.id,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        return res.status(404).send("cannot find the track");
      }
      connection.query(
        "DELETE FROM track WHERE id = ?",
        req.params.id,
        (err2) => {
          if (err2) {
            return res.status(500).json({ err: err2.message, sql: err2.sql });
          }
          return res.status(200).send("the track has been deleted");
        }
      );
    }
  );
});

app.delete("/musics/deleteBy", (req, res) => {
  connection.query(
    "SELECT * FROM track WHERE existsOnVinyl = ?",
    req.query.existsOnVinyl,
    (err, results) => {
      if (err) {
        return res.status(500).json({ err: err.message, sql: err.sql });
      } else if (results.length === 0) {
        return res.status(404).send("cannot find the tracks");
      }
      connection.query(
        "DELETE FROM track WHERE existsOnVinyl = ?",
        req.query.existsOnVinyl,
        (err2) => {
          if (err2) {
            return res.status(500).json({ err: err2.message, sql: err2.sql });
          }
          return res.status(200).send("the tracks have been deleted");
        }
      );
    }
  );
});

module.exports = app;
