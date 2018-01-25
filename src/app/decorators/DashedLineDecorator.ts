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
 import {TSMT$AbstractLineDecorator} from './AbstractLineDecorator';
 import {IGraphics                 } from "./IGraphics";

export class TSMT$DashedLineDecorator extends TSMT$AbstractLineDecorator
 {
   protected __penX: number         = 0;     // current pen x-coordinate
   protected __penY: number         = 0;     // current pen y-coordinate
   protected __upLength: number     = 3;     // pen-up length or space between dashes
   protected __dnLength: number     = 5;     // pen-down length
   protected __overflow: number     = 0;     // how much of the current dash overflows to the next line segment
   protected __drawingLine: boolean = true;  // true if drawing a line, false if space

   // total dash length
   protected __dashLength: number = this.__upLength + this.__dnLength;

   // normalized arc-length and natural parameter as dashing progresses
   protected __s: number  = 0;
   protected __t: number  = 0;
   protected __t0: number = 0;

   // quad control points
   protected __x0: number = 0;
   protected __y0: number = 0;
   protected __cx: number = 0;
   protected __cy: number = 0;
   protected __x1: number = 0;
   protected __y1: number = 0;

   // normalized arc length consumed by pen-down and pen-up
   protected __sDown: number = 0;
   protected __sUp: number   = 0;

   // reference to a quad. bezier to handle arc-length parameterization
   //this.__quad = null;

   constructor()
   {
     super();
   }

  /**
   * Assign (name-value) parameters to control the line drawing.
   *
   * @param {Object} data 'uplength' is the 'up' dash length (px length the pen is up). 'dnlength' is the 'down'
   * dash length (px length the pen is down).
   *
   * @returns {nothing}
   */
   public setParams(_data: Object): void
   {
     let isNumber: boolean;
     let up: number;
     let dn: number;

     if (_data.hasOwnProperty("dnLength"))
     {
       dn       = parseFloat(_data['dnlength']);
       isNumber = !isNaN(dn) && isFinite(dn);

       this.__dnLength = isNumber && dn > 0 ? dn : this.__dnLength;
     }

     if (_data.hasOwnProperty("upLength"))
     {
       dn       = parseFloat(_data['uplength']);
       isNumber = !isNaN(up) && isFinite(up);

       this.__upLength = isNumber && up > 0 ? up : this.__upLength;
     }

     this.__upLength = Math.round(this.__upLength);
     this.__dnLength = Math.round(this.__dnLength);

     // set total dash length
     this.__dashLength = this.__upLength + this.__dnLength;
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
     _g.moveTo(_x,_y);

     this.__penX = _x;
     this.__penY = _y;

     // same method is used for drawing line or arc
     this.__x0 = _x;
     this.__y0 = _y;
     this.__t0 = 0;
     this.__s  = 0;
     this.__t  = 0;
   }

  /**
   * Draw a line with preset line properties from the current pen location to the input point
   *
   * @param {IGraphics} g: EaselJS or IGraphics compatible graphic context
   *
   * @param {number} _x x-coordinate of line terminal pointin pixels
   *
   * @param {number} _y y-coordinate of line terminal point in pixels
   *
   * @returns {nothing} A dashed line is drawn from current pen location to the specified location according to the
   * attributes of this decorator
   */
   public lineTo(_g: IGraphics, _x: number, _y: number): void
   {
     let dx: number = _x - this.__penX;
     let dy: number = _y - this.__penY;

     // angle of this line segment
     let ang: number  = Math.atan2(dy, dx);
     let ca: number   = Math.cos(ang)
     let sa: number   = Math.sin(ang);

     // total length of segment to be drawn
     let segLength: number = Math.sqrt(dx*dx + dy*dy);

     // any carry-over from previous segment?
     if (this.__overflow > 0)
     {
       if (this.__overflow > segLength)
       {
         if (this.__drawingLine)
         {
           // execute line-to
           this.execLineTo(_g, _x, _y);
         }
         else
         {
           // otherwise, just move
           this.moveTo(_g, _x, _y);
         }

         this.__overflow -= segLength;
         return;
       }

       if (this.__drawingLine)
       {
         // exec. line-to
         this.execLineTo(_g, this.__penX + ca * this.__overflow, this.__penY + sa * this.__overflow);
       }
       else
       {
         // otherwise, just move
         this.moveTo(_g, this.__penX + ca * this.__overflow, this.__penY + sa * this.__overflow);
       }

       segLength      -= this.__overflow;
       this.__overflow = 0;

       // reverse line to dash (or vice versa)
       this.__drawingLine = !this.__drawingLine;

       // finished if all remaining distance consumed with current line segment
       if (Math.abs(segLength) < 0.001) {
         return;
       }
     }

     // how many full dash (dn-up) cycles?
     let dashes: number = Math.floor(segLength/this.__dashLength);

     if (dashes > 0)
     {
       // coordinates of 'up' and 'down' part of dashed segment
       let dnX: number = ca*this.__dnLength;
       let dnY: number = sa*this.__dnLength;
       let upX: number = ca*this.__upLength;
       let upY: number = sa*this.__upLength;
       let i: number   = 0;

       for (i = 0; i < dashes; ++i)
       {
         if (this.__drawingLine)
         {
           this.execLineTo(_g, this.__penX+dnX, this.__penY+dnY);

           this.moveTo(_g, this.__penX+upX, this.__penY+upY);
         }
         else
         {
           this.moveTo(_g, this.__penX+upX, this.__penY+upY);

           this.execLineTo(_g, this.__penX+dnX, this.__penY+dnY);
         }
       }

       segLength -= this.__dashLength*dashes;
     }

     // handle any leftover after drawing an equal number of dash-space or space-dash pairs
     if (this.__drawingLine)
     {
       if (segLength > this.__dnLength)
       {
         this.execLineTo(_g, this.__penX + ca*this.__dnLength, this.__penY + sa*this.__dnLength);

         this.moveTo(_g, _x, _y);

         this.__overflow    = this.__upLength - (segLength-this.__dnLength);
         this.__drawingLine = false;
       }
       else
       {
         this.execLineTo(_g, _x, _y);

         if (segLength == this.__dnLength)
         {
           this.__overflow    = 0;
           this.__drawingLine = !this.__drawingLine;
         }
         else
         {
           this.__overflow = this.__dnLength-segLength;

           this.moveTo(_g, _x, _y);
         }
       }
     }
     else
     {
       if (segLength > this.__upLength)
       {
         this.moveTo(_g, this.__penX+ca*this.__upLength, this.__penY+sa*this.__upLength);

         this.__overflow    = this.__dnLength - (segLength-this.__upLength);
         this.__drawingLine = true;

         this.execLineTo(_g, _x, _y);
       }
       else
       {
         this.moveTo(_g, _x, _y);
         if (segLength == this.__upLength)
         {
           this.__overflow    = 0;
           this.__drawingLine = !this.__drawingLine;
         }
         else
           this.__overflow = this.__upLength-segLength;
       }
     }
   }

   // internal method
   private execLineTo(_g: any, _x: number, _y: number): void
   {
     if (_x == this.__penX && _y == this.__penY) {
       return;
     }

     this.__penX = _x;
     this.__penY = _y;

     _g.lineTo(_x, _y);
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
   * @returns nothing - The graphic context is cleared and internal decorator properties are reset so that this method
   * may be followed by a call to moveTo()
   */
   public clear(_g: IGraphics): void
   {
     _g.clear();

     this.__overflow    = 0;
     this.__drawingLine = true;

     this.__s     = 0;
     this.__t     = 0;
     this.__t0    = 0;
     this.__x0    = 0;
     this.__y0    = 0;
     this.__cx    = 0;
     this.__cy    = 0;
     this.__x1    = 0;
     this.__y1    = 0;
     this.__sDown = 0;
     this.__sUp   = 0;
   }
 }
