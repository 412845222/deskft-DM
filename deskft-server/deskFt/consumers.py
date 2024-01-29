import json
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.authtoken.models import Token


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.userinfo_id = self.scope['url_route']['kwargs']['userid']
        print('获取房间路由：')
        print(self.room_name)
        print(self.scope['url_route']['kwargs']['userid'])

        # Join room group
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )

        await self.channel_layer.group_add(
            self.userinfo_id,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group+
        print('断开链接')
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        # message = text_data_json['message']
        token_str = text_data_json['message']['token']

        userinfo = await getUserinfo(token_str)
        message = getResponseData(userinfo, text_data_json)

        if message['code'] == 201:
          
            await self.channel_layer.group_send(
                str(message['data']['to']),
                {
                    'type': 'chat_message1',
                    'message1': message
                }
            )
            return

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message1',
                'message1': message
            }
        )

    async def chat_message1(self, event):

        message = event['message1']

        await self.send(text_data=json.dumps({
            'message': message
        }))


@sync_to_async
def getUserinfo(token):
    user = Token.objects.get(key=token).user
    userinfo = Userinfo.objects.get(belong=user)
    return userinfo


def getResponseData(userinfo, text_data):

    if userinfo.wxHeadImg:
        userinfo.headImg = userinfo.wxHeadImg


    if text_data['code'] == 201:
        resp_data = {
            "code": text_data['code'],
            "id": userinfo.id,
            "nickName": userinfo.nickName,
            "headImg": str(userinfo.headImg),
            "data": text_data['message']['data'],
            "from":userinfo.id
        }
        return resp_data

    resp_data = {
        "code": text_data['code'],
        "id": userinfo.id,
        "nickName": userinfo.nickName,
        "headImg": str(userinfo.headImg),
        "data": text_data['message']['data']
    }
    return resp_data
