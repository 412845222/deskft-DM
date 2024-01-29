<template>
  <!-- http://localhost:7456/ -->
  <!-- /public/cocosFrame/index.html -->
  <iframe
    ref="cocosFrame"
    id="cocospreview"
    src="./web-mobile/index.html"
    frameborder="0"
    :style="{
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      bottom: 0,
    }"
  ></iframe>
</template>

<script lang="ts">
export default {
  name: "CocosPreviewer",
};
</script>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const props = defineProps(["width", "height"]);
const cocosFrame = ref<Element>();
const width = ref();
const height = ref();

onMounted(() => {
  if (props.width && props.height) {
    width.value = props.width;
    height.value = props.height;
  } else {
    // console.log("---无长度");
    // console.log(cocosFrame.value!.parentElement!.clientHeight);
    width.value = cocosFrame.value!.parentElement!.clientWidth + "px";
    height.value = cocosFrame.value!.parentElement!.clientHeight + "px";
  }
});
</script>
