/*** DockView.js ***/

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
    var View          = require('famous/core/View');
    var SequentialLayout = require("famous/views/SequentialLayout");
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var IconView      = require('views/IconView');
    var Timer         = require('famous/utilities/Timer');

    var MenuData        = require('../../data/MenuData');

    function DockView() {
        View.apply(this, arguments);
        _createLayout.call(this);
    }

    DockView.prototype = Object.create(View.prototype);
    DockView.prototype.constructor = DockView;
    DockView.prototype.animateIcons = function() {
        var transition = this.options.transition;
        var xOffset = IconView.DEFAULT_OPTIONS.xOffset;
        var yOffset = IconView.DEFAULT_OPTIONS.yOffset;
        var delay = this.options.staggerDelay;
        for(var i = 0; i < this.iconViews.length; i++) {
            Timer.setTimeout(function(i) {
                this.iconViews[i].positionModifier.setTransform(
                    Transform.translate( xOffset, yOffset, 0), transition);
            }.bind(this, i), i * delay);
        }
    };

    DockView.DEFAULT_OPTIONS = {
        menuData: MenuData,
        desktopSurface: {},
        staggerDelay: 35,
        transition: { duration: 400, curve: 'easeInOut' }
    };

    //------------------------------------------------------------------------
    function _createLayout() {
        this.sequentialLayout = new SequentialLayout({
            direction: 0 //horizontal
        });

        this.iconViews = [];
        this.sequentialLayout.sequenceFrom(this.iconViews);

        var seqLayoutModifier = new StateModifier({
            origin: [0.5, 1],
            align : [0.5, 1],
        });
        seqLayoutModifier.setOpacity(1, { duration:0, curve: 'linear' }, function() {
            //Add icons in callback so we can get the size of the desktopSurface.
            //The icon sizes are scaled based on the width of the browser.
            if(this.options.desktopSurface != {}) {
                var size = this.options.desktopSurface.getSize();
                this.iconSize = Math.min(0.8*size[0]/this.options.menuData.length, IconView.DEFAULT_OPTIONS.iconSize);
                this.center = size[0] / 2;
            }
            else {
                this.iconSize = IconView.DEFAULT_OPTIONS.iconSize;
                this.center = 500;
            }

            // Fan-out effect when first showing the dock icons.
            // The distance from the center to any icon is relative to its position in the SequentialLayout.
            for (var i=0; i < this.options.menuData.length; i++) {
                this.iconViews.push( new IconView({
                    iconSize: this.iconSize,
                    xOffsetStart: this.center - this.iconSize*i,
                    yOffsetStart: this.iconSize,
                    iconUrl: this.options.menuData[i].iconUrl,
                    title: this.options.menuData[i].title,
                    pageView: this.options.pageView,
                    dockView: this,
                }));
            }

            this.animateIcons();
        }.bind(this));

        this.add(seqLayoutModifier).add(this.sequentialLayout);
    }

    module.exports = DockView;
});