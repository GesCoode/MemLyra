<script lang="ts">
  import SignupFlow from '$lib/components/signup/SignupFlow.svelte';
  import { APP_NAME, APP_TAGLINE } from '$lib/app';
</script>

<svelte:head>
  <title>{APP_NAME} — {APP_TAGLINE}</title>
  <meta
    name="description"
    content="Pick your favorite kinds of cute — babies, ducklings, cozy buildings, and more — and get one adorable picture in your inbox every day."
  />
</svelte:head>

<SignupFlow />
