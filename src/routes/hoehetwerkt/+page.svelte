<script>
  import VideoInformation from "$lib/components/videoInformation.svelte";

  // Example video imports
  import video0 from "$lib/assets/Nepal.mp4";
  import thumbnail0 from "$lib/assets/TempImage0.png";

  import video1 from "$lib/assets/Nepal.mp4";
  import thumbnail1 from "$lib/assets/TempImage0.png";

  import video2 from "$lib/assets/Nepal.mp4";
  import thumbnail2 from "$lib/assets/TempImage0.png";

  import video3 from "$lib/assets/Nepal.mp4";
  import thumbnail3 from "$lib/assets/TempImage0.png";
  import VideoInformationMobile from "$lib/components/videoInformationMobile.svelte";

  // Array of videos
  const videos = [
    {
      title: "Nepal video",
      content: "This video shows beautiful scenery in Nepal. Lorem Ipsum",
      videoUrl: video0,
      thumbnailUrl: thumbnail0
    },
        {
      title: "Nepal video",
      content: "This video shows beautiful scenery in Nepal.",
      videoUrl: video0,
      thumbnailUrl: thumbnail0
    },
        {
      title: "Nepal video",
      content: "This video shows beautiful scenery in Nepal.",
      videoUrl: video0,
      thumbnailUrl: thumbnail0
    },
        {
      title: "Nepal video",
      content: "This video shows beautiful scenery in Nepal.",
      videoUrl: video0,
      thumbnailUrl: thumbnail0
    },
  ];
</script>

<div class="flex px-4 sm:px-8 lg:px-16 justify-center self-stretch w-full">
  <div class="flex flex-col items-center gap-6 flex-[1_0_0] w-full">
    
    <!-- Top message -->
    <div class="flex flex-col items-center">
      <div class="inline-flex p-2 border border-[#B87373] rounded-[5px] bg-[#ECD1D1]">
        <p class="text-center text-[12px] font-normal text-[#5F5F5F] font-heebo">
          Hier vind je uitlegvideo’s en veelgestelde vragen. Staat jouw vraag er niet tussen? Stuur dan een e-mail naar
          <a href="mailto:example@email.com" class="text-[#4D72B6] underline whitespace-nowrap">
            team@SOStag.nl
          </a>.
        </p>
      </div>
    </div>

    <!-- Video section -->
    <div class="flex flex-col gap-4 md:gap-0 w-full md:items-center">
        {#each videos as video, index (index)}
            <div class="hidden md:block">
                <VideoInformation
                    title={video.title}
                    content={video.content}
                    videoUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    position={index}
                />
            </div>

            <div class="block md:hidden">
                <VideoInformationMobile
                    title={video.title}
                    content={video.content}
                    videoUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                />
            </div>
        {/each}
    </div>

    <!-- Divider -->
    <div class="w-full h-px bg-gray-300 my-4"></div>

    <!-- Question and answers -->
    <div class="flex w-[600px] flex-col justify-center items-center gap-4">
      <!-- Questions and answers content goes here -->
    </div>

  </div>
</div>