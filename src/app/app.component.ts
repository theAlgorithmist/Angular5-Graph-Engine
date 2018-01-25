/**
 * Copyright 2018 Jim Armstrong (www.algorithmist.net)
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
 * Root component for the Angular 5 single-quadrant graphing component example with linear least squares regression.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import { Component
       , OnInit
       , AfterViewInit
       , ViewChild
} from '@angular/core';

import {MockData} from "./data/MockData";

import {GraphComponent} from "./graph-component/graph.component";

import {TSMT$LLSQ  } from "./libs/llsq";
import {ILLSQResult} from "./libs/llsq";
import {IGraphDrawProperties} from "./graphing/GraphDrawProperties";

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit
{
  // data and regression result
  protected _xData: Array<number>;
  protected _yData: Array<number>;
  protected _props: IGraphDrawProperties;

  protected _llsqResult: ILLSQResult;

  @ViewChild(GraphComponent) _graph: GraphComponent;

  // user coordinate extents
  protected _xMin: number;
  protected _yMin: number;
  protected _xMax: number;
  protected _yMax: number;

  // graph extents in pixels
  protected _width: number;
  protected _height: number;

  // x and y major increments
  protected _majorX: number;
  protected _majorY: number;

  // points the define the regression line
  protected _rx1: number;
  protected _ry1: number;
  protected _rx2: number;
  protected _ry2: number;

  // control increments
  protected _maxValues: Array<number>  = [1   , 3   , 5  , 10, 24, 50, 100, 1000, 10000];
  protected _increments: Array<number> = [0.25, 0.25, 0.5, 1 ,  2, 5 , 10 , 100 , 500  ];

  constructor()
  {
    // initialize to 'large' graph; this will be used in a future modification where the graph size is changed
    // to 'large', 'medium', 'small'.
    this._width  = 500;
    this._height = 500;
  }

  /**
   * Angular lifecycle method - on init
   *
   * @returns {nothing}
   */
  public ngOnInit(): void
  {
    this._xData = MockData.SAMPLE1_X.slice();
    this._yData = MockData.SAMPLE1_Y.slice();
    this._props = JSON.parse( JSON.stringify(MockData.GRAPH_PROPS) );

    if (this._xData.length > 0 && this._yData.length > 0)
    {

      this._xMin = this._xMax = this._xData[0];
      this._yMin = this._yMax = this._yData[0];

      let i: number;
      const n: number = this._xData.length;
      for (i = 1; i < n; ++i)
      {
        this._xMin = Math.min(this._xMin, this._xData[i]);
        this._yMin = Math.min(this._yMin, this._yData[i]);

        this._xMax = Math.max(this._xMin, this._xData[i]);
        this._yMax = Math.max(this._yMax, this._yData[i]);
      }

      // perform the regression
      this._llsqResult = TSMT$LLSQ.fit(this._xData, this._yData);

      // compute two points on the line at the extremes of the domain; this is what will be graphed
      this._rx1 = this._xMin;
      this._ry1 = this._rx1*this._llsqResult.a + this._llsqResult.b;

      this._rx2 = this._xMax;
      this._ry2 = this._rx2*this._llsqResult.a + this._llsqResult.b;
    }
  }

  /**
   * Angular lifecycle method - after view init
   *
   * @returns {nothing}
   */
  public ngAfterViewInit(): void
  {
    if (this._graph)
    {
      // add a 'point' layer for the data points and another layer to draw the regression line
      this._graph.addFunctionLayer('points', {
        color: '#0000ff',
        alpha: 1,
        showLine: false,
        showDot: true,
        radius: 3
      });

      this._graph.addFunctionLayer('regression', {
        thickness: 2,
        color: '#ff0000',
        alpha: 1,
        showLine: true,
        showDot: false,
      });

      // add coordinate data to the layers; this call is separated since the definition of a layer will often
      // precede availability of coordinate data for that layer
      this._graph.addFunctionLayerData('points', this._xData, this._yData);
      this._graph.addFunctionLayerData('regression', [this._rx1, this._rx2], [this._ry1, this._ry2]);

      // define the remainder of the graph
      this._majorX = this.__setIncrements(this._xMax);
      this._majorY = this.__setIncrements(this._yMax);

      this._graph.majorX = this._majorX;
      this._graph.majorY = this._majorY;

      // set the graph bounds in user coordinates and axis extents in pixels
      const graphWidth: number  = this._width - (this._props.rightPx + this._props.leftPx);
      const graphHeight: number = this._height - (this._props.bottomPx + this._props.topPx);

      this._graph.setGraphBounds(this._xMin, this._yMax, this._xMax, this._yMin, graphWidth, graphHeight);

      // set the draw properties
      this._graph.graphProperties = this._props;

      // and, finally, draw the graph
      this._graph.draw();
    }
  }

  // assign graph increments based on model data
  protected __setIncrements(maxValue: number): number
  {
    const n: number = this._maxValues.length;

    let i: number;

    for (i = 0; i < n; ++i)
    {
      if (maxValue <= this._maxValues[i]) {
        return this._increments[i];
      }
    }

    return this._increments[n-1];
  }

  // button handlers

  /** @internal */
  public onClear(): void
  {
    if (this._graph) {
      this._graph.clear();
    }
  }

  /** @internal */
  public onRedraw(): void
  {
    if (this._graph) {
      this._graph.draw();
    }
  }
}
