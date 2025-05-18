let locales = {
	'en': {
		"language": "Language",
		"currentlyplaying": "Currently playing: ",
		"loadmore": "Load more",
		"graffitiflushhistory": "Clear",
		"graffitibackhistory": "Cancel",
		"graffiticolor": "Color:",
		"graffitiopacity": "Opacity:",
		"graffitithickness": "Thickness:",
		"graffitiswitch": "Use graffiti from VKontakte",
		"ovkhat": `Use OpenVK logo in header`,
		"httpwarn": `This OpenVK instance uses the outdated <b>http</b> protocol.<br>Please, migrate to <b>https</b>.`,
		"httpwarnovk": `You are using an insecure protocol: <b>http</b>. Please always use <b>https</b>.<br><a href='https://{url}/'>Switch to https »</a>`,
		"loginPromo": `OpenVK for mobile devices`,
		"loginPromoInfo": `Install the official OpenVK app and stay up to date with your friends' news, wherever you are.`,
		"loginPromoAndroid": "For Android",
		"loginPromoWp": "For WP",
		"loginPromoIos": "For iOS",
		"newUserQuestionMark": `New to OpenVK?`,
		"newUserSubhead": "Instant registration",
		"left_edge": "Left edge:",
		"right_edge": "Right edge:",
		'oldposts_disabled_desc': "VKify 2016 does not support the old posts view."
	},
	'ru': {
		"language": "Язык",
		"currentlyplaying": "Сейчас воспроизводится: ",
		"loadmore": "Загрузить ещё",
		"graffitiflushhistory": "Очистить",
		"graffitibackhistory": "Отменить",
		"graffiticolor": "Цвет:",
		"graffitiopacity": "Интенсивность:",
		"graffitithickness": "Толщина:",
		"graffitiswitch": "Использовать граффити из ВКонтакте",
		"ovkhat": `Использовать лого OpenVK в шапочке`,
		"httpwarn": `Этот инстанс OpenVK использует устаревший протокол <b>http</b>.<br>Пожалуйста, смените его на <b>https</b>.`,
		"httpwarnovk": `Вы используете небезопасный протокол <b>http</b>. Пожалуйста, всегда используйте <b>https</b>.<br><a href='https://{url}/'>Перейти на https »</a>`,
		"loginPromo": `OpenVK для мобильных устройств`,
		"loginPromoInfo": `Установите официальное приложение OpenVK и оставайтесь в курсе новостей друзей, где бы вы ни находились.`,
		"loginPromoAndroid": "Для Android",
		"loginPromoWp": "Для WP",
		"loginPromoIos": "Для iOS",
		"newUserQuestionMark": `Впервые в OpenVK?`,
		"newUserSubhead": "Мгновенная регистрация",
		"left_edge": "Левая граница:",
		"right_edge": "Правая граница:",
		'oldposts_disabled_desc': "VKify 2016 не поддерживает старый вид постов."
	}
}

window.vkifylocalize = function(langcode) {
	if (!(langcode in locales)) {
		try {
		fetch(`/themepack/vkify/2.0.0.0/resource/langs/${langcode}.json`)
			.then(response => {
				if (!response.ok) {
					console.error('failed to load vkify theme localization:', response.status, ' using en...');
					langcode = 'en';
					patchpage(langcode);
					return;
				}
				return response.json();
			})
			.then(data => {
				if (data) {
					locales[langcode] = data;
					patchpage(langcode);
				}
			})
		} catch(error) {
			console.error('failed to load vkify theme localization:', error)
			langcode = 'en';
			patchpage(langcode);
		}
	} else {
		patchpage(langcode);
	}
}

function patchpage(langcode) {
	window.vkifylang = locales[langcode];
	// Handle all vkifyloc tags on the page
	document.querySelectorAll('vkifyloc').forEach(element => {
		const locName = element.getAttribute('name');
		if (locName && locales[langcode][locName]) {
			element.outerHTML = locales[langcode][locName];
		}
	});
	
	if (location.protocol.includes('http:')) {
		if (location.host.includes('openvk.xyz')) {
			showBlueWarning(window.vkifylang.httpwarnovk);
		} else {
			showBlueWarning(window.vkifylang.httpwarn);
		}
	}
}

// Create a MutationObserver to process vkifyloc tags in dynamically added content
window.addEventListener('DOMContentLoaded', () => {
	if (!window.vkifylang) return;
	
	const observer = new MutationObserver((mutations) => {
		mutations.forEach(mutation => {
			mutation.addedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Check for vkifyloc tags in the added node
					const locTags = node.querySelectorAll('vkifyloc');
					if (locTags.length > 0) {
						locTags.forEach(element => {
							const locName = element.getAttribute('name');
							if (locName && window.vkifylang[locName]) {
								element.outerHTML = window.vkifylang[locName];
							}
						});
					}
					
					// Check if the added node itself is a vkifyloc tag
					if (node.nodeName === 'VKIFYLOC') {
						const locName = node.getAttribute('name');
						if (locName && window.vkifylang[locName]) {
							node.outerHTML = window.vkifylang[locName];
						}
					}
				}
			});
		});
	});
	
	// Observe the entire document for added nodes
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
});
