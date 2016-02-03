"use strict";

import Layzr from 'layzr.js';

var App = {
    layzr: Layzr(),
    init: function init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.layzr
                .update()       // track initial elements
                .check()        // check initial elements
                .handlers(true);// bind scroll and resize handlers
        });
    }
};

module.exports = App;