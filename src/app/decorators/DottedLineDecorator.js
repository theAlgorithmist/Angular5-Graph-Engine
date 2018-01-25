"use strict";
/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Typescript Math Toolkit: Dotted line decorator.
 *
 * This decorator uses 'radius' for dot radius and 'spacing' for px space between dots.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
var AbstractLineDecorator_1 = require("./AbstractLineDecorator");
var TSMT$DashedLineDecorator = (function (_super) {
    __extends(TSMT$DashedLineDecorator, _super);
    // reference to a quad. bezier
    // __quad = null;
    function TSMT$DashedLineDecorator() {
        var _this = _super.call(this) || this;
        _this.__radius = 3; // dot radius
        _this.__spacing = 4; // spacing between dots
        _this.__dotX = 0; // x-center of most recent dot
        _this.__dotY = 0; // y-center of most recent dot
        _this.__refX = 0; // reference x-coordinate from most recent moveTo or lineTo
        _this.__refY = 0; // reference y-coordinate from most recent moveTo or lineTo
        _this.__length = 2 * _this.__radius + _this.__spacing; // total length to move between center of prior dot and mouse position
        _this.__lSq = _this.__length * _this.__length; // test value
        _this.__unused = 0; // unused (squared) distance between last dot and reference coordinates
        // normalized arc-length and natural parameter as dot distribution progresses
        _this.__s = 0;
        _this.__t = 0;
        // quad control points (not used in V1.0)
        _this.__x0 = 0;
        _this.__y0 = 0;
        _this.__cx = 0;
        _this.__cy = 0;
        _this.__x1 = 0;
        _this.__y1 = 0;
        return _this;
    }
    /**
     * Assign (name-value) parameters to control the line drawing.
     *
     * @param _data: Object - This decorator uses 'radius' for dot radius and 'spacing' for px space between dots.
     *
     * @return Nothing
     */
    TSMT$DashedLineDecorator.prototype.setParams = function (_data) {
        var isNumber;
        if (_data.hasOwnProperty("radius")) {
            isNumber = !isNaN(parseFloat(_data['radius'])) && isFinite(_data['radius']);
            this.__radius = isNumber && _data['radius'] > 0 ? _data['radius'] : this.__radius;
        }
        if (_data.hasOwnProperty("spacing")) {
            isNumber = !isNaN(parseFloat(_data['spacing'])) && isFinite(_data['spacing']);
            this.__spacing = isNumber && _data['spacing'] > 0 ? _data['spacing'] : this.__spacing;
        }
        // compensate for Javascript stupidity
        this.__length = 2 * Math.floor(this.__radius) + Math.floor(this.__spacing);
        this.__lSq = this.__length * this.__length;
    };
    /**
     * Move the pen to the specified point
     *
     * @param _g: any - Graphic context (typically from EaselJS or other Canvas-based drawing environment that
     * supports moveTo() )
     *
     * @param _x: number - x-coordinate of pen move in pixels
     *
     * @param _y: number - y-coordiante of pen move in pixels
     *
     * @returns nothing
     */
    TSMT$DashedLineDecorator.prototype.moveTo = function (_g, _x, _y) {
        // always begin a stroke with a dot
        this.drawDot(_g, _x, _y);
        this.__dotX = _x;
        this.__dotY = _y;
        this.__refX = _x;
        this.__refY = _y;
        this.__unused = 0;
        // one method does double-duty, whether we're drawing lines or arcs
        this.__x0 = _x;
        this.__y0 = _y;
        this.__s = 0;
        this.__t = 0;
    };
    // internal method - render dot into the graphic context
    TSMT$DashedLineDecorator.prototype.drawDot = function (_g, _x, _y) {
        _g.drawCircle(_x, _y, this.__radius);
    };
    /**
     * Draw a line with preset line properties from the current pen location to the input point
     *
     * @param _g: any - Graphic context (typically from EaselJS or other Canvas-based drawing environment that
     * supports lineTo() )
     * @param _x: number - x-coordinate of line terminal point in pixels
     *
     * @param _y: number - y-coordinate of line terminal point in pixels
     *
     * @returns nothing - A solid line is drawn from current pen location to the specified location according to
     * the attributes of this decorator
     */
    TSMT$DashedLineDecorator.prototype.lineTo = function (_g, _x, _y) {
        // don't draw another dot until the current position is sufficiently far from the prior dot
        var dx;
        var dy;
        var dSq;
        var numDots;
        if (this.__unused == 0) {
            dx = _x - this.__dotX;
            dy = _y - this.__dotY;
            dSq = dx * dx + dy * dy;
        }
        else {
            dx = _x - this.__refX;
            dy = _y - this.__refY;
            dSq = dx * dx + dy * dy + this.__unused;
        }
        var d = 0;
        if (dSq <= this.__lSq) {
            // haven't moved far enough away from the previous dot
            this.__unused = dSq;
        }
        else {
            // have to draw more than one dot.  all dots are along the direction from (__refX, __refY) to (_x,_y) -
            // compute a unit vector in that direction
            dx = _x - this.__refX;
            dy = _y - this.__refY;
            d = Math.sqrt(dx * dx + dy * dy);
            dx /= d;
            dy /= d;
            if (this.__unused == 0) {
                // the easy case
                numDots = Math.floor(Math.sqrt(dSq) / this.__length);
            }
            else {
                // not as easy.  The first dot is at the unused distance from (__refX, __refY);
                d = Math.sqrt(this.__unused);
                this.__dotX = this.__refX + dx * d;
                this.__dotY = this.__refY + dy * d;
                this.drawDot(_g, this.__dotX, this.__dotY);
                var tx = _x - this.__dotX;
                var ty = _y - this.__dotY;
                numDots = Math.floor(Math.sqrt(tx * tx + ty * ty) / this.__length);
            }
            if (numDots > 0) {
                // loop over each dot sequence
                var i = void 0;
                for (i = 0; i < numDots; ++i) {
                    // coordinates of new dot center
                    this.__dotX = this.__dotX + dx * this.__length;
                    this.__dotY = this.__dotY + dy * this.__length;
                    this.drawDot(_g, this.__dotX, this.__dotY);
                }
            }
            dx = _x - this.__dotX;
            dy = _y - this.__dotY;
            this.__unused = dx * dx + dy * dy;
        }
        // update reference coordinates for next lineTo
        this.__refX = _x;
        this.__refY = _y;
    };
    // draw a quadratic Bezier curve with preset line properties from the current point to the point (_x1,_y1)
    // using (_cx, _cy) as a middle control point, into the input graphic context
    TSMT$DashedLineDecorator.prototype.curveTo = function (_g, _cx, _cy, _x1, _y1) {
        // TODO - to be implemented
        _g.curveTo(_cx, _cy, _x1, _y1);
    };
    /**
     * Clear the graphic context
     *
     * @param _g : any - Graphic context from EaselJS or any other Canvas-based drawing environment that supports a
     * clear() method
     *
     * @return Nothing - The graphic context is cleared and internal decorator properties are reset so that this method
     * may be followed by a call to moveTo()
     */
    TSMT$DashedLineDecorator.prototype.clear = function (_g) {
        _g.clear();
        this.__s = 0;
        this.__t = 0;
        this.__x0 = 0;
        this.__y0 = 0;
        this.__cx = 0;
        this.__cy = 0;
        this.__x1 = 0;
        this.__y1 = 0;
        this.__refX = 0;
        this.__refY = 0;
        this.__unused = 0;
    };
    return TSMT$DashedLineDecorator;
}(AbstractLineDecorator_1.TSMT$AbstractLineDecorator));
exports.TSMT$DashedLineDecorator = TSMT$DashedLineDecorator;
