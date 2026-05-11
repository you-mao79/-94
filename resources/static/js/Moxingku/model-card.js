export const ModelCard = {
    template: `
        <div class="model-card">
            <img 
                :src="role.imageUrl || '/images/default.jpg'" 
                :alt="role.name" 
                class="model-image"
                @error="$event.target.src='/images/default.jpg'"
            >
            <div class="model-content">
                <div class="model-title">
                    <h3>{{ role.name }}</h3>
                    <span v-if="hasModel" class="model-format">
                        {{ format.toUpperCase() }}
                    </span>
                    <span v-else class="model-format no-model">
                        无模型
                    </span>
                </div>

                <div class="model-meta">
                    <span><i class="bi bi-person-badge"></i> Lv.{{ role.level || 60 }}</span>
                    <span><i class="bi bi-lightning-charge"></i> {{ role.attribute || '物理' }}</span>
                    <span v-if="hasModel">
                        <i class="bi bi-file-earmark"></i> {{ role.modelFile }}
                    </span>
                    <span v-else>
                        <i class="bi bi-exclamation-triangle"></i> 未上传模型
                    </span>
                </div>

                <div class="model-actions">
                    <button
                        class="model-btn preview-btn"
                        @click="$emit('preview', role)"
                        :disabled="!hasModel"
                    >
                        <i class="bi bi-eye"></i> 预览
                    </button>
                    <button
                        class="model-btn download-btn"
                        @click="$emit('download', role)"
                        :disabled="!hasModel"
                    >
                        <i class="bi bi-download"></i> 下载
                    </button>
                </div>

                <button
                    class="upload-btn action"
                    @click="$emit('upload', role)"
                >
                    <i class="bi bi-upload"></i> 上传模型
                </button>
            </div>
        </div>
    `,
    props: {
        role: {
            type: Object,
            required: true
        }
    },
    computed: {
        hasModel() {
            return this.role.modelFile && this.role.modelFile !== 'default.pmx';
        },
        format() {
            if (!this.hasModel) return '';
            return this.role.modelFile.split('.').pop().toLowerCase();
        }
    }
};