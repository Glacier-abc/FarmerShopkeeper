// 农科院介绍页面功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 这个页面主要是静态内容，可以添加一些交互效果
    const academyCards = document.querySelectorAll('.academy-card');
    
    academyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.03)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});