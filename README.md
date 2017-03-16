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
Bootstrap 3  Customlized Template  

```html  
<ng-cropper-template  
    template-type="bootstrap3"
    width=""
    height=""
    result-img=""
    is-done=""
    ctrl="">
```
`type`:bootstrap3,angularMaterial  
`width、height` :長寬(number)  width:0,height:0 不固定長寬  
`result-img` : 上傳存檔圖片(base64)  
`is-done`:判斷是否有編輯按鈕  
`ctrl`: Controller  
Read [Demo code](http://github.com/koorgoo/ngCropper/tree/master/demo) for detailed example.



### API

Look at [demo.js](http://github.com/koorgoo/ngCropper/tree/master/demo/demo.js) to learn workflow.
