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
 * Some mock data and starting graph properties for your viewing pleasure :)
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
import {IGraphDrawProperties} from "../graphing/GraphDrawProperties";

export class MockData
{
  // sample data to fit
  public static SAMPLE1_X: Array<number> = [16, 3, 6, 9, 12, 8, 7, 1, 14];
  public static SAMPLE1_Y: Array<number> = [2, 7, 6, 2, 1, 4, 3, 5, 3];

  // properties that control the graph
  public static GRAPH_PROPS: IGraphDrawProperties = {
    leftPx: 50,
    topPx: 30,
    rightPx: 5,
    bottomPx: 40,
    showGrid: true,
    gridThicknes: 1,
    gridColor: '#ebebeb',
    gridAlpha: 1.0,
    xAxisThickness: 2,
    xAxisColor: '#666666',
    xAxisAlpha: 1.0,
    xAxisArrows: true,
    yAxisThickness: 2,
    yAxisColor: '#666666',
    yAxisAlpha: 1.0,
    yAxisArrows: true,
    ticLabelFont: 'bold 11px Arial',
    ticLabelColor: '#666666',
    gridStyle: 'dashed',
    decimals: 2,
    graphTitleFont: 'bold 14px Arial',
    graphLabelFont: 'bold 11px Arial'
  };

  constructor()
  {
    // empty
  }
}
