<template>
  <div class="bg-neutral-900 h-full w-full p-4 lg:p-16">
    <div class="flex flex-col items-center w-full gap-4 max-w-3xl mx-auto">
      <figure class="h-24 w-24 rounded-full bg-neutral-800">
        <img
          class="h-full w-full rounded-full"
          :src="account.data.value?.avatar"
          alt=""
          v-if="account.data.value?.avatar"
        />
        <div
          class="h-full w-full rounded-full uppercase flex items-center justify-center text-lg font-semibold"
          v-else-if="account.data.value?.username?.charAt?.(0)"
        >
          {{ account.data.value.username.charAt(0) }}
        </div>
        <div class="h-full w-full rounded-full flex items-center justify-center" v-else>
          <Icon name="mdi:account" />
        </div>
      </figure>
      <p class="text-xl font-bold" v-if="account.data.value?.name ?? account.data.value?.username">
        {{ account.data.value?.name ?? account.data.value?.username }}
      </p>
      <p class="text-lg" v-if="account.data.value?.bio">
        {{ account.data.value?.bio }}
      </p>

      <template v-for="link in account.data.value?.links" :key="link.id">
        <a
          v-if="link.type === 'link'"
          :href="link.url + ''"
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
        <div v-else class="w-full px-4 pb-4 mt-8 font-bold text-center flex gap-2 items-center justify-center h-max">
          {{ link.title }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const route = useRoute()
const account = await $client.getProfile.useQuery(route.params.profile + '')
const url = process.dev ? 'http://localhost:3000' : 'https://linkedinb.io'

useCustomHead(
  computed(() => account.data.value?.username ?? 'LinkedInB.io'),
  computed(() => account.data.value?.bio ?? ''),
  computed(() => `${url}/og/${route.params.profile}`)
)
</script>

<style scoped></style>
