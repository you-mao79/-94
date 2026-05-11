// /js/home.js
const { createApp } = Vue;

createApp({
    data() {
        return {
            userName: '绮哟哟',
            userUid: 'G213323441',
            userLevel: 60,
            // 统计数据
            stats: {
                roleCount: 3,
                modelCount: 2,
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
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('token');
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
        }
    },
    mounted() {
        this.setupUserDropdown();

        // 更新统计数据
        try {
            // 这里可以从localStorage或API获取真实数据
            const storedStats = localStorage.getItem('userStats');
            if (storedStats) {
                const stats = JSON.parse(storedStats);
                Object.assign(this.stats, stats);
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }
}).mount('#home-app');