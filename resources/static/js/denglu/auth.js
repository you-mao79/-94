// /js/auth.js -
export class AuthManager {

    // 检查是否登录
    static isLoggedIn() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('username');
        return isLoggedIn === 'true' && username && username.trim() !== '';
    }

    // 获取当前用户
    static getCurrentUser() {
        if (!this.isLoggedIn()) return null;

        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            account: localStorage.getItem('userAccount'),
            avatarUrl: localStorage.getItem('userAvatar') || '/images/default-avatar.jpg',
            token: localStorage.getItem('token')
        };
    }

    // 登录
    static login(userData) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userAccount', userData.account);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userAvatar', userData.avatarUrl || '/images/default-avatar.jpg');
    }

    // 登出
    static logout(redirectToLogin = true) {
        if (confirm('确定要退出登录吗？')) {
            localStorage.clear();
            if (redirectToLogin) {
                window.location.href = 'login.html';
            }
            return true;
        }
        return false;
    }

    // 需要登录的页面检查
    static requireLogin(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // 已经登录的页面检查（如登录页）
    static checkAlreadyLoggedIn(redirectUrl = 'home.html') {
        if (this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    }
}