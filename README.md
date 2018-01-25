# Angular 5 Lightweight Single-Quadrant Graphing Engine

I have a single-quadrant (non-negative _x_ and _y_) graphing class in the Typescript Math Toolkit, however, it only draws the graph area (not axis labels and title).  The intent was to use that class and its supporting classes as a base for a lightweight Angular graphing component.

Many applications, including proof-of-concepts, involve physical quantities that can never be less than zero.  A first-quadrant engine can be very valuable both for production and rapid visualization of modest amounts of multi-layer data.  That is the exact purpose of this engine.

I had planned on developing this engine for exclusive use in my client-only Angular Dev Toolkit, however, I believe the _baseline_ version is useful for the general Angular community.  There is just enough functionality to grow this engine to suit a variety of applications.  Or, you may use the low-level Typescript classes to build a completely new engine on your own.  If you are into React or Vue, then go for it!

So, while I will continue to enhance this engine in the Angular Dev Toolkit, the baseline version provided in this repo is totally open-source.


Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Angular: 5.2

Material: 5.1

flex-layout: 2.0.0-beta.12

Angular CLI: 1.6.5

Dependency: EaselJS 0.83


## Introduction

The Angular Dev Toolkit (ADT) baseline single-quadrant graph engine consists of a (Canvas-based) graph area that may be optionally gridded, with permanently fixed _x_ and _y_ axes.  Only data that resides in the first quadrant (non-negative _x_ and _y_) may be plotted in a graph layer.  Unlike my general-purpose function-graphing engine (now in JS and being ported to TS), the graph area may not be zoomed or panned.  However, the Typescript axis and graph-axis classes contain all the necessary computations to support zoom/pan.  These classes also handle all the computations necessary to create tic labels and calculate pixel locations for tic marks.  They are the *exact* same classes my general-purpose function-graphing engine is based on.  So, you could build advanced capability into any graphing component you desire.

The engine will plot individual points or line-to-line graphs in named layers in the graph area.  Clipping is not currently applied in the baseline code, but is not necessary if the graph area is bounded based on minimum and maximum coordinate data.

The Angular component augments the graph area with _x_ and _y_ axis labels and a title (that may be assigned through template attributes).  Tic labels may be applied to each axis and the current repo contains some sample code to help you with automatic assignment of tic increments.


## Line Decoration

The demo that accompanies this repo illustrates the background graph grid drawn with dashed lines.  I always use a run-time Decorator pattern for line drawing.  Instead of manually drawing into a graphic context, the context is passed into a line decorator.  So,

```
context.moveTo(x,y)
```

is instead programmed as

```
lineDecorator.moveTo(context, x, y);
```

A factory is used to request either a solid, dashed, or dotted line decorator.  ALL drawing code remains unchanged.  The switch from solid to dashed-line drawing is as simple as changing a decorator.

This repo includes the three above-mentioned decorators as well as the decorator factory.  The line decorator code supports straight-line drawing only; the _curveTo()_ method is always drawn with solid lines.  I have the Actionscript code for all decorators that supports drawing (dashed/dotted) quadratic Beziers, however, it has not been ported to Typescript.  That implementation will remain specific to my Angular Dev Toolkit.

Refer to the code in the _app/decorators_ folder.


## Angular Graph Component

The Angular component (_GraphComponent_) is located in the _app/components_ folder.  Usage of the component is illustrated in the _app/app.component.html_ file,

```
<adt-graph title="Typescript Math Toolkit Linear Regression" xAxisLabel="X-Data" yAxisLabel="Y-Data"></adt-graph>
``` 

The component composes a _TSMT$Quadrant_ instance, which takes care of the heavy lifting.

General practice is to assign a property collection that controls graph display; one possible collection is provided in the _data/MockData_ class.

The graph area is bounded both in terms of user coordinates and pixel extents.

Add named function and/or label layers to the graph with draw properties that control the layer display.  The example used in this demo is taken from the Typescript Math Toolkit linear regression class.  A point collection is plotted in one layer and the regression line is drawn in the top layer.

The general procedure is illustrated in the _app/app.component.ts_ file,

```
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
```

Note that in this application, the coordinate data was first scanned for minimum and maximum extent.  These extents were used to bound the graph area so that no data in any graph layer was rendered outside the axis box.  

Clipping could be applied if you wish to build a more general engine.  For dot-only layers, this involves not displaying dots that are outside the current graph area.  Since 'function' layers are drawn with line segments, clipping requires only simple, linear interpolation.  


## Build and run the demo

Nothing new here - run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.  You should see the following graph

![client screen shot](graph.png?raw=true)

Click on the 'Clear' button below the graph to clear the graph and 'Redraw' to redraw the graph.

Then, deconstruct the code and build you own cool stuff!


## Further CLI help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <http://algorithmist.net>
