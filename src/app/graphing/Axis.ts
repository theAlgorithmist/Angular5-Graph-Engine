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
 * Typescript Math Toolkit: 2D coordinate grid axis.  This class does not draw an axis; it maintains parameters and
 * performs computations necessary to dynamically draw a horizontal or vertical axis.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
 export class TSMT$Axis
 {
   public static IN: string    = "in";
   public static OUT: string   = "out";
   public static MAJOR: string = "major";
   public static MINOR: string = "minor";
   public static LEFT: string  = "left";
   public static RIGHT: string = "right";
   public static UP: string    = 'up';
   public static DOWN: string  = 'down';

   protected _pxPerUnit: number = 0;    // number pixels per unit axis value
   protected _min: number       = 0;    // minimum axis value
   protected _max: number       = 0;    // maximum axis value
   protected _length: number    = 0;    // number of (integer) pixels across the length of this axis
   protected _majorInc: number  = 0;    // one major tic every this many units
   protected _minorInc: number  = 0;    // one minor tic every this many units

   // the callback is invoked (with new min and max) whenever the min/max axis extents change.
   // TODO Make this an Observable
   private _callback: Function = null;

   constructor()
   {
     // empty
   }

  /**
   * Access the number of pixels per unit value along this axis
   *
   * @returns {number} The number of pixels per unit value along the axis.  This requires the min-value, max-value,
   * and axis length to have been previously assigned.
   */
   public get pxPerUnit(): number
   {
     return this._pxPerUnit;
   }

  /**
   * Access the current minimum Axis value
   *
   * @returns {number} The current Axis minimum value
   */
   public get min(): number
   {
     return this._min;
   }

  /**
   * Access the current maximum Axis value
   *
   * @returns {number} The current Axis maximum value
   */
   public get max(): number
   {
     return this._max;
   }

  /**
   * Get the pixel coordinate associated with the input value
   *
   * @param {number} Value Graph coordinate for this axis
   *
   * @returns {number} Pixel coordinate corresponding to the input graph coordinate
   */
   public getPixel(value: number): number
   {
     return (value - this._min) * this._pxPerUnit;
   }

   /**
    * Get the axis value associated with the input pixel coordinate
    *
    * @param {number} pixel Pixel coordinate
    *
    * @returns {number} Axis value for the input pixel coordinate
    */
   public getValue(pixel: number): number
   {
     return this._min + (pixel/this._length)*(this._max - this._min);
   }

   /**
   * Register a callback function to be executed whenever min/max axis extents change
   *
   * @param {Function} f Function that accepts two arguments, min: number and max: number, which are the new minimum
   * and maximum axis extents
   *
   * @returns {nothing} The internal callback reference is assigned as long as the function is valid; this will
   * be deprecated in the future
   */
   public set callback(f: Function)
   {
     if (f !== undefined && f != null && f.constructor && f.call && f.apply) {
       this._callback = f;
     }
   }

  /**
   * Assign the minimum value to this axis
   *
   * @param {number} value Minimum axis value in current units, i.e. 4.0, -1.75, etc.
   *
   * @returns {nothing} - Assigns the minimum value and updates the pixels per unit value as long as the new minimum
   * is less than or equal to the current maximum.  The axis degenerates to a point in the latter case.
   */
   public set min(value: number)
   {
     if (!isNaN(value) && isFinite(value))
     {
       this._min       = value != this._min ? value : this._min;
       this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;

       if (this._callback != undefined) {
         this._callback(this._min, this._max);
       }
     }
   }

  /**
   * Assign the maximum value to this axis
   *
   * @param {number} value Maximum axis value in current units, i.e. 4.0, -1.75, etc.
   *
   * @Returns {nothing} Assigns the maximum value and updates the pixels per unit value as long as the new maximum
   * is greater than or equal to the current minimum.  The axis degenerates to a point in the latter case.
   */
   public set max(value: number)
   {
     if (!isNaN(value) && isFinite(value))
     {
       this._max       = value != this._max ? value : this._max;
       this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;

       if (this._callback != undefined) {
         this._callback(this._min, this._max);
       }
     }
   }

  /**
   * Access the pixel length of this Axis
   *
   * @returns {number} Axis pixel length
   */
   public get length(): number
   {
     return this._length;
   }

  /**
   * Assign the pixel length of this axis
   *
   * @param {number} value (integer) Number of pixels that comprise the length of this axis - must be greater than or
   * equal to zero.
   *
   * @returns {nothing} Negative values are converted to positive before computing the new number of pixels per unit
   * value (provided length is non-zero and current min-value is less than or equal to current max-value).  A zero-length
   * axis is degenerate.
   */
   public set length(value: number)
   {
     this._length    = Math.round(value);
     this._length    = value != this._length ? value : this._length;
     this._length    = this._length < 0 ? -this._length : this._length;
     this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;
   }

  /**
   * Assign the major tic increment in current units
   *
   * @param {number} inc Major tic increment, i.e. major tics every 0.5 units
   *
   * @returns {nothing}
   */
   public set majorInc(inc: number)
   {
     if (inc > 0) {
       this._majorInc = inc;
     }
   }

  /**
   * Assign the minor tic increment in current units
   *
   * @param {number} inc Minor tic increment, i.e. minor tics every 0.5 units
   *
   * @returns {nothing}
   */
   public set minorInc(inc: number)
   {
     if (inc > 0) {
       this._minorInc = inc;
     }
   }

  /**
   * Return a collection of tic marks for this axis
   *
   * @param {string} type Use the symbolic code Axis.MAJOR to query major tic increments and Axis.MINOR to
   * query minor tic increments
   *
   * @returns {Array<number>} Computed tic marks.  If axis bounds and length have not been set or the major/minor
   * tic increment is zero, then this method returns an empty array. An empty array is also returned for an
   * invalid type parameter.
   */
   public getTicMarks(type: string): Array<string>
   {
     const px: number = this.pxPerUnit;

     if (px == 0) {
       return new Array<string>();
     }

     let tic: number               = 0;
     const ticMarks: Array<string> = new Array<string>();

     if (type == TSMT$Axis.MAJOR)
     {
       if (this._majorInc != 0)
       {
         tic  = Math.ceil(this._min/this._majorInc);
         tic *= this._majorInc;

         ticMarks.push( tic.toString() );
         tic += this._majorInc;

         while (tic <= this._max)
         {
           ticMarks.push( tic.toString() );

           tic += this._majorInc;
         }
       }
       else
       {
         // degenerate case
         return new Array<string>();
       }
     }
     else if (type == TSMT$Axis.MINOR)
     {
       if (this._minorInc == 0)
       {
         tic  = Math.ceil(this._min/this._minorInc);
         tic *= this._minorInc;

         ticMarks.push( tic.toString() );
         tic += this._majorInc;

         while (tic <= this._max)
         {
           ticMarks.push( tic.toString() );

           tic += this._majorInc;
         }
       }
       else
       {
         // degenerate case
         return new Array<string>();
       }
     }

     return ticMarks;
   }

  /**
   * Return a collection of integer tic mark locations based on a graphic container with a presumed start index of zero
   *
   * @param {string} type  Use the symbolic code Axis.MAJOR to query tic locations and Axis.MINOR to query minor
   * tic locations
   *
   * @returns {Array<number>} Coordinates for tic marks with the understanding that the axis begins at a zero coordinate
   * inside a graphic container in some production rendering environment.  The caller may loop over this array to draw
   * tic marks at the correct position based on current axis settings.
   */
   public getTicCoordinates(type: string): Array<number>
   {
     const px: number = this.pxPerUnit;

     if (px == 0) {
       return new Array<number>();
     }

     let tic: number               = 0;
     let delta: number             = 0;
     const ticMarks: Array<number> = new Array<number>();

     if (type == TSMT$Axis.MAJOR)
     {
       if (this._majorInc != 0)
       {
         tic  = Math.ceil(this._min/this._majorInc);
         tic *= this._majorInc;

         while (tic <= this._max)
         {
           delta = tic - this._min;
           ticMarks.push( Math.round(delta*px) );

           tic += this._majorInc;
         }
       }
     }
     else if (type == TSMT$Axis.MINOR)
     {
       if (this._minorInc != 0)
       {
         tic  = Math.ceil(this._min/this._minorInc);
         tic *= this._minorInc;

         while( tic <= this._max )
         {
           delta = tic - this._min;
           ticMarks.push( Math.round(delta*px) );

           tic += this._minorInc;
         }
       }
     }

     return ticMarks;
   }

  /**
   * Zoom the axis in or out
   *
   * @param {string} dir Zoom direction; should be either Axis.IN or Axis.OUT
   *
   * @param {number} factor (integer) Zoom factor, i.e. 2, 4, 10, etc.  Note that zoom factor is applied to the current
   * axis bounds which are modified by each successive zoom. Take this into account if adjusting the zoom factor in a
   * loop since the zooming is exponential.
   *
   * @returns {nothing} If zoom direction is correct, the axis is zoomed about its current midpoint.  Rounding in
   * internal division and multiplication may affect axis bounds.
   */
   public zoom(dir: string, factor: number): void
   {
     if( isNaN(factor) || !isFinite(factor) || factor < 1 ) {
       return;
     }

     factor = Math.round(factor);

     const midpoint: number = 0.5*(this._max+this._min);
     let d: number          = this._max - midpoint;

     if (dir == TSMT$Axis.IN)
     {
       d = d / factor;
     }
     else if (dir == TSMT$Axis.OUT)
     {
       d = d * factor;
     }

     // new min and max values
     this._min = midpoint - d;

     // adjust px per unit as well as set new max value
     this.max = midpoint+d;
   }

  /**
   * Shift the axis by a number of pixels
   *
   * @param {number} amount (integer) Number of pixels moved.  This value is negative if the axis is moved in a
   * direction of decreasing coordinate value (both min and max decrease) and positive if the axis is moved in a
   * direction of increasing coordinate value (min and max increase).  Directions are in user (not screen) coordinates.
   * Some graphic systems employ a y-down convention.
   *
   * @returns {nothing} The internal minimum and maximum axis values in actual coordinates are adjusted based on the
   * specified pixel shift.  The axis minimum, maximum, and pixels per unit must be set in advance of calling this
   * method.
   */
   public shift(amount: number): void
   {
     if (isNaN(amount) || !isFinite(amount)) {
       return;
     }

     let px: number = this.pxPerUnit;
     if (px == 0) {
       return;
     }

     // length and px per unit are not altered with a shift (only min and max)
     px         = amount/px;
     this._min -= px;
     this._max -= px;
   }
 }
