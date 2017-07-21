var config = require("dotenv").config();
var request = require("request");
var fs = require("fs");

function getRepoContributors(repoOwner, repoName, cb) {
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

function downloadImageByUrl(url, filePath) {
    request(url)
        .on("error", function () {
            throw err;
        })
        .pipe(fs.createWriteStream(filePath));
}

function createDirectory (directory) {
    var dirName = __dirname + "/" + directory;

    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
    }
}

getRepoContributors(process.argv[2], process.argv[3], (err, res) => {
    if (err) {
        throw err;
    }

    var contributors = JSON.parse(res.body);

    if (contributors.message !== "Not Found") {
        createDirectory("avatars");

        var data = contributors.map((contributor) => {
            return { avatarUrl: contributor.avatar_url, login: contributor.login }
        });

        console.log(`Downloading ${data.length} avatars.`);

        data.forEach((chunk) => {
            return downloadImageByUrl(chunk.avatarUrl, `${__dirname}/avatars/${chunk.login}.jpg`);
        });
    } else {
        console.log("No avatars could be downloaded at this time.");
    }
});
