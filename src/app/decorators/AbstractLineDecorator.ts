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
 * Typescript Math Toolkit: Abstract Line Decorator.  Defines an base (solid-line) implementation of the
 * TSMT$ILineDecorator Interface
 *
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */
 import {TSMT$ILineDecorator} from './ILineDecorator';

 export class TSMT$AbstractLineDecorator implements TSMT$ILineDecorator
 {
   constructor() {}

   public setParams(_value: Object): void {};
  
   public moveTo(_g: any, _x: number, _y: number): void {_g.moveTo(_x, _y)};
  
   public lineTo(_g: any, _x: number, _y: number): void {_g.lineTo(_x, _y)};
  
   public curveTo(_g: any, _cx: number, _cy: number, _x1: number, _y1: number): void {_g.curveTo(_cx, _cy, _x1, _y1)};
   
   public clear(_g: any): void {_g.clear()}; 
 }