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
 * App module file for the Angular 5 single-quadrant graph component demo
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

// platform
import { BrowserModule           } from '@angular/platform-browser';
import { NgModule                } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FlexLayoutModule        } from "@angular/flex-layout";

// Material
import { MatButtonModule } from "@angular/material";

// Application
import { AppComponent            } from './app.component';
import { CanvasSelectorDirective } from "./canvas-selector/canvas-selector.directive";
import { GraphComponent          } from "./graph-component/graph.component";

const ANGULAR_MODULES: any[] = [
  BrowserModule, BrowserAnimationsModule, FlexLayoutModule
];

const MATERIAL_MODULES: any[] = [
  MatButtonModule
];

const OTHER_MODULES: any[] = [
  // for future use
];

const APP_DECLARATIONS: any[] = [AppComponent, CanvasSelectorDirective, GraphComponent];

const APP_PROVIDERS: any[] = [];

@NgModule({
  declarations: APP_DECLARATIONS,
  imports: [
    ANGULAR_MODULES, MATERIAL_MODULES, OTHER_MODULES
  ],
  providers: APP_PROVIDERS,
  bootstrap: [AppComponent]
})
export class AppModule { }
