import { NavBar } from '../components.js';
import { ModelCard } from './model-card.js';
import { UploadModal } from './upload-modal.js';

const { createApp } = Vue;

createApp({
    components: {
        NavBar,
        ModelCard,
        UploadModal
    },
    template: `
        <div>
            <NavBar 
                :current-page="currentPage"
                :user-name="userName"
                :user-avatar="userAvatar"
                :user-uid="userUid"
                :user-level="userLevel"
                :unread-count="unreadCount"
            />
            
            <div class="model-library">
                <div class="library-header">
                    <h1>3D模型库</h1>
                    <p>管理所有角色的3D模型文件</p>
                </div>

                <div class="library-stats">
                    <div class="stat-card">
                        <i class="bi bi-collection"></i>
                        <h3>{{ totalModels }}</h3>
                        <p>总模型数</p>
                    </div>

                    <div class="stat-card">
                        <i class="bi bi-filetype-pmx"></i>
                        <h3>{{ pmxModels }}</h3>
                        <p>PMX模型</p>
                    </div>

                    <div class="stat-card">
                        <i class="bi bi-filetype-fbx"></i>
                        <h3>{{ fbxModels }}</h3>
                        <p>FBX模型</p>
                    </div>

                    <div class="stat-card">
                        <i class="bi bi-download"></i>
                        <h3>{{ roles.length }}</h3>
                        <p>关联角色</p>
                    </div>
                </div>

                <div class="library-controls">
                    <div class="search-box">
                        <input
                            type="text"
                            class="search-input"
                            placeholder="搜索角色名称..."
                            v-model="searchQuery"
                        >
                    </div>

                    <select class="filter-select" v-model="selectedAttribute">
                        <option value="">所有属性</option>
                        <option value="物理">物理</option>
                        <option value="火属性">火属性</option>
                        <option value="电属性">电属性</option>
                        <option value="冰属性">冰属性</option>
                    </select>

                    <select class="sort-select" v-model="sortBy">
                        <option value="name">按名称排序</option>
                        <option value="level">按等级排序</option>
                        <option value="recent">按最近更新</option>
                    </select>

                    <button class="upload-btn" @click="showGeneralUpload = true">
                        <i class="bi bi-upload"></i> 上传模型
                    </button>
                </div>

                <div class="model-grid">
                    <ModelCard
                        v-for="role in filteredModels"
                        :key="role.id"
                        :role="role"
                        @preview="previewModel"
                        @download="downloadModel"
                        @upload="uploadForRole"
                    />
                </div>

                <div v-if="filteredModels.length === 0" class="empty-state">
                    <i class="bi bi-collection"></i>
                    <h3>暂无模型</h3>
                    <p>还没有上传3D模型文件，点击右上角"上传模型"开始上传</p>
                </div>
            </div>

            <!-- 通用上传模态框 -->
            <UploadModal
                :show="showGeneralUpload"
                :roles="roles"
                :uploading="uploading"
                :progress="uploadProgress"
                @close="showGeneralUpload = false"
                @upload="handleUpload"
            />

            <!-- 特定角色上传模态框 -->
            <UploadModal
                :show="showSpecificUpload"
                :role="uploadRole"
                :roles="roles"
                :uploading="uploading"
                :progress="uploadProgress"
                @close="showSpecificUpload = false"
                @upload="handleUpload"
            />

            <!-- 预览模态框 -->
<div v-if="previewModelData" class="modal-overlay">
    <div class="modal-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2>{{ previewModelData.name }} - 模型预览</h2>
            <button 
                @click="previewModelData = null" 
                style="
                    background: none; 
                    border: none; 
                    font-size: 24px; 
                    cursor: pointer; 
                    color: #333; 
                    width: 30px; 
                    height: 30px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 5px; 
                    background: #f0f0f0;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='#e0e0e0'; this.style.color='#ff6b6b'"
                onmouseout="this.style.background='#f0f0f0'; this.style.color='#333'"
            >
                ×
            </button>
        </div>

        <div id="model-preview-container" style="width: 100%; height: 400px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
            <div style="text-align: center;">
                <div v-if="previewLoading" class="loading-spinner"></div>
                <template v-else>
                    <i class="bi bi-box" style="font-size: 48px; color: #4facfe; margin-bottom: 10px;"></i>
                    <p>模型预览加载中...</p>
                    <p>{{ previewModelData.modelFile }}</p>
                </template>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <button
                @click="downloadModel(previewModelData)"
                :disabled="!previewModelData.modelFile || previewModelData.modelFile === 'default.pmx'"
                style="width: 100%; padding: 12px; background: #4facfe; color: white; border: none; border-radius: 8px; cursor: pointer;"
            >
                <i class="bi bi-download"></i> 下载模型文件
            </button>
        </div>
    </div>
</div>
  </div>
    `,
    data() {
        return {
            currentPage: 'model-library',
            userName: '绮哟哟',
            userAvatar: '/images/avatar.jpg',
            userUid: 'G213323441',
            userLevel: 60,
            unreadCount: 3,
            roles: [],
            searchQuery: '',
            selectedAttribute: '',
            sortBy: 'name',
            showGeneralUpload: false,
            showSpecificUpload: false,
            uploadRole: null,
            uploading: false,
            uploadProgress: 0,
            previewModelData: null,
            previewLoading: false
        };
    },
    computed: {
        filteredModels() {
            let filtered = this.roles.filter(role => {
                const matchesSearch = !this.searchQuery ||
                    role.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchesAttribute = !this.selectedAttribute ||
                    role.attribute === this.selectedAttribute;
                return matchesSearch && matchesAttribute;
            });

            switch (this.sortBy) {
                case 'name':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'level':
                    filtered.sort((a, b) => b.level - a.level);
                    break;
                case 'recent':
                    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                    break;
            }

            return filtered;
        },
        totalModels() {
            return this.roles.filter(role => role.modelFile && role.modelFile !== 'default.pmx').length;
        },
        pmxModels() {
            return this.roles.filter(role =>
                role.modelFile && role.modelFile.toLowerCase().endsWith('.pmx')
            ).length;
        },
        fbxModels() {
            return this.roles.filter(role =>
                role.modelFile && role.modelFile.toLowerCase().endsWith('.fbx')
            ).length;
        }
    },
    methods: {
        async fetchRoles() {
            try {
                const response = await fetch('/api/roles');
                if (response.ok) {
                    this.roles = await response.json();
                } else {
                    throw new Error('获取角色列表失败');
                }
            } catch (error) {
                console.error('获取角色列表失败:', error);
                alert('获取角色列表失败，请检查网络连接');
            }
        },
        previewModel(role) {
            this.previewModelData = role;
            this.previewLoading = true;

            this.$nextTick(() => {
                // 这里可以集成 Three.js 进行实际模型预览
                setTimeout(() => {
                    this.previewLoading = false;
                }, 1000);
            });
        },
        uploadForRole(role) {
            this.uploadRole = role;
            this.showSpecificUpload = true;
        },
        async handleUpload({ roleId, file }) {
            this.uploading = true;
            this.uploadProgress = 0;

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('roleId', roleId);

                // 模拟上传进度
                const interval = setInterval(() => {
                    if (this.uploadProgress < 90) {
                        this.uploadProgress += 10;
                    }
                }, 200);

                const response = await fetch('/api/roles/upload-model', {
                    method: 'POST',
                    body: formData
                });

                clearInterval(interval);
                this.uploadProgress = 100;

                if (response.ok) {
                    const result = await response.json();
                    alert('模型上传成功！');

                    // 刷新角色列表
                    await this.fetchRoles();

                    // 关闭模态框
                    this.showGeneralUpload = false;
                    this.showSpecificUpload = false;
                    this.uploadRole = null;

                    // 如果预览的是当前角色，更新预览
                    if (this.previewModelData && this.previewModelData.id === roleId) {
                        this.previewModelData.modelFile = result.fileName;
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '上传失败');
                }
            } catch (error) {
                console.error('上传失败:', error);
                alert('上传失败: ' + error.message);
            } finally {
                this.uploading = false;
                this.uploadProgress = 0;
            }
        },
        downloadModel(role) {
            if (!role.modelFile || role.modelFile === 'default.pmx') {
                alert('该角色没有可下载的模型文件');
                return;
            }

            const modelUrl = `/models/${role.modelFile}`;
            const link = document.createElement('a');
            link.href = modelUrl;
            link.download = `${role.name}_${role.modelFile}`;
            link.click();
        },
        getFileExtension(filename) {
            return filename ? filename.split('.').pop().toUpperCase() : '未知';
        }
    },
    async mounted() {
        await this.fetchRoles();
    }
}).mount('#app');