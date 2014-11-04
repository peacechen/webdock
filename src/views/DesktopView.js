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

    DesktopView.prototype._showWeb = function() {
    }

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
        lightboxOpts: { //for imgSurface animations
            inTransform: Transform.scale(0.001, 0.001, 0.001),
            inTransition: { duration: 500, curve: Easing.outBack },
            inOrigin: [0, 1],
            inAlign: [0, 1],
            inOpacity: 0,
            showTransform: Transform.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.5],
            outTransform: Transform.rotateX(Math.PI/2),
            outTransition: { duration: 400, curve: 'easeOut' }
        },
        eggSize: [250, 25],
        eggText: 'Copyright (c) 2014 Peace Chen'
    };

    function _createDesktop() {
        this.desktopSurface = new Surface({
            classes: ['desktop']
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

        this.dockView.dockModifier = new StateModifier({
            origin: [0, 1],
            align : [0, 1]
        });

        this.add(this.dockView.dockModifier).add(this.dockView);
    }

    //------------------------------------------------------------------------
    function _createLightbox() {
        this.lightbox = new Lightbox(this.options.lightboxOpts);
        this.windowModifier = new StateModifier({
            origin: [0.5, 0.6],
            align : [0.5, 0.5]
        });
        this.windowModifier.setOpacity(1, { duration:0, curve: 'linear' }, function() {
            //Callback allows us to get the size of the desktopSurface to fit the imgSurface
            this.desktopSize = this.desktopSurface.getSize();
            var fit = Math.min(this.desktopSize[0], this.desktopSize[1]) * 0.5;
            this.windowModifier.setSize([fit, fit]);
        }.bind(this));
        this.add(this.windowModifier).add(this.lightbox);
    }

    //------------------------------------------------------------------------
    function _setListeners() {
        this.dockView.on('openWindow', function(data) {
            // Demo different surface contents: web page, video, image.
            if(data === "img/icons/Web.png") { //Web page
                this.webSurface = new Surface({
                    classes: ['window'],
                    content: '<iframe width="100%" height="100%" src="http://www.ibm.com/developerworks/library/wa-famous/"></iframe>',
                    size: [this.desktopSize[0]/1.1, this.desktopSize[1]/1.35]
                });
                this.lightbox.show(this.webSurface);
            }
            else if(data === "img/icons/Music.png") { //YouTube
                this.webSurface = new Surface({
                    classes: ['window'],
                    content: '<iframe width="100%" height="100%" src="http://www.youtube.com/embed/g9qKuBzExTw?start=357&autoplay=1&rel=1" frameborder="0" allowfullscreen></iframe>',
                    size: [this.desktopSize[0]/1.1, this.desktopSize[1]/1.35]
                });
                this.lightbox.show(this.webSurface);
            }
            else {
                this.imgSurface = new ImageSurface({ //Icon
                    classes: ['window'],
                    content: data
                });
                this.lightbox.show(this.imgSurface);
            }

            if(data === "img/icons/Write.png")
                this._showEgg();

        }.bind(this));
    }

    module.exports = DesktopView;
});
