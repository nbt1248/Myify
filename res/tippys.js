document.addEventListener('DOMContentLoaded', function () {
    const commonConfig = {
        allowHTML: true,
        interactive: true,
        animation: 'shift-toward-subtle',
        duration: [100, 100],
        theme: 'light vk',
        placement: 'bottom',
        appendTo: document.body
    };

    function setupTooltip(selector, contentCallback, options = {}) {
        if (!selector) return;

        const config = {
            ...commonConfig,
            content: typeof contentCallback === 'function' 
                ? contentCallback 
                : contentCallback instanceof Element 
                    ? contentCallback 
                    : (reference) => {
                        // For string IDs, first try to find adjacent .tippy-menu
                        const adjacentMenu = reference.nextElementSibling;
                        if (adjacentMenu && adjacentMenu.classList.contains('tippy-menu')) {
                            return adjacentMenu;
                        }
                        
                        // Fallback to ID lookup
                        const menu = document.getElementById(contentCallback);
                        return menu || document.createElement('div');
                    }
        };

        // Apply custom options after the default config
        Object.assign(config, options);

        return tippy(selector, config);
    }

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
        animation: 'shift-toward-subtle',
        theme: 'light vk',
        duration: [100, 100],
        appendTo: 'parent',
        onCreate: (instance) => {
            instance.reference.setAttribute('data-tippy-initialized', 'true');
        },
        onDestroy: (instance) => {
            instance.reference.removeAttribute('data-tippy-initialized');
            instance.reference.removeAttribute('data-tippy-content-html');
        }
    };

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

        document.querySelectorAll('.post_actions_icon').forEach(element => {
            if (!hasTippy(element)) {
                tippy(element, window.postActionTooltipConfig);
            }
        });

        safeSetupTooltip('.reply_action', 
            (reference) => reference.getAttribute('data-tippy-content'),
            {
                placement: 'top',
                theme: 'dark'
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