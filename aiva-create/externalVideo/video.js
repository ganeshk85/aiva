//
// var tagVimeo = document.createElement('script');
// tagVimeo.id = 'vimeoAPI';
// tagVimeo.src = 'https://player.vimeo.com/api/player.js';
// var scriptTag = document.getElementsByTagName('script')[0];
// scriptTag.parentNode.insertBefore(tagVimeo, scriptTag);

var tag = document.createElement('script');
tag.id = 'youtubeAPI';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



var videoDataJSON = {
    "youtubeVideos": [{
        "videoId": "_Nz7aasD2tk",
        "height": '390',
        "width": '640',
        "autoplay": 0,
        "isMuted": 1,
        "loop": 0
    },
        {
            "videoId": "_Nz7aasD2tk",
            "height": '390',
            "width": '640',
            "autoplay": 1,
            "isMuted": 1,
            "loop": 0
        },
        {
            "videoId": "_Nz7aasD2tk",
            "height": '390',
            "width": '640',
            "autoplay": 0,
            "isMuted": 0,
            "loop": 0
        },
        {
            "videoId": "_Nz7aasD2tk",
            "height": '390',
            "width": '640',
            "autoplay": 1,
            "isMuted": 0,
            "loop": 1
        }

    ],
    "vimeoVideos": [
        {
            id: 5298524,
            width: 640,
            height: 390,
            autoplay: true,
            loop: true,
            isMuted: false
        },
        {
            id: 5298524,
            width: 640,
            height: 390,
            autoplay: false,
            loop: true,
            isMuted: true
        }
    ]
};

var div, body = document.getElementsByTagName('body')[0];
for (var i = 0; i < videoDataJSON.youtubeVideos.length; i++) {
    div = document.createElement('div');
    div.id = 'playerYT-' + i;
    body.appendChild(div);
}
for (var i = 0; i < videoDataJSON.vimeoVideos.length; i++) {
    div = document.createElement('div');
    div.id = 'playerVimeo-' + i;
    body.appendChild(div);
}


var playersYT = [], playersVimeo = [];
function onYouTubeIframeAPIReady() {
    for (var i = 0; i < videoDataJSON.youtubeVideos.length; i++) {
        playersYT.push(new YT.Player('playerYT-' + i, {
            height: videoDataJSON.youtubeVideos[i].height,
            width: videoDataJSON.youtubeVideos[i].width,
            videoId: videoDataJSON.youtubeVideos[i].videoId,
            playerVars: {
                'autoplay': videoDataJSON.youtubeVideos[i].autoplay,
                'loop': videoDataJSON.youtubeVideos[i].loop
            },
            events: {
                'onReady': (function (i, playersYT) {
                    return function () {
                        if (videoDataJSON.youtubeVideos[i].isMuted) {
                            playersYT[i].mute();
                        }
                    }
                })(i, playersYT)
            }
        }));
    }
}
for (var n = 0; n < videoDataJSON.vimeoVideos.length; n++) {
    playersVimeo.push(new Vimeo.Player('playerVimeo-' + [n], {
        id: videoDataJSON.vimeoVideos[n].id,
        width: videoDataJSON.vimeoVideos[n].width,
        height: videoDataJSON.vimeoVideos[n].height,
        loop: videoDataJSON.vimeoVideos[n].loop,
        autoplay: videoDataJSON.vimeoVideos[n].autoplay

    }));
    playersVimeo[n].on("loaded", (function (n) {
        return function (data) {
            if (videoDataJSON.vimeoVideos[n].isMuted){
                data.setVolume(0);
            }
        }
    })(n));
}









