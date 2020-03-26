"use strict";

const path = require('path');
const Promise = require('bluebird');
const imageSize = require('image-size');
const recursive = require('recursive-readdir');
const fs = Promise.promisifyAll(require('fs-extra'));

const base_url = 'https://catsaretasty.github.io/emotes/';

const output_dir = './public/';

const emote_list = {emotes: {}};
const emote_list_full = {emotes: {}};
const emote_list_data = [];

function getEmoteFiles() {
    const deferred = Promise.defer();
    // ignore files that end with *.json
    recursive('./emotes', ['*.json'], (err, files) => {
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
    return fs.statAsync(`${f}.json`)
        .then(stat => stat.isFile())
        .catch(e => {
            if (e.code !== 'ENOENT') {
                console.error('metadata file error: ', e.code);
                process.exit(1);
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
    let metadata = {};

    if (alt_name_exists) {
        metadata = fs.readJsonAsync(`${file}.json`)
            .then(json => json);
    } else {
        metadata.name = path.parse(file).name;
    }

    return [file, metadata];
}

function makeEmoteLists(emotes) {
    for (let i = 0; i < emotes.length; i++) {
        const emote = {file: emotes[i][0], metadata: emotes[i][1]};

        let mainCategory;
        if ('mainCategory' in emote.metadata) {
            mainCategory = emote.metadata.mainCategory;
        } else {
            mainCategory = /[^/]*$/.exec(path.parse(emote.file).dir)[0];
        }

        let subCategories = [];
        if ('subCategories' in emote.metadata && Array.isArray(emote.metadata.subCategories)) {
            subCategories = emote.metadata.subCategories;
        }

        const dims = imageSize(emote.file);
        const emote_data = {
            name: emote.metadata.name.toString(),
            url: base_url + emote.file,
            height: dims.height,
            width: dims.width,
            mainCategory,
            subCategories
        };

        // default small payload is just a url string
        let payload = emote_data.url;
        addToEmoteList(emote_data.name, payload, emote_list);

        // full payload is an object containing more info, like file dimensions
        payload = emote_data;
        addToEmoteList(emote_data.name, payload, emote_list_full);

        emote_list_data.push(emote_data);

        fs.copyAsync(emote.file, output_dir + emote.file)
            .then(err => {
                if (err) {
                    console.error('Could not copy emote to public directory');
                    console.error(emote.file + ' had ' + err);
                    process.exit(1);
                }
            });
    }
    writeEmoteList(emote_list, 'emotes.json');
    writeEmoteList(emote_list_full, 'emotes-full.json');
    writeEmoteList(emote_list_data, 'emotes-data.json');

    return emote_list_data;
}

function addToEmoteList(name, payload, emote_list) {
    if(name === undefined) {
        console.error('Emote name was undefined!');
        process.exit(1);
    }
    if (name in emote_list.emotes) {
        console.error('Two emotes have the same name! They both tried to use: ' + name);
        process.exit(1);
    } else {
        emote_list.emotes[name] = payload;
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
                console.error('Could not write display file: ' + file);
                console.error('had error: ' + err);
                process.exit(1);
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
