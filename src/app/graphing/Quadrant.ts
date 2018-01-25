/**
 * Copyright 2017 Jim Armstrong (www.algorithmist.net)
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
 * Typescript Math Toolkit lightweight single-quadrant (x-positive and y-positive) graph with axes, grid, and tic marks.
 * Limited function-layer capability is provided.  Axis display is constant, regardless of zero-x and zero-y
 * location and this display may not be zoomed or panned.
 *
 * EaselJS is used as the Canvas drawing engine.  This class renders into an EaselJS Container but does not do any
 * direct stage management; those functions are performed by the caller.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 *
 * dependency: easeljs ^0.8.2
 */

import {TSMT$GraphAxis         } from "./GraphAxis";
import {IGraphDrawProperties   } from "./GraphDrawProperties";
import {IFunctionDrawProperties} from "./FunctionDrawProperties";
import {ILabelDrawProperties   } from "./LabelDrawProperties";
import {TSMT$ILineDecorator    } from "../decorators/ILineDecorator";
import {LineDecoratorFactory   } from "../decorators/LineDecoratorFactory";
import {IGraphics              } from "../decorators/IGraphics";

import * as createjs from 'createjs-module';

export class TSMT$Quadrant
{
  protected _xAxis: TSMT$GraphAxis;    // x-axis
  protected _yAxis: TSMT$GraphAxis;    // y-axis

  protected _xAxisLength: number;      // x-axis length
  protected _yAxisLength: number;      // y-axis length
  protected _pxPerUnitX: number;       // pixels per unit x
  protected _pxPerUnitY: number;       // pixels per unit y

  // graph limits in coordinate values
  protected _left: number;
  protected _top: number;
  protected _right: number;
  protected _bottom: number;

  // pixel offsets of graph area (allows for axis labeling, stacked graphs, etc)
  protected _leftPx: number;
  protected _topPx: number;
  protected _rightPx: number;
  protected _bottomPx: number;

  // reference to grid/axis layers that are automatically created by the engine
  protected _gridShape: createjs.Shape;
  protected _xAxisShape: createjs.Shape;
  protected _xAxisTicMarks: createjs.Shape;
  protected _xAxisArrowsShape: createjs.Shape;
  protected _xAxisTicLabels: createjs.Container;
  protected _yAxisShape: createjs.Shape;
  protected _yAxisTicMarks: createjs.Shape;
  protected _yAxisArrowsShape: createjs.Shape;
  protected _yAxisTicLabels: createjs.Container;
  protected _functionLayers: createjs.Container;
  protected _labelLayers: createjs.Container;
  protected _fcnLayerMap: Object;
  protected _fcnLayerXCoords: Object;
  protected _fcnLayerYCoords: Object;
  protected _fcnDrawProps: Object;
  protected _labelLayerMap: Object;
  protected _labelDrawProps: Object;

  // line thickness and color properties of various axis elements
  protected _showGrid: boolean;
  protected _gridRendered: boolean;

  // manage tic-mark and tic-label display objects and parameters
  protected _xAxisTicDisplayObjects: Array<createjs.DisplayObject>;
  protected _xAxisTicTextObjects: Array<createjs.Text>;
  protected _yAxisTicDisplayObjects: Array<createjs.DisplayObject>;
  protected _yAxisTicTextObjects: Array<createjs.Text>;

  // draw properties
  protected _gridThickness: number;
  protected _gridColor: string;
  protected _gridAlpha: number;
  protected _xAxisThickness: number;
  protected _xAxisColor: string;
  protected _xAxisAlpha: number;
  protected _xAxisArrows: boolean;
  protected _yAxisThickness: number;
  protected _yAxisColor: string;
  protected _yAxisAlpha: number;
  protected _yAxisArrows: boolean;
  protected _ticLabelFont: string;
  protected _ticLableColor: string;

  // major/minor tic increments for each axis
  protected _majorXInc: number;
  protected _minorXInc: number;
  protected _majorYInc: number;
  protected _minorYInc: number;

  // number of decimals to display
  protected _decimals: number;

  // line decorators
  protected _gridDecorator: TSMT$ILineDecorator;
  protected _axisDecorator: TSMT$ILineDecorator;

  // invalidation
  protected _gridInvalidated: boolean;
  protected _labelsInvalidated: boolean;

  constructor(container: createjs.Container, props?: IGraphDrawProperties)
  {
    this._xAxis             = new TSMT$GraphAxis();
    this._yAxis             = new TSMT$GraphAxis();
    this._xAxis.orientation = TSMT$GraphAxis.HORIZONTAL;
    this._yAxis.orientation = TSMT$GraphAxis.VERTICAL;

    this._xAxisLength = 100;
    this._yAxisLength = 100;
    this._pxPerUnitX  = 0;
    this._pxPerUnitY  = 0;

    this._left   = 0;
    this._top    = 0;
    this._right  = 0;
    this._bottom = 0;

    this._leftPx   = 0;
    this._topPx    = 0;
    this._rightPx  = 0;
    this._bottomPx = 0;

    // reference to grid/axis layers that are automatically created by the engine
    this._gridShape        = new createjs.Shape();
    this._xAxisShape       = new createjs.Shape();
    this._xAxisTicMarks    = new createjs.Shape();
    this._xAxisArrowsShape = new createjs.Shape();
    this._xAxisTicLabels   = new createjs.Container();
    this._yAxisShape       = new createjs.Shape();
    this._yAxisTicMarks    = new createjs.Shape();
    this._yAxisArrowsShape = new createjs.Shape();
    this._yAxisTicLabels   = new createjs.Container();
    this._functionLayers   = new createjs.Container();
    this._labelLayers      = new createjs.Container();
    this._fcnLayerMap      = {};
    this._fcnLayerXCoords  = {};
    this._fcnLayerYCoords  = {};
    this._fcnDrawProps     = {};
    this._labelLayerMap    = {};
    this._labelDrawProps   = {};

    this._xAxisTicDisplayObjects = [];
    this._xAxisTicTextObjects    = [];
    this._yAxisTicDisplayObjects = [];
    this._yAxisTicTextObjects    = [];

    this._decimals = 0;

    // add 'axis' layers the supplied container
    container.addChild(this._gridShape);
    container.addChild(this._xAxisShape);
    container.addChild(this._xAxisTicMarks);
    container.addChild(this._xAxisArrowsShape);
    container.addChild(this._xAxisTicLabels);
    container.addChild(this._yAxisShape);
    container.addChild(this._yAxisTicMarks);
    container.addChild(this._yAxisArrowsShape);
    container.addChild(this._yAxisTicLabels);
    container.addChild(this._functionLayers);
    container.addChild(this._labelLayers);

    this._gridInvalidated = false;
    this._labelsInvalidated = false;

    if (props !== undefined && props != null) {
      this.setDrawProps(props);
    }

    this._axisDecorator = LineDecoratorFactory.create(LineDecoratorFactory.SOLID);
  }

  /**
   * Assign drawing properties to this quadrant graph
   *
   * @param {IQuadrantDrawProperties} props Draw props
   *
   * @returns {nothing}
   */
  public setDrawProps(props: IGraphDrawProperties): void
  {
    // is the graph window offset?
    this._leftPx         = props.leftPx   !== undefined ? props.leftPx   : this._leftPx;
    this._topPx          = props.topPx    !== undefined ? props.topPx    : this._topPx;
    this._rightPx        = props.rightPx  !== undefined ? props.rightPx  : this._rightPx;
    this._bottomPx       = props.bottomPx !== undefined ? props.bottomPx : this._bottomPx;

    this._showGrid       = props.showGrid;
    this._gridThickness  = props.gridThicknes;
    this._gridColor      = props.gridColor
    this._gridAlpha      = props.gridAlpha;
    this._xAxisThickness = props.xAxisThickness;
    this._xAxisColor     = props.xAxisColor;
    this._xAxisAlpha     = props.xAxisAlpha;
    this._xAxisArrows    = props.xAxisArrows;
    this._yAxisThickness = props.yAxisThickness;
    this._yAxisColor     = props.yAxisColor;
    this._yAxisAlpha     = props.xAxisAlpha;
    this._yAxisArrows    = props.yAxisArrows;
    this._ticLabelFont   = props.ticLabelFont;
    this._ticLableColor  = props.ticLabelColor;
    this._decimals       = Math.round(Math.abs(props.decimals));

    this._gridDecorator = LineDecoratorFactory.create(props.gridStyle);

    this._gridInvalidated = true;
  }

 /**
  * Clear the graph
  *
  * @returns {nothing} The graph layers remain in place; function layers are erased and label layers have all
  * labels removed.
  */
  public clear(): void
  {
    // TODO - Update these to use Map; the following is faster for ES5 target
    let layerName: string;
    for (layerName in this._fcnLayerMap)
    {
      if (this._fcnLayerMap.hasOwnProperty(layerName))
      {
        let shape: createjs.Shape = this._fcnLayerMap[layerName];
        if (shape !== undefined) {
          shape.graphics.clear();
        }
      }
    }

    for (layerName in this._labelLayerMap)
    {
      if (this._labelLayerMap.hasOwnProperty(layerName))
      {
        let container: createjs.Container = this._labelLayerMap[layerName];
        if (container !== undefined) {
          container.removeAllChildren();
        }
      }
    }
  }

  /**
   * Access x-coordinate of upper, left-hand corner of the graph
   *
   * @returns {number} x-coordinate of top-left corner of graph
   */
  public get left(): number
  {
    return this._left;
  }

  /**
   * Access y-coordinate of upper, left-hand corner of the graph
   *
   * @returns {number} y-coordinate of top-left corner of graph
   */
  public get top(): number
  {
    return this._top;
  }

  /**
   * Access x-coordinate of lower, right-hand corner of the graph
   *
   * @returns {number} x-coordinate of bottom-right corner of graph
   */
  public get right(): number
  {
    return this._right;
  }

  /**
   * Access y-coordinate of lower, right-hand corner of the graph
   *
   * @returns {number} y-coordinate of bottom-right corner of graph
   */
  public get bottom(): number
  {
    return this._bottom;
  }

  /**
   * Assign graph bounds - coordinate limits and axis lengths
   *
   * @param {number} left x-coordinate of top-left corner of graph area
   *
   * @param {number} top y-coordinate of top-left corner of graph area
   *
   * @param {number} right x-coordinate of bottom-right corner of graph area
   *
   * @param {number} bottom y-coordinate of bottom-right corner of graph area
   *
   * @param {number} xAxisLength x-axis length in pixels
   *
   * @param {number} yAxisLength y-axis length in pixels
   *
   * @returns {nothing}
   */
  public setGraphBounds(left: number, top: number, right: number, bottom: number, xAxisLength: number,
                        yAxisLength: number ): void
  {
    const l: number = isNaN(left) ? this._left : left;
    const t: number = isNaN(top) ? this._top : top;
    const r: number = isNaN(right) ? this._right : right;
    const b: number = isNaN(bottom) ? this._bottom : bottom;

    if (r > l && t > b)
    {
      this._top    = t;
      this._left   = l;
      this._right  = r;
      this._bottom = b;
    }

    this._xAxisLength = isNaN(xAxisLength) ? this._xAxisLength : Math.max(1, xAxisLength);
    this._yAxisLength = isNaN(yAxisLength) ? this._yAxisLength : Math.max(1, yAxisLength);

    this._pxPerUnitX = this._xAxisLength/(this._right - this._left);
    this._pxPerUnitY = this._yAxisLength/(this._top - this._bottom);

    this._xAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
    this._yAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);

    this._gridInvalidated   = true;
    this._labelsInvalidated = true;
  }

  /**
   * Assign the number of decimal places used when displaying tic labels
   *
   * @param {number} value Number of decimal places to display - must be zero or greater
   *
   * @returns {nothing}
   */
  public set decimals(value: number)
  {
    this._decimals          = isNaN(value) ? this._decimals : Math.max(0, Math.round(value));
    this._labelsInvalidated = true;
  }

  /**
   * Assign the x-axis major tic mark increment for the grid
   *
   * @param {number} major Major tic increment - must be greater than zero
   *
   * @returns {nothing}
   */
  public set majorXInc(major: number)
  {
    this._majorXInc       = isNaN(major) ? this._majorXInc : Math.max(0, major);
    this._xAxis.majorInc  = this._majorXInc;
    this._gridInvalidated = true;
  }

  /**
   * Assign the y-axis major tic mark increment for the grid
   *
   * @param {number} major Major tic increment - must be greater than zero
   *
   * @returns {nothing}
   */
  public set majorYInc(major: number)
  {
    this._majorYInc       = isNaN(major) ? this._majorYInc : Math.max(0, major);
    this._yAxis.majorInc  = this._majorYInc;
    this._gridInvalidated = true;
  }

  /**
   * Assign the x-axis minor tic mark increment for the grid
   *
   * @param {number} minor Minor tic increment - must be greater than zero
   *
   * @returns {nothing}
   */
  public set minorXInc(minor: number)
  {
    this._minorXInc       = isNaN(minor) ? this._minorXInc : Math.max(0, Math.round(minor));
    this._xAxis.minorInc  = this._minorXInc;
    this._gridInvalidated = true;
  }

  /**
   * Assign the y-axis minor tic mark increment for the grid
   *
   * @param {number} minor Minor tic increment - must be greater than zero
   *
   * @returns {nothing}
   */
  public set minorYInc(minor: number)
  {
    this._minorYInc       = isNaN(minor) ? this._minorYInc : Math.max(0, Math.round(minor));
    this._yAxis.minorInc  = this._minorYInc;
    this._gridInvalidated = true;
  }

  /**
   * Show (or hide) the grid
   *
   * @param {boolean} show : Boolean - true if the grid is visible
   *
   * @returns {nothing} Update the stage after this call!
   */
  public showGrid(show: boolean): void
  {
    this._showGrid = show;
    this._gridShape.visible = show;

    if (this._showGrid)
    {
      if (this._gridInvalidated) {
        this.__drawGrid();
      }
    }
  }

  /**
   * Redraw the entire display
   *
   * @returns {nothing} Every element is redrawn
   */
  public redraw(): void
  {
    if (this._showGrid) {
      this.__drawGrid();
    }

    this.__drawAxes();

    this.__ticLabels(true, true);

    this.__graphFunctionLayers();
  }

  /**
   * Add a function layer
   *
   * @param {string} layerName Function layer name
   *
   * @param {IFunctionDrawProperties} Draw properties for this layer
   *
   * @returns {nothing} This performs only the raw definition; it does not associate plottable data
   * with the function layer
   */
  public addFunctionlayer(layerName: string, props: IFunctionDrawProperties): void
  {
    if (layerName !== undefined && layerName != '')
    {
      const shape: createjs.Shape = new createjs.Shape();

      this._functionLayers.addChild(shape);

      // allow lookup by layer name
      this._fcnLayerMap[layerName]  = shape;
      this._fcnDrawProps[layerName] = props;

      // points for this layer
      this._fcnLayerXCoords[layerName] = [];
      this._fcnLayerYCoords[layerName] = [];
    }
  }

  /**
   * Add coordinate data to an existing function layer
   *
   * @param {string} layerName Function layer name
   *
   * @param {Array<number>} xCoord x-coordinates
   *
   * @param {Array<number>} yCoord y-coordinates
   *
   * @returns {nothing} Coordinate data for this layer is stored as long as the inputs are not undefined
   * and the length of the two arrays matches
   */
  public addFunctionlayerData(layerName: string, xCoord: Array<number>, yCoord: Array<number>): void
  {
    // the testing is a bit medieval since there are a lot of ways to screw up this call, in which case
    // everything breaks or nothing displays

    if (layerName !== undefined && layerName != '')
    {
      if (xCoord !== undefined && xCoord != null )
      {
        if (Object.prototype.toString.call(xCoord) == '[object Array]' &&
            Object.prototype.toString.call(xCoord) == '[object Array]')
        {
          if (xCoord.length == yCoord.length)
          {
            // store coords for this layer
            this._fcnLayerXCoords[layerName] = xCoord.slice();
            this._fcnLayerYCoords[layerName] = yCoord.slice();
          }
        }
      }
    }
  }

  /**
   * Add a Label layer
   *
   * @param {string} layerName  Label layer name
   *
   * @param {ILabelDrawProperties} props Draw properties for this label layer
   */
  public addLabelLayer(layerName: string, props: ILabelDrawProperties): void
  {
    const container: createjs.Container = new createjs.Container();

    this._labelLayers.addChild(container);

    // allow lookup by layer name
    this._labelLayerMap[layerName]  = container;
    this._labelDrawProps[layerName] = props;
  }

  /**
   * Graph the specified label layer
   *
   * @param {string} layerName Layer name
   *
   * @param {Array<number>} xCoord Array of x-coordinates for labels
   *
   * @param {Array<number>} yCoord Array of y-coordinates for labels
   *
   * @param {Array<string>} labels Label text
   *
   * @returns {nothing} Displays the label data on the graph provided input data is valid; note that clipping is not
   * yet supported
   */
  public graphLabelLayer(layerName: string, xCoord: Array<number>, yCoord: Array<number>, labels: Array<string>): void
  {
    const container: createjs.Container = this._labelLayerMap[layerName];
    if (container === undefined) {
      return;
    }

    if (xCoord.length == 0 || yCoord.length == 0) {
      return;
    }

    const n: number                   = xCoord.length;
    const props: ILabelDrawProperties = <ILabelDrawProperties> this._labelDrawProps[layerName];

    // clear any existing labels
    container.removeAllChildren();

    let i: number;
    let xPx: number;
    let yPx: number;
    let txt: createjs.Text;

    for (i = 0; i < n; ++i)
    {
      xPx = Math.round( (xCoord[i] - this._left)*this._pxPerUnitX );
      yPx = Math.round( (this._top - yCoord[i])*this._pxPerUnitY );

      txt             = new createjs.Text(labels[i], props.font, props.color);
      txt.snapToPixel = true;
      txt.x           = xPx;
      txt.y           = yPx;

      container.addChild(txt);
    }
  }

  /**
   * Graph the specified function layer
   *
   * @param {string} layerName Layer name
   *
   * @param {Array<number>} xCoord Array of x-coordinates
   *
   * @param {Array<number>} yCoord Array of y-coordinates
   *
   * @returns {nothing} Displays the data on the graph provided input data is valid; note that clipping is not
   * yet supported
   */
  public graphLayer(layerName: string, xCoord?: Array<number>, yCoord?: Array<number>): void
  {
    // lookup the layer shape and other data
    const shape: createjs.Shape = this._fcnLayerMap[layerName];

    if (shape === undefined) {
      return;
    }

    shape.snapToPixel = true;

    if (xCoord && yCoord)
    {
      if (xCoord.length == 0 || yCoord.length == 0 )
      {
        // nothing to do ...
        return;
      }

      // store coords for later redraw
      this._fcnLayerXCoords[layerName] = xCoord.slice();
      this._fcnLayerYCoords[layerName] = yCoord.slice();
    }
    else
    {
      xCoord = this._fcnLayerXCoords[layerName];
      yCoord = this._fcnLayerYCoords[layerName];
    }

    const n: number                      = xCoord.length;
    const props: IFunctionDrawProperties = <IFunctionDrawProperties> this._fcnDrawProps[layerName];
    const g: createjs.Graphics           = shape.graphics;

    let r: number;
    if (props.showDot)
    {
      r = props.radius;
      r = Math.round(Math.abs(r));
      r = Math.max(2, r);
    }

    g.clear();

    let xPx: number;
    let yPx: number;
    let i: number;

    if (props.showLine)
    {
      g.setStrokeStyle(props.thickness, 2, 1, 3, false);
      g.beginStroke(props.color);

      for (i = 0; i < n; ++i)
      {
        xPx = Math.round( (xCoord[i] - this._left)*this._pxPerUnitX );
        yPx = Math.round( (this._top - yCoord[i])*this._pxPerUnitY );

        if (i == 0)
        {
          g.moveTo(xPx, yPx);
        }
        else
        {
          g.lineTo(xPx, yPx);
        }
      }

      g.endStroke();
    }

    if (props.showDot)
    {
      for (i = 0; i < n; ++i)
      {
        xPx = Math.round( (xCoord[i] - this._left)*this._pxPerUnitX );
        yPx = Math.round( (this._top - yCoord[i])*this._pxPerUnitY );

        g.beginFill(props.color);
        g.drawCircle(xPx, yPx, r);
        g.endFill();
      }
    }
  }

  // draw all function layers

  /** @internal */
  protected __graphFunctionLayers(): void
  {
    // TODO - Update this to use Map; the following is faster for ES5 target
    let layerName: string;
    for (layerName in this._fcnLayerMap)
    {
      if (this._fcnLayerMap.hasOwnProperty(layerName))
      {
        // currently, all layers are visible; next update will allow for layer visibility to be toggled
        this.graphLayer(layerName);
      }
    }
  }

  // draw the grid

  /** @internal */
  protected __drawGrid(): void
  {
    if (!this._showGrid) {
      return;
    }

    const g: IGraphics = this._gridShape.graphics;

    // TODO - break out R,G,B from hex color and use createjs.Graphics.getRGB() to apply color and alpha
    g.clear();
    g.setStrokeStyle(this._gridThickness);
    g.beginStroke(this._gridColor);

    this._xAxis.drawGrid(g, this._gridDecorator);
    this._yAxis.drawGrid(g, this._gridDecorator);

    g.endStroke();
  }

  // draw the x and y axes

  /** @internal */
  protected __drawAxes(): void
  {
    const txWidth: number  = 3*this._xAxisThickness+2;
    const txHeight: number = 2*this._xAxisThickness+1;

    let g: IGraphics = this._xAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(this._xAxisThickness);
    g.beginStroke(this._xAxisColor);
    this._xAxis.drawAxis(g, this._axisDecorator, txWidth, txHeight, true);
    g.endStroke();

    const tyWidth: number  = 3*this._yAxisThickness+1;
    const tyHeight: number = 2*this._yAxisThickness+2;

    g = this._yAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(this._yAxisThickness);
    g.beginStroke(this._yAxisColor);
    this._yAxis.drawAxis(g, this._axisDecorator, txWidth, txHeight, true);
    g.endStroke();

    if (this._xAxisArrows)
    {
      g = this._xAxisArrowsShape.graphics;
      g.clear();
      g.beginFill(this._xAxisColor);
      this._xAxis.drawArrows(null, g, txWidth, txHeight, true);
      g.endFill();
    }

    if (this._yAxisArrows)
    {
      g = this._yAxisArrowsShape.graphics;
      g.clear();
      g.beginFill(this._yAxisColor);
      this._yAxis.drawArrows(null, g, tyWidth, tyHeight, true);
      g.endFill();
    }

    // major and minor tic marks for each axis
    let majorThickness: number, minorThickness: number, majorHeight: number, minorHeight: number;
    if (this._majorXInc > 0)
    {
      majorThickness = Math.max(1, this._xAxisThickness-1);
      majorHeight    = 6*this._xAxisThickness;

      g = this._xAxisTicMarks.graphics;
      g.clear();
      g.setStrokeStyle(majorThickness);
      g.beginStroke(this._xAxisColor);
      this._xAxis.drawMajorTicMarks(g, majorHeight, true);
      g.endStroke();
    }

    if (this._majorYInc > 0)
    {
      majorThickness = Math.max(1, this._yAxisThickness-1);
      majorHeight    = 6*this._yAxisThickness;

      g = this._yAxisTicMarks.graphics;
      g.clear();
      g.setStrokeStyle(majorThickness);
      g.beginStroke(this._yAxisColor);
      this._yAxis.drawMajorTicMarks(g, majorHeight, true);
      g.endStroke();
    }

    if (this._minorXInc > 0)
    {
      minorThickness = Math.max(1, this._xAxisThickness-2);
      minorHeight    = Math.max(2, 0.5*majorHeight);

      g = this._xAxisTicMarks.graphics;
      g.setStrokeStyle(minorThickness);
      g.beginStroke(this._xAxisColor);
      this._xAxis.drawMinorTicMarks(g, minorHeight, true);
      g.endStroke();
    }

    if (this._minorYInc > 0)
    {
      minorThickness = Math.max(1, this._yAxisThickness-2);
      minorHeight    = Math.max(2, 0.5*majorHeight);

      g = this._yAxisTicMarks.graphics;
      g.setStrokeStyle(minorThickness);
      g.beginStroke(this._yAxisColor);
      this._yAxis.drawMinorTicMarks(g, minorHeight, true);
      g.endStroke();
    }

    this._gridInvalidated = false;
    this._gridRendered    = true;
  }

  // render tic labels
  protected __ticLabels(redraw: boolean, override: boolean = false): void
  {
    if (!redraw)
    {
      this._xAxisTicTextObjects.length    = 0;
      this._xAxisTicDisplayObjects.length = 0;
      this._yAxisTicTextObjects.length    = 0;
      this._yAxisTicDisplayObjects.length = 0;
    }

    // get the pixel locations of the major tic marks
    let majorTics: Array<number> = this._xAxis.getTicCoordinates(TSMT$GraphAxis.MAJOR);
    let numMajorTics: number     = majorTics.length;
    let numLabels: number        = this._xAxisTicDisplayObjects.length;

    let lbl: createjs.Text;
    let dispObj: createjs.DisplayObject;
    let i: number;
    let ticX: number, ticY: number, axisX: number, axisY: number, baseline: number;

    if (numLabels < numMajorTics)
    {
      // create labels JIT and then re-use the pool every redraw
      for (i = numLabels; i < numMajorTics; ++i)
      {
        lbl     = new createjs.Text( " ", this._ticLabelFont, this._yAxisColor );
        dispObj = this._xAxisTicLabels.addChild(lbl);

        this._xAxisTicTextObjects.push( lbl );
        this._xAxisTicDisplayObjects.push( dispObj );
      }
    }

    // use however many tic labels are necessary and hide the remaining ones
    let labelText: Array<string> = this._xAxis.getTicMarkLabels(TSMT$GraphAxis.MAJOR);

    // make all tic labels invisible by default
    for (i = 0; i < numLabels; ++i) {
      this._xAxisTicDisplayObjects[i].visible = false;
    }

    let axisLength: number = this._xAxis.length;

    if (this._xAxis.isVisible || override)
    {
      // position the labels - it's a matter of style, but for this demo, the endpoint labels are not displayed if
      // they are near the Canvas edge
      axisY    = override ? this._pxPerUnitY*(this._top-this._bottom) : this._xAxis.axisOffset;
      baseline = axisY + 10;

      for (i = 0; i < numMajorTics; ++i)
      {
        lbl             = this._xAxisTicTextObjects[i];
        dispObj         = this._xAxisTicDisplayObjects[i];

        if( labelText[i] != "0" )
        {
          lbl.text        = this.__formatTicNumber(+labelText[i]);
          ticX            = majorTics[i];
          dispObj.x       = Math.round( ticX - 0.5*lbl.getBounds().width );
          dispObj.y       = baseline;
          dispObj.visible = override ? ticX < axisLength-10 : ticX > 10 && ticX < axisLength-10;
        }
      }
    }

    majorTics    = this._yAxis.getTicCoordinates(TSMT$GraphAxis.MAJOR);
    numMajorTics = majorTics.length;
    numLabels    = this._yAxisTicDisplayObjects.length;

    if (numLabels < numMajorTics)
    {
      // create labels JIT and then re-use the pool every redraw
      for (i = numLabels; i < numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", this._ticLabelFont, this._yAxisColor );
        dispObj = this._yAxisTicLabels.addChild(lbl);

        this._yAxisTicTextObjects.push( lbl );
        this._yAxisTicDisplayObjects.push( dispObj );
      }
    }

    // use required tic labels & hide the remaining ones
    labelText = this._yAxis.getTicMarkLabels(TSMT$GraphAxis.MAJOR);

    // make all tic labels invisible by default
    for (i = 0; i < numLabels; ++i) {
      this._yAxisTicDisplayObjects[i].visible = false;
    }

    const axisHeight: number = this._yAxis.height;
    if (this._yAxis.isVisible || override)
    {
      axisX = override ? 0 : this._yAxis.axisOffset;

      let maxWidth: number = 0;

      for (i = 0; i < numMajorTics; ++i)
      {
        lbl     = this._yAxisTicTextObjects[i];
        dispObj = this._yAxisTicDisplayObjects[i];

        if (labelText[i] != "0")
        {
          lbl.text        = this.__formatTicNumber(+labelText[i]);
          ticY            = axisHeight - majorTics[i];
          maxWidth        = Math.max(maxWidth, lbl.getBounds().width);
          dispObj.y       = Math.round( ticY - 0.5*lbl.getBounds().height ) - 1;
          dispObj.visible = override ? ticY > 10 : ticY > 10 && ticY < axisHeight-10;
        }
      }

      for (i = 0; i < numMajorTics; ++i)
      {
        lbl     = this._yAxisTicTextObjects[i];
        dispObj = this._yAxisTicDisplayObjects[i];

        if (labelText[i] != "0") {
          dispObj.x = axisX - maxWidth - 4;
        }
      }
    }

    this._labelsInvalidated = false;
  }

  // format tic label display

  /** @internal */
  protected __formatTicNumber(value: number): string
  {
    // round to currently specified number of decimals unless the value is integral
    const integral: boolean = Math.round(value) == value;

    return integral ? value.toString() : value.toFixed(this._decimals);
  }
}
