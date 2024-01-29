<template>
  <div id="blive-start">
    <div class="header-title">认证身份后可开启玩法</div>
    <div class="dweb-form">
      <div class="dweb-input">
        <div class="label">身份码</div>
        <div class="input">
          <input v-model="idcodeInputValue" type="text" placeholder="请输入身份码" />
          <img @click="clearInput" src="../assets/bliveStart/icons/close2.svg" alt="" />
        </div>
      </div>
      <div class="dweb-tips">
        <div class="icon">
          <img src="../assets/bliveStart/icons/questionMark.svg" alt="" />
        </div>
        <div class="tip-text">在获取推流地址处可获取身份码</div>
        <div class="tip-text right">
          <a href="https://link.bilibili.com/p/center/index#/my-room/start-live" target="_blank">去获取</a>
        </div>
      </div>

      <div class="dweb-submit">
        <button @click="test">开启玩法</button>
        <div class="remeber-idcode">
          <input type="checkbox" />
          <span>记住身份码</span>
        </div>
      </div>

      <!-- <div id="biliLog-bg">
        <img src="../assets/bliveStart/icons/bliblilogoBg.svg" alt="" />
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { windowPostMsg } from "../utils/windowEvent";

export default defineComponent({
  name: "BliveStart",
  props: {
    bliveRoom: {
      type: Object as () => {
        room_id: string;
        code: string;
      },
      default: () => {
        return {
          room_id: "",
          code: "",
        };
      },
    },
  },
  setup(props) {
    const idcode = computed(() => props.bliveRoom.code);
    const idcodeInputValue = ref<string>("");

    watch([idcode], (newV) => {
      console.log("---idcode获取");
      console.log(newV);
      idcodeInputValue.value = newV[0];
    });

    const test = () => {
      console.log(props.bliveRoom);
      console.log("------")
      console.log(idcodeInputValue.value)
      if (!idcodeInputValue.value) {
        alert("请输入身份码");
        return;
      }

      windowPostMsg({
        event: "bliveroom",
        data: JSON.stringify({
          room_id: props.bliveRoom.room_id?props.bliveRoom.room_id:"",
          code: idcodeInputValue.value,
        }),
      });
    };

    const clearInput = () => {
      idcodeInputValue.value = "";
    };

    return {
      test: test,
      idcodeInputValue: idcodeInputValue,
      clearInput: clearInput,
    };
  },
});
</script>

<style scoped>
#blive-start {
  width: 400px;
  height: 250px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 23.07px;
  box-sizing: border-box;
  background-image: url("../assets/bliveStart/icons/bliblilogoBg.svg");
  background-repeat: no-repeat;
  background-position: -10% 150%; 
}
.header-title {
  color: #ff6699;
}
.dweb-form {
  width: 90%;
  height: 35px;
  border: 1px solid #e3e5e7;
  border-radius: 3.5px;
  box-sizing: border-box;
  margin-top: 30px;
}
.dweb-input {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.label {
  width: 20%;
  height: 100%;
  text-align: center;
  font-size: 12px;
  line-height: 35px;
  box-sizing: border-box;
  background-color: #f6f7f8;
}
.input {
  width: 80%;
  height: 100%;
}
.input input {
  width: 80%;
  height: 100%;
  border: none;
  padding: 0;
  /* placeholder颜色 */
  color: #000000;
  padding: 0 10px;
}
.input input::placeholder {
  color: #c9ccd0; /* 你希望的颜色 */
}
.input img {
  margin-left: 10px;
  cursor: pointer;
}
.dweb-tips {
  width: 100%;
  height: 25px;
  display: flex;
  justify-content: start;
  align-items: center;
}
.dweb-tips .icon {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dweb-tips .icon img {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.dweb-tips .tip-text {
  font-size: 12px;
  color: #c9ccd0;
  line-height: 25px;
}
.dweb-tips .tip-text.right {
  margin-left: auto;
  color: #ff6699;
  cursor: pointer;
}
.dweb-tips .tip-text.right a {
  color: inherit; /* 使用父元素的文字颜色 */
  text-decoration: none; /* 去掉下划线 */
  cursor: pointer; /* 鼠标样式，可选 */
}
.dweb-tips .tip-text.right a:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线，可选 */
}
.dweb-submit {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  margin-top: 40px;
}
.dweb-submit button {
  width: 120px;
  height: 30px;
  background-color: #ff6699;
  border: none;
  border-radius: 5px;
  color: #fff;
}
.remeber-idcode {
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 20px;
}

.remeber-idcode input {
  height: 20px;
}
.remeber-idcode span {
  height: 20px;
  font-size: 12px;
  color: #61666d;
}
#biliLog-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: -5%;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
