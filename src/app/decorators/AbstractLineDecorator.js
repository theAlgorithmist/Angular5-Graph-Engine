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
Object.defineProperty(exports, "__esModule", { value: true });
var TSMT$AbstractLineDecorator = (function () {
    function TSMT$AbstractLineDecorator() {
    }
    TSMT$AbstractLineDecorator.prototype.setParams = function (_value) { };
    ;
    TSMT$AbstractLineDecorator.prototype.moveTo = function (_g, _x, _y) { _g.moveTo(_x, _y); };
    ;
    TSMT$AbstractLineDecorator.prototype.lineTo = function (_g, _x, _y) { _g.lineTo(_x, _y); };
    ;
    TSMT$AbstractLineDecorator.prototype.curveTo = function (_g, _cx, _cy, _x1, _y1) { _g.curveTo(_cx, _cy, _x1, _y1); };
    ;
    TSMT$AbstractLineDecorator.prototype.clear = function (_g) { _g.clear(); };
    ;
    return TSMT$AbstractLineDecorator;
}());
exports.TSMT$AbstractLineDecorator = TSMT$AbstractLineDecorator;
