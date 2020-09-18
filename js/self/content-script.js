//接收background/popup传来的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	//如果是右键菜单扫描枪扫描触发
	if (request.rightSmq){
		inputOption
		    .alertInput(true)
		    .focusInput()
		    .inputChangeListener();
	}

	//如果是右键自动识别
	if (request.rightAutoAnalyze){
		//autoAnalyzeOption.autoAnalyze();//放弃html2canvas截屏直接采用谷歌截屏
		autoAnalyzeOption.analyzeByPictureUrl(request.url);
	}

	//如果是右键第三方截图识别
	if (request.rightCaptureAnalyze){
		autoAnalyzeOption.thirdPartcaptureAndAnalyze(function(){} , true);
	}

	//如果是右键自带截图识别
	if (request.rightSelfCaptureAnalyze){
		autoAnalyzeOption.capturePictureByCropper(request.url);
	}

	//如果是browser_action发送来的消息，关闭当前页面弹窗
	if (request.titleCloseDialog){
		dialogOption.closeAllDialog();
	}

    sendResponse();
	
	return true;
});

//监听页面键盘
$(document).keydown(function(e){
	var keycode = e.keyCode || e.which; 
	//监听alt + w
	if (e.altKey && keycode == 87){
		//这里是监听alt + w弹出input框
		inputOption
		    .alertInput(true)
		    .focusInput()
		    .inputChangeListener();	
	}

	//监听alt + s
	if (e.altKey && keycode == 83){
		//autoAnalyzeOption.autoAnalyze();//放弃html2canvas截屏直接采用谷歌截屏
		//这里是监听键盘alt + s发送消息到backgroud，截取当前浏览器屏幕，获取地址后发送回来onRequest触发analyzeByPictureUrl
		chrome.runtime.sendMessage({listenerAlt83:true}, function(response){});
	}

	//监听alt + x
	if (e.altKey && keycode == 88){
		autoAnalyzeOption.thirdPartcaptureAndAnalyze(function(){} , true);
	}

	//监听alt + z
	if (e.altKey && keycode == 90){
		chrome.runtime.sendMessage({listenerAlt90:true}, function(response){});
	}
});
