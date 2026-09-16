$('.designs li').click(function(){
    $('.designs li').removeClass('active')
    $(this).addClass('active')
    let src = $(this).find('img').attr('src')
    $('.main-picture img').attr('src', src)
})

$('.largeImg').click(function(){
    let src = $(this).find('img').attr('src')
    console.log(src)
    $('.thumb-modal').show()
    $('.thumb-modal').html('<img src="'+ src +'">')
    $('.thumb-modal').click(function(){
        $(this).hide()
    })
})

function onLogin(type) {
    const formThis = type == 1 ? $('.loginForm') : $('.registerForm');
    const isJump = localStorage.getItem('isHref');
    const phoneField = formThis.find('.mobile').val();
    const emailField = type == 1 ? phoneField : formThis.find('.email').val();
    const exp = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;

    if (formThis.find('.mobile').val() == '') {
        if (type == 2) {
            return error('Please enter your phone number.');
        }
        return error('Please enter your phone number or E-Mail.');
    }
    if (exp.test(phoneField) && phoneField.length <= 6) {
        return error('Please enter the correct phone number.');
    }
    if (formThis.find('.email').val() == '') {
        return error('Please enter your E-Mail.');
    }
    // if (!phoneRegex().test(formThis.find('.mobile').val())) {
    //     return error('Please enter the correct phone number.');
    // }
    if (!exp.test(emailField) && !emailRegex().test(emailField)) {
        return error('Please enter the correct E-Mail.');
    }
    if (formThis.find('.password').val() == '') {
        return error('Please enter the password.');
    }
    if (type == 1) {
        var url = '/index/member/login';
        var data = {
            'telephone': formThis.find('.mobile').val(),
            'password': formThis.find('.password').val()
        };
        $.post(url, data, function (r) {
            if (r.errcode == 0) {
                success(r.errmsg, function () {
                    localStorage.removeItem('isHref');
                    formThis.find('input').each(function () {
                        $(this).val('');
                    })
                    //return layer.closeAll(); // 关闭弹层
                    return location.reload(); // 刷新页面
                },);
            } else {
                return error(r.errmsg);
            }
        });
    } else {
        if (formThis.find('.confirm').val() == '') {
            return error('Please enter the password again.');
        }
        var url = '/index/member/register';
        var data = {
            'telephone': formThis.find('.mobile').val(),
            'email': formThis.find('.email').val(),
            'password': formThis.find('.password').val(),
            'confirm': formThis.find('.confirm').val()
        };
        $.post(url, data, function (r) {
            if (r.errcode == 0) {
                success(r.errmsg, function () {
                    localStorage.removeItem('isHref');
                    formThis.find('input').each(function () {
                        $(this).val('');
                    })
                    //return layer.closeAll(); // 关闭弹层
                    return location.reload(); // 刷新页面
                },);
            } else {
                return error(r.errmsg);
            }
        });
    }
}

function handleLogin(jump, loginStatus = 1) {
    if (loginStatus == 2) {
        return window.location = '/index/products/cart'
    }
    localStorage.setItem('isHref', jump); // 控制在登录完成后可以执行某些操作
    layer.open({
        type: 1,
        title: '',
        content: $('#loginWrap'),
        // shadeClose: true,
        offset: '80px',
        shade: 0.9,
        // area: [width, height]
        cancel: () => {
            localStorage.removeItem('isHref');
        }
    })
}

function emailRegex() {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
}
function phoneRegex() {
    return /^1[3456789]\d{9}$/;
}
function error (content) {
    return layer.msg(content, {icon: 2, anim: 6})
}
function success (content, action) {
    return layer.msg(content, {
        icon: 1,
        shade: 0.3,
        time: 2000
        // },  function() {
    },action)
}

if (window.location.pathname.indexOf('contact.html') === -1) {
    var contactBtn = document.createElement('a');
    contactBtn.href = 'contact.html';
    contactBtn.className = 'floating-contact-btn';
    contactBtn.setAttribute('data-i18n', 'nav.contact');
    contactBtn.textContent = 'Contact Us';
    document.body.appendChild(contactBtn);
}
