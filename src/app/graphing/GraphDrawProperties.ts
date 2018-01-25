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
 * Typescript Math Toolkit draw properties for a single-quadrant graph; these control the graph display, not the
 * function or label layers
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 *
 * dependency: easeljs ^0.8.2 (or comparable graphic environment)
 */

// note all colors are in hex codes, i.e. '#xxyyzz'
export interface IGraphDrawProperties
{
  leftPx?: number;          // left pixel offset

  topPx?: number;           // top pixel offset

  rightPx?: number;         // right pixel offset

  bottomPx?: number;        // bottom pixel offset

  showGrid: boolean;        // true if quadrant grid is displayed

  gridThicknes: number;     // grid line thickness in px

  gridColor: string;        // grid color

  gridAlpha: number;        // grid alpha

  gridStyle: string;        // grid line style

  xAxisThickness: number;   // x-axis line thickness in px

  xAxisColor: string;       // x-axis line color

  xAxisAlpha: number;       // x-axis line alpha

  xAxisArrows: boolean;     // true if right-arrow is displayed on x-axis

  yAxisThickness: number;   // y-axis line thickness in px

  yAxisColor: string;       // y-axis line color

  yAxisAlpha: number;       // y-axis line alpha

  yAxisArrows: boolean;     // true if up-arrow is displayed on y-axis

  ticLabelFont: string;     // tic label font

  ticLabelColor: string;    // tic label color

  graphTitleFont: string;   // font for graph and axis titles

  graphLabelFont: string;   // font for graph labels in a label layer

  decimals: number;         // number decimal places to display in tic labels
}
