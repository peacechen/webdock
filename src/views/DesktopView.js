/*** DesktopView.js ***/

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
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Transform       = require('famous/core/Transform');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var ImageSurface    = require('famous/surfaces/ImageSurface');
    var Easing          = require('famous/transitions/Easing');
    var FastClick       = require('famous/inputs/FastClick');
    var Lightbox        = require('famous/views/Lightbox');
    var DockView        = require('views/DockView');

    function DesktopView() {
        View.apply(this, arguments);

        _createDesktop.call(this);
        _createDockView.call(this);
        _createLightbox.call(this);
        _setListeners.call(this);
    }

    DesktopView.prototype = Object.create(View.prototype);
    DesktopView.prototype.constructor = DesktopView;
    DesktopView.prototype._showEgg = function() {
        if(typeof(this.eggSurface) != 'undefined')
            return;
        this.eggSurface = new Surface({
            size: this.options.eggSize,
            content: this.options.eggText,
        });
        var eggModifier = new StateModifier({
            origin: [0, 1],
            align : [0, 1],
            transform: Transform.rotateZ(-Math.PI/6),
        });
        this.add(eggModifier).add(this.eggSurface);
        var xShift = this.desktopSize[0]-this.options.eggSize[0];
        eggModifier.setTransform(Transform.thenMove(Transform.rotateZ(0), [xShift,0,0]),
            {duration: 800, curve: Easing.outBack});
    }

    DesktopView.DEFAULT_OPTIONS = {
        logoSize: 50,
        targetSize : [600, 500],
        rotateXTransition: { duration: 800, curve: 'easeOut' },
        flyAwayTransition: { duration: 2000, curve: 'easeOut' },
        lightboxOpts: { //for windowSurface animations
            inTransform: Transform.scale(0.001, 0.001, 0.001),
            inTransition: { duration: 500, curve: Easing.outBack },
            inOrigin: [0, 1],
            inOpacity: 0,
            showTransform: Transform.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.5],
            outTransform: Transform.scale(0.001, 0.001, 0.001),
            outTransition: { duration: 0, curve: 'linear' },
        },
        eggSize: [250, 25],
        eggText: 'Copyright (c) 2014 Peace Chen',
    };

    function _createDesktop() {
        this.desktopSurface = new Surface({
            classes: ['desktop'],
        });
        this.add(this.desktopSurface);

        this.logoSurface = new Surface({
            size: [this.options.logoSize, this.options.logoSize],
            content: '<a href="http://famo.us"><img src="img/famous.png"></a>',
            properties: {
            }
        });

        var logoModifier = new StateModifier({
            origin: [1, 0],
            align : [1, 0]
        });

        this.add(logoModifier).add(this.logoSurface);
    }

    //------------------------------------------------------------------------
    function _createDockView() {
        this.dockView = new DockView({
            desktopSurface: this.desktopSurface });

        var dockModifier = new StateModifier({
            origin: [0, 1],
            align : [0, 1]
        });

        this.add(dockModifier).add(this.dockView);
    }

    //------------------------------------------------------------------------
    function _createLightbox() {
        this.lightbox = new Lightbox(this.options.lightboxOpts);
        this.windowSurface = new ImageSurface({
            classes: ['window'],
        });
        this.windowModifier = new StateModifier({
            origin: [0.5, 0.5],
            align : [0.5, 0.5],
        });
        this.windowModifier.setOpacity(1, { duration:0, curve: 'linear' }, function() {
            //Callback allows us to get the size of the desktopSurface to fit the windowSurface
            this.desktopSize = this.desktopSurface.getSize();
            var fit = Math.min(this.desktopSize[0], this.desktopSize[1]) * 0.5;
            this.windowModifier.setSize([fit, fit]);
        }.bind(this));
        this.add(this.windowModifier).add(this.lightbox);
    }

    //------------------------------------------------------------------------
    function _setListeners() {
        this.dockView.on('openWindow', function(data) {
            // For this demo we simplistically re-use a single surface,
            // changing the image source corresponding to each icon. In a real
            // app, different surfaces might represent windows or any other
            // unique content.
            this.windowSurface.setContent(data);
            this.lightbox.show(this.windowSurface);

            if(data === "img/icons/Write.png") {
                this._showEgg();
            }
        }.bind(this));
    }

    module.exports = DesktopView;
});
