var config = require("dotenv").config();
var request = require("request");
var http = require("http");
var fs = require("fs");
var async = require("async");

function getRepoContributors(repoOwner, repoName, cb) {
    var options = {
        url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
        auth: {
            user: "jzhang729",
            pass: process.env.TOKEN
        },
        headers: {
            'User-Agent': 'request'
        }
    };
    request(options, cb);
}

function downloadImageByUrl () {

    getRepoContributors(process.argv[2], process.argv[3], (err, res) => {
        if (err) {
            console.log(err);
        } else {
            var results = JSON.parse(res.body);

            var data = results.map((chunk) => { return { url: chunk.avatar_url, login: chunk.login } });

            function writeFile (obj, callback) {
                request(obj.url)
                    .pipe(fs.createWriteStream(`${__dirname}/avatars/${obj.login}.jpg`))
                    .on("finish", () => callback())
                    .on("error", (err) => callback())
            }

            function done (err) {
                if (err) {
                    console.log("error: " + err);
                }
            }

            async.each(data, writeFile, done)
        }
    });
};

downloadImageByUrl();
