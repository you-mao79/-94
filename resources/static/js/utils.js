// /js/utils.js

// 格式化文件大小
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件扩展名
export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
}

// 处理图片加载错误
export function handleImageError(event) {
    event.target.src = '/images/default.jpg';
}

// 处理头像加载错误
export function handleAvatarError(event) {
    event.target.src = '/images/default-avatar.jpg';
}

// 检查是否登录
export function checkLogin() {
    const token = localStorage.getItem('token');
    return token && token !== '';
}

// 跳转到登录页
export function redirectToLogin() {
    window.location.href = 'login.html';
}

// 显示加载状态
export function showLoading(containerId, message = '加载中...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// 显示错误状态
export function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h4>加载失败</h4>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">重试</button>
            </div>
        `;
    }
}