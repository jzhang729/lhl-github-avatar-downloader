var config = require("dotenv").config();
var request = require("request");
var http = require("http");
var fs = require("fs");
var async = require("async");

function getRepoContributors(repoOwner, repoName, cb) {
    if (!repoOwner || !repoName) {
        throw new Error("Please supply valid arguments.\n");
    }

    var options = {
        url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
        auth: {
            user: process.env.USER,
            pass: process.env.TOKEN
        },
        headers: {
            'User-Agent': 'request'
        }
    };

    request(options, cb);
}

function createDirectory (directory) {
    var dirName = __dirname + "/" + directory;

    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
    }
}

function downloadImageByUrl () {

    try {
        getRepoContributors(process.argv[2], process.argv[3], (err, res) => {
            if (err) {
                console.log(err);
            } else {
                var results = JSON.parse(res.body);

                createDirectory("avatars");

                if (results.message !== "Not Found") {
                    console.log(`Downloading ${results.length} avatars.`);
                    var data = results.map((chunk) => { return { url: chunk.avatar_url, login: chunk.login } });
                    async.each(data, writeFile, done);
                } else {
                    console.log("No avatars could be downloaded at this time.");
                    done();
                }

                function writeFile (obj, callback) {
                    request(obj.url)
                        .pipe(fs.createWriteStream(`${__dirname}/avatars/${obj.login}.jpg`))
                        .on("error", (err) => callback())
                        .on("finish", () => callback())
                }

                function done (err, res) {
                    if (err) {
                        console.log("error: " + err);
                    }

                    console.log();

                    return;
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
};

downloadImageByUrl();
