// 首页功能脚本 - 使用EmailJS提交表单并存储到localStorage
document.addEventListener('DOMContentLoaded', function() {
    // 初始化EmailJS
    emailjs.init("8dRzAcw7ma6yp4QED"); // 替换为您的EmailJS公钥
    
    // 标签选择功能
    const tags = document.querySelectorAll('.tag');
    const selectedTagsInput = document.getElementById('selectedTags');
    let selectedTags = [];
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('selected');
            const value = this.getAttribute('data-value');
            
            if (this.classList.contains('selected')) {
                if (!selectedTags.includes(value)) {
                    selectedTags.push(value);
                }
            } else {
                selectedTags = selectedTags.filter(tag => tag !== value);
            }
            
            selectedTagsInput.value = selectedTags.join(',');
        });
    });
    
    // 问题提交表单
    const issueForm = document.getElementById('issueForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitBtn = issueForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>提交中...';
            submitBtn.disabled = true;
            
            // 隐藏之前的消息
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
            // 获取表单数据
            const formData = {
                name: document.getElementById('name').value,
                contact: document.getElementById('contact').value,
                village: document.getElementById('village').value,
                issue: document.getElementById('issue').value,
                tags: selectedTagsInput.value,
                timestamp: new Date().toISOString(),
                status: 'pending', // 初始状态为待处理
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5) // 生成唯一ID
            };
            
            // 邮箱映射
            const emailMapping = {
                '种植技术': '743623524@qq.com',
                '养殖技术': '743623524@qq.com',
                '病虫害防治': '743623524@qq.com',
                '土壤肥料': '743623524@qq.com',
                '农产品加工': '743623524@qq.com',
                '农业机械': '743623524@qq.com',
                '水利灌溉': '743623524@qq.com',
                '农业政策': '743623524@qq.com'
            };
            
            // 发送到乡政府
            const townshipEmail = '743623524@qq.com';
            
            // 发送邮件到乡政府
            emailjs.send('service_4x052o6', 'template_00spohr', {
                to_email: townshipEmail,
                from_name: formData.name,
                contact: formData.contact,
                village: formData.village,
                issue: formData.issue,
                tags: formData.tags,
                timestamp: new Date().toLocaleString('zh-CN')
            })
            .then(function(response) {
                console.log('发送到乡政府成功:', response.status, response.text);
                
                // 存储问题数据到localStorage
                saveIssueToLocalStorage(formData);
                
                // 如果没有选择标签，直接返回成功
                if (selectedTags.length === 0) {
                    return Promise.resolve([]);
                }
                
                // 发送到农科院
                const academyPromises = selectedTags.map(tag => {
                    const academyEmail = emailMapping[tag] || 'general@academy.com';
                    
                    return emailjs.send('service_4x052o6', 'template_ppk2evb', {
                        to_email: academyEmail,
                        from_name: formData.name,
                        contact: formData.contact,
                        village: formData.village,
                        issue: formData.issue,
                        tag: tag,
                        timestamp: new Date().toLocaleString('zh-CN')
                    });
                });
                
                // 等待所有农科院邮件发送完成
                return Promise.all(academyPromises);
            })
            .then(function(responses) {
                console.log('所有邮件发送成功:', responses);
                
                // 显示成功消息
                successMessage.style.display = 'block';
                
                // 重置表单
                setTimeout(function() {
                    issueForm.reset();
                    successMessage.style.display = 'none';
                    tags.forEach(tag => tag.classList.remove('selected'));
                    selectedTags = [];
                    selectedTagsInput.value = '';
                    
                    // 恢复按钮状态
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            })
            .catch(function(error) {
                console.error('邮件发送失败:', error);
                
                // 即使邮件发送失败，也尝试保存数据到localStorage
                try {
                    saveIssueToLocalStorage(formData);
                    console.log('邮件发送失败，但问题数据已保存到本地');
                } catch (storageError) {
                    console.error('数据保存失败:', storageError);
                }
                
                // 显示错误消息
                errorText.textContent = '邮件发送失败，但问题已保存到本地: ' + (error.text || '请检查网络连接后重试');
                errorMessage.style.display = 'block';
                
                // 恢复按钮状态
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // 保存问题到localStorage
    function saveIssueToLocalStorage(issueData) {
        try {
            // 保存到全局问题列表
            const allIssues = JSON.parse(localStorage.getItem('submitted_issues') || '[]');
            allIssues.push(issueData);
            localStorage.setItem('submitted_issues', JSON.stringify(allIssues));
            
            // 保存到按联系方式分组的问题列表
            const contactKey = `issue_${issueData.contact}`;
            const contactIssues = JSON.parse(localStorage.getItem(contactKey) || '[]');
            contactIssues.push(issueData);
            localStorage.setItem(contactKey, JSON.stringify(contactIssues));
            
            console.log('问题数据已保存到localStorage');
        } catch (error) {
            console.error('保存数据到localStorage失败:', error);
            throw error;
        }
    }
    
    // 如果没有示例数据，创建一些示例数据
    if (!localStorage.getItem('submitted_issues')) {
        const sampleData = [
            {
                id: '1',
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
                id: '2',
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
                id: '3',
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
        
        // 同时按联系方式分组存储
        sampleData.forEach(issue => {
            const contactKey = `issue_${issue.contact}`;
            const contactIssues = JSON.parse(localStorage.getItem(contactKey) || '[]');
            contactIssues.push(issue);
            localStorage.setItem(contactKey, JSON.stringify(contactIssues));
        });
    }
});