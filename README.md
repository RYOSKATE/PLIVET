# PLIVET <a href="http://doge.mit-license.org"><img src="http://img.shields.io/:license-mit-blue.svg"></a> [![Build Status](https://secure.travis-ci.org/RYOSKATE/PLIVET.svg?branch=master)](http://travis-ci.org/RYOSKATE/PLIVET)

Programming Language Interpreter for Visualization of Execution Trace (PLIVET) is a program interpreter with visualization of execution state.

PLIVET supports;

* C language
* Java (now implementing)
* Python (now implementing)
## For User

PLIVET can be used with most modern browsers.

Our build targets are as follows:

[>0.25%, not ie 11 (Browserslist)](http://browserl.ist/?q=%3E0.25%25%2C+not+ie+11)

### Online

Demo page is here.

[https://ryoskate.github.io/PLIVET](https://ryoskate.github.io/PLIVET)

### Offline

1. Download this repository.
1. Open `docs/index.html` by a modern browser.

## For Developer

### Required

* node.js >= 10.20.1 <= 16.13.2
* yarn or npm

### Setup environment

* Install node packages

 ```
 yarn
 ```

* After editing files in `src/`, 

```
yarn build
```

to update `bist/` by webpack.
