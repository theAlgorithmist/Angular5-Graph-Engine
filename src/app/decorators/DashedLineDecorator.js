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
 * Typescript Math Toolkit: Dashed line decorator.  Line decorators allow switching between solid, dashed, and
 * dotted line strokes, simply by changing a run-time decorator.  The API is the same for each decorator and any
 * Canvas-based drawing utility may be used as long as it supports clear(), moveTo(), lineTo() functions (curveTo()
 * for quad. Beziers).
 *
 * This This decorator uses 'up' dash length (px length the pen is up) and 'down' dash length (px length the pen
 * is down) to defined the dashed characteristics of the stroke.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 *
 * NOTE: curveTo is not fully implemented
 */
var AbstractLineDecorator_1 = require("./AbstractLineDecorator");
var TSMT$DashedLineDecorator = (function (_super) {
    __extends(TSMT$DashedLineDecorator, _super);
    // reference to a quad. bezier to handle arc-length parameterization
    //this.__quad = null;
    function TSMT$DashedLineDecorator() {
        var _this = _super.call(this) || this;
        _this.__penX = 0; // current pen x-coordinate
        _this.__penY = 0; // current pen y-coordinate
        _this.__upLength = 3; // pen-up length or space between dashes
        _this.__dnLength = 5; // pen-down length
        _this.__overflow = 0; // how much of the current dash overflows to the next line segment
        _this.__drawingLine = true; // true if drawing a line, false if space
        // total dash length
        _this.__dashLength = _this.__upLength + _this.__dnLength;
        // normalized arc-length and natural parameter as dashing progresses
        _this.__s = 0;
        _this.__t = 0;
        _this.__t0 = 0;
        // quad control points
        _this.__x0 = 0;
        _this.__y0 = 0;
        _this.__cx = 0;
        _this.__cy = 0;
        _this.__x1 = 0;
        _this.__y1 = 0;
        // normalized arc length consumed by pen-down and pen-up
        _this.__sDown = 0;
        _this.__sUp = 0;
        return _this;
    }
    /**
     * Assign (name-value) parameters to control the line drawing.
     *
     * @param _data : Object - 'uplength' is the 'up' dash length (px length the pen is up). 'dnlength' is the 'down'
     * dash length (px length the pen is down).
     *
     * @return Nothing
     */
    TSMT$DashedLineDecorator.prototype.setParams = function (_data) {
        var isNumber;
        var up;
        var dn;
        if (_data.hasOwnProperty("dnLength")) {
            dn = parseFloat(_data['dnlength']);
            isNumber = !isNaN(dn) && isFinite(dn);
            this.__dnLength = isNumber && dn > 0 ? dn : this.__dnLength;
        }
        if (_data.hasOwnProperty("upLength")) {
            dn = parseFloat(_data['uplength']);
            isNumber = !isNaN(up) && isFinite(up);
            this.__upLength = isNumber && up > 0 ? up : this.__upLength;
        }
        this.__upLength = Math.round(this.__upLength);
        this.__dnLength = Math.round(this.__dnLength);
        // set total dash length
        this.__dashLength = this.__upLength + this.__dnLength;
    };
    /**
     * Move the pen to the specified point
     *
     * @param _g: any - Graphic context (typically from EaselJS or other Canvas-based drawing environment that
     * supports moveTo() )
     *
     * @param _x: number - x-coordinate of pen move in pixels
     *
     * @param _y: number - y-coordinate of pen move in pixels
     *
     * @returns nothing
     */
    TSMT$DashedLineDecorator.prototype.moveTo = function (_g, _x, _y) {
        _g.moveTo(_x, _y);
        this.__penX = _x;
        this.__penY = _y;
        // same method is used for drawing line or arc
        this.__x0 = _x;
        this.__y0 = _y;
        this.__t0 = 0;
        this.__s = 0;
        this.__t = 0;
    };
    /**
     * Draw a line with preset line properties from the current pen location to the input point
     *
     * @param _g: any - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports
     * lineTo() )
     *
     * @param _x: number - x-coordinate of line terminal pointin pixels
     *
     * @param _y: number - y-coordinate of line terminal point in pixels
     *
     * @returns nothing - A dashed line is drawn from current pen location to the specified location according to the
     * attributes of this decorator
     */
    TSMT$DashedLineDecorator.prototype.lineTo = function (_g, _x, _y) {
        var dx = _x - this.__penX;
        var dy = _y - this.__penY;
        // angle of this line segment
        var ang = Math.atan2(dy, dx);
        var ca = Math.cos(ang);
        var sa = Math.sin(ang);
        // total length of segment to be drawn
        var segLength = Math.sqrt(dx * dx + dy * dy);
        // any carry-over from previous segment?
        if (this.__overflow > 0) {
            if (this.__overflow > segLength) {
                if (this.__drawingLine) {
                    // execute line-to
                    this.execLineTo(_g, _x, _y);
                }
                else {
                    // otherwise, just move
                    this.moveTo(_g, _x, _y);
                }
                this.__overflow -= segLength;
                return;
            }
            if (this.__drawingLine) {
                // exec. line-to
                this.execLineTo(_g, this.__penX + ca * this.__overflow, this.__penY + sa * this.__overflow);
            }
            else {
                // otherwise, just move
                this.moveTo(_g, this.__penX + ca * this.__overflow, this.__penY + sa * this.__overflow);
            }
            segLength -= this.__overflow;
            this.__overflow = 0;
            // reverse line to dash (or vice versa)
            this.__drawingLine = !this.__drawingLine;
            // finished if all remaining distance consumed with current line segment
            if (Math.abs(segLength) < 0.001) {
                return;
            }
        }
        // how many full dash (dn-up) cycles?
        var dashes = Math.floor(segLength / this.__dashLength);
        if (dashes > 0) {
            // coordinates of 'up' and 'down' part of dashed segment
            var dnX = ca * this.__dnLength;
            var dnY = sa * this.__dnLength;
            var upX = ca * this.__upLength;
            var upY = sa * this.__upLength;
            var i = 0;
            for (i = 0; i < dashes; ++i) {
                if (this.__drawingLine) {
                    this.execLineTo(_g, this.__penX + dnX, this.__penY + dnY);
                    this.moveTo(_g, this.__penX + upX, this.__penY + upY);
                }
                else {
                    this.moveTo(_g, this.__penX + upX, this.__penY + upY);
                    this.execLineTo(_g, this.__penX + dnX, this.__penY + dnY);
                }
            }
            segLength -= this.__dashLength * dashes;
        }
        // handle any leftover after drawing an equal number of dash-space or space-dash pairs
        if (this.__drawingLine) {
            if (segLength > this.__dnLength) {
                this.execLineTo(_g, this.__penX + ca * this.__dnLength, this.__penY + sa * this.__dnLength);
                this.moveTo(_g, _x, _y);
                this.__overflow = this.__upLength - (segLength - this.__dnLength);
                this.__drawingLine = false;
            }
            else {
                this.execLineTo(_g, _x, _y);
                if (segLength == this.__dnLength) {
                    this.__overflow = 0;
                    this.__drawingLine = !this.__drawingLine;
                }
                else {
                    this.__overflow = this.__dnLength - segLength;
                    this.moveTo(_g, _x, _y);
                }
            }
        }
        else {
            if (segLength > this.__upLength) {
                this.moveTo(_g, this.__penX + ca * this.__upLength, this.__penY + sa * this.__upLength);
                this.__overflow = this.__dnLength - (segLength - this.__upLength);
                this.__drawingLine = true;
                this.execLineTo(_g, _x, _y);
            }
            else {
                this.moveTo(_g, _x, _y);
                if (segLength == this.__upLength) {
                    this.__overflow = 0;
                    this.__drawingLine = !this.__drawingLine;
                }
                else
                    this.__overflow = this.__upLength - segLength;
            }
        }
    };
    // internal method
    TSMT$DashedLineDecorator.prototype.execLineTo = function (_g, _x, _y) {
        if (_x == this.__penX && _y == this.__penY) {
            return;
        }
        this.__penX = _x;
        this.__penY = _y;
        _g.lineTo(_x, _y);
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
     * @returns nothing - The graphic context is cleared and internal decorator properties are reset so that this method
     * may be followed by a call to moveTo()
     */
    TSMT$DashedLineDecorator.prototype.clear = function (_g) {
        _g.clear();
        this.__overflow = 0;
        this.__drawingLine = true;
        this.__s = 0;
        this.__t = 0;
        this.__t0 = 0;
        this.__x0 = 0;
        this.__y0 = 0;
        this.__cx = 0;
        this.__cy = 0;
        this.__x1 = 0;
        this.__y1 = 0;
        this.__sDown = 0;
        this.__sUp = 0;
    };
    return TSMT$DashedLineDecorator;
}(AbstractLineDecorator_1.TSMT$AbstractLineDecorator));
exports.TSMT$DashedLineDecorator = TSMT$DashedLineDecorator;
