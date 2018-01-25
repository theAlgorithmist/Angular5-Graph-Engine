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

/**
 * Typescript Math Toolkit: Dotted line decorator.
 *
 * This decorator uses 'radius' for dot radius and 'spacing' for px space between dots.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
 import {TSMT$AbstractLineDecorator} from './AbstractLineDecorator';
 import {IGraphics                 } from "./IGraphics";

export class TSMT$DottedLineDecorator extends TSMT$AbstractLineDecorator
 {
   protected __radius: number  = 3;                                 // dot radius
   protected __spacing: number = 4;                                 // spacing between dots
   protected __dotX: number    = 0;                                 // x-center of most recent dot
   protected __dotY: number    = 0;                                 // y-center of most recent dot
   protected __refX: number    = 0;                                 // reference x-coordinate from most recent moveTo or lineTo
   protected __refY: number    = 0;                                 // reference y-coordinate from most recent moveTo or lineTo
   protected __length: number  = 2*this.__radius + this.__spacing;  // total length to move between center of prior dot and mouse position
   protected __lSq: number     = this.__length*this.__length;       // test value
   protected __unused: number  = 0;                                 // unused (squared) distance between last dot and reference coordinates

   // normalized arc-length and natural parameter as dot distribution progresses
   protected __s: number  = 0;
   protected __t: number  = 0;

   // quad control points (not used in V1.0)
   protected __x0: number = 0;
   protected __y0: number = 0;
   protected __cx: number = 0;
   protected __cy: number = 0;
   protected __x1: number = 0;
   protected __y1: number = 0;

   constructor()
   {
     super();
   }

  /**
   * Assign (name-value) parameters to control the line drawing.
   *
   * @param {Object} data This decorator uses 'radius' for dot radius and 'spacing' for px space between dots.
   *
   * @returns {nothing}
   */
   public setParams(_data: Object): void
   {
     let isNumber: boolean;
     if (_data.hasOwnProperty("radius"))
     {
       isNumber      = !isNaN(parseFloat(_data['radius'])) && isFinite(_data['radius']);
       this.__radius = isNumber && _data['radius'] > 0 ? _data['radius'] : this.__radius;
     }

     if (_data.hasOwnProperty("spacing"))
     {
       isNumber       = !isNaN(parseFloat(_data['spacing'])) && isFinite(_data['spacing']);
       this.__spacing = isNumber && _data['spacing'] > 0 ? _data['spacing'] : this.__spacing;
     }

     // compensate for Javascript stupidity
     this.__length = 2*Math.floor(this.__radius) + Math.floor(this.__spacing);
     this.__lSq    = this.__length*this.__length;
   }

  /**
   * Move the pen to the specified point
   *
   * @param {IGraphics} g: EaselJS or IGraphics compatible graphic context
   *
   * @param {number} _x x-coordinate of pen move in pixels
   *
   * @param {number} _y y-coordinate of pen move in pixels
   *
   * @returns nothing
   */
   public moveTo(_g: IGraphics, _x: number, _y: number): void
   {
     // always begin a stroke with a dot
     this.drawDot(_g, _x, _y);

     this.__dotX   = _x;
     this.__dotY   = _y;
     this.__refX   = _x;
     this.__refY   = _y;
     this.__unused = 0;

     // one method does double-duty, whether we're drawing lines or arcs
     this.__x0 = _x;
     this.__y0 = _y;
     this.__s  = 0;
     this.__t  = 0;
   }

   // internal method - render dot into the graphic context
   protected drawDot(_g: IGraphics, _x: number, _y: number): void
   {
     _g.drawCircle(_x, _y, this.__radius);
   }

  /**
   * Draw a line with preset line properties from the current pen location to the input point
   *
   * @param {IGraphics} g: EaselJS or IGraphics compatible graphic context
   *
   * @param {number} _x x-coordinate of line terminal point in pixels
   *
   * @param {number} _y y-coordinate of line terminal point in pixels
   *
   * @returns {nothing} - A solid line is drawn from current pen location to the specified location according to
   * the attributes of this decorator
   */
   public lineTo(_g: IGraphics, _x: number, _y: number): void
   {
     // don't draw another dot until the current position is sufficiently far from the prior dot
     let dx: number;
     let dy: number;
     let dSq: number;
     let numDots: number;

     if (this.__unused == 0)
     {
       dx  = _x - this.__dotX;
       dy  = _y - this.__dotY;
       dSq = dx*dx + dy*dy;
     }
     else
     {
       dx  = _x - this.__refX;
       dy  = _y - this.__refY;
       dSq = dx*dx + dy*dy + this.__unused;
     }

     let d: number = 0;

     if (dSq <= this.__lSq)
     {
       // haven't moved far enough away from the previous dot
       this.__unused = dSq;
     }
     else
     {
       // have to draw more than one dot.  all dots are along the direction from (__refX, __refY) to (_x,_y) -
       // compute a unit vector in that direction
       dx  = _x - this.__refX;
       dy  = _y - this.__refY;
       d   = Math.sqrt(dx*dx + dy*dy);
       dx /= d;
       dy /= d;

       if (this.__unused == 0)
       {
         // the easy case
         numDots = Math.floor( Math.sqrt(dSq)/this.__length );
       }
       else
       {
         // not as easy.  The first dot is at the unused distance from (__refX, __refY);
         d           = Math.sqrt(this.__unused);
         this.__dotX = this.__refX + dx*d;
         this.__dotY = this.__refY + dy*d;

         this.drawDot(_g, this.__dotX, this.__dotY);

         let tx: number  = _x - this.__dotX;
         let ty: number  = _y - this.__dotY;
         numDots = Math.floor( Math.sqrt(tx*tx + ty*ty)/this.__length );
       }

       if (numDots > 0)
       {
         // loop over each dot sequence
         let i: number;
         for (i = 0; i < numDots; ++i)
         {
           // coordinates of new dot center
           this.__dotX = this.__dotX + dx*this.__length;
           this.__dotY = this.__dotY + dy*this.__length;

           this.drawDot(_g, this.__dotX, this.__dotY);
         }
       }

       dx            = _x - this.__dotX;
       dy            = _y - this.__dotY;
       this.__unused = dx*dx + dy*dy;
     }

     // update reference coordinates for next lineTo
     this.__refX = _x;
     this.__refY = _y;
   }

   // draw a quadratic Bezier curve with preset line properties from the current point to the point (_x1,_y1)
   // using (_cx, _cy) as a middle control point, into the input graphic context
   public curveTo(_g: IGraphics, _cx: number, _cy: number, _x1: number, _y1: number): void
   {
     // TODO - to be implemented
     _g.curveTo(_cx, _cy, _x1, _y1);
   }

  /**
   * Clear the graphic context
   *
   * @param {IGraphics} g: EaselJS or IGraphics compatible graphic context
   *
   * @returns {nothing} The graphic context is cleared and internal decorator properties are reset so that this method
   * may be followed by a call to moveTo()
   */
   public clear(_g: IGraphics): void
   {
     _g.clear();

     this.__s      = 0;
     this.__t      = 0;
     this.__x0     = 0;
     this.__y0     = 0;
     this.__cx     = 0;
     this.__cy     = 0;
     this.__x1     = 0;
     this.__y1     = 0;
     this.__refX   = 0;
     this.__refY   = 0;
     this.__unused = 0;
   }
 }
