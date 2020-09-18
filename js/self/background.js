//================================创建菜单start============================================================//
//type 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
//title 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
//contexts 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
//创建右键扫码枪识别菜单
chrome.contextMenus.create({
	id:'smq',
	type: 'normal', 
	title: '扫码枪扫描(ALT+W)', 
	contexts: ['all'],
	onclick: function(params){
		//点击事件
		sendMessage({rightSmq:true });
		//为了兼容其他浏览器不使用getSelected、sendRequest
		/*chrome.tabs.getSelected(null , function(tab){
            chrome.tabs.sendRequest(tab.id, {rightSmq: true});
		}); */  
	}
});

//创建右键自动识别
chrome.contextMenus.create({
	id:'autoAnalyze',
	type: 'normal', 
	title: '自动识别(ALT+S)', 
	contexts: ['all'], 
	onclick: function(params){
        sendCurrentScreenPicture({rightAutoAnalyze:true});
	}
});

//截图识别
chrome.contextMenus.create({
	id:'selfCaptureAnalyze',
	type: 'normal', 
	title: '自带截图识别(ALT+Z)', 
	contexts: ['all'], 
	onclick: function(params){
		sendCurrentScreenPicture({rightSelfCaptureAnalyze:true});
	}
});

//创建右键截图识别
chrome.contextMenus.create({
	id:'captureAnalyze',
	type: 'normal', 
	title: '第三方截图识别(ALT+X)', 
	contexts: ['all'], 
	onclick: function(params){
		//点击事件
		sendMessage({rightCaptureAnalyze:true });
		/*chrome.tabs.getSelected(null , function(tab){
		    chrome.tabs.sendRequest(tab.id, {rightCaptureAnalyze:true });
			//可以做录屏？
			//chrome.desktopCapture.chooseDesktopMedia(['screen'] , tab , function(data){
				//alert(data);
			//});
		});*/

	}
});

//================================创建菜单end============================================================//

//================================监听start============================================================//
chrome.runtime.onMessage.addListener(function(res, sender, sendResponse){

	//来自alt + s快捷的事件
	if (res.listenerAlt83){
		sendCurrentScreenPicture({rightAutoAnalyze:true});
		//谷歌的消息通知，太麻烦了
		/*chrome.notifications.create('notice', {
			type: 'basic',
			title: '提示消息',
			message: '将自动识别二维码',
			iconUrl: "./././img/title.jpg"
		} , function(){});*/
	}

	//来自alt + z快捷的事件
	if (res.listenerAlt90){
	    sendCurrentScreenPicture({rightSelfCaptureAnalyze:true});
	}

	sendResponse();

	return true;
});
//================================监听end============================================================//
//发送当前屏幕图片
function sendCurrentScreenPicture(paramObject){
	//browser.tabs.executeScript({file:"js/self/content-script.js"});
	chrome.tabs.captureVisibleTab(null,null, function(imgUrl){
		paramObject.url = imgUrl;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			chrome.tabs.sendMessage((tabs.length ? tabs[0].id : null) , paramObject, function(response){

			});
		});
	}); 
}

//发送消息
function sendMessage(paramObject){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage((tabs.length ? tabs[0].id : null) , paramObject , function(response){

		});
	});
}