<script lang="ts">
  import FilterDropdown from "./FilterDropdown.svelte";
  import FilterSlides from "./FilterSlides.svelte";
</script>

<div class="flex w-[253px] p-[8px_12px_12px_12px] flex-col items-start gap-[15px] rounded-[4px] bg-white">
    <FilterDropdown title="Kleur" options={['Groen', 'Rood', 'Zilver']} />
    <FilterDropdown title="Materiaal" options={['Roestvrij staal','Staal','Siliconen', 'Klittenband']} />
  
    <FilterSlides title="Prijs (€)" min={0} max={100} />
    <FilterSlides title="Lengte (mm)" min={1} max={400} />
</div>