/*** IconView.js ***/

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
    var Engine        = require('famous/core/Engine');
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var Modifier      = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable     = require('famous/modifiers/Draggable');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var Easing = require("famous/transitions/Easing");

    var Transitionable = require("famous/transitions/Transitionable");

    function IconView() {
        View.apply(this, arguments);

        _createIcon.call(this);
        _setListeners.call(this);
    }

    IconView.prototype = Object.create(View.prototype);
    IconView.prototype.constructor = IconView;

    IconView.DEFAULT_OPTIONS = {
        iconSize: 64,
        xOffset: 0,
        yOffset: -25,
        xOffsetStart: 0, //Override these to enhance startup animation
        yOffsetStart: 64,  //""
        iconUrl: '',
        hoverTransition: { duration: 400, curve: 'easeOut' },
        containerModifier: {},
    };

    //------------------------------------------------------------------------
    function _createIcon() {
        this.iconSurface = new ImageSurface({
            size: [this.options.iconSize, this.options.iconSize],
            content : this.options.iconUrl,
            properties: {
                cursor: 'pointer'
            }
        });

        this.initModifier = new StateModifier({
            origin: [0, 1],
            align : [0, 1]
        });

        this.positionModifier = new StateModifier({
            //Hide the icon below the bottom edge
            transform: Transform.translate(this.options.xOffsetStart, this.options.yOffsetStart, 0)
        });

        this.add(this.positionModifier).add(this.initModifier).add(this.iconSurface);
    }

    //------------------------------------------------------------------------
    function _setListeners() {
        this.size = new Transitionable([this.options.iconSize, this.options.iconSize]);
        var transitionGetSize = function() {
            return this.size.get();
        }.bind(this);
        this.originalGetSize = this.iconSurface.getSize;
        this.containerOrigXoffset = this.options.containerModifier.getTransform()[12];

        // When hovering over icon, expand its size.
        this.iconSurface.on('mouseover', function () {
            //End any in-progress animations to eliminate hysteresis
            this.size.halt();
            this.initModifier.halt();
            this.options.containerModifier.halt();

            // Performance note - this function executes on every tick. Keep it short.
            this.iconSurface.getSize = transitionGetSize;

            //Expand boundary
            this.size.set( [this.options.iconSize*2, this.options.iconSize*2], this.options.hoverTransition );

            //Expand icon size
            this.initModifier.setTransform( Transform.scale(2, 2, 1), this.options.hoverTransition );

            //Adjust container position
            this.options.containerModifier.setTransform( Transform.translate(this.options.iconSize/2, 0, 0), 
                                                         this.options.hoverTransition );
        }.bind(this));

        // Leaving icon; restore its original size.
        this.iconSurface.on('mouseout', function () {
            this.size.halt();
            this.initModifier.halt();
            this.options.containerModifier.halt();

            this.size.set([this.options.iconSize, this.options.iconSize], this.options.hoverTransition, function(){
                //Restore original getSize after transition completes.
                this.iconSurface.getSize = this.originalGetSize;
            }.bind(this));
            this.initModifier.setTransform( Transform.scale(1, 1, 1), this.options.hoverTransition );
            this.options.containerModifier.setTransform( Transform.translate(this.containerOrigXoffset, 0, 0), 
                                                         this.options.hoverTransition );
        }.bind(this));

        // Forward click
        this.iconSurface.on('click', function () {
            Engine.emit('openWindow', this.options.iconUrl);
        }.bind(this));
    }

    module.exports = IconView;
});