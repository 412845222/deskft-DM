from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import time
import hashlib
import hmac
import random
import json
from hashlib import sha256
from .models import Anchor



game_id = ''
bLiveBaseDir = "https://live-open.biliapi.com"

# Create your views here.
@api_view(['GET'])
def biLiveAuth(request):
    global game_id,example
    res = testPostRequest()
    print(res)
    example = res
    try:
      game_id = json.loads(res)['data']['game_info']['game_id']
    except:
      pass
      
    return Response(res)
  
  

@api_view(['GET','POST'])
def bliveAuth_release(request):
    code = request.POST['code']
    room_id = request.POST['room_id']
    print(code)
    print(room_id)  
    
    anchor = Anchor.objects.get_or_create(code=code,room_id=room_id)[0]
    res_text = testPostRequest(code)
    print(res_text)
    res = json.loads(res_text)
    if res['code'] == 0:
      anchor.lastGameId = res['data']['game_info']['game_id']
      anchor.authBody = res_text
      anchor.save()
      return Response(res_text)
    else:
      return Response(res_text)

  
# https://live-open.biliapi.com/
# http://test-live-open.biliapi.net
def testPostRequest(code):
    postUrl = bLiveBaseDir+"/v2/app/start"
    params = '{"code":"'+code+'","app_id":1670443882126}'
    print(params)
    headerMap = sign(params)
    r = requests.post(url=postUrl, headers=headerMap, data=params, verify=False)
    return r.content.decode()

@api_view(['GET','POST'])
def gameEnd(request):
    code = request.POST['code']
    anchor = Anchor.objects.get(code=code)
    game_id = anchor.lastGameId
  
  
    postUrl = bLiveBaseDir+"/v2/app/end"
    params = '{"app_id":1670443882126,"game_id":"'+game_id+'"}'
    headerMap = sign(params)
    r = requests.post(url=postUrl, headers=headerMap, data=params, verify=False)
    print(r.text)
    return Response(r.text)

@api_view(['GET'])
def tryAgain(request):
    global example
    res = example
    print(res)
    return Response(res)

# 20秒一次循环心跳post
@api_view(['POST'])
def loopHeartbeat(request):
    game_id = request.POST['game_id']
    postUrl = bLiveBaseDir+"/v2/app/heartbeat"
    params = '{"game_id":"'+game_id+'"}'
    headerMap = sign(params)
    r:dict = requests.post(url=postUrl,headers=headerMap, data=params, verify=False)
    print (r.text)
    return Response(r)


@api_view(['GET'])
def getImg(request):
    imgPath = request.GET['imgSrc']
    print(imgPath)
    #下载图片到本地

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    img = requests.get(url=imgPath,headers=headers,verify=True)
    with open('upload/imgs/'+imgPath.split('/')[-1], 'wb') as f:
        f.write(img.content)


    res = {
       'imgSrc': '/upload/imgs/'+imgPath.split('/')[-1],
    }
    return Response(res)






# 签名算法
def sign(params):
  key = '你申请的Blive的key'
  secret = '你申请的Blive的secret'
  
  md5 = hashlib.md5()
  md5.update(params.encode())
  ts = time.time()
  nonce = random.randint(1,1000)+time.time()
  md5data = md5.hexdigest()
  headerMap = {
      "x-bili-timestamp": str(int(ts)),
      "x-bili-signature-method": "HMAC-SHA256",
      "x-bili-signature-nonce": str(nonce),
      "x-bili-accesskeyid": key,
      "x-bili-signature-version": "1.0",
      "x-bili-content-md5": md5data,
  }

  headerList = sorted(headerMap)
  headerStr = ''

  for key in headerList:
      headerStr = headerStr+ key+":"+str(headerMap[key])+"\n"
  headerStr = headerStr.rstrip("\n")
  # print('---params--')
  # print(params)
  # print('---headerStr--')
  # print(headerStr)

  appsecret = secret.encode()
  data = headerStr.encode()
  signature = hmac.new(appsecret, data, digestmod=sha256).hexdigest()
  headerMap["Authorization"] = signature
  headerMap["Content-Type"] = "application/json"
  headerMap["Accept"] = "application/json"

  return headerMap
