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
    }"
  >
    <template #header>
      <h1>LinkedInB.io</h1>
      <SenpButton class="text-sm" @click="login" v-if="status === 'unauthenticated'"> log in </SenpButton>
      <SenpButton class="text-sm" @click="signOut" v-else-if="status === 'authenticated'"> log out </SenpButton>
    </template>

    <template #content> Link tree sorta thing </template>
  </SenpLayoutBasic>
</template>

<script setup lang="ts">
const { status, signIn, signOut } = useSession()
const login = async () => {
  return await signIn('auth0') // Sign in the user
}
const router = useRouter()
watch(
  () => status.value,
  () => {
    if (status.value === 'authenticated') {
      router.push('/admin')
    }
  },
  { immediate: true }
)
</script>
