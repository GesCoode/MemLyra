<script lang="ts">
  import { page } from "$app/state"; // updated import

  let path = page.url.pathname;

  type Segment = { href: string; label: string };

  // split once
  const parts = path.split("/").filter(Boolean);

  // map over parts
  const segments: Segment[] = parts.map((segment, index) => ({
    label: decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + parts.slice(0, index + 1).join("/"),
  }));
</script>

<nav class="flex items-center gap-2 text-sm">
  <a href={"/"} class="text-accent text-base hover:underline">Home</a>

  {#each segments as crumb, i}
    <span class="text-gray-400 text-base">/</span>

    {#if i === segments.length - 1}
      <span class="font-medium text-paragraph text-base">{crumb.label}</span>
    {:else}
      <a href={crumb.href} class="text-accent text-base hover:underline"
        >{crumb.label}</a
      >
    {/if}
  {/each}
</nav>
