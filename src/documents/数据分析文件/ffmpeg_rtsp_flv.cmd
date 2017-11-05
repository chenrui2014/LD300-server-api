'太坑了大华的acc 8khz或16khz 但是flv要求是44100hz 22050hz 11025hz
ffmpeg -rtsp_transport tcp -i  "rtsp://admin:admin@192.168.1.106:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif" -c:a aac -ar 44100 -f flv d:\dhip_demo_ffmpeg_onvif.flv
ffmpeg -rtsp_transport tcp -i  "rtsp://admin:admin@192.168.1.106:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif" -f mp4 d:\dhip_demo_ffmpeg_onvif.mp4
ffmpeg -i "d:/audio_flv.test.aac" -ar 44100 -f flv "d:/audio_flv_onvif_adpcm_44100.test.flv"
ffmpeg -i "d:/audio_flv.test.aac" -c:a aac -ar 44100 -bsf:a aac_adtstoasc -f flv "d:/audio_flv_onvif_aac_44100.test.flv"
ffmpeg -i "d:/audio_flv.test.aac" -c:a aac -bsf:a aac_adtstoasc -f flv "d:/audio_flv_onvif_aac_16000.test.flv"