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
 * Draw properties for a function layer in the TSMT Single-Quadrant graph
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

// note all colors are in hex codes, i.e. '#xxyyzz'
export interface IFunctionDrawProperties
{
  thickness?: number;   // line thickness

  color: string;        // line color or circle fill

  alpha: number;        // alpha

  showLine: boolean;    // true if line is drawn between points

  showDot: boolean;     // true if points plotted with dot

  radius?: number;      // dot radius in px
}
