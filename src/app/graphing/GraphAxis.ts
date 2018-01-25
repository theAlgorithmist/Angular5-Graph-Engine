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
 * Typescript Math Toolkit 2D graph axis.  A graph axis is created by composing a computational module (Axis) with
 * a triangular arrow.  A GraphAxis may be oriented (and thus rendered) horizontally or vertically and have major/minor
 * tic marks rendered along with the axis. The current drawing convention is y-down, which is in line with many
 * online drawing environments.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 *
 * dependency: easeljs ^0.8.2 (or comparable graphic environment)
 */

// TSMT Axis
import {TSMT$Axis} from "./Axis";

// drawing
import {IGraphics          } from "../decorators/IGraphics";
import {TSMT$ILineDecorator} from "../decorators/ILineDecorator";

export class TSMT$GraphAxis
{
  public static HORIZONTAL: string = "H";
  public static VERTICAL: string   = "V";
  public static MAJOR: string      = TSMT$Axis.MAJOR;

  protected _orientation: string = TSMT$GraphAxis.HORIZONTAL;     // graph axis orientation defaults to horizontal
  protected _axis: TSMT$Axis     = new TSMT$Axis();               // reference to internal axis instance

  // 2D graph bounds are used to properly position axes
  protected _left: number   = 0;
  protected _top: number    = 0;
  protected _right: number  = 0;
  protected _bottom: number = 0;

  // pixel length and height of the box in which this graph axis is rendered
  protected _length: number = 10;
  protected _height: number = 10;

  constructor()
  {
    // empty
  }

  /**
   * Access the pixel length of the axis box
   *
   * @returns {number}
   */
  public get length(): number
  {
    return this._length;
  }

  /**
   * Access the pixel height of the axis box
   *
   * @returns {number}
   */
  public get height(): number
  {
    return this._height;
  }

 /**
  * Assign the bounds of the (y-down) drawing area in graph units and pixels
  *
  * @param {number} left x-coordinate of the top-left corner
  *
  * @param {number} top y-coordinate of the top-left corner
  *
  * @param {number} right x-coordinate of the bottom-right corner
  *
  * @param {number} bottom y-coordinate of the bottom-right corner
  *
  * @param {number} length Length of the drawing area in pixels
  *
  * @param {number} height Height of the drawing area in pixels
  *
  * @returns {nothing} - Assigns bounds for the extents of the drawing area in actual graph units.  Vertical
  * bounds are required, for example, to position a horizontal graph axis or determine that it has been shifted
  * out of the display area.  Likewise, horizontal bounds are required to properly display a vertical axis.  The
  * graph axis orientation must be set in advance of assigning bounds.
  */
  public setBounds(left: number, top: number, right: number, bottom: number, length: number, height: number): void
  {
    if (right > left)
    {
      this._left  = left;
      this._right = right;
    }

    if (top > bottom)
    {
      this._bottom = bottom;
      this._top    = top;
    }

    this._length = length > 0 ? length : this._length;
    this._height = height > 0 ? height : this._height;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      this._axis.min    = this._left;
      this._axis.max    = this._right;
      this._axis.length = this._length;
    }
    else
    {
      this._axis.min    = this._bottom;
      this._axis.max    = this._top;
      this._axis.length = this._height;
    }
  }

 /**
  * Access the current minimum axis value
  *
  * @returns {number} The current axis minimum value
  */
  public get min(): number
  {
    return this._axis.min;
  }

  /**
   * Access the current maximum axis value
   *
   * @eturns {number} The current axis maximum value
   */
  public get max(): number
  {
    return this._axis.max;
  }

  /**
   * Access the axis location in display space in pixel coordinates
   *
   * @returns {number} Pixel offset from the origin of the display area (y-down) based on the bound settings in real
   * coordinates and the boundary of the display vertically and horizontally in pixels.  Set all relevant bounds AND
   * the axis orientation before accessing this method.  This allows the horizontal or vertical axis offset to be
   * computed so that other items may be positioned relative to the axis.  The offset may be negative or exceed the
   * dimensions of the display area if the axis is not currently in view.
   */
  public get axisOffset(): number
  {
    let px: number;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      px = this._height/(this._top-this._bottom);  // px per unit Y value
      return px*Math.abs(this._top);
    }
    else
    {
      px = this._length/(this._right-this._left);  // px per unit X value
      return px*Math.abs(this._left);
    }
  }

  /**
   * Assign the axis orientation
   *
   * @param {string} orient Axis orientation (must be SMT$GraphAxis.HORIZONTAL or SMT$GraphAxis.VERTICAL)
   *
   * @returns {nothing}
   */
  public set orientation(orient: string)
  {
    if (orient == TSMT$GraphAxis.HORIZONTAL || orient == TSMT$GraphAxis.VERTICAL) {
      this._orientation = orient;
    }
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
    if (!isNaN(inc) && inc > 0) {
      this._axis.majorInc = inc;
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
    if (!isNaN(inc) && inc > 0) {
      this._axis.minorInc = inc;
    }
  }

  /**
   * Is the graph axis visible based on current drawing area bounds?
   *
   * @returns  {boolean} True if the graph axis is visible based on the current drawing area bounds in user coordinates
   */
  public isVisible(): boolean
  {
    // must set orientation and bounds before testing for axis visibility
    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      return !( this._top < 0 || this._bottom > 0 );
    }
    else
    {
      return !( this._left > 0 || this._right < 0 );
    }
  }

  /**
   * Zoom the graph axis in or out
   *
   * @param {string} dir Zoom direction; should be either TSMT$Axis.IN or TSMT$Axis.OUT
   *
   * @param {number} factor Zoom factor, i.e. 2, 4, 10, etc.  Note that zoom factor is applied to the current axis
   * bounds which are modified by each successive zoom. Take this into account if adjusting the zoom factor in a
   * loop as zoom is exponential.
   *
   * @returns {nothing} If zoom direction is correct, the graph axis is zoomed about its current midpoint.  Rounding
   * in internal division and multiplication may affect axis bounds.  The graph axis is NOT redrawn.  Graph axis
   * orientation and drawing area bounds must be set before calling this method.
   */
  public zoom(dir: string, factor: number): void
  {
    factor = factor < 0 ? -factor : factor;
    factor = Math.round(factor);

    if (factor == 0) {
      return;
    }

    this._axis.zoom(dir, factor);

    let midpoint: number;
    let d: number;

    // update the bounds - apply the zoom to the orthogonal dimension
    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      this._left  = this._axis.min;
      this._right = this._axis.max;

      midpoint = 0.5*(this._top+this._bottom);
      d        = this._top - midpoint;

      if (dir.toLowerCase() == TSMT$Axis.IN)
      {
        d = d/factor;
      }
      else if (dir.toLowerCase() == TSMT$Axis.OUT)
      {
        d = d*factor;
      }

      this._top    = midpoint - d;
      this._bottom = midpoint + d;
    }
    else
    {
      this._bottom = this._axis.min;
      this._top    = this._axis.max;

      midpoint = 0.5*(this._right+this._left);
      d        = this._right - midpoint;

      if (dir == TSMT$Axis.IN)
      {
        d = d/factor;
      }
      else if (dir == TSMT$Axis.OUT)
      {
        d = d*factor;
      }

      this._left  = midpoint - d;
      this._right = midpoint + d;
    }
  }

  /**
   * Shift the graph axis by a specified pixel amount
   *
   * @param {number} dx Number of pixels moved in the horizontal direction.
   *
   * @param {number} dy Number of pixels moved in the vertical direction.
   *
   * @returns {nothing} The internal minimum and maximum axis values in actual coordinates are adjusted based on
   * the specified pixel shift.  The axis minimum, maximum, and pixels per unit must be set in advance of calling
   * this method and the graph axis is NOT redrawn.  Graph axis orientation and drawing area bounds must be set
   * before calling this method.
   */
  public shift(dx: number, dy: number): void
  {
    const isHorizontal: boolean = this._orientation == TSMT$GraphAxis.HORIZONTAL;

    if (isHorizontal)
    {
      // we control the horizontal ...
      this._axis.shift(dx);
    }
    else
    {
      // ... and the vertical
      this._axis.shift(dy);
    }

    let px: number = this._axis.pxPerUnit;
    if (px == 0 ) {
      return;
    }

    if (this._length == 0 || this._height == 0) {
      return;
    }

    // update the bounds and apply the shift to thh orthogonal dimension (implementing only y-down for the present)
    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      this._left  = this._axis.min;
      this._right = this._axis.max;

      px            = (this._bottom-this._top)/this._height;
      this._top    -= dy*px;
      this._bottom -= dy*px;
    }
    else
    {
      this._bottom = this._axis.min;
      this._top    = this._axis.max;

      px      = (this._right-this._left)/this._length;
      this._left  -= dx*px;
      this._right -= dx*px;
    }
  }

  /**
   * Draw the graph axis line using the supplied graphic context
   *
   * @param {IGraphics} g EaselJS or IGraphics-compatible graphics context
   *
   * @param {TSMT$ILineDecorator} Line decorator to draw the axis
   *
   * @param {number} arrowWidth  Arrow width in pixels (height for a vertical axis)
   *
   * @param {number} arrowHeight Arrow height in pixels (width for a vertical axis)
   *
   * @param {boolean} override True to override zero-test and anchor axis display (used in single-quadrant graph)
   * @default false
   *
   * @returns {nothing} Line properties such as width and color should be assigned in advance.  Graph axis orientation
   * and drawing area bounds must be set before calling this method.
   */
  public drawAxis(g: IGraphics, line: TSMT$ILineDecorator, arrowWidth: number = 8, arrowHeight: number = 5,
                  override: boolean = false): void
  {
    let px: number = 0;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      // compute y-coordinate of axis location (zero-value in graph units)
      if (!override && (this._top < 0 || this._bottom) > 0) {
        return;                                 // horizontal axis does not appear in drawing area
      }

      px = this._height/(this._top-this._bottom);  // px per unit Y value

      // zero-y is somewhere between top and bottom of drawing area
      const axisY = override ? px*(this._top-this._bottom) : px*Math.abs(this._top);

      // left- and right-axis coordinates depend on arrows
      line.moveTo(g, 0, axisY);
      line.lineTo(g, this._length, axisY);
    }
    else
    {
      // compute x-coordinate of axis location (zero-value in graph units)
      if (!override && (this._left > 0 || this._right < 0)) {
        return;                                // vertical axis does not appear in drawing area
      }

      px = this._length/(this._right-this._left);  // px per unit X value

      // zero-x is somewhere between top and bottom of drawing area
      const axisX = override ? 0 : px*Math.abs(this._left);

      // top- and bottom-axis coordinates depend on arrows
      line.moveTo(g, axisX, 0);
      line.lineTo(g, axisX, this._height);
    }
  }

  /**
   * Draw the arrows for a graph axis
   *
   * @param {IGraphics} leftArrow An EaselJS graphics context for the left arrow (horizontal orientation) or bottom arrow
   * (vertical orientation) - pass null to not draw this arrow
   *
   * @param {IGraphics} rightArrow An EaselJS graphics context for the right arrow (horizontal orientation) or top arrow
   * (vertical orientation) - pass null to not draw this arrow
   *
   * @param {number} arrowWidth Arrow width in pixels (height for a vertical axis)
   *
   * @param {number} arrowHeight Arrow height in pixels (width for a vertical axis)
   *
   * @param {boolean} override True to override zero-test and anchor axis display (used in single-quadrant graph)
   * @default false
   *
   * @returns {nothing} All line/fill properties set on each graphic context before calling this method.
   */
  public drawArrows(leftArrow: IGraphics | null, rightArrow: IGraphics | null, arrowWidth: number = 8,
                    arrowHeight: number = 5, override: boolean = false): void
  {
    let px: number           = 0;
    const halfHeight: number = 0.5*arrowHeight;
    const halfWidth: number  = 0.5*arrowWidth;

    let axisX: number;
    let axisY: number;

    if (leftArrow !== undefined && leftArrow != null)
    {
      if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
      {
        // left-arrow, compute y-coordinate of axis location (zero-value in graph units)
        if (!override && (this._top < 0 || this._bottom > 0)) {
          return;                                        // horizontal axis does not appear in drawing area
        }

        px = this._height / (this._top - this._bottom);  // px per unit Y value

        // zero-y is somewhere between top and bottom of drawing area
        axisY = override ? px*(this._top-this._bottom) : px*Math.abs(this._top);

        leftArrow.moveTo(0, axisY);
        leftArrow.lineTo(arrowWidth, axisY - halfHeight);
        leftArrow.lineTo(arrowWidth, axisY + halfHeight);
        leftArrow.lineTo(0, axisY);
      }
      else
      {
        // bottom-arrow, compute x-coordinate of axis location
        if (!override && (this._left > 0 || this._right < 0)) {
          return;                                  // vertical axis does not appear in drawing area
        }

        px = this._length / (this._right - this._left);  // px per unit X value

        axisX = override ? 0 : px*Math.abs(this._right);

        leftArrow.moveTo(axisX, this._height);
        leftArrow.lineTo(axisX - halfWidth, this._height - arrowHeight);
        leftArrow.lineTo(axisX + halfWidth, this._height - arrowHeight);
        leftArrow.lineTo(axisX, this._height);
      }
    }

    if (rightArrow !== undefined && rightArrow != null)
    {
      if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
      {
        // right-arrow, compute y-coordinate of axis location
        if (!override && (this._top < 0 || this._bottom > 0)) {
          return;                                // horizontal axis does not appear in drawing area
        }

        px = this._height/(this._top-this._bottom);  // px per unit Y value

        // zero-y is somewhere between top and bottom of drawing area
        axisY = override ? px*(this._top-this._bottom) : px*Math.abs(this._top);

        rightArrow.moveTo(this._length, axisY);
        rightArrow.lineTo(this._length-arrowWidth, axisY-halfHeight);
        rightArrow.lineTo(this._length-arrowWidth, axisY+halfHeight);
        rightArrow.lineTo(this._length, axisY);
      }
      else
      {
        // up-arrow, compute x-coordinate of axis location
        if (!override && (this._left > 0 || this._right < 0)) {
          return;                                // vertical axis does not appear in drawing area
        }

        px = this._length/(this._right-this._left);  // px per unit X value

        // zero-x is somewhere between top and bottom of drawing area
        axisX = override ? 0 : px*Math.abs(this._left);

        rightArrow.moveTo(axisX, 0);
        rightArrow.lineTo(axisX-halfWidth, arrowHeight);
        rightArrow.lineTo(axisX+halfWidth, arrowHeight);
        rightArrow.lineTo(axisX, 0);
      }
    }
  }

  /**
   * Draw the major tic marks for this graph axis
   *
   * @param {IGraphics} g EaselJS or comparable graphic context
   *
   * @param {number} ticLength Tic length in px for this graph axis
   *
   * @param {boolean} override True to override zero-test and anchor axis display (used in single-quadrant graph)
   * @default false
   *
   * @returns {nothing} Major tic marks are rendered into the supplied graphic context as long as the axis is currently
   * visible in the graph area.The graphic context should be cleared and all line/fill properties set on that context
   * before calling this method.
   */
  public drawMajorTicMarks(g: IGraphics, ticLength: number, override: boolean = false): void
  {
    let px: number = 0;

    const majorTics: Array<number>    = this._axis.getTicCoordinates(TSMT$Axis.MAJOR);
    const numMajorTics: number = majorTics.length;
    const numTics :number      = override ? numMajorTics-1 : numMajorTics;
    const halfLen: number      = 0.5*ticLength;

    let i: number = 0;
    let ticX: number, ticY: number;
    let axisX: number, axisY: number;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      if (!override && (this._top < 0 || this._bottom > 0)) {
        return;                                // axis does not appear in the drawing area, so no tic marks to be drawn
      }

      px    = this._height/(this._top-this._bottom);  // px per unit Y value
      axisY = override ? px*(this._top-this._bottom) : px*Math.abs(this._top);

      while (i < numTics)
      {
        ticX = majorTics[i];
        g.moveTo(ticX, axisY-halfLen);
        g.lineTo(ticX, axisY+halfLen);

        i++;
      }
    }
    else
    {
      if (!override && (this._left > 0 || this._right < 0)) {
        return;                                // vertical axis does not appear in drawing area
      }

      px    = this._length/(this._right-this._left);  // px per unit X value
      axisX = override ? 0 : px*Math.abs(this._left);

      i = numTics;

      while (i > 0)
      {
        ticY = majorTics[i];
        g.moveTo(axisX-halfLen, ticY);
        g.lineTo(axisX+halfLen, ticY);

        i--;
      }
    }
  }

  /**
   * Draw the minor tic marks for this graph axis
   *
   * @param {IGraphics} g EaselJS or IGraphics-compatible graphic context
   *
   * @param {number} ticLength Tic length in px for this graph axis
   *
   * @returns {nothing} Minor tic marks are rendered into the supplied graphic context as long as the axis is currently
   * visible in the graph area.  The graphic context should be cleared and all line/fill properties set on that context
   * before calling this method.
   */
  public drawMinorTicMarks(g: IGraphics, ticLength: number, override: boolean = false): void
  {
    let px: number = 0;

    const minorTics: Array<number> = this._axis.getTicCoordinates(TSMT$Axis.MINOR);
    const numMinorTics: number     = minorTics.length;
    const numTics :number          = override ? numMinorTics-1 : numMinorTics;
    const halfLen: number          = ticLength/2;

    let i: number = 0;
    let ticX: number, ticY: number;
    let axisX: number, axisY: number;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      if (!override && (this._top < 0 || this._bottom > 0)) {
        return;   // axis does not appear in the drawing area, so no tic marks to be drawn
      }

      px    = this._height/(this._top-this._bottom);  // px per unit Y value
      axisY = override ? px*(this._top-this._bottom) : px*Math.abs(this._top);

      while (i < numTics)
      {
        ticX = minorTics[i];
        g.moveTo(ticX, axisY-halfLen);
        g.lineTo(ticX, axisY+halfLen);

        i++;
      }
    }
    else
    {
      if (!override && (this._left > 0 || this._right < 0)) {
        return;      // vertical axis does not appear in drawing area
      }

      px    = this._length/(this._right-this._left);  // px per unit X value
      axisX = override ? 0 : px*Math.abs(this._left);

      i = numTics;

      while (i > 0)
      {
        ticY = minorTics[i];
        g.moveTo(axisX-halfLen, ticY);
        g.lineTo(axisX+halfLen, ticY);

        i--;
      }
    }
  }

  /**
   * Draw grid lines at the major tic marks for  this axis
   *
   * @param {IGraphics} g EaselJS or comparable graphic context
   *
   * @param {TSMT$ILineDecorator} Line decorator for drawing grid lines
   *
   * @returns {nothing} Grid lines are drawn into the supplied context based on the current drawing area in user
   * coordinates. The graphic context should be cleared and all line/fill properties set on that context before calling
   * this method.  Grid lines are drawn regardless of axis visibility in the drawing area.  Grid lines are drawn
   * vertically for a horizontal axis and horizontally for a vertical axis.
   */
  public drawGrid(g: IGraphics, line: TSMT$ILineDecorator): void
  {
    // draw grid lines at the major tics to the extends of the drawing area - grid lines are drawn whether the axis is visible or not
    const majorTics: Array<number> = this._axis.getTicCoordinates(TSMT$Axis.MAJOR);
    const numMajorTics: number     = majorTics.length;

    let i: number = 0;
    let ticX: number, ticY: number;

    if (this._orientation == TSMT$GraphAxis.HORIZONTAL)
    {
      while (i < numMajorTics)
      {
        ticX = majorTics[i];
        line.moveTo(g, ticX, 0);
        line.lineTo(g, ticX, this._height);

        i++;
      }
    }
    else
    {
      while (i < numMajorTics)
      {
        ticY = majorTics[i];
        line.moveTo(g, 0, ticY);
        line.lineTo(g, this._length, ticY);

        i++;
      }
    }
  }

  /**
   * Return a collection of tic mark labels for this graph axis
   *
   * @param {string} type Use the symbolic code Axis.MAJOR to set query tic increments and Axis.MINOR to query minor
   * tic increments
   *
   * @returns {Array<string>} Computed tic mark labels.  If axis bounds and length have not been set or the
   * major/minor tic increment is zero, then this method returns an empty array. An empty array is also returned
   * for an invalid type parameter.
   */
  public getTicMarkLabels(type: string): Array<string>
  {
    return this._axis.getTicMarks(type);
  }

  /**
   * Return a collection of integer tic mark locations based on a graphic container with a presumed start index of zero
   *
   * @param {string} type Use the symbolic code Axis.MAJOR to set query tic locations and Axis.MINOR to query
   * minor tic locations
   *
   * @returns {Array<number>} Coordinates for tic marks with the understanding that the axis begins at a zero coordinate
   * inside a graphic container in some production rendering environment.  The caller may loop over this array to draw
   * tic marks at the correct position based on current axis settings.
   */
  public getTicCoordinates(type: string): Array<number>
  {
    return this._axis.getTicCoordinates(type);
  }
}
