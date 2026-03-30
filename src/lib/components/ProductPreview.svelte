<script>
    import productStub from "$lib/assets/productStub.png";
    import customButton from "./form/CustomButton.svelte";


    function voegToe() {
    console.log("Toegevoegd");
  }
</script>

<div class="flex flex-col items-start self-stretch justify-self-stretch row-span-1 col-span-1 rounded bg-white">
  <div class="flex justify-center items-center self-stretch rounded-sm bg-[#CCE0F5] w-full aspect-[321/170]">
    <img src={productStub} alt="Product" class="object-cover w-full h-full" />
  </div>
  <div class="flex flex-col py-[10px] px-[14px] justify-end items-start gap-4 self-stretch">
    <p class="text-[16px] font-bold tracking-[-0.16px] text-[var(--heading,#212529)] font-['Open_Sans']">
      Armband RVS kruislock 
    </p>
    <div class="flex justify-between items-end self-stretch">
      <div class="flex flex-col items-start">
        <div class="flex justify-center items-center gap-2">
          <p class="text-[16px] font-normal tracking-[-0.16px] line-through text-[#3F4347] font-['Open_Sans']">
            29.95
          </p>
          <div class="flex p-[3px] justify-center items-center gap-2 rounded-sm bg-[#CCE0F5]">
            <p class="text-[14px] font-normal tracking-[-0.14px] text-[var(--accent,#0C3966)] font-['Open_Sans']">
              -10%
            </p>
          </div>
        </div>
        <p class="text-[24px] font-normal tracking-[-0.456px] capitalize text-[var(--heading,#212529)] font-['Spline_Sans']">
          18.95
        </p>
      </div>
      <div class="flex items-center gap-[9px] rounded-sm bg-[var(--accent,#0C3966)]">
        <customButton
          text="Voeg toe"
          rounded={true}
          bgColor="rgba(255, 255, 255, 0.1)"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={1}
          class=""
          on:click={voegToe}/>
      </div>
    </div>
  </div>
</div>