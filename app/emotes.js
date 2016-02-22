"use strict";

import Blazy from 'blazy';

let bLazy;

var App = {
    init: function init() {
        var request = new XMLHttpRequest();
        request.open('GET', 'emotes.json', true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                createEmoteElements(JSON.parse(this.response))
            } else {
                const msg = 'unable to retrieve emotes from /emotes.json';
                console.error(msg);
                setEmoteLoadingError(msg);
            }
        };

        request.onerror = function () {
            const msg = 'unable to connect to emotes server to fetch /emotes.json';
            console.error(msg);
            setEmoteLoadingError(msg);
        };

        request.send();
    }
};

function setEmoteLoadingError(msg) {
    const loading = document.querySelector('#loading');
    loading.classList.add('error');
    loading.children[0].textContent = msg;
}

function createEmoteElements(emote_json) {
    const emotes = renderEmotes(emote_json);
    const emote_list_parent = document.querySelector('#emotes');
    const search = createSearchBox(document.querySelector('#search-box'));

    search.oninput = () => {
        emotes.map(emote => {
            if (hasSubstring(emote.name, search.value)) {
                emote.el.style.display = 'flex';
            } else {
                emote.el.style.display = 'none';
            }
        });

        emote_list_parent.style.justifyContent = (search.value) ? 'center' : 'space-between';
        bLazy.revalidate();
    };
}

const hasSubstring = (s, f) => s.toLowerCase().indexOf(f.toLowerCase()) > -1;

function createSearchBox(parent) {
    let search = document.createElement('input');
    search.id = 'search';
    search.type = 'text';
    search.placeholder = 'search emotes';
    search.onkeydown = event => {
        // hitting escape should clear input
        if (event.which == 27) {
            search.value = '';
            search.oninput();
        }
    };

    return parent.appendChild(search);
}

function renderEmotes(emote_data) {
    const emotes = emote_data.emotes;
    let loader = document.querySelector('.loader');
    let container = document.querySelector('#emotes');
    let domDone = new Array(Object.keys(emote_data.emotes).length);
    let loadingImageLoaded = false;
    let domDoneIndex = 0;
    let list = [];

    // fill array with false values
    for (var i = 0; i < domDone.length; i++) {
        domDone[i] = false;
    }

    for (let key in emotes) {
        if (emotes.hasOwnProperty(key)) {
            const emote_element = createEmoteElement({
                name: key,
                url: emotes[key]
            }, () => loadingImageLoaded = true);

            const index = domDoneIndex;
            requestAnimationFrame(() => {
                container.appendChild(emote_element);
                domDone[index] = true;
            });

            list.push({
                name: key,
                el: emote_element
            });

            domDoneIndex++;
        }
    }

    const hideLoader = () => {
        if (loadingImageLoaded && domDone.every(el => {return el;})) {
            requestAnimationFrame(() => {
                loader.style.display = 'none';
                container.style.display = '';
                bLazy = new Blazy({
                    offset: 1000,
                    error: ele => {
                        ele.src = 'error.png';
                        ele.parentNode.parentNode.children[0].style.color = '#aa0000';
                    }
                })
            });
        } else {
            setTimeout(hideLoader, 50);
        }
    };
    hideLoader();

    return list;
}

// CHANGING THIS REQUIRES CHANGING THE TEMPLATE IN app/noscript.jade !!!
function createEmoteElement(emote, onload) {
    let container = document.createElement('div');
    container.setAttribute('class', 'emote-container');

    let name = document.createElement('h4');
    name.setAttribute('class', 'emote-header');
    name.textContent = emote.name;

    let image_container = document.createElement('div');
    image_container.setAttribute('class', 'emote-image');

    let image = document.createElement('img');
    image.onload = onload;
    image.setAttribute('class', 'b-lazy');
    image.setAttribute('src', 'loading.gif');
    image.setAttribute('data-src', emote.url);
    image.setAttribute('alt', emote.name);

    image_container.appendChild(image);
    container.appendChild(name);
    container.appendChild(image_container);

    return container;
}

module.exports = App;