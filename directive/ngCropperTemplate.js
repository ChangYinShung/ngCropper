(function () {
    var app = angular.module('ngCropper');
    app.component('ngCropperTemplate', ngCropperTemplate());
    function ngCropperTemplate() {
        return {
            templateUrl: 'bootstrap3.tpl',
            controller: CropperUI,
            controllerAs: 'Ctrl',
            bindings: {
                width: '@',
                height: '@',
                resultImg: '=',
                imgUrl: '@?',
                isDone: '=?',
                ctrl: '=?'
            }
        };
    }
    CropperUI.$inject = ['$timeout', '$log', '$scope', 'Cropper', '$element'];
    function CropperUI($timeout, $log, $scope, Cropper, $element) {
        /* jshint validthis:true */
        //存檔會存在resultImg
        //只有按儲存按鈕的時候才會修改resultImg
        //可以用來檢察有沒有結果。

        var vm = this;
        vm.ctrl = vm;
        //directive parameters
        vm.resultImg;
        vm.imgUrl;
        vm.width;
        vm.height;
        vm.isDone;
        //var
        var finalSize = { width: vm.width, height: vm.height };
        var ratio = finalSize.width / finalSize.height;

        vm.file;
        vm.data;
        vm.options = {};
        vm.DataUrl = "";

        $scope.cropper = {};
        $scope.cropperProxy = 'cropper.first';
        $scope.showEvent = 'show';
        $scope.hideEvent = 'hide';

        //ui variable
        vm.HasImg = false;
        vm.EditMode = false;
        vm.EditButtonText = "編輯";

        //functions
        vm.Preview = preview;
        vm.OnFile = onFile;
        vm.Zoom = zoom;
        vm.ZoomTo = zoomTo;
        vm.EditButton = editButton;
        vm.LoadButton = LoadButton;
        //todo
        vm.Error = Error;

        activate();

        /////////////////
        function activate() {
            if (isNaN(ratio) || ratio == 0)
                ratio = NaN;
            vm.options = {
                viewMode: 0,
                maximize: true,
                aspectRatio: ratio,
                crop: function (dataNew) {
                    vm.data = dataNew;

                },
                zoomOnWheel: false,
                dragMode: 'move'
            };


            LoadImage();

            //watch EditMode
            $scope.$watch('Ctrl.EditMode', function (newValue) {
                vm.isDone = !newValue;
            });
            $scope.$watch('cropper.first', function (newValue) {
                if (!newValue) return;
                $scope.cropper.first('setData', { x: 0, y: 0 });
            });

        }
        function setResultData(data) {
            vm.resultImg = data;
            vm.HasImg = true;
        }
        function LoadImage() {
            var url = vm.imgUrl;
            if (!!url) {
                vm.HasImg = true;
                var blob = null;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
                xhr.onload = function () {
                    //xhr.response is now a blob object
                    //then set file and dataurl
                    Cropper.encode((vm.file = xhr.response))
                        .then(function (dataUrl) {
                            vm.DataUrl = dataUrl;

                        });
                }
                xhr.send();
            }
            if (vm.resultImg) {
                vm.DataUrl = vm.resultImg;
                vm.HasImg = true;
                vm.file = Cropper.decode(vm.resultImg);
            }

        }
        function onFile(blob) {
            if (!blob) {
                return;
            }
            vm.file = blob;
            Cropper.encode(vm.file).then(function (dataUrl) {
                vm.DataUrl = dataUrl;
                EditEnable();
            });
        };
        //存檔
        function preview() {
            var w = vm.width;
            var h = vm.height;
            if (isNaN(ratio))
            {
                var image = $scope.cropper.first('getImageData');
                w = image.width;
                h = image.height;
            }

            var dataUrl = $scope.cropper.first('getCroppedCanvas', {
                width: w,
                height: h
            }).toDataURL();
            setResultData(dataUrl);
            EditDisable();
        };
        //ui functions
        function editButton() {
            vm.EditMode = !vm.EditMode;
            if (vm.EditMode) {
                EditEnable();
            } else {
                EditDisable();
            }
        }
        //進入編輯模式
        function EditEnable() {
            vm.EditMode = true;
            vm.EditButtonText = "放棄編輯";
            vm.resultImg = vm.DataUrl;
            $timeout(showCropper);
        }
        //離開編輯模式
        function EditDisable() {
            vm.EditMode = false;
            vm.EditButtonText = "編輯";
            $timeout(hideCropper);
            vm.DataUrl = vm.resultImg;

        }

        //UI
        function LoadButton() {
            $element.find('#FileLoader').trigger('click');
        }
        function Error() {
            alert('您上傳的圖片格式無效!');
            EditDisable();
        }
        function zoom(scale) {
            if (!$scope.cropper.first) return;
            $scope.cropper.first('zoom', scale);
        }
        function zoomTo(scale) {
            if (!$scope.cropper.first) return;
            $scope.cropper.first('zoomTo', scale);
        }
        function showCropper() { $scope.$broadcast($scope.showEvent); }
        function hideCropper() { $scope.$broadcast($scope.hideEvent); }
    }
    }


    app.run(Bootstrap3Template);

    Bootstrap3Template.$inject = ['$templateCache'];
    function Bootstrap3Template($templateCache) {
        $templateCache.put('bootstrap3.tpl', '   <div class="row">  ' +
 '       <div class="col-xs-12">  ' +
 '           <button class=" btn btn-primary" ng-click="Ctrl.EditButton();" ng-show="Ctrl.HasImg">  ' +
 '               <i class="fa fa-pencil-square-o" aria-hidden="true"ng-hide ="Ctrl.EditMode"></i>  ' +
 '               <i class="fa fa-times" aria-hidden="true"ng-show ="Ctrl.EditMode"></i>  ' +
 '               {{Ctrl.EditButtonText}}  ' +
 '           </button>  ' +
 '           <button class="btn btn-primary" ng-click="Ctrl.Preview();" ng-show="Ctrl.EditMode">  ' +
 '               <i class="fa fa-floppy-o" aria-hidden="true"></i>存檔  ' +
 '           </button>  ' +
 '           <button class="btn btn-primary" ng-click="Ctrl.LoadButton()" ng-show="!Ctrl.EditMode">  ' +
 '               <i class="fa fa-folder-open" aria-hidden="true"></i> 讀取圖片  ' +
 '           </button>  ' +
 '           <input id="FileLoader" type="file" class="btn btn-primary" onchange="angular.element(this).scope().Ctrl.OnFile(this.files[0]);this.value =\'\' " style="display:none">  ' +
 '           <button class="btn btn-primary pull-right" ng-click="Ctrl.Zoom(-0.1)" ng-show="Ctrl.EditMode"><i class="fa fa-search-minus" aria-hidden="true"></i></button>  ' +
 '           <button class="btn btn-primary pull-right" ng-click="Ctrl.Zoom(0.1)" ng-show="Ctrl.EditMode"><i class="fa fa-search-plus" aria-hidden="true"></i></button>  ' +
 '       </div>  ' +
 '   </div>  ' +
 '   <hr />  ' +
 '   <div class="row">  ' +
 '       <div class="col-xs-12">  ' +
 '           <div ng-if="Ctrl.DataUrl" class="img-container">  ' +
 '               <img class="img-responsive center-block"   ' +
 '                    ng-if="Ctrl.DataUrl"  ' +
 '                    ng-src="{{Ctrl.DataUrl}}"  ' +
 '                    ng-error="Ctrl.Error()"  ' +
 '                    ng-cropper  ' +
 '                    ng-cropper-proxy="cropperProxy"  ' +
 '                    ng-cropper-show="showEvent"  ' +
 '                    ng-cropper-hide="hideEvent"  ' +
 '                    ng-cropper-options="Ctrl.options">  ' +
 '           </div>  ' +
 '       </div>  ' +
 '  </div>  ');
    }

})();