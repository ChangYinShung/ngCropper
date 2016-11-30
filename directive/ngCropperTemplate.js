﻿(function () {
    angular.module('ngCropper').component('ngCropperTemplate', ngCropperTemplate());
    function ngCropperTemplate() {
        return {
            templateUrl: '/Scripts/Assets/Plugins/Library/ngCropperTemplate/ngCropperTemplate.html',
            controller: CropperUI,
            controllerAs: 'Ctrl',
            bindings: {
                width: '@',
                height: '@',
                resultImg: '=',
                imgUrl: '@?',
                isDone: '=?',
                ctrl:'=?'
            }
        };
    }
    CropperUI.$inject = ['$timeout','$log', '$scope', 'Cropper','$element'];
    function CropperUI($timeout,$log, $scope, Cropper, $element) {
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

            if (getServerImgUrl()) {
                //load image on server
                vm.HasImg = true;
                LoadImageFromUrl(getServerImgUrl());
            } else if(vm.resultImg){
                //if result image is available,use it
                vm.DataUrl = vm.resultImg;
                vm.HasImg = true;
                vm.file = Cropper.decode(getResultData());
            }
            //watch EditMode
            $scope.$watch('Ctrl.EditMode', function (newValue) {
                vm.isDone = !newValue;
            });
            $scope.$watch('cropper.first', function (newValue) {
                if (!newValue) return;
                $scope.cropper.first('setData', { x: 0, y: 0 });
            });

        }
        function getServerImgUrl() {
            return vm.imgUrl;
            //return 'http://i.imgur.com/r2dqxw2.jpg';
        }
        function getResultData() {
            return vm.resultImg;
        }
        function setResultData(data) {
            vm.resultImg = data;
            vm.HasImg = true;
        }

        function LoadImageFromUrl(url) {
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
            var dataUrl = $scope.cropper.first('getCroppedCanvas', {
                width: vm.width,
                height: vm.height
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
            EditEnable.isReady = true;
            $timeout(showCropper);
        }
        //離開編輯模式
        function EditDisable() {
            vm.EditMode = false;
            vm.EditButtonText = "編輯";
            $timeout(hideCropper);
            vm.DataUrl = vm.resultImg;

        }
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

})();