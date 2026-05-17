<template>
  <div class="precautions-wang-editor">
    <Toolbar
      class="wang-toolbar"
      mode="default"
      :editor="editorRef"
      :default-config="toolbarConfig"
    />
    <Editor
      class="wang-editor-main"
      :model-value="modelValue"
      mode="default"
      :default-config="editorConfig"
      @update:model-value="onHtmlInput"
      @on-created="onEditorCreated"
      @on-destroyed="onEditorDestroyed"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { shallowRef, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default:
      '在此编辑 HTML 正文（图片本地上传稍后接入；可先使用外链插图或排版）'
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef(null)

const toolbarConfig = {
  excludeKeys: ['uploadImage', 'uploadVideo']
}

const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  autoFocus: false
}))

function onHtmlInput(html) {
  emit('update:modelValue', html ?? '')
}

function onEditorCreated(editor) {
  editorRef.value = editor
}

function onEditorDestroyed() {
  editorRef.value = null
}
</script>

<style scoped>
.precautions-wang-editor {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}
.wang-toolbar {
  border-bottom: 1px solid var(--el-border-color);
}
.wang-editor-main {
  height: 360px;
}
</style>
