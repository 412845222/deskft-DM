<template>
  <div id="dweb-game">
    <CocosView></CocosView>
    <BliveStart v-show="BliveStartShow" :bliveRoom="bliveRoom"></BliveStart>
  </div>
</template>

<script lang="ts">
import BliveStart from "./components/BliveStart.vue";
import CocosView from "./components/CocosView.vue";
import { windowAddEvent, windowPostMsg } from "./utils/windowEvent";
import { defineComponent, onMounted, ref } from "vue";
export default defineComponent({
  name: "App",
  components: {
    CocosView: CocosView,
    BliveStart:BliveStart
  },
  setup() {
    const BliveStartShow = ref<boolean>(false);
    //@ts-ignore
    const ipc = window.BLiveRoom;
    const bliveRoom = ref<{
      room_id:string,
      code:string
    }>()

    onMounted(() => {
      console.log("================vue3 page init ================");
      getBLiveRoomInfo();
      windowAddEvent(windowCallback);
    });

    const windowCallback = (msg:any) => {
      console.log("----windowCallback----"+msg);
      if (msg.event == 'blive-start') {
        BliveStartShow.value = true;
      }
      if (msg.event == 'code-saved') {
        BliveStartShow.value = false;
        windowPostMsg({
          event: "start-conect",
        })
      }
    };

    const getBLiveRoomInfo = () => {
      let msg = {
        event: "bliveroom",
      };
      ipc.onec("bliveroom", (data: any) => {
        console.log("----bliveroom----");
        console.log(data);
        bliveRoom.value = data;
      });
      ipc.send(msg);
    };

    

    return {
      bliveRoom:bliveRoom,
      BliveStartShow:BliveStartShow
    };
  },
});
</script>

<style scoped>
#dweb-game {
  width: 100vw;
  height: 100vh;
}
</style>
