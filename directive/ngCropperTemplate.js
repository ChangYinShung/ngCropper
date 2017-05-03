(function () {
    var app = angular.module('ngCropper');
    app.component('ngCropperTemplate', ngCropperTemplate());
    function ngCropperTemplate() {
        return {
            templateUrl: getTemplate,
            controller: CropperUI,
            controllerAs: 'Ctrl',
            bindings: {
                templateType: '@?', //bootstrap3 , angularMaterial
                width: '=',
                height: '=',
                resultImg: '=',
                imgType:'@?', //圖片類型 : png or jpeg
                quility:'@?', //圖片品質:Range 0-1
                imgUrl: '@?',
                isDone: '=?',
                ctrl: '=?'
            }
        };
    }

    getTemplate.$inject = ['$element', '$attrs'];
    function getTemplate($element, $attrs) {
        if (!$attrs.templateType) {
            console.warn("豐碩:ng-cropper-template need be 'bootstrap3' or 'angularMaterial' : Default is bootstrap3")
            return 'bootstrap3.tpl';
        }
        var result = $attrs.templateType + '.tpl';
        return result;
    }

    CropperUI.$inject = ['$timeout', '$log', '$scope', 'Cropper', '$element'];
    function CropperUI($timeout, $log, $scope, Cropper, $element) {
        /* jshint validthis:true */
        //存檔會存在resultImg
        //只有按儲存按鈕的時候才會修改resultImg
        //可以用來檢察有沒有結果。

        var vm = this;

        //directive parameters
        vm.resultImg;
        vm.imgUrl;
        vm.width;
        vm.height;
        vm.isDone;
        vm.quility = angular.isNumber(vm.quility) ? vm.quility : 1; //品質
        vm.imgType = vm.imgType ? 'image/jpeg' : 'image/' + vm.imgType;
        vm.ctrl = vm;
        //var parameters
        var ratio = 0;//finalSize.width / finalSize.height;

        //$scope parameters
        $scope.cropper = {};
        $scope.cropperProxy = 'cropper.first';
        $scope.showEvent = 'show';
        $scope.hideEvent = 'hide';

        //vm parameters
        vm.file;
        vm.data;
        vm.options = {};
        /*
         * @description 
         */
        vm.ogImage = null;//保存原本圖片
        vm.ShowCancel = false;
        vm.DataUrl = "";
        vm.HasImg = false;
        vm.EditMode = false;
        vm.EditButtonText = "編輯";

        //functions
        vm.Save = save;
        vm.OnFile = onFile;
        vm.Zoom = zoom;
        vm.ZoomTo = zoomTo;
        vm.EditButton = editButton;
        vm.LoadButton = LoadButton;
        vm.CancelButton = CancelButton;
        //todo
        vm.Error = Error;

        activate();

        /////////////////
        function activate() {
            setupWatch();
            LoadImage();
        }

        function setupOptions() {
            vm.ratio = vm.width / vm.height;
            if (isNaN(vm.ratio) || vm.ratio == 0)
                vm.ratio = NaN;
            vm.options = {
                viewMode: 0,
                maximize: true,
                aspectRatio: vm.ratio,
                crop: function (dataNew) {
                    vm.data = dataNew;
                },
                zoomOnWheel: false,
                dragMode: 'move'
            };
        }
        function setupWatch() {
            //watch EditMode
            $scope.$watchGroup(['Ctrl.width', 'Ctrl.height'], function (newValue) {
                setupOptions();
            });
            $scope.$watch('Ctrl.EditMode', function (newValue) {
                vm.isDone = !newValue;
            });
            $scope.$watch('cropper.first', function (newValue) {
                if (!newValue) return;
                $scope.cropper.first('setData', { x: 0, y: 0 });
            });
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
                            vm.DataUrl = vm.ogImage = dataUrl;
                        });
                }
                xhr.send();
            }
            if (vm.resultImg) {
                vm.DataUrl = vm.ogImage = vm.resultImg;
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
                vm.ShowCancel = true; //顯示取消按鈕
            });
        };
        //存檔
        function save() {
            var w = vm.width;
            var h = vm.height;
            if (isNaN(ratio)) {
                var image = $scope.cropper.first('getImageData');
                w = image.width;
                h = image.height;
            }
            var dataUrl = $scope.cropper.first('getCroppedCanvas', {
                width: w,
                height: h
            }).toDataURL(vm.imgType, vm.quility);
            vm.resultImg = vm.ogImage = dataUrl;
            vm.HasImg = true;
            vm.ShowCancel = false;
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
        //取消
        function CancelButton() {
            vm.ShowCancel = false;
            EditDisable();
            vm.DataUrl = vm.ogImage;
            vm.resultImg = vm.ogImage;
            //vm.DataUrl = vm.ogImage;

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


    app.run(Bootstrap3Template);

    Bootstrap3Template.$inject = ['$templateCache'];
    function Bootstrap3Template($templateCache) {
        $templateCache.put('bootstrap3.tpl',
 '   <div class="row">  ' +
 '       <div class="col-xs-12">  ' +
 '           <button class="btn btn-warning" ng-click="Ctrl.CancelButton();" ng-show="Ctrl.ogImage && Ctrl.ShowCancel">  ' +
 '               <i class="fa fa-repeat" aria-hidden="true"></i>  ' +
 '               復原  ' +
 '           </button>  ' +
 '           <button class=" btn btn-primary" ng-click="Ctrl.EditButton();" ng-show="Ctrl.HasImg">  ' +
 '               <i class="fa fa-pencil-square-o" aria-hidden="true"ng-hide ="Ctrl.EditMode"></i>  ' +
 '               <i class="fa fa-times" aria-hidden="true"ng-show ="Ctrl.EditMode"></i>  ' +
 '               {{Ctrl.EditButtonText}}  ' +
 '           </button>  ' +
 '           <button class="btn btn-primary" ng-click="Ctrl.Save();" ng-show="Ctrl.EditMode">  ' +
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
        $templateCache.put('angularMaterial.tpl',
'   <md-button class="md-fab" ng-click="Ctrl.Zoom(-0.1)" ng-show="Ctrl.EditMode" >  ' +
'       <md-icon md-font-icon="icon-magnify-minus"></md-icon>  ' +
'   </md-button>  ' +
'   <md-button class="md-fab" ng-click="Ctrl.Zoom(0.1)" ng-show="Ctrl.EditMode">  ' +
'       <md-icon md-font-icon="icon-magnify-plus"></md-icon>  ' +
'   </md-button>  ' +
'   <div layout="row" layout-align="center center" >  ' +
'       <md-button class="md-warn md-raised" ng-click="Ctrl.CancelButton();" ng-show="Ctrl.ogImage && Ctrl.ShowCancel">  ' +
'           <md-icon md-font-icon="icon-refresh"></md-icon>  ' +
'           復原 ' +
'       </md-button>  ' +

'       <md-button class="md-accent md-raised" ng-click="Ctrl.EditButton();" ng-show="Ctrl.HasImg">  ' +
'           <md-icon md-font-icon="icon-pencil" ng-hide="Ctrl.EditMode"></md-icon>  ' +
'           <md-icon md-font-icon="icon-close" ng-show="Ctrl.EditMode"></md-icon>  ' +
'           {{Ctrl.EditButtonText}}  ' +
'       </md-button>  ' +
'       <md-button class="md-accent md-raised" ng-click="Ctrl.Save();" ng-show="Ctrl.EditMode">  ' +
'           <md-icon md-font-icon="icon-floppy"></md-icon>存檔  ' +
'       </md-button>  ' +
'       <md-button class="md-accent md-raised" ng-click="Ctrl.LoadButton()" ng-show="!Ctrl.EditMode">  ' +
'           <md-icon md-font-icon="icon-file-image-box"></md-icon>讀取圖片  ' +
'       </md-button>  ' +
'       <input id="FileLoader" type="file" class="btn btn-primary" onchange="angular.element(this).scope().Ctrl.OnFile(this.files[0]);this.value =\'\' " style="display:none">  ' +
'   </div>  ' +
'   <md-divider></md-divider>  ' +
'   <div layout="row" layout-align="center center">  ' +
'       <div ng-if="Ctrl.DataUrl">  ' +
'           <img ng-if="Ctrl.DataUrl"  ' +
'                ng-src="{{Ctrl.DataUrl}}"  ' +
'                ng-error="Ctrl.Error()"  ' +
'                ng-cropper  ' +
'                ng-cropper-proxy="cropperProxy"  ' +
'                ng-cropper-show="showEvent"  ' +
'                ng-cropper-hide="hideEvent"  ' +
'                ng-cropper-options="Ctrl.options">  ' +
'       </div>  ' +
'  </div>  ');

    }

})();