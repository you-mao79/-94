// /js/home-enhanced.js
const { createApp } = Vue;

createApp({
    data() {
        return {
            userName: '绮哟哟',
            userUid: 'G213323441',
            userLevel: 60,
            isLoggedIn: false,
            // 统计数据
            stats: {
                roleCount: 0,
                modelCount: 0,
                collectionCount: 5,
                activityCount: 12
            },
            recentActivities: [
                {
                    icon: 'bi bi-person-plus',
                    title: '新增了角色「简」',
                    time: '2小时前'
                },
                {
                    icon: 'bi bi-upload',
                    title: '上传了PMX模型文件',
                    time: '5小时前'
                },
                {
                    icon: 'bi bi-heart-fill',
                    title: '收藏了「橘福福」的攻略',
                    time: '1天前'
                }
            ]
        };
    },

    methods: {
        checkLogin() {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const username = localStorage.getItem('username');

            if (isLoggedIn !== 'true' || !username) {
                window.location.href = 'login.html';
                return false;
            }

            this.isLoggedIn = true;
            this.userName = username || '绮哟哟';
            return true;
        },

        async fetchStats() {
            try {
                // 获取角色数量
                const rolesResponse = await fetch('/api/roles');
                if (rolesResponse.ok) {
                    const roles = await rolesResponse.json();
                    this.stats.roleCount = roles.length;

                    // 计算有模型的角色数量
                    const modelCount = roles.filter(role =>
                        role.modelFile && role.modelFile !== 'default.pmx'
                    ).length;
                    this.stats.modelCount = modelCount;
                }
            } catch (error) {
                console.error('获取统计数据失败:', error);
                // 使用默认值而不是模拟数据
                this.stats.roleCount = 0;
                this.stats.modelCount = 0;
            }
        },

        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('userAccount');
                window.location.href = 'login.html';
            }
        },

        setupUserDropdown() {
            const userBtn = document.getElementById('user-dropdown-btn');
            const userDropdown = document.getElementById('userDropdown');

            if (userBtn && userDropdown) {
                userBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    userDropdown.classList.toggle('show');
                });

                document.addEventListener('click', function() {
                    userDropdown.classList.remove('show');
                });
            }
        },

        setupNavigation() {
            // 设置导航栏激活状态
            const currentPage = 'home';
            const navButtons = document.querySelectorAll('.nav-btn');

            navButtons.forEach(btn => {
                if (btn.id === `nav-${currentPage}`) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    },

    async mounted() {
        // 检查登录状态
        if (!this.checkLogin()) {
            return;
        }

        // 设置导航栏
        this.setupNavigation();

        // 获取统计数据
        await this.fetchStats();

        // 设置用户下拉菜单
        this.setupUserDropdown();

        // 设置登出按钮
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }
}).mount('#home-app');