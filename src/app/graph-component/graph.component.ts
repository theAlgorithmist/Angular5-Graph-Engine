import { Component
       , OnInit
       , AfterViewInit
       , ViewChild
       , Input
} from '@angular/core';

// Canvas selector
import {CanvasSelectorDirective} from "../canvas-selector/canvas-selector.directive";

// Quadrant graph
import {TSMT$Quadrant          } from "../graphing/Quadrant";
import {IGraphDrawProperties   } from "../graphing/GraphDrawProperties";
import {IFunctionDrawProperties} from "../graphing/FunctionDrawProperties";
import {ILabelDrawProperties   } from "../graphing/LabelDrawProperties";

import * as createjs from 'createjs-module';

@Component({
  selector: 'adt-graph',

  templateUrl: './graph.component.html',

  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit
{
  @Input() xAxisLabel: string;               // x-axis label
  @Input() yAxisLabel: string;               // y-axis label
  @Input() title: string;                    // graph title

  // graphing surface as well as its width/height, which is the w/h of the total graph area
  @ViewChild(CanvasSelectorDirective) _surface: CanvasSelectorDirective;
  protected _width: number  = 0;
  protected _height: number = 0;

  // graph-related
  protected _stage: createjs.Stage;          // EaselJS Stage reference
  protected _props: IGraphDrawProperties;    // draw properties for the graph
  protected _graph: TSMT$Quadrant;           // quadrant (graph) area only without labels/title

  // user coordinate extents of the graph
  protected _xMin: number = 0;
  protected _xMax: number = 0;
  protected _yMin: number = 0;
  protected _yMax: number = 0;

  // width/height of just the quadrant graph in pixels
  protected _graphPxWidth: number  = 0;
  protected _graphPxHeight: number = 0;

  protected _graphContainer: createjs.Container;
  protected _labelContainer: createjs.Container;

  // fonts can be set in the graph properties; these provide some default values
  protected _graphTitleFont: string = 'bold 14px Arial';
  protected _graphLabelFont: string = 'bold 11px Arial';

  constructor()
  {
    // empty
  }

  /**
   * Angular lifecycle handler - on init
   *
   * @returns {nothing}
   */
  public ngOnInit(): void
  {
    // reserved for future use
  }

  /**
   * Angular lifecycle handler - after view init
   *
   * @returns {nothing}
   */
  public ngAfterViewInit(): void
  {
    if (this._surface)
    {
      this._stage  = this._surface.createStage();
      this._width  = this._surface.width;
      this._height = this._surface.height;

      this.__easeljsSetup();

      this._graph = new TSMT$Quadrant(this._graphContainer);
    }
  }

  /**
   * Access graph area width in pixels
   *
   * @returns {number}
   */
  public get width(): number
  {
    return this._width;
  }

  /**
   * Access graph area height in pixels
   *
   * @returns {number}
   */
  public get height(): number
  {
    return this._height;
  }

  /**
   * Assign the major tic increment value along the x axis
   *
   * @param {number} value Major tic increment
   *
   * @returns {nothing}
   */
  public set majorX(value: number)
  {
    if (!isNaN(value) && value > 0) {
      this._graph.majorXInc = value;
    }
  }

  /**
   * Assign the major tic increment value along the y axis
   *
   * @param {number} value Major tic increment
   *
   * @returns {nothing}
   */
  public set majorY(value: number)
  {
    if (!isNaN(value) && value > 0) {
      this._graph.majorYInc = value;
    }
  }

  /**
   * Assign the minor tic increment along the x axis
   *
   * @param {number} value Minor tic increment
   *
   * @returns {nothing}
   */
  public set minorX(value: number)
  {
    if (!isNaN(value) && value > 0) {
      this._graph.minorXInc = value;
    }
  }

  /**
   * Assign the minor tic increment along the y axis
   *
   * @param {number} value Minor tic increment
   *
   * @returns {nothing}
   */
  public set minorY(value: number)
  {
    if (!isNaN(value) && value > 0) {
      this._graph.minorYInc = value;
    }
  }

  /**
   * Assign graph bounds in user coordinates as well as viewable graph width/height in pixels
   *
   * @param {number} left x-coordinate of top-left corner of graphing area
   *
   * @param {number} top y-coordinate of top-left corner of graphing area
   *
   * @param {number} right x-coordinate of bottom-right corner of graphing area
   *
   * @param {number} bottom y-coordinate of bottom-right corner of graphing area
   *
   * @param {number} graphWidth Width of graphing area in pixels
   *
   * @param {number} graphHeight Height of graphing area in pixels
   *
   * @returns {nothing}
   */
  public setGraphBounds(left: number, top: number, right: number, bottom: number, graphWidth: number, graphHeight: number): void
  {
    // cache inputs
    this._xMin = !isNaN(left)   && left   >= 0 ? left   : this._xMin;
    this._yMax = !isNaN(top)    && top    >= 0 ? top    : this._yMax;
    this._xMax = !isNaN(right)  && right  >= 0 ? right  : this._xMax;
    this._yMin = !isNaN(bottom) && bottom >= 0 ? bottom : this._yMin;

    this._graphPxWidth  = !isNaN(graphWidth) && graphWidth >= 0 ? graphWidth : this._graphPxWidth;
    this._graphPxHeight = !isNaN(graphHeight) && graphHeight >= 0 ? graphHeight : this._graphPxHeight;

    this._graph.setGraphBounds(this._xMin, this._yMax, this._xMax, this._yMin, this._graphPxWidth, this._graphPxHeight);
  }

  /**
   * Assign graph draw properties
   *
   * @param {IGraphDrawProperties} props Graph draw properties
   *
   * @returns {nothing} Sets only properties that control the general (background) graph display, not individual layers
   */
  public set graphProperties(props: IGraphDrawProperties)
  {
    if (props)
    {
      // cache the current properties
      this._props = JSON.parse(JSON.stringify(props));
    }

    if (props && this._graph)
    {
      // the font strings are the easiest to forget, so arrange a bailout just so something displays
      if (props.graphTitleFont == '') {
        props.graphTitleFont = this._graphTitleFont;
      }

      if (props.graphLabelFont == '') {
        props.graphLabelFont = this._graphLabelFont;
      }

      this._graph.setDrawProps(props);
    }
  }

  /**
   * Add a function layer to the graph
   *
   * @param {string} layerName Layer name
   *
   * @param {IFunctionDrawProperties} data Draw properties associated with this layer
   *
   * @returns {nothing}
   */
  public addFunctionLayer(layerName: string, data: IFunctionDrawProperties): void
  {
    if (layerName !== undefined && layerName != '' && data && this._graph) {
      this._graph.addFunctionlayer(layerName, data);
    }
  }

  /**
   * Add coordinate data to a function layer
   *
   * @param {string} layerName Layer name
   *
   * @param {Array<number>} xData x-coordinates
   *
   * @param {Array<number>} yData y-coordinates
   *
   * @returns {nothing} Data assignment is separated from layer definition as definitions are often available in advance
   * of data
   */
  public addFunctionLayerData(layerName: string, xData: Array<number>, yData: Array<number>): void
  {
    if (layerName !== undefined && layerName != '' && xData && yData && this._graph) {
      this._graph.addFunctionlayerData(layerName, xData, yData);
    }
  }

  /**
   * Add a label layer to the graph
   *
   * @param {string} layerName Layer name
   *
   * @param {ILabelDrawProperties} data Draw properties for the label layer
   *
   * @returns {nothing}
   */
  public addLabelLayer(layerName: string, data: ILabelDrawProperties): void
  {
    if (layerName !== undefined && layerName != '' && data && this._graph) {
      this._graph.addLabelLayer(layerName, data);
    }
  }

  /**
   * Graph a single layer with the supplied data
   *
   * @param {string} layerName Layer name
   *
   * @param {Array<number>} xData x-coordinates
   *
   * @param {Array<number>} yData y-coordinates
   *
   * @returns {nothing} This is often used for label layers or graphing a single layer, one coordinate at a time
   */
  public graphLayer(layerName: string, xData: Array<number>, yData: Array<number>): void
  {
    if (layerName !== undefined && layerName != '' && xData && yData) {
      this._graph.graphLayer(layerName, xData, yData);
    }
  }

  /**
   * Draw all layers in the graph
   *
   * @param {number} width Optional new width for the graph area
   *
   * @param {number} height Optional new height for the graph area
   *
   * @returns {nothing} Nothing is done with new width/height inputs in this version; that part of the API is reserved
   * for future modifications. MUST set the graph properties before calling the draw() method.
   */
  public draw(width?: number, height?: number): void
  {
    if (width && height)
    {
      if (width > 0 && height > 0) {
        // TODO - handle w/h reset
      }
    }

    this.__updateGraph();

    this._graph.redraw();

    this._stage.update();
  }

  /**
   * Clear the graph area
   *
   * @returns {nothing}
   */
  public clear(): void
  {
    if (this._graph)
    {
      this._graph.clear();

      this._stage.update();
    }
  }

  // setup easelJS
  protected __easeljsSetup(): void
  {
    this._graphContainer = new createjs.Container();
    this._labelContainer = new createjs.Container();

    this._stage.addChild(this._graphContainer);
    this._stage.addChild(this._labelContainer);
  }

  // update the graph
  protected __updateGraph(): void
  {
    if (!this._graph) {
      return;
    }

    // clear everything out
    this._graph.clear();

    this._labelContainer.removeAllChildren();

    // create all the labels
    const graphLabel: createjs.Text = new createjs.Text(this.title     , this._props.graphTitleFont);
    const xAxisLabel: createjs.Text = new createjs.Text(this.xAxisLabel, this._props.graphTitleFont);
    const yAxisLabel: createjs.Text = new createjs.Text(this.yAxisLabel, this._props.graphTitleFont);

    graphLabel.snapToPixel = true;
    xAxisLabel.snapToPixel = true;
    yAxisLabel.snapToPixel = true;

    let textW: number, textH: number;

    textW = Math.round( graphLabel.getBounds().width );

    // position the labels and add to container
    graphLabel.x = Math.round(0.5*(this._width-textW));
    graphLabel.y = 2;

    textW = Math.round(xAxisLabel.getBounds().width);
    textH = Math.round(xAxisLabel.getBounds().height);

    xAxisLabel.x = Math.round(0.5*(this._width-textW));
    xAxisLabel.y = this._height - textH - 2;

    textW = Math.round(yAxisLabel.getBounds().width);
    textH = Math.round(yAxisLabel.getBounds().height);

    yAxisLabel.x        = textH + 2;
    yAxisLabel.y        = Math.round(0.5*(this._height-textW));
    yAxisLabel.rotation = 90;

    this._labelContainer.addChild(graphLabel);
    this._labelContainer.addChild(xAxisLabel);
    this._labelContainer.addChild(yAxisLabel);

    // set the graph bounds in user coordinates and axis extents in pixels
    this._graphPxWidth  = this._width - (this._props.rightPx + this._props.leftPx);
    this._graphPxHeight = this._height - (this._props.bottomPx + this._props.topPx);

    this._graph.setGraphBounds(this._xMin, this._yMax, this._xMax, this._yMin, this._graphPxWidth, this._graphPxHeight);

    // offset the container
    this._graphContainer.x = this._props.leftPx;
    this._graphContainer.y = this._props.topPx;
  }
}
