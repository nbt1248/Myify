function setTip(obj, text, interactive = false) {
    tippy(obj, {
        content: `<text style="font-size: 11px;">${text}</text>`,
        allowHTML: true,
        placement: 'top',
        theme: 'light vk',
        animation: 'shift-away',
        interactive: interactive
    });
}

window.showBlueWarning = function (content) {
    NewNotification(tr('warning'), content, null, () => { }, 10000, false);
}

Object.defineProperty(window.player, 'ajCreate', {
    value: function() {
        console.log('ajCreate override called');
        // override: do nothing
    },
    writable: false,
    configurable: false
});

window.changeLangPopup = function () {
    window.langPopup = new CMessageBox({
        title: tr('select_language'),
        body: `<a href="/language?lg=ru&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}">
<div class="langSelect"><img src="/themepack/myify/1.0.0.0/resource/lang_flags/ru.png" style="margin-right: 14px;"><b>Русский</b></div>
</a>
<a href="/language?lg=uk&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}">
   <div class="langSelect"><img style="margin-right: 14px;" src="/themepack/myify/1.0.0.0/resource/lang_flags/uk.png"><b>Україньска</b></div>
</a>
<a href="/language?lg=en&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}">
   <div class="langSelect"><img src="/themepack/myify/1.0.0.0/resource/lang_flags/en.png" style="margin-right: 14px;"><b>English</b></div>
</a>
<a href="/language?lg=ru_sov&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}">
   <div class="langSelect"><img src="/themepack/myify/1.0.0.0/resource/lang_flags/sov.png" style="margin-right: 14px;"><b>Советский</b></div>
</a>
<a href="/language?lg=ru_old&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}">
   <div class="langSelect"><img style="margin-right: 14px;" src="/themepack/myify/1.0.0.0/resource/lang_flags/imp.png"><b>Дореволюціонный</b></div>
</a>
<a href="/language" onclick="langPopup.close(); allLangsPopup(); return false;">
   <div class="langSelect"><b style="padding: 2px 2px 2px 48px;">All languages »</b></div>
</a>`,
        buttons: [tr('close')],
        callbacks: [() => { langPopup.close() }]
    });
}

window.allLangsPopup = function () {
    const container = document.createElement("div");
    let ul;
    Object.entries(window.openvk.locales).forEach(([langCode, nativeName], index) => {
        if (index % 26 === 0) {
            ul = document.createElement("ul");
            container.appendChild(ul);
        }
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `/language?lg=${langCode}&hash=${encodeURIComponent(window.router.csrf)}&jReturnTo=${encodeURI(window.location.pathname + window.location.search)}`;
        link.textContent = nativeName;
        li.appendChild(link);
        ul.appendChild(li);
    });

    window.langPopup = new CMessageBox({
        title: tr('select_language'),
        body: container.innerHTML,
        buttons: [tr('close')],
        callbacks: [() => { langPopup.close() }]
    });
}

window.showAudioUploadPopup = function () {
    window.audioUploadPopup = new CMessageBox({
        title: tr('upload_audio'),
        body: `
<div id="upload_container">
            <div id="firstStep">
                <b><a href="javascript:void(0)">${tr('limits')}</a></b>
                <ul>
                    <li>${tr("audio_requirements", 1, 30, 25)}</li>
                    <li>${tr("audio_requirements_2")}</li>
                </ul>
					<div id="audio_upload">
						<input id="audio_input" multiple="" type="file" name="blob" accept="audio/*" style="display:none">
						<input value="${tr('upload_button')}" class="button" type="button" onclick="document.querySelector('#audio_input').click()">
					</div>
				</div>

            <div id="lastStep" style="display:none">
                <div id="lastStepContainers"></div>
                <div id="lastStepButtons" style="text-align: center;margin-top: 10px;">
                    <input class="button" type="button" id="uploadMusicPopup" value="${tr('upload_button')}">
                    <input class="button" type="button" id="backToUpload" onclick="document.querySelector('#audio_input').click()" value="${tr('select_another_file')}">
                </div>
            </div>
        </div>`,
        buttons: [tr('close')],
        callbacks: [() => { audioUploadPopup.close() }]
    });

    setTimeout(() => {
        const script = document.createElement("script");
        script.type = "module";
        script.innerHTML = `
	import * as id3 from "/assets/packages/static/openvk/js/node_modules/id3js/lib/id3.js";

	window.__audio_upload_page = new class {
		files_list = []

		hideFirstPage() {
			u('#firstStep').attr('style', 'display:none')
			u('#lastStep').attr('style', 'display:block;')
		}

		showFirstPage() {
			u('#firstStep').attr('style', 'display:block;')
			u('#lastStep').attr('style', 'display:none')
		}

		async detectTags(blob) {
			const return_params = {
				performer: '',
				name: '',
				genre: '',
				lyrics: '',
				explicit: 0,
				unlisted: 0,
			}

			function fallback() {
				console.info('Tags not found, setting default values.')
				return_params.name = remove_file_format(blob.name)
				return_params.genre = 'Other'
				return_params.performer = tr('track_unknown')
			}

			let tags = null
			try {
				tags = await id3.fromFile(blob)
			} catch(e) {
				console.error(e)
			}

			console.log(tags)
			if(tags != null) {
				console.log("ID" + tags.kind + " detected, setting values...")
				if(tags.title) {
					return_params.name = tags.title
				} else {
					return_params.name = remove_file_format(blob.name)
				}

				if(tags.artist) {
					return_params.performer = tags.artist
				} else {
					return_params.performer = tr('track_unknown')
					// todo: split performer and title from filename
				}

				if(tags.genre != null) {
					if(tags.genre.split(', ').length > 1) {
						const genres = tags.genre.split(', ')

						genres.forEach(genre => {
							if(window.openvk.audio_genres[genre]) {
								return_params.genre = genre;
							}
						})
					} else {
						if(window.openvk.audio_genres.indexOf(tags.genre) != -1) {
							return_params.genre = tags.genre
						} else {
							console.warn("Unknown genre: " + tags.genre)
							return_params.genre = 'Other'
						}
					}
				} else {
					return_params.genre = 'Other'
				}

				if(tags.comments != null)
					return_params.lyrics = tags.comments
			} else {
				fallback()
			}

			return return_params
		}

		async appendFile(appender) 
		{
			appender.info = await this.detectTags(appender.file)
			const audio_index = this.files_list.push(appender) - 1
			this.appendAudioFrame(audio_index)
		}

		appendAudioFrame(audio_index) {
			const audio_element = this.files_list[audio_index]
			if(!audio_element) {
				return
			
			}
			const template = u(\`
			<div class='upload_container_element' data-index="\${audio_index}">
				<div class='upload_container_name'>
					<span>\${ovk_proc_strtr(escapeHtml(audio_element.file.name), 63)}</span>
					<div id="small_remove_button"></div>
				</div>
				<table cellspacing="7" cellpadding="0" border="0" align="center">
					<tbody>
						<tr>
							<td width="120" valign="top"><span class="nobold">\${tr('performer')}:</span></td>
							<td><input value='\${escapeHtml(audio_element.info.performer)}' name="performer" type="text" autocomplete="off" maxlength="80" /></td>
						</tr>
						<tr>
							<td width="120" valign="top"><span class="nobold">\${tr('audio_name')}:</span></td>
							<td><input type="text" value='\${escapeHtml(audio_element.info.name)}' name="name" autocomplete="off" maxlength="80" /></td>
						</tr>
						<tr>
							<td width="120" valign="top"><span class="nobold">\${tr('genre')}:</span></td>
							<td>
								<select name="genre"></select>
							</td>
						</tr>
						<tr>
							<td width="120" valign="top"><span class="nobold">\${tr('lyrics')}:</span></td>
							<td><textarea name="lyrics" style="resize: vertical;max-height: 300px;">\${escapeHtml(audio_element.info.lyrics)}</textarea></td>
						</tr>
						<tr>
							<td width="120" valign="top"></td>
							<td>
								<label style='display:block'><input type="checkbox" name="explicit">\${tr('audios_explicit')}</label>
								<label><input type="checkbox" name="unlisted">\${tr('audios_unlisted')}</label>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			\`)
			window.openvk.audio_genres.forEach(genre => {
				template.find('select').append(\`
					<option \${genre == audio_element.info.genre ? 'selected': ''} value='\${genre}'>\${genre}</option>
				\`)
			})
			u('#lastStep #lastStepContainers').append(template)
		}
	}

	u(\`#audio_upload input\`).on('change', (e) => {
		const files = e.target.files
		if(files.length <= 0) {
			return
		}

		Array.from(files).forEach(async file => {
			let has_duplicates = false
			const appender = {
				'file': file
			}

			if(!file.type.startsWith('audio/')) {
				makeError(tr('only_audios_accepted', escapeHtml(file.name)))
				return
			}

			window.__audio_upload_page.files_list.forEach(el => {
				if(el && file.name == el.file.name) {
					has_duplicates = true
				}
			})

			if(!has_duplicates) {
				window.__audio_upload_page.appendFile(appender)
			}
		})
		window.__audio_upload_page.hideFirstPage()
	})
    `;
        document.querySelector('.ovk-diag-action').appendChild(script);
        document.querySelector('.ovk-diag-action').insertAdjacentHTML('afterbegin', `<a href="/search?section=audios" style="float: left;margin-top: 6px;margin-left: 5px;">${tr('audio_search')}</a>`)
    }, 0);
}

async function loadMoreAudio() {
    if (window.musHtml) {
        window.musHtml.querySelector('.audiosContainer .loadMore').innerHTML = `<img src="data:image/gif;base64,R0lGODlhIAAIAKECAEVojoSctMHN2QAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAIAAIAAACFZyPqcvtD6KMr445LcRUN9554kiSBQAh+QQFCgADACwCAAIAEgAEAAACD4xvM8DNiJRz8Mj5ari4AAAh+QQFCgADACwCAAIAHAAEAAACGJRvM8HNCqKMCCnn4JT1XPwMG9cJH6iNBQAh+QQFCgADACwMAAIAEgAEAAACD5RvM8HNiJRz8Mj5qri4AAAh+QQFCgADACwWAAIACAAEAAACBZSPqYsFACH5BAUUAAMALAAAAAAgAAgAAAIOnI+py+0Po5y02ouzPgUAOw==" />`;
        await window.player.loadContext(Number(Math.max(...window.player.context["playedPages"])) + 1, true);
        window.player.dump();
        let parsedaud = parseAudio(true).scrollContainer;
        let tmp = document.createElement('div');
        tmp.innerHTML = parsedaud;
        window.musHtml.querySelectorAll('.scroll_container .scroll_node [data-realid]').forEach(scrollNode => {
            const realId = scrollNode.getAttribute('data-realid');
            tmp.querySelectorAll('.scroll_node [data-realid]').forEach(node => {
                if (node.getAttribute('data-realid') === realId) node.closest('.scroll_node').remove();
            });
        });
        parsedaud = tmp.innerHTML;
        window.musHtml.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer .loadMore_node').outerHTML = parsedaud;
        window.musHtml.querySelector('.loadMore').onclick = async function () { await loadMoreAudio(); }
        u(`.audiosContainer .audioEmbed .audioEntry, .audios_padding .audioEmbed`).removeClass('nowPlaying');
        u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying');
    }
}

function cleanUpAudioList() {
    let ldump = localStorage.getItem('audio.lastDump');
    if (ldump) {
        let data = JSON.parse(ldump);
        if (data.tracks && data.tracks.length > 20) {
            data.tracks = data.tracks.slice(-20);
            localStorage.setItem('audio.lastDump', JSON.stringify(data));
            console.log('playlist context cleaned up!');
        }
    }
}

function parseAudio(onlyscnodes = false) {
    cleanUpAudioList();
    const audioDump = localStorage.getItem('audio.lastDump');
    const nothingtemplate = `<div class="vkifytracksplaceholder" style="margin: auto;">
                                <span style="color: #707070;">
                                    ${tr('no_data_description')}
                                </span>
                            </div>`
    if (audioDump) {
        try {
            if (JSON.parse(audioDump)) {
                let adump = JSON.parse(audioDump);
                adump.tracks = Array.from(new Map(adump.tracks.map(track => [track.id, track])).values());
                const scrollContainer = document.createElement('div');
                scrollContainer.classList.add('scroll_container');
                adump.tracks.forEach(track => {
                    const scrollNode = document.createElement('div');
                    scrollNode.classList.add('scroll_node');
                    scrollNode.innerHTML = `
                <div id="audioEmbed-${track.id}" data-realid="${track.id}" data-name="${track.performer} — ${track.name}" data-genre="Other" data-length="${track.length}" data-keys='${JSON.stringify(track.keys)}' data-url="${track.url}" class="audioEmbed ctx_place">
                    <audio class="audio"></audio>
                    <div id="miniplayer" class="audioEntry">
                        <div class="audioEntryWrapper" draggable="true">
                            <div class="playerButton">
                                <div class="playIcon"></div>
                            </div>
                            <div class="status">
                                <div class="mediaInfo noOverflow">
                                    <div class="info">
                                        <strong class="performer">
                                            <a draggable="false" href="/search?section=audios&amp;order=listens&amp;only_performers=on&amp;q=${encodeURIComponent(track.performer)}">${track.performer}</a>
                                        </strong>
                                        —
                                        <span draggable="false" class="title">${track.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mini_timer">
                                <span class="nobold hideOnHover" data-unformatted="${track.length}">${formatTime(track.length)}</span>
                                <div class="buttons">
                                    <div class="report-icon musicIcon" data-id="6690"></div>
                                    <div class="remove-icon musicIcon" data-id="${track.id}"></div>
                                    <div class="add-icon-group musicIcon hidden" data-id="${track.id}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="subTracks" draggable="false">
                            <div class="lengthTrackWrapper">
                                <div class="track lengthTrack">
                                    <div class="selectableTrack">
                                        <div class="selectableTrackLoadProgress">
                                            <div class="load_bar"></div>
                                        </div>
                                        <div class="selectableTrackSlider">
                                            <div class="slider"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="volumeTrackWrapper">
                                <div class="track volumeTrack">
                                    <div class="selectableTrack">
                                        <div class="selectableTrackSlider">
                                            <div class="slider"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
                    scrollContainer.appendChild(scrollNode);
                });
                if (scrollContainer.innerHTML) {
                    const loadmore = document.createElement('div');
                    loadmore.classList.add('scroll_node');
                    loadmore.classList.add('loadMore_node');
                    loadmore.innerHTML = `<a class="loadMore">${window.vkifylang.loadmore}</a>`
                    scrollContainer.appendChild(loadmore);
                    if (onlyscnodes) {
                        return { 'scrollContainer': `${scrollContainer.innerHTML}`, 'nowPlayingUrl': adump.context.object.url };
                    } else {
                        return {
                            'scrollContainer': `<div class="audiosContainer audiosSideContainer audiosPaddingContainer">
                        <div class="scroll_container">
                            ${scrollContainer.innerHTML}
                        </div>
                    </div>`, 'nowPlayingUrl': adump.context.object.url
                        };
                    }
                } else {
                    return { 'scrollContainer': nothingtemplate, 'nowPlayingUrl': '' }
                }
            }
        } catch (error) {
            console.error(error)
            return { 'scrollContainer': nothingtemplate, 'nowPlayingUrl': '' }
        }
    } else {
        return { 'scrollContainer': nothingtemplate, 'nowPlayingUrl': '' }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return { 'scrollContainer': nothingtemplate, 'nowPlayingUrl': '' }
}

const vkfavicon = {
    "fav": "/themepack/myify/1.0.0.0/resource/favicon_vk.ico",
    "fav_chat": "/themepack/myify/1.0.0.0/resource/fav_chat.ico",
    "playiconnew": "/themepack/myify/1.0.0.0/resource/playiconnew.ico",
    "pauseiconnew": "/themepack/myify/1.0.0.0/resource/pauseiconnew.ico"
}

if (window.location.href.includes('im?sel=')) {
    document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["fav_chat"])
}

window.initVKGraffiti = function (event) {
    // Create the iframe content as a separate string
    const iframeContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${window.location.origin}/themepack/myify/2.0.0.0/resource/vkgraffiti/graffiti.css">
    <link rel="stylesheet" href="${window.location.origin}/themepack/myify/2.0.0.0/resource/vkgraffiti/common.css">
</head>
<body>
    <div style="margin: 10px"><a onclick="Graffiti.flushHistory();">${window.vkifylang ? window.vkifylang.graffitiflushhistory : 'Clear'}</a> | <a onclick="Graffiti.backHistory();">${window.vkifylang ? window.vkifylang.graffitibackhistory : 'Undo'}</a></div>
    <div style="background-color: #F7F7F7; padding-top: 20px; padding-bottom: 1px;">
        <div id="graffiti_aligner">
            <canvas id="graffiti_common" width="586" height="293"></canvas>
            <canvas id="graffiti_overlay" width="586" height="293"></canvas>
            <canvas id="graffiti_helper" width="586" height="293"></canvas>
        </div>
        <div id="graffiti_resizer" style="margin-top: 5px;"></div>
    </div>
    <div>
        <canvas id="graffiti_controls" width="586" height="70"></canvas>
    </div>
    <canvas id="graffiti_hist_helper" width="1172" height="586" style="display:none;"></canvas>
    <div id="graffiti_cpwrap" style="display:none; top:-210px;">
        <canvas id="graffiti_cpicker" width="252" height="168"></canvas>
    </div>
    <script src="${window.location.origin}/themepack/myify/2.0.0.0/resource/vkgraffiti/graffiti.js"></script>
    <script>
        var cur = {"lang": {
            "graffiti_flash_color": "${window.vkifylang ? window.vkifylang.graffiticolor : 'Color:'} ", 
            "graffiti_flash_opacity": "${window.vkifylang ? window.vkifylang.graffitiopacity : 'Opacity:'} ", 
            "graffiti_flash_thickness": "${window.vkifylang ? window.vkifylang.graffitithickness : 'Thickness:'} ", 
            "graffiti_normal_size": "Оконный режим", 
            "graffiti_full_screen": "Полноэкранный режим"
        }}; 
        window.onload = function() {
            Graffiti.init();
        };
    </script>
</body>
</html>
`;

    // Escape the iframe content properly
    const escapedIframeContent = iframeContent
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    var msgbox = new CMessageBox({
        title: tr("draw_graffiti"),
        body: `<iframe style="width: 100%; height: 100%; border: medium;" srcdoc="${escapedIframeContent}"></iframe>`,
        close_on_buttons: false,
        warn_on_exit: true,
        buttons: [tr("save"), tr("cancel")],
        callbacks: [function () {
            msgbox.getNode().find('iframe').nodes[0].contentWindow.Graffiti.getImage(function (dataURL) {
                // ваще кому нужен этот комментарий лол
                var blob = dataURLtoBlob(dataURL);
                let fName = "Graffiti-" + Math.ceil(performance.now()).toString() + ".jpeg";
                let image = new File([blob], fName, {
                    type: "image/jpeg",
                    lastModified: new Date().getTime()
                });
                __uploadToTextarea(image, u(event.target).closest('#write'))
            });
            msgbox.close()
        }, async function () {
            const res = await msgbox.__showCloseConfirmationDialog()
            if (res === true) {
                msgbox.close()
            }
        }]
    });

    var msgboxsel = document.querySelector(`.ovk-diag-cont.ovk-msg-all[data-id="${msgbox.id}"]`);
    msgboxsel.style.width = '800px';
    msgbox.getNode().find('.ovk-diag-body').attr('style', 'height:550px;');

    function dataURLtoBlob(dataURL) {
        var arr = dataURL.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }
};

window.toggle_comment_textarea = function (id) {
    var el = document.getElementById('commentTextArea' + id);
    var wi = document.getElementById('wall-post-input' + id);
    if (el.style.display === "block") {
        el.style.display = "none";
        wi.blur();
    } else {
        el.style.display = "block";
        wi.focus();
    }
}

function createLoader() {
    const iconFrames = [
        "data:image/gif;base64,R0lGODlhEAAQAPEDAEVojoSctMHN2QAAACH5BAEAAAMALAAAAAAQABAAAAItnI9pwW0A42rsRTipvVnt7kmDE2LeiaLCeq6C4bbsEHu1e+MvrcM9j/MFU4oCADs=", // prgicon1.gif в Base64
        "data:image/gif;base64,R0lGODlhEAAQAPEDAEVojoSctMHN2QAAACH5BAEAAAMALAAAAAAQABAAAAIrnI9pwm0B42rsRTipvVnt7kmDE2LeiaKkArQg646V1wIZWdf3nMcU30t5CgA7", // prgicon2.gif в Base64
        "data:image/gif;base64,R0lGODlhEAAQAPEDAEVojoSctMHN2QAAACH5BAEAAAMALAAAAAAQABAAAAIxnI9pwr3NHpRuwGivVDsL7nVKBZZmAqRgwBopsLbDGwfuqw7sbs84rOP1fkBh74QoAAA7", // prgicon3.gif в Base64
        "data:image/gif;base64,R0lGODlhEAAQAPEDAEVojoSctMHN2QAAACH5BAEAAAMALAAAAAAQABAAAAItnI9pwG0C42rsRTipvVnt7kmDE2LeiaLBeopr0JpvLBjvPFzyDee6zduIUokCADs=", // prgicon4.gif в Base64
    ];

    let step = 0;
    let timer = null;
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);

    const updateFavicon = () => {
        step = (step + 1) % 4;
        favicon.href = iconFrames[step];
        timer = setTimeout(updateFavicon, 150);
    };

    const gifFavicon = () => {
        favicon.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKOBYiGjgWKVo4Fi1aOBYt2jgWJxAAAAAKOBYimjgWLUo4Fi76OBYu6jgWLYAAAAAAAAAAAAAAAAAAAAAKOBYlqjgWL3o4Fi/6OBYv+jgWL/o4FiwKOBYhijgWLeo4Fi/6OBYv+jgWL/o4FizAAAAAAAAAAAAAAAAKOBYkujgWL8o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL6o4Fi/6OBYv+jgWL/o4Fi/qOBYlIAAAAAAAAAAKOBYh6jgWLuo4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYocAAAAAAAAAAAAAAACjgWK5o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWIMAAAAAAAAAACjgWJco4Fi/6OBYv+jgWL/o4Fiq6OBYv+jgWL/o4Fi/6OBYv+jgWKyo4Fi/6OBYv+jgWL/o4FiVwAAAACjgWINo4Fi6KOBYv+jgWL/o4FivwAAAACjgWL1o4Fi/6OBYv+jgWL7o4FiB6OBYumjgWL/o4Fi/6OBYuOjgWIJo4FigqOBYv+jgWL/o4Fi/6OBYjqjgWICo4Fi9aOBYv+jgWL/o4Fi+AAAAACjgWKTo4Fi/6OBYv+jgWL/o4FicKOBYvWjgWL/o4Fi/6OBYtwAAAAAo4FiQaOBYv+jgWL/o4Fi/6OBYv4AAAAAo4FiMaOBYv+jgWL/o4Fi/6OBYt6jgWLeo4Fi/6OBYv+jgWKFAAAAAKOBYsijgWL/o4Fi/6OBYu+jgWK9AAAAAAAAAACjgWK6o4Fi/6OBYv+jgWLVAAAAAAAAAACjgWIFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAo4FiAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDAAAALYAAAAAAADDAgAAAAIAAB7/AAAAAAAA4AAAAP/gAAAAAAAAeAAAAP8AAAD//wAAAB4AAAAAAAAAAA==';
    };

    return {
        start() {
            document.body.style.cursor = 'progress';
            if (/firefox/i.test(navigator.userAgent.toLowerCase())) {
                gifFavicon();
            } else {
                updateFavicon();
            }
        },
        stop() {
            clearTimeout(timer);
            document.body.style.cursor = 'default';
            favicon.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKOBYiGjgWKVo4Fi1aOBYt2jgWJxAAAAAKOBYimjgWLUo4Fi76OBYu6jgWLYAAAAAAAAAAAAAAAAAAAAAKOBYlqjgWL3o4Fi/6OBYv+jgWL/o4FiwKOBYhijgWLeo4Fi/6OBYv+jgWL/o4FizAAAAAAAAAAAAAAAAKOBYkujgWL8o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL6o4Fi/6OBYv+jgWL/o4Fi/qOBYlIAAAAAAAAAAKOBYh6jgWLuo4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYocAAAAAAAAAAAAAAACjgWK5o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWL/o4Fi/6OBYv+jgWIMAAAAAAAAAACjgWJco4Fi/6OBYv+jgWL/o4Fiq6OBYv+jgWL/o4Fi/6OBYv+jgWKyo4Fi/6OBYv+jgWL/o4FiVwAAAACjgWINo4Fi6KOBYv+jgWL/o4FivwAAAACjgWL1o4Fi/6OBYv+jgWL7o4FiB6OBYumjgWL/o4Fi/6OBYuOjgWIJo4FigqOBYv+jgWL/o4Fi/6OBYjqjgWICo4Fi9aOBYv+jgWL/o4Fi+AAAAACjgWKTo4Fi/6OBYv+jgWL/o4FicKOBYvWjgWL/o4Fi/6OBYtwAAAAAo4FiQaOBYv+jgWL/o4Fi/6OBYv4AAAAAo4FiMaOBYv+jgWL/o4Fi/6OBYt6jgWLeo4Fi/6OBYv+jgWKFAAAAAKOBYsijgWL/o4Fi/6OBYu+jgWK9AAAAAAAAAACjgWK6o4Fi/6OBYv+jgWLVAAAAAAAAAACjgWIFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAo4FiAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDAAAALYAAAAAAADDAgAAAAIAAB7/AAAAAAAA4AAAAP/gAAAAAAAAeAAAAP8AAAD//wAAAB4AAAAAAAAAAA==';       }
    };
}

window.favloader = createLoader();

$(document).ready(function () {
    let vkdropdownJustClosed = false;
    $(document).on('mousedown', 'select', function (e) {
        e.preventDefault();
    });
    $(document).on('click', 'select', function (e) {
        if (vkdropdownJustClosed) {
            e.preventDefault();
            return;
        }
        if ($('.vkdropdown').length > 0) {
            $('.vkdropdown').remove();
            vkdropdownJustClosed = true;
            setTimeout(() => { vkdropdownJustClosed = false; }, 100);
            e.preventDefault();
            return;
        }
        e.preventDefault();
        showCustomMenu($(this));
    });

    function showCustomMenu($select) {
        $('.vkdropdown').remove();
        const rect = $select[0].getBoundingClientRect();
        const $menu = $('<div class="vkdropdown">')
            .css({
                position: 'absolute',
                left: (rect.left + scrollX - 1) + 'px',
                top: (rect.bottom + scrollY - 2) + 'px',
                width: rect.width + 'px',
                'z-index': 9999,
                'max-height': '200px',
                'overflow-y': 'auto'
            })
            .appendTo('body');

        $select.find('option').each(function () {
            const $option = $(this);
            $('<div class="vkdropopt">')
                .text($option.text())
                .toggleClass('selected', $option.prop('selected'))
                .appendTo($menu);
        });

        $menu.on('click', '.vkdropopt', function () {
            const index = $(this).index();
            $select.find('option').eq(index).prop('selected', true)
            /* jquery для лохов */
            $select[0].dispatchEvent(new Event('change', { bubbles: true }));
            $menu.remove();
        });

        setTimeout(() => {
            $(document).one('click', function (e) {
                if (!$(e.target).closest('.vkdropdown').length && e.target !== $select[0]) {
                    $menu.remove();
                }
            });
        }, 0);
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    // Override track slider behavior for music popup
    u(document).off("mousemove click mouseup", ".tippy-content .bigPlayer .trackPanel .selectableTrack, .tippy-content .audioEntry .subTracks .lengthTrackWrapper .selectableTrack");
    u(document).on("mousemove click mouseup", ".tippy-content .bigPlayer .trackPanel .selectableTrack, .tippy-content .audioEntry .subTracks .lengthTrackWrapper .selectableTrack", (e) => {
        // Prevent the original handler from running
        e.stopImmediatePropagation();
        
        if(window.player.isAtAudiosPage() && window.player.current_track_id == 0)
            return

        if(u('.ui-draggable-dragging').length > 0) {
            return
        }

        function __defaultAction(i_time) {
            window.player.listen_coef -= 0.5
            window.player.audioPlayer.currentTime = i_time
        }

        const taggart = u(e.target).closest('.selectableTrack')
        const parent  = taggart.parent()
        const rect = taggart.nodes[0].getBoundingClientRect()
        const width = e.clientX - rect.left
        const time = Math.ceil((width * window.player.currentTrack.length) / (rect.right - rect.left))
        
        if(e.type == "mousemove") {
            let buttonsPresseed = _bsdnUnwrapBitMask(e.buttons)
            if(buttonsPresseed[0])
                __defaultAction(time)
        }

        if(e.type == 'click' || e.type == 'mouseup') {
            __defaultAction(time)
        }

        if(parent.find('.tip_result').length < 1) {
            parent.append(`<div class='tip_result'></div>`)
        }

        parent.find('.tip_result').html(fmtTime(time)).attr('style', `left:min(${width - 15}px, 578px)`)
    });

    u(document).on('click', `.ovk-diag-body #upload_container #uploadMusicPopup`, async (e) => {
        const current_upload_page = '/player/upload'
        let error = null
        let end_redir = ''
        u('.ovk-diag-body #lastStepButtons').addClass('lagged')
        for (const elem of u('.ovk-diag-body #lastStepContainers .upload_container_element').nodes) {
            if (!elem) {
                return
            }
            const elem_u = u(elem)
            const index = elem.dataset.index
            const file = window.__audio_upload_page.files_list[index]
            if (!file || !index) {
                return
            }

            elem_u.addClass('lagged').find('.upload_container_name').addClass('uploading')
            // Upload process
            const fd = serializeForm(elem)
            fd.append('blob', file.file)
            fd.append('ajax', 1)
            fd.append('hash', window.router.csrf)
            const result = await fetch(current_upload_page, {
                method: 'POST',
                body: fd,
            })
            const result_text = await result.json()
            if (result_text.success) {
                end_redir = result_text.redirect_link
            } else {
                await makeError(escapeHtml(result_text.flash.message))
            }
            await sleep(6000)
            elem_u.remove()
        }
        audioUploadPopup.close();
        router.route(end_redir);
    });

    window.player.__highlightActiveTrack = function () {
        if (!window.player.isAtCurrentContextPage()) {
            if (u(`.tippy-content .audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}']`).length > 0) {
                u(`.tippy-content .audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying')
            }
        } else {
            u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying')
        }
    }

    $(document).on('mouseenter', '.menu_toggler_vkify', function (e) {
        const post_buttons = $(e.target).closest('.post-buttons')
        const wall_attachment_menu = post_buttons.find('#wallAttachmentMenu')
        if (wall_attachment_menu.is('.hidden')) {
            wall_attachment_menu.css({ opacity: 0 });
            wall_attachment_menu.toggleClass('hidden').fadeTo(250, 1);
            wall_attachment_menu.addClass('small');
        }
    });
    $(document).on('mouseenter', '.menu_toggler', function (e) {
        const post_buttons = $(e.target).closest('.post-buttons')
        const wall_attachment_menu = post_buttons.find('#wallAttachmentMenu')
        if (wall_attachment_menu.is('.hidden')) {
            wall_attachment_menu.css({ opacity: 0 });
            wall_attachment_menu.toggleClass('hidden').fadeTo(250, 1);
            wall_attachment_menu.addClass('small');
        }
    });

    window.vkifyGraffiti = function (e) {
        if (localStorage.getItem('vkify.graffitiType') == "1") {
            window.initVKGraffiti(e);
        } else {
            initGraffiti(e)
        }
    }

    player.__setFavicon = function (state = 'playing') {
        if (state == 'playing') {
            document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["playiconnew"])
        } else {
            document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["pauseiconnew"])
        }
    }

    const originalInitEvents = window.player.initEvents;
    window.player.initEvents = function () {
        originalInitEvents.call(this);
        if (this.audioPlayer) {
            this.audioPlayer.ontimeupdate = () => {
                const current_track = this.currentTrack;
                if (!current_track) {
                    return;
                }
                /* я не умею считать так что пусть будет пиксель пёрфект) */
                const time = this.audioPlayer.currentTime;
                const ps = ((time * 104) / current_track.length).toFixed(3);
                this.uiPlayer.find(".time").html(fmtTime(time));
                this.__updateTime(time);

                if (ps <= 104) {
                    this.uiPlayer.find(".track .selectableTrack .slider").attr('style', `padding-left:${ps}%`);

                    if (this.linkedInlinePlayer) {
                        this.linkedInlinePlayer.find(".subTracks .lengthTrackWrapper .slider").attr('style', `padding-left:${ps}%`);
                        this.linkedInlinePlayer.find('.mini_timer .nobold').html(fmtTime(time));
                    }

                    if (this.ajaxPlayer) {
                        this.ajaxPlayer.find('#aj_player_track_length .slider').attr('style', `padding-left:${ps}%`);
                        this.ajaxPlayer.find('#aj_player_track_name #aj_time').html(fmtTime(time));
                    }
                }
            };

            this.audioPlayer.onvolumechange = () => {
                const volume = this.audioPlayer.volume;
                const ps = Math.ceil((volume * 132) / 1);

                if (ps <= 132) {
                    this.uiPlayer.find(".volumePanel .selectableTrack .slider").attr('style', `padding-left:${ps}%`);

                    if (this.linkedInlinePlayer) {
                        this.linkedInlinePlayer.find(".subTracks .volumeTrackWrapper .slider").attr('style', `padding-left:${ps}%`);
                    }

                    if (this.ajaxPlayer) {
                        this.ajaxPlayer.find('#aj_player_volume .slider').attr('style', `padding-left:${ps}%`);
                    }
                }

                localStorage.setItem('audio.volume', volume);
            };
        }
    };
    window.player.initEvents();
    const friendsd = await window.OVKAPI.call("friends.get", { "user_id": window.openvk.current_id, "fields": "first_name,last_name,photo_50", "count": 100 })
    const friendsmap = friendsd.items
        .slice(0, friendsd.count)
        .map(item => ({
            id: item.id,
            photo_50: item.photo_50,
            first_name: item.first_name,
            last_name: item.last_name
        }));
    let friendshtml = ''
    friendsmap.forEach((user, index) => {
        friendshtml += `
    <a onclick="tippy.hideAll();" href="/audios${user.id}">
        <div class="elem">
            <img src="${user.photo_50}">
            <div class="additionalInfo">
                <span class="name noOverflow">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</span>
            </div>
        </div>
    </a>
  `;
    });

    const mushtml = `
<div class="bigPlayer ctx_place" style="margin: 0;">
    <div class="bigPlayerWrapper">
        <div class="row" style="justify-content: space-between;    width: 100%;">
            <div class="volumePanel">
                <div class="deviceButton musicIcon" data-tip='simple-black' data-title="{_mute_tip} [M]" style="    min-width: 15px;    background-image: url(/themepack/myify/1.0.0.0/resource/bigvol.svg);    min-height: 15px;    transform: translateY(20%);"></div>
                <div class="volumePanelTrack">
                    <div class="selectableTrack">
                        <div id='bigPlayerVolumeSliderWrapper'>&nbsp;
                            <div class="slider"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="shareButton musicIcon" data-tip='simple-black' data-title="{_share}" style="content: url(/themepack/myify/1.0.0.0/resource/bigshare.svg); width: 15px; background: none;    transform: translateY(10px);"></div>
        </div>
        <div class="column">
            <div class="trackPanel">
            <div class="trackInfo">
                <div class="trackName">
                    <img src="/themepack/myify/1.0.0.0/resource/emptycover.svg" style="height: 100px;">
                    <span class="trackPerformers">
                        <a>{_track_unknown}</a>
                    </span>
                    <span>{_track_noname}</span>
                </div>
            </div>
        </div>
                <div class="timer">
                    <span class="time">00:00</span>
                </div>
                <div class="track">
                    <div class="selectableTrack">
                        <div id='bigPlayerLengthSliderWrapper'>&nbsp;
                            <div class="slider"></div>
                        </div>
                        <div class='selectableTrackLoadProgress'>
                            <div class="load_bar"></div>
                        </div>
                    </div>
                </div>
                <div class="timer">
                    <span class="elapsedTime">-00:00</span>
                </div>
        <div class="playButtons">
            <div class="arrowsButtons">
                <div class="nextButton musicIcon" data-tip='simple-black' data-title=""></div>
            </div>
            <div class="playButton musicIcon" data-tip='simple-black' data-title="{_play_tip} [Space]"></div>
            <div class="arrowsButtons">
                <div class="backButton musicIcon" data-tip='simple-black' data-title=""></div>
            </div>
        </div>
            </div>
        <div class="additionalButtons row">
            <div class="shuffleButton musicIcon" data-tip='simple-black' data-title="{_shuffle_tip}"></div>
            <div class="repeatButton musicIcon" data-tip='simple-black' data-title="{_repeat_tip} [R]" ></div>
        </div>
        </div>
    </div>
</div>
`
    tippy(document.querySelector('#headerMusicLinkDiv'), {
        content: mushtml,
        allowHTML: true,
        trigger: 'click', 
        interactive: true,
        placement: 'bottom',
        theme: 'musicpopup',
        maxWidth: 795,
        arrow: false,
        getReferenceClientRect: () => {
            const searchBox = document.querySelector('.home_search');
            if (!searchBox) {
                // Fallback to original behavior if search box not found
                const headerMusicBtn = document.querySelector('#headerMusicBtn');
                const rect = headerMusicBtn.getBoundingClientRect();
                return {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    bottom: rect.bottom,
                    left: rect.left,
                    right: rect.right,
                };
            }

            const rect = searchBox.getBoundingClientRect();
            return {
                width: 795,
                height: rect.height,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.left + 795,
            };
        },
        appendTo: document.body,
        popperOptions: {
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [0, 0],
                }
            }]
        },
        onHidden(instance) {
            window.musHtml = undefined;
            document.querySelector('.top_audio_player').classList.remove('audio_top_btn_active');
        },
        onShow(instance) {
            const clickedElement = instance.reference;
            document.querySelector('.top_audio_player').classList.add('audio_top_btn_active');
        },
        async onMount(instance) {
            window.musHtml = instance.popper;
            const placeholder = instance.popper.querySelector('.vkifytracksplaceholder') || instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
            let playingNowLnk
            if (placeholder) {
                const parsedAudio = parseAudio();
                const trackList = `${parsedAudio.scrollContainer}`;
                placeholder.outerHTML = trackList;
                playingNowLnk = parsedAudio.nowPlayingUrl.replace(/^\//, '');
                if (instance.popper.querySelector('.loadMore')) {
                    instance.popper.querySelector('.musfooter .playingNow').innerHTML = `<img src="data:image/gif;base64,R0lGODlhIAAIAKECAEVojoSctMHN2QAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAIAAIAAACFZyPqcvtD6KMr445LcRUN9554kiSBQAh+QQFCgADACwCAAIAEgAEAAACD4xvM8DNiJRz8Mj5ari4AAAh+QQFCgADACwCAAIAHAAEAAACGJRvM8HNCqKMCCnn4JT1XPwMG9cJH6iNBQAh+QQFCgADACwMAAIAEgAEAAACD5RvM8HNiJRz8Mj5qri4AAAh+QQFCgADACwWAAIACAAEAAACBZSPqYsFACH5BAUUAAMALAAAAAAgAAgAAAIOnI+py+0Po5y02ouzPgUAOw==">`;
                    instance.popper.querySelector('.loadMore').onclick = async function () { await loadMoreAudio(); };
                }
            }
            u(`.audiosContainer .audioEmbed .audioEntry, .audios_padding .audioEmbed`).removeClass('nowPlaying');
            u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying')
            window.player.__updateFace();
            window.player.audioPlayer.onvolumechange();
            const acont = instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
            const aplaying = acont?.querySelector('.audioEntry.nowPlaying');
            if (acont && aplaying) {
                const aplayingRect = aplaying.getBoundingClientRect();
                const acontRect = acont.getBoundingClientRect();
                acont.scrollTo({
                    top: aplayingRect.top - acontRect.top + acont.scrollTop - (acont.clientHeight / 2) + (aplayingRect.height / 2),
                    behavior: 'smooth'
                });
            }
            if (/^(playlist\d+_\d+|audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
                if (/^(audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
                    try {
                        let plName = (await window.OVKAPI.call("users.get", { "user_ids": Number(playingNowLnk.match(/[^\d]*(\d+)/)[1]), "fields": "first_name" }))[0].first_name;
                        instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('audios')} <b>${escapeHtml(plName)}</b></a>`
                    } catch (error) {
                        console.error('failed to load playing now', error)
                        instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
                    }
                } if (/^(playlist\d+_\d+)(\?.*)?$/.test(playingNowLnk)) {
                    try {
                        let plName = (await window.OVKAPI.call("audio.getAlbums", { "owner_id": Number(playingNowLnk.match(/(\d+)_(\d+)/)[1]) })).items.find(item => item.id === Number(playingNowLnk.match(/(\d+)_(\d+)/)[2])).title;
                        instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('playlist')} <b>${escapeHtml(plName)}</b></a>`
                    } catch (error) {
                        console.error('failed to load playing now', error)
                        instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
                    }
                }
            } else {
                instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
            }
        }
    });

    // Move top player functionality outside of tippy
    const topPlayer = document.querySelector('#top_audio_player');
    const headerMusicBtn = document.querySelector('#headerMusicBtn');
    const topPlayerTitle = topPlayer.querySelector('.top_audio_player_title');
    const topPlayerPlay = topPlayer.querySelector('.top_audio_player_play');
    const topPlayerPrev = topPlayer.querySelector('.top_audio_player_prev');
    const topPlayerNext = topPlayer.querySelector('.top_audio_player_next');

    let currentTrackId = null;
    
    function updateTopPlayer() {
        if (window.player && window.player.currentTrack) {
            topPlayer.classList.add('top_audio_player_enabled');
            headerMusicBtn.style.display = 'none';
            
            // Only fade if the track has changed
            if (currentTrackId !== window.player.currentTrack.id) {
                currentTrackId = window.player.currentTrack.id;
                topPlayerTitle.style.opacity = '0';
                setTimeout(() => {
                    topPlayerTitle.textContent = `${window.player.currentTrack.performer} — ${window.player.currentTrack.name}`;
                    topPlayerTitle.style.opacity = '1';
                }, 60);
            }
            
            topPlayer.classList.toggle('top_audio_player_playing', !window.player.audioPlayer.paused);
        } else {
            topPlayer.classList.remove('top_audio_player_enabled');
            topPlayerTitle.textContent = '';
            headerMusicBtn.removeAttribute('style');
            currentTrackId = null;
        }
    }

    // Update top player when track changes
    const originalUpdateFace = window.player.__updateFace;
    window.player.__updateFace = function() {
        originalUpdateFace.call(this);
        updateTopPlayer();
    };

    // Add button click handlers
    topPlayerPlay.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tippy from opening
        if (window.player.audioPlayer.paused) {
            window.player.play();
        } else {
            window.player.pause();
        }
        updateTopPlayer();
    });

    topPlayerPrev.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tippy from opening
        if (window.player.currentTrack) {
            window.player.playPreviousTrack();
        }
    });

    topPlayerNext.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tippy from opening
        if (window.player.currentTrack) {
            window.player.playNextTrack();
        }
    });

    // Update on play/pause
    if (window.player && window.player.audioPlayer) {
        window.player.audioPlayer.addEventListener('play', updateTopPlayer);
        window.player.audioPlayer.addEventListener('pause', updateTopPlayer);
        
        // Initial update
        updateTopPlayer();
    }

    $(document).on("click", "#ajclosebtn", function (event) {
        window.player.ajClose();
    });

    $(document).on("click", ".statusButton.musicIcon", function (event) {
        event.preventDefault();
        $(this).toggleClass("pressed");
        const formData = new FormData();
        formData.append("status", document.forms['status_popup_form'].status.value);
        formData.append("broadcast", $(this).hasClass("pressed") ? 1 : 0);
        formData.append("hash", document.forms['status_popup_form'].hash.value);

        // Отправляем AJAX-запрос
        $.ajax({
            url: "/edit?act=status",
            method: "POST",
            processData: false,
            contentType: false,
            data: formData,
        });
    });

    CMessageBox.prototype.__getTemplate = function () {
        return u(
            `<div class="ovk-diag-cont ovk-msg-all" data-id="${this.id}">
      <div class="ovk-diag">
         <div class="ovk-diag-head">${this.title}<div class="ovk-diag-head-close" onclick="CMessageBox?.prototype.__close2()"></div></div>
         <div class="ovk-diag-body">${this.body}</div>
         <div class="ovk-diag-action"></div>
      </div>
 </div>`)
    };

    CMessageBox.prototype.__close2 = async function () {
        const msg = window.messagebox_stack[window.messagebox_stack.length - 1]
        if (!msg) {
            return
        }
        if (msg.close_on_buttons) {
            msg.close()
            return
        }
        if (msg.warn_on_exit) {
            const res = await msg.__showCloseConfirmationDialog()
            if (res === true) {
                msg.close()
            }
        }
    }
    u(document).on('mouseover mousemove mouseout', `div[data-tip='simple-black']`, (e) => {
        if (e.target.dataset.allow_mousemove != '1' && e.type == 'mousemove') {
            return
        }

        if (e.type === 'mouseout') {
            $('.tip_result_black_el').removeClass('shown');
            setTimeout(() => { u('.tip_result_black_el').remove(); }, 50)
            return;
        }

        const target = u(e.target);
        const title = target.attr('data-title')
        if (title == '') {
            return
        }
        const offset = target.nodes[0].getBoundingClientRect()
        u('body').nodes[0].insertAdjacentHTML('afterbegin', `
	<div class='tip_result_black_el' style='left:${offset.left - (offset.width / 2) + window.scrollX}px;top:${offset.top - 25 + window.scrollY}px;'>
        <div class='tip_result_black'>
            ${escapeHtml(title)}
        </div>
	</div>
    `)
        setTimeout(() => { $('.tip_result_black_el').addClass('shown'); }, 0)
    })

    window.router.route = async function (params = {}) {
        if (typeof params == 'string') {
            params = {
                url: params
            }
        }

        const old_url = location.href
        let url = params.url
        if (url.indexOf(location.origin)) {
            url = location.origin + url
        }

        if ((localStorage.getItem('ux.disable_ajax_routing') ?? 0) == 1 || window.openvk.current_id == 0) {
            window.location.assign(url)
            return
        }

        window.favloader.start();

        if (this.prev_page_html && this.prev_page_html.pathname != location.pathname) {
            this.prev_page_html = null
        }

        const push_url = params.push_state ?? true
        const next_page_url = new URL(url)
        if (push_url) {
            history.pushState({ 'from_router': 1 }, '', url)
        } else {
            history.replaceState({ 'from_router': 1 }, '', url)
        }

        const parser = new DOMParser
        const next_page_request = await fetch(next_page_url, {
            method: 'AJAX',
            referrer: old_url,
            headers: {
                'X-OpenVK-Ajax-Query': '1',
            }
        })
        const next_page_text = await next_page_request.text()
        const parsed_content = parser.parseFromString(next_page_text, 'text/html')
        if (next_page_request.redirected) {
            history.replaceState({ 'from_router': 1 }, '', next_page_request.url)
        }

        // CSS loading and vkifyloc processing now handled by router_patch.js

        this.__closeMsgs()
        this.__unlinkObservers()

        try {
            this.__appendPage(parsed_content)
            await this.__integratePage()
            // vkifyloc processing now happens in router_patch.js
        } catch (e) {
            console.error(e)
            next_page_url.searchParams.delete('al', 1)
            location.assign(next_page_url)
        }
        window.favloader.stop();
    }

});

const searchbox = document.querySelector('#search_box form input[type="search"]');
var searchTimeout;
searchbox.onfocus = function () {
    if (!(searchbox.value.length < 3)) { document.querySelector('#searchBoxFastTips').style.display = "block"; }
    else { document.querySelector('#searchBoxFastTips').style.display = "none"; }
}
searchbox.onblur = function () {
    if (searchbox.value == "") { if (friendson > 0) { document.querySelector('.friendslink').style.display = "unset"; } }
    else { document.querySelector('.friendslink').style.display = "none"; }
}
searchbox.oninput = async function () {
    if (!(searchbox.value.length < 3)) {
        document.querySelector('#searchBoxFastTips').style.display = "block";
        document.querySelector('.friendslink').style.display = "none";
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const srq = document.querySelector('#search_box form input[type="search"]').value;
            document.querySelector('#searchBoxFastTips').innerHTML = `<div class="fastpreload"></div>`;
            try {
                const groupsd = await window.OVKAPI.call("groups.search", { "q": srq })
                const usersd = await window.OVKAPI.call("users.search", { "q": srq, "fields": "photo_50" })
                const audiosd = await window.OVKAPI.call("audio.search", { "q": srq })
                const docsd = await window.OVKAPI.call("docs.search", { "q": srq })
                if (usersd.count > 5) {
                    var minusers = usersd.items
                        .slice(0, 5)
                        .map(item => ({
                            id: item.id,
                            photo_50: item.photo_50,
                            first_name: item.first_name
                        }));
                } else {
                    var minusers = usersd.items
                        .slice(0, usersd.count)
                        .map(item => ({
                            id: item.id,
                            photo_50: item.photo_50,
                            first_name: item.first_name
                        }));
                }
                let fastusers = ""
                minusers.forEach((user, index) => {
                    fastusers += `
                    <a class="fastavatarlnk" href="/id${user.id}">
                        <img class="fastavatar" src="${user.photo_50}">
                        <span>${escapeHtml(user.first_name)}</span>
                    </a>
                    `;
                });
                document.querySelector('#searchBoxFastTips').innerHTML = `
                                <div>
                                    <div class="useravas">
                                        ${fastusers}
                                    </div>
                                    <a href="/search?section=users&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('users')} <b>${escapeHtml(srq)}</b> (${usersd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=groups&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('groups')} <b>${escapeHtml(srq)}</b> (${groupsd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=audios&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('audios')} <b>${escapeHtml(srq)}</b> (${audiosd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=docs&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('documents')} <b>${escapeHtml(srq)}</b> (${docsd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                            `} catch (error) {
                console.error('failed to load search tip results, using simple template:', error)
                document.querySelector('#searchBoxFastTips').innerHTML = `
                                <div>
                                    <a href="/search?section=users&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('users')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=groups&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('groups')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=audios&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('audios')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=docs&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('documents')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                            `}
        }, 1500);
    }
    else {
        document.querySelector('#searchBoxFastTips').style.display = "none";
        if (friendson > 0) { document.querySelector('.friendslink').style.display = "unset"; }
    }
}
/* я украл эту хрень из исходников, хз как оно работает лол */
u(`#search_box form input[type="search"]` || `#search_box #searchBoxFastTips a`).on('blur', (e) => {
    {
        setTimeout(() => {
            const focusedElement = document.activeElement;

            if (!u(focusedElement).is('#search_box form input[type="search"]')) {
                $('#searchBoxFastTips').css("display", "none")
            }
        }, 250);
    } /* ладно я понял как оно работает и поэтому я в целом убрал время ОЖИДания */
})
u(`#search_box form input[type="search"]`).off('focus');


async function changeStatus() {
    const status = document.status_popup_form.status.value;
    const broadcast = document.status_popup_form.broadcast.checked;

    document.status_popup_form.submit.innerHTML = "<div class=\"button-loading\"></div>";
    document.status_popup_form.submit.disabled = true;

    const formData = new FormData();
    formData.append("status", status);
    formData.append("broadcast", Number(broadcast));
    formData.append("hash", document.status_popup_form.hash.value);
    const response = await ky.post("/edit?act=status", { body: formData });

    if (!parseAjaxResponse(await response.text())) {
        document.status_popup_form.submit.innerHTML = tr("send");
        document.status_popup_form.submit.disabled = false;
        return;
    }

    if (document.status_popup_form.status.value === "") {
        document.querySelector("#page_status_text").innerHTML = `${tr("change_status")}`;
        document.querySelector("#page_status_text").className = "edit_link page_status_edit_button";
    } else {
        document.querySelector("#page_status_text").innerHTML = escapeHtml(status);
        document.querySelector("#page_status_text").className = "page_status page_status_edit_button";
    }

    setStatusEditorShown(false);
    document.status_popup_form.submit.innerHTML = tr("send");
    document.status_popup_form.submit.disabled = false;
}

function switchProfileInfo() {
    const infoblock = document.querySelector('.profileinfoblock')
    const infobtn = document.querySelector('#showFullInfoButton')
    if (infoblock && infobtn) {
        if (infoblock.style.display === "none") {
            infoblock.style.display = "block"
            infobtn.text = tr('close_comments')
        } else {
            infoblock.style.display = "none"
            infobtn.text = tr('show_comments')
        }
    }
}

const today = new Date();
if (today.getDate() === 1 && today.getMonth() === 3) {
    const doge = document.createElement('script');
    doge.setAttribute('src', '/themepack/myify/2.0.0.0/resource/doge.js');
    document.head.appendChild(doge);
    u(document).on('click', '.post-like-button', function () {
        if (u(this).find('#liked').length) { Doge.show(); }
    });
}

u(document).on("mousemove click mouseup", ".bigPlayer .trackPanel .selectableTrack, .audioEntry .subTracks .lengthTrackWrapper .selectableTrack, #aj_player_track_length .selectableTrack", (e) => {
    if(window.player.isAtAudiosPage() && window.player.current_track_id == 0)
        return

    if(u('.ui-draggable-dragging').length > 0) {
        return
    }

    function __defaultAction(i_time) {
        window.player.listen_coef -= 0.5
        window.player.audioPlayer.currentTime = i_time
    }

    const taggart = u(e.target).closest('.selectableTrack')
    const parent  = taggart.parent()
    const rect = taggart.nodes[0].getBoundingClientRect()
    const width = e.clientX - rect.left
    const time = Math.ceil((width * window.player.currentTrack.length) / (rect.right - rect.left))
    if(e.type == "mousemove") {
        let buttonsPresseed = _bsdnUnwrapBitMask(e.buttons)
        if(buttonsPresseed[0])
            __defaultAction(time)
    }

    if(e.type == 'click' || e.type == 'mouseup') {
        __defaultAction(time)
    }

    if(parent.find('.tip_result').length < 1) {
        parent.append(`<div class='tip_result'></div>`)
    }

    const maxLeft = taggart.closest('.tippy-content') ? 578 : 315.5;
    parent.find('.tip_result').html(fmtTime(time)).attr('style', `left:min(${width - 15}px, ${maxLeft}px)`)
})