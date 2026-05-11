// /js/strategy-center.js
const { createApp } = Vue;

createApp({
    data() {
        return {
            strategyTab: 'character',
            strategySearchQuery: '',
            strategyRoles: [],
            savedStrategies: []
        };
    },
    computed: {
        filteredRoles() {
            if (!this.strategySearchQuery) {
                return this.strategyRoles;
            }
            const query = this.strategySearchQuery.toLowerCase();
            return this.strategyRoles.filter(role =>
                role.name.toLowerCase().includes(query) ||
                (role.description && role.description.toLowerCase().includes(query)) ||
                (role.attribute && role.attribute.toLowerCase().includes(query))
            );
        }
    },
    async mounted() {
        await this.fetchRoles();
        await this.loadSavedStrategies();
        this.setupUserDropdown();
    },
    methods: {
        async fetchRoles() {
            try {
                const response = await fetch('/api/roles');
                if (response.ok) {
                    this.strategyRoles = await response.json();
                } else {
                    // 使用模拟数据
                    this.strategyRoles = [
                        {
                            id: 1,
                            name: '简',
                            description: '强大的物理攻击角色',
                            level: 80,
                            hp: 15000,
                            attribute: '物理',
                            attackType: '强攻',
                            imageUrl: '/images/role1.jpg'
                        },
                        {
                            id: 2,
                            name: '橘福福',
                            description: '火属性远程角色',
                            level: 75,
                            hp: 12000,
                            attribute: '火属性',
                            attackType: '远程',
                            imageUrl: '/images/role2.jpg'
                        },
                        {
                            id: 3,
                            name: '月影',
                            description: '冰属性控制角色',
                            level: 70,
                            hp: 11000,
                            attribute: '冰属性',
                            attackType: '辅助',
                            imageUrl: '/images/role3.jpg'
                        }
                    ];
                }
            } catch (error) {
                console.error('获取角色列表失败:', error);
                this.strategyRoles = [];
            }
        },
        async loadSavedStrategies() {
            try {
                const saved = localStorage.getItem('savedStrategies');
                this.savedStrategies = saved ? JSON.parse(saved) : [];
            } catch (error) {
                console.error('加载收藏失败:', error);
                this.savedStrategies = [];
            }
        },
        setStrategyTab(tab) {
            this.strategyTab = tab;
        },
        viewStrategy(role) {
            alert(`正在加载 ${role.name} 的详细攻略...\n\n暂时请前往角色管理页面查看详细技能信息。`);
        },
        saveStrategy(role) {
            const isAlreadySaved = this.savedStrategies.some(r => r.id === role.id);
            if (isAlreadySaved) {
                alert(`已取消收藏 ${role.name} 的攻略！`);
                this.savedStrategies = this.savedStrategies.filter(r => r.id !== role.id);
            } else {
                alert(`已收藏 ${role.name} 的攻略！`);
                this.savedStrategies.push(role);
            }

            // 保存到localStorage
            localStorage.setItem('savedStrategies', JSON.stringify(this.savedStrategies));
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

                const logoutBtn = document.querySelector('.logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        if (confirm('确定要退出登录吗？')) {
                            localStorage.removeItem('token');
                            window.location.href = 'login.html';
                        }
                    });
                }
            }
        }
    }
}).mount('#strategy-app');