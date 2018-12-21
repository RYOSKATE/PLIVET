# PlayVisualizer <a href="http://doge.mit-license.org"><img src="http://img.shields.io/:license-mit-blue.svg"></a>


PlayVisualizer is a program interpreter with visualization of execution state.

PV supports;

* C language
* Java (now implementing)

## For User

PV can be used with most modern browsers.

Our build targets are as follows:

[>0.25%, not ie 11 (Browserslist)](http://browserl.ist/?q=%3E0.25%25%2C+not+ie+11)

### Online

Demo page is here.

[https://ryoskate.github.io/PlayVisualizer](https://ryoskate.github.io/PlayVisualizer)

### Offline

1. Download this repository.
1. Open `docs/index.html` by a modern browser.

## For Developer

### Setup environment

* Install node packages

 ```
 yarn
 ```

* After editing files in `src/`, 

```
yarn build
```

to update `docs/` by webpack.
