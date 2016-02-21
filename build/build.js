"use strict";

const path = require('path');
const Promise = require('bluebird');
const imageSize = require('image-size');
const recursive = require('recursive-readdir');
const fs = Promise.promisifyAll(require('fs-extra'));

const base_url = 'https://emotes.tastycat.org/';

const output_dir = './public/';

const emote_list = {emotes: {}};
const emote_list_full = {emotes: {}};
const emote_list_data = [];

function getEmoteFiles() {
    const deferred = Promise.defer();
    // ignore files that end with *.txt
    recursive('./emotes', ['*.txt'], (err, files) => {
        deferred.resolve(files);
    });
    return deferred.promise;
}

function matchEmoteAltnames(files) {
    const promises = [];
    for (let i = 0; i < files.length; i++) {
        const f = Promise.try(file => file, files[i]);

        promises.push(f.then(f => Promise.all([f, doesFileExist(f)])));
    }
    return Promise.all(promises);
}

function doesFileExist(f) {
    return fs.statAsync(`${f}.txt`)
        .then(stat => stat.isFile())
        .catch(e => {
            if (e.code !== 'ENOENT') {
                console.error('file error: ', e.code)
            }
            return false;
        })
}

function getEmotes(emote_promises) {
    const promises = [];
    for (let i = 0; i < emote_promises.length; i++) {
        const emote_promise = emote_promises[i];
        promises.push(Promise.all(getEmote(emote_promise[0], emote_promise[1])))
    }
    return Promise.all(promises);
}

function getEmote(file, alt_name_exists) {
    const name = alt_name_exists ? fs.readFileAsync(`${file}.txt`) : path.parse(file).name;
    return [file, name];
}

function makeEmoteLists(emotes) {
    for (let i = 0; i < emotes.length; i++) {
        const emote = {file: emotes[i][0], name: emotes[i][1].toString()};

        // default small payload is just a url string
        emote.payload = base_url + emote.file;
        addToEmoteList(emote, emote_list);

        // full payload is an object containing more info, like file dimensions
        const dims = imageSize(emote.file);
        emote.payload = {url: emote.payload, height: dims.height, width: dims.width};
        addToEmoteList(emote, emote_list_full);

        const emote_data = {
            name: emote.name,
            url: base_url + emote.file,
            height: dims.height,
            width: dims.width
        };

        emote_list_data.push(emote_data);

        fs.copyAsync(emote.file, output_dir + emote.file)
            .then(err => {
                if (err) {
                    console.error(err);
                }
            });
    }
    writeEmoteList(emote_list, 'emotes.json');
    writeEmoteList(emote_list_full, 'emotes-full.json');
    writeEmoteList(emote_list_data, 'emotes-data.json');

    return emote_list_data;
}

function addToEmoteList(emote, emote_list) {
    if (emote.name in emote_list.emotes) {
        console.error('Two emotes have the same name!')
    } else {
        emote_list.emotes[emote.name] = emote.payload;
    }
}

function makeEmoteDisplayPage(emotes) {
    const jade = require('jade');

    const css = fs.readFileSync(`${output_dir}emotes.css`);
    const display = jade.renderFile('app/index.jade', {emotes, css});
    const noscript_display = jade.renderFile('app/noscript.jade', {emotes, css});

    writePublicFile('index.html', display);
    writePublicFile('noscript/index.html', noscript_display);

    return display;
}

function writeEmoteList(emote_list, output_name) {
    return fs.outputJsonAsync(output_dir + output_name, emote_list, {spaces: 0})
}

var writePublicFile = (file, content) => {
    fs.outputFileAsync(output_dir + file, content)
        .then(err => {
            if (err) {
                console.error(err);
            }
            console.log(`wrote ${output_dir}${file}!`);
        });
};

fs.ensureDirAsync(output_dir)
    .then(getEmoteFiles)
    .then(matchEmoteAltnames)
    .then(getEmotes)
    .then(makeEmoteLists)
    .then(makeEmoteDisplayPage);