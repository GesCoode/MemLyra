<script lang="ts">
  export let title: string = "Default Title";
  export let content: string = "Default content goes here...";
  export let videoUrl: string = "";
  export let thumbnailUrl: string = "";
  export let position: number = 0;

  let showModal = false;
</script>

<!-- RED CONTAINER: width adjusts to content -->
<div class="inline-flex items-start gap-1 p-2">

  <!-- Spacer for odd positions -->
  {#if position % 2 === 1}
    <div class="w-[120px] self-stretch"></div>
  {/if}

  <!-- BLUE BOX + CONTENT -->
  <div class="flex max-w-[720px] items-start gap-2 h-[200px]">

    <!-- THUMBNAIL: FIXED SIZE -->
    <div 
      class="flex-none w-[200px] h-[200px] relative cursor-pointer overflow-hidden rounded-[5px] group"
      on:click={() => showModal = true}
    >
      {#if thumbnailUrl}
        <img src={thumbnailUrl} alt={title} class="w-[200px] h-[200px] object-cover"/>
      {/if}

      <!-- PLAY BUTTON -->
      <div class="absolute inset-0 flex items-center justify-center">
        <svg 
          class="w-24 h-24 text-white transition-transform transition-colors duration-200 
                 group-hover:text-red-500 group-hover:scale-125" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>

    <!-- RIGHT CONTENT -->
    <div class="flex flex-col items-start gap-2 h-full">

      <!-- TITLE BOX -->
      <div class="flex w-full justify-center p-1 flex-col items-center gap-3 rounded-[5px] border border-[#DBDBDB] bg-[#fff]">
        <p class="text-center text-[16px] font-semibold text-[#212529] font-heebo">{title}</p>
      </div>

      <!-- CONTENT BOX -->
      <div class="flex p-3 max-w-[302px] h-full flex-col items-start rounded-[5px] border border-[#DBDBDB] bg-[#fff]">
        <div class="h-full text-[14px] font-normal text-[#212529] font-heebo">
          {content}
        </div>
      </div>

    </div>

  </div>

  <!-- Spacer for even positions -->
  {#if position % 2 === 0}
    <div class="w-[120px] self-stretch"></div>
  {/if}

</div>

<!-- VIDEO MODAL -->
{#if showModal}
  <div 
    class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    on:click={() => showModal = false}
  >
    <video 
      src={videoUrl} 
      autoplay 
      controls 
      class="max-w-full max-h-full" 
      on:click|stopPropagation
    ></video>
  </div>
{/if}