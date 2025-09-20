// 联系我们页面功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 百度地图初始化
    function initBaiduMap() {
        // 创建地图实例:cite[1]
        var map = new BMap.Map("baidu-map-container");
        
        // 郑州市二七区政府坐标（百度坐标系）
        var point = new BMap.Point(113.6401, 34.72468);
        
        // 初始化地图，设置中心点坐标和地图级别:cite[1]
        map.centerAndZoom(point, 16);
        
        // 启用鼠标滚轮缩放:cite[1]
        map.enableScrollWheelZoom(true);
        
        // 添加缩放控件
        map.addControl(new BMap.NavigationControl());
        
        // 添加比例尺控件
        map.addControl(new BMap.ScaleControl());
        
        // 创建标注:cite[3]
        var marker = new BMap.Marker(point);
        
        // 将标注添加到地图中:cite[3]
        map.addOverlay(marker);
        
        // 创建信息窗口:cite[3]
        var infoWindow = new BMap.InfoWindow(
            "<div style='padding:10px;'><strong>乡镇问题反馈系统</strong><br/>地址：郑州市二七区政通路85号<br/>电话：0371-68186100</div>", 
            {
                width: 250,     // 信息窗口宽度
                height: 120     // 信息窗口高度
            }
        );
        
        // 标注点添加点击事件:cite[3]
        marker.addEventListener("click", function() {
            map.openInfoWindow(infoWindow, point); // 开启信息窗口
        });
        
        // 默认打开信息窗口
        map.openInfoWindow(infoWindow, point);
    }
    
    // 跳转到百度地图功能
    function setupBaiduMapRedirect() {
        const openMapBtn = document.getElementById('openBaiduMap');
        
        if (openMapBtn) {
            openMapBtn.addEventListener('click', function() {
                // 使用百度地图URL scheme打开应用:cite[2]
                const lat = 34.72468;   // 纬度
                const lng = 113.6401;   // 经度
                const title = "郑州市二七区人民政府";
                const content = "乡镇问题反馈系统办公地点";
                
                // 构建百度地图URL:cite[2]:cite[6]
                const baiduMapUrl = `https://map.baidu.com/mobile/webapp/place/detail?qt=inf&uid=&wd=${encodeURIComponent(title)}&c=131&searchFlag=sort&center_rank=1&nb_x=${lng}&nb_y=${lat}&da_src=shareurl&uid=&industry=&qid=&pos=0&da_qrtp=0&da_adquery=&da_adtitle=${encodeURIComponent(title)}&detail_from=list&vt=map`;
                
                // 尝试打开百度地图APP，失败则打开网页版
                window.location.href = `baidumap://map/marker?location=${lat},${lng}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&src=webapp.baidu.openAPIdemo`;
                
                // 延迟跳转到网页版作为备用方案
                setTimeout(function() {
                    window.open(baiduMapUrl, '_blank');
                }, 500);
            });
        }
    }
    
    // 联系我们表单
    const contactForm = document.getElementById('contactForm');
    const contactSuccessMessage = document.getElementById('contactSuccessMessage');
    const contactErrorMessage = document.getElementById('contactErrorMessage');
    const contactErrorText = document.getElementById('contactErrorText');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>发送中...';
            submitBtn.disabled = true;
            
            // 隐藏之前的消息
            contactSuccessMessage.style.display = 'none';
            contactErrorMessage.style.display = 'none';
            
            // 模拟发送成功
            setTimeout(function() {
                contactSuccessMessage.style.display = 'block';
                
                // 重置表单
                setTimeout(function() {
                    contactForm.reset();
                    
                    // 恢复按钮状态
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
    
    // 初始化地图和跳转功能
    initBaiduMap();
    setupBaiduMapRedirect();
});