const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

const networkInterfaces = os.networkInterfaces();
let ipAddress = '';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    var userInput = req.query.id;
    var filename = req.query.fn;

    fs.readdir(userInput, function (err, files) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading directory');
        }

        const items = files.map(item => {
            console.log(item);
            return item;
        });

        exec('pwd', (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            }
            const currentDirectory = stdout.trim();

            if (filename && files.includes(filename)) {
                fs.readFile('./' + filename, 'utf-8', (readError, fileContents) => {
                    if (readError) {
                        console.error(readError);
                        return;
                    }

                    for (const interfaceName in networkInterfaces) {
                        const interfaceArray = networkInterfaces[interfaceName];
                        for (const iface of interfaceArray) {
                            if (iface.family === 'IPv4' && !iface.internal) {
                                ipAddress = iface.address;
                                break;
                            }
                        }
                        if (ipAddress) {
                            break;
                        }
                    }

                    res.render('index', { rend: items, currentDir: currentDirectory, fileContent: fileContents, iprend: ipAddress });
                });
            } else {
                for (const interfaceName in networkInterfaces) {
                    const interfaceArray = networkInterfaces[interfaceName];
                    for (const iface of interfaceArray) {
                        if (iface.family === 'IPv4' && !iface.internal) {
                            ipAddress = iface.address;
                            break;
                        }
                    }
                    if (ipAddress) {
                        break;
                    }
                }


                res.render('index', { rend: items, currentDir: currentDirectory, fileContent: '', iprend: ipAddress });
            }
        });
    });
});

app.listen(3000, function () {
    console.log('server started');
});
