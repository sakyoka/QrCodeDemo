$(function(){
	
	var backGroundObject = chrome.extension.getBackgroundPage();

	//smq监听click事件
	$("#smq").click(function(){
		inputOption
		    .alertInput()
		    .focusInput()
		    .inputChangeListener();

	});

    //autoAnalyze监听click事件
	$("#autoAnalyze").click(function(){
		backGroundObject.sendCurrentScreenPicture({rightAutoAnalyze:true});
	});

    //thirdPartCaptureAnalyze监听click事件
	$("#thirdPartCaptureAnalyze").click(function(){
		$("body").css({height:'375px'});
		autoAnalyzeOption.thirdPartcaptureAndAnalyze(function(){
			$("body").css({height:'200px'});
		});
	});

    //selfCaptureAnalyze点击事件
	$("#selfCaptureAnalyze").click(function(){
		backGroundObject.sendCurrentScreenPicture({rightSelfCaptureAnalyze:true});
	});

	backGroundObject.sendMessage({titleCloseDialog:true});
	//dialogOption.closeAllDialog();
});



