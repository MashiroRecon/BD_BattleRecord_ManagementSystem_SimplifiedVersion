const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('main.db');

app.set(`view engine`, `ejs`);
app.use(`/public`, express.static(__dirname + `/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(`/`, (req, res) => {
    const message = `Welcome to the BD BattleRecord Management SYSTEM`;
    res.render(`message`, { message: message });
});

app.get(`/list`, (req, res)=> {
    let sql = `
    select result.*, player1.name as player1, player2.name as player2,
    winner.name as winner
    from result
    left join player as player1 on result.player1_id = player1.id
    left join player as player2 on result.player2_id = player2.id
    left join player as winner on result.winner_id = winner.id;
    `
    db.serialize(() => {
        //database debug code
        /*db.all(`select * from result`, (error, rows) => {
            if (error) {
                console.log('ERROR: ', error);
                return;
            }
            for (let data of rows) {
                //console.log(data);
                console.log(data.id, data.date, data.rule, data.player1_id, data.player2_id, data.winner_id, data.player1_score, data.player2_score);
            }
        });
        db.all(`select id, name from player`, (error, rows) => {
            if (error) {
                console.log('ERROR: ', error);
                return;
            }
            for (let data of rows) {
                console.log(data.id, data.name);
            }
        });*/
        db.all(sql, (error, rows) => {
            if(error) {
                console.log('ERROR: ', error);
                return;
            }
            //console.log(rows);
            res.render(`list`, { data: rows });
        })
    })
});

app.get(`/result/:id`, (req, res) => {
    let sql = `
    select result.*, player1.name as player1, player2.name as player2,
    winner.name as winner
    from result
    left join player as player1 on result.player1_id = player1.id
    left join player as player2 on result.player2_id = player2.id
    left join player as winner on result.winner_id = winner.id
    where result.id = ${req.params.id};
    `
    db.serialize(() => {
        db.all(sql, (error, rows) => {
            if(error) {
                console.log('ERROR: ', error);
                return;
            }
            res.render(`result`, { data: rows[0] });
        })
    })
});

app.get(`/details/:id`, (req, res) => {
    let sql1 = `
    select * from player where id = ${req.params.id};
    `
    let sql2 = `
    select result.*, player1.name as player1, player2.name as player2,
    winner.name as winner
    from result
    left join player as player1 on result.player1_id = player1.id
    left join player as player2 on result.player2_id = player2.id
    left join player as winner on result.winner_id = winner.id
    where player1.id = ${req.params.id}
    or player2.id =${req.params.id} order by result.id desc limit 5;
    `
    db.serialize(() => {
        db.all(sql1, (error, rows) => {
            if(error) {
                console.log('ERROR: ', error);
                return;
            }
            db.all(sql2, (error, rows2) => {
                if(error) {
                    console.log('ERROR: ', error);
                    return;
                }
                res.render(`details`, { player: rows[0], match: rows2 });
            })
        })
    })
});

app.get(`/add/result`, (req, res) => {
    let sql = `select * from player;`
    db.serialize(() => {
        db.all(sql, (error, rows) => {
            if(error) {
                console.log('ERROR: ', error);
                return;
            }
            res.render(`add_result`, { data: rows });
        })
    })
});

app.post('/add/result/post', (req, res) => {

    //console.log(req.body);

    let winner_id = req.body.winner_id;
    if(winner_id == 1){
        winner_id = req.body.player1_id;
    }
    else if(winner_id == 2){
        winner_id = req.body.player2_id;
    }

    let sql=`
    insert into result (date, rule, player1_id, player2_id, winner_id,
        player1_score, player2_score)
        values ("${req.body.date}", "${req.body.rule}",${req.body.player1_id},
        ${req.body.player2_id}, ${winner_id},
        ${req.body.player1_score}, ${req.body.player2_score});
    `
    //console.log(sql);
    db.serialize(() => {
        db.run(sql, (error, row) => {
            //console.log(error);
            if(error){
                console.log('ERROR: ', error);
                return;
            }
            res.redirect('/list');
        })
    })
    //console.log(req.body);
});

app.use(function (req, res, next) {
    res.status(404).send('404 Not Found');
});

app.listen(8080,() => console.log(`Listening on port 8080`));
