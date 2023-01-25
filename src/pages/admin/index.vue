<template>
  <SenpLayoutBasic
    fixed-header
    :classes="{
      header: {
        extend: 'text-2xl bg-neutral-900/60 backdrop-blur',
      },
      footer: {
        extend: 'hidden',
      },
      content: {
        extend: `lg:!grid lg:grid-rows-1 lg:grid-cols-[minmax(0,1fr),auto] !p-0 h-full !overflow-hidden lg:[&_.editor]:flex lg:[&_.preview]:flex ${
          mode === 'edit' ? '[&_.editor]:flex [&_.preview]:hidden' : '[&_.editor]:hidden [&_.preview]:flex'
        }`,
      },
    }"
  >
    <template #header>
      <h1>LinkedInB.io</h1>
      <AccountButton></AccountButton>
    </template>

    <template #content>
      <button
        class="z-30 lg:hidden fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-neutral-700 p-4 rounded-full text-xl shadow-2xl"
        @click="() => (mode = mode === 'edit' ? 'preview' : 'edit')"
      >
        {{ mode === 'edit' ? 'preview' : 'edit' }}
      </button>
      <section class="flex flex-col gap-8 p-4 overflow-auto editor" v-auto-animate>
        <!-- <pre><code>{{myAccount}}</code></pre> -->
        <div class="flex flex-col gap-4">
          <HeadlessDisclosure as="div" v-slot="{ open, close }" class="w-full" v-auto-animate>
            <HeadlessDisclosureButton class="w-full" v-if="!open">
              <div class="w-full bg-blue-900 hover:bg-blue-800 transition p-8 rounded-full font-bold">
                <Icon name="mdi:plus"></Icon>Add Link
              </div>
            </HeadlessDisclosureButton>
            <HeadlessDisclosurePanel class="w-full px-8 pb-8 bg-neutral-800 rounded-2xl flex flex-col gap-4">
              <div class="py-8 px-8 -mx-8 flex items-center justify-between border-b border-neutral-700">
                <p>Add URL</p>
                <HeadlessDisclosureButton><Icon name="mdi:close"></Icon></HeadlessDisclosureButton>
              </div>
              <SenpTextInput label="Title" v-model="newLink.title"></SenpTextInput>
              <SenpTextInput label="URL" v-model="newLink.url"></SenpTextInput>
              <SenpButton
                @click="
                  () => {
                    addLink()
                    close()
                  }
                "
                ><Icon name="mdi:plus"></Icon>Add Link
              </SenpButton>
            </HeadlessDisclosurePanel>
          </HeadlessDisclosure>
          <HeadlessDisclosure as="div" v-slot="{ open, close }" class="w-full" v-auto-animate>
            <HeadlessDisclosureButton class="w-full" v-if="!open">
              <div class="w-full bg-neutral-900 hover:bg-neutral-800 transition p-4 rounded-full font-bold">
                <Icon name="mdi:plus"></Icon>Add Header
              </div>
            </HeadlessDisclosureButton>
            <HeadlessDisclosurePanel class="w-full px-8 pb-8 bg-neutral-800 rounded-2xl flex flex-col gap-4">
              <div class="py-8 px-8 -mx-8 flex items-center justify-between border-b border-neutral-700">
                <p>Add Header</p>
                <HeadlessDisclosureButton><Icon name="mdi:close"></Icon></HeadlessDisclosureButton>
              </div>
              <SenpTextInput label="Title" v-model="newLink.title"></SenpTextInput>
              <div class="flex items-center gap-4">
                <SenpButton
                  @click="
                    () => {
                      addHeader()
                      close()
                    }
                  "
                  ><Icon name="mdi:plus"></Icon>Add Header
                </SenpButton>
              </div>
            </HeadlessDisclosurePanel>
          </HeadlessDisclosure>
        </div>
        <SenpDraggableList
          group="cards"
          item-key="id"
          v-model="links"
          class="flex flex-col gap-2 overflow-auto h-full pb-64"
          :classes="{ elementWrapper: { base: 'w-full' } }"
          handle=".handle"
          v-auto-animate
        >
          <template #item="{ element, index, drag }">
            <li
              v-if="links[index].type === 'link'"
              :class="{ dragging: drag }"
              class="grid grid-cols-[auto,minmax(0,1fr)] pl-1 pr-4 py-4 rounded-2xl bg-neutral-800 w-full h-max gap-3 overflow-hidden cursor-auto active:cursor-grabbing"
              :key="element.id"
            >
              <div class="handle flex items-center cursor-grab active:cursor-grabbing">
                <Icon class="text-3xl text" name="mdi:drag-vertical"></Icon>
              </div>
              <div class="flex flex-col gap-2">
                <SenpTextInput
                  placeholder="Title"
                  v-model="links[index].title"
                  :classes="{
                    wrapper: { base: 'flex items-center gap-2 group' },
                    input: {
                      extend: '!border-none text-lg !font-semibold !px-2 !py-0 ',
                    },
                  }"
                >
                  <template #hint>
                    <Icon
                      class="opacity-100 group-focus-within:opacity-0 transition cursor-pointer group-focus-within:cursor-auto"
                      name="mdi:pencil"
                    ></Icon>
                  </template>
                </SenpTextInput>
                <SenpTextInput
                  placeholder="URL"
                  v-model="(links[index] as any).url"
                  :classes="{
                    wrapper: { base: 'flex items-center gap-2 group' },
                    input: { extend: '!border-none !px-2 !py-0 ' },
                  }"
                >
                  <template #hint>
                    <Icon
                      class="opacity-100 group-focus-within:opacity-0 transition cursor-pointer group-focus-within:cursor-auto"
                      name="mdi:pencil"
                    ></Icon>
                  </template>
                </SenpTextInput>
                <div class="flex pt-4 gap-4 items-center">
                  <SenpButton
                    v-if="!(links[index] as any).image && !(links[index] as any).icon"
                    @click="
                      () => {
                        imageMode = 'image'
                        modals.image = true
                        activeLinkIndex = index
                      }
                    "
                    ><Icon name="mdi:image"></Icon>Add Image
                  </SenpButton>
                  <SenpButton
                    class="!bg-red-700 hover:!bg-red-800"
                    v-else
                    @click="
                      () => {
                        (links[index] as any).image = undefined as any
                        (links[index] as any).icon = undefined
                      }
                    "
                    ><Icon name="mdi:image"></Icon>Remove Image
                  </SenpButton>
                  <SenpButton
                    class="!bg-transparent !text-neutral-400 hover:!text-red-500 ml-auto"
                    @click="
                      () => {
                        links.splice(index, 1)
                      }
                    "
                    >Remove<Icon name="mdi:trash-can"></Icon>
                  </SenpButton>
                </div>
              </div>
            </li>
            <li
              v-else
              :class="{ dragging: drag }"
              class="grid grid-cols-[auto,minmax(0,1fr)] pl-1 pr-4 py-4 rounded-2xl bg-neutral-800 w-full h-max gap-3 overflow-hidden cursor-auto active:cursor-grabbing"
              :key="'header-' + element.id"
            >
              <div class="handle flex items-center cursor-grab active:cursor-grabbing">
                <Icon class="text-3xl text" name="mdi:drag-vertical"></Icon>
              </div>
              <div class="flex gap-4">
                <SenpTextInput
                  placeholder="Title"
                  v-model="links[index].title"
                  :classes="{
                    wrapper: { base: 'flex items-center gap-2 group w-full' },
                    input: {
                      extend: '!border-none text-lg !font-semibold !px-2 !py-0 ',
                    },
                  }"
                >
                  <template #hint>
                    <Icon
                      class="opacity-100 group-focus-within:opacity-0 transition cursor-pointer group-focus-within:cursor-auto"
                      name="mdi:pencil"
                    ></Icon>
                  </template>
                </SenpTextInput>
                <SenpButton
                  class="!bg-transparent !text-neutral-400 hover:!text-red-500 ml-auto"
                  @click="
                    () => {
                      links.splice(index, 1)
                    }
                  "
                  >Remove<Icon name="mdi:trash-can"></Icon>
                </SenpButton>
              </div>
            </li>
          </template>
        </SenpDraggableList>
      </section>
      <div
        class="lg:border-l border-neutral-800 px-4 lg:px-24 flex items-center w-full py-6 lg:py-4 justify-center lg:w-max overflow-auto preview"
      >
        <div class="lg:rounded-3xl lg:border-8 overflow-auto border-black w-full h-full lg:h-auto">
          <div
            class="w-full h-full lg:w-[320px] lg:h-[690px] lg:bg-neutral-900 flex flex-col items-center gap-4 p-4"
            v-auto-animate
          >
            <div class="flex flex-col items-center">
              <figure class="h-24 w-24 rounded-full bg-neutral-800">
                <img
                  class="h-full w-full rounded-full"
                  :src="myAccount.data.value?.avatar"
                  alt=""
                  v-if="myAccount.data.value?.avatar"
                />
                <div
                  class="h-full w-full rounded-full uppercase flex items-center justify-center text-lg font-semibold"
                  v-else-if="myAccount.data.value?.username?.charAt?.(0)"
                >
                  {{ myAccount.data.value.username.charAt(0) }}
                </div>
                <div class="h-full w-full rounded-full flex items-center justify-center" v-else>
                  <Icon name="mdi:account" />
                </div>
              </figure>
              <p class="mt-4 text-xl font-bold" v-if="myAccount.data.value?.name ?? myAccount.data.value?.username">
                {{ myAccount.data.value?.name ?? myAccount.data.value?.username }}
              </p>
              <p class="mt-2 text-sm text-neutral-400" v-if="myAccount.data.value?.bio">
                {{ myAccount.data.value?.bio }}
              </p>
            </div>
            <template v-for="link in links" :key="link.id">
              <a
                v-if="link.type === 'link'"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full bg-neutral-700 p-4 rounded-xl font-bold text-center flex gap-2 items-center justify-between h-max hover:bg-neutral-800 transition hover:text-blue-200"
              >
                <div class="w-12 h-12 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                  <img :src="link.image" alt="Thumbnail" class="w-full h-full object-cover" v-if="link.image" />
                  <Icon :name="link.icon" class="text-[24px]" v-else-if="link.icon"></Icon>
                </div>
                <p class="flex-1">
                  {{ link.title || link.url }}
                </p>
                <div class="w-12 shrink-0"></div>
              </a>
              <div
                v-else
                class="w-full px-4 pb-4 mt-6 font-bold text-center flex gap-2 items-center justify-center h-max"
              >
                {{ link.title }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <SenpDrawer
        v-model:open="modals.image"
        title="Add Image"
        side="left"
        :classes="{
          maxSize: { base: 'w-full max-h-full max-w-[90vw] md:max-w-3xl h-full' },
        }"
      >
        <div v-if="activeLinkIndex != null">
          <SenpTab
            :options="['image', 'icon']"
            v-model="imageMode"
            chips
            :classes="{ optionsWrapper: { extend: 'mb-4' } }"
          ></SenpTab>
          <ImagePicker
            v-if="imageMode === 'image'"
            @update:image="src => {
            (links[activeLinkIndex!] as any).image = src ?? undefined;
            modals.image = false
          }"
          ></ImagePicker>
          <IconPicker
            @update:icon="icon => {
            (links[activeLinkIndex!] as any).icon = icon;
            modals.image = false
          }"
            v-else
          ></IconPicker>
        </div>
      </SenpDrawer>
    </template>
  </SenpLayoutBasic>
</template>

<script setup lang="ts">
import pkg from 'lodash'
const { debounce } = pkg

/*
## Features
- customizable profiles under LinkedInB.io/username

- ability to set profile to redirect to another site

- add N links to profile
  - url
  - image (b64?)
  - some common icons
  - bold / normal
  - color

- customize your profile under LinkedInB.io/admin
*/
type LinkedInBioLink =
  | {
      id: string
      url: string
      title: string
      image?: string
      icon?: string // some supported icons
      fontStyle: 'normal' | 'bold'
      fontColor: string
      backgroundColor: string
      type: 'link'
    }
  | {
      type: 'header'
      id: string
      title: string
      fontStyle: 'normal' | 'bold'
      fontColor: string
      backgroundColor: string
    }
definePageMeta({
  middleware: ['auth'],
})
const { status, signIn, signOut, data } = useSession()
const imageMode = ref<'icon' | 'image'>('image')
const login = async () => {
  return await signIn('auth0') // Sign in the user
}
const tryParseUrl = (urlString: string) => {
  let url
  try {
    try {
      url = new URL(urlString)
      console.log(url)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.href
      }
      throw new Error('invalid url')
    } catch (error) {
      url = new URL('http://' + urlString)
      console.log(url)
      if (Boolean(url)) {
        return url.href
      }
      throw new Error('invalid url')
    }
  } catch (e) {
    throw new Error('invalid url')
  }
}
const mode = ref<'edit' | 'preview'>('edit')
const activeLinkIndex = ref<number | null>(null)
const modals = reactive({
  newLink: false,
  image: false,
})
const newLink = reactive({
  url: '',
  title: '',
})
const addLink = () => {
  try {
    if (!newLink.url || !tryParseUrl(newLink.url)) {
      return
    }
    links.value.push({
      backgroundColor: '#262626',
      fontColor: '#f5f5f4',
      fontStyle: 'normal',
      id: links.value.length + 1 + '',
      url: tryParseUrl(newLink.url),
      title: newLink.title,
      type: 'link',
    })
    newLink.url = ''
  } catch (error) {
    console.log(error)
  }
}
const addHeader = () => {
  try {
    links.value.push({
      backgroundColor: '#262626',
      fontColor: '#f5f5f4',
      fontStyle: 'normal',
      id: links.value.length + 1 + '',
      title: newLink.title,
      type: 'header',
    })
    newLink.url = ''
  } catch (error) {
    console.log(error)
  }
}

const links = ref<LinkedInBioLink[]>([])
const { $client } = useNuxtApp()
const whoami = await $client.whoami.useQuery()
const myAccount = await $client.getProfile.useQuery(data.value?.user?.email ?? '')
const updateProfile = () =>
  $client.createProfile.mutate({
    links: links.value,
  })
const updateProfileDebounced = debounce(updateProfile, 4000)

watch(
  links,
  () => {
    updateProfileDebounced()
  },
  {
    deep: true,
  }
)

watch(
  () => myAccount.data.value,
  () => {
    if (myAccount.data.value) {
      links.value = myAccount.data.value.links as any
    }
  }
)

onMounted(() => {
  if (myAccount.data.value) {
    links.value = myAccount.data.value.links as any
  }
})
</script>
