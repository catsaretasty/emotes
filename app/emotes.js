"use strict";

import Blazy from 'blazy';

var App = {
    bLazy: new Blazy(),
    init: function init() {
        const emote_list_parent = document.querySelector('#emotes');
        const emotes = parseEmoteElements(emote_list_parent.children);
        const search = createSearchBox(document.querySelector('#search-box'));

        search.oninput = () => {
            emotes.map(emote => {
                if (hasSubstring(emote.name, search.value)) {
                    emote.el.style.display = 'flex';
                } else {
                    emote.el.style.display = 'none';
                }
            });

            emote_list_parent.style.justifyContent = (search.value) ? 'space-between' : 'center';
            this.bLazy.revalidate();
        };
    }
};

const hasSubstring = (s, f) => s.toLowerCase().indexOf(f.toLowerCase()) > -1;

function createSearchBox(parent) {
    let search = document.createElement('input');
    search.id = 'search';
    search.type = 'text';
    search.placeholder = 'search here';
    search.onkeydown = event => {
        // hitting escape should clear input
        if (event.which == 27) {
            search.value = '';
            search.oninput();
        }
    };

    return parent.appendChild(search);
}

function parseEmoteElements(emote_elements) {
    let list = [];

    for (let i = 0; i < emote_elements.length; i++) {
        list.push({
            name: emote_elements[i].children[0].innerHTML,
            el: emote_elements[i]
        });
    }

    return list;
}

module.exports = App;