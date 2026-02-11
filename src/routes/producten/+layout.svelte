<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  let { children } = $props();
</script>

<div class="px-4 md:px-8 lg:px-16 py-12">
  <Breadcrumb></Breadcrumb>
</div>
{@render children()}
