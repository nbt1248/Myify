/**
 * OpenVK Router Patch for VKify Theme
 * 
 * This script enhances the OpenVK router to properly handle CSS loading and localization
 * during AJAX transitions.
 */

function loadPageSpecificCSS(htmlContent) {
    const linkPattern = /<link[^>]*rel=['"]stylesheet['"][^>]*href=['"]([^'"]+)['"][^>]*>/gi;
    let match;
    const cssFiles = [];
    
    while ((match = linkPattern.exec(htmlContent)) !== null) {
        const href = match[1];
        if (href.includes('/themepack/') && !href.includes('node_modules')) {
            cssFiles.push(href);
        }
    }
    
    cssFiles.forEach(href => {
        const cssExists = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(link => link.getAttribute('href') === href);
            
        if (!cssExists) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            console.log('AJAX transition: Loaded CSS file', href);
        }
    });
}

function processVkifyLocTags() {
    if (!window.vkifylang) return;
    
    document.querySelectorAll('vkifyloc').forEach(element => {
        const locName = element.getAttribute('name');
        if (locName && window.vkifylang[locName]) {
            element.outerHTML = window.vkifylang[locName];
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    processVkifyLocTags();
    
    const patchRouter = function() {
        if (window.router && window.router.route) {
            const originalRoute = window.router.route;
            
            window.router.route = async function(...args) {
                await originalRoute.apply(this, args);
                
                processVkifyLocTags();
            };
            
            if (window.router.__appendPage) {
                const originalAppendPage = window.router.__appendPage;
                window.router.__appendPage = function(parsedContent) {
                    originalAppendPage.call(this, parsedContent);
                    
                    if (parsedContent && parsedContent.documentElement) {
                        loadPageSpecificCSS(parsedContent.documentElement.outerHTML);
                    }
                };
            }
            
            if (window.router.__integratePage) {
                const originalIntegratePage = window.router.__integratePage;
                window.router.__integratePage = async function(...args) {
                    await originalIntegratePage.apply(this, args);
                    processVkifyLocTags();
                };
            }
            
            console.log('Router patched for proper CSS loading and localization');
        }
    };
    
    if (window.router) {
        patchRouter();
    } else {
        const routerCheck = setInterval(() => {
            if (window.router) {
                clearInterval(routerCheck);
                patchRouter();
            }
        }, 100);
        
        setTimeout(() => clearInterval(routerCheck), 10000);
    }
    
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments[0] === 'GET' && arguments[1] && !arguments[1].match(/\.(js|css|png|jpg|gif|svg|ico)$/)) {
            this.addEventListener('load', function() {
                if (this.status === 200 && 
                    (this.responseType === '' || this.responseType === 'text') && 
                    this.responseText && 
                    this.responseText.includes('<!DOCTYPE html>')) {
                    loadPageSpecificCSS(this.responseText);
                    setTimeout(processVkifyLocTags, 0);
                }
            });
        }
        return originalXHROpen.apply(this, arguments);
    };
    
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        
        try {
            const cloned = response.clone();
            
            const contentType = cloned.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                cloned.text().then(html => {
                    if (html.includes('<!DOCTYPE html>')) {
                        loadPageSpecificCSS(html);
                        setTimeout(processVkifyLocTags, 0); 
                    }
                }).catch(error => console.error('Error processing fetch response:', error));
            }
        } catch (error) {
            console.error('Error in fetch override:', error);
        }
        
        return response;
    };
    
    ['DOMContentLoaded', 'load', 'popstate'].forEach(eventType => {
        window.addEventListener(eventType, () => {
            setTimeout(processVkifyLocTags, 0);
        });
    });
    
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'VKIFYLOC' || node.querySelector('vkifyloc')) {
                            shouldProcess = true;
                            break;
                        }
                    }
                }
                
                if (shouldProcess) break;
            }
        }
        
        if (shouldProcess) {
            processVkifyLocTags();
        }
    });

    observer.observe(document.body, {
        childList: true, 
        subtree: true
    });
}); 