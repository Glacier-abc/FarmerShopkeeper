// 问题查询页面功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const queryForm = document.getElementById('queryForm');
    const queryContact = document.getElementById('queryContact');
    const queryResult = document.getElementById('queryResult');
    const resultContent = document.getElementById('resultContent');
    const noResults = document.getElementById('noResults');
    const queryHistory = document.getElementById('queryHistory');
    const historyList = document.getElementById('historyList');
    const clearAllHistoryBtn = document.getElementById('clearAllHistory');
    const issueDetailModal = new bootstrap.Modal(document.getElementById('issueDetailModal'));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // 初始化查询历史
    initQueryHistory();
    
    // 问题查询表单
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contact = queryContact.value.trim();
            
            if (!contact) {
                showError('请输入联系方式');
                return;
            }
            
            // 验证手机号码格式
            if (!/^1[3-9]\d{9}$/.test(contact)) {
                showError('请输入正确的手机号码格式');
                return;
            }
            
            // 显示加载状态
            const submitBtn = queryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>查询中...';
            submitBtn.disabled = true;
            
            // 隐藏之前的结果
            queryResult.style.display = 'none';
            noResults.style.display = 'none';
            
            // 模拟API请求延迟
            setTimeout(function() {
                // 查询问题
                const issues = queryIssuesByContact(contact);
                
                // 恢复按钮状态
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (issues && issues.length > 0) {
                    // 显示查询结果
                    displayQueryResults(issues);
                    
                    // 保存查询历史
                    saveQueryHistory(contact);
                    
                    // 显示查询历史
                    displayQueryHistory();
                } else {
                    // 显示无结果提示
                    noResults.style.display = 'block';
                }
            }, 1000);
        });
    }
    
    // 清空所有历史记录
    if (clearAllHistoryBtn) {
        clearAllHistoryBtn.addEventListener('click', function() {
            if (confirm('确定要清空所有查询历史记录吗？此操作不可撤销。')) {
                localStorage.removeItem('query_history');
                queryHistory.style.display = 'none';
                showToast('所有查询记录已清空', 'success');
            }
        });
    }
    
    // 设置确认删除按钮
    let currentDeleteContact = null;
    confirmDeleteBtn.addEventListener('click', function() {
        if (currentDeleteContact) {
            deleteQueryHistory(currentDeleteContact);
            confirmDeleteModal.hide();
            currentDeleteContact = null;
        }
    });
    
    // 查询问题函数
    function queryIssuesByContact(contact) {
        // 从localStorage获取所有问题
        const allIssues = JSON.parse(localStorage.getItem('submitted_issues') || '[]');
        
        // 过滤出匹配的联系方式的问题
        return allIssues.filter(issue => issue.contact === contact);
    }
    
    // 显示查询结果
    function displayQueryResults(issues) {
        resultContent.innerHTML = '';
        
        // 按提交时间降序排序
        issues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        issues.forEach((issue, index) => {
            const issueCard = createIssueCard(issue, index);
            resultContent.appendChild(issueCard);
        });
        
        queryResult.style.display = 'block';
    }
    
    // 创建问题卡片
    function createIssueCard(issue, index) {
        const card = document.createElement('div');
        card.className = 'card mb-3 issue-card';
        card.dataset.index = index;
        
        // 状态徽章
        let statusBadge = '';
        switch(issue.status) {
            case 'resolved':
                statusBadge = '<span class="status-badge status-resolved">已解决</span>';
                break;
            case 'processing':
                statusBadge = '<span class="status-badge status-processing">处理中</span>';
                break;
            default:
                statusBadge = '<span class="status-badge status-pending">待处理</span>';
        }
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="card-title">问题 #${index + 1}: ${issue.name} - ${issue.village}</h5>
                    ${statusBadge}
                </div>
                <p class="card-text text-muted">
                    <small>提交时间: ${formatDate(issue.timestamp)}</small>
                </p>
                <p class="card-text">${truncateText(issue.issue, 100)}</p>
                <div class="mt-3">
                    <span class="badge bg-light text-dark me-2">${issue.tags || '无标签'}</span>
                </div>
                <div class="mt-3">
                    <button class="btn btn-outline-primary btn-sm view-detail-btn">
                        <i class="fas fa-eye me-1"></i>查看详情
                    </button>
                </div>
            </div>
        `;
        
        // 添加查看详情事件
        card.querySelector('.view-detail-btn').addEventListener('click', function() {
            showIssueDetail(issue, index);
        });
        
        return card;
    }
    
    // 显示问题详情
    function showIssueDetail(issue, index) {
        const modalTitle = document.getElementById('issueDetailTitle');
        const modalBody = document.getElementById('issueDetailBody');
        
        modalTitle.textContent = `问题详情 #${index + 1}`;
        
        // 状态徽章
        let statusBadge = '';
        switch(issue.status) {
            case 'resolved':
                statusBadge = '<span class="status-badge status-resolved">已解决</span>';
                break;
            case 'processing':
                statusBadge = '<span class="status-badge status-processing">处理中</span>';
                break;
            default:
                statusBadge = '<span class="status-badge status-pending">待处理</span>';
        }
        
        // 处理时间线
        let timelineHTML = '';
        if (issue.updates && issue.updates.length > 0) {
            timelineHTML = `
                <div class="issue-timeline">
                    ${issue.updates.map(update => `
                        <div class="timeline-item">
                            <div class="timeline-date">${formatDate(update.date)}</div>
                            <div class="timeline-content">${update.content}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            timelineHTML = '<p class="text-muted">暂无处理进度更新</p>';
        }
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>提交人:</strong> ${issue.name}
                    </div>
                    <div class="mb-3">
                        <strong>联系方式:</strong> ${issue.contact}
                    </div>
                    <div class="mb-3">
                        <strong>所在村庄:</strong> ${issue.village}
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>提交时间:</strong> ${formatDate(issue.timestamp)}
                    </div>
                    <div class="mb-3">
                        <strong>状态:</strong> ${statusBadge}
                    </div>
                    <div class="mb-3">
                        <strong>问题标签:</strong> <span class="badge bg-light text-dark">${issue.tags || '无标签'}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <h6>问题描述:</h6>
                <div class="bg-light p-3 rounded">
                    ${issue.issue}
                </div>
            </div>
            
            <div class="mt-4">
                <h6>处理进度:</h6>
                ${timelineHTML}
            </div>
        `;
        
        issueDetailModal.show();
    }
    
    // 初始化查询历史
    function initQueryHistory() {
        const history = JSON.parse(localStorage.getItem('query_history') || '[]');
        if (history.length > 0) {
            displayQueryHistory();
        }
    }
    
    // 显示查询历史
    function displayQueryHistory() {
        const history = JSON.parse(localStorage.getItem('query_history') || '[]');
        
        if (history.length === 0) {
            queryHistory.style.display = 'none';
            return;
        }
        
        historyList.innerHTML = '';
        
        // 只显示最近5条记录
        const recentHistory = history.slice(-5);
        
        recentHistory.forEach(contact => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-item-content">${contact}</div>
                <div class="history-item-actions">
                    <button class="delete-history-btn" data-contact="${contact}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // 添加点击查询事件
            historyItem.querySelector('.history-item-content').addEventListener('click', function() {
                queryContact.value = contact;
                queryForm.dispatchEvent(new Event('submit'));
            });
            
            // 添加删除事件
            historyItem.querySelector('.delete-history-btn').addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                currentDeleteContact = contact;
                confirmDeleteModal.show();
            });
            
            historyList.appendChild(historyItem);
        });
        
        queryHistory.style.display = 'block';
    }
    
    // 删除查询历史
    function deleteQueryHistory(contact) {
        let history = JSON.parse(localStorage.getItem('query_history') || '[]');
        
        // 移除指定的记录
        history = history.filter(item => item !== contact);
        
        // 保存到localStorage
        localStorage.setItem('query_history', JSON.stringify(history));
        
        // 重新显示查询历史
        displayQueryHistory();
        
        // 显示成功消息
        showToast('查询记录已删除', 'success');
    }
    
    // 保存查询历史
    function saveQueryHistory(contact) {
        let history = JSON.parse(localStorage.getItem('query_history') || '[]');
        
        // 移除已存在的相同记录
        history = history.filter(item => item !== contact);
        
        // 添加新记录
        history.push(contact);
        
        // 保存到localStorage
        localStorage.setItem('query_history', JSON.stringify(history));
    }
    
    // 显示错误消息
    function showError(message) {
        // 可以使用Toast或Alert显示错误信息
        alert(message);
    }
    
    // 显示Toast消息
    function showToast(message, type = 'info') {
        // 创建Toast元素
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();
        const toast = document.createElement('div');
        
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // 显示Toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // 自动移除Toast
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // 创建Toast容器
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '11';
        document.body.appendChild(container);
        return container;
    }
    
    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }
    
    // 数字补零
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    // 截断文本
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // 如果没有数据，创建一些示例数据
    if (!localStorage.getItem('submitted_issues')) {
        const sampleData = [
            {
                name: '张三',
                contact: '13800138000',
                village: '张家村',
                issue: '水稻叶片出现黄斑，如何防治？请问应该使用什么农药？是否需要特殊的施肥方法？',
                tags: '种植技术,病虫害防治',
                timestamp: new Date('2023-06-15T14:30:00').toISOString(),
                status: 'resolved',
                updates: [
                    {
                        date: new Date('2023-06-15T14:30:00').toISOString(),
                        content: '问题已提交，等待处理'
                    },
                    {
                        date: new Date('2023-06-16T09:15:00').toISOString(),
                        content: '问题已分配给种植技术研究院专家处理'
                    },
                    {
                        date: new Date('2023-06-17T11:20:00').toISOString(),
                        content: '专家回复：可能是稻瘟病，建议使用三环唑进行防治，按照说明书比例稀释后喷洒'
                    },
                    {
                        date: new Date('2023-06-20T16:45:00').toISOString(),
                        content: '问题已解决，用户确认有效'
                    }
                ]
            },
            {
                name: '李四',
                contact: '13900139000',
                village: '李家庄',
                issue: '玉米生长缓慢，应该施什么肥料？现在的土壤肥力可能不足。',
                tags: '种植技术,土壤肥料',
                timestamp: new Date('2023-06-20T09:15:00').toISOString(),
                status: 'processing',
                updates: [
                    {
                        date: new Date('2023-06-20T09:15:00').toISOString(),
                        content: '问题已提交，等待处理'
                    },
                    {
                        date: new Date('2023-06-21T10:30:00').toISOString(),
                        content: '问题已分配给土壤肥料研究院专家处理'
                    },
                    {
                        date: new Date('2023-06-22T14:20:00').toISOString(),
                        content: '专家初步分析：可能需要补充氮肥和磷肥，建议进行土壤检测'
                    }
                ]
            },
            {
                name: '王五',
                contact: '13700137000',
                village: '王家屯',
                issue: '我家养猪场有几头猪食欲不振，体温偏高，是什么病症？',
                tags: '养殖技术',
                timestamp: new Date('2023-06-25T11:30:00').toISOString(),
                status: 'pending',
                updates: [
                    {
                        date: new Date('2023-06-25T11:30:00').toISOString(),
                        content: '问题已提交，等待处理'
                    }
                ]
            }
        ];
        
        localStorage.setItem('submitted_issues', JSON.stringify(sampleData));
    }
});