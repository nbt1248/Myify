document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('moreAttachTrigger')) {
        tippy('#moreAttachTrigger', {
            content: () => document.getElementById('moreAttachTooltip') || document.createElement('div'),
            allowHTML: true,
            interactive: true,
            trigger: 'mouseenter',
            placement: 'bottom',
            theme: 'light vk',
            onShown: () => {
                const tooltip = document.getElementById('moreAttachTooltip');
                if (tooltip) tooltip.style.display = 'block';
            }
        });
    }

    if (document.getElementById('postOptsTrigger')) {
        tippy('#postOptsTrigger', {
            content: () => document.getElementById('postOptsTooltip') || document.createElement('div'),
            allowHTML: true,
            interactive: true,
            trigger: 'mouseenter',
            theme: 'light vk',
            placement: 'bottom',
            onShown: () => {
                const tooltip = document.getElementById('postOptsTooltip');
                if (tooltip) tooltip.style.display = 'block';
            }
        });
    }

    if (document.getElementById('userMenuTrigger')) {
        tippy('#userMenuTrigger', {
            content: () => {
                const menuTooltip = document.createElement('div');
                menuTooltip.id = 'userMenuTooltip';
                menuTooltip.innerHTML = `
                <div class="tippy-menu">
                    <a href="/id${window.openvk.current_id}">${tr('my_page')}</a>
                    <div class="separator"></div>
                    <a href="/edit">${tr('edit')}</a>
                    <a href="/settings">${tr('menu_settings')}</a>
                    <a href="/support">${tr('menu_help')}</a>
                    <div class="separator"></div>
                    <a href="/logout?hash=${encodeURIComponent(window.router.csrf)}">${tr('menu_logout')}</a>
                </div>
                `;
                return menuTooltip;
            },
            allowHTML: true,
            interactive: true,
            trigger: 'click',
            placement: 'bottom-end',
            theme: 'light vk',
            appendTo: () => document.body,
            onShown: (instance) => {
                const tooltip = instance.popper.querySelector('#userMenuTooltip');
                if (tooltip) tooltip.style.display = 'block';
            }
        });
    }

    document.addEventListener('click', function (event) {
        if (event.target.closest('.tippy-menu a')) {
            tippy.hideAll();
        }
    });

    tippy('.reply_action', {
        content: (reference) => reference.getAttribute('data-tippy-content'),
        allowHTML: true,
        placement: 'top',
        delay: [0, 0]
    });
});