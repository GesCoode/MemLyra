<script lang="ts">
  import { slide } from "svelte/transition";

  export let title: string = "Default Title";
  export let videoUrl: string = "";
  export let thumbnailUrl: string = "";
  export let content: string = "";

  import arrowDown from "$lib/assets/ArrowDown.svg";

  let showModal = false;
  let showText = false;
</script>

<!-- Parent container -->
<div class="flex flex-col w-full">

  <!-- Original box -->
  <div class="flex items-center w-full h-full bg-[#fff] rounded-[5px] p-2">
    
    <!-- Video thumbnail -->
    <div 
      class="relative w-[100px] h-[100px] cursor-pointer overflow-hidden rounded-[5px] group"
      on:click={() => showModal = true}
    >
      {#if thumbnailUrl}
        <img src={thumbnailUrl} alt={title} class="w-full h-full object-cover"/>
      {/if}

      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <svg 
          class="w-16 h-16 text-white transition-transform transition-colors duration-200 
                 group-hover:text-red-500 group-hover:scale-125" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>

    <!-- Title box -->
    <div class="flex flex-col justify-between p-2 flex-[1_0_0] self-stretch">
      
      <!-- Title at top -->
      <p class="flex flex-col justify-center flex-[1_0_0] self-stretch text-center text-[#212529] font-heebo text-[16px] font-semibold leading-normal">
        {title}
      </p>

      <!-- Lees meer at bottom -->
      <div 
        class="flex flex-row h-[20px] justify-center items-center gap-2 cursor-pointer"
        on:click={() => showText = !showText}
      >
        <p class="text-center text-[#8F8F8F] font-heebo text-[16px] font-semibold leading-normal">
          Lees meer
        </p>
        <img 
          src={arrowDown} 
          alt="arrowDown" 
          class="w-3 h-3 mt-1 transition-transform duration-300"
          class:rotate-180={showText} 
        />        
      </div>

    </div>
  </div>

  <!-- Unfolding box outside original container with slide animation -->
  {#if showText}
    <div 
      class="mt-2 p-4 bg-gray-100 rounded-[5px] text-[#212529] text-[14px] font-heebo shadow-md"
      transition:slide={{ duration: 300 }}
    >
      {content}
    </div>
  {/if}

</div>

<!-- Fullscreen modal -->
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