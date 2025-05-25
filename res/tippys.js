document.addEventListener('DOMContentLoaded', function () {
    const commonConfig = {
        allowHTML: true,
        interactive: true,
        theme: 'light vk',
        placement: 'bottom',
        appendTo: document.body
    };

    window.postActionTooltipConfig = {
        content: (reference) => {
            const menu = reference.closest('.post_actions')?.querySelector('.tippy-menu');
            if (!menu) return document.createElement('div');
            
            const menuClone = menu.cloneNode(true);
            
            reference.setAttribute('data-tippy-content-html', menu.innerHTML);
            
            return menuClone;
        },
        allowHTML: true,
        interactive: true,
        trigger: 'mouseenter focus',
        placement: 'bottom-end',
        theme: 'light vk',
        appendTo: 'parent',
        delay: [0, 0],
        onCreate: (instance) => {
            instance.reference.setAttribute('data-tippy-initialized', 'true');
        },
        onDestroy: (instance) => {
            instance.reference.removeAttribute('data-tippy-initialized');
            instance.reference.removeAttribute('data-tippy-content-html');
        }
    };

    function setupTooltip(selector, contentCallback, options = {}) {
        if (!selector) return;

        const config = {
            ...commonConfig,
            content: typeof contentCallback === 'function' 
                ? contentCallback 
                : contentCallback instanceof Element 
                    ? contentCallback 
                    : document.getElementById(contentCallback),
            onCreate(instance) {
                instance.reference.setAttribute('data-tippy-initialized', 'true');
            },
            onDestroy(instance) {
                instance.reference.removeAttribute('data-tippy-initialized');
            },
            ...options
        };

        return tippy(selector, config);
    }
    window.initializeTippys = function() {
        function hasTippy(element) {
            return element && (element._tippy || element.hasAttribute('aria-describedby'));
        }

        function safeSetupTooltip(selector, contentCallback, options = {}) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!hasTippy(element)) {
                    setupTooltip(selector, contentCallback, options);
                }
            });
        }

        safeSetupTooltip('#moreAttachTrigger', 'moreAttachTooltip');
        safeSetupTooltip('#postOptsTrigger', 'postOptsTooltip');
        safeSetupTooltip('#moreOptionsLink', 'moreOptionsContent', {
            trigger: 'mouseenter focus',
            arrow: true,
            maxWidth: 300
        });

        safeSetupTooltip('#userMenuTrigger', 'userMenuTooltip', {
            trigger: 'click',
            placement: 'bottom-end'
        });

        document.querySelectorAll('.post_actions_icon').forEach(element => {
            if (!hasTippy(element)) {
                tippy(element, window.postActionTooltipConfig);
            }
        });

        safeSetupTooltip('.reply_action', 
            (reference) => reference.getAttribute('data-tippy-content'),
            {
                placement: 'top',
                delay: [0, 0]
            }
        );
    };

    window.initializeTippys();

    document.addEventListener('click', (event) => {
        if (event.target.closest('.tippy-menu a')) {
            tippy.hideAll({ duration: 0 });
        }
    });
});