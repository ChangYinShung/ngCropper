# ngCropper

AngularJS module for https://github.com/fengyuanchen/cropper jQuery plugin.


### Install

```bash
bower install ng-cropper
```


### Usage

```html
<link href="client/bower_components/ngCropper/dist/ngCropper.all.css" rel="stylesheet">
<script src="client/bower_components/ngCropper/dist/ngCropper.all.js"></script>
```

```javascript
var app = angular.module('app', ['ngCropper']);

app.controller('Main', function(Cropper) {
    ...
});
```

```html
<img src="image.jpg"
     ng-cropper
     ng-cropper-options="options"
     ng-cropper-show="'show.cropper'"
     ng-cropper-hide="'hide.cropper'">
```
```html  
<ng-cropper-template  
    width=""
    height=""
    resultImg=""
    isDone=""
    ctrl="">
```
`Width、Height` :長寬(number)  
`resultImg` : 上傳存檔圖片(base64)  
`isDone`:判斷是否有編輯按鈕  
`ctrl`: Controller  
Read [Demo code](http://github.com/koorgoo/ngCropper/tree/master/demo) for detailed example.



### API

Look at [demo.js](http://github.com/koorgoo/ngCropper/tree/master/demo/demo.js) to learn workflow.
