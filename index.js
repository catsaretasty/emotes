var FS = require('q-io/fs');
var path = require('path');
var recursive = require('recursive-readdir');
var handlebars = require('handlebars');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var sizeOf = require('image-size');

var base_url = 'https://emotes.tastycat.org/';

var output_dir = './public/';

var emote_list = {emotes: {}};
var emote_list_full = {emotes: {}};

function getEmoteFiles() {
    var deferred = Promise.defer();
    // ignore files that end with *.txt
    recursive('./emotes', ['*.txt'], function (err, files) {
        deferred.resolve(files);
    });
    return deferred.promise;
}

function matchEmoteAltnames(files) {
    var promises = [];
    for (var i = 0; i < files.length; i++) {
        var f = Promise.try(function (file) {
            return file;
        }, files[i]);

        //console.log(f + ' - ' + f + '.txt')

        promises.push(f.then(function (f) {
            return Promise.all([f, FS.exists(f + '.txt')]);
        }));
    }
    return Promise.all(promises);
}

function getEmotes(emote_promises) {
    var promises = [];
    for (var i = 0; i < emote_promises.length; i++) {
        var emote_promise = emote_promises[i];
        promises.push(Promise.all(getEmote(emote_promise[0], emote_promise[1])))
    }
    return Promise.all(promises);
}

function getEmote(file, alt_name_exists) {
    var name;
    if (alt_name_exists) {
        name = fs.readFileAsync(file + '.txt')
    } else {
        name = Promise.try(function (name) {
            return name;
        }, path.parse(file).name);
    }

    file = Promise.try(function (file) {
        return file;
    }, file);

    return [file, name];
}

function makeEmoteLists(emotes) {
    for (var i = 0; i < emotes.length; i++) {
        var emote = {file: emotes[i][0], name: emotes[i][1]};

        // default small payload is just a url string
        emote.payload = base_url + emote.file;
        addToEmoteList(emote, emote_list);

        // full payload is an object containing more info, like file dimensions
        var dims = sizeOf(emote.file);
        emote.payload = {url: emote.payload, height: dims.height, width: dims.width};
        addToEmoteList(emote, emote_list_full);

        fs.copyAsync(emote.file, output_dir + emote.file).then(function (err) {
            if (err) {
                console.error(err);
            }
        });
    }
    writeEmoteList(emote_list, 'emotes.json');
    writeEmoteList(emote_list_full, 'emotes-full.json');

    return Promise.try(function (emote_list) {
        return emote_list;
    }, emote_list);
}

function addToEmoteList(emote, emote_list) {
    if (emote.name in emote_list.emotes) {
        console.error('Two emotes have the same name!')
    } else {
        emote_list.emotes[emote.name] = emote.payload;
    }
}

function writeEmoteList(emote_list, output_name) {
    return fs.outputJsonAsync(output_dir + output_name, emote_list, {spaces: 0})
}

fs.ensureDirAsync(output_dir)
    .then(getEmoteFiles)
    .then(matchEmoteAltnames)
    .then(getEmotes)
    .then(makeEmoteLists)
    .then(makeEmoteDisplayPage);

function makeEmoteDisplayPage(emotes) {
    var hbs = fs.readFileSync('index.hbs');

    var template = handlebars.compile(hbs.toString());
    fs.outputFileAsync(output_dir + 'index.html', template({emotes: emotes.emotes}))
        .then(function (err) {
            if (err) {
                console.error(err);
            }
            console.log('wrote display page!');
        });

}

//var file = fs.readFileSync('index.hbs');
//
//var template = handlebars.compile(file.toString());
//console.log(template({emotes: emote_list.emotes}));