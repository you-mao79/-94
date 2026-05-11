export const UploadModal = {
    template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal-content">
                <h2>上传模型文件</h2>
                <p v-if="role">为 <strong>{{ role.name }}</strong> 上传3D模型文件</p>
                <p v-else>选择角色上传模型文件</p>

                <div v-if="!role" style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        选择角色:
                    </label>
                    <select v-model="selectedRoleId" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                        <option value="">请选择角色</option>
                        <option v-for="r in roles" :value="r.id">{{ r.name }}</option>
                    </select>
                </div>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        选择模型文件:
                    </label>
                    <input
                        type="file"
                        accept=".pmx,.fbx,.obj"
                        @change="handleFileSelect"
                        style="width: 100%; padding: 10px; border: 2px dashed #ddd; border-radius: 8px;"
                    >
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">
                        支持格式: PMX, FBX, OBJ (最大500MB)
                    </p>
                </div>

                <div v-if="selectedFile">
                    <p><strong>已选择文件:</strong> {{ selectedFile.name }}</p>
                    <p><strong>文件大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
                </div>

                <div v-if="uploading" class="upload-progress">
                    <div class="progress-bar" :style="{width: progress + '%'}"></div>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button
                        @click="$emit('close')"
                        style="flex: 1; padding: 12px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer;"
                    >
                        取消
                    </button>
                    <button
                        @click="confirmUpload"
                        :disabled="!canUpload"
                        style="flex: 1; padding: 12px; background: #4facfe; color: white; border: none; border-radius: 8px; cursor: pointer;"
                    >
                        {{ uploading ? '上传中...' : '确认上传' }}
                    </button>
                </div>
            </div>
        </div>
    `,
    props: {
        show: Boolean,
        role: Object,
        roles: Array,
        uploading: Boolean,
        progress: Number
    },
    data() {
        return {
            selectedRoleId: '',
            selectedFile: null
        };
    },
    computed: {
        canUpload() {
            const hasRole = this.role ? true : this.selectedRoleId;
            return hasRole && this.selectedFile && !this.uploading;
        }
    },
    methods: {
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            const allowedTypes = ['.pmx', '.fbx', '.obj'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!allowedTypes.includes(fileExtension)) {
                alert('只支持 PMX、FBX、OBJ 格式的文件');
                event.target.value = '';
                return;
            }

            if (file.size > 500 * 1024 * 1024) {
                alert('文件大小不能超过500MB');
                event.target.value = '';
                return;
            }

            this.selectedFile = file;
        },
        confirmUpload() {
            const roleId = this.role ? this.role.id : this.selectedRoleId;
            if (!roleId || !this.selectedFile) {
                alert('请选择角色和文件');
                return;
            }

            this.$emit('upload', {
                roleId: roleId,
                file: this.selectedFile
            });
        },
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },
    watch: {
        show(newVal) {
            if (!newVal) {
                this.selectedRoleId = '';
                this.selectedFile = null;
            }
        }
    }
};