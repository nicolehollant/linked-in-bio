<template>
  <div
    :class="{
      [classes?.draggedOver ?? 'drop-zone-active']: draggedOver,
      [classes?.default ?? 'drop-zone-default']: !draggedOver,
      ...$xClass('rounded-2xl overflow-hidden', classes?.wrapper),
    }"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <input type="file" id="assetsFieldHandle" class="sr-only" ref="inputRef" @change="updateInputHandler" />

    <label
      for="assetsFieldHandle"
      :class="
        $xClass(
          'group grid gap-4 rounded-2xl border-2 border-neutral-700 bg-gradient-to-br p-8 transition duration-300 cursor-pointer',
          classes?.dropZone
        )
      "
    >
      <slot name="dropzone" :draggedOver="draggedOver">
        <div class="grid gap-2 text-center">
          <p>Drag and drop to upload</p>
          <p class="text-xs text-neutral-500">or</p>
          <p>
            <span class="text-blue-300 transition duration-200 group-hover:text-blue-400 group-hover:underline"
              >click</span
            >
            to upload your files
          </p>
        </div>
      </slot>
      <slot name="files" :fname="fname" :removeFiles="removeFiles">
        <div class="flex justify-between items-center pt-3" v-if="fname && !hideFiles">
          <p>
            {{ fname }}
          </p>
          <button @click="removeFiles" class="hover:text-orange-400">
            <Icon name="mdi:close"></Icon>
          </button>
        </div>
      </slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { XClass } from 'senp-ui/src/plugins/xClass'
const props = withDefaults(
  defineProps<{
    modelValue?: any
    readAs: 'binary-string' | 'data-url' | 'text' | 'array-buffer' | 'file'
    hideFiles?: boolean
    classes?: {
      wrapper?: XClass
      dropZone?: XClass
      draggedOver?: string
      default?: string
    }
  }>(),
  {
    hideFiles: false,
  }
)
const emit = defineEmits<{
  (event: 'update:modelValue', newValue: any): void
}>()
const inputRef = ref(null)
const fname = ref('')
const draggedOver = ref(false)

const toBase64 = (file: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    const _readAs = {
      'binary-string': () => {
        reader.readAsBinaryString(file)
      },
      'data-url': () => {
        reader.readAsDataURL(file)
      },
      text: () => {
        reader.readAsText(file)
      },
      'array-buffer': () => {
        reader.readAsArrayBuffer(file)
      },
      file: () => {},
    }[props.readAs]()

    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = (error: any) => reject(error)
  })

async function updateInputHandler() {
  if (inputRef.value) {
    const file = (inputRef.value as any).files[0]
    fname.value = file.name
    if (props.readAs === 'file') {
      emit('update:modelValue', file)
    } else {
      const res = await toBase64(file)
      emit('update:modelValue', res)
    }
  }
}

const removeFiles = () => {
  ;(inputRef.value as any).value = ''
  fname.value = ''
  emit('update:modelValue', null)
}

const dragover = (event: any) => {
  event.preventDefault()
  if (!draggedOver.value) {
    draggedOver.value = true
  }
}
const dragleave = (event: any) => {
  draggedOver.value = false
}
const drop = (event: any) => {
  event.preventDefault()
  ;(inputRef.value as any).files = event.dataTransfer.files
  updateInputHandler()
  draggedOver.value = false
}
</script>

<style lang="postcss">
.drop-zone-default {
  @apply bg-gradient-to-br transition duration-300 bg-neutral-900 from-neutral-800;
}
.drop-zone-active {
  @apply bg-gradient-to-br transition duration-300 bg-blue-900 from-neutral-800;
}
</style>
