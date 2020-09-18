
//打开评价器请求地址
var reqestEvaluateUrl = 'http://evaluate.minstone.com.cn:5000/openWebUrl';
//结束后需要关闭dialog
var needCloseDialogIdrr = ['inputDialog', 
                           'startSendData', 
                           'contentDialog', 
                           'startAutoAnalyze', 
                           'systemError',
                           'successOpen',
                           'errorAutoAnalyze'];
//当前窗口宽度
var _width = $(window).width();
//当前窗口高度
var _height = $(window).height();

//扫码枪逻辑
var inputOption = {
	alertInput: function(topRight  , closeCallback){

		dialogOption.closeAllDialog();

		//弹框参数
		var dialogSet = {
			               id:'inputDialog' , 
			               title:'请扫码，内容请将会输出下面' , 
			               backdropOpacity: 0.0, 
			               content:'<textarea id="qrCodeContent" style="width:265px;height:99px;"></textarea>',
			               width:'270',
			               draggable:false,
			               topRight:topRight,
			               onclose:function(){
			               	    dialogOption.closeAllDialog();
			               	    if (closeCallback)
			               	    	closeCallback();
			               }
			            };
		//弹出框
		top.dialog(dialogSet).showModal();
	    return this;	
	},
	focusInput:function(){
		//聚焦input
		$("#qrCodeContent").focus();
		return this;
	},
	inputChangeListener:function(){
		//监听qrCodeContent值
		$("#qrCodeContent").on('change' , function(){
			var v = $(this).val();
			var reg = /^(https:\/\/|http:\/\/|www\.)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/]+)+$/;
			if ( reg.test(v.split('?')[0]) ){
				var paramObject = {url:encodeURIComponent(v)};
				requestOption.sendRequestEvaluate(reqestEvaluateUrl , paramObject);
			}else{
				top.dialog({
					title:'错误提示', 
					content:'获取到二维码内容格式错误，请检查是否扫错二维码或手动填的!',
					onclose:function(){
						dialogOption.closeDialog('inputDialog');
					}
				}).showModal();
			}
		});	
	}
}



$(function(){
	setTimeout(function(){
		//body追加一个div
		$("body").append('<canvas id="qrcanvas" style="display:none;"></canvas><div id="temDiv"></div>');
	});
})

//自动识别逻辑
var autoAnalyzeOption = {
	//获取二维码图片地址
	getPictureUrl:function(){
		return this.pictureUrl;
	},
	//自动识别
	autoAnalyze:function(){
		//html2canvas有很多问题(不使用autoAnalyze这个方法)，暂时用谷歌截屏取代获取地址后直接调analyzeByPictureUrl识别
		var that = this;
		top.dialog({content: '开始自动识别...',title:'信息提示',id:'startAutoAnalyze'}).show();
	    var validTagObject = that.preCapture();

	    html2canvas(document.body, 
	               {width: _width,
			        height: _height,
			        scale:1,
			        useCORS:true,
	    	        onrendered:function(canvas) {
	                    var context = canvas.getContext('2d');
	                    context.mozImageSmoothingEnabled = false;
	                    context.webkitImageSmoothingEnabled = false;
	                    context.msImageSmoothingEnabled = false;
	                    context.imageSmoothingEnabled = false;

                        //还原页面
	                    iframeAndDivChangeOption.divToIframe();

	                    var image = canvas.toDataURL("image/png");
	                    //console.log(image);
	                    that.analyzeByPictureUrl(image);
	                }
	    });
	    return this;
	},
	//截图识别(需要第三方截图软件截图，放进div里面识别)
	thirdPartcaptureAndAnalyze:function(closeCallback , topRight){
		//console.log('captureAndAnalyze...');
	    
	    //这个截图只是坐标，
	    /*var bodyHtml = $(document.body).html();
	    $('body').html('');
	    $('body').append('<div id="JcropDiv"></div>');
	    $("#JcropDiv").append(bodyHtml);
	    $("#JcropDiv").css({width:_width , height: _height});
	    $('#JcropDiv').Jcrop({
	        allowMove:true,//允许移动
	        allowSelect:true,//允许重新选择
	        allowResize:true,//允许拖大缩小
	        dragEdges:true,//允许拖动边框
	        onSelect:function(e , c){
	            console.log(e);
	            console.log(c);
	        }
	    });*/
        //采用粘贴板形式，可以window自带或其它软件截的图粘贴到此
        dialogOption.closeAllDialog();

        var that = this;
        var dialogWidth = 270;
        var dialogHeight = 240;
        var imgDivId = 'imgDiv';
        var contentDivId = "contentDiv";
		var dialogSet = {
			               id:'contentDialog' , 
			               title:'请把图片复制粘贴或上传到下面' , 
			               backdropOpacity: 0.0, 
			               content:'<div id='+ contentDivId +' contenteditable="true" '+ 
			                       ' style="width:100%;height:100%;border:1px solid #C0C0C0;"></div>',
			               width: dialogWidth,
			               height: dialogHeight,
			               draggable:false,
			               topRight: topRight,
			               button:[{
						            id: 'clearContent',
						            value: '清空内容',
						            callback: function(){
						            	$("#" + contentDivId).empty();
			               	            return false;
						            },
						            autofocus: true
						   }/*,{
						            id: 'reAnalyze',
						            value: '重新识别',
						            callback: function(){
						            	if (document.getElementById(imgDivId)){
						            		that.analyzeByPictureUrl($("#" + imgDivId).attr("src"));
						            	}else{
						            		top.dialog({content: '请粘贴图片到里面再识别',title:'错误提示'}).show();
						            	}

			               	            return false;
						            },
						            autofocus: true
						   }*/],
			               onclose:function(){
			               	   if (closeCallback){
			               	   	  closeCallback();
			               	   }
			               }
			            };
		//弹出框
		top.dialog(dialogSet).showModal();

		//监听粘贴事件
		document.getElementById(contentDivId).addEventListener('paste', function(e){
			if (e.clipboardData){
				$("#" + contentDivId).empty();
				$.each(e.clipboardData.items , function(index , item){
					var f = item.getAsFile();
					var reader = new FileReader();
					reader.onload = function(e1){
						$("#" + contentDivId).append("<img id="+ imgDivId +"></img>");
	                    $("#" + imgDivId).attr('src' , reader.result);
					}
					reader.readAsDataURL(f);
				})
			}
		});

		//监听粘贴板内容改变
		$("#" + contentDivId).on('DOMNodeInserted' , function(){ 
			
			try{
				$(this).keydown(function(e){
					//监听backspace
					if (e.keyCode == 8){
						$(this).empty();
					}
				});
			}catch(e){}

			$("#" + imgDivId).on('load', function(){
				//获取img的src地址
				var imgUrl = '';
				try{imgUrl = $(this).attr("src");}catch(e){}finally{
					if (imgUrl == undefined || imgUrl == ''){
						top.dialog({content: '获取粘贴板上的图片失败，请确认是否有图片',title:'错误提示'}).show();
						return ;
				    }
				}

				//调整图片展示大小
				$(this).css({width:dialogWidth - 5, height:dialogHeight - 5});

				//调用解析二维码
				that.analyzeByPictureUrl(imgUrl);
			});
		});
	},
	//利用谷歌截屏图片作为画布，不需要要依赖第三方截图软件
	capturePictureByCropper:function(data , closeCallback){

		dialogOption.closeAllDialog();

		var that = this;
		var dialogSet = {
			               id:'contentDialog' , 
			               title:'请截图识别二维码' , 
			               backdropOpacity: 0.0, 
			               content:'<img id="img" style="width:100%;height:100%"/><img id="cutImg" style="display:none"/>',
			               width: (_width - 200),
			               height: (_height - 150),
			               ok:function(){
			               	   var cas = croppers.getCroppedCanvas();// 获取被裁剪后的canvas 
					           var base64 = cas.toDataURL('image/jpeg'); // 转换为base64
					           that.analyzeByPictureUrl(base64);

			               },
			               okValue:'识别二维码',
			               onclose:function(){
			               	   if (closeCallback){
			               	   	  closeCallback();
			               	   }
			               }
			            };
		//弹出框
		top.dialog(dialogSet).showModal();
		$("#img").attr('src' , data);
		var croppers;
		$("#img").on('load' , function(){
			croppers = new Cropper(document.getElementById("img") , {
			    aspectRatio : 1 / 1,// 默认比例  
		        preview : '.previewImg',// 预览视图  
		        guides : false, // 裁剪框的虚线(九宫格)  
		        autoCropArea : 0.5, // 0-1之间的数值，定义自动剪裁区域的大小，默认0.8  
		        movable : false, // 是否允许移动图片  
		        dragCrop : true, // 是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域  
		        movable : true, // 是否允许移动剪裁框  
		        resizable : true, // 是否允许改变裁剪框的大小  
		        zoomable : true, // 是否允许缩放图片大小  
		        mouseWheelZoom : false, // 是否允许通过鼠标滚轮来缩放图片  
		        touchDragZoom : true, // 是否允许通过触摸移动来缩放图片  
		        rotatable : true, // 是否允许旋转图片  
		        crop:function(e) {  
		            //输出结果数据裁剪图像。  
		        },
		        ready:function(){
		        	//移动一下，防止进来没有移动直接点击识别报错
		        	croppers.move( 1 , 0 );
		        }
			});
		});
	},
	//解析二维码
	analyzeByPictureUrl:function(imgUrl , codeCallBack){
		//console.log("capture picture:");
		//console.log(imgUrl);
		if (imgUrl == undefined){
			top.dialog({content: '获取当前页面图片失败',title:'错误提示'}).show();
			return ;
		}
		this.pictureUrl = imgUrl;
	    var c = document.getElementById("qrcanvas");
	    var ctx = c.getContext("2d");

	    var img = new Image();
	    img.src = imgUrl;
	    img.onload = function() {
	        $("#qrcanvas").attr("width" , img.width)
	        $("#qrcanvas").attr("height" , img.height)
	        ctx.drawImage(img, 0, 0, img.width, img.height);
	        var imageData = ctx.getImageData(0, 0, img.width, img.height);
	        const code = jsQR(imageData.data, imageData.width, imageData.height, {
	            inversionAttempts: "dontInvert",
	        });

	        //回调获取code可以在这个回调添加业务逻辑
	        if (codeCallBack)
	        	codeCallBack(code);

	        //下面这一块应该把它拆出来，因为是业务内容
	        if(code){
	        	//console.log("qrcode content:");
	        	//console.log(code.data);
	            dialogOption.closeDialog('startAutoAnalyze');
	            top.dialog({content: '识别成功，正在推送数据，请求打开评价器评价...',title:'信息提示',id:'startSendData'}).show();
	            
				var paramObject = {url:encodeURIComponent(code.data)};
				requestOption.sendRequestEvaluate(reqestEvaluateUrl , paramObject);

	        }else{
	            top.dialog({content: '识别失败,请检查图中是否有二维码或二维码清晰度是否清晰或选择其它方式识别',
	            	        title:'错误提示',
	            	        id:'errorAutoAnalyze',
	            	        onclose:function(){
	            	        	dialogOption.closeDialog('startAutoAnalyze');
	            	        }
	            	      }).show(); 
	        }
	    }
	},
	//截图之前,处理特殊标签
	preCapture: function(){

	    var resultObject = {"have":false};

	    //如果有iframe框
		if ($("iframe")){
			iframeAndDivChangeOption.iframeToDiv();
			resultObject.have = true;
		}

		//为何这个标签的识别不了？？
		if ($("embed")){

		}

		return resultObject;
	}
}


//请求评价器
var requestOption = {
	sendRequestEvaluate:function(url , paramObject){
		var _ajax = $.get(url , paramObject , function(res){
			res = (typeof(res) == 'object' ? res : JSON.parse(res));
			if (res.success){
				dialogOption.closeAllDialog();
	        	top.dialog({id:'successOpen' , content: '已打开平板评价器，请评价。',title:'提示信息'}).show();
			}else{
	        	top.dialog({
	    			content: '' + res.errMsg,
	    			title:'错误信息',
	    			onclose:function(){
	    				dialogOption.closeAllDialog();
	    			}
	    		}).show();						
			}

		});

		_ajax.fail(function(xhr, status, info){
	        var errorMessage = '';
        	if (xhr.status == 404){
        		errorMessage = '当前提交路径找不到，请联系管理员!';
        	}
        	
        	if (xhr.status == 400){
        		errorMessage = '保存参数在后台接收出错，请联系管理员!';
        	}
        	
        	top.dialog({
        		id:'systemError',
    			content: errorMessage != '' ? errorMessage : '系统错误,访问评价器地址失败!',
    			title:'错误提示',
    			onclose:function(){
    				dialogOption.closeAllDialog();
    			}
    		}).show();  
		});
	}
}

//处理ifrme与div
var iframeAndDivChangeOption = {
	
	iframeToDiv: function(){
		if($("iframe")){
			var html = $("iframe").contents().find("body").html();
			$("#temDiv").append(html);
			$("iframe").css({"display":"none"});	
		}	
	},

	divToIframe:function(){
		if ($("iframe")){
			$("#temDiv").empty();
			$("iframe").css({"display":""});
		}
	}
}

//dialog
var dialogOption = {
	closeDialog: function(id){
		try{top.dialog({id:id}).close().remove();}catch(e){}
	},
	closeAllDialog:function(){
		//如果sendRequestEvaluate有共用的需要在这里关闭
		var that = this;
		$.each(needCloseDialogIdrr , function(index , item){
			that.closeDialog(item);
		});
	}
}