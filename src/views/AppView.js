/*** AppView.js ***/

// Copyright (c) 2014 Peace Chen
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

define(function(require, exports, module) {
    var View           = require('famous/core/View');
    var Surface        = require('famous/core/Surface');
    var Transform      = require('famous/core/Transform');
    var StateModifier  = require('famous/modifiers/StateModifier');
    var Modifier       = require('famous/core/Modifier');
    var Transitionable = require('famous/transitions/Transitionable');

    var DesktopView = require('views/DesktopView');

    function AppView() {
        View.apply(this, arguments);
        this.desktopViewPos = new Transitionable(0);

        _createDesktopView.call(this);
    }

    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {
    };

    //------------------------------------------------------------------------
    function _createDesktopView() {
        this.desktopView = new DesktopView();
        this.desktopModifier = new Modifier({
            transform: function() {
                return Transform.translate(this.desktopViewPos.get(), 0, 0);
            }.bind(this)
        });
        this.add(this.desktopModifier).add(this.desktopView);
    }

    module.exports = AppView;
});
