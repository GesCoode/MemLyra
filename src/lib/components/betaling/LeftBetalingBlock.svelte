<script lang="ts">
    import SimpleButton from "$lib/components/form/SimpleButton.svelte";
    import DropdownButton from "../form/DropdownButton.svelte";
    import BlinkingButton from "./BlinkingButton.svelte";

    function SetAbo(id: string) {
        verlengen = id;
    }

    export let verlengen: string = "none";
    export let handleVerlengen: () => void = () => {};
</script>

<div class="flex h-full flex-1 justify-center items-center bg-[#0C3966]">
    <div class="flex flex-col items-center gap-12 w-full max-w-4xl px-12">
        <!-- Header -->
        <div class="text-white font-spaceGrotesk text-[20px] font-bold">
            Mijn abonnement
        </div>

        <!-- Grid Abonnement informatie -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-center">
            <!-- Startdatum -->
            <div class="flex flex-col items-center gap-2">
                <div class="text-white font-spaceGrotesk text-[14px] font-medium">
                    Startdatum
                </div>
                <div class="text-white font-spaceGrotesk text-[16px] font-bold tracking">
                    01-01-2026
                </div>
            </div>

            <!-- Einddatum -->
            <div class="flex flex-col items-center gap-2">
                <div class="text-white font-spaceGrotesk text-[14px] font-medium">
                    Einddatum
                </div>
                <div class="text-white font-spaceGrotesk text-[16px] font-bold tracking">
                    01-01-2027
                </div>
            </div>

            <!-- Dagen resterend -->
            <div class="flex flex-col items-center gap-2">
                <div class="text-white font-spaceGrotesk text-[14px] font-medium">
                    Dagen resterend
                </div>
                <div class="text-white font-spaceGrotesk text-[16px] font-bold tracking">
                    362
                </div>
            </div>

            <!-- Soort abonnement -->
            <!-- <div class="flex flex-col items-center gap-2">
                <div class="text-white font-spaceGrotesk text-[14px] font-medium">
                    Soort abonnement
                </div>
                <div class="text-white font-spaceGrotesk text-[16px] font-bold tracking">
                    1 Jaar
                </div>
            </div> -->
        </div>

        <!-- Verlengen -->
        <div class="flex flex-col gap-2 items-center">
            <div class="text-white font-spaceGrotesk text-[20px] font-bold">
                Verlengen
            </div>

            <DropdownButton
                label="Selecteer duur"
                buttonBg="#FFF"
                buttonText="#0C3966"
                dropdownBg="#FFF"
                dropdownBorder="#D1D5DB"
                items={[
                    { label: "1 jaar", onClick: () => SetAbo("1") },
                    { label: "2 jaar", onClick: () => SetAbo("2") },
                    { label: "3 jaar", onClick: () => SetAbo("3") },
                ]}
            />

            <BlinkingButton
                text="Verleng mijn abonnement"
                bgColor="#FFF"
                textColor="#0C3966"
                activated={verlengen !== "none"}
                onClick={handleVerlengen}
            />
        </div>
    </div>
</div>