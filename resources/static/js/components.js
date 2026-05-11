// 公共导航栏组件
export const NavBar = {
    template: `
        <nav class="main-nav">
            <div class="nav-brand">
                <img src="/images/tubiao.png" alt="品牌图标" style="width: 95px; height: 55px; margin-right: 10px; vertical-align: middle;">
                角色管理系统
            </div>

            <div class="nav-links">
                <a href="home.html" class="nav-btn" :class="{ active: currentPage === 'home' }">
                    <i class="bi bi-house"></i> <span>首页</span>
                </a>
                <a href="model-library.html" class="nav-btn" :class="{ active: currentPage === 'model-library' }">
                    <i class="bi bi-collection"></i> <span>模型库</span>
                </a>
                <a href="strategy-center.html" class="nav-btn" :class="{ active: currentPage === 'strategy-center' }">
                    <i class="bi bi-journal-text"></i> <span>攻略中心</span>
                </a>

                <!-- 用户菜单 -->
                <div class="user-dropdown">
                    <button class="user-btn" @click="toggleUserDropdown">
                        <img :src="userAvatar" class="user-avatar" @error="handleAvatarError" alt="用户头像">
                        <span class="user-name">{{ userName }}</span>
                        <i class="bi bi-chevron-down"></i>
                    </button>
                    <div class="user-dropdown-content" v-show="showUserDropdown">
                        <div class="user-info">
                            <img :src="userAvatar" class="user-avatar-large" @error="handleAvatarError">
                            <div class="user-details">
                                <h4>{{ userName }}</h4>
                                <p>UID: {{ userUid }}</p>
                                <span class="user-level">Lv.{{ userLevel }}</span>
                            </div>
                        </div>
                        <div class="user-menu">
                            <a href="personal-center.html" class="user-menu-item">
                                <i class="bi bi-person"></i> 个人中心
                            </a>
                            <a href="#" class="user-menu-item">
                                <i class="bi bi-gear"></i> 账号设置
                            </a>
                            <a href="#" class="user-menu-item">
                                <i class="bi bi-bookmark-heart"></i> 我的收藏
                            </a>
                            <div class="divider"></div>
                            <button class="logout-btn" @click="logout">
                                <i class="bi bi-box-arrow-right"></i> 退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `,
    props: {
        currentPage: String,
        userName: {
            type: String,
            default: '绮哟哟'
        },
        userAvatar: {
            type: String,
            default: '/images/avatar.jpg'
        },
        userUid: {
            type: String,
            default: 'G213323441'
        },
        userLevel: {
            type: Number,
            default: 60
        }
    },
    data() {
        return {
            showUserDropdown: false
        };
    },
    methods: {
        toggleUserDropdown() {
            this.showUserDropdown = !this.showUserDropdown;
        },

        handleAvatarError(event) {
            console.log('头像加载失败，使用默认头像');
            event.target.src = '/images/C69.png';
            event.target.onerror = null; // 防止循环错误
        },

        logout() {
            if (confirm('确定要退出登录吗？')) {
                // 清除所有用户相关存储
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                localStorage.removeItem('userAccount');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('token');
                localStorage.removeItem('savedStrategies');
                localStorage.removeItem('loginDays');

                // 跳转到登录页
                window.location.href = 'login.html';
            }
        },

        // 更新用户信息的方法（可从外部调用）
        updateUserInfo(userData) {
            if (userData.username) {
                this.userName = userData.username;
            }
            if (userData.avatarUrl) {
                this.userAvatar = userData.avatarUrl;
            }
            if (userData.account) {
                this.userUid = userData.account;
            }
            if (userData.level) {
                this.userLevel = userData.level;
            }
        }
    },
    mounted() {
        // 尝试从本地存储加载用户信息
        const savedUsername = localStorage.getItem('username');
        const savedAvatar = localStorage.getItem('userAvatar');
        const savedAccount = localStorage.getItem('userAccount');
        const savedLevel = localStorage.getItem('userLevel');

        if (savedUsername) {
            this.userName = savedUsername;
        }
        if (savedAvatar) {
            this.userAvatar = savedAvatar;
        }
        if (savedAccount) {
            this.userUid = savedAccount;
        }
        if (savedLevel) {
            this.userLevel = parseInt(savedLevel);
        }

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.showUserDropdown = false;
            }
        });

        // 监听用户信息更新事件
        window.addEventListener('userAvatarUpdated', (event) => {
            if (event.detail && event.detail.avatarUrl) {
                this.userAvatar = event.detail.avatarUrl;
            }
        });

        window.addEventListener('userProfileUpdated', (event) => {
            if (event.detail) {
                if (event.detail.username) {
                    this.userName = event.detail.username;
                }
                if (event.detail.account) {
                    this.userUid = event.detail.account;
                }
            }
        });
    }
};

// 通用模态框组件
export const Modal = {
    template: `
        <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
            <div class="modal-content" :style="{ maxWidth: width + 'px' }">
                <div class="modal-header">
                    <h2>{{ title }}</h2>
                    <button class="close-btn" @click="$emit('close')">×</button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-actions" v-if="showActions">
                    <slot name="actions"></slot>
                </div>
            </div>
        </div>
    `,
    props: {
        show: Boolean,
        title: String,
        width: {
            type: [Number, String],
            default: 600
        },
        showActions: {
            type: Boolean,
            default: true
        }
    },
    mounted() {
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
    },
    beforeUnmount() {
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
};

// 通用的页面初始化函数
export function initializePage() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    // 如果未登录，跳转到登录页
    if (!isLoggedIn || isLoggedIn !== 'true' || !username || !token) {
        console.log('未登录，跳转到登录页面');
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// 加载用户信息的通用函数
export async function loadUserInfo() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            return getDefaultUserInfo();
        }

        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
            const userData = await response.json();
            return processUserData(userData);
        } else {
            return getDefaultUserInfo();
        }
    } catch (error) {
        console.error('加载用户信息失败:', error);
        return getDefaultUserInfo();
    }
}

function getDefaultUserInfo() {
    return {
        username: localStorage.getItem('username') || '绮哟哟',
        avatarUrl: localStorage.getItem('userAvatar') || '/images/avatar.jpg',
        account: localStorage.getItem('userAccount') || 'G213323441',
        level: parseInt(localStorage.getItem('userLevel') || '60')
    };
}

function processUserData(userData) {
    // 处理头像URL
    let avatarUrl = userData.avatarUrl || '';
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
        avatarUrl = '/' + avatarUrl;
    }

    return {
        username: userData.username || '未设置用户名',
        avatarUrl: avatarUrl || '/images/avatar.jpg',
        account: userData.account || '未设置账号',
        level: 60
    };
}