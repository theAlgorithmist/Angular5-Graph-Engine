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
 * A simple factory for generating line decorators
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import {TSMT$ILineDecorator       } from "./ILineDecorator";
import {TSMT$AbstractLineDecorator} from "./AbstractLineDecorator";
import {TSMT$DashedLineDecorator  } from "./DashedLineDecorator";
import {TSMT$DottedLineDecorator  } from "./DottedLineDecorator";

export class LineDecoratorFactory
{
  // currently available decorators
  public static DASHED: string = 'dashed';
  public static DOTTED: string = 'dotted';
  public static SOLID: string  = 'solid';

  protected static _decorators: Object = {solid: null, dashed: null, dotted: null};

  constructor()
  {
    // empty
  }

  /**
   * Create a new decorator based on the input type
   *
   * @param {string} type One of the decorator symbolic codes, i.e LineDecoratorFactory.DASHED
   *
   * @returns {TSMT$ILineDecorator}
   */
  public static create(type: string): TSMT$ILineDecorator | null
  {
    // check the object pool
    let decorator: TSMT$ILineDecorator = LineDecoratorFactory._decorators[type];
    if (decorator !== undefined && decorator != null) {
      return <TSMT$ILineDecorator> decorator;
    }

    switch (type)
    {
      case LineDecoratorFactory.SOLID:
        decorator = new TSMT$AbstractLineDecorator();
        LineDecoratorFactory._decorators[LineDecoratorFactory.SOLID] = decorator;
      break;

      case LineDecoratorFactory.DASHED:
        decorator = new TSMT$DashedLineDecorator();
        LineDecoratorFactory._decorators[LineDecoratorFactory.DASHED] = decorator;
      break;

      case LineDecoratorFactory.DOTTED:
        decorator = new TSMT$DottedLineDecorator();
        LineDecoratorFactory._decorators[LineDecoratorFactory.DOTTED] = decorator;
      break;

      default:
        decorator = new TSMT$AbstractLineDecorator();
        LineDecoratorFactory._decorators[LineDecoratorFactory.SOLID] = decorator;
      break;
    }

    return decorator;
  }
}
