<script lang="ts">
  import background from "$lib/assets/background.png";
  import FieldBuilder from "$lib/components/FieldBuilder/FieldBuilder.svelte";
  import CustomButton from "$lib/components/form/CustomButton.svelte";
  import InputField from "$lib/components/FieldBuilder/InputField.svelte";

  let code = "";

  function handle2fa() {
    console.log(`Handle 2FA: ${code}`);
  }

  function cancel() {
    console.log("Cancel");
  }
</script>

<div
  id="wrapper"
  class="flex justify-center items-center h-[648px] px-4 md:px-8 xl:px-16"
>
  <img
    src={background}
    alt=""
    aria-hidden="true"
    class="absolute w-screen h-full object-cover -z-1"
  />

  <div id="fieldWrapper" class="w-88">
    <FieldBuilder title="Twee factor authenticatie">
      <InputField
        label="Voer uw eenmalige wachtwoord in"
        bind:value={code}
        placeholder="Eenmalig wachtwoord"
      ></InputField>

      <div class="flex flex-col gap-4">
        <CustomButton
          text="Volgende"
          rounded={true}
          bgColor="#0C3966"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={0}
          on:click={handle2fa}
        />

        <CustomButton
          text="Annuleer"
          rounded={true}
          bgColor="#FFF"
          textColor="#0C3966"
          outlineColor="#0C3966"
          outlineWidth={1}
          on:click={cancel}
        />
      </div>
    </FieldBuilder>
  </div>
</div>
