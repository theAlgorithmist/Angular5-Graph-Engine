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
 * Typescript Math Toolkit: Line Decorator interface.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */
import {IGraphics} from "./IGraphics";

export interface TSMT$ILineDecorator
 {
   setParams(_value: Object): void;
  
   moveTo(_g: IGraphics, _x: number, _y: number): void;
  
   lineTo(_g: IGraphics, _x: number, _y: number): void;
  
   curveTo(_g: IGraphics, _cx: number, _cy: number, _x1: number, _y1: number): void;
   
   clear(_g: IGraphics): void;
 }