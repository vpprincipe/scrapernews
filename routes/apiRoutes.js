const request = require("request");
const mongoose = require('mongoose');
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function (app) {

    app.get('/articles', function (req, res) {
        axios.get("https://kotaku.com/").then(function(response) {
            const $ = cheerio.load(response.data);

            const results = [];

            $(".zone__item").each(function(i, element) {

                const link = $(element).find("a").attr("href");
                const title = $(element).children().text();
                const summary = $($(element).find("p.summary")[0]).text().trim();
                results.push({
                link: link,
                title: title,
                summary: summary
                });
                console.log(results)
            });

            db.Article.create(results)
                .then(function(dbArticle) {
                })
                .catch(function(err) {
                return res.json(err);
                });
                
            db.Article.find({}).then(function(dbData){
                console.log("DB DATA --------------------, ", dbData)
                res.json(dbData);
            });
        });

    });

    app.put("/save-article/:articleId", function(req, res) {
        db.Article.findByIdAndUpdate(req.params.articleId, {    $set: { saved: true }
        }).then(function(data) {
            res.json(data);
        });
    });

    app.get("/display-saved/", function(req, res) {
        db.Article.find( 
            { saved: true }
        ).then(function(data) {
            res.json(data);
        });
    });

    app.put("/delete-from-saved/:articleId", function(req, res) {
        db.Article.findByIdAndUpdate(req.params.articleId, {    $set: { saved: false }
        }).then(function(data) {
            res.json(data);
        });
    });

    app.post("/create-note/:articleId", function(req, res) {
        console.log(req.body);
        db.Note.create(req.body)
            .then(function(dbNote) {
                console.log(dbNote._id)
                return db.Article.findOneAndUpdate({_id: req.params.articleId}, { $push: { note: dbNote._id } }, { new: true });
            }).then(function(dbArticle) {
                res.json(dbArticle);
            }).catch(function(err) {
                res.json(err);
        });
    });

    app.get("/show-article-notes/:articleId", function(req, res) {
        db.Article.findById(req.params.articleId)
          .populate("note")
          .then(function(dbArticle) {
            res.json(dbArticle);
          })
          .catch(function(err) {
            res.json(err);
          });
      
      });

      app.delete("/delete-note/:noteId", function (req, res) {
        db.Note.findByIdAndRemove(req.params.noteId, (err, note) => {
            if (err) return res.status(500).send(err);
            return res.status(200).send();
        });

    });
        

};