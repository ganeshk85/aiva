angular.module('builder').factory('aivaElementConfig', function ($rootScope) {

    var configs = [
        {

            name: 'emoji',
            lockScaling: true,
            template: '<img data-name="emoji" src="{0}" data-id="{1}" class="aiva-elem {1} {2}"/>',
            draggable: true
        },
        {
            name: 'button',
            lockScaling: false,
            template: '<button type="button" data-name="button" data-id="{0}"' +
            ' class="aiva-elem btn {0} {1}">Button</button>',
            draggable: true
        },
        {
            name: 'shape',
            lockScaling: false,
            template: '<div class="aiva-elem shape {0} {1}" data-id="{1}" data-name="shape"></div>',
            draggable: true
        },
        {

            name: 'image',
            lockScaling: false,
            template: '<img src="{0}" class="aiva-elem {1}" data-name="image" data-id="{1}">',
            draggable: true
        },
        {
            name: 'video',
            lockScaling: false,
            template: '<div id="{0}" data-video-id="{9}" class="aiva-elem {1} ' +
            'video-container" data-id="{1}" data-name="video"' +
            'data-loop="{8}" data-muted="{6}" data-autoplay="{5}" ' +
            'data-video-type="{7}" data-video-height="300" data-video-width="450"' +
            'data-video-start-time="{10}" data-video-end-time="{11}" data-video-duration="{12}" >' +
            '<iframe id="{1}" data-video-autoplay="{5}" showinfo="0"  ' +
            'style="width: 100%; height: 100%; display: {2}" frameborder="0"' +
            ' allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen"' +
            ' msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen"' +
            ' webkitallowfullscreen="webkitallowfullscreen" data-name="video" src="{0}"></iframe>' +
            '<video style="width: 100%; height: 100%; display: {4}" controls {5} {6}>' +
            '<source src="{3}" type="video/mp4"></video>' +
            '</div>',
            draggable: true
        },
        {
            name: 'textBox',
            lockScaling: false,
            template: '<div class="aiva-elem textBox {0}" data-name="textBox" data-id="{0}"></div>',
            draggable: true
        },
        {
            name: 'link',
            lockScaling: false,
            template: '<a class="aiva-elem link" data-name="link" data-id="{0}"><a/>',
            draggable: true
        },
        {
            name: 'textInput',
            lockScaling: false,
            template: '<input type="text" class="aiva-elem {0} {1}" data-name="textInput" ' +
            'data-id="{0}" placeholder="text" readonly onkeypress="return event.keyCode != 13;">',
            draggable: true
        },
        {
            name: 'emailInput',
            lockScaling: false,
            template: '<input type="email" class="aiva-elem {0} {1}" data-name="emailInput" ' +
            'data-id="{0}" placeholder="Email" readonly onkeypress="return event.keyCode != 13;">',
            draggable: true
        },
        {
            name: 'passwordInput',
            lockScaling: false,
            template: '<input type="password" class="aiva-elem {0} {1}" data-name="passwordInput" ' +
            'data-id="{0}" placeholder="Password" readonly onkeypress="return event.keyCode != 13;">',
            draggable: true
        },
        {
            name: 'aivaForm',
            lockScaling: false,
            template: '<form action="{0}" data-name="aivaForm"></form>',
            draggable: false
        },
        {
            name: 'multiSelectBox',
            lockScaling: false,
            template: '<div class="multiSelectBox"></div>'
        },
        {
            name: 'icon',
            lockScaling: true,
            template: '' +
            '<div class="aiva-elem {1} {2} icon" data-name="icon" data-id="{1}" >' +
            '<i class="fa fa-{0}" data-name="icon" style="background-color: inherit;"></i></div>',
            draggable: true
        },
        {
            name: 'facebook-button',
            lockScaling: false,
            template: '<div class="aiva-elem social-elm {0}" data-name="facebook-button" data-id="{0}"><iframe class="social-elm" src="https://www.facebook.com/plugins/like.php?href={1}&width={5}&layout={3}&action=like&size=small&show_faces={4}&share={2}&height={6}" width="{5}" height="{6}" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe></div>',
            draggable: true,
            noResize: true
        },
        {
            name: 'twitter-button',
            lockScaling: false,
            template: '<div class="aiva-elem social-elm {0}" data-name="twitter-button" data-id="{0}"><iframe class="social-elm" allowtransparency="true" frameborder="0" scrolling="no" src="//platform.twitter.com/widgets/follow_button.html?screen_name={1}&show_screen_name={2}&show_count={3}&size={4}" style="width:{5}px; height:{6}px;"></iframe></div>',
            draggable: true,
            noResize: true
        }
    ];

    this.getConfig = function (inputType) {
        try {
            return _.find(configs, function (obj) {
                return obj.name === inputType;
            });
        } catch (e) {
            return _.find(configs, function (obj) {
                return obj.name === 'shape';
            });
        }
    };

    return this;
});
